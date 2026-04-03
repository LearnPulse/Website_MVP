"""
Concept Extractor sub-agent (LangGraph node).

Called during document ingest after chunks are embedded.
Sends chunks to Gemini with a structured extraction prompt and
writes the resulting concept nodes + edges to the knowledge graph.
"""

import json
import uuid
import logging

import google.generativeai as genai

from app.core.config import settings
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
- Only use relationship types: prerequisite, related, part_of, example_of.
- Extract 3–10 concepts. Focus on the core ideas, not minor details.

Chunks:
{chunks}
"""


def extract_concepts(chunks: list[dict], source_id: str) -> dict:
    """
    Run concept extraction on a list of chunk dicts: [{id, text}, ...]
    Writes extracted concepts + edges to the knowledge graph.
    Returns {"concept_count": int, "concepts": [...], "relationships": [...]}.
    """
    if not chunks:
        return {"concept_count": 0, "concepts": [], "relationships": []}

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_chat_model)

    # Format chunk list for the prompt
    chunks_text = "\n\n".join(
        f"[chunk_id: {c['id']}]\n{c['text']}" for c in chunks[:30]  # cap at 30 chunks
    )

    prompt = EXTRACTION_PROMPT.format(chunks=chunks_text)

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2,
            ),
        )
        raw = response.text.strip()
        data = json.loads(raw)
    except Exception as exc:
        logger.warning("Concept extraction failed: %s", exc)
        return {"concept_count": 0, "concepts": [], "relationships": []}

    concepts = data.get("concepts", [])
    relationships = data.get("relationships", [])

    # Assign UUIDs to any concept missing a valid id
    for c in concepts:
        if not c.get("id") or len(c["id"]) < 4:
            c["id"] = str(uuid.uuid4())

    # Write to knowledge graph via the add_concepts tool
    add_concepts.invoke({
        "concepts": concepts,
        "relationships": relationships,
        "source_id": source_id,
    })

    logger.info("Extracted %d concepts from source %s", len(concepts), source_id)
    return {
        "concept_count": len(concepts),
        "concepts": concepts,
        "relationships": relationships,
    }
