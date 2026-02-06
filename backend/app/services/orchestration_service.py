from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.retrieval_service import retrieve
from app.services.llm_service import generate_learning_output, decide_learning_format
from app.services.kg_service import load_kg
from app.services.memory_service import get_user_memory


async def run_learning(session: AsyncSession, topic: str, goal: str, requested_format: str, user_id: str) -> Dict[str, Any]:
    if requested_format:
        format_hint = requested_format
    else:
        format_hint = decide_learning_format(topic, goal)
    sources = retrieve(f"{topic}. Goal: {goal}")
    kg = load_kg()
    user_context = await get_user_memory(session, user_id)
    output = generate_learning_output(topic, goal, format_hint, sources, kg, user_context)

    return {"output": output, "retrieved_sources": sources}
