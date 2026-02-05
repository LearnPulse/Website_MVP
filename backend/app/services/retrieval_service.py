from typing import List, Dict, Any
from app.services.chroma_service import ChromaStore
from app.services.embedding_service import embed_query


def retrieve(query: str, top_k: int = 4) -> List[Dict[str, Any]]:
    store = ChromaStore()
    embedding = embed_query(query)
    results = store.query(embedding, top_k=top_k)

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    sources: List[Dict[str, Any]] = []
    for doc, meta in zip(documents, metadatas):
        sources.append({"text": doc, "metadata": meta})

    return sources
