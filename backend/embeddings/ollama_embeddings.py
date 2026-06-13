"""Ollama-based local embeddings."""
import logging
import httpx
from config import OLLAMA_BASE_URL, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

ZERO_VECTOR_768 = [0.0] * 768


async def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using Ollama."""
    embeddings = []
    async with httpx.AsyncClient(timeout=120.0) as client:
        for text in texts:
            try:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/embed",
                    json={"model": EMBEDDING_MODEL, "input": text},
                )
                if response.status_code == 200:
                    data = response.json()
                    embeddings.append(data["embeddings"][0])
                else:
                    logger.warning("Embedding model returned status %d for text (len=%d)", response.status_code, len(text))
                    embeddings.append(ZERO_VECTOR_768)
            except Exception as e:
                logger.warning("Embedding failed for text (len=%d): %s", len(text), e)
                embeddings.append(ZERO_VECTOR_768)
    return embeddings


async def get_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    result = await get_embeddings([text])
    return result[0]
