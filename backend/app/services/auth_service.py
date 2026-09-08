import random
import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.config import settings
from app.models.users import User, OTPCode
from app.models.students import StudentProfile
from app.schemas.auth import TokenResponse, MessageResponse
from app.utils.security import (
    hash_otp,
    verify_otp_hash,
    hash_password,
    verify_password,
    create_access_token,
)


def register_user(db: Session, email: str, password: str, full_name: Optional[str] = None) -> TokenResponse:
    email_clean = email.strip().lower()
    domain = email_clean.split("@")[-1] if "@" in email_clean else ""

    allowed_domains = settings.allowed_domains_list
    if allowed_domains and domain not in allowed_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain @{domain} is not allowed. Must use an authorized university domain ({', '.join(allowed_domains)})."
        )

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please sign in instead."
        )

    password_hash = hash_password(password)
    user = User(email=email_clean, password_hash=password_hash, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create student profile with provided name
    profile = StudentProfile(
        user_id=user.id,
        full_name=full_name.strip() if full_name else "",
        university="IUBAT",
        department="Department of Computer Science & Engineering",
        program="B.Sc. in Computer Science & Engineering"
    )
    db.add(profile)
    db.commit()

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    is_complete = bool(profile.student_id and profile.student_id.strip() and profile.current_semester and profile.current_semester > 0)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        email=user.email,
        role=role_str,
        is_profile_complete=is_complete
    )


def login_user(db: Session, email: str, password: str) -> TokenResponse:
    email_clean = email.strip().lower()
    domain = email_clean.split("@")[-1] if "@" in email_clean else ""

    allowed_domains = settings.allowed_domains_list
    if allowed_domains and domain not in allowed_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain @{domain} is not allowed. Must use an authorized university domain ({', '.join(allowed_domains)})."
        )

    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please sign up first."
        )

    if not user.password_hash:
        # If user registered via legacy OTP without password, set their password
        user.password_hash = hash_password(password)
        db.commit()
    elif not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # Ensure profile exists
    if not user.profile:
        profile = StudentProfile(
            user_id=user.id,
            university="IUBAT",
            department="Department of Computer Science & Engineering",
            program="B.Sc. in Computer Science & Engineering"
        )
        db.add(profile)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    is_complete = bool(user.profile and user.profile.student_id and user.profile.student_id.strip() and user.profile.current_semester and user.profile.current_semester > 0)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        email=user.email,
        role=role_str,
        is_profile_complete=is_complete
    )


def request_otp(db: Session, email: str) -> MessageResponse:
    email_clean = email.strip().lower()
    domain = email_clean.split("@")[-1] if "@" in email_clean else ""

    allowed_domains = settings.allowed_domains_list
    if allowed_domains and domain not in allowed_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Domain @{domain} is not allowed. Must use an authorized university domain ({', '.join(allowed_domains)})."
        )

    # Generate 6-digit OTP
    otp_plain = f"{random.randint(100000, 999999)}"
    code_hash = hash_otp(otp_plain)

    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
        minutes=settings.OTP_EXPIRE_MINUTES
    )

    otp_record = OTPCode(
        email=email_clean,
        code_hash=code_hash,
        expires_at=expires_at,
        used=False
    )
    db.add(otp_record)
    db.commit()

    # Console logging for development as specified in requirement #9
    print(f"\n========================================")
    print(f" [DEV AUTH OTP] Email: {email_clean}")
    print(f" [DEV AUTH OTP] Code : {otp_plain}")
    print(f" [DEV AUTH OTP] Expires: {expires_at}")
    print(f"========================================\n")

    return MessageResponse(
        message=f"OTP code generated. Check backend server console for development code.",
        email=email_clean
    )


def verify_otp(db: Session, email: str, code: str) -> TokenResponse:
    email_clean = email.strip().lower()
    now = datetime.datetime.now(datetime.timezone.utc)

    # Fetch latest matching OTP
    otp_record = (
        db.query(OTPCode)
        .filter(OTPCode.email == email_clean, OTPCode.used == False)
        .order_by(OTPCode.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active OTP request found for this email."
        )

    # Check expiration
    expires_at = otp_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=datetime.timezone.utc)

    if now > expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired. Please request a new code."
        )

    # Verify hash
    if not verify_otp_hash(code, otp_record.code_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code provided."
        )

    # Mark as used
    otp_record.used = True
    db.commit()

    # Get or create user
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        user = User(email=email_clean, is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)

        # Create default profile
        profile = StudentProfile(
            user_id=user.id,
            university="IUBAT",
            department="Department of Computer Science & Engineering",
            program="B.Sc. in Computer Science & Engineering"
        )
        db.add(profile)
        db.commit()
    elif not user.profile:
        profile = StudentProfile(
            user_id=user.id,
            university="IUBAT",
            department="Department of Computer Science & Engineering",
            program="B.Sc. in Computer Science & Engineering"
        )
        db.add(profile)
        db.commit()

    # Issue JWT token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    role_str = user.role.value if hasattr(user.role, "value") else str(user.role)
    is_complete = bool(user.profile and user.profile.student_id and user.profile.student_id.strip() and user.profile.current_semester and user.profile.current_semester > 0)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        email=user.email,
        role=role_str,
        is_profile_complete=is_complete
    )
