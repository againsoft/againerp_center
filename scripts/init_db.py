#!/usr/bin/env python3
"""Initialize Control Center database tables and seed default data."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "apps" / "api"))

from app.database import Base, SessionLocal, engine
from app.schema_sync import ensure_schema
from app.models import (  # noqa: F401
    agent_token,
    audit_log,
    backup_policy,
    backup_record,
    billing_invoice,
    client,
    client_module,
    client_update_state,
    erp_version,
    health_snapshot,
    license,
    module_registry,
    operator,
    platform_setting,
    registration,
    server,
    subscription,
    update_rollout,
)


def main() -> None:
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    added = ensure_schema(engine)
    if added:
        print(f"Schema sync: {added} column(s) added.")
    print("Done. Tables created (or already exist).")

    db = SessionLocal()
    try:
        from app.models.operator import Operator
        from app.models.registration import Registration
        from app.deps.auth import hash_password

        if db.query(Operator).count() == 0:
            db.add(Operator(
                id="op_super_admin",
                email="admin@againerp.com",
                username="superadmin",
                hashed_password=hash_password("Admin@1234"),
                full_name="Super Admin",
                role="super_admin",
                is_active=True,
            ))
            db.commit()
            print("Default operator created: admin@againerp.com / Admin@1234")
        else:
            print("Operator already exists, skipping seed.")

        if db.query(Registration).count() == 0:
            db.add_all([
                Registration(
                    id="reg_seed001",
                    business_name="GreenLeaf Organics",
                    contact_name="Ayesha Rahman",
                    contact_email="ayesha@greenleaf.bd",
                    phone="+880 1712-990011",
                    requested_plan="business",
                    requested_modules=json.dumps(["catalog", "orders", "customers", "inventory", "marketing"]),
                    wants_ai=True,
                    industry="Grocery & Organic",
                    deployment_mode="hybrid",
                    region="Asia/Dhaka",
                    website="https://greenleaf.bd",
                    employee_count="11–25",
                    referral_source="Partner — AgroHub",
                    status="pending_review",
                ),
                Registration(
                    id="reg_seed002",
                    business_name="Nova Electronics",
                    contact_name="Imran Chowdhury",
                    contact_email="imran@novaelectronics.com",
                    phone="+880 1813-445566",
                    requested_plan="enterprise",
                    requested_modules=json.dumps(["catalog", "orders", "customers", "inventory", "ai-os"]),
                    wants_ai=True,
                    industry="Consumer Electronics",
                    deployment_mode="enterprise",
                    region="Asia/Dhaka",
                    website="https://novaelectronics.com",
                    employee_count="50+",
                    referral_source="Direct sales",
                    operator_notes="Requires AI — verify enterprise quote.",
                    status="pending_review",
                ),
            ])
            db.commit()
            print("Sample registrations seeded (2 pending)")
        else:
            print("Registrations already exist, skipping seed.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
