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
from PIL import Image

from app.core.config import settings

STATIC_DIR = pathlib.Path(__file__).parent.parent.parent / "static" / "generated"

STYLES_FEMALE: list[tuple[str, list[str]]] = [
    ("Curly Bob",     ["curly", "bob", "short"]),
    ("Layered Waves", ["waves", "layered", "medium"]),
    ("Sleek Bun",     ["bun", "updo", "sleek"]),
]

STYLES_MALE: list[tuple[str, list[str]]] = [
    ("Fade & Taper",  ["fade", "taper", "clean"]),
    ("Textured Crop", ["textured", "crop", "trendy"]),
    ("Slick Back",    ["slick", "back", "formal"]),
]

_SINGLE_PROMPT_FEMALE = (
    "Photorealistic DSLR portrait photograph. "
    "Use the uploaded photo as strict identity reference. "
    "Preserve EXACTLY: face shape, eyes, nose, lips, jawline, skin tone, skin color, "
    "skin texture, complexion, expression, ethnicity, age, and all facial proportions. "
    "Do NOT smooth skin. Do NOT alter skin color. No beauty filters. No facial edits. "
    "Change ONLY the hairstyle to: {style_name}. "
    "Single portrait, centered composition, soft studio lighting. "
    "Raw photographic realism — no illustration, no painting, no AI art style. "
    "Skin tone must match the original photo exactly. Hair transformation only."
)

_SINGLE_PROMPT_MALE = (
    "Photorealistic DSLR portrait photograph. "
    "This is a MALE client. "
    "Use the uploaded photo as strict identity reference. "
    "Preserve EXACTLY: masculine face shape, eyes, nose, lips, jawline, beard stubble (if any), "
    "skin tone, skin color, skin texture, complexion, expression, ethnicity, age. "
    "Do NOT smooth skin. Do NOT alter skin color. Do NOT feminize. No beauty filters. No facial edits. "
    "Change ONLY the hairstyle to: {style_name}. This must be a masculine men's hairstyle. "
    "Single portrait, centered composition, soft studio lighting. "
    "Raw photographic realism — no illustration, no painting, no AI art style. "
    "Skin tone must match the original photo exactly. Male hair transformation only."
)

_VALIDATE_SYSTEM = (
    "You are a photo validator for a hairstyle consultation app. "
    "Analyze the image and return ONLY a JSON object: "
    '{\"valid\": true or false, \"reason\": \"one short sentence\"}. '
    "Valid: clear single human face visible, reasonable lighting, face is the main subject. "
    "Invalid: no face, multiple faces, very blurry, extremely dark, cartoon/illustration/drawing, "
    "animal, object only, face too small or obscured."
)


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


def _save_b64_image(b64_data: str) -> str:
    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid_module.uuid4()}.png"
    (STATIC_DIR / filename).write_bytes(base64.b64decode(b64_data))
    return f"{settings.app_base_url}/static/generated/{filename}"


class AIService:
    def __init__(self) -> None:
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def validate_photo(self, photo_url: str) -> dict[str, Any]:
        """Check if photo contains a valid human face for hairstyle consultation."""
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": _VALIDATE_SYSTEM},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Validate this photo."},
                            {"type": "image_url", "image_url": {"url": photo_url, "detail": "low"}},
                        ],
                    },
                ],
                max_tokens=80,
                temperature=0,
            )
            raw = response.choices[0].message.content or '{"valid": true, "reason": ""}'
            return json.loads(raw)
        except (json.JSONDecodeError, Exception):
            return {"valid": True, "reason": ""}

    async def analyze_face(self, photo_url: str) -> dict[str, Any]:
        _FACE_ANALYSIS_SYSTEM = """You are a professional hairstylist assistant analyzing a customer's photo.
Return ONLY a valid JSON object with these exact keys:
- face_shape: one of "oval", "round", "square", "heart", "oblong", "diamond"
- hair_texture: one of "straight", "wavy", "curly", "coily"
- hair_length: one of "short", "medium", "long"
- hair_color: brief description like "dark brown", "blonde", "black", "light brown"
- age_group: one of "teen", "young_adult", "adult", "mature"
- recommended_styles: array of 3 style names from this list that would suit this person best
No extra text, just JSON."""
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

    async def generate_single_preview(
        self, photo_url: str, style_name: str, style_tags: list[str], gender: str = "female"
    ) -> dict[str, Any]:
        """Generate one hairstyle image for a single style."""
        start = time.monotonic()
        is_male = gender.lower() == "male"
        prompt_template = _SINGLE_PROMPT_MALE if is_male else _SINGLE_PROMPT_FEMALE
        prompt = prompt_template.format(style_name=style_name)

        loop = asyncio.get_event_loop()
        raw = await loop.run_in_executor(None, _decode_photo, photo_url)
        original_png = await loop.run_in_executor(None, _prepare_square_png, raw)

        response = await self.client.images.edit(
            model="gpt-image-1",
            image=("photo.png", io.BytesIO(original_png), "image/png"),
            prompt=prompt,
            size="1024x1024",
            quality="medium",
            n=1,
        )
        elapsed_ms = int((time.monotonic() - start) * 1000)
        b64 = response.data[0].b64_json or ""
        url = await loop.run_in_executor(None, lambda: _save_b64_image(b64))
        return {
            "url": url,
            "style_name": style_name,
            "style_tags": style_tags,
            "generation_time_ms": elapsed_ms,
            "model": "gpt-image-1",
        }

    async def generate_mock_preview(self, style_name: str, style_tags: list[str]) -> dict[str, Any]:
        return {
            "url": f"https://picsum.photos/seed/{uuid_module.uuid4()}/400/400",
            "style_name": style_name,
            "style_tags": style_tags,
            "generation_time_ms": 50,
            "model": "mock",
        }
