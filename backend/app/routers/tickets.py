from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_admin
from app.models.user import User
from app.schemas.ticket import (
    AssignUpdate,
    StatusUpdate,
    TicketCreate,
    TicketDetailResponse,
    TicketResponse,
    TicketUpdate,
)
from app.schemas.comment import CommentCreate, CommentResponse
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _comment_response(comment) -> CommentResponse:
    return CommentResponse(
        id=comment.id,
        text=comment.text,
        created_at=comment.created_at,
        author_id=comment.author_id,
        author_display_name=comment.author.display_name,
    )


@router.get("", response_model=list[TicketResponse])
async def list_tickets(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    assigned_to_id: str | None = Query(None),
    category_id: str | None = Query(None),
    type_id: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return await ticket_service.get_tickets(
        db,
        status=status,
        priority=priority,
        assigned_to_id=assigned_to_id,
        category_id=category_id,
        type_id=type_id,
        search=search,
        archived=False,
        skip=skip,
        limit=limit,
    )


@router.get("/archived", response_model=list[TicketResponse])
async def list_archived(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return await ticket_service.get_tickets(db, archived=True, skip=skip, limit=limit)


@router.post("", response_model=TicketDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    body: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    return await ticket_service.create_ticket(db, body, current_user.id)


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> object:
    ticket = await ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketDetailResponse)
async def update_ticket(
    ticket_id: str,
    body: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    ticket = await ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return await ticket_service.update_ticket(db, ticket, body, current_user.id)


@router.patch("/{ticket_id}/status", response_model=TicketDetailResponse)
async def update_status(
    ticket_id: str,
    body: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    ticket = await ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return await ticket_service.update_status(db, ticket, body, current_user.id)


@router.patch("/{ticket_id}/assign", response_model=TicketDetailResponse)
async def assign_ticket(
    ticket_id: str,
    body: AssignUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> object:
    ticket = await ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return await ticket_service.assign_ticket(db, ticket, body, current_user.id)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
) -> None:
    ticket = await ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    await ticket_service.delete_ticket(db, ticket)


@router.get("/{ticket_id}/comments", response_model=list[CommentResponse])
async def get_comments(
    ticket_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    comments = await ticket_service.get_comments(db, ticket_id)
    return [_comment_response(c) for c in comments]


@router.post(
    "/{ticket_id}/comments",
    response_model=CommentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_comment(
    ticket_id: str,
    body: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentResponse:
    ticket = await ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    comment = await ticket_service.add_comment(db, ticket_id, current_user.id, body.text)
    return _comment_response(comment)
