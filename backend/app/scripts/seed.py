"""Seed: 1 super_admin, 1 demo salon, 1 salon_admin, 2 barbers, 5 customers."""
import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models.customer import Customer
from app.models.salon import Salon, SubscriptionTier
from app.models.user import User, UserRole


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.email == "admin@demo-salon.com"))
        if existing.scalar_one_or_none():
            print("Seed already applied.")
            return

        super_admin = User(
            email="superadmin@stylesense.app",
            password_hash=hash_password("super1234"),
            full_name="Super Admin",
            role=UserRole.super_admin,
            salon_id=None,
        )
        db.add(super_admin)

        salon = Salon(
            name="Demo Salon",
            email="contact@demo-salon.com",
            phone="+1-555-0100",
            address="123 Style Street, Hairtown, HT 10001",
            subscription_tier=SubscriptionTier.pro,
            ai_credits_remaining=500,
            ai_credits_reset_at=datetime(2025, 12, 31, tzinfo=timezone.utc),
        )
        db.add(salon)
        await db.flush()

        db.add_all([
            User(salon_id=salon.id, email="admin@demo-salon.com", password_hash=hash_password("demo1234"), full_name="Alex Chen", role=UserRole.salon_admin),
            User(salon_id=salon.id, email="barber1@demo-salon.com", password_hash=hash_password("demo1234"), full_name="Sam Lee", role=UserRole.barber),
            User(salon_id=salon.id, email="barber2@demo-salon.com", password_hash=hash_password("demo1234"), full_name="Jordan Martinez", role=UserRole.barber),
            Customer(salon_id=salon.id, full_name="James Wilson", phone="+1-555-0201"),
            Customer(salon_id=salon.id, full_name="Marcus Brown", phone="+1-555-0202"),
            Customer(salon_id=salon.id, full_name="David Kim", phone="+1-555-0203"),
            Customer(salon_id=salon.id, full_name="Tyler Scott", phone="+1-555-0204"),
            Customer(salon_id=salon.id, full_name="Ryan Carter", phone="+1-555-0205"),
        ])
        await db.commit()
        print("Seed complete. Login: admin@demo-salon.com / demo1234")


if __name__ == "__main__":
    asyncio.run(seed())
