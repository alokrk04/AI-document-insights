"""Hybrid retrieval combining semantic search and BM25."""
import math
from collections import Counter
from embeddings.ollama_embeddings import get_embedding
from vectorstore.chroma_store import query_collection


def bm25_score(query_tokens: list[str], doc_tokens: list[str], avg_doc_len: float, doc_count: int, df: Counter) -> float:
    """Compute BM25 score for a document."""
    k1, b = 1.5, 0.75
    score = 0.0
    doc_tf = Counter(doc_tokens)
    for token in query_tokens:
        if token in doc_tf:
            tf = doc_tf[token]
            idf = math.log((doc_count - df.get(token, 0) + 0.5) / (df.get(token, 0) + 0.5) + 1)
            score += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * len(doc_tokens) / avg_doc_len))
    return score


def tokenize(text: str) -> list[str]:
    """Simple tokenizer."""
    return text.lower().split()


async def hybrid_retrieve(document_id: str, query: str, n_results: int = 5) -> list[dict]:
    """Combine semantic and keyword search with score fusion."""
    # Semantic search via vector store
    query_embedding = await get_embedding(query)
    semantic_results = query_collection(document_id, query_embedding, n_results=n_results * 3)

    if not semantic_results:
        return []

    # BM25 scoring on semantic results
    query_tokens = tokenize(query)
    all_docs = [r["content"] for r in semantic_results]
    all_doc_tokens = [tokenize(d) for d in all_docs]
    avg_doc_len = sum(len(t) for t in all_doc_tokens) / len(all_doc_tokens) if all_doc_tokens else 1
    doc_count = len(all_doc_tokens)

    # Document frequency
    df = Counter()
    for tokens in all_doc_tokens:
        unique_tokens = set(tokens)
        for t in unique_tokens:
            df[t] += 1

    # Score fusion
    scored_results = []
    max_semantic = max((r["score"] for r in semantic_results), default=1.0) or 1.0
    max_bm25 = 0.0

    bm25_scores = []
    for i, doc_tokens in enumerate(all_doc_tokens):
        score = bm25_score(query_tokens, doc_tokens, avg_doc_len, doc_count, df)
        bm25_scores.append(score)
        max_bm25 = max(max_bm25, score)

    max_bm25 = max_bm25 or 1.0

    for i, result in enumerate(semantic_results):
        normalized_semantic = result["score"] / max_semantic
        normalized_bm25 = bm25_scores[i] / max_bm25
        fused_score = 0.7 * normalized_semantic + 0.3 * normalized_bm25

        scored_results.append({
            "content": result["content"],
            "metadata": result["metadata"],
            "score": fused_score,
        })

    # Sort by fused score
    scored_results.sort(key=lambda x: x["score"], reverse=True)
    return scored_results[:n_results]
