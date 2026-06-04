import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class GenerationStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class AIGenerationLog(Base):
    __tablename__ = "ai_generations_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    salon_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("salons.id"), nullable=False, index=True)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String, nullable=False, default="openai")
    cost_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    status: Mapped[GenerationStatus] = mapped_column(Enum(GenerationStatus), nullable=False, default=GenerationStatus.pending)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
