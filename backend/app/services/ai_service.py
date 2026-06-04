import asyncio
import base64
import io
import json
import pathlib
import time
import uuid as uuid_module
from typing import Any

import httpx
from openai import AsyncOpenAI
from PIL import Image, ImageDraw, ImageFilter

from app.core.config import settings

STATIC_DIR = pathlib.Path(__file__).parent.parent.parent / "static" / "generated"

GRID_STYLES: list[tuple[str, list[str]]] = [
    ("Curly Bob",       ["curly", "bob", "short"]),
    ("Curtain Bangs",   ["bangs", "layered", "long"]),
    ("Pixie Cut",       ["pixie", "short", "edgy"]),
    ("Layered Waves",   ["waves", "layered", "medium"]),
    ("Sleek Bun",       ["bun", "updo", "sleek"]),
    ("Ponytail",        ["ponytail", "updo", "classic"]),
    ("Wolf Cut",        ["wolf", "shaggy", "trendy"]),
    ("Straight Long",   ["straight", "long", "elegant"]),
    ("Soft Curls",      ["curls", "soft", "romantic"]),
]

GRID_ROWS = 3
GRID_COLS = 3

_GRID_PROMPT = (
    "Use the uploaded photo as the identity reference. "
    "Preserve the exact same face, eyes, nose, lips, jawline, skin texture, expression, ethnicity, "
    "and facial proportions in all 9 images. "
    "Do NOT alter identity, age, makeup, or facial structure. "
    "Only change the hairstyle in each panel. "
    "Create a realistic 3x3 hairstyle recommendation grid. "
    "Same person in every frame. "
    "Maintain identical camera angle, lighting, background, clothing, pose, and facial expression. "
    "Hairstyles only should vary. "
    "Include different professional and trendy hairstyles: "
    "curly bob, curtain bangs, pixie cut, layered waves, sleek bun, ponytail, wolf cut, straight long hair, soft curls. "
    "Ultra realistic salon photography. "
    "Consistent identity lock across all panels. "
    "No face morphing. No beauty enhancement. No facial edits. "
    "Hair transformation only."
)

_FACE_ANALYSIS_SYSTEM = """You are a professional hairstylist assistant analyzing a customer's photo.
Return ONLY a valid JSON object with these exact keys:
- face_shape: one of "oval", "round", "square", "heart", "oblong", "diamond"
- hair_texture: one of "straight", "wavy", "curly", "coily"
- hair_length: one of "short", "medium", "long"
- hair_color: brief description like "dark brown", "blonde", "black", "light brown"
- age_group: one of "teen", "young_adult", "adult", "mature"
- recommended_styles: array of 3 style names from this list that would suit this person best
No extra text, just JSON."""


def _decode_photo(photo_url: str) -> bytes:
    if photo_url.startswith("data:"):
        _, b64 = photo_url.split(",", 1)
        return base64.b64decode(b64)
    return httpx.get(photo_url, timeout=30).content


