"""API routes for the Smart AI Document Insights application."""
import os
import json
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse

from utils.file_utils import validate_file_type, validate_file_size, save_upload_file, generate_id
from services.document_service import (
    create_document_entry,
    list_documents,
    get_document,
    delete_document_data,
    to_document_response,
    check_ollama_status,
    _save_document_store,
)
from services.chat_service import chat, chat_stream
from services.insights_service import generate_insights
from parsers import parse_document
from rag.chunker import chunk_text
from embeddings.ollama_embeddings import get_embeddings
from vectorstore.chroma_store import store_chunks
import aiofiles

router = APIRouter()


# --- Health & Status ---

@router.get("/health")
async def health():
    return {"status": "healthy", "service": "Smart AI Document Insights"}


@router.get("/ollama/status")
async def ollama_status():
    status = await check_ollama_status()
    return status


# --- Document CRUD ---

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and process a document."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    if not validate_file_type(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: .pdf, .docx, .csv, .json, .txt",
        )

    content = await file.read()
    if not validate_file_size(len(content)):
        raise HTTPException(status_code=400, detail="File size exceeds 100 MB limit")

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File appears to be empty or corrupted")

    # Save file
    doc_id = generate_id()
    file_path = await save_upload_file(file.filename, content, doc_id)

    # Create document entry
    doc = create_document_entry(file.filename, str(file_path), len(content))

    # Process inline
    try:
        doc["status"] = "parsing"
        parsed = parse_document(Path(str(file_path)))
        doc["page_count"] = parsed["page_count"]

        chunks = chunk_text(parsed["pages"], doc["filename"])
        if chunks:
            doc["status"] = "embedding"
            texts = [c["content"] for c in chunks]
            embeddings = await get_embeddings(texts)
            store_chunks(doc_id, chunks, embeddings)
            doc["status"] = "indexed"
            doc["chunk_count"] = len(chunks)
            doc["full_text"] = parsed["full_text"]
            async with aiofiles.open(Path(str(file_path)).parent / f"{doc_id}_data.json", "w") as f:
                await f.write(json.dumps(parsed, default=str))
    except Exception as e:
        doc["status"] = "failed"
        doc["error"] = str(e)

    _save_document_store()
    return to_document_response(doc)


@router.get("/documents")
async def get_documents():
    """List all uploaded documents."""
    docs = list_documents()
    return [to_document_response(d) for d in docs]


@router.get("/documents/{doc_id}")
async def get_document_by_id(doc_id: str):
    """Get a specific document's metadata."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return to_document_response(doc)


@router.delete("/documents/{doc_id}")
async def remove_document(doc_id: str):
    """Delete a document and its data."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    delete_document_data(doc_id)
    return {"message": "Document deleted successfully"}


# --- Processing ---

@router.post("/process/{doc_id}")
async def reprocess_document(doc_id: str):
    """Re-process a document."""
    from models.schemas import DocumentStatus as ds
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc["status"] = ds.UPLOADED
    try:
        doc["status"] = ds.PARSING
        parsed = parse_document(Path(doc["file_path"]))
        doc["page_count"] = parsed["page_count"]
        chunks = chunk_text(parsed["pages"], doc["filename"])
        if chunks:
            doc["status"] = ds.EMBEDDING
            texts = [c["content"] for c in chunks]
            embeddings = await get_embeddings(texts)
            store_chunks(doc_id, chunks, embeddings)
            doc["status"] = ds.INDEXED
            doc["chunk_count"] = len(chunks)
            doc["full_text"] = parsed["full_text"]
            async with aiofiles.open(Path(doc["file_path"]).parent / f"{doc_id}_data.json", "w") as f:
                await f.write(json.dumps(parsed, default=str))
    except Exception as e:
        doc["status"] = ds.FAILED
        doc["error"] = str(e)
    _save_document_store()
    return {
        "message": "Document reprocessed",
        "document_id": doc_id,
        "status": doc.get("status", ds.FAILED),
    }


# --- Insights ---

@router.post("/insights/{doc_id}")
async def get_insights(doc_id: str):
    """Generate AI insights for a document."""
    doc = get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.get("status") != "indexed":
        raise HTTPException(status_code=400, detail="Document must be fully processed before generating insights")

    insights = await generate_insights(doc_id)
    if "error" in insights:
        raise HTTPException(status_code=500, detail=insights["error"])
    return insights


# --- Chat ---

@router.post("/chat")
async def chat_endpoint(request: dict):
    """Chat with a document using RAG."""
    document_id = request.get("document_id")
    question = request.get("question")
    conversation_id = request.get("conversation_id")

    if not document_id or not question:
        raise HTTPException(status_code=400, detail="document_id and question are required")

    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if doc.get("status") != "indexed":
        raise HTTPException(status_code=400, detail="Document must be fully processed first")

    result = await chat(document_id, question, conversation_id)
    return result


@router.post("/chat/stream")
async def chat_stream_endpoint(request: dict):
    """Streaming chat with a document."""
    document_id = request.get("document_id")
    question = request.get("question")
    conversation_id = request.get("conversation_id")

    if not document_id or not question:
        raise HTTPException(status_code=400, detail="document_id and question are required")

    doc = get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return StreamingResponse(
        chat_stream(document_id, question, conversation_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
