import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TicketStatus(str, enum.Enum):
    neu = "neu"
    zugewiesen = "zugewiesen"
    in_bearbeitung = "in_bearbeitung"
    wartet_auf_rueckmeldung = "wartet_auf_rueckmeldung"
    erledigt = "erledigt"


class TicketPriority(str, enum.Enum):
    niedrig = "niedrig"
    mittel = "mittel"
    hoch = "hoch"
    kritisch = "kritisch"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return str(uuid.uuid4())


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_new_id)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus), nullable=False, default=TicketStatus.neu, index=True
    )
    priority: Mapped[TicketPriority] = mapped_column(
        Enum(TicketPriority), nullable=False, default=TicketPriority.mittel
    )
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    # Foreign keys
    created_by_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    assigned_to_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id"), index=True
    )
    category_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("categories.id")
    )
    type_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("ticket_types.id")
    )

    # Relationships
    created_by: Mapped["User"] = relationship("User", foreign_keys=[created_by_id])
    assigned_to: Mapped["User | None"] = relationship(
        "User", foreign_keys=[assigned_to_id]
    )
    category: Mapped["Category | None"] = relationship("Category")
    ticket_type: Mapped["TicketType | None"] = relationship("TicketType")
    comments: Mapped[list["Comment"]] = relationship(
        "Comment", back_populates="ticket", cascade="all, delete-orphan"
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(
        "AuditLog", back_populates="ticket", cascade="all, delete-orphan"
    )