def _prepare_square_png(raw: bytes, size: int = 1024) -> bytes:
    img = Image.open(io.BytesIO(raw)).convert("RGBA")
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    img = img.resize((size, size), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def _prepare_rect_png(raw: bytes, width: int = 1536, height: int = 1024) -> bytes:
    """Resize image to exact (width, height) with center crop to preserve aspect."""
    img = Image.open(io.BytesIO(raw)).convert("RGBA")
    iw, ih = img.size
    target_ratio = width / height
    src_ratio = iw / ih
    if src_ratio > target_ratio:
        new_w = int(ih * target_ratio)
        img = img.crop(((iw - new_w) // 2, 0, (iw - new_w) // 2 + new_w, ih))
    else:
        new_h = int(iw / target_ratio)
        img = img.crop((0, (ih - new_h) // 2, iw, (ih - new_h) // 2 + new_h))
    img = img.resize((width, height), Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def _make_hair_mask(width: int = 1536, height: int = 1024) -> bytes:
    """
    Opaque (black) = preserved by model. Transparent = editable by model.
    We make only the hair region transparent so the AI changes ONLY hair.
    Hair zone: top ellipse covering roughly the scalp/hair area.
    Face, neck, shoulders stay opaque → model must preserve them.
    """
    # For a grid image each cell is width/cols × height/rows
    # Apply hair mask ellipse per cell so every panel has hair zone editable
    cols, rows = 3, 2
    cell_w, cell_h = width // cols, height // rows
    mask = Image.new("RGBA", (width, height), (0, 0, 0, 255))  # fully opaque
    draw = ImageDraw.Draw(mask)
    margin_x = int(cell_w * 0.05)
    hair_bottom = int(cell_h * 0.48)
    for r in range(rows):
        for c in range(cols):
            ox, oy = c * cell_w, r * cell_h
            draw.ellipse(
                [ox + margin_x, oy, ox + cell_w - margin_x, oy + hair_bottom],
                fill=(0, 0, 0, 0),
            )
    mask = mask.filter(ImageFilter.GaussianBlur(radius=14))
    out = io.BytesIO()
    mask.save(out, format="PNG")
    return out.getvalue()


def _split_grid_save(b64_data: str, rows: int = 3, cols: int = 3) -> list[str]:
    """Split 3×3 grid into 9 cells and save each as individual file."""
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    grid = Image.open(io.BytesIO(base64.b64decode(b64_data))).convert("RGB")
    w, h = grid.size
    cell_w, cell_h = w // cols, h // rows
    urls: list[str] = []
    for r in range(rows):
        for c in range(cols):
            box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
            cell = grid.crop(box)
            filename = f"{uuid_module.uuid4()}.png"
            buf = io.BytesIO()
            cell.save(buf, format="PNG")
            (STATIC_DIR / filename).write_bytes(buf.getvalue())
            urls.append(f"{settings.app_base_url}/static/generated/{filename}")
    return urls


def _save_b64_image(b64_data: str) -> str:
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid_module.uuid4()}.png"
    (STATIC_DIR / filename).write_bytes(base64.b64decode(b64_data))
    return f"{settings.app_base_url}/static/generated/{filename}"


class AIService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def analyze_face(self, photo_url: str) -> dict[str, Any]:
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": _FACE_ANALYSIS_SYSTEM},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Analyze this person's face and hair for hairstyle consultation."},
                        {"type": "image_url", "image_url": {"url": photo_url, "detail": "low"}},
                    ],
                },
            ],
            max_tokens=300,
            temperature=0.2,
        )
        raw = response.choices[0].message.content or "{}"
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "face_shape": "oval",
                "hair_texture": "straight",
                "hair_length": "medium",
                "hair_color": "dark",
                "age_group": "adult",
                "recommended_styles": ["Pixie Cut", "Beach Waves", "Sleek Bob"],
            }

    async def generate_all_previews(
        self, count: int = 6, photo_url: str = ""
    ) -> list[dict[str, Any]]:
        start = time.monotonic()

        if photo_url:
            try:
                loop = asyncio.get_event_loop()
                raw = await loop.run_in_executor(None, _decode_photo, photo_url)
                original_png = await loop.run_in_executor(None, _prepare_square_png, raw)

                response = await self.client.images.edit(
                    model="gpt-image-1",
                    image=("photo.png", io.BytesIO(original_png), "image/png"),
                    prompt=_GRID_PROMPT,
                    size="1024x1024",
                    quality="high",
                    n=1,
                )
                elapsed_ms = int((time.monotonic() - start) * 1000)

                b64 = response.data[0].b64_json or ""
                if b64:
                    urls = await loop.run_in_executor(
                        None, lambda: _split_grid_save(b64, rows=GRID_ROWS, cols=GRID_COLS)  # noqa: B023
                    )
                    return [
                        {
                            "url": urls[i],
                            "style_name": GRID_STYLES[i][0],
                            "style_tags": GRID_STYLES[i][1],
                            "generation_time_ms": elapsed_ms,
                            "model": "gpt-image-1",
                        }
                        for i in range(min(len(urls), len(GRID_STYLES)))
                    ]
            except Exception as e:
                raise RuntimeError(f"Image generation failed: {e}") from e

        raise ValueError("No photo provided for generation")

    async def generate_mock_previews(self, count: int = 9) -> list[dict[str, Any]]:
        return [
            {
                "url": f"https://picsum.photos/seed/{uuid_module.uuid4()}/400/400",
                "style_name": name,
                "style_tags": tags,
                "generation_time_ms": 50,
                "model": "mock",
            }
            for name, tags in GRID_STYLES[:count]
        ]
