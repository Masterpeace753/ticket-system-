from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import Base
from app.dependencies import get_db, get_current_user, require_admin
from app.models.category import Category, TicketType
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryResponse,
    TicketTypeCreate,
    TicketTypeResponse,
)

router = APIRouter(tags=["categories"])


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    result = await db.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Category:
    cat = Category(name=body.name)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=CategoryResponse)
async def update_category(
    cat_id: str,
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> Category:
    cat = await db.get(Category, cat_id)
    if cat is None:
        raise HTTPException(status_code=404, detail="Category not found")
    cat.name = body.name
    await db.commit()
    await db.refresh(cat)
    return cat


# ── Ticket Types ──────────────────────────────────────────────────────────────

@router.get("/types", response_model=list[TicketTypeResponse])
async def list_types(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    result = await db.execute(select(TicketType).order_by(TicketType.name))
    return list(result.scalars().all())


@router.post(
    "/types",
    response_model=TicketTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_type(
    body: TicketTypeCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> TicketType:
    t = TicketType(name=body.name)
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return t


@router.put("/types/{type_id}", response_model=TicketTypeResponse)
async def update_type(
    type_id: str,
    body: TicketTypeCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> TicketType:
    t = await db.get(TicketType, type_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Type not found")
    t.name = body.name
    await db.commit()
    await db.refresh(t)
    return t
