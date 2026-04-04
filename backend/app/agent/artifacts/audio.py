import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

PROMPT = """\
You are writing an audio script for a student learning about: {concept_name}

Context from their documents:
{context}

Write a natural, conversational 2–3 minute script (approximately 300–400 words) that:
- Explains the concept clearly as if talking to a smart friend
- Covers the key ideas from the context
- Uses concrete examples
- Ends with a quick 1-sentence summary

Return only the transcript text, no JSON, no headers.
"""


def generate_audio(concept: dict, context: str) -> dict:
    """
    Returns a transcript for now (no TTS synthesis in MVP).
    The frontend renders a play button placeholder + the transcript.
    """
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_chat_model)
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        context=context[:3000],
    )
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(temperature=0.5),
        )
        return {"type": "audio", "transcript": response.text.strip()}
    except Exception as exc:
        logger.warning("Audio generation failed: %s", exc)
        return {"type": "audio", "transcript": ""}
