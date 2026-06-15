"""Ollama-based local embeddings."""
import logging
import httpx
from config import OLLAMA_BASE_URL, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

ZERO_VECTOR_768 = [0.0] * 768


async def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using Ollama."""
    if not texts:
        return []

    batch_size = 100
    all_embeddings = []
    async with httpx.AsyncClient(timeout=300.0) as client:
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            try:
                response = await client.post(
                    f"{OLLAMA_BASE_URL}/api/embed",
                    json={"model": EMBEDDING_MODEL, "input": batch},
                )
                if response.status_code == 200:
                    data = response.json()
                    all_embeddings.extend(data["embeddings"])
                else:
                    logger.warning("Embedding returned status %d for batch (size=%d)", response.status_code, len(batch))
                    all_embeddings.extend([ZERO_VECTOR_768] * len(batch))
            except Exception as e:
                logger.warning("Embedding failed for batch (size=%d): %s", len(batch), e)
                all_embeddings.extend([ZERO_VECTOR_768] * len(batch))

    return all_embeddings


async def get_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    result = await get_embeddings([text])
    return result[0]
