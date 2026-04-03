from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings


def generate_learning_output(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)

    model = genai.GenerativeModel(settings.gemini_chat_model)
    response = model.generate_content(prompt)

    return response.text or ""


def decide_learning_format(topic: str, goal: str) -> str:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)

    prompt = (
        "You are the Learning Orchestration Agent. Choose the most useful learning artifact format.\n"
        "Return only one token from: cheat_sheet, summary, micro_learning.\n\n"
        f"Topic: {topic}\n"
        f"Goal: {goal}\n"
    )

    model = genai.GenerativeModel(settings.gemini_chat_model)
    response = model.generate_content(
        prompt,
        generation_config={"temperature": 0.7, "max_output_tokens": 8}
    )
    text = (response.text or "").strip().lower()

    if "cheat" in text:
        return "cheat_sheet"
    if "summary" in text:
        return "summary"
    return "micro_learning"
