"""Collect local health metrics for heartbeat payloads."""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional

try:
    import psutil
except ImportError:
    psutil = None  # type: ignore[assignment]


@dataclass
class HealthMetrics:
    cpu_percent: Optional[float]
    memory_percent: Optional[float]
    disk_percent: Optional[float]
    uptime_seconds: Optional[int]
    status: str = "healthy"


def collect_health() -> HealthMetrics:
    if psutil is None:
        return HealthMetrics(None, None, None, None)

    try:
        cpu = psutil.cpu_percent(interval=0.5)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent
        try:
            uptime = int(time.time() - psutil.boot_time())
        except (PermissionError, OSError):
            uptime = None
    except (PermissionError, OSError):
        return HealthMetrics(None, None, None, None)

    status = "healthy"
    if cpu > 90 or memory > 90:
        status = "degraded"
    if disk > 95:
        status = "critical"

    return HealthMetrics(
        cpu_percent=round(cpu, 1),
        memory_percent=round(memory, 1),
        disk_percent=round(disk, 1),
        uptime_seconds=uptime,
        status=status,
    )
