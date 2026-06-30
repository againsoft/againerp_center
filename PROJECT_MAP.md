# AgainERP Center — Project Map

> **Constitution:** [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md) — read first  
> **Generated reference** for repository structure, module boundaries, APIs, packages, and architecture.  
> **Developer entry:** [BRAIN.md](./BRAIN.md)

---

## Mandatory read order

1. [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md)
2. [docs/FROZEN_RULES.md](./docs/FROZEN_RULES.md)
3. [docs/DEVELOPMENT_RULES.md](./docs/DEVELOPMENT_RULES.md)
4. [README.md](./README.md)
5. [MASTER_INDEX.md](./MASTER_INDEX.md)
6. [PROJECT_MAP.md](./PROJECT_MAP.md) (this file)
7. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
8. [ControlCenter/MASTER_INDEX.md](./ControlCenter/MASTER_INDEX.md)
9. Task-specific documentation

---

## Architecture freeze

| Field | Value |
|-------|-------|
| Architecture Version | **1.0.0** |
| Status | **FROZEN** |
| Platform Brain | AgainERP Center |
| Business ERP Template | MoharazNX |

Package ownership: [docs/PLATFORM_PACKAGE_OWNERSHIP.md](./docs/PLATFORM_PACKAGE_OWNERSHIP.md)

---

## 1. Purpose & Scope

**AgainERP Center** (aka Control Center) is the AgainSoft **platform control plane** — a standalone operator console for managing client fleets, subscriptions, licenses, edge agents, AI access, billing, and platform governance.

| In scope | Out of scope |
|----------|--------------|
| Client metadata, health, licensing, billing | Tenant business data (orders, catalog, PII) |
| Operator UI + Platform API + Edge Agent | MoharazNX storefront / tenant ERP modules |
| Fleet monitoring, updates, backups (metadata) | Client PostgreSQL row storage |

**Sibling project:** [MoharazNX](../moharaznx/) — client ERP template. Consumes packages from `platform/`.

**Architecture:** Two repositories only — no third platform repo. See [MASTER_INDEX.md](./MASTER_INDEX.md).

---

## 2. System Architecture

```mermaid
flowchart TB
    subgraph Operators["AgainSoft Operators"]
        OP[Browser]
    end

    subgraph Center["AgainERP Center (this repo)"]
        WEB["apps/web — Next.js UI :3100"]
        API["apps/api — FastAPI :8100"]
        PLAT["platform/ — SDKs"]
        DB[(PostgreSQL)]
        REDIS[(Redis)]
        WEB --> API
        API --> PLAT
        API --> DB
        API --> REDIS
    end

    subgraph ClientSite["MoharazNX — Client ERP"]
        MOHA[MoharazNX apps]
        MOHA -->|@againerp/runtime| PLAT
        MOHA -->|@againerp/contracts| PLAT
        EA["edge-agent"]
        EA --> API
    end

    OP --> WEB
    OP --> API
```

### Layer responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Operator UI** | `apps/web` | Dashboard, fleet management, settings |
| **Platform API** | `apps/api` | REST, agent protocol, webhooks, AI gateway (future) |
| **Platform SDKs** | `platform/` | Contracts, runtime, provider gateway, plugin SDK |
| **Edge Agent** | `agent/edge-agent` | Heartbeat, metrics, command execution |
| **Architecture docs** | `ControlCenter/` | Enterprise architecture SSOT (Steps 01–18) |
| **Migration docs** | `docs/` | Architecture migration reports |
| **Deployment** | `deploy/` | Docker Compose, Vercel, Railway |
| **Operations** | `scripts/` | DB init, backup, OpenAPI export |

---

## 3. Repository Layout

