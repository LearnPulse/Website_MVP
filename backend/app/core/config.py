from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/learnpulse")
    gemini_api_key: str = Field(default="")
    gemini_embed_model: str = Field(default="models/text-embedding-004")
    gemini_chat_model: str = Field(default="models/gemini-1.5-flash")
    chroma_dir: str = Field(default="backend/data/chroma")
    kg_path: str = Field(default="backend/data/kg/graph.json")
    upload_dir: str = Field(default="backend/data/uploads")
    cors_origins: List[str] = Field(default=["*"])

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
