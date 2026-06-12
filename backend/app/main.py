import pathlib

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.router import router
from app.core.config import settings

STATIC_DIR = pathlib.Path(__file__).parent.parent / "static"
UPLOAD_DIR = pathlib.Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="StyleSense API", version="0.1.0", docs_url="/docs", redoc_url="/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/static/generated/{filename}")
async def serve_generated(filename: str) -> FileResponse:
    # Prevent path traversal
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400)
    path = STATIC_DIR / "generated" / filename
    if not path.exists():
        raise HTTPException(status_code=404)
    return FileResponse(path, media_type="image/png")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
