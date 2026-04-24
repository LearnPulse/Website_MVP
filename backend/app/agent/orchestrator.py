"""
Learning Orchestration Agent.

Simplified direct pipeline (no LangGraph ReAct loop):
  1. Load concept node from knowledge graph
  2. Fetch associated text chunks from ChromaDB
  3. Route to the appropriate artifact generator (Groq-backed)
"""

import logging

from app.agent.artifacts.cheatsheet import generate_cheatsheet
from app.agent.artifacts.flashcards import generate_flashcards
from app.agent.artifacts.quiz import generate_quiz
from app.agent.artifacts.diagram import generate_diagram
from app.agent.artifacts.audio import generate_audio
from app.knowledge_graph import get_concept, load_kg
from app.services.chroma_service import get_chroma_store

logger = logging.getLogger(__name__)

_ARTIFACT_FNS = {
    "cheatsheet": generate_cheatsheet,
    "flashcards": generate_flashcards,
    "quiz": generate_quiz,
    "diagram": generate_diagram,
    "audio": generate_audio,
}


def _fetch_context(chunk_ids: list[str], max_chars: int = 4000) -> str:
    """Retrieve chunk texts from ChromaDB by ID and join them."""
    if not chunk_ids:
        return ""
    try:
        store = get_chroma_store()
        results = store.collection.get(ids=chunk_ids, include=["documents"])
        docs = results.get("documents", []) or []
        return "\n\n".join(d for d in docs if d)[:max_chars]
    except Exception as exc:
        logger.warning("ChromaDB fetch failed: %s", exc)
        return ""


async def run_orchestrator(
    user_id: str,
    concept_id: str,
    goal: str,
    artifact_type: str,
) -> dict:
    """Entry point called by the /ask route handler."""
    G = load_kg()
    concept = get_concept(G, concept_id)
    if not concept:
        logger.warning("Concept %s not found in KG", concept_id)
        concept = {"name": concept_id, "description": "", "chunk_ids": []}

    chunk_ids = concept.get("chunk_ids", [])
    context = _fetch_context(chunk_ids)

    if not context:
        logger.warning("No context found for concept %s (chunk_ids=%s)", concept_id, chunk_ids)

    generate_fn = _ARTIFACT_FNS.get(artifact_type, generate_cheatsheet)
    payload = generate_fn(concept, context)

    logger.info(
        "Artifact generated: type=%s concept=%s chunks=%d",
        artifact_type, concept_id, len(chunk_ids),
    )

    return {
        "artifact_type": artifact_type,
        "concept_id": concept_id,
        "payload": payload,
    }
