"""create users, user_goals, user_concepts, user_preferences

Revision ID: 0002_new_schema
Revises: 0001_create_user_memory
Create Date: 2026-04-03
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_new_schema"
down_revision = "0001_create_user_memory"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("google_sub", sa.Text(), nullable=False, unique=True),
        sa.Column("display_name", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    op.create_table(
        "user_goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("goal_text", sa.Text(), nullable=False),
        sa.Column("target_concept_id", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    op.create_table(
        "user_concepts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("concept_id", sa.Text(), nullable=False),
        sa.Column("mastery_score", sa.Integer(), server_default="0"),
        sa.Column("review_count", sa.Integer(), server_default="0"),
        sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("user_id", "concept_id", name="uq_user_concept"),
    )

    op.create_table(
        "user_preferences",
        sa.Column("user_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("preferred_formats", postgresql.JSONB(), server_default='["cheatsheet"]'),
        sa.Column("detail_level", sa.Text(), server_default="'concise'"),
        sa.Column("session_length", sa.Text(), server_default="'micro'"),
    )


def downgrade() -> None:
    op.drop_table("user_preferences")
    op.drop_table("user_concepts")
    op.drop_table("user_goals")
    op.drop_table("users")
