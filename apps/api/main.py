from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import SessionLocal
from app.deps.auth import get_current_operator
from app.routers import agent, agents, ai, api_keys, audit, auth, backups, billing, clients, health, licenses, modules, monitoring, notifications, operators, pagespeed, platform_settings, registrations, servers, subscriptions, updates, webhooks

settings = get_settings()
require_auth = [Depends(get_current_operator)]

OPENAPI_TAGS = [
    {"name": "health", "description": "Public liveness and readiness probes."},
    {"name": "auth", "description": "Operator login, session, MFA (TOTP), and step-up verification."},
    {"name": "operators", "description": "Control Center operator accounts and MFA status."},
    {"name": "clients", "description": "Client fleet registry — create, list, and update installations."},
    {"name": "registrations", "description": "Inbound signup queue; approve/reject provisions a client."},
    {"name": "subscriptions", "description": "Plan subscriptions per client."},
    {"name": "licenses", "description": "License keys and reissue flows."},
    {"name": "audit", "description": "Immutable operator and system audit trail."},
    {"name": "servers", "description": "Registered ERP server nodes per client."},
    {"name": "monitoring", "description": "Agent heartbeat and fleet health snapshots."},
    {"name": "billing", "description": "Invoices and billing status (Stripe-backed)."},
    {"name": "updates", "description": "ERP version catalog and staged fleet rollouts."},
    {"name": "modules", "description": "Module registry and per-client enablement."},
    {"name": "backups", "description": "Backup policies, runs, and verification."},
    {"name": "platform-settings", "description": "Global platform configuration key-value store."},
    {"name": "pagespeed", "description": "PageSpeed Insights audits — platform key proxy for client stores."},
    {"name": "api-keys", "description": "Scoped API keys for integrations and partners."},
    {"name": "ai", "description": "Fleet AI OS provisioning, credits, platform agents, and Chief AI briefing."},
    {"name": "notifications", "description": "Derived platform notifications for operators."},
    {"name": "webhooks", "description": "Inbound provider webhooks (Stripe)."},
    {"name": "agents", "description": "Edge Agent console — commands, activations, sync queues, diagnostics."},
    {"name": "agent", "description": "Edge Agent APIs — heartbeat, activation, commands."},
]

API_DESCRIPTION = """
Central control plane REST API for AgainERP operators and Edge Agents.

**Operator API** — prefix `/api/v1/*` — requires `Authorization: Bearer {jwt}` unless noted.

**Agent API** — prefix `/agent/v1/*` — requires agent bearer token (mTLS in production).

**Webhooks** — prefix `/webhooks/v1/*` — provider-signed inbound events.

High-risk actions (e.g. registration approval) require MFA step-up within a 5-minute window when MFA is enabled.
"""


