import uuid
from datetime import datetime

from pydantic import BaseModel


class CustomerCreate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    notes: str | None = None


class CustomerOut(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    salon_id: uuid.UUID
    full_name: str | None
    phone: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class CustomerUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    notes: str | None = None
