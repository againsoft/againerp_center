# AgainERP Control Center — Project Structure

> **Status:** Architecture Documentation  
> **Version:** 1.0  
> **Step:** 16 of 17  
> **Document Type:** Enterprise Architecture — Project Structure  
> **Parent Index:** [MASTER_INDEX.md](./MASTER_INDEX.md)  
> **Previous:** [15 — Deployment Architecture](./15_Deployment.md)

---

## Purpose

Define the complete folder architecture for the Control Center project — documentation, future application code, deployment assets, and integration with the AgainERP ecosystem.

## Scope

Folder structure design for the standalone `control/` project. Implementation code is planned but not included in this documentation phase.

---

## Architecture

### Repository Placement

```
moharaznx/                          # Workspace root (XAMPP htdocs)
├── control/                        # Control Center standalone project
│   ├── .htaccess                   # Apache routing & security
│   ├── README.md                   # Project entry point
│   ├── ControlCenter/              # Architecture documentation (this series)
│   ├── apps/                       # Application code (implementation phase)
│   ├── deploy/                     # Deployment assets
│   ├── agent/                      # Edge Agent project
│   └── scripts/                    # Operational scripts
├── apps/                           # MoharazNX / AgainERP client apps
└── againerp/                       # Parent ecosystem docs (reference)
```

---

## Top-Level Structure

```text
control/
├── .htaccess
├── README.md
├── BRAIN.md                        # AI + developer entry (AgainERP pattern)
├── CHANGELOG.md                    # Control Center change log
│
├── ControlCenter/                  # ← Architecture docs (Steps 01–17)
│   ├── MASTER_INDEX.md
│   ├── 01_System_Vision.md
│   ├── 02_High_Level_Architecture.md
│   ├── 03_Component_Architecture.md
│   ├── 04_Client_Edge_Agent.md
│   ├── 05_Client_Lifecycle.md
│   ├── 06_Database_Architecture.md
│   ├── 07_API_Architecture.md
│   ├── 08_Module_Management.md
│   ├── 09_Subscription_License.md
│   ├── 10_Monitoring.md
│   ├── 11_Backup.md
│   ├── 12_Update_Manager.md
│   ├── 13_Security.md
│   ├── 14_AI_Control.md
│   ├── 15_Deployment.md
│   ├── 16_Project_Structure.md
│   └── 17_Roadmap.md
│
├── apps/
│   ├── web/                        # Control Center UI (Next.js)
│   └── api/                        # Platform API (FastAPI)
│
├── agent/
│   ├── edge-agent/                 # Client Edge Agent (Python/Go)
│   └── agent-protocol/             # Protocol specs + shared types
│
├── deploy/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── Dockerfile.*
│   ├── helm/
│   │   └── control-center/
│   ├── terraform/
│   │   ├── aws/
│   │   ├── azure/
│   │   └── digitalocean/
│   └── nginx/
│       └── control.conf
│
├── scripts/
│   ├── init_db.py                  # Control Center DB seed
│   ├── rotate_keys.sh
│   └── health_check.sh
│
└── docs/                           # Supplementary docs (API specs, runbooks)
    ├── api/
    │   └── openapi/                # OpenAPI 3.1 (Phase 2)
    └── runbooks/
        ├── incident-response.md
        └── disaster-recovery.md
```

---

## Application Structure — `apps/api/`

Follows AgainERP FastAPI modular monolith pattern:

```text
apps/api/
├── main.py                         # Application entry
├── app/
│   ├── config.py                   # Settings (pydantic-settings)
│   ├── database.py                 # SQLAlchemy async engine
│   │
│   ├── models/                     # SQLAlchemy models
│   │   ├── client.py
│   │   ├── server.py
│   │   ├── subscription.py
│   │   ├── license.py
│   │   ├── module.py
│   │   ├── update.py
│   │   ├── health_snapshot.py
│   │   ├── backup_record.py
│   │   ├── audit_log.py
│   │   ├── billing_invoice.py
│   │   ├── api_key.py
│   │   └── agent_token.py
│   │
│   ├── schemas/                    # Pydantic request/response
│   │   ├── client.py
│   │   ├── agent.py
│   │   ├── license.py
│   │   └── ...
│   │
│   ├── routers/                    # API route handlers
│   │   ├── platform/               # /api/v1/platform/*
│   │   │   ├── clients.py
│   │   │   ├── subscriptions.py
│   │   │   ├── licenses.py
│   │   │   ├── modules.py
│   │   │   ├── updates.py
│   │   │   ├── health.py
│   │   │   ├── backups.py
│   │   │   ├── billing.py
│   │   │   ├── audit.py
│   │   │   └── ai_usage.py
│   │   ├── agent/                  # /agent/v1/*
│   │   │   ├── activate.py
│   │   │   ├── heartbeat.py
│   │   │   ├── commands.py
│   │   │   └── token.py
│   │   ├── auth/
│   │   │   └── operators.py
│   │   └── webhooks/
│   │       └── stripe.py
│   │
│   ├── services/                   # Domain logic
│   │   ├── client_registry.py
│   │   ├── license_service.py
│   │   ├── subscription_service.py
│   │   ├── module_service.py
│   │   ├── update_service.py
│   │   ├── monitoring_service.py
│   │   ├── backup_service.py
│   │   ├── notification_service.py
│   │   ├── billing_service.py
│   │   ├── audit_service.py
│   │   └── ai_service.py
│   │
│   ├── events/                     # Domain events
│   │   ├── bus.py
│   │   └── handlers/
│   │
│   └── security/
│       ├── jwt.py
│       ├── mtls.py
│       ├── rbac.py
│       └── kms.py
│
└── scripts/
    └── init_db.py
```

