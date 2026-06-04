import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.salon import SubscriptionTier


class SalonOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str
    address: str
    logo_url: str | None
    subscription_tier: SubscriptionTier
    ai_credits_remaining: int
    ai_credits_reset_at: datetime
    created_at: datetime
    updated_at: datetime


class SalonUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    address: str | None = None
    logo_url: str | None = None


class CreditsOut(BaseModel):
    ai_credits_remaining: int
    ai_credits_reset_at: datetime
    subscription_tier: SubscriptionTier
