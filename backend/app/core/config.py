from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
from pathlib import Path


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _resolve_path(value: str) -> str:
    path = Path(value)
    if path.is_absolute():
        return str(path)
    return str(_repo_root() / path)


class Settings(BaseSettings):
    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/learnpulse")
    gemini_api_key: str = Field(default="")
    gemini_embed_model: str = Field(default="models/text-embedding-004")
    gemini_chat_model: str = Field(default="models/gemini-2.5-flash")
    gemini_extract_model: str = Field(default="models/gemini-1.5-flash")
    groq_api_key: str = Field(default="")
    groq_model: str = Field(default="llama-3.3-70b-versatile")
    embedding_backend: str = Field(default="gemini")
    hf_embed_model: str = Field(default="BAAI/bge-m3")
    hf_embed_device: str = Field(default="cpu")
    hybrid_weight: float = Field(default=0.6)
    chroma_dir: str = Field(default=str(_repo_root() / "backend/data/chroma"))
    kg_path: str = Field(default=str(_repo_root() / "backend/data/kg/graph.json"))
    upload_dir: str = Field(default=str(_repo_root() / "backend/data/uploads"))
    cors_origins: List[str] = Field(default=["*"])
    jwt_secret_key: str = Field(default="change-me-in-production")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expire_minutes: int = Field(default=60 * 24 * 7)  # 7 days
    google_client_id: str = Field(default="")  # for server-side ID token validation
    google_tts_key_path: str = Field(default="backend/secrets/learn-pulse-494314-6784d7d6e9a5.json")
    database_ssl: bool = Field(default=False)  # set True for Neon / Cloud SQL

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
settings.chroma_dir = _resolve_path(settings.chroma_dir)
settings.kg_path = _resolve_path(settings.kg_path)
settings.upload_dir = _resolve_path(settings.upload_dir)
settings.google_tts_key_path = _resolve_path(settings.google_tts_key_path)
