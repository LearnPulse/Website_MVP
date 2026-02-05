from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB


class Base(DeclarativeBase):
    pass


class UserMemory(Base):
    __tablename__ = "user_memory"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    goals: Mapped[dict] = mapped_column(JSONB, default=dict)
    preferences: Mapped[dict] = mapped_column(JSONB, default=dict)
    mastery_history: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
