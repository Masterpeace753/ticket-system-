from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


async def log_change(
    db: AsyncSession,
    ticket_id: str,
    changed_by_id: str,
    field_name: str,
    old_value: str | None,
    new_value: str | None,
) -> None:
    entry = AuditLog(
        ticket_id=ticket_id,
        changed_by_id=changed_by_id,
        field_name=field_name,
        old_value=str(old_value) if old_value is not None else None,
        new_value=str(new_value) if new_value is not None else None,
    )
    db.add(entry)
