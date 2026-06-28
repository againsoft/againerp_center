#!/usr/bin/env python3
"""Seed two mock clients with full fleet provisioning (subscription, agent, monitoring)."""

from __future__ import annotations

import sys
import uuid
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "apps" / "api"))

from app.database import SessionLocal
from app.models.client import Client
from app.models.health_snapshot import HealthSnapshot
from app.models.server import Server
from app.services.ai_service import ensure_client_ai_access, seed_sample_ai_usage
from app.services.backup_service import ensure_backup_policy, seed_sample_backups
from app.services.license_service import create_agent_token, create_license, create_subscription
from app.services.module_service import provision_client_modules
from app.services.update_service import ensure_client_update_state

MOCK_CLIENTS = [
    {
        "id": "client_urbanwear01",
        "name": "UrbanWear Retail",
        "slug": "urbanwear",
        "domain": "erp.urbanwear.bd",
        "db_host": "db.urbanwear.bd",
        "db_port": 5432,
        "db_name": "urbanwear_erp",
        "db_user": "urbanwear_app",
        "db_password": "mock_dev_only",
        "api_url": "https://erp.urbanwear.bd/api",
        "plan": "enterprise",
        "status": "active",
        "notes": "Mock client — fashion retail, enterprise deployment, AI enabled.",
        "instance_id": "inst_urbanwear_001",
        "hostname": "erp.urbanwear.bd",
        "agent_version": "1.2.0",
        "erp_version": "2026.6.1",
        "health_status": "healthy",
        "cpu_percent": 28.0,
        "memory_percent": 52.0,
        "disk_percent": 41.0,
        "wants_ai": True,
    },
    {
        "id": "client_techzone01",
        "name": "TechZone Computers",
        "slug": "techzone",
        "domain": "app.techzone.com.bd",
        "db_host": "10.0.4.12",
        "db_port": 5432,
        "db_name": "techzone_prod",
        "db_user": "techzone_app",
        "db_password": "mock_dev_only",
        "api_url": "https://app.techzone.com.bd/api",
        "plan": "custom",
        "status": "active",
        "notes": "Mock client — on-prem electronics retailer, full module stack.",
        "instance_id": "inst_techzone_001",
        "hostname": "app.techzone.com.bd",
        "agent_version": "1.2.0",
        "erp_version": "2026.6.1",
        "health_status": "healthy",
        "cpu_percent": 42.0,
        "memory_percent": 61.0,
        "disk_percent": 58.0,
        "wants_ai": True,
    },
]


def _ensure_server(db, client: Client, spec: dict) -> Server:
    server = db.query(Server).filter(Server.client_id == client.id).first()
    now = datetime.utcnow()
    if server:
        server.last_heartbeat_at = now - timedelta(seconds=45)
        server.health_status = spec["health_status"]
        server.agent_version = spec["agent_version"]
        server.erp_version = spec["erp_version"]
        server.hostname = spec["hostname"]
    else:
        server = Server(
            id=f"srv_{uuid.uuid4().hex[:12]}",
            client_id=client.id,
            instance_id=spec["instance_id"],
            hostname=spec["hostname"],
            agent_version=spec["agent_version"],
            erp_version=spec["erp_version"],
            os_info="Linux · Docker · Edge Agent",
            is_primary=True,
            last_heartbeat_at=now - timedelta(seconds=45),
            health_status=spec["health_status"],
        )
        db.add(server)
    db.commit()
    db.refresh(server)

    snap = HealthSnapshot(
        client_id=client.id,
        server_id=server.id,
        cpu_percent=spec["cpu_percent"],
        memory_percent=spec["memory_percent"],
        disk_percent=spec["disk_percent"],
        uptime_seconds=86400 * 14,
        status=spec["health_status"],
        recorded_at=now,
    )
    db.add(snap)
    db.commit()
    return server


def provision_client(db, spec: dict) -> tuple[Client, str | None]:
    existing = db.query(Client).filter(Client.slug == spec["slug"]).first()
    if existing:
        print(f"  · {spec['name']} ({spec['slug']}) — already exists ({existing.id})")
        _ensure_server(db, existing, spec)
        return existing, None

    client = Client(
        id=spec["id"],
        name=spec["name"],
        slug=spec["slug"],
        domain=spec["domain"],
        db_host=spec["db_host"],
        db_port=spec["db_port"],
        db_name=spec["db_name"],
        db_user=spec["db_user"],
        db_password=spec["db_password"],
        api_url=spec["api_url"],
        plan=spec["plan"],
        status=spec["status"],
        notes=spec["notes"],
        is_active=True,
    )
    db.add(client)
    db.commit()
    db.refresh(client)

    create_subscription(db, client_id=client.id, plan=spec["plan"])
    create_license(db, client_id=client.id, plan=spec["plan"])
    ensure_client_update_state(db, client.id)
    provision_client_modules(db, client.id, plan=spec["plan"])
    ensure_backup_policy(db, client.id, spec["plan"])
    ensure_client_ai_access(db, client.id, plan=spec["plan"], wants_ai=spec["wants_ai"])
    _, agent_raw = create_agent_token(db, client_id=client.id, label="mock-seed")
    _ensure_server(db, client, spec)

    print(f"  ✓ {client.name} ({client.slug}) — {client.id}")
    return client, agent_raw


def main() -> None:
    print("Seeding mock clients...")
    db = SessionLocal()
    tokens: list[tuple[str, str]] = []
    try:
        for spec in MOCK_CLIENTS:
            client, token = provision_client(db, spec)
            if token:
                tokens.append((client.slug, token))

        seed_sample_backups(db)
        seed_sample_ai_usage(db)
    finally:
        db.close()

    print("")
    print(f"Done — {len(MOCK_CLIENTS)} mock client(s) ready.")
    if tokens:
        print("")
        print("Agent tokens (save once — shown only at creation):")
        for slug, token in tokens:
            print(f"  {slug}: {token}")


if __name__ == "__main__":
    main()
