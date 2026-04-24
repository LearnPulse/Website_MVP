from typing import List
import concurrent.futures
import google.generativeai as genai
from app.core.config import settings
from sentence_transformers import SentenceTransformer

_hf_model: SentenceTransformer | None = None


def _get_hf_model() -> SentenceTransformer:
    global _hf_model
    if _hf_model is None:
        _hf_model = SentenceTransformer(settings.hf_embed_model, device=settings.hf_embed_device)
    return _hf_model


def embed_texts(texts: List[str]) -> List[List[float]]:
    if settings.embedding_backend == "hf":
        model = _get_hf_model()
        vectors = model.encode(texts, normalize_embeddings=True, convert_to_numpy=True)
        return [v.tolist() for v in vectors]

    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)

    def _embed_one(text: str) -> List[float]:
        result = genai.embed_content(
            model=settings.gemini_embed_model,
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]

    # Parallelize embedding calls — reduces N×latency to ~latency of one call
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        return list(pool.map(_embed_one, texts))


def embed_query(text: str) -> List[float]:
    if settings.embedding_backend == "hf":
        model = _get_hf_model()
        vector = model.encode([text], normalize_embeddings=True, convert_to_numpy=True)[0]
        return vector.tolist()

    if not settings.gemini_api_key:
        raise ValueError("GEMINI_API_KEY is not set")

    genai.configure(api_key=settings.gemini_api_key)
    result = genai.embed_content(
        model=settings.gemini_embed_model,
        content=text,
        task_type="retrieval_query"
    )
    return result["embedding"]
