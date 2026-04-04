import json
import logging
import google.generativeai as genai
from app.core.config import settings

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
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_chat_model)
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        concept_description=concept.get("description", ""),
        context=context[:3000],
    )
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json", temperature=0.3
            ),
        )
        data = json.loads(response.text)
        return {"type": "cheatsheet", "entries": data.get("entries", [])}
    except Exception as exc:
        logger.warning("Cheatsheet generation failed: %s", exc)
        return {"type": "cheatsheet", "entries": []}
