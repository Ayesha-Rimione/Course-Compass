import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./coursecompass.db"

    # Security & Auth
    JWT_SECRET: str = "development_super_secret_jwt_key_change_in_production_12345"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    OTP_EXPIRE_MINUTES: int = 10
    ALLOWED_EMAIL_DOMAINS: str = "iubat.edu"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def allowed_domains_list(self) -> List[str]:
        return [d.strip().lower() for d in self.ALLOWED_EMAIL_DOMAINS.split(",") if d.strip()]

    @property
    def get_sqlalchemy_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url


settings = Settings()