---

## Application Structure — `apps/web/`

Control Center operator UI (Next.js App Router):

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Dashboard redirect
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   │   ├── page.tsx            # Client fleet list
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Client detail
│   │   │       ├── health/
│   │   │       ├── modules/
│   │   │       ├── updates/
│   │   │       ├── backups/
│   │   │       └── audit/
│   │   ├── subscriptions/
│   │   ├── licenses/
│   │   ├── modules/
│   │   ├── updates/
│   │   ├── monitoring/
│   │   ├── billing/
│   │   ├── notifications/
│   │   ├── ai/
│   │   ├── audit/
│   │   └── settings/
│   │       ├── operators/
│   │       └── api-keys/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── control-shell.tsx
│   │   │   ├── control-sidebar.tsx
│   │   │   └── control-header.tsx
│   │   ├── clients/
│   │   ├── monitoring/
│   │   └── shared/
│   │
│   └── lib/
│       ├── api/                    # API client hooks
│       │   ├── client.ts
│       │   ├── use-clients.ts
│       │   └── ...
│       ├── navigation/
│       │   └── control-nav.ts
│       └── store/
│
├── next.config.ts
└── package.json
```

**Route namespace:** `/center/*` or root `/` depending on deployment — aligns with existing MoharazNX center prototype at `apps/web/src/app/center/`.

---

## Edge Agent Structure — `agent/edge-agent/`

```text
agent/edge-agent/
├── main.py                         # Agent entry point
├── app/
│   ├── config.py
│   ├── auth/
│   │   ├── mtls.py
│   │   ├── token_manager.py
│   │   └── vault.py
│   ├── heartbeat/
│   │   ├── collector.py            # Metrics collection
│   │   └── sender.py
│   ├── commands/
│   │   ├── executor.py
│   │   ├── verify.py               # JWS verification
│   │   └── handlers/
│   │       ├── module.py
│   │       ├── update.py
│   │       ├── backup.py
│   │       └── diagnostics.py
│   ├── sync/
│   │   ├── license.py
│   │   ├── config.py
│   │   └── features.py
│   └── api/
│       └── local.py                # localhost admin API
├── Dockerfile
└── docker-compose.agent.yml
```

---

## Documentation Conventions

Follow AgainERP [MODULE_STRUCTURE.md](../../againerp/docs/00-foundation/MODULE_STRUCTURE.md):

| File | Purpose |
|------|---------|
| `BRAIN.md` | Cursor/AI entry point |
| `README.md` | Human entry point |
| `ControlCenter/MASTER_INDEX.md` | Architecture doc hub |
| `CHANGELOG.md` | Version history |

Every architecture doc includes: Purpose, Scope, Architecture, Responsibilities, Workflow, Mermaid diagrams, Best Practices, Security Notes, Future Improvements, Summary.

---

## Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| DB tables | snake_case plural | `clients`, `health_snapshots` |
| API routes | kebab-case | `/api/v1/platform/clients` |
| Agent routes | `/agent/v1/` prefix | `/agent/v1/heartbeat` |
| Python modules | snake_case | `license_service.py` |
| React components | PascalCase | `ClientGrid.tsx` |
| Env vars | `CONTROL_` prefix | `CONTROL_DATABASE_URL` |

---

## Integration with MoharazNX

Existing center prototype provides UI starting point:

| Existing path | Control Center equivalent |
|---------------|---------------------------|
| `apps/web/src/app/center/` | Operator UI prototype |
| `apps/web/src/lib/mock-data/center.ts` | Mock data (replace with API) |
| `apps/web/src/lib/navigation/center-nav.ts` | Navigation config |

Implementation phase wires mock center UI to real Control Center API per lean roadmap pattern.

---

## Best Practices

- Monorepo: `control/` is self-contained but references AgainERP standards
- Shared design tokens from `apps/web/src/design-system/` (reuse, don't fork)
- Agent protocol versioned independently from ERP version
- No client business logic in `control/apps/` — platform metadata only

---

## Security Notes

- `control/.htaccess` blocks script execution in documentation tree
- Production secrets never in repo — `.env.example` only
- Agent credentials directory gitignored

---

## Future Improvements

| Improvement | Phase |
|-------------|-------|
| Extract `control/` to standalone git repo | Phase 2 |
| Shared `@againerp/agent-protocol` npm/pypi package | Phase 2 |
| Turborepo monorepo integration | Phase 3 |

---

## Summary

The Control Center project lives at `control/` with architecture docs in `ControlCenter/`, future application code in `apps/web` and `apps/api`, Edge Agent in `agent/edge-agent/`, and deployment assets in `deploy/`. Structure follows AgainERP conventions — modular FastAPI backend, Next.js admin UI, Docker-native deployment.

**Next:** [17 — Future Roadmap](./17_Roadmap.md)
