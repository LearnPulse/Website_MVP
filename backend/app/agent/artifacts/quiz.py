import json
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

PROMPT = """\
You are generating a quiz for a student learning about: {concept_name}

Context from their documents:
{context}

Return ONLY valid JSON with 3–5 multiple-choice questions:
{{
  "questions": [
    {{
      "stem": "<question text>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correct_index": <0|1|2|3>
    }},
    ...
  ]
}}

Each question must have exactly 4 options. correct_index is 0-based.
Make the distractors plausible but clearly wrong to an informed student.
"""


def generate_quiz(concept: dict, context: str) -> dict:
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
                response_mime_type="application/json", temperature=0.3
            ),
        )
        data = json.loads(response.text)
        return {"type": "quiz", "questions": data.get("questions", [])}
    except Exception as exc:
        logger.warning("Quiz generation failed: %s", exc)
        return {"type": "quiz", "questions": []}
