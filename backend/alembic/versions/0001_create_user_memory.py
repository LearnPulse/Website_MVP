"""create user_memory table

Revision ID: 0001_create_user_memory
Revises: 
Create Date: 2026-02-05
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_create_user_memory"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_memory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("goals", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("mastery_history", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"))
    )
    op.create_index("ix_user_memory_user_id", "user_memory", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_user_memory_user_id", table_name="user_memory")
    op.drop_table("user_memory")
