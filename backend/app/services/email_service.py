import httpx

from app.core.config import settings


class EmailService:
    BASE_URL = "https://api.resend.com"

    def __init__(self) -> None:
        self.api_key = settings.resend_api_key
        self.from_address = settings.email_from

    async def send_invite(self, to_email: str, inviter_name: str, salon_name: str, temp_password: str) -> bool:
        if not self.api_key:
            # Stub: just log in dev
            print(f"[EMAIL STUB] Invite to {to_email}: temp_password={temp_password}")
            return True

        body = f"""
Hi there,

{inviter_name} has invited you to join {salon_name} on StyleSense.

Your login details:
  Email: {to_email}
  Temporary password: {temp_password}

Please log in and change your password immediately.

https://stylesense.ai/login

— The StyleSense Team
        """.strip()

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{self.BASE_URL}/emails",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={
                    "from": self.from_address,
                    "to": [to_email],
                    "subject": f"You've been invited to {salon_name} on StyleSense",
                    "text": body,
                },
            )
            return resp.status_code == 200
