from typing import List, Dict, Any
import chromadb
from app.core.config import settings


class ChromaStore:
    def __init__(self) -> None:
        self.client = chromadb.PersistentClient(path=settings.chroma_dir)
        self.collection = self.client.get_or_create_collection(name="learnpulse")

    def add(self, ids: List[str], embeddings: List[List[float]], documents: List[str], metadatas: List[Dict[str, Any]]) -> None:
        self.collection.add(ids=ids, embeddings=embeddings, documents=documents, metadatas=metadatas)

    def query(self, embedding: List[float], top_k: int = 4) -> Dict[str, Any]:
        return self.collection.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

    def close(self) -> None:
        """Release the underlying SQLite connection so multiprocessing semaphores
        are cleaned up before the interpreter exits.  Call this from the
        FastAPI lifespan shutdown hook."""
        try:
            # chromadb ≥ 0.5 exposes _producer / _consumer with a reset()
            if hasattr(self.client, "_producer"):
                self.client._producer.reset()
            # Underlying sqlite3 connection held by the segment manager
            if hasattr(self.client, "_system"):
                self.client._system.stop()
        except Exception:
            pass


# Module-level singleton — created once, closed on app shutdown via lifespan
_store: ChromaStore | None = None


def get_chroma_store() -> ChromaStore:
    global _store
    if _store is None:
        _store = ChromaStore()
    return _store


def close_chroma_store() -> None:
    global _store
    if _store is not None:
        _store.close()
        _store = None
