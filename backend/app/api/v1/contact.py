from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.services.email_service import EmailService

router = APIRouter()


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    company: str = ""
    message: str


@router.post("")
async def contact_sales(data: ContactRequest) -> dict:
    if not settings.smtp_host and not settings.resend_api_key:
        return {"message": "Message received."}

    email = EmailService()

    body = f"""New sales inquiry from StyleSense website

Name:    {data.name}
Email:   {data.email}
Company: {data.company or "—"}

Message:
{data.message}
    """.strip()

    # Send notification to sales team
    await email._send(settings.smtp_user or settings.email_from, "New sales inquiry: StyleSense", body)

    # Send confirmation to the user
    confirm_body = f"""Hi {data.name},

Thanks for reaching out! We've received your message and our sales team will get back to you within 1 business day.

— The StyleSense Team""".strip()

    await email._send(data.email, "We received your message — StyleSense", confirm_body)

    return {"message": "Message sent."}
