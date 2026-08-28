import hashlib
import datetime
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.users import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/verify-otp")


def hash_otp(code: str) -> str:
    salt = settings.JWT_SECRET
    return hashlib.sha256(f"{salt}:{code}".encode("utf-8")).hexdigest()


def verify_otp_hash(plain_code: str, hashed_code: str) -> bool:
    return hash_otp(plain_code) == hashed_code


def hash_password(password: str) -> str:
    salt = settings.JWT_SECRET
    return hashlib.sha256(f"{salt}:pwd:{password}".encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    allowed_roles = ["ADMIN", "DEPARTMENT_ADMIN", "IUBAT_AUTHORITY", "SUPER_ADMIN"]
    user_role_str = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role_str not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSE Department Admin privileges required."
        )
    return current_user

