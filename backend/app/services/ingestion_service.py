from typing import List, Dict, Any, Tuple
from pathlib import Path
import uuid
import time
import logging

from pypdf import PdfReader
from app.services.embedding_service import embed_texts
from app.services.chroma_service import ChromaStore
from app.services import kg_service

logger = logging.getLogger(__name__)

def _read_document_pages(file_path: str) -> List[Tuple[str, int | None]]:
    path = Path(file_path)
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(str(path))
        return [(page.extract_text() or "", idx + 1) for idx, page in enumerate(reader.pages)]
    logger.info("Reading text file path=%s", path)
    raw = path.read_bytes()
    text = raw.decode("utf-8", errors="ignore")
    logger.info("Read text file path=%s bytes=%s", path, len(raw))
    return [(text, None)]


def _chunk_pages(pages: List[Tuple[str, int | None]], max_chars: int = 800, overlap: int = 100) -> List[Dict[str, Any]]:
    chunks: List[Dict[str, Any]] = []
    for text, page_number in pages:
        if not text:
            continue
        start = 0
        while start < len(text):
            end = min(len(text), start + max_chars)
            chunk = text[start:end].strip()
            if chunk:
                chunks.append({"text": chunk, "page": page_number})
            if end >= len(text):
                break
            start = end - overlap
            if start < 0:
                start = 0
            if start >= len(text):
                break
    return chunks


def ingest_document(file_path: str, topic: str, uploader_id: str) -> Dict[str, Any]:
    start_time = time.perf_counter()
    print(f"[ingest] start file={Path(file_path).name}", flush=True)
    pages = _read_document_pages(file_path)
    chunks = _chunk_pages(pages)
    page_count = len(pages)
    chunk_count = len(chunks)
    logger.info("Ingest start file=%s pages=%s chunks=%s topic=%s", Path(file_path).name, page_count, chunk_count, topic)
    print(f"[ingest] pages={page_count} chunks={chunk_count}", flush=True)

    kg = kg_service.load_kg()
    source_node = kg_service.create_source_node(Path(file_path).name, uploader_id)
    kg.setdefault("source_nodes", []).append(source_node)
    kg_service.link_source_to_topic(kg, source_node["id"], topic)
    kg_service.save_kg(kg)

    if not chunks:
        elapsed = time.perf_counter() - start_time
        logger.info("Ingest empty file=%s pages=%s elapsed=%.2fs", Path(file_path).name, page_count, elapsed)
        print(f"[ingest] empty elapsed={elapsed:.2f}s", flush=True)
        return {"status": "empty", "chunks": 0, "source_id": source_node["id"]}

    chunk_texts = [c["text"] for c in chunks]
    embed_start = time.perf_counter()
    print(f"[ingest] embedding start chunks={chunk_count}", flush=True)
    embeddings = embed_texts(chunk_texts)
    embed_elapsed = time.perf_counter() - embed_start
    logger.info("Embedding done file=%s chunks=%s time=%.2fs", Path(file_path).name, chunk_count, embed_elapsed)
    print(f"[ingest] embedding done time={embed_elapsed:.2f}s", flush=True)
    store = ChromaStore()

    doc_id = f"doc_{uuid.uuid4().hex}"
    ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "chunk": i,
            "topic": topic,
            "source_id": source_node["id"],
            "doc_name": Path(file_path).name,
            "page": chunks[i]["page"] if chunks[i]["page"] is not None else -1
        }
        for i in range(len(chunks))
    ]

    store.add(ids=ids, embeddings=embeddings, documents=chunk_texts, metadatas=metadatas)

    total_elapsed = time.perf_counter() - start_time
    logger.info("Ingest complete file=%s chunks=%s total=%.2fs", Path(file_path).name, chunk_count, total_elapsed)

    return {"status": "ok", "doc_id": doc_id, "chunks": len(chunks), "source_id": source_node["id"], "embedding_time": embed_elapsed, "total_time": total_elapsed}