```
againerp-center/
├── MASTER_INDEX.md             # Ecosystem navigation hub
├── BRAIN.md
├── PROJECT_MAP.md              # This file
├── README.md
├── CHANGELOG.md
├── setup.sh · start.sh
│
├── apps/
│   ├── web/                    # Operator UI
│   └── api/                    # Platform FastAPI
│
├── platform/                   # ✅ All platform SDKs (no third repo)
│   ├── README.md
│   ├── shared-contracts/       # @againerp/contracts v1.0.0 — dto, events, types, protocols, errors
│   ├── runtime-sdk/            # @againerp/runtime — conversation, context, connectors, streaming
│   ├── provider-gateway/       # providers/openai, claude, gemini, azure, deepseek, ollama, openrouter
│   ├── ai-core/                # kernel, orchestrator, registry, context, prompt, memory, knowledge, tools, providers, security
│   ├── plugin-sdk/
│   ├── integration-sdk/
│   ├── edge-sdk/
│   ├── monitoring-sdk/
│   ├── licensing-sdk/
│   ├── update-sdk/
│   └── governance/
│
├── agent/edge-agent/
├── ControlCenter/              # Architecture docs 01–18
├── docs/
│   ├── AGAINERP_PLATFORM_CONSTITUTION.md   # Permanent SSOT
│   ├── PLATFORM_GOVERNANCE_CONFIRMATION.md
│   ├── ARCHITECTURE.md
│   ├── FROZEN_RULES.md
│   ├── ARCHITECTURE_MIGRATION_REPORT.md
│   ├── FOLDER_MIGRATION_REPORT.md
│   ├── MIGRATION_CHECKLIST.md
│   └── PLATFORM_ECOSYSTEM_AUDIT.md
├── deploy/
├── scripts/
├── backups/db/
└── control/                    # ⚠ Legacy mirror — use ControlCenter/
```

---

## 4. Module Boundaries

### 4.1 Three deployable units

| Module | Package name | Port (default) | Deploy target |
|--------|--------------|----------------|---------------|
| **Web UI** | `againerp-center-web` | 3100 (`npm run dev`) | Vercel |
| **Platform API** | — (Python app) | 8100 / 8001 | Railway, Docker |
| **Edge Agent** | — (Python app) | — (outbound only) | Client Docker / systemd |

There is **no Turborepo / shared npm workspace** yet. Web and API are independent packages with separate dependency trees.

### 4.2 Data boundary rule

```
┌─────────────────────────────────────────────────────────┐
│  Center stores METADATA ONLY                            │
│  clients, licenses, heartbeats, audit, billing refs     │
├─────────────────────────────────────────────────────────┤
│  Client ERP stores BUSINESS DATA                        │
│  orders, products, customers — stays on client infra    │
└─────────────────────────────────────────────────────────┘
```

Edge Agent reports health metrics and receives signed commands — it never uploads business DB rows to Center.

### 4.3 UI ↔ API boundary

```
Page (app/) → Feature component (components/center/*)
           → Hook (lib/hooks/*)
           → API client (lib/api/*)
           → Adapter (lib/adapters/*)  ← maps API shapes → UI types
           → FastAPI router → Service → SQLAlchemy model
```

Adapters bridge FastAPI snake_case responses to the UI's `Center*` types (originally defined in mock data).

### 4.4 Operator vs Agent API boundary

| Surface | Prefix | Auth | Consumers |
|---------|--------|------|-----------|
| Operator REST | `/api/v1/*` | Bearer JWT (operator) | Web UI, integrations |
| Edge Agent | `/agent/v1/*` | Agent bearer token (+ mTLS in prod) | `agent/edge-agent` |
| Webhooks | `/webhooks/v1/*` | Provider signature (Stripe) | Stripe |
| Health | `/health` | None | Load balancers, probes |

---

## 5. `apps/web/` — Operator UI

**Stack:** Next.js 16.2, React 19, Tailwind CSS 4, Radix UI, Zustand, Recharts, AG Grid, cmdk

### 5.1 Directory structure

```
apps/web/
├── src/
│   ├── app/                    # App Router pages (root routes, no /center prefix)
│   ├── components/
│   │   ├── center/             # Feature components by domain
│   │   ├── layout/             # Auth guard
│   │   ├── providers/          # Theme + app context
│   │   ├── theme/              # Theme provider, switch
│   │   └── ui/                 # shadcn-style primitives (button, sheet, table…)
│   ├── design-system/          # Design tokens (colors, spacing, typography, themes)
│   └── lib/
│       ├── adapters/           # API → UI type mappers (17 adapters)
│       ├── api/                # Typed fetch clients per resource
│       ├── hooks/              # Data hooks + notifications context
│       ├── mock-data/          # Legacy mock SSOT (center.ts)
│       ├── navigation/         # Sidebar nav, command palette, live routes
│       ├── store/              # Zustand stores (auth, sidebar, theme, notifications)
│       ├── theme/              # Theme resolution utilities
│       └── utils.ts            # cn() and shared helpers
├── public/
├── next.config.ts              # Rewrites /api/v1 → API backend
├── package.json
├── Dockerfile
└── .env.example
```

