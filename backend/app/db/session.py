from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

_connect_args = {"ssl": "require"} if settings.database_ssl else {}
engine = create_async_engine(settings.database_url, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
