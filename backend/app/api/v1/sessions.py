from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.deps import CurrentUser, get_session
from app.models.ai_log import AIGenerationLog, GenerationStatus
from app.models.hairstyle import Hairstyle
from app.models.salon import Salon
from app.models.session import Session, SessionStatus
from app.schemas.session import HairstyleOut, SessionCreate, SessionOut, SessionUpdate
from app.services.ai_service import AIService

router = APIRouter()


async def _fetch_session(session_id: UUID, salon_id: UUID, db: AsyncSession) -> Session:
    """Fetch session with hairstyles eagerly loaded. Raises 404 if not found."""
    result = await db.execute(
        select(Session)
        .options(selectinload(Session.hairstyles))
        .where(Session.id == session_id, Session.salon_id == salon_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_session(
    data: SessionCreate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SessionOut:
    session = Session(
        salon_id=current_user.salon_id,
        barber_id=current_user.id,
        customer_id=data.customer_id,
        original_photo_url=data.original_photo_url,
    )
    db.add(session)
    await db.commit()
    return SessionOut.model_validate(
        await _fetch_session(session.id, current_user.salon_id, db)
    )


@router.get("/{session_id}")
async def get_session_detail(
    session_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SessionOut:
    return SessionOut.model_validate(
        await _fetch_session(session_id, current_user.salon_id, db)
    )


@router.post("/{session_id}/generate-hairstyles")
async def generate_hairstyles(
    session_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[HairstyleOut]:
    session = await _fetch_session(session_id, current_user.salon_id, db)

    salon_result = await db.execute(select(Salon).where(Salon.id == current_user.salon_id))
    salon = salon_result.scalar_one_or_none()
    if not salon or salon.ai_credits_remaining <= 0:
        raise HTTPException(status_code=402, detail="No AI credits remaining")

    log = AIGenerationLog(salon_id=current_user.salon_id, session_id=session_id, cost_credits=9)
    db.add(log)
    await db.flush()

    ai = AIService()
    try:
        if not settings.openai_api_key:
            previews = await ai.generate_mock_previews(9)
        else:
            previews = await ai.generate_all_previews(
                photo_url=session.original_photo_url or "",
            )
    except Exception as e:
        log.status = GenerationStatus.failed
        log.error_message = str(e)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"AI generation failed: {e}") from e

    hairstyles = [
        Hairstyle(
            session_id=session_id,
            preview_url=p["url"],
            style_name=p["style_name"],
            style_tags=p.get("style_tags", []),
            ai_metadata={"model": p.get("model"), "generation_time_ms": p.get("generation_time_ms")},
        )
        for p in previews
    ]
    db.add_all(hairstyles)
    salon.ai_credits_remaining -= len(hairstyles)
    log.status = GenerationStatus.success
    await db.commit()
    return [HairstyleOut.model_validate(h) for h in hairstyles]


@router.get("/{session_id}/hairstyles")
async def list_hairstyles(
    session_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> list[HairstyleOut]:
    result = await db.execute(select(Hairstyle).where(Hairstyle.session_id == session_id))
    return [HairstyleOut.model_validate(h) for h in result.scalars().all()]


@router.post("/{session_id}/select-hairstyle/{hairstyle_id}")
async def select_hairstyle(
    session_id: UUID,
    hairstyle_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SessionOut:
    session = await _fetch_session(session_id, current_user.salon_id, db)
    await db.execute(update(Hairstyle).where(Hairstyle.session_id == session_id).values(is_selected=False))
    await db.execute(update(Hairstyle).where(Hairstyle.id == hairstyle_id).values(is_selected=True))
    session.selected_hairstyle_id = hairstyle_id
    await db.commit()
    return SessionOut.model_validate(
        await _fetch_session(session_id, current_user.salon_id, db)
    )


@router.post("/{session_id}/analyze-face")
async def analyze_face(
    session_id: UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    result = await db.execute(
        select(Session).where(Session.id == session_id, Session.salon_id == current_user.salon_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    ai = AIService()
    if settings.openai_api_key:
        analysis = await ai.analyze_face(session.original_photo_url)
    else:
        analysis = {
            "face_shape": "oval",
            "hair_texture": "straight",
            "hair_length": "medium",
            "hair_color": "dark brown",
            "age_group": "adult",
            "recommended_styles": ["Modern Fade", "Side Part", "Textured Crop"],
        }

    session.face_analysis = analysis
    await db.commit()
    return analysis


@router.post("/{session_id}/final-photo")
async def upload_final_photo(
    session_id: UUID,
    data: dict,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SessionOut:
    result = await db.execute(
        select(Session).where(Session.id == session_id, Session.salon_id == current_user.salon_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    photo_url = data.get("photo_url")
    if not photo_url:
        raise HTTPException(status_code=422, detail="photo_url required")
    session.final_result_photo_url = photo_url
    session.status = SessionStatus.completed
    await db.commit()
    return SessionOut.model_validate(
        await _fetch_session(session_id, current_user.salon_id, db)
    )


@router.patch("/{session_id}")
async def update_session(
    session_id: UUID,
    data: SessionUpdate,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> SessionOut:
    result = await db.execute(
        select(Session).where(Session.id == session_id, Session.salon_id == current_user.salon_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(session, field, value)
    await db.commit()
    return SessionOut.model_validate(
        await _fetch_session(session_id, current_user.salon_id, db)
    )
