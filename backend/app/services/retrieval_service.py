from typing import List, Dict, Any
import re
from rank_bm25 import BM25Okapi

from app.services.chroma_service import ChromaStore
from app.services.embedding_service import embed_query
from app.core.config import settings


def _tokenize(text: str) -> List[str]:
    return [t for t in re.split(r"\\W+", text.lower()) if t]


def _normalize(scores: List[float]) -> List[float]:
    if not scores:
        return scores
    min_s = min(scores)
    max_s = max(scores)
    if max_s == min_s:
        return [0.0 for _ in scores]
    return [(s - min_s) / (max_s - min_s) for s in scores]


def retrieve(query: str, top_k: int = 4) -> List[Dict[str, Any]]:
    store = ChromaStore()
    embedding = embed_query(query)
    candidate_k = max(top_k * 4, top_k)
    results = store.query(embedding, top_k=candidate_k)

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0] if results.get("distances") else []

    if not documents:
        return []

    dense_scores = []
    for distance in distances:
        if distance is None:
            dense_scores.append(0.0)
        else:
            dense_scores.append(1.0 / (1.0 + distance))

    dense_scores = _normalize(dense_scores)
    tokenized_docs = [_tokenize(doc) for doc in documents]
    bm25 = BM25Okapi(tokenized_docs)
    bm25_scores = bm25.get_scores(_tokenize(query)).tolist()
    bm25_scores = _normalize(bm25_scores)

    alpha = settings.hybrid_weight
    combined = [
        alpha * dense_scores[i] + (1 - alpha) * bm25_scores[i]
        for i in range(len(documents))
    ]

    ranked = sorted(range(len(documents)), key=lambda i: combined[i], reverse=True)[:top_k]

    sources: List[Dict[str, Any]] = []
    for i in ranked:
        sources.append({
            "text": documents[i],
            "metadata": metadatas[i],
            "score": combined[i]
        })

    return sources
