from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.retrieval_service import retrieve
from app.agents.output_agent import generate_learning_output, decide_learning_format
from app.services.kg_service import load_kg
from app.services.memory_service import get_user_memory

#Adding the build_prompt function at the top (above run_learning)
def build_prompt(topic, goal, format_hint, sources, kg, user_context):
    context_blocks = "\n\n".join([
    f"Source {i+1}: {s.get('text', s.get('content', str(s)))}"
    for i, s in enumerate(sources)
])

    if format_hint == "cheat_sheet":
        return f"""
You are LearnPulse, an expert CS tutor.

Topic: {topic}
Goal: {goal}

User Context:
{user_context}

Knowledge Graph:
{kg}

Retrieved Sources:
{context_blocks}

Create a structured CHEAT SHEET with:

Title:
One-line Summary:

Key Terms:
- term: definition

Core Ideas:
- ...

Example:
- ...

Common Pitfalls:
- ...

Quick Self Check:
1) Q:
   A:
2) Q:
   A:
""".strip()

    return f"""
Topic: {topic}
Goal: {goal}

Retrieved Sources:
{context_blocks}

Generate a concise structured summary.
""".strip()

##run_learning below

async def run_learning(session: AsyncSession, topic: str, goal: str, requested_format: str, user_id: str) -> Dict[str, Any]:
    if requested_format:
        format_hint = requested_format
    else:
        format_hint = decide_learning_format(topic, goal)

    format_hint = format_hint.strip().lower()   # ⭐ new line

    sources = retrieve(f"{topic}. Goal: {goal}")
    kg = load_kg()
    user_context = await get_user_memory(session, user_id)

    prompt = build_prompt(topic, goal, format_hint, sources, kg, user_context)
    output = generate_learning_output(prompt)

    return {"output": output, "retrieved_sources": sources}
