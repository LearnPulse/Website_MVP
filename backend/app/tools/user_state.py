"""
Stateless user-state tools shared across all agents.

get_user_state  — read mastery + preferences from Postgres
update_mastery  — write mastery delta to Postgres
add_concepts    — called by Concept Extractor to write KG nodes/edges

AsyncSession injection pattern:
  These tools are synchronous at the LangGraph boundary (LangChain @tool).
  Async DB calls are dispatched via asyncio.run_coroutine_threadsafe using
  the event loop stored in _db_session_ctx before the graph is invoked.
  Route handlers must call set_db_session(session) before run_orchestrator().
"""

import asyncio
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any

from langchain_core.tools import tool
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.knowledge_graph import (
    add_concept,
    add_edge,
    load_kg,
    save_kg,
)
from app.models.user import UserConcept, UserPreferences

# Context variable: set by the route handler before invoking the agent graph
_db_session_ctx: ContextVar[AsyncSession | None] = ContextVar("db_session", default=None)
_event_loop_ctx: ContextVar[asyncio.AbstractEventLoop | None] = ContextVar("event_loop", default=None)


def set_db_context(session: AsyncSession, loop: asyncio.AbstractEventLoop) -> None:
    """Call this in your route handler before invoking the orchestrator."""
    _db_session_ctx.set(session)
    _event_loop_ctx.set(loop)


def _run_async(coro) -> Any:
    """Run an async coroutine from a sync context using the stored event loop."""
    loop = _event_loop_ctx.get()
    session = _db_session_ctx.get()
    if loop is None or session is None:
        raise RuntimeError("DB context not set. Call set_db_context() before invoking the agent.")
    future = asyncio.run_coroutine_threadsafe(coro, loop)
    return future.result(timeout=10)


# ── get_user_state ─────────────────────────────────────────────────────────

async def _fetch_user_state(user_id: str, session: AsyncSession) -> dict:
    mastery_result = await session.execute(
        select(UserConcept).where(UserConcept.user_id == user_id)
    )
    concepts = mastery_result.scalars().all()

    prefs_result = await session.execute(
        select(UserPreferences).where(UserPreferences.user_id == user_id)
    )
    prefs = prefs_result.scalar_one_or_none()

    return {
        "mastery": {str(c.concept_id): c.mastery_score for c in concepts},
        "preferences": {
            "preferred_formats": prefs.preferred_formats if prefs else ["cheatsheet"],
            "detail_level": prefs.detail_level if prefs else "concise",
            "session_length": prefs.session_length if prefs else "micro",
        },
    }


@tool
def get_user_state(user_id: str) -> dict:
    """Return user mastery scores per concept + learning preferences from Postgres."""
    session = _db_session_ctx.get()
    if session is None:
        return {"mastery": {}, "preferences": {}}
    return _run_async(_fetch_user_state(user_id, session))


# ── update_mastery ─────────────────────────────────────────────────────────

MASTERY_DELTAS = {"view": 8, "flashcard": 15, "quiz_pass": 35, "quiz_fail": 8}


async def _upsert_mastery(user_id: str, concept_id: str, delta: int, session: AsyncSession) -> None:
    stmt = (
        pg_insert(UserConcept)
        .values(user_id=user_id, concept_id=concept_id, mastery_score=delta, review_count=1,
                last_reviewed_at=datetime.now(timezone.utc))
        .on_conflict_do_update(
            constraint="uq_user_concept",
            set_={
                "mastery_score": UserConcept.mastery_score + delta,
                "review_count": UserConcept.review_count + 1,
                "last_reviewed_at": datetime.now(timezone.utc),
            },
        )
    )
    await session.execute(stmt)
    await session.commit()


@tool
def update_mastery(user_id: str, concept_id: str, delta: int, source: str) -> None:
    """
    Write a mastery update to Postgres user_concepts.
    source: 'view' (+8), 'flashcard' (+15), 'quiz_pass' (+35), 'quiz_fail' (+8)
    """
    actual_delta = MASTERY_DELTAS.get(source, delta)
    session = _db_session_ctx.get()
    if session is None:
        return
    _run_async(_upsert_mastery(user_id, concept_id, actual_delta, session))


# ── add_concepts ────────────────────────────────────────────────────────────

@tool
def add_concepts(concepts: list[dict], relationships: list[dict], source_id: str) -> None:
    """
    Called by the Concept Extractor after extraction.
    Writes concept nodes + edges to the knowledge graph JSON file.

    concepts: [{ id, name, description, chunk_ids }]
    relationships: [{ from, to, type }]
    source_id: document UUID this extraction came from
    """
    G = load_kg()
    for c in concepts:
        add_concept(
            G,
            concept_id=c["id"],
            name=c["name"],
            description=c.get("description", ""),
            chunk_ids=c.get("chunk_ids", []),
            source_id=source_id,
        )
    for r in relationships:
        if r["from"] in G and r["to"] in G:
            add_edge(G, r["from"], r["to"], r.get("type", "related"))
    save_kg(G)
