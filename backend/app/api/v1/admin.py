"""Admin-only endpoints — requires super_admin role."""
from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_session, require_role
from app.core.security import hash_password
from app.models.customer import Customer
from app.models.salon import Salon, SubscriptionTier
from app.models.session import Session, SessionStatus
from app.models.user import User, UserRole

router = APIRouter()

SuperAdmin = Depends(require_role(UserRole.super_admin))


# ── Schemas ─────────────────────────────────────────────────────────────────

class SalonCreateAdmin(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    subscription_tier: SubscriptionTier = SubscriptionTier.trial
    ai_credits: int = 3000
    # Creates a salon_admin user automatically
    admin_email: EmailStr
    admin_name: str
    admin_password: str


class SalonUpdateAdmin(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    subscription_tier: SubscriptionTier | None = None
    ai_credits_remaining: int | None = None
    is_active: bool | None = None  # stored on users; for salon suspend we deactivate all users


class SalonAdminOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    name: str
    email: str
    phone: str
    address: str
    subscription_tier: SubscriptionTier
    ai_credits_remaining: int
    created_at: datetime
    # aggregates
    user_count: int = 0
    session_count: int = 0
    completed_sessions: int = 0
    status: str = "active"  # "active" | "pending" | "suspended"


# ── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def admin_stats(
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_salons = (await db.execute(select(func.count(Salon.id)))).scalar() or 0
    total_stylists = (
        await db.execute(select(func.count(User.id)).where(User.role == UserRole.barber, User.is_active == True))  # noqa: E712
    ).scalar() or 0
    total_customers = (await db.execute(select(func.count(Customer.id)))).scalar() or 0
    monthly_sessions = (
        await db.execute(
            select(func.count(Session.id)).where(Session.created_at >= month_start)
        )
    ).scalar() or 0
    completed_sessions = (
        await db.execute(
            select(func.count(Session.id)).where(
                Session.status == SessionStatus.completed,
                Session.created_at >= month_start,
            )
        )
    ).scalar() or 0

    # Previous month for growth calc
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    prev_customers = (
        await db.execute(
            select(func.count(Customer.id)).where(Customer.created_at < month_start, Customer.created_at >= prev_month_start)
        )
    ).scalar() or 0
    this_month_customers = (
        await db.execute(select(func.count(Customer.id)).where(Customer.created_at >= month_start))
    ).scalar() or 0

    return {
        "total_salons": total_salons,
        "total_stylists": total_stylists,
        "total_customers": total_customers,
        "monthly_sessions": monthly_sessions,
        "completed_sessions": completed_sessions,
        "new_clients_this_month": this_month_customers,
        "new_clients_last_month": prev_customers,
    }


# ── Salons CRUD ───────────────────────────────────────────────────────────────

@router.get("/salons")
async def list_salons(
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[dict]:
    salons = (await db.execute(select(Salon).order_by(Salon.created_at.desc()))).scalars().all()

    result = []
    for salon in salons:
        user_count = (
            await db.execute(select(func.count(User.id)).where(User.salon_id == salon.id))
        ).scalar() or 0
        session_count = (
            await db.execute(select(func.count(Session.id)).where(Session.salon_id == salon.id))
        ).scalar() or 0
        completed = (
            await db.execute(
                select(func.count(Session.id)).where(
                    Session.salon_id == salon.id,
                    Session.status == SessionStatus.completed,
                )
            )
        ).scalar() or 0
        # Determine status: no users → pending, all users inactive → suspended, else active
        active_users = (
            await db.execute(
                select(func.count(User.id)).where(User.salon_id == salon.id, User.is_active == True)  # noqa: E712
            )
        ).scalar() or 0
        if user_count == 0:
            salon_status = "pending"
        elif active_users == 0:
            salon_status = "suspended"
        else:
            salon_status = "active"

        result.append({
            "id": str(salon.id),
            "name": salon.name,
            "email": salon.email,
            "phone": salon.phone,
            "address": salon.address,
            "subscription_tier": salon.subscription_tier,
            "ai_credits_remaining": salon.ai_credits_remaining,
            "created_at": salon.created_at.isoformat(),
            "user_count": user_count,
            "session_count": session_count,
            "completed_sessions": completed,
            "status": salon_status,
        })
    return result


@router.post("/salons", status_code=status.HTTP_201_CREATED)
async def create_salon(
    data: SalonCreateAdmin,
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    # Check email uniqueness
    existing = (await db.execute(select(Salon).where(Salon.email == data.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Salon email already registered")

    salon = Salon(
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        subscription_tier=data.subscription_tier,
        ai_credits_remaining=data.ai_credits,
    )
    db.add(salon)
    await db.flush()  # get salon.id

    # Create salon_admin user
    user_existing = (await db.execute(select(User).where(User.email == data.admin_email))).scalar_one_or_none()
    if user_existing:
        raise HTTPException(status_code=400, detail="Admin email already registered")

    admin_user = User(
        salon_id=salon.id,
        email=data.admin_email,
        full_name=data.admin_name,
        password_hash=hash_password(data.admin_password),
        role=UserRole.salon_admin,
        is_active=True,
    )
    db.add(admin_user)
    await db.commit()
    await db.refresh(salon)

    return {"id": str(salon.id), "name": salon.name, "message": "Salon created"}


@router.patch("/salons/{salon_id}")
async def update_salon(
    salon_id: UUID,
    data: SalonUpdateAdmin,
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    salon = (await db.execute(select(Salon).where(Salon.id == salon_id))).scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")

    for field, value in data.model_dump(exclude_none=True).items():
        if field == "is_active":
            # Activate/deactivate all users in this salon
            users = (await db.execute(select(User).where(User.salon_id == salon_id))).scalars().all()
            for u in users:
                u.is_active = value
        else:
            setattr(salon, field, value)

    await db.commit()
    return {"id": str(salon.id), "name": salon.name}


@router.delete("/salons/{salon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_salon(
    salon_id: UUID,
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> None:
    salon = (await db.execute(select(Salon).where(Salon.id == salon_id))).scalar_one_or_none()
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    await db.delete(salon)
    await db.commit()


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
async def admin_analytics(
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    now = datetime.now(timezone.utc)

    # Sessions per day for last 7 days
    daily = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            await db.execute(
                select(func.count(Session.id)).where(
                    Session.created_at >= day_start,
                    Session.created_at < day_end,
                )
            )
        ).scalar() or 0
        completed = (
            await db.execute(
                select(func.count(Session.id)).where(
                    Session.created_at >= day_start,
                    Session.created_at < day_end,
                    Session.status == SessionStatus.completed,
                )
            )
        ).scalar() or 0
        daily.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day": day_start.strftime("%a"),
            "total": count,
            "completed": completed,
        })

    # Popular styles across all salons
    from app.models.hairstyle import Hairstyle
    style_rows = (
        await db.execute(
            select(Hairstyle.style_name, func.count(Hairstyle.id).label("cnt"))
            .where(Hairstyle.is_selected == True)  # noqa: E712
            .group_by(Hairstyle.style_name)
            .order_by(func.count(Hairstyle.id).desc())
            .limit(6)
        )
    ).all()
    total_styles = sum(r.cnt for r in style_rows) or 1
    popular_styles = [
        {"style_name": r.style_name, "count": r.cnt, "pct": round(r.cnt / total_styles * 100)}
        for r in style_rows
    ]

    # Subscription tier breakdown
    tier_rows = (
        await db.execute(
            select(Salon.subscription_tier, func.count(Salon.id).label("cnt"))
            .group_by(Salon.subscription_tier)
        )
    ).all()
    tier_breakdown = [{"tier": r.subscription_tier, "count": r.cnt} for r in tier_rows]

    return {
        "daily_sessions": daily,
        "popular_styles": popular_styles,
        "tier_breakdown": tier_breakdown,
    }


# ── Recent Activities ─────────────────────────────────────────────────────────

@router.get("/activities")
async def admin_activities(
    _: Annotated[User, SuperAdmin],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[dict]:
    activities: list[dict] = []

    # New salons (last 30 days)
    new_salons = (
        await db.execute(
            select(Salon)
            .where(Salon.created_at >= datetime.now(timezone.utc) - timedelta(days=30))
            .order_by(Salon.created_at.desc())
            .limit(5)
        )
    ).scalars().all()
    for s in new_salons:
        activities.append({
            "type": "new_salon",
            "title": s.name,
            "desc": f"New salon onboarded — {s.address}",
            "time": s.created_at.isoformat(),
        })

    # New users (barbers/admins, last 30 days)
    new_users = (
        await db.execute(
            select(User)
            .where(
                User.created_at >= datetime.now(timezone.utc) - timedelta(days=30),
                User.role != UserRole.super_admin,
            )
            .order_by(User.created_at.desc())
            .limit(5)
        )
    ).scalars().all()
    for u in new_users:
        activities.append({
            "type": "new_user",
            "title": u.full_name,
            "desc": f"New {u.role.replace('_', ' ')} joined the platform",
            "time": u.created_at.isoformat(),
        })

    # Sort all by time desc, take top 10
    activities.sort(key=lambda x: x["time"], reverse=True)
    return activities[:10]
