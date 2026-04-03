"""drop user_memory table

Revision ID: 0003_drop_user_memory
Revises: 0002_new_schema
Create Date: 2026-04-03

Run this ONLY after verifying the new auth + mastery flow works end-to-end.
"""

from alembic import op

revision = "0003_drop_user_memory"
down_revision = "0002_new_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_index("ix_user_memory_user_id", table_name="user_memory")
    op.drop_table("user_memory")


def downgrade() -> None:
    import sqlalchemy as sa
    from sqlalchemy.dialects import postgresql
    op.create_table(
        "user_memory",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.String(length=128), nullable=False),
        sa.Column("goals", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("mastery_history", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_user_memory_user_id", "user_memory", ["user_id"], unique=True)
