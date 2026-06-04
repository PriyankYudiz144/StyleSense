from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import CurrentUser, get_session
from app.models.customer import Customer
from app.models.hairstyle import Hairstyle
from app.models.session import Session, SessionStatus
from app.models.user import User

router = APIRouter()


@router.get("/stats")
async def get_stats(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    customers = (
        await db.execute(select(func.count(Customer.id)).where(Customer.salon_id == current_user.salon_id))
    ).scalar() or 0
    sessions = (
        await db.execute(select(func.count(Session.id)).where(Session.salon_id == current_user.salon_id))
    ).scalar() or 0
    completed = (
        await db.execute(
            select(func.count(Session.id)).where(
                Session.salon_id == current_user.salon_id,
                Session.status == SessionStatus.completed,
            )
        )
    ).scalar() or 0
    # AI credits from salon
    from app.models.salon import Salon
    salon = (await db.execute(select(Salon).where(Salon.id == current_user.salon_id))).scalar_one_or_none()
    return {
        "total_customers": customers,
        "total_sessions": sessions,
        "completed_sessions": completed,
        "ai_credits_remaining": salon.ai_credits_remaining if salon else 0,
    }


@router.get("/recent-sessions")
async def recent_sessions(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[dict]:
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.customer), selectinload(Session.barber))
        .where(Session.salon_id == current_user.salon_id)
        .order_by(Session.created_at.desc())
        .limit(10)
    )
    sessions = result.scalars().all()
    return [
        {
            "id": str(s.id),
            "status": s.status,
            "customer_name": s.customer.full_name if s.customer else "Walk-in",
            "barber_name": s.barber.full_name if s.barber else "",
            "original_photo_url": s.original_photo_url,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.get("/popular-styles")
async def popular_styles(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[dict]:
    result = await db.execute(
        select(Hairstyle.style_name, func.count(Hairstyle.id).label("count"))
        .join(Session, Hairstyle.session_id == Session.id)
        .where(Session.salon_id == current_user.salon_id, Hairstyle.is_selected == True)  # noqa: E712
        .group_by(Hairstyle.style_name)
        .order_by(func.count(Hairstyle.id).desc())
        .limit(8)
    )
    rows = result.all()
    total = sum(r.count for r in rows) or 1
    return [
        {"style_name": r.style_name, "count": r.count, "pct": round(r.count / total * 100)}
        for r in rows
    ]
