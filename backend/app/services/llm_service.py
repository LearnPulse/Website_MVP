"""Shared LLM helpers — Groq-backed, OpenAI-compatible."""

import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)


def _client() -> Groq:
    return Groq(api_key=settings.groq_api_key)


def groq_json(prompt: str, temperature: float = 0.2) -> dict:
    """Call Groq and parse the response as JSON. Returns {} on failure."""
    try:
        resp = _client().chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=temperature,
        )
        return json.loads(resp.choices[0].message.content or "{}")
    except Exception as exc:
        logger.warning("groq_json failed: %s", exc)
        return {}


def groq_text(prompt: str, temperature: float = 0.3, history: list[dict] | None = None) -> str:
    """Call Groq and return plain text. Returns '' on failure."""
    messages = list(history or [])
    messages.append({"role": "user", "content": prompt})
    try:
        resp = _client().chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=temperature,
        )
        return resp.choices[0].message.content or ""
    except Exception as exc:
        logger.warning("groq_text failed: %s", exc)
        return ""
