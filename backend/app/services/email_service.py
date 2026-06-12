import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


class EmailService:
    def _send_smtp(self, to_email: str, subject: str, body: str) -> bool:
        msg = MIMEMultipart()
        msg["From"] = settings.email_from
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        try:
            if settings.smtp_use_tls:
                server = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
                server.starttls()
            else:
                server = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port)
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.email_from, to_email, msg.as_string())
            server.quit()
            return True
        except Exception as e:
            print(f"[EMAIL ERROR] SMTP failed: {e}")
            return False

    async def _send(self, to_email: str, subject: str, body: str) -> bool:
        if not settings.smtp_host:
            print(f"[EMAIL STUB] To={to_email} | Subject={subject}\n{body}")
            return True
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._send_smtp, to_email, subject, body)

    async def send_reset_password(self, to_email: str, reset_link: str) -> bool:
        body = f"""Hi,

You requested a password reset for your StyleSense account.

Click the link below to reset your password (expires in 1 hour):
{reset_link}

If you didn't request this, you can safely ignore this email.

— The StyleSense Team"""
        return await self._send(to_email, "Reset your StyleSense password", body)

    async def send_invite(self, to_email: str, inviter_name: str, salon_name: str, temp_password: str) -> bool:
        body = f"""Hi,

{inviter_name} has invited you to join {salon_name} on StyleSense.

Your login details:
  Email: {to_email}
  Temporary password: {temp_password}

Please log in and change your password immediately.

https://stylesense.ai/login

— The StyleSense Team"""
        return await self._send(to_email, f"You've been invited to {salon_name} on StyleSense", body)
