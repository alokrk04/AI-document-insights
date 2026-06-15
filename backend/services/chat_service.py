"""Chat service using RAG and Ollama."""
import json
import logging
import httpx
from config import OLLAMA_BASE_URL, CHAT_MODEL
from models.schemas import DocumentStatus
from rag.retriever import hybrid_retrieve
from services.document_service import get_document

logger = logging.getLogger(__name__)

# In-memory conversation store
conversation_store: dict[str, list[dict]] = {}


async def chat(document_id: str, question: str, conversation_id: str = None) -> dict:
    """Generate an answer using RAG."""
    doc = get_document(document_id)
    if not doc:
        return {"answer": "Document not found.", "sources": [], "conversation_id": conversation_id or "unknown"}

    if not conversation_id:
        import uuid
        conversation_id = str(uuid.uuid4())

    # Retrieve relevant chunks
    relevant_chunks = await hybrid_retrieve(document_id, question, n_results=5)
    using_fallback = False

    if not relevant_chunks:
        full_text = doc.get("full_text", "")
        if full_text:
            logger.info("ChromaDB returned no results for doc %s, falling back to full text", document_id)
            truncated = full_text[:6000]
            if len(full_text) > 6000:
                truncated += "\n\n[... document truncated ...]"
            relevant_chunks = [{
                "content": truncated,
                "metadata": {"filename": doc.get("filename", ""), "page_number": None, "section": ""},
                "score": 1.0,
            }]
            using_fallback = True
        else:
            logger.warning("No chunks and no full_text available for doc %s", document_id)
            return {
                "answer": "The uploaded documents do not contain enough information to answer this question.",
                "sources": [],
                "conversation_id": conversation_id,
            }

    # Build context
    context_parts = []
    sources = []
    for i, chunk in enumerate(relevant_chunks, 1):
        context_parts.append(f"[Source {i}] {chunk['content']}")
        meta = chunk.get("metadata", {})
        sources.append({
            "content": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
            "page_number": meta.get("page_number"),
            "section": meta.get("section", ""),
            "filename": meta.get("filename", ""),
            "score": round(chunk.get("score", 0), 3),
        })

    context = "\n\n".join(context_parts)

    # Build conversation history
    history = conversation_store.get(conversation_id, [])
    history_messages = []
    for msg in history[-6:]:  # Keep last 6 messages for context
        history_messages.append({"role": msg["role"], "content": msg["content"]})

    source_note = ""
    if using_fallback:
        source_note = "\n\nNote: The above context is the full document text (not specific retrieved passages). Answer to the best of your ability based on this content."

    system_prompt = f"""You are an AI assistant analyzing a document. Answer questions based ONLY on the provided context.
If the information is not in the context, say: "The uploaded documents do not contain enough information to answer this question."
Always cite your sources using the format: Source: [filename] Page [number]

Document context:
{context}{source_note}"""

    messages = [{"role": "system", "content": system_prompt}] + history_messages + [{"role": "user", "content": question}]

    # Call Ollama
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": CHAT_MODEL,
                    "messages": messages,
                    "stream": False,
                },
            )
            if response.status_code == 200:
                answer = response.json().get("message", {}).get("content", "No response generated.")
            else:
                answer = f"Error generating response: Ollama returned status {response.status_code}"
    except httpx.ConnectError:
        answer = "Error: Ollama is not available. Please ensure Ollama is running."
    except Exception as e:
        answer = f"Error generating response: {str(e)}"

    # Update conversation history
    if conversation_id not in conversation_store:
        conversation_store[conversation_id] = []
    conversation_store[conversation_id].append({"role": "user", "content": question})
    conversation_store[conversation_id].append({"role": "assistant", "content": answer})

    return {
        "answer": answer,
        "sources": sources,
        "conversation_id": conversation_id,
    }


async def chat_stream(document_id: str, question: str, conversation_id: str = None):
    """Streaming chat using Ollama."""
    doc = get_document(document_id)
    if not doc:
        yield "data: " + json.dumps({"error": "Document not found"}) + "\n\n"
        return

    if not conversation_id:
        import uuid
        conversation_id = str(uuid.uuid4())

    # Retrieve relevant chunks
    relevant_chunks = await hybrid_retrieve(document_id, question, n_results=5)
    using_fallback = False

    if not relevant_chunks:
        full_text = doc.get("full_text", "")
        if full_text:
            logger.info("ChromaDB returned no results for doc %s (stream), falling back to full text", document_id)
            truncated = full_text[:6000]
            if len(full_text) > 6000:
                truncated += "\n\n[... document truncated ...]"
            relevant_chunks = [{
                "content": truncated,
                "metadata": {"filename": doc.get("filename", ""), "page_number": None, "section": ""},
                "score": 1.0,
            }]
            using_fallback = True
        else:
            logger.warning("No chunks and no full_text available for doc %s (stream)", document_id)
            yield "data: " + json.dumps({"chunk": "The uploaded documents do not contain enough information to answer this question.", "done": True}) + "\n\n"
            return

    # Build context
    context_parts = []
    sources = []
    for i, chunk in enumerate(relevant_chunks, 1):
        context_parts.append(f"[Source {i}] {chunk['content']}")
        meta = chunk.get("metadata", {})
        sources.append({
            "content": chunk["content"][:200] + "..." if len(chunk["content"]) > 200 else chunk["content"],
            "page_number": meta.get("page_number"),
            "section": meta.get("section", ""),
            "filename": meta.get("filename", ""),
            "score": round(chunk.get("score", 0), 3),
        })

    context = "\n\n".join(context_parts)

    source_note = ""
    if using_fallback:
        source_note = "\n\nNote: The above context is the full document text (not specific retrieved passages). Answer to the best of your ability based on this content."

    system_prompt = f"""You are an AI assistant analyzing a document. Answer questions based ONLY on the provided context.
If the information is not in the context, say: "The uploaded documents do not contain enough information to answer this question."
Always cite your sources.

Document context:
{context}{source_note}"""

    messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": question}]

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": CHAT_MODEL,
                    "messages": messages,
                    "stream": True,
                },
            ) as response:
                full_answer = ""
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            full_answer += token
                            yield f"data: {json.dumps({'chunk': token, 'done': False, 'sources': sources})}\n\n"
                            if data.get("done"):
                                # Update conversation history
                                if conversation_id not in conversation_store:
                                    conversation_store[conversation_id] = []
                                conversation_store[conversation_id].append({"role": "user", "content": question})
                                conversation_store[conversation_id].append({"role": "assistant", "content": full_answer})
                                yield f"data: {json.dumps({'chunk': '', 'done': True, 'conversation_id': conversation_id, 'sources': sources})}\n\n"
                        except json.JSONDecodeError:
                            pass
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e), 'done': True})}\n\n"
