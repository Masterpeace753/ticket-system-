from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.ticket import Ticket
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/by-status")
async def by_status(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    result = await db.execute(
        select(Ticket.status, func.count(Ticket.id))
        .where(Ticket.is_archived == False)  # noqa: E712
        .group_by(Ticket.status)
    )
    return [{"status": row[0], "count": row[1]} for row in result.all()]


@router.get("/by-assignee")
async def by_assignee(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    result = await db.execute(
        select(User.display_name, func.count(Ticket.id))
        .join(User, Ticket.assigned_to_id == User.id, isouter=True)
        .where(Ticket.is_archived == False)  # noqa: E712
        .group_by(User.display_name)
    )
    return [{"assignee": row[0] or "Unassigned", "count": row[1]} for row in result.all()]


@router.get("/by-priority")
async def by_priority(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    result = await db.execute(
        select(Ticket.priority, func.count(Ticket.id))
        .where(Ticket.is_archived == False)  # noqa: E712
        .group_by(Ticket.priority)
    )
    return [{"priority": row[0], "count": row[1]} for row in result.all()]


@router.get("/by-category")
async def by_category(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[dict]:
    from app.models.category import Category

    result = await db.execute(
        select(Category.name, func.count(Ticket.id))
        .join(Category, Ticket.category_id == Category.id, isouter=True)
        .where(Ticket.is_archived == False)  # noqa: E712
        .group_by(Category.name)
    )
    return [{"category": row[0] or "None", "count": row[1]} for row in result.all()]
