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
        return self.collection.query(query_embeddings=[embedding], n_results=top_k)
