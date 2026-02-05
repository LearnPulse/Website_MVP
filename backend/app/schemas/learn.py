from pydantic import BaseModel, Field
from typing import List, Dict, Any


class LearnRequest(BaseModel):
    user_id: str
    topic: str
    goal: str
    format: str = Field(default="cheat_sheet")


class LearnResponse(BaseModel):
    output: str
    retrieved_sources: List[Dict[str, Any]]
