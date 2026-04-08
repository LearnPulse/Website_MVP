"""
RAG ingest pipeline.

Flow:
  1. Read document (PDF or text)
  2. Chunk with overlap
  3. Embed chunks → ChromaDB
  4. Run Concept Extractor → Knowledge Graph
"""

import logging
import time
import uuid
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from app.agent.concept_extractor import extract_concepts
from app.core.config import settings
from app.services.chroma_service import get_chroma_store
from app.services.embedding_service import embed_texts

logger = logging.getLogger(__name__)


# ── Document reading ──────────────────────────────────────────────────────

def _read_pages(file_path: str) -> list[tuple[str, int | None]]:
    path = Path(file_path)
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(str(path))
        return [(page.extract_text() or "", idx + 1) for idx, page in enumerate(reader.pages)]
    raw = path.read_bytes()
    return [(raw.decode("utf-8", errors="ignore"), None)]


# ── Chunking ──────────────────────────────────────────────────────────────

def _chunk_pages(
    pages: list[tuple[str, int | None]],
    max_chars: int = 800,
    overlap: int = 100,
) -> list[dict[str, Any]]:
    chunks: list[dict[str, Any]] = []
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
    return chunks


# ── Main entry point ──────────────────────────────────────────────────────

def ingest_document(file_path: str, user_id: str) -> dict[str, Any]:
    """
    Ingest a document:
      - chunks + embeds → ChromaDB
      - extracts concepts → Knowledge Graph

    Returns status dict with doc_id, source_id, chunk_count, concept_count, timings.
    """
    t0 = time.perf_counter()
    doc_id = f"doc_{uuid.uuid4().hex}"
    source_id = f"source_{uuid.uuid4().hex}"
    file_name = Path(file_path).name

    logger.info("Ingest start file=%s doc_id=%s", file_name, doc_id)

    pages = _read_pages(file_path)
    chunks = _chunk_pages(pages)

    if not chunks:
        logger.warning("Ingest empty file=%s", file_name)
        return {"status": "empty", "doc_id": doc_id, "source_id": source_id,
                "chunks": 0, "concept_count": 0}

    # ── Embed + store in ChromaDB ────────────────────────────────────────
    t_embed = time.perf_counter()
    chunk_texts = [c["text"] for c in chunks]
    embeddings = embed_texts(chunk_texts)
    embed_time = time.perf_counter() - t_embed

    chunk_ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "doc_id": doc_id,
            "chunk_index": i,
            "source_id": source_id,
            "user_id": user_id,
            "doc_name": file_name,
            "page": chunks[i]["page"] if chunks[i]["page"] is not None else -1,
        }
        for i in range(len(chunks))
    ]

    store = get_chroma_store()
    store.add(ids=chunk_ids, embeddings=embeddings, documents=chunk_texts, metadatas=metadatas)
    logger.info("Embedded %d chunks in %.2fs", len(chunks), embed_time)

    # ── Extract concepts → Knowledge Graph ───────────────────────────────
    t_extract = time.perf_counter()
    chunk_dicts = [{"id": chunk_ids[i], "text": chunk_texts[i]} for i in range(len(chunks))]
    extraction = extract_concepts(chunk_dicts, source_id=source_id)
    extract_time = time.perf_counter() - t_extract

    total_time = time.perf_counter() - t0
    logger.info(
        "Ingest complete file=%s chunks=%d concepts=%d total=%.2fs",
        file_name, len(chunks), extraction["concept_count"], total_time,
    )

    return {
        "status": "ok",
        "doc_id": doc_id,
        "source_id": source_id,
        "chunks": len(chunks),
        "concept_count": extraction["concept_count"],
        "embedding_time": round(embed_time, 3),
        "extraction_time": round(extract_time, 3),
        "total_time": round(total_time, 3),
    }
