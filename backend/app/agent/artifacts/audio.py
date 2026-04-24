import logging
from app.services.llm_service import groq_text

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
    """Returns a transcript (no TTS synthesis in MVP). Frontend renders a play button + transcript."""
    prompt = PROMPT.format(
        concept_name=concept.get("name", ""),
        context=context[:3000],
    )
    transcript = groq_text(prompt, temperature=0.5)
    if not transcript:
        logger.warning("Audio generation returned empty for concept %s", concept.get("name"))
    return {"type": "audio", "transcript": transcript}
