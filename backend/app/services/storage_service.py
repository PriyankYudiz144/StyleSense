import uuid

import boto3
from botocore.config import Config

from app.core.config import settings

_PLACEHOLDER_KEYS = {"your-access-key", "your-secret-key", ""}


def _s3_configured() -> bool:
    key = settings.s3_access_key_id
    secret = settings.s3_secret_access_key
    return bool(key) and key not in _PLACEHOLDER_KEYS and bool(secret) and secret not in _PLACEHOLDER_KEYS


class StorageService:
    def __init__(self) -> None:
        self._configured = _s3_configured()
        if self._configured:
            kwargs: dict = {
                "aws_access_key_id": settings.s3_access_key_id,
                "aws_secret_access_key": settings.s3_secret_access_key,
                "region_name": settings.s3_region,
                "config": Config(signature_version="s3v4"),
            }
            # Only set endpoint_url for S3-compatible services (R2, MinIO, etc.)
            # Leave empty for standard AWS S3 — boto3 resolves endpoint automatically
            if settings.s3_endpoint_url and "console.aws.amazon.com" not in settings.s3_endpoint_url:
                kwargs["endpoint_url"] = settings.s3_endpoint_url
            self.client = boto3.client("s3", **kwargs)
        self.bucket = settings.s3_bucket_name

    def _public_url(self, key: str) -> str:
        if settings.s3_endpoint_url and "console.aws.amazon.com" not in settings.s3_endpoint_url:
            return f"{settings.s3_endpoint_url.rstrip('/')}/{self.bucket}/{key}"
        return f"https://{self.bucket}.s3.{settings.s3_region}.amazonaws.com/{key}"

    def generate_presigned_upload(self, content_type: str = "image/jpeg", folder: str = "uploads") -> dict[str, str]:
        key = f"{folder}/{uuid.uuid4()}.jpg"

        if not self._configured:
            return {
                "upload_url": "",
                "key": key,
                "public_url": "",
                "_mock": "true",
            }

        url = self.client.generate_presigned_url(
            "put_object",
            Params={"Bucket": self.bucket, "Key": key, "ContentType": content_type},
            ExpiresIn=300,
        )
        return {
            "upload_url": url,
            "key": key,
            "public_url": self._public_url(key),
        }
