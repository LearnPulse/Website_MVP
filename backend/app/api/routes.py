from fastapi import APIRouter, UploadFile, File, Form, Depends
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.schemas.learn import LearnRequest, LearnResponse
from app.schemas.memory import UserMemoryIn, UserMemoryOut
from app.services.ingestion_service import ingest_document
from app.services.orchestration_service import run_learning
from app.services.memory_service import upsert_user_memory

router = APIRouter()


@router.post("/ingest")
async def ingest(
    file: UploadFile = File(...),
    topic: str = Form(...),
    user_id: str = Form(...)
):
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest = upload_dir / file.filename
    content = await file.read()
    dest.write_bytes(content)

    result = ingest_document(str(dest), topic=topic, uploader_id=user_id)
    return result


@router.post("/learn", response_model=LearnResponse)
async def learn(payload: LearnRequest, session: AsyncSession = Depends(get_session)):
    result = await run_learning(session, payload.topic, payload.goal, payload.format, payload.user_id)
    return result


@router.post("/memory", response_model=UserMemoryOut)
async def upsert_memory(payload: UserMemoryIn, session: AsyncSession = Depends(get_session)):
    record = await upsert_user_memory(session, payload.model_dump())
    return record
