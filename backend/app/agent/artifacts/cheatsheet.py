import logging
from app.services.llm_service import groq_json

logger = logging.getLogger(__name__)

PROMPT = """\
You are generating a cheatsheet artifact for a student.

Concept: {concept_name}
Description: {concept_description}

Context from their documents:
{context}

Return ONLY valid JSON — a list of term/definition pairs covering the key ideas:
{{
  "entries": [
    {{"term": "<key term>", "definition": "<clear 1-2 sentence definition>"}},
    ...
  ]
}}

Aim for 6–12 entries. Focus on what a student would need to remember at a glance.
"""


def generate_cheatsheet(concept: dict, context: str) -> dict:
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        concept_description=concept.get("description", ""),
        context=context[:3000],
    )
    data = groq_json(prompt, temperature=0.3)
    if not data:
        logger.warning("Cheatsheet generation returned empty for concept %s", concept.get("name"))
    return {"type": "cheatsheet", "entries": data.get("entries", [])}
