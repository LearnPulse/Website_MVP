import asyncio
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_session
from app.services.llm_service import groq_text
from app.knowledge_graph import get_concept, get_all_concepts, get_ordered_concepts, get_user_subgraph, load_kg
from app.models.user import User, UserConcept, UserGoal, UserPreferences
from app.agent.orchestrator import run_orchestrator
from app.rag.ingest import ingest_document
from app.tools.user_state import set_db_context

router = APIRouter()
logger = logging.getLogger(__name__)


# ── Knowledge Graph export ────────────────────────────────────────────────

@router.get("/graph")
async def get_graph(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return this user's knowledge graph with per-concept mastery scores for visualization."""
    G = get_user_subgraph(load_kg(), str(current_user.id))

    result = await session.execute(
        select(UserConcept).where(UserConcept.user_id == current_user.id)
    )
    mastery_rows = {str(r.concept_id): r.mastery_score for r in result.scalars().all()}

    nodes = [
        {
            "id": nid,
            "name": attrs.get("name", nid),
            "description": attrs.get("description", ""),
            "mastery_score": mastery_rows.get(nid, 0),
            "source_id": attrs.get("source_id", ""),
        }
        for nid, attrs in G.nodes(data=True)
    ]

    edges = [
        {"source": u, "target": v, "type": d.get("type", "related")}
        for u, v, d in G.edges(data=True)
    ]

    return {"nodes": nodes, "edges": edges}


# ── Ingest ────────────────────────────────────────────────────────────────

@router.post("/ingest")
async def ingest(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    current_user: User = Depends(get_current_user),
):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    dest = upload_dir / file.filename
    dest.write_bytes(await file.read())

    # ingest_document is CPU/IO-bound sync — run in thread pool to avoid blocking the event loop
    result = await asyncio.to_thread(ingest_document, str(dest), str(current_user.id))
    return result


# ── Ask (orchestrator) ────────────────────────────────────────────────────

class AskRequest(BaseModel):
    concept_id: str
    goal: str
    artifact_type: str


@router.post("/ask")
async def ask(
    payload: AskRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    loop = asyncio.get_event_loop()
    set_db_context(session, loop)

    result = await run_orchestrator(
        user_id=str(current_user.id),
        concept_id=payload.concept_id,
        goal=payload.goal,
        artifact_type=payload.artifact_type,
    )
    return result


# ── Progress ──────────────────────────────────────────────────────────────

@router.get("/progress/{user_id}")
async def get_progress(
    user_id: str,
    goal_id: str | None = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if str(current_user.id) != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    # Load mastery from Postgres
    result = await session.execute(
        select(UserConcept).where(UserConcept.user_id == current_user.id)
    )
    mastery_rows = {str(r.concept_id): r.mastery_score for r in result.scalars().all()}

    # Load preferences
    prefs_result = await session.execute(
        select(UserPreferences).where(UserPreferences.user_id == current_user.id)
    )
    prefs = prefs_result.scalar_one_or_none()
    preferred_formats = prefs.preferred_formats if prefs else ["cheatsheet"]

    # Load goal — specific goal_id or latest
    if goal_id:
        goal_result = await session.execute(
            select(UserGoal).where(UserGoal.id == goal_id, UserGoal.user_id == current_user.id)
        )
        active_goal = goal_result.scalar_one_or_none()
    else:
        goal_result = await session.execute(
            select(UserGoal)
            .where(UserGoal.user_id == current_user.id)
            .order_by(UserGoal.created_at.desc())
            .limit(1)
        )
        active_goal = goal_result.scalar_one_or_none()

    goal_text = active_goal.goal_text if active_goal else ""
    source_ids = set(active_goal.source_ids or []) if active_goal else set()

    # Build ordered concept list — scoped to this user only, then optionally
    # narrowed to a specific goal's source_ids.
    G = get_user_subgraph(load_kg(), str(current_user.id))
    ordered_ids = get_ordered_concepts(G)
    all_nodes = {c["id"]: c for c in get_all_concepts(G)}

    # If the goal has source_ids, narrow further to those uploads
    if source_ids:
        all_nodes = {
            cid: node for cid, node in all_nodes.items()
            if node.get("source_id", "") in source_ids
        }
        ordered_ids = [cid for cid in ordered_ids if cid in all_nodes]

    concepts = []
    for cid in ordered_ids:
        if cid not in all_nodes:
            continue
        node = all_nodes[cid]
        mastery = mastery_rows.get(cid, 0)

        # Determine state — only "prerequisite" edges gate unlocking.
        # "related", "part_of", "example_of" are structural and must not lock a concept.
        prereqs = [
            p for p in G.predecessors(cid)
            if G.edges[p, cid].get("type") == "prerequisite"
        ]
        prereqs_met = all(mastery_rows.get(p, 0) >= 50 for p in prereqs)
        if mastery >= 70:
            state = "done"
        elif mastery > 0 or prereqs_met or not prereqs:
            state = "active"
        else:
            state = "locked"

        concepts.append({
            "id": cid,
            "name": node.get("name", cid),
            "description": node.get("description", ""),
            "mastery_score": mastery,
            "state": state,
            "preferred_formats": preferred_formats,
            "viewed_formats": [],
        })

    mastered_count = sum(1 for c in concepts if c["state"] == "done")
    return {
        "goal_text": goal_text,
        "concepts": concepts,
        "mastered_count": mastered_count,
        "total_count": len(concepts),
    }


# ── Mastery update ────────────────────────────────────────────────────────

MASTERY_DELTAS = {"view": 8, "flashcard": 15, "quiz_pass": 35, "quiz_fail": 8}


class MasteryUpdateRequest(BaseModel):
    concept_id: str
    source: str  # view | flashcard | quiz_pass | quiz_fail


@router.post("/mastery/update")
async def mastery_update(
    payload: MasteryUpdateRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from datetime import datetime, timezone

    delta = MASTERY_DELTAS.get(payload.source, 8)
    stmt = (
        pg_insert(UserConcept)
        .values(
            user_id=current_user.id,
            concept_id=payload.concept_id,
            mastery_score=delta,
            review_count=1,
            last_reviewed_at=datetime.now(timezone.utc),
        )
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
    return {"status": "ok", "delta": delta}


# ── Goals + Preferences ────────────────────────────────────────────────────

class UserGoalIn(BaseModel):
    goal_text: str
    target_concept_id: str | None = None


@router.get("/goals")
async def list_goals(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Return all learning paths (goals) for the current user, newest first."""
    result = await session.execute(
        select(UserGoal)
        .where(UserGoal.user_id == current_user.id)
        .order_by(UserGoal.created_at.desc())
    )
    goals = result.scalars().all()

    # Use user-scoped graph so counts are accurate per-user
    G = get_user_subgraph(load_kg(), str(current_user.id))
    all_nodes = {c["id"]: c for c in get_all_concepts(G)}
    mastery_result = await session.execute(
        select(UserConcept).where(UserConcept.user_id == current_user.id)
    )
    mastery_rows = {str(r.concept_id): r.mastery_score for r in mastery_result.scalars().all()}

    out = []
    for g in goals:
        source_ids = set(g.source_ids or [])
        if source_ids:
            concepts = [n for n in all_nodes.values() if n.get("source_id", "") in source_ids]
        else:
            concepts = list(all_nodes.values())
        total = len(concepts)
        mastered = sum(1 for c in concepts if mastery_rows.get(c["id"], 0) >= 70)
        out.append({
            "id": str(g.id),
            "goal_text": g.goal_text,
            "source_ids": g.source_ids or [],
            "created_at": g.created_at.isoformat(),
            "total_count": total,
            "mastered_count": mastered,
        })
    return out


@router.post("/goals")
async def save_goal(
    payload: UserGoalIn,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    existing_result = await session.execute(
        select(UserGoal)
        .where(UserGoal.user_id == current_user.id, UserGoal.goal_text == payload.goal_text)
        .limit(1)
    )
    existing = existing_result.scalar_one_or_none()
    if existing:
        return {"id": str(existing.id), "existing": True}

    goal = UserGoal(
        user_id=current_user.id,
        goal_text=payload.goal_text,
        target_concept_id=payload.target_concept_id,
    )
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    return {"id": str(goal.id)}


class GoalSourcesIn(BaseModel):
    source_ids: list[str]


@router.patch("/goals/{goal_id}/sources")
async def update_goal_sources(
    goal_id: str,
    payload: GoalSourcesIn,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Link uploaded source_ids to a goal so its concepts can be filtered."""
    result = await session.execute(
        select(UserGoal).where(UserGoal.id == goal_id, UserGoal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    existing = set(goal.source_ids or [])
    goal.source_ids = list(existing | set(payload.source_ids))
    await session.commit()
    return {"status": "ok", "source_ids": goal.source_ids}


class UserPreferencesIn(BaseModel):
    preferred_formats: list[str]
    detail_level: str = "concise"
    session_length: str = "micro"


@router.post("/preferences")
async def save_preferences(
    payload: UserPreferencesIn,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        pg_insert(UserPreferences)
        .values(
            user_id=current_user.id,
            preferred_formats=payload.preferred_formats,
            detail_level=payload.detail_level,
            session_length=payload.session_length,
        )
        .on_conflict_do_update(
            index_elements=["user_id"],
            set_={
                "preferred_formats": payload.preferred_formats,
                "detail_level": payload.detail_level,
                "session_length": payload.session_length,
            },
        )
    )
    await session.execute(stmt)
    await session.commit()
    return {"status": "ok"}


# ── Chat ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


@router.post("/chat")
async def chat(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # Load user goal for context
    goal_result = await session.execute(
        select(UserGoal)
        .where(UserGoal.user_id == current_user.id)
        .order_by(UserGoal.created_at.desc())
        .limit(1)
    )
    latest_goal = goal_result.scalar_one_or_none()
    goal_text = latest_goal.goal_text if latest_goal else ""

    system = f"You are a helpful learning assistant for LearnPulse. Student's current learning goal: {goal_text or 'Not set yet.'}. Respond concisely and helpfully. When relevant, suggest what to study next based on their goal."
    history = [{"role": "system", "content": system}]
    for msg in payload.history[-6:]:
        history.append({"role": msg.role, "content": msg.content})

    reply = groq_text(payload.message, temperature=0.5, history=history)
    if not reply:
        reply = "Something went wrong. Please try again in a moment."

    return {"reply": reply}
