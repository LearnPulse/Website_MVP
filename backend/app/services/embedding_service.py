from typing import List
import google.generativeai as genai
from app.core.config import settings


def embed_texts(texts: List[str]) -> List[List[float]]:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)
    embeddings: List[List[float]] = []
    for text in texts:
        result = genai.embed_content(
            model=settings.gemini_embed_model,
            content=text,
            task_type="retrieval_document"
        )
        embeddings.append(result["embedding"])
    return embeddings


def embed_query(text: str) -> List[float]:
    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)
    result = genai.embed_content(
        model=settings.gemini_embed_model,
        content=text,
        task_type="retrieval_query"
    )
    return result["embedding"]
