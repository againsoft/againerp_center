#!/usr/bin/env python3
"""AgainERP Edge Agent — sends periodic heartbeats to Control Center."""

from __future__ import annotations

import random
import signal
import sys
import time
from datetime import datetime, timezone

from app.config import get_settings
from app.heartbeat.collector import collect_health
from app.heartbeat.sender import send_heartbeat
from app.identity import get_or_create_instance_id

_running = True


def _handle_signal(_signum, _frame) -> None:
    global _running
    _running = False


def main() -> None:
    settings = get_settings()
    if not settings.agent_token:
        print("[Agent] ERROR: Set AGENT_TOKEN in .env (from client creation in Control Center)")
        sys.exit(1)

    instance_id = get_or_create_instance_id()
    signal.signal(signal.SIGINT, _handle_signal)
    signal.signal(signal.SIGTERM, _handle_signal)

    print(f"[Agent] AgainERP Edge Agent v{settings.agent_version}")
    print(f"[Agent] Control Center: {settings.control_center_url}")
    print(f"[Agent] Instance ID: {instance_id}")
    print(f"[Agent] Heartbeat interval: {settings.heartbeat_interval}s")
    print("[Agent] Press Ctrl+C to stop\n")

    consecutive_failures = 0

    while _running:
        try:
            metrics = collect_health()
            result = send_heartbeat(
                instance_id=instance_id,
                metrics=metrics,
                agent_version=settings.agent_version,
                erp_version=settings.erp_version,
            )
            consecutive_failures = 0
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
            print(
                f"[{ts}] Heartbeat OK — health={result.get('health_status')} "
                f"cpu={metrics.cpu_percent}% mem={metrics.memory_percent}% "
                f"disk={metrics.disk_percent}%"
            )
        except Exception as e:
            consecutive_failures += 1
            ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
            print(f"[{ts}] Heartbeat FAILED ({consecutive_failures}): {e}")

        if not _running:
            break

        interval = settings.heartbeat_interval
        if consecutive_failures >= 3:
            interval = min(interval * 5, 300)
        jitter = random.uniform(-0.1, 0.1) * interval
        sleep_for = max(5, interval + jitter)

        for _ in range(int(sleep_for)):
            if not _running:
                break
            time.sleep(1)

    print("\n[Agent] Stopped.")


if __name__ == "__main__":
    main()