def _bootstrap() -> None:
    from app.database import Base, engine
    from app.schema_sync import ensure_schema
    from app.models import (  # noqa: F401 — register all models
        activation_bundle,
        agent_command,
        agent_diagnostic,
        agent_token,
        api_key,
        audit_log,
        backup_policy,
        backup_record,
        billing_invoice,
        client,
        client_ai_access,
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

    Base.metadata.create_all(bind=engine)
    ensure_schema(engine)

    db = SessionLocal()
    try:
        from app.models.operator import Operator
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
            print("[Center] Default super_admin created: admin@againerp.com / Admin@1234")

        from app.models.registration import Registration
        import json

        if db.query(Registration).count() == 0:
            seeds = [
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
            ]
            db.add_all(seeds)
            db.commit()
            print("[Center] Sample registrations seeded")

        from app.services.billing_service import seed_sample_invoices
        seeded = seed_sample_invoices(db)
        if seeded:
            print(f"[Center] Sample billing invoices seeded ({seeded})")

        from app.services.update_service import ensure_client_update_states, seed_erp_versions, seed_sample_rollout
        ver_count = seed_erp_versions(db)
        if ver_count:
            print(f"[Center] ERP versions seeded ({ver_count})")
        ensure_client_update_states(db)
        roll_count = seed_sample_rollout(db)
        if roll_count:
            print(f"[Center] Sample update rollouts seeded ({roll_count})")

        from app.services.module_service import provision_client_modules, seed_module_registry
        mod_count = seed_module_registry(db)
        if mod_count:
            print(f"[Center] Module registry seeded ({mod_count})")
        from app.models.client import Client as ClientModel
        from app.models.client_module import ClientModule
        for c in db.query(ClientModel).all():
            has_modules = db.query(ClientModule).filter(ClientModule.client_id == c.id).count() > 0
            if not has_modules:
                provision_client_modules(db, c.id, plan=c.plan)

        from app.services.backup_service import ensure_backup_policy, seed_sample_backups
        for c in db.query(ClientModel).all():
            ensure_backup_policy(db, c.id, c.plan)
        bk_count = seed_sample_backups(db)
        if bk_count:
            print(f"[Center] Sample backup records seeded ({bk_count})")

        from app.services.api_key_service import seed_sample_api_keys
        key_count = seed_sample_api_keys(db)
        if key_count:
            print(f"[Center] Sample API keys seeded ({key_count})")

        from app.services.ai_service import ensure_client_ai_access, seed_sample_ai_usage
        for c in db.query(ClientModel).all():
            ensure_client_ai_access(db, c.id, plan=c.plan)
        ai_count = seed_sample_ai_usage(db)
        if ai_count:
            print(f"[Center] Sample AI usage seeded ({ai_count} clients)")

        from app.services.agent_console_service import seed_agent_console
        agent_seed = seed_agent_console(db)
        if agent_seed:
            print(f"[Center] Agent console sample data seeded ({agent_seed} commands)")
    except Exception as e:
        print(f"[Center] Bootstrap error: {e}")
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    import threading
    threading.Thread(target=_bootstrap, daemon=True).start()
    yield


app = FastAPI(
    title="AgainERP Control Center API",
    version="2.0.0",
    description=API_DESCRIPTION,
    openapi_version="3.1.0",
    openapi_tags=OPENAPI_TAGS,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    redirect_slashes=False,
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1")
app.include_router(operators.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(clients.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(registrations.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(subscriptions.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(licenses.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(audit.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(servers.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(agents.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(monitoring.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(billing.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(updates.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(modules.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(backups.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(api_keys.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(ai.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(notifications.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(platform_settings.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(pagespeed.router, prefix="/api/v1", dependencies=require_auth)
app.include_router(webhooks.router)
app.include_router(agent.router)


@app.get("/")
def root() -> dict:
    return {
        "app": "AgainERP Control Center",
        "version": "2.0.0",
        "phase": "2-growth",
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
        "spec_file": "docs/api/openapi/control-center.openapi.json",
        "endpoints": {
            "auth": "/api/v1/auth/login",
            "operators": "/api/v1/operators/",
            "clients": "/api/v1/clients/",
            "registrations": "/api/v1/registrations/",
            "subscriptions": "/api/v1/subscriptions/",
            "licenses": "/api/v1/licenses/",
            "billing": "/api/v1/billing/invoices",
            "updates": "/api/v1/updates/fleet",
            "modules": "/api/v1/modules/",
            "backups": "/api/v1/backups/fleet",
            "api_keys": "/api/v1/api-keys/",
            "ai": "/api/v1/ai/fleet",
            "notifications": "/api/v1/notifications/",
            "ai_briefing": "/api/v1/ai/briefing",
            "audit": "/api/v1/audit/",
            "servers": "/api/v1/servers/",
            "monitoring": "/api/v1/monitoring/agents",
            "agents": "/api/v1/agents/commands",
            "stripe_webhook": "/webhooks/v1/stripe",
            "agent_heartbeat": "/agent/v1/heartbeat",
            "settings": "/api/v1/platform-settings/",
        },
    }
