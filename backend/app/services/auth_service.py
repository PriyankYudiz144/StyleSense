import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, create_refresh_token, create_reset_token, decode_token, hash_password, verify_password
from app.services.email_service import EmailService
from app.models.salon import Salon, SubscriptionTier
from app.models.user import User, UserRole
from app.schemas.auth import RegisterSalonRequest, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register_salon(self, data: RegisterSalonRequest) -> tuple[User, TokenResponse]:
        existing = await self.db.execute(select(User).where(User.email == data.admin.email))
        if existing.scalar_one_or_none():
            raise ValueError("Email already registered")

        salon = Salon(
            name=data.salon.name,
            email=data.salon.email,
            phone=data.salon.phone,
            address=data.salon.address,
            subscription_tier=SubscriptionTier.trial,
            ai_credits_remaining=3000,
        )
        self.db.add(salon)
        await self.db.flush()

        loop = asyncio.get_running_loop()
        pw_hash = await loop.run_in_executor(None, hash_password, data.admin.password)
        user = User(
            salon_id=salon.id,
            email=data.admin.email,
            password_hash=pw_hash,
            full_name=data.admin.full_name,
            role=UserRole.salon_admin,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user, TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )

    async def login(self, email: str, password: str) -> tuple[User, TokenResponse]:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        loop = asyncio.get_running_loop()
        pw_ok = user and await loop.run_in_executor(None, verify_password, password, user.password_hash)
        if not pw_ok:
            raise ValueError("Invalid credentials")
        if not user.is_active:
            raise ValueError("Account disabled")
        return user, TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )

    async def forgot_password(self, email: str) -> str | None:
        from app.core.config import settings as _settings
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            return None
        token = create_reset_token(user.id)
        reset_link = f"{_settings.frontend_url}/reset-password?token={token}"
        await EmailService().send_reset_password(email, reset_link)
        return token

    async def reset_password(self, token: str, new_password: str) -> None:
        payload = decode_token(token)
        if payload.get("type") != "reset":
            raise ValueError("Invalid token type")
        result = await self.db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found")
        loop = asyncio.get_running_loop()
        user.password_hash = await loop.run_in_executor(None, hash_password, new_password)
        await self.db.commit()

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")
        result = await self.db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found")
        return TokenResponse(
            access_token=create_access_token(user.id),
            refresh_token=create_refresh_token(user.id),
        )
