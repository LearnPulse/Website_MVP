from fastapi import APIRouter, UploadFile, File, Form, Depends
from pathlib import Path
import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.schemas.learn import LearnRequest, LearnResponse
from app.schemas.memory import UserMemoryIn, UserMemoryOut
from app.services.ingestion_service import ingest_document
from app.agents.orchestration_agent import run_learning
from app.services.memory_service import upsert_user_memory

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/ingest")
async def ingest(
    file: UploadFile = File(...),
    topic: str = Form(...),
    user_id: str = Form(...)
):
    logger.info("Ingest request received filename=%s topic=%s user_id=%s", file.filename, topic, user_id)
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest = upload_dir / file.filename
    content = await file.read()
    logger.info("Ingest file read filename=%s size=%s bytes", file.filename, len(content))
    dest.write_bytes(content)
    logger.info("Ingest file saved path=%s", dest)

    logger.info("Ingest calling ingest_document filename=%s", file.filename)
    result = ingest_document(str(dest), topic=topic, uploader_id=user_id)
    logger.info("Ingest complete filename=%s result=%s", file.filename, result)
    return result


@router.post("/learn", response_model=LearnResponse)
async def learn(payload: LearnRequest, session: AsyncSession = Depends(get_session)):
    result = await run_learning(session, payload.topic, payload.goal, payload.format, payload.user_id)
    return result


@router.post("/memory", response_model=UserMemoryOut)
async def upsert_memory(payload: UserMemoryIn, session: AsyncSession = Depends(get_session)):
    record = await upsert_user_memory(session, payload.model_dump())
    return record
