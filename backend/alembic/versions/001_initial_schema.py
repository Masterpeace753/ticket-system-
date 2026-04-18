"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-04-19

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("username", sa.String(100), nullable=False, unique=True),
        sa.Column("display_name", sa.String(200), nullable=False),
        sa.Column("email", sa.String(255), nullable=True, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, default=True),
        sa.Column("is_admin", sa.Boolean, nullable=False, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"])

    # categories
    op.create_table(
        "categories",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
    )

    # ticket_types
    op.create_table(
        "ticket_types",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
    )

    # tickets
    op.create_table(
        "tickets",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "neu",
                "zugewiesen",
                "in_bearbeitung",
                "wartet_auf_rueckmeldung",
                "erledigt",
                name="ticketstatus",
            ),
            nullable=False,
        ),
        sa.Column(
            "priority",
            sa.Enum("niedrig", "mittel", "hoch", "kritisch", name="ticketpriority"),
            nullable=False,
        ),
        sa.Column("is_archived", sa.Boolean, nullable=False, default=False),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("assigned_to_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("category_id", sa.String(36), sa.ForeignKey("categories.id"), nullable=True),
        sa.Column("type_id", sa.String(36), sa.ForeignKey("ticket_types.id"), nullable=True),
    )
    op.create_index("ix_tickets_status", "tickets", ["status"])
    op.create_index("ix_tickets_assigned_to_id", "tickets", ["assigned_to_id"])
    op.create_index("ix_tickets_due_date", "tickets", ["due_date"])

    # comments
    op.create_table(
        "comments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("ticket_id", sa.String(36), sa.ForeignKey("tickets.id"), nullable=False),
        sa.Column("author_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_comments_ticket_id", "comments", ["ticket_id"])

    # audit_log
    op.create_table(
        "audit_log",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("ticket_id", sa.String(36), sa.ForeignKey("tickets.id"), nullable=False),
        sa.Column("changed_by_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("field_name", sa.String(100), nullable=False),
        sa.Column("old_value", sa.Text, nullable=True),
        sa.Column("new_value", sa.Text, nullable=True),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_audit_log_ticket_id", "audit_log", ["ticket_id"])

    # Seed: admin user (password: changeme_admin — bcrypt hash)
    op.execute(
        """
        INSERT INTO users (id, username, display_name, password_hash, is_active, is_admin, created_at)
        VALUES (
            'a0000000-0000-0000-0000-000000000001',
            'admin',
            'Administrator',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCjAfozXjIg3dEpRTUB3y8C',
            TRUE,
            TRUE,
            NOW()
        )
        ON CONFLICT DO NOTHING
        """
    )


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_table("comments")
    op.drop_table("tickets")
    op.drop_table("ticket_types")
    op.drop_table("categories")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS ticketstatus")
    op.execute("DROP TYPE IF EXISTS ticketpriority")
