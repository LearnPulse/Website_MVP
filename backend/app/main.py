from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.auth_routes import router as auth_router
from app.api.routes import router as api_router

app = FastAPI(title="LearnPulse API")

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
