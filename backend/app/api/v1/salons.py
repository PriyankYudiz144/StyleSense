from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_session, require_role
from app.models.salon import Salon
from app.models.user import User, UserRole
from app.schemas.salon import CreditsOut, SalonOut, SalonUpdate

router = APIRouter()


@router.get("/me")
async def get_my_salon(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SalonOut:
    if not current_user.salon_id:
        raise HTTPException(status_code=404, detail="No salon associated")
    result = await db.execute(select(Salon).where(Salon.id == current_user.salon_id))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    return SalonOut.model_validate(salon)


@router.patch("/me")
async def update_my_salon(
    data: SalonUpdate,
    current_user: Annotated[User, Depends(require_role(UserRole.salon_admin, UserRole.super_admin))],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SalonOut:
    if not current_user.salon_id:
        raise HTTPException(status_code=404, detail="No salon associated")
    result = await db.execute(select(Salon).where(Salon.id == current_user.salon_id))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(salon, field, value)
    await db.commit()
    await db.refresh(salon)
    return SalonOut.model_validate(salon)


@router.get("/me/credits")
async def get_credits(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> CreditsOut:
    if not current_user.salon_id:
        raise HTTPException(status_code=404, detail="No salon associated")
    result = await db.execute(select(Salon).where(Salon.id == current_user.salon_id))
    salon = result.scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    return CreditsOut(
        ai_credits_remaining=salon.ai_credits_remaining,
        ai_credits_reset_at=salon.ai_credits_reset_at,
        subscription_tier=salon.subscription_tier,
    )
