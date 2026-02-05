from pydantic import BaseModel, Field
from typing import Dict, Any


class UserMemoryIn(BaseModel):
    user_id: str
    goals: Dict[str, Any] = Field(default_factory=dict)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    mastery_history: Dict[str, Any] = Field(default_factory=dict)


class UserMemoryOut(UserMemoryIn):
    id: int

    class Config:
        from_attributes = True
