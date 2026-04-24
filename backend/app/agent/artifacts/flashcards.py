import logging
from app.services.llm_service import groq_json

logger = logging.getLogger(__name__)

PROMPT = """\
You are generating flashcards for a student learning about: {concept_name}

Context from their documents:
{context}

Return ONLY valid JSON:
{{
  "cards": [
    {{
      "front": "<question or term>",
      "back": "<answer or explanation>",
      "tags": ["<tag>"]
    }},
    ...
  ]
}}

Generate 6–10 cards. Each card should test one specific idea.
"""


def generate_flashcards(concept: dict, context: str) -> dict:
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        context=context[:3000],
    )
    data = groq_json(prompt, temperature=0.4)
    if not data:
        logger.warning("Flashcard generation returned empty for concept %s", concept.get("name"))
    return {"type": "flashcards", "cards": data.get("cards", [])}