### 5.2 Routes

All routes are at **root** — no `/center` prefix.

| Route | Page file | Domain |
|-------|-----------|--------|
| `/` | `app/page.tsx` | Dashboard |
| `/clients` | `app/clients/page.tsx` | Client fleet |
| `/clients/[id]` | `app/clients/[id]/page.tsx` | Client detail |
| `/registrations` | `app/registrations/page.tsx` | Signup queue |
| `/subscriptions` | `app/subscriptions/page.tsx` | Plans & fleet subs |
| `/licenses` | `app/licenses/page.tsx` | License keys |
| `/billing` | `app/billing/page.tsx` | Invoices |
| `/modules` | `app/modules/page.tsx` | Module registry |
| `/updates` | `app/updates/page.tsx` | Fleet rollouts |
| `/agents` | `app/agents/page.tsx` | Edge Agent console |
| `/monitoring` | `app/monitoring/page.tsx` | Health & alerts |
| `/backups` | `app/backups/page.tsx` | Backup policies & runs |
| `/ai-access` | `app/ai-access/page.tsx` | AI provisioning |
| `/notifications` | `app/notifications/page.tsx` | Platform notifications |
| `/audit` | `app/audit/page.tsx` | Audit log |
| `/databases` | `app/databases/page.tsx` | Database overview |
| `/settings` | `app/settings/page.tsx` | Settings hub |
| `/settings/operators` | `app/settings/operators/page.tsx` | Operator accounts |
| `/settings/api-keys` | `app/settings/api-keys/page.tsx` | API keys |
| `/settings/integrations` | `app/settings/integrations/page.tsx` | Integrations |

Navigation config: `src/lib/navigation/center-nav.ts`

### 5.3 Component domains (`components/center/`)

| Folder | Responsibility |
|--------|----------------|
| `dashboard/` | KPI grid, fleet health, Chief AI briefing, activity feed |
| `clients/` | Fleet list, grid, detail, toolbar |
| `registrations/` | Onboarding queue, review sheet |
| `subscriptions/` | Plan catalog, fleet subscription table |
| `licenses/` | License list/grid, detail sheet |
| `billing/` | Invoices, fleet billing table, stats |
| `modules/` | Module registry, tier stats, enablement |
| `updates/` | Version catalog, rollouts, fleet update grid |
| `agents/` | Commands, diagnostics, sync queues, activation bundles |
| `monitoring/` | Fleet charts, alerts, health grid |
| `backups/` | Backup runs, policies, fleet grid |
| `ai-access/` | AI provisioning, platform agents, recommendations |
| `notifications/` | Notification list |
| `audit/` | Audit log grid, detail sheet |
| `settings/` | Operators, API keys, integrations hub |
| *(shell)* | `center-shell`, `center-sidebar`, `center-header`, command palette |

### 5.4 Shared libraries (web-internal)

| Path | Role |
|------|------|
| `lib/api/client.ts` | `apiFetch()`, `getApiBaseUrl()`, `ApiError` — central HTTP client |
| `lib/api/*.ts` | Per-resource typed API functions (clients, billing, agents…) |
| `lib/adapters/*.ts` | Map API responses → UI `Center*` types |
| `lib/hooks/*.ts` | React hooks wrapping API + adapter layer |
| `lib/store/*.ts` | Zustand global state |
| `design-system/` | CSS variable tokens, light/dark themes |
| `components/ui/` | Reusable UI primitives (not domain-specific) |

### 5.5 API proxy

Local dev: Next.js rewrites `/api/v1/*` and `/health` to the FastAPI backend.

```typescript
// next.config.ts — default target
API_PROXY_TARGET ?? NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8100"
```

Production (Vercel): browser calls same-origin `/api/v1/*`; runtime proxy forwards to Railway API.

---

## 6. `apps/api/` — Platform API

