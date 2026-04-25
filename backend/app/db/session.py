import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession, AsyncEngine
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazily initialize the engine so a misconfigured DATABASE_URL doesn't prevent
# the container from starting (Cloud Run health checks). Requests that need DB
# will fail fast with a clear error instead.
_engine: AsyncEngine | None = None
_session_maker: async_sessionmaker[AsyncSession] | None = None


def _make_engine() -> AsyncEngine:
    connect_args = {}
    if settings.database_ssl:
        # asyncpg expects ssl to be bool/SSLContext; "require" breaks startup.
        connect_args["ssl"] = True
    return create_async_engine(
        settings.database_url,
        pool_pre_ping=True,
        connect_args=connect_args,
    )


def get_engine() -> AsyncEngine:
    global _engine, _session_maker
    if _engine is None:
        _engine = _make_engine()
        _session_maker = async_sessionmaker(bind=_engine, expire_on_commit=False, class_=AsyncSession)
    return _engine


async def get_session() -> AsyncSession:
    global _session_maker
    try:
        if _session_maker is None:
            get_engine()
        assert _session_maker is not None
        async with _session_maker() as session:
            yield session
    except Exception as exc:
        logger.error("Database session init failed: %s", exc)
        raise HTTPException(status_code=500, detail="Database is not configured correctly")
