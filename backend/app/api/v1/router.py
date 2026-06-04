from fastapi import APIRouter

from app.api.v1 import auth, customers, dashboard, salons, sessions, uploads, users

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(salons.router, prefix="/salons", tags=["salons"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(customers.router, prefix="/customers", tags=["customers"])
router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