**Stack:** FastAPI 0.111+, SQLAlchemy 2, PostgreSQL, Pydantic Settings, python-jose, bcrypt, pyotp

**Entry:** `main.py` → `FastAPI` app on port 8100 (Docker) or 8001 (`start.sh`)

### 6.1 Directory structure

```
apps/api/
├── main.py                     # App factory, router registration, bootstrap seed
├── app/
│   ├── config.py               # pydantic-settings (DATABASE_URL, CORS, MFA…)
│   ├── database.py             # SQLAlchemy engine + SessionLocal
│   ├── schema_sync.py          # Runtime schema migrations
│   ├── deps/
│   │   ├── auth.py             # JWT operator auth, password hashing
│   │   └── agent.py            # Agent token validation
│   ├── models/                 # SQLAlchemy ORM (23 tables)
│   ├── routers/                # FastAPI route handlers (22 routers)
│   └── services/               # Domain logic (13 services)
├── requirements.txt
├── Dockerfile
├── docker-entrypoint.sh
├── railway.toml
└── .env.example
```

### 6.2 Routers & endpoints

All operator routers mount at `/api/v1` with JWT auth unless noted.

| Router file | Prefix | Tag | Key endpoints |
|-------------|--------|-----|---------------|
| `health.py` | `/health` | health | Liveness probe |
| `auth.py` | `/auth` | auth | Login, MFA, step-up |
| `operators.py` | `/operators` | operators | Operator CRUD |
| `clients.py` | `/clients` | clients | Fleet registry |
| `registrations.py` | `/registrations` | registrations | Signup queue, approve/reject |
| `subscriptions.py` | `/subscriptions` | subscriptions | Plan subscriptions |
| `licenses.py` | `/licenses` | licenses | License keys, reissue |
| `servers.py` | `/servers` | servers | ERP server nodes |
| `monitoring.py` | `/monitoring` | monitoring | Agent heartbeat, health snapshots |
| `agents.py` | `/agents` | agents | Console: commands, diagnostics, sync |
| `billing.py` | `/billing` | billing | Invoices (Stripe-backed) |
| `updates.py` | `/updates` | updates | ERP versions, fleet rollouts |
| `modules.py` | `/modules` | modules | Module registry, client enablement |
| `backups.py` | `/backups` | backups | Policies, runs, verification |
| `api_keys.py` | `/api-keys` | api-keys | Scoped integration keys |
| `ai.py` | `/ai` | ai | AI provisioning, credits, Chief briefing |
| `notifications.py` | `/notifications` | notifications | Derived platform alerts |
| `audit.py` | `/audit` | audit | Immutable audit trail |
| `platform_settings.py` | `/platform-settings` | platform-settings | Global KV config |
| `pagespeed.py` | `/pagespeed` | pagespeed | PageSpeed audit proxy |
| `webhooks.py` | `/webhooks/v1` | webhooks | Stripe inbound |
| `agent.py` | `/agent/v1` | agent | Edge Agent heartbeat, commands |

OpenAPI: `/docs`, `/redoc`, `/openapi.json`  
Exported spec: `docs/api/openapi/control-center.openapi.json`

### 6.3 Services (domain logic)

| Service | Responsibility |
|---------|----------------|
| `license_service.py` | License generation, validation, reissue |
| `billing_service.py` | Invoices, Stripe integration, seed data |
| `update_service.py` | ERP version catalog, rollout orchestration |
| `module_service.py` | Module registry, per-client provisioning |
| `backup_service.py` | Backup policies, run records |
| `ai_service.py` | AI access provisioning, usage, briefing |
| `agent_console_service.py` | Commands, diagnostics, activation bundles |
| `audit_service.py` | Audit log writes |
| `notification_service.py` | Derived notifications from fleet events |
| `api_key_service.py` | API key lifecycle |
| `mfa_service.py` | TOTP MFA for operators |
| `platform_setting_service.py` | Global settings KV |
| `pagespeed_service.py` | Google PageSpeed Insights proxy |

### 6.4 Database models

PostgreSQL database: `againerp_center`

