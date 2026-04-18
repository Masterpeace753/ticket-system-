from datetime import datetime

from pydantic import BaseModel

from app.models.ticket import TicketPriority, TicketStatus
from app.schemas.user import UserResponse


class CategoryRef(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}


class TicketBase(BaseModel):
    title: str
    description: str | None = None
    priority: TicketPriority = TicketPriority.mittel
    due_date: datetime | None = None
    assigned_to_id: str | None = None
    category_id: str | None = None
    type_id: str | None = None


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: TicketPriority | None = None
    due_date: datetime | None = None
    assigned_to_id: str | None = None
    category_id: str | None = None
    type_id: str | None = None


class StatusUpdate(BaseModel):
    status: TicketStatus


class AssignUpdate(BaseModel):
    assigned_to_id: str | None = None


class AuditLogResponse(BaseModel):
    id: str
    field_name: str
    old_value: str | None
    new_value: str | None
    changed_at: datetime
    changed_by: UserResponse

    model_config = {"from_attributes": True}


class TicketResponse(BaseModel):
    id: str
    title: str
    description: str | None
    status: TicketStatus
    priority: TicketPriority
    is_archived: bool
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime
    created_by: UserResponse
    assigned_to: UserResponse | None
    category: CategoryRef | None
    ticket_type: CategoryRef | None

    model_config = {"from_attributes": True}


class TicketDetailResponse(TicketResponse):
    audit_logs: list[AuditLogResponse] = []
