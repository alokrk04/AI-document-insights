"""Document processing service."""
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Union

from config import UPLOAD_DIR, CHAT_MODEL, EMBEDDING_MODEL, OLLAMA_BASE_URL
from models.schemas import DocumentResponse, DocumentStatus
from utils.file_utils import generate_id, sanitize_filename
from parsers import parse_document
from rag.chunker import chunk_text
from embeddings.ollama_embeddings import get_embeddings
from vectorstore.chroma_store import store_chunks, delete_collection
from vectorstore.chroma_store import get_client as get_chroma_client
import httpx
import aiofiles

logger = logging.getLogger(__name__)

DOCUMENTS_DB = Path(__file__).resolve().parent.parent / "documents_store.json"

document_store: dict[str, dict] = {}


def _load_document_store():
    """Load documents from JSON file on startup."""
    global document_store
    if DOCUMENTS_DB.exists():
        try:
            with open(DOCUMENTS_DB) as f:
                data = json.load(f)
            for doc_id, doc in data.items():
                doc["upload_time"] = datetime.fromisoformat(doc["upload_time"])
            document_store.update(data)
            logger.info("Loaded %d documents from store", len(data))
        except Exception as e:
            logger.warning("Failed to load document store: %s", e)


def _save_document_store():
    """Persist document store to JSON file."""
    try:
        data = {}
        for doc_id, doc in document_store.items():
            d = dict(doc)
            if isinstance(d.get("upload_time"), datetime):
                d["upload_time"] = d["upload_time"].isoformat()
            data[doc_id] = d
        with open(DOCUMENTS_DB, "w") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        logger.warning("Failed to save document store: %s", e)


def _sync_documents_from_chroma():
    """Discover orphaned documents in ChromaDB and create entries for them."""
    try:
        client = get_chroma_client()
        collections = client.list_collections()
        recovered = 0
        for col in collections:
            doc_id = col.name.replace("doc_", "", 1).replace("_", "-")
            if doc_id not in document_store and col.count() > 0:
                document_store[doc_id] = {
                    "id": doc_id,
                    "filename": f"recovered-{doc_id[:8]}",
                    "status": DocumentStatus.INDEXED,
                    "upload_time": datetime.utcnow(),
                    "file_size": 0,
                    "file_path": "",
                    "chunk_count": col.count(),
                    "full_text": "",
                }
                recovered += 1
        if recovered:
            _save_document_store()
            logger.info("Recovered %d orphaned documents from ChromaDB", recovered)
    except Exception as e:
        logger.warning("Failed to sync from ChromaDB: %s", e)


# Load persisted state on import
_load_document_store()
_sync_documents_from_chroma()


def get_document(doc_id: str) -> Optional[dict]:
    return document_store.get(doc_id)


def list_documents() -> list[dict]:
    return list(document_store.values())


def delete_document_data(doc_id: str):
    """Delete document file and vector data."""
    if doc_id in document_store:
        doc = document_store[doc_id]
        file_path = doc.get("file_path")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        delete_collection(doc_id)
        del document_store[doc_id]
        _save_document_store()


async def process_document(doc_id: str):
    """Full processing pipeline: parse -> chunk -> embed -> store."""
    if doc_id not in document_store:
        return

    doc = document_store[doc_id]
    file_path = doc.get("file_path")
    if not file_path or not os.path.exists(file_path):
        doc["status"] = DocumentStatus.FAILED
        return

    try:
        # Step 1: Parse
        doc["status"] = DocumentStatus.PARSING
        parsed = parse_document(Path(file_path))
        doc["page_count"] = parsed["page_count"]

        # Step 2: Chunk
        chunks = chunk_text(parsed["pages"], doc["filename"])
        if not chunks:
            doc["status"] = DocumentStatus.FAILED
            return

        # Step 3: Embed
        doc["status"] = DocumentStatus.EMBEDDING
        texts = [c["content"] for c in chunks]
        embeddings = await get_embeddings(texts)

        # Step 4: Store in vector DB
        store_chunks(doc_id, chunks, embeddings)

        doc["status"] = DocumentStatus.INDEXED
        doc["chunk_count"] = len(chunks)
        doc["full_text"] = parsed["full_text"]

        # Save processed data
        async with aiofiles.open(UPLOAD_DIR / f"{doc_id}_data.json", "w") as f:
            await f.write(json.dumps(parsed, default=str))

    except Exception as e:
        doc["status"] = DocumentStatus.FAILED
        doc["error"] = str(e)
    _save_document_store()


def create_document_entry(filename: str, file_path: str, file_size: int, doc_id: Optional[str] = None) -> dict:
    if doc_id is None:
        doc_id = generate_id()
    doc = {
        "id": doc_id,
        "filename": sanitize_filename(filename),
        "status": DocumentStatus.UPLOADED,
        "upload_time": datetime.utcnow(),
        "file_size": file_size,
        "file_path": str(file_path),
    }
    document_store[doc_id] = doc
    _save_document_store()
    return doc


def to_document_response(doc: dict) -> DocumentResponse:
    return DocumentResponse(
        id=doc["id"],
        filename=doc["filename"],
        status=doc["status"].lower() if isinstance(doc["status"], str) else doc["status"],
        upload_time=doc["upload_time"],
        file_size=doc["file_size"],
        page_count=doc.get("page_count"),
        chunk_count=doc.get("chunk_count"),
    )


async def check_ollama_status() -> dict:
    """Check if Ollama is available and models are ready."""
    status = {
        "available": False,
        "chat_model": CHAT_MODEL,
        "embedding_model": EMBEDDING_MODEL,
        "chat_model_ready": False,
        "embedding_model_ready": False,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Check Ollama is running
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                status["available"] = True
                models = [m["name"].split(":")[0] for m in resp.json().get("models", [])]
                status["chat_model_ready"] = CHAT_MODEL in models
                status["embedding_model_ready"] = EMBEDDING_MODEL in models
    except Exception:
        pass

    return status
