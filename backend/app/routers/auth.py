from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    OTPRequest,
    OTPVerify,
    UserRegister,
    UserLogin,
    TokenResponse,
    MessageResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Sign up a new student")
def register_endpoint(payload: UserRegister, db: Session = Depends(get_db)):
    return auth_service.register_user(db, payload.email, payload.password, payload.full_name)


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK, summary="Sign in an existing student")
def login_endpoint(payload: UserLogin, db: Session = Depends(get_db)):
    return auth_service.login_user(db, payload.email, payload.password)


@router.post("/request-otp", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def request_otp_endpoint(payload: OTPRequest, db: Session = Depends(get_db)):
    return auth_service.request_otp(db, payload.email)


@router.post("/verify-otp", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def verify_otp_endpoint(payload: OTPVerify, db: Session = Depends(get_db)):
    return auth_service.verify_otp(db, payload.email, payload.code)

