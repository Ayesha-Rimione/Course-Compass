from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class OTPRequest(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "student@iubat.edu"})


class OTPVerify(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "student@iubat.edu"})
    code: str = Field(..., min_length=6, max_length=6, json_schema_extra={"example": "123456"})


class UserRegister(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "student@iubat.edu"})
    password: str = Field(..., min_length=4, json_schema_extra={"example": "123456"})
    full_name: Optional[str] = Field(None, json_schema_extra={"example": "Ayesha Rahman"})


class UserLogin(BaseModel):
    email: EmailStr = Field(..., json_schema_extra={"example": "student@iubat.edu"})
    password: str = Field(..., min_length=4, json_schema_extra={"example": "123456"})


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class MessageResponse(BaseModel):
    message: str
    email: Optional[str] = None
