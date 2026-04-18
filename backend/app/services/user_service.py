from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.services.auth_service import hash_password
from app.schemas.user import UserCreate, UserUpdate


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    user = User(
        username=data.username,
        display_name=data.display_name,
        email=data.email,
        password_hash=hash_password(data.password),
        is_admin=data.is_admin,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User).order_by(User.display_name))
    return list(result.scalars().all())


async def get_user(db: AsyncSession, user_id: str) -> User | None:
    return await db.get(User, user_id)


async def update_user(db: AsyncSession, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return user


async def deactivate_user(db: AsyncSession, user: User) -> User:
    user.is_active = False
    await db.commit()
    await db.refresh(user)
    return user
