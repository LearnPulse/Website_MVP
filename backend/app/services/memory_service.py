from typing import Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import UserMemory


async def get_user_memory(session: AsyncSession, user_id: str) -> Dict[str, Any]:
    result = await session.execute(select(UserMemory).where(UserMemory.user_id == user_id))
    record = result.scalar_one_or_none()
    if not record:
        return {"user_id": user_id, "goals": {}, "preferences": {}, "mastery_history": {}}
    return {
        "user_id": record.user_id,
        "goals": record.goals or {},
        "preferences": record.preferences or {},
        "mastery_history": record.mastery_history or {}
    }


async def upsert_user_memory(session: AsyncSession, payload: Dict[str, Any]) -> UserMemory:
    result = await session.execute(select(UserMemory).where(UserMemory.user_id == payload["user_id"]))
    record = result.scalar_one_or_none()
    if record:
        record.goals = payload.get("goals", record.goals)
        record.preferences = payload.get("preferences", record.preferences)
        record.mastery_history = payload.get("mastery_history", record.mastery_history)
        await session.commit()
        await session.refresh(record)
        return record

    record = UserMemory(
        user_id=payload["user_id"],
        goals=payload.get("goals", {}),
        preferences=payload.get("preferences", {}),
        mastery_history=payload.get("mastery_history", {})
    )
    session.add(record)
    await session.commit()
    await session.refresh(record)
    return record
