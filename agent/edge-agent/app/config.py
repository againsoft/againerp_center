from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    control_center_url: str = "http://127.0.0.1:8001"
    agent_token: str = ""
    heartbeat_interval: int = 60
    agent_version: str = "1.0.0"
    erp_version: str = "1.0.0"
    data_dir: Path = Path(".agent-data")
    instance_id: str = ""

    class Config:
        env_file = ".env"
        env_prefix = "AGENT_"


@lru_cache
def get_settings() -> Settings:
    return Settings()
