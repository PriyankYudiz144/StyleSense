from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.storage_service import StorageService

router = APIRouter()


class PresignRequest(BaseModel):
    content_type: str = "image/jpeg"
    folder: str = "uploads"


@router.post("/presign")
async def presign(data: PresignRequest) -> dict:
    try:
        return StorageService().generate_presigned_upload(data.content_type, data.folder)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage error: {e}") from e
