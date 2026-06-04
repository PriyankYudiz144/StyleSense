import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.session import SessionStatus


class HairstyleOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    session_id: uuid.UUID
    preview_url: str
    style_name: str
    style_tags: list[str]
    ai_metadata: dict[str, Any]
    is_selected: bool
    created_at: datetime


class SessionCreate(BaseModel):
    customer_id: uuid.UUID | None = None
    original_photo_url: str


class SessionOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    salon_id: uuid.UUID
    barber_id: uuid.UUID
    customer_id: uuid.UUID | None
    original_photo_url: str
    face_analysis: dict[str, Any] | None
    status: SessionStatus
    selected_hairstyle_id: uuid.UUID | None
    final_result_photo_url: str | None
    hairstyles: list[HairstyleOut] = []
    created_at: datetime
    updated_at: datetime


class SessionUpdate(BaseModel):
    status: SessionStatus | None = None
    final_result_photo_url: str | None = None
