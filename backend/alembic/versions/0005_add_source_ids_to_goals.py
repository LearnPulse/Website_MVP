"""add source_ids to user_goals

Revision ID: 0005_add_source_ids_to_goals
Revises: 0003_drop_user_memory
Create Date: 2026-04-20
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "0005_add_source_ids_to_goals"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_goals",
        sa.Column("source_ids", JSONB, server_default=sa.text("'[]'::jsonb"), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("user_goals", "source_ids")