| Model | Table purpose |
|-------|---------------|
| `Client` | Client fleet registry |
| `Server` | Registered ERP server nodes (per instance_id) |
| `Registration` | Inbound signup queue |
| `Subscription` | Plan subscription per client |
| `License` | Signed license keys |
| `Operator` | Control Center operator accounts |
| `AgentToken` | Edge Agent authentication tokens |
| `HealthSnapshot` | Point-in-time health metrics |
| `AuditLog` | Immutable operator/system audit |
| `BillingInvoice` | Invoice records |
| `ErpVersion` | ERP version catalog |
| `UpdateRollout` | Staged fleet update campaigns |
| `ClientUpdateState` | Per-client update progress |
| `ModuleRegistry` | Available ERP modules |
| `ClientModule` | Per-client module enablement |
| `BackupPolicy` | Backup schedule config |
| `BackupRecord` | Backup run metadata |
| `ApiKey` | Integration API keys |
| `ClientAiAccess` | AI provisioning & credits |
| `AgentCommand` | Pending/completed agent commands |
| `AgentDiagnostic` | Diagnostic bundle references |
| `ActivationBundle` | Client activation packages |
| `PlatformSetting` | Global key-value settings |

Schema docs: [ControlCenter/06_Database_Architecture.md](./ControlCenter/06_Database_Architecture.md)

---

## 7. `agent/edge-agent/` — Client Edge Agent

Lightweight Python service running on client infrastructure. Phase 1: heartbeat + metrics.

```
agent/edge-agent/
├── main.py                     # Agent entry loop
├── app/
│   ├── config.py               # AGENT_* env settings
│   ├── identity.py             # Stable instance_id persistence
│   └── heartbeat/
│       ├── collector.py        # CPU, memory, disk via psutil
│       └── sender.py           # POST /agent/v1/heartbeat
├── Dockerfile
├── docker-compose.agent.yml
├── requirements.txt
└── .env.example
```

| Env var | Default | Purpose |
|---------|---------|---------|
| `AGENT_CONTROL_CENTER_URL` | `http://127.0.0.1:8001` | API base URL |
| `AGENT_TOKEN` | — | Bearer token from client creation |
| `AGENT_HEARTBEAT_INTERVAL` | `60` | Seconds between heartbeats |

Architecture spec: [ControlCenter/04_Client_Edge_Agent.md](./ControlCenter/04_Client_Edge_Agent.md)

---

## 8. `deploy/` — Deployment Assets

| Path | Purpose |
|------|---------|
| `deploy/docker/docker-compose.yml` | Local PostgreSQL 16 + Redis 7 |
| `deploy/docker/docker-compose.prod.yml` | Production Compose overlay |
| `deploy/docker/.env.example` | Docker env template |
| `deploy/vercel/README.md` | Vercel web deployment (root: `apps/web`) |
| `deploy/railway/README.md` | Railway API deployment |
| `deploy/railway/env.api.example` | Railway API env vars |
| `deploy/railway/env.web.example` | Railway web env vars |

### Production topology

```
Browser → Vercel (apps/web)
              ↓ /api/v1/* proxy
          Railway (apps/api)
              ↓
          PostgreSQL (Railway)
```

---

## 9. `scripts/` — Operations

| Script | Purpose |
|--------|---------|
| `init_db.py` | Initialize / seed Control Center DB |
| `seed_mock_clients.py` | Seed demo client fleet |
| `export_openapi.py` | Export OpenAPI spec to `docs/api/openapi/` |
| `health_check.sh` | API liveness probe |
| `db-backup.sh` | PostgreSQL backup |
| `db-restore.sh` | PostgreSQL restore |
| `db-export.sh` | Export DB dump |
| `db-import-railway.sh` | Import dump to Railway |
| `db-sync-railway.sh` | Sync local → Railway |
| `db-lib.sh` | Shared DB script helpers |

---

## 10. `ControlCenter/` — Architecture Documentation

Enterprise architecture SSOT. 17 core documents + 21 UI design specs.

