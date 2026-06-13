"""ChromaDB vector store for document chunks."""
import chromadb
from config import CHROMA_DIR


def get_client():
    """Get or create ChromaDB client with persistent storage."""
    return chromadb.PersistentClient(path=str(CHROMA_DIR))


def get_or_create_collection(client, document_id: str):
    """Get or create a collection for a specific document."""
    collection_name = f"doc_{document_id.replace('-', '_')}"
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )


def store_chunks(document_id: str, chunks: list[dict], embeddings: list[list[float]]):
    """Store document chunks with embeddings in ChromaDB."""
    client = get_client()
    collection = get_or_create_collection(client, document_id)

    ids = [chunk["id"] for chunk in chunks]
    documents = [chunk["content"] for chunk in chunks]
    metadatas = []
    for chunk in chunks:
        meta = chunk["metadata"]
        # Filter out None values - ChromaDB only accepts str, int, float, bool
        clean_meta = {k: v for k, v in meta.items() if v is not None}
        metadatas.append(clean_meta)

    # Batch insert (max 100 at a time)
    batch_size = 100
    for i in range(0, len(ids), batch_size):
        batch_ids = ids[i:i + batch_size]
        batch_docs = documents[i:i + batch_size]
        batch_meta = metadatas[i:i + batch_size]
        batch_emb = embeddings[i:i + batch_size]

        collection.add(
            ids=batch_ids,
            documents=batch_docs,
            metadatas=batch_meta,
            embeddings=batch_emb,
        )


def query_collection(document_id: str, query_embedding: list[float], n_results: int = 5):
    """Query the vector store for similar chunks."""
    client = get_client()
    try:
        collection = get_or_create_collection(client, document_id)
    except Exception:
        return []

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    if results and results["documents"] and results["documents"][0]:
        docs_meta = results.get("metadatas", [[]])
        docs_dist = results.get("distances", [[]])
        for i, doc in enumerate(results["documents"][0]):
            meta = docs_meta[0][i] if len(docs_meta[0]) > i else {}
            distance = docs_dist[0][i] if len(docs_dist[0]) > i else 0.0
            chunks.append({
                "content": doc,
                "metadata": meta if isinstance(meta, dict) else {},
                "score": 1 - distance,
            })
    return chunks


def delete_collection(document_id: str):
    """Delete a document's collection."""
    client = get_client()
    collection_name = f"doc_{document_id.replace('-', '_')}"
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
