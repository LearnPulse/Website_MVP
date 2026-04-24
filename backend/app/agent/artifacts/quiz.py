import logging
from app.services.llm_service import groq_json

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
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        context=context[:3000],
    )
    data = groq_json(prompt, temperature=0.3)
    if not data:
        logger.warning("Quiz generation returned empty for concept %s", concept.get("name"))
    return {"type": "quiz", "questions": data.get("questions", [])}
