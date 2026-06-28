import platform
import socket
import uuid
from pathlib import Path

from app.config import get_settings


def get_or_create_instance_id() -> str:
    settings = get_settings()
    if settings.instance_id:
        return settings.instance_id

    data_dir = settings.data_dir
    data_dir.mkdir(parents=True, exist_ok=True)
    id_file = data_dir / "instance_id"

    if id_file.exists():
        stored = id_file.read_text().strip()
        if stored:
            return stored

    instance_id = f"inst_{uuid.uuid4().hex[:12]}"
    id_file.write_text(instance_id)
    return instance_id


def get_hostname() -> str:
    return socket.gethostname()


def get_os_info() -> str:
    return f"{platform.system()} {platform.release()} ({platform.machine()})"
