import json
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.client_module import ClientModule
from app.models.module_registry import ModuleRegistry
from app.models.subscription import Subscription

CORE_MODULES = {"catalog", "orders", "customers"}

MODULE_SEEDS = [
    {
        "code": "catalog",
        "label": "Catalog",
        "description": "Products, categories, brands, variants",
        "tier": "core",
        "dependencies": "[]",
        "min_erp_version": "2026.1.0",
        "platform_default": True,
        "feature_flag_key": "module.catalog",
        "is_core": True,
    },
    {
        "code": "orders",
        "label": "Orders",
        "description": "Order management, payments, shipments",
        "tier": "core",
        "dependencies": json.dumps(["catalog", "customers"]),
        "min_erp_version": "2026.1.0",
        "platform_default": True,
        "feature_flag_key": "module.orders",
        "is_core": True,
    },
    {
        "code": "customers",
        "label": "Customers",
        "description": "CRM, segments, support",
        "tier": "core",
        "dependencies": "[]",
        "min_erp_version": "2026.1.0",
        "platform_default": True,
        "feature_flag_key": "module.customers",
        "is_core": True,
    },
    {
        "code": "inventory",
        "label": "Inventory",
        "description": "Stock, warehouses, alerts",
        "tier": "core",
        "dependencies": json.dumps(["catalog"]),
        "min_erp_version": "2026.2.0",
        "platform_default": True,
        "feature_flag_key": "module.inventory",
        "is_core": False,
    },
    {
        "code": "marketing",
        "label": "Marketing",
        "description": "Campaigns, coupons, journeys",
        "tier": "growth",
        "dependencies": json.dumps(["catalog", "customers"]),
        "min_erp_version": "2026.3.0",
        "platform_default": False,
        "feature_flag_key": "module.marketing",
        "is_core": False,
    },
    {
        "code": "suppliers",
        "label": "Suppliers",
        "description": "PO, RFQ, vendor management",
        "tier": "growth",
        "dependencies": json.dumps(["inventory"]),
        "min_erp_version": "2026.3.0",
        "platform_default": False,
        "feature_flag_key": "module.suppliers",
        "is_core": False,
    },
    {
        "code": "seo",
        "label": "SEO",
        "description": "Meta, schema, sitemap",
        "tier": "growth",
        "dependencies": json.dumps(["catalog"]),
        "min_erp_version": "2026.4.0",
        "platform_default": False,
        "feature_flag_key": "module.seo",
        "is_core": False,
    },
    {
        "code": "media",
        "label": "Media",
        "description": "Asset library & CDN",
        "tier": "growth",
        "dependencies": "[]",
        "min_erp_version": "2026.2.0",
        "platform_default": True,
        "feature_flag_key": "module.media",
        "is_core": False,
    },
    {
        "code": "configurator",
        "label": "Configurator",
        "description": "PC builder & product configurator",
        "tier": "premium",
        "dependencies": json.dumps(["catalog", "inventory"]),
        "min_erp_version": "2026.5.0",
        "platform_default": False,
        "feature_flag_key": "module.configurator",
        "is_core": False,
    },
    {
        "code": "reports",
        "label": "Reports",
        "description": "Analytics & exports",
        "tier": "premium",
        "dependencies": json.dumps(["orders"]),
        "min_erp_version": "2026.4.0",
        "platform_default": False,
        "feature_flag_key": "module.reports",
        "is_core": False,
    },
    {
        "code": "ai-os",
        "label": "AI OS",
        "description": "Agents, tools, approvals, audit",
        "tier": "premium",
        "dependencies": json.dumps(["catalog"]),
        "min_erp_version": "2026.6.0",
        "platform_default": False,
        "feature_flag_key": "module.ai_os",
        "is_core": False,
    },
]

PLAN_MODULES: dict[str, set[str]] = {
    "starter": {"catalog", "orders", "customers", "inventory", "media"},
    "business": {"catalog", "orders", "customers", "inventory", "media", "marketing", "suppliers", "seo"},
    "professional": {
        "catalog", "orders", "customers", "inventory", "media",
        "marketing", "suppliers", "seo", "reports",
    },
    "enterprise": {m["code"] for m in MODULE_SEEDS},
    "custom": {m["code"] for m in MODULE_SEEDS},
}


