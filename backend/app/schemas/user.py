import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    salon_id: uuid.UUID | None
    email: EmailStr
    full_name: str
    role: UserRole
    avatar_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.barber


class UserUpdate(BaseModel):
    full_name: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None


class UserInvite(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.barber
