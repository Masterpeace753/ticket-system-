from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    display_name: str
    email: EmailStr | None = None


class UserCreate(UserBase):
    password: str
    is_admin: bool = False


class UserUpdate(BaseModel):
    display_name: str | None = None
    email: EmailStr | None = None
    is_admin: bool | None = None


class UserResponse(UserBase):
    id: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}