| Step | Document | Topic |
|------|----------|-------|
| 01 | System Vision | Why Center/ Center exists |
| 02 | High Level Architecture | Control plane + edge topology |
| 03 | Component Architecture | Service catalog & interactions |
| 04 | Client Edge Agent | Agent protocol, heartbeat, commands |
| 05 | Client Lifecycle | Registration → termination |
| 06 | Database Architecture | Metadata schema |
| 07 | API Architecture | REST, agent, webhook contracts |
| 08 | Module Management | Enable/disable, dependencies |
| 09 | Subscription & License | Plans, signing, grace periods |
| 10 | Monitoring | Metrics, alerts, heartbeat |
| 11 | Backup & DR | Policies, restore, retention |
| 12 | Update Manager | Rollouts, rollback |
| 13 | Security | Zero Trust, RBAC, MFA |
| 14 | AI Control | Chief AI, agent registry |
| 15 | Deployment | Docker, K8s, cloud, hybrid |
| 16 | Project Structure | Folder architecture (implementation) |
| 17 | Roadmap | Future phases |

UI specs: `ControlCenter/UI/UI_01` … `UI_21` — see [UI_MASTER_INDEX.md](./ControlCenter/UI/UI_MASTER_INDEX.md)

---

## 11. Packages & Dependencies

### 11.1 Web (`apps/web/package.json`)

| Category | Packages |
|----------|----------|
| Framework | `next@16.2.9`, `react@19.2.4` |
| UI | `@radix-ui/*`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Data display | `@tanstack/react-table`, `ag-grid-community`, `ag-grid-react`, `recharts` |
| State / UX | `zustand`, `cmdk`, `sonner` |
| Styling | `tailwindcss@4`, `@tailwindcss/postcss` |
| Dev | `typescript@5`, `eslint`, `eslint-config-next` |

### 11.2 API (`apps/api/requirements.txt`)

| Package | Purpose |
|---------|---------|
| `fastapi`, `uvicorn` | Web framework + ASGI server |
| `sqlalchemy`, `psycopg2-binary` | PostgreSQL ORM |
| `pydantic-settings` | Environment config |
| `python-jose[cryptography]` | JWT tokens |
| `bcrypt` | Password hashing |
| `pyotp` | TOTP MFA |
| `httpx` | Outbound HTTP (PageSpeed, etc.) |
| `email-validator` | Email validation |
| `python-dotenv` | .env loading |

### 11.3 Edge Agent (`agent/edge-agent/requirements.txt`)

| Package | Purpose |
|---------|---------|
| `httpx` | Heartbeat HTTP client |
| `psutil` | System metrics collection |
| `python-dotenv` | Configuration |

### 11.4 Platform packages (`platform/`)

All platform SDKs live **inside this repository**. MoharazNX links via `file:../againerp-center/platform/...`.

| Package | Path | npm name | Status |
|---------|------|----------|--------|
| Shared Contracts | `platform/shared-contracts/` | `@againerp/contracts` | ✅ v1.0.0 normalized |
| Runtime SDK | `platform/runtime-sdk/` | `@againerp/runtime` | 🟡 scaffolded |
| Provider Gateway | `platform/provider-gateway/` | Python module | 🟡 scaffolded |
| AI Core | `platform/ai-core/` | internal | 🟡 scaffolded |
| Plugin SDK | `platform/plugin-sdk/` | `@againerp/plugin-sdk` | ⬜ scaffold |
| Integration SDK | `platform/integration-sdk/` | `@againerp/integration-sdk` | ⬜ scaffold |
| Edge SDK | `platform/edge-sdk/` | `@againerp/edge-sdk` | ⬜ scaffold |
| Monitoring SDK | `platform/monitoring-sdk/` | contracts | ⬜ scaffold |
| Licensing SDK | `platform/licensing-sdk/` | contracts | ⬜ scaffold |
| Update SDK | `platform/update-sdk/` | contracts | ⬜ scaffold |
| Governance | `platform/governance/` | internal | ⬜ scaffold |

**Constitution:** [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md)

---

## 12. External Integrations

| System | Direction | Integration point |
|--------|-----------|-------------------|
| **MoharazNX** | Client → Center | `AGAINERP_CENTER_URL`, AI proxy via `center-client.ts` |
| **Stripe** | Inbound webhook | `POST /webhooks/v1/stripe` |
| **Google PageSpeed** | Center → Google | `pagespeed_service.py` (platform key proxy) |
| **PostgreSQL** | Center ↔ DB | `DATABASE_URL` |
| **Redis** | Center ↔ cache | Docker Compose (future rate limiting / events) |

---

## 13. Environment Variables

### Web (`apps/web/.env.local`)

