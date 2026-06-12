import pathlib
import uuid

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel

from app.core.config import settings
from app.services.storage_service import StorageService

router = APIRouter()

UPLOAD_DIR = pathlib.Path(__file__).parent.parent.parent.parent / "uploads"


class PresignRequest(BaseModel):
    content_type: str = "image/jpeg"
    folder: str = "uploads"


@router.post("/presign")
async def presign(data: PresignRequest) -> dict:
    try:
        return StorageService().generate_presigned_upload(data.content_type, data.folder)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage error: {e}") from e


@router.post("/file")
async def upload_file(file: UploadFile, folder: str = "uploads") -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    ext = pathlib.Path(file.filename or "file.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    s3_key = f"Documents/{folder}/{filename}"

    storage = StorageService()
    if storage._configured:
        try:
            import asyncio as _asyncio
            loop = _asyncio.get_running_loop()
            await loop.run_in_executor(
                None,
                lambda: storage.client.put_object(
                    Bucket=storage.bucket,
                    Key=s3_key,
                    Body=content,
                    ContentType=file.content_type or "image/jpeg",
                ),
            )
            return {"url": storage._public_url(s3_key)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {e}") from e
    else:
        dest_dir = UPLOAD_DIR / folder
        dest_dir.mkdir(parents=True, exist_ok=True)
        (dest_dir / filename).write_bytes(content)
        return {"url": f"{settings.app_base_url}/uploads/{folder}/{filename}"}


@router.post("/local")
async def upload_local(file: UploadFile, folder: str = "avatars") -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    ext = pathlib.Path(file.filename or "file.jpg").suffix or ".jpg"
    dest_dir = UPLOAD_DIR / folder
    dest_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}{ext}"
    dest = dest_dir / filename

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    dest.write_bytes(content)

    public_url = f"{settings.app_base_url}/uploads/{folder}/{filename}"
    return {"url": public_url}
