import time
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_session
from app.models.user import User, UserRole

bearer = HTTPBearer()

# Simple in-memory user cache: token_prefix -> (User, expiry_monotonic)
_user_cache: dict[str, tuple[User, float]] = {}
_CACHE_TTL = 30.0  # seconds — safe since access tokens expire in 15 min


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
    db: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    from sqlalchemy import select

    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    cache_key = credentials.credentials[-32:]
    now = time.monotonic()
    cached = _user_cache.get(cache_key)
    if cached:
        user, expiry = cached
        if now < expiry:
            return user

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    _user_cache[cache_key] = (user, now + _CACHE_TTL)
    # Evict stale entries periodically to avoid unbounded growth
    if len(_user_cache) > 500:
        stale = [k for k, (_, exp) in _user_cache.items() if now > exp]
        for k in stale:
            _user_cache.pop(k, None)

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole):
    async def checker(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user
    return checker
