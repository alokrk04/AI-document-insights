"""Ollama-based local embeddings."""
import asyncio
import logging
import httpx
from config import OLLAMA_BASE_URL, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

ZERO_VECTOR_768 = [0.0] * 768
_BATCH_SIZE = 100
_CONCURRENCY = 5


async def _embed_batch(client: httpx.AsyncClient, texts: list[str], batch_idx: int) -> list[list[float]]:
    try:
        response = await client.post(
            f"{OLLAMA_BASE_URL}/api/embed",
            json={"model": EMBEDDING_MODEL, "input": texts},
        )
        if response.status_code == 200:
            data = response.json()
            return data["embeddings"]
        logger.warning("Embedding batch %d returned status %d (size=%d)", batch_idx, response.status_code, len(texts))
    except Exception as e:
        logger.warning("Embedding batch %d failed (size=%d): %s", batch_idx, len(texts), e)
    return [ZERO_VECTOR_768] * len(texts)


async def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generate embeddings using concurrent batched requests to Ollama."""
    if not texts:
        return []

    batches = [texts[i:i + _BATCH_SIZE] for i in range(0, len(texts), _BATCH_SIZE)]
    all_embeddings = [None] * len(batches)

    async with httpx.AsyncClient(timeout=300.0) as client:
        sem = asyncio.Semaphore(_CONCURRENCY)

        async def worker(idx: int, batch: list[str]):
            async with sem:
                result = await _embed_batch(client, batch, idx)
                all_embeddings[idx] = result

        tasks = [worker(i, b) for i, b in enumerate(batches)]
        await asyncio.gather(*tasks)

    result = []
    for emb in all_embeddings:
        result.extend(emb)
    return result


async def get_embedding(text: str) -> list[float]:
    """Generate embedding for a single text."""
    result = await get_embeddings([text])
    return result[0]
