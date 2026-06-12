from pydantic import BaseModel, EmailStr


class SalonCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str


class AdminCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class RegisterSalonRequest(BaseModel):
    salon: SalonCreate
    admin: AdminCreate


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
