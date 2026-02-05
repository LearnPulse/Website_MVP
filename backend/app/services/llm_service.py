from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings


def generate_learning_output(topic: str, goal: str, format_hint: str, sources: List[Dict[str, Any]], kg_snapshot: Dict[str, Any], user_context: Dict[str, Any]) -> str:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)

    context_blocks = "\n\n".join([f"Source {i+1}: {s['text']}" for i, s in enumerate(sources)])

    prompt = (
        "You are the Learning Output Agent.\n"
        f"Topic: {topic}\n"
        f"Goal: {goal}\n"
        f"Format: {format_hint}\n\n"
        "User Context (preferences, goals, mastery):\n"
        f"{user_context}\n\n"
        "Knowledge Graph Snapshot:\n"
        f"{kg_snapshot}\n\n"
        "Retrieved Sources:\n"
        f"{context_blocks}\n\n"
        "Produce a concise learning artifact grounded in the retrieved sources."
    )

    model = genai.GenerativeModel(settings.gemini_chat_model)
    response = model.generate_content(prompt)
    return response.text or ""
