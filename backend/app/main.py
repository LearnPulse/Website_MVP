from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.auth_routes import router as auth_router
from app.api.routes import router as api_router
from app.services.chroma_service import close_chroma_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── startup ──────────────────────────────────────────────────────────
    yield
    # ── shutdown ─────────────────────────────────────────────────────────
    # Release ChromaDB's SQLite connection and multiprocessing semaphores
    # so the resource_tracker doesn't warn about leaked semaphore objects.
    close_chroma_store()


app = FastAPI(title="LearnPulse API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}
