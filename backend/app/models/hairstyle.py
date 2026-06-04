import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Hairstyle(Base):
    __tablename__ = "hairstyles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False, index=True)
    preview_url: Mapped[str] = mapped_column(String, nullable=False)
    style_name: Mapped[str] = mapped_column(String, nullable=False)
    style_tags: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    ai_metadata: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_selected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    session: Mapped["Session"] = relationship("Session", back_populates="hairstyles", foreign_keys=[session_id])  # type: ignore[name-defined]
