import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Text, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.models import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    google_sub: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    display_name: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    goals: Mapped[List["UserGoal"]] = relationship("UserGoal", back_populates="user", cascade="all, delete-orphan")
    concepts: Mapped[List["UserConcept"]] = relationship("UserConcept", back_populates="user", cascade="all, delete-orphan")
    preferences: Mapped[Optional["UserPreferences"]] = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserGoal(Base):
    __tablename__ = "user_goals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_text: Mapped[str] = mapped_column(Text, nullable=False)
    target_concept_id: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="goals")


class UserConcept(Base):
    __tablename__ = "user_concepts"
    __table_args__ = (UniqueConstraint("user_id", "concept_id", name="uq_user_concept"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    concept_id: Mapped[str] = mapped_column(Text, nullable=False)
    mastery_score: Mapped[int] = mapped_column(Integer, server_default="0")
    review_count: Mapped[int] = mapped_column(Integer, server_default="0")
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="concepts")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    preferred_formats: Mapped[list] = mapped_column(JSONB, server_default='["cheatsheet"]')
    detail_level: Mapped[str] = mapped_column(Text, server_default="'concise'")
    session_length: Mapped[str] = mapped_column(Text, server_default="'micro'")

    user: Mapped["User"] = relationship("User", back_populates="preferences")
