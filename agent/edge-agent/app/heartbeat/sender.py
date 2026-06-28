"""Send heartbeat payloads to Control Center."""

from __future__ import annotations

from typing import Any

import httpx

from app.config import get_settings
from app.heartbeat.collector import HealthMetrics
from app.identity import get_hostname, get_os_info


def send_heartbeat(
    *,
    instance_id: str,
    metrics: HealthMetrics,
    agent_version: str,
    erp_version: str,
) -> dict[str, Any]:
    settings = get_settings()
    if not settings.agent_token:
        raise ValueError("AGENT_TOKEN is required")

    url = f"{settings.control_center_url.rstrip('/')}/agent/v1/heartbeat"
    payload = {
        "instance_id": instance_id,
        "agent_version": agent_version,
        "erp_version": erp_version,
        "hostname": get_hostname(),
        "os_info": get_os_info(),
        "cpu_percent": metrics.cpu_percent,
        "memory_percent": metrics.memory_percent,
        "disk_percent": metrics.disk_percent,
        "uptime_seconds": metrics.uptime_seconds,
        "status": metrics.status,
    }

    with httpx.Client(timeout=15.0) as client:
        res = client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {settings.agent_token}"},
        )
        res.raise_for_status()
        return res.json()
