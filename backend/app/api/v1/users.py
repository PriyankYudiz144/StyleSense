import secrets
import string
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_session, require_role
from app.core.security import hash_password
from app.models.salon import Salon
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserInvite, UserOut, UserUpdate
from app.services.email_service import EmailService

router = APIRouter()


@router.get("/me")
async def get_me(current_user: CurrentUser) -> UserOut:
    return UserOut.model_validate(current_user)


@router.get("")
async def list_users(
    current_user: Annotated[User, Depends(require_role(UserRole.salon_admin, UserRole.super_admin))],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[UserOut]:
    result = await db.execute(select(User).where(User.salon_id == current_user.salon_id))
    return [UserOut.model_validate(u) for u in result.scalars().all()]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(
    data: UserCreate,
    current_user: Annotated[User, Depends(require_role(UserRole.salon_admin, UserRole.super_admin))],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> UserOut:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(
        salon_id=current_user.salon_id,
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/{user_id}")
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    current_user: Annotated[User, Depends(require_role(UserRole.salon_admin, UserRole.super_admin))],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> UserOut:
    result = await db.execute(select(User).where(User.id == user_id, User.salon_id == current_user.salon_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    current_user: Annotated[User, Depends(require_role(UserRole.salon_admin, UserRole.super_admin))],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    result = await db.execute(select(User).where(User.id == user_id, User.salon_id == current_user.salon_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.delete(user)
    await db.commit()


@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_user(
    data: UserInvite,
    current_user: Annotated[User, Depends(require_role(UserRole.salon_admin, UserRole.super_admin))],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    alphabet = string.ascii_letters + string.digits
    temp_password = "".join(secrets.choice(alphabet) for _ in range(12))

    salon = (await db.execute(select(Salon).where(Salon.id == current_user.salon_id))).scalar_one_or_none()
    salon_name = salon.name if salon else "your salon"

    user = User(
        salon_id=current_user.salon_id,
        email=data.email,
        password_hash=hash_password(temp_password),
        full_name=data.full_name,
        role=data.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    await EmailService().send_invite(
        to_email=data.email,
        inviter_name=current_user.full_name,
        salon_name=salon_name,
        temp_password=temp_password,
    )

    return {"user": UserOut.model_validate(user).model_dump(), "temp_password": temp_password}