def seed_module_registry(db: Session) -> int:
    if db.query(ModuleRegistry).count() > 0:
        return 0
    for seed in MODULE_SEEDS:
        db.add(ModuleRegistry(**seed))
    db.commit()
    return len(MODULE_SEEDS)


def _all_modules(db: Session) -> list[ModuleRegistry]:
    return db.query(ModuleRegistry).order_by(ModuleRegistry.tier, ModuleRegistry.label).all()


def _client_plan(db: Session, client_id: str) -> str:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return "starter"
    sub = (
        db.query(Subscription)
        .filter(Subscription.client_id == client_id)
        .order_by(Subscription.created_at.desc())
        .first()
    )
    return (sub.plan if sub else client.plan).lower()


def _plan_allows(db: Session, client_id: str, module_code: str) -> bool:
    plan = _client_plan(db, client_id)
    allowed = PLAN_MODULES.get(plan, PLAN_MODULES["starter"])
    return module_code in allowed


def _enabled_codes(db: Session, client_id: str) -> set[str]:
    rows = db.query(ClientModule).filter(
        ClientModule.client_id == client_id,
        ClientModule.status == "enabled",
    ).all()
    return {r.module_code for r in rows}


def _resolve_with_dependencies(db: Session, codes: set[str]) -> set[str]:
    modules = {m.code: m for m in _all_modules(db)}
    resolved: set[str] = set()

    def add(code: str) -> None:
        if code in resolved or code not in modules:
            return
        for dep in modules[code].dependency_list():
            add(dep)
        resolved.add(code)

    for code in codes:
        add(code)
    return resolved


def provision_client_modules(
    db: Session,
    client_id: str,
    *,
    plan: Optional[str] = None,
    extra_modules: Optional[list[str]] = None,
) -> list[ClientModule]:
    plan_key = (plan or "starter").lower()
    base = set(PLAN_MODULES.get(plan_key, PLAN_MODULES["starter"]))
    defaults = {m.code for m in _all_modules(db) if m.platform_default}
    requested = set(extra_modules or [])
    target = _resolve_with_dependencies(db, base | defaults | requested)

    now = datetime.utcnow()
    created: list[ClientModule] = []
    for code in target:
        existing = db.query(ClientModule).filter(
            ClientModule.client_id == client_id,
            ClientModule.module_code == code,
        ).first()
        if existing:
            if existing.status != "enabled":
                existing.status = "enabled"
                existing.enabled_at = now
                existing.disabled_at = None
            continue
        row = ClientModule(
            id=f"cmod_{uuid.uuid4().hex[:12]}",
            client_id=client_id,
            module_code=code,
            status="enabled",
            enabled_at=now,
        )
        db.add(row)
        created.append(row)

    db.commit()
    return created


def module_to_dict(m: ModuleRegistry) -> dict:
    return {
        "id": m.code,
        "code": m.code,
        "label": m.label,
        "description": m.description,
        "tier": m.tier,
        "dependencies": m.dependency_list(),
        "min_erp_version": m.min_erp_version,
        "platform_default": m.platform_default,
        "feature_flag_key": m.feature_flag_key,
        "is_core": m.is_core,
    }


def get_dependents(db: Session, module_code: str) -> list[ModuleRegistry]:
    return [m for m in _all_modules(db) if module_code in m.dependency_list()]


def _get_enabled_dependents(db: Session, client_id: str, module_code: str) -> list[str]:
    enabled = _enabled_codes(db, client_id)
    return [m.code for m in get_dependents(db, module_code) if m.code in enabled]


def enable_module(db: Session, client_id: str, module_code: str) -> ClientModule:
    mod = db.query(ModuleRegistry).filter(ModuleRegistry.code == module_code).first()
    if not mod:
        raise ValueError("Module not found")
    if not _plan_allows(db, client_id, module_code):
        raise ValueError(f"Module '{module_code}' not included in client plan")

    enabled = _enabled_codes(db, client_id)
    for dep in mod.dependency_list():
        if dep not in enabled:
            raise ValueError(f"Dependency '{dep}' must be enabled first")

    now = datetime.utcnow()
    row = db.query(ClientModule).filter(
        ClientModule.client_id == client_id,
        ClientModule.module_code == module_code,
    ).first()
    if row:
        row.status = "enabled"
        row.enabled_at = now
        row.disabled_at = None
    else:
        row = ClientModule(
            id=f"cmod_{uuid.uuid4().hex[:12]}",
            client_id=client_id,
            module_code=module_code,
            status="enabled",
            enabled_at=now,
        )
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


