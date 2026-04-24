"""add knowledge graph table (no-op — table lives in graph.json)

Revision ID: 0004
Revises: 0003_drop_user_memory
Create Date: 2026-04-10
"""

from alembic import op

revision = "0004"
down_revision = "0003_drop_user_memory"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
