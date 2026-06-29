from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AgainERP Control Center"
    app_env: str = "development"
    database_url: str = "postgresql://postgres:password@localhost:5432/againerp_center"
    secret_key: str = "againerp-center-super-secret-key-change-in-prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    cors_origins: str = "http://localhost:3001,http://127.0.0.1:3001"
    mfa_enforce: bool = False
    stripe_webhook_secret: str = ""
    stripe_api_key: str = ""
    seed_demo_data: bool = False
    initial_admin_email: str = ""
    initial_admin_password: str = ""

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql://", 1)
        return value

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
