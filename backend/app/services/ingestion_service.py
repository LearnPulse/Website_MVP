from typing import List, Dict, Any
from pathlib import Path
import uuid

from pypdf import PdfReader
from app.services.embedding_service import embed_texts
from app.services.chroma_service import ChromaStore
from app.services import kg_service


def chunk_text(text: str, max_chars: int = 800, overlap: int = 100) -> List[str]:
    chunks: List[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + max_chars)
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
        if start < 0:
            start = 0
        if start >= len(text):
            break
    return [c for c in chunks if c]


def _read_document_text(file_path: str) -> str:
    path = Path(file_path)
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    return path.read_text(errors="ignore")


def ingest_document(file_path: str, topic: str, uploader_id: str) -> Dict[str, Any]:
    text = _read_document_text(file_path)
    chunks = chunk_text(text)

    kg = kg_service.load_kg()
    source_node = kg_service.create_source_node(Path(file_path).name, uploader_id)
    kg.setdefault("source_nodes", []).append(source_node)
    kg_service.link_source_to_topic(kg, source_node["id"], topic)
    kg_service.save_kg(kg)

    if not chunks:
        return {"status": "empty", "chunks": 0, "source_id": source_node["id"]}

    embeddings = embed_texts(chunks)
    store = ChromaStore()

    doc_id = f"doc_{uuid.uuid4().hex}"
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [{"doc_id": doc_id, "chunk": i, "topic": topic} for i in range(len(chunks))]

    store.add(ids=ids, embeddings=embeddings, documents=chunks, metadatas=metadatas)

    return {"status": "ok", "doc_id": doc_id, "chunks": len(chunks), "source_id": source_node["id"]}
