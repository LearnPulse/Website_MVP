import json
import logging
import google.generativeai as genai
from app.core.config import settings

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
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_chat_model)
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        context=context[:3000],
    )
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json", temperature=0.4
            ),
        )
        data = json.loads(response.text)
        return {"type": "flashcards", "cards": data.get("cards", [])}
    except Exception as exc:
        logger.warning("Flashcard generation failed: %s", exc)
        return {"type": "flashcards", "cards": []}