| Variable | Purpose |
|----------|---------|
| `API_PROXY_TARGET` | FastAPI backend for Next.js rewrites |
| `NEXT_PUBLIC_API_URL` | Fallback API URL for client-side fetch |

### API (`apps/api/.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key |
| `CORS_ORIGINS` | Allowed browser origins |
| `MFA_ENFORCE` | Require MFA for operators |
| `STRIPE_WEBHOOK_SECRET` | Stripe signature verification |
| `SEED_DEMO_DATA` | Bootstrap demo fleet on startup |
| `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD` | Production first admin |

### Edge Agent (`agent/edge-agent/.env`)

| Variable | Purpose |
|----------|---------|
| `AGENT_CONTROL_CENTER_URL` | API base |
| `AGENT_TOKEN` | Client agent bearer token |
| `AGENT_HEARTBEAT_INTERVAL` | Heartbeat cadence |

---

## 14. Local Development

```bash
# First time
./setup.sh          # venv, npm install, Docker DB

# Start everything
./start.sh          # API :8001 + Web :3001

# Or individually
cd apps/web && npm run dev          # :3100 per package.json
cd apps/api && .venv/bin/uvicorn main:app --port 8100 --reload

# Edge Agent
cd agent/edge-agent && python main.py
```

Default dev credentials (non-production): `admin@againerp.com` / `Admin@1234`

---

## 15. Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| DB tables | snake_case plural | `clients`, `health_snapshots` |
| API routes | kebab-case segments | `/api/v1/api-keys/` |
| Agent routes | `/agent/v1/` prefix | `/agent/v1/heartbeat` |
| Python modules | snake_case | `license_service.py` |
| React components | PascalCase, `center-` prefix | `center-clients-list.tsx` |
| UI types | `Center*` prefix | `CenterClient`, `CenterPlan` |
| Env vars (API) | UPPER_SNAKE | `DATABASE_URL`, `CORS_ORIGINS` |
| Env vars (Agent) | `AGENT_` prefix | `AGENT_TOKEN` |

---

## 16. Cursor & Tooling

| Path | Purpose |
|------|---------|
| `.cursor/rules/againerp-center.mdc` | Cursor project rules (routes, data boundaries) |
| `apps/web/AGENTS.md` | Next.js 16 agent guidance |
| `apps/web/CLAUDE.md` | Points to AGENTS.md |

---

## 17. Quick Reference Links

| Need | Go to |
|------|-------|
| Start developing | [BRAIN.md](./BRAIN.md) |
| **Constitution (read first)** | [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md) |
| Platform architecture | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| Platform packages guide | [docs/PLATFORM_GUIDE.md](./docs/PLATFORM_GUIDE.md) |
| Architecture deep dive | [ControlCenter/MASTER_INDEX.md](./ControlCenter/MASTER_INDEX.md) |
| API contracts | [ControlCenter/07_API_Architecture.md](./ControlCenter/07_API_Architecture.md) |
| OpenAPI spec | [docs/api/openapi/control-center.openapi.json](./docs/api/openapi/control-center.openapi.json) |
| UI design specs | [ControlCenter/UI/UI_MASTER_INDEX.md](./ControlCenter/UI/UI_MASTER_INDEX.md) |
| Mock data (legacy) | [apps/web/src/lib/mock-data/center.ts](./apps/web/src/lib/mock-data/center.ts) |
| Deploy web to Vercel | [deploy/vercel/README.md](./deploy/vercel/README.md) |
| Edge Agent setup | [agent/README.md](./agent/README.md) |

---

## 18. Summary

AgainERP Center is the **Platform Brain** with four layers:

1. **`apps/web`** — Next.js operator console
2. **`apps/api`** — FastAPI platform API (22 routers, 13 services)
3. **`platform/`** — Shared SDKs consumed by MoharazNX and future client ERPs
4. **`agent/edge-agent`** — Client-side heartbeat agent

**Two repositories only:** Center + MoharazNX. MoharazNX is the reference client ERP template — business modules only, no AI Core or Provider Gateway.

**Next migration phases:** Provider Gateway → Runtime SDK move → MoharazNX contract adoption. See [docs/MIGRATION_CHECKLIST.md](./docs/MIGRATION_CHECKLIST.md) and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
