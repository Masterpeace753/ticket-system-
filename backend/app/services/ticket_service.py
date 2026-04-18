from datetime import datetime
from typing import Any

from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ticket import Ticket, TicketStatus
from app.models.comment import Comment
from app.schemas.ticket import TicketCreate, TicketUpdate, StatusUpdate, AssignUpdate
from app.services import audit_service


def _ticket_options():
    return [
        selectinload(Ticket.created_by),
        selectinload(Ticket.assigned_to),
        selectinload(Ticket.category),
        selectinload(Ticket.ticket_type),
        selectinload(Ticket.audit_logs).selectinload(
            __import__("app.models.audit_log", fromlist=["AuditLog"]).AuditLog.changed_by
        ),
    ]


async def get_tickets(
    db: AsyncSession,
    *,
    status: str | None = None,
    priority: str | None = None,
    assigned_to_id: str | None = None,
    category_id: str | None = None,
    type_id: str | None = None,
    search: str | None = None,
    archived: bool = False,
    skip: int = 0,
    limit: int = 50,
) -> list[Ticket]:
    q = select(Ticket).options(*_ticket_options()).where(Ticket.is_archived == archived)

    if status:
        q = q.where(Ticket.status == status)
    if priority:
        q = q.where(Ticket.priority == priority)
    if assigned_to_id:
        q = q.where(Ticket.assigned_to_id == assigned_to_id)
    if category_id:
        q = q.where(Ticket.category_id == category_id)
    if type_id:
        q = q.where(Ticket.type_id == type_id)
    if search:
        term = f"%{search}%"
        q = q.where(or_(Ticket.title.ilike(term), Ticket.description.ilike(term)))

    q = q.order_by(Ticket.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


async def get_ticket(db: AsyncSession, ticket_id: str) -> Ticket | None:
    q = select(Ticket).options(*_ticket_options()).where(Ticket.id == ticket_id)
    result = await db.execute(q)
    return result.scalar_one_or_none()


async def create_ticket(
    db: AsyncSession, data: TicketCreate, created_by_id: str
) -> Ticket:
    ticket = Ticket(**data.model_dump(), created_by_id=created_by_id)
    db.add(ticket)
    await db.flush()  # get id before audit
    await audit_service.log_change(
        db, ticket.id, created_by_id, "created", None, ticket.title
    )
    await db.commit()
    await db.refresh(ticket)
    return await get_ticket(db, ticket.id)  # type: ignore[return-value]


async def update_ticket(
    db: AsyncSession, ticket: Ticket, data: TicketUpdate, user_id: str
) -> Ticket:
    updates = data.model_dump(exclude_unset=True)
    for field, new_val in updates.items():
        old_val = getattr(ticket, field)
        if old_val != new_val:
            await audit_service.log_change(
                db, ticket.id, user_id, field, str(old_val), str(new_val)
            )
            setattr(ticket, field, new_val)
    ticket.updated_at = datetime.utcnow()
    await db.commit()
    return await get_ticket(db, ticket.id)  # type: ignore[return-value]


async def update_status(
    db: AsyncSession, ticket: Ticket, data: StatusUpdate, user_id: str
) -> Ticket:
    old_status = ticket.status
    ticket.status = data.status
    if data.status == TicketStatus.erledigt:
        ticket.is_archived = True
    await audit_service.log_change(
        db, ticket.id, user_id, "status", old_status, data.status
    )
    await db.commit()
    return await get_ticket(db, ticket.id)  # type: ignore[return-value]


async def assign_ticket(
    db: AsyncSession, ticket: Ticket, data: AssignUpdate, user_id: str
) -> Ticket:
    old = ticket.assigned_to_id
    ticket.assigned_to_id = data.assigned_to_id
    if ticket.status == TicketStatus.neu and data.assigned_to_id:
        ticket.status = TicketStatus.zugewiesen
    await audit_service.log_change(
        db, ticket.id, user_id, "assigned_to_id", old, data.assigned_to_id
    )
    await db.commit()
    return await get_ticket(db, ticket.id)  # type: ignore[return-value]


async def delete_ticket(db: AsyncSession, ticket: Ticket) -> None:
    await db.delete(ticket)
    await db.commit()


async def add_comment(
    db: AsyncSession, ticket_id: str, author_id: str, text: str
) -> Comment:
    comment = Comment(ticket_id=ticket_id, author_id=author_id, text=text)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    # eager-load author
    from sqlalchemy.orm import selectinload
    from app.models.user import User

    q = (
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.id == comment.id)
    )
    result = await db.execute(q)
    return result.scalar_one()


async def get_comments(db: AsyncSession, ticket_id: str) -> list[Comment]:
    from sqlalchemy.orm import selectinload

    q = (
        select(Comment)
        .options(selectinload(Comment.author))
        .where(Comment.ticket_id == ticket_id)
        .order_by(Comment.created_at.asc())
    )
    result = await db.execute(q)
    return list(result.scalars().all())
