"""
Concept Extractor sub-agent (LangGraph node).

Called during document ingest after chunks are embedded.
Sends chunks to Groq with a structured extraction prompt and
writes the resulting concept nodes + edges to the knowledge graph.
"""

import uuid
import logging

from app.services.llm_service import groq_json
from app.tools.user_state import add_concepts

logger = logging.getLogger(__name__)

EXTRACTION_PROMPT = """\
Given the following text chunks from an uploaded document, extract the key concepts
and relationships. Return ONLY valid JSON with no markdown, no code fences:

{{
  "concepts": [
    {{
      "id": "<uuid>",
      "name": "<concept name>",
      "description": "<1-2 sentence explanation>",
      "chunk_ids": ["<chunk_id>"]
    }}
  ],
  "relationships": [
    {{
      "from": "<concept_id>",
      "to": "<concept_id>",
      "type": "prerequisite | related | part_of | example_of"
    }}
  ]
}}

Rules:
- Each concept must have a unique UUID as its id.
- chunk_ids must be actual IDs from the chunks listed below.
- Extract 5–15 concepts. Focus on the core ideas, not minor details.
- Relationship direction rules (IMPORTANT — follow exactly):
  - "prerequisite": `from` must be learned BEFORE `to`. Edge means "learn FROM first, then TO".
    Example: {{"from": "variables_id", "to": "functions_id", "type": "prerequisite"}}
    (variables must be understood before functions)
  - "part_of": `from` is a component/sub-part of `to`.
    Example: {{"from": "neuron_id", "to": "neural_network_id", "type": "part_of"}}
  - "example_of": `from` is a concrete example/instance of `to`.
    Example: {{"from": "bubble_sort_id", "to": "sorting_algorithm_id", "type": "example_of"}}
  - "related": bidirectional association, neither depends on the other.
- Use "prerequisite" generously — learners need a clear order. Prefer prerequisite over related when one concept builds on another.
- Do NOT create cycles (e.g. A→B and B→A of the same type).

Chunks:
{chunks}
"""


def extract_concepts(chunks: list[dict], source_id: str, user_id: str = "") -> dict:
    """
    Run concept extraction on a list of chunk dicts: [{id, text}, ...]
    Writes extracted concepts + edges to the knowledge graph.
    Returns {"concept_count": int, "concepts": [...], "relationships": [...]}.
    """
    if not chunks:
        return {"concept_count": 0, "concepts": [], "relationships": []}

    chunks_text = "\n\n".join(
        f"[chunk_id: {c['id']}]\n{c['text']}" for c in chunks[:30]
    )
    prompt = EXTRACTION_PROMPT.format(chunks=chunks_text)

    data = groq_json(prompt, temperature=0.2)
    if not data:
        logger.warning("Concept extraction returned empty for source %s", source_id)
        return {"concept_count": 0, "concepts": [], "relationships": []}

    concepts = data.get("concepts", [])
    relationships = data.get("relationships", [])

    for c in concepts:
        if not c.get("id") or len(c["id"]) < 4:
            c["id"] = str(uuid.uuid4())

    add_concepts.invoke({
        "concepts": concepts,
        "relationships": relationships,
        "source_id": source_id,
        "user_id": user_id,
    })

    logger.info("Extracted %d concepts from source %s", len(concepts), source_id)
    return {
        "concept_count": len(concepts),
        "concepts": concepts,
        "relationships": relationships,
    }
