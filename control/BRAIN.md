# Control Center — Developer Entry

> **Cursor:** Read this before implementing Control Center features.

## Purpose

Entry point for the AgainERP Control Center standalone project.

## Read Order

1. [ControlCenter/MASTER_INDEX.md](./ControlCenter/MASTER_INDEX.md)
2. [01 — System Vision](./ControlCenter/01_System_Vision.md)
3. Task-specific doc from MASTER_INDEX

## Rules

- **Follow architecture docs** — [`ControlCenter/MASTER_INDEX.md`](./ControlCenter/MASTER_INDEX.md)
- **Metadata only** — never store client business data in Control Center
- **Follow AgainERP standards** — [TECHNOLOGY_CONSTITUTION](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md)
- **Edge Agent** is the only bridge to client servers

## Implementation Status

**Phase 2 Growth — IN PROGRESS** (v2.0.0-alpha)

| Component | Path | Status |
|-----------|------|--------|
| API | `apps/api/` | Phase 1 + billing + MFA + OpenAPI 3.1 |
| UI | `apps/web/` | Billing, Updates, Modules, Backups, MFA, API keys, AI, Agent console live |
| OpenAPI | `docs/api/openapi/` | Static + live `/openapi.json` |
| Edge Agent | `agent/edge-agent/` | Heartbeat sender |
| Deploy | `deploy/docker/` | PostgreSQL + Redis |
| Scripts | `setup.sh`, `start.sh`, `scripts/` | Dev tooling |

**Phase 2 next:** Wire notifications + dashboard briefing to live API.

## Parent Ecosystem

- [AgainERP HYBRID_LICENSED_ERP_ARCHITECTURE](../againerp/docs/01-architecture/HYBRID_LICENSED_ERP_ARCHITECTURE.md)
- [CLOUD_CONTROL_PLANE](../againerp/docs/07-saas/CLOUD_CONTROL_PLANE.md)
