import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SessionStatus(str, enum.Enum):
    in_progress = "in_progress"
    completed = "completed"
    abandoned = "abandoned"


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    salon_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("salons.id"), nullable=False, index=True)
    barber_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    customer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True, index=True)
    original_photo_url: Mapped[str] = mapped_column(String, nullable=False)
    face_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    status: Mapped[SessionStatus] = mapped_column(Enum(SessionStatus), nullable=False, default=SessionStatus.in_progress)
    selected_hairstyle_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("hairstyles.id"), nullable=True)
    final_result_photo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    salon: Mapped["Salon"] = relationship("Salon", back_populates="sessions")  # type: ignore[name-defined]
    barber: Mapped["User"] = relationship("User", back_populates="sessions")  # type: ignore[name-defined]
    customer: Mapped["Customer | None"] = relationship("Customer", back_populates="sessions")  # type: ignore[name-defined]
    hairstyles: Mapped[list["Hairstyle"]] = relationship("Hairstyle", back_populates="session", foreign_keys="[Hairstyle.session_id]")  # type: ignore[name-defined]
