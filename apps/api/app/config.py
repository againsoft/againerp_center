from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AgainERP Control Center"
    app_env: str = "development"
    database_url: str = "postgresql://postgres:password@localhost:5432/againerp_center"
    secret_key: str = "againerp-center-super-secret-key-change-in-prod"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    cors_origins: str = "http://localhost:3001,http://127.0.0.1:3001"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