def disable_module(db: Session, client_id: str, module_code: str) -> ClientModule:
    if module_code in CORE_MODULES:
        raise ValueError(f"Core module '{module_code}' cannot be disabled")

    dependents = _get_enabled_dependents(db, client_id, module_code)
    if dependents:
        raise ValueError(f"Disable dependents first: {', '.join(dependents)}")

    row = db.query(ClientModule).filter(
        ClientModule.client_id == client_id,
        ClientModule.module_code == module_code,
    ).first()
    if not row:
        raise ValueError("Module not enabled for client")

    now = datetime.utcnow()
    row.status = "disabled"
    row.disabled_at = now
    db.commit()
    db.refresh(row)
    return row


def _disable_order(db: Session, codes: set[str]) -> list[str]:
    """Disable dependents before their dependencies."""
    modules = {m.code: m for m in _all_modules(db)}
    remaining = set(codes)
    ordered: list[str] = []
    while remaining:
        leaves = [
            code for code in remaining
            if not any(
                dep in remaining
                for dep in get_dependents(db, code)
                if dep.code in remaining
            )
        ]
        if not leaves:
            ordered.extend(sorted(remaining))
            break
        for code in sorted(leaves):
            ordered.append(code)
            remaining.remove(code)
    return ordered


def set_client_modules(db: Session, client_id: str, enabled_modules: list[str]) -> list[str]:
    """Bulk sync enabled modules with dependency and core rules."""
    requested = set(enabled_modules)

    for code in CORE_MODULES:
        requested.add(code)

    resolved = _resolve_with_dependencies(db, requested)

    for code in resolved:
        if not _plan_allows(db, client_id, code):
            raise ValueError(f"Module '{code}' not included in client plan")

    currently_enabled = _enabled_codes(db, client_id)
    to_disable = currently_enabled - resolved
    for code in _disable_order(db, to_disable):
        disable_module(db, client_id, code)

    for code in resolved:
        if code not in _enabled_codes(db, client_id):
            enable_module(db, client_id, code)

    return sorted(_enabled_codes(db, client_id))


def client_modules_state(db: Session, client_id: str) -> list[dict]:
    enabled = _enabled_codes(db, client_id)
    plan = _client_plan(db, client_id)
    allowed = PLAN_MODULES.get(plan, PLAN_MODULES["starter"])

    result = []
    for mod in _all_modules(db):
        is_enabled = mod.code in enabled
        blocked = None
        can_enable = not is_enabled
        can_disable = is_enabled and mod.code not in CORE_MODULES

        if not is_enabled:
            if mod.code not in allowed:
                can_enable = False
                blocked = "Not included in subscription plan"
            else:
                for dep in mod.dependency_list():
                    if dep not in enabled:
                        can_enable = False
                        blocked = f"Requires {dep}"
                        break
        elif mod.code in CORE_MODULES:
            can_disable = False
            blocked = "Core module"
        elif _get_enabled_dependents(db, client_id, mod.code):
            can_disable = False
            blocked = "Has active dependents"

        result.append({
            **module_to_dict(mod),
            "enabled": is_enabled,
            "status": "enabled" if is_enabled else "disabled",
            "can_enable": can_enable,
            "can_disable": can_disable,
            "blocked_reason": blocked,
        })
    return result


def compute_module_stats(db: Session) -> dict:
    modules = _all_modules(db)
    tiers = {"core": 0, "growth": 0, "premium": 0}
    tier_defaults = {"core": 0, "growth": 0, "premium": 0}
    client_counts: dict[str, int] = {m.code: 0 for m in modules}

    for mod in modules:
        if mod.tier in tiers:
            tiers[mod.tier] += 1
        if mod.platform_default and mod.tier in tier_defaults:
            tier_defaults[mod.tier] += 1

    rows = db.query(ClientModule).filter(ClientModule.status == "enabled").all()
    for row in rows:
        if row.module_code in client_counts:
            client_counts[row.module_code] += 1

    total_clients = db.query(Client).count()
    return {
        "tiers": tiers,
        "tier_defaults": tier_defaults,
        "client_counts": client_counts,
        "total_clients": total_clients,
        "module_count": len(modules),
    }


def get_client_enabled_module_codes(db: Session, client_id: str) -> list[str]:
    return sorted(_enabled_codes(db, client_id))
