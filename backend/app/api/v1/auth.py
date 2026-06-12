from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import CurrentUser, get_session
from app.schemas.auth import ForgotPasswordRequest, LoginRequest, RefreshRequest, RegisterSalonRequest, ResetPasswordRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/register-salon", status_code=status.HTTP_201_CREATED)
async def register_salon(
    data: RegisterSalonRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    try:
        user, tokens = await AuthService(db).register_salon(data)
        return {"user": UserOut.model_validate(user).model_dump(), **tokens.model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e


@router.post("/login")
async def login(
    data: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    try:
        user, tokens = await AuthService(db).login(data.email, data.password)
        return {"user": UserOut.model_validate(user).model_dump(), **tokens.model_dump()}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e


@router.post("/refresh")
async def refresh(
    data: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> TokenResponse:
    try:
        return await AuthService(db).refresh(data.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    from app.core.config import settings
    token = await AuthService(db).forgot_password(data.email)
    response: dict = {"message": "If that email is registered, a reset link has been sent."}
    if token and not settings.resend_api_key:
        response["dev_token"] = token
    return response


@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    try:
        await AuthService(db).reset_password(data.token, data.new_password)
        return {"message": "Password reset successfully."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.post("/logout")
async def logout(current_user: CurrentUser) -> dict:
    return {"message": "Logged out"}


@router.get("/me")
async def me(current_user: CurrentUser) -> UserOut:
    return UserOut.model_validate(current_user)
