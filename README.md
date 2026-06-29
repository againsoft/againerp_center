# AgainERP Control Center

Central control plane for managing AgainERP client installations — fleet registry, licensing, Edge Agent telemetry, and operator workflows.

## Architecture

Full architecture docs: [`control/ControlCenter/MASTER_INDEX.md`](./control/ControlCenter/MASTER_INDEX.md)

```
againerp-center/
├── apps/
│   ├── api/          # FastAPI platform API (port 8001)
│   └── web/          # Next.js operator UI (port 3001)
├── agent/edge-agent/ # Python Edge Agent (heartbeat)
├── control/          # Architecture documentation
├── deploy/docker/    # PostgreSQL + Redis
└── scripts/          # init_db, health_check
```

## Quick Start

```bash
# First time
chmod +x setup.sh start.sh scripts/health_check.sh
./setup.sh

# Every run
./start.sh
```

| Service | URL |
|---------|-----|
| Login | http://localhost:3001/login |
| Dashboard | http://localhost:3001/center |
| API docs | http://localhost:8001/docs |

**Credentials:** `admin@againerp.com` / `Admin@1234`

### Edge Agent

After creating or approving a client, copy the agent token:

```bash
cd agent/edge-agent
cp .env.example .env   # set AGENT_TOKEN
source .venv/bin/activate
python main.py
```

Verify at **Agents → Fleet heartbeat** or **Monitoring**.

### Health check

```bash
./scripts/health_check.sh
```

### Docker production stack

```bash
docker compose -f deploy/docker/docker-compose.prod.yml up -d --build
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:8001/docs |

### Railway deployment

Full guide: [`deploy/railway/README.md`](./deploy/railway/README.md)

Quick summary — 3 Railway resources (PostgreSQL + API + Web):

| Service | Root Directory | Key env vars |
|---------|----------------|--------------|
| PostgreSQL | Railway plugin | — |
| API | `apps/api` | `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `INITIAL_ADMIN_*` |
| Web | `apps/web` | `API_PROXY_TARGET` = public API URL |

Deploy API first → get URL → set `API_PROXY_TARGET` on Web → redeploy Web.

Architecture audit: [`docs/AUDIT_REPORT.md`](./docs/AUDIT_REPORT.md)

## Phase Status

| Phase | Goal | Status |
|-------|------|--------|
| **Phase 1** | Foundation — registry + license + agent | **Complete** |
| **Phase 2** | Growth — billing, updates, AI assist | **In progress** |
| Phase 3 | Scale — marketplace + multi-region | Planned |
| Phase 4 | Global — 10,000+ clients | Planned |

See [`control/ControlCenter/17_Roadmap.md`](./control/ControlCenter/17_Roadmap.md).

### Phase 1 deliverables (complete)

- [x] Operator auth (JWT + RBAC)
- [x] Client registry + registration onboarding
- [x] Subscriptions + licenses + audit
- [x] Edge Agent + heartbeat telemetry
- [x] Dashboard + monitoring (live API)
- [x] Docker Compose deployment
- [x] Setup/start scripts

**Phase 2 next:** Wire notifications + dashboard briefing to live API.

## API Reference

Full **OpenAPI 3.1** spec: [`docs/api/openapi/control-center.openapi.json`](./docs/api/openapi/control-center.openapi.json)

| Resource | URL (dev) |
|----------|-----------|
| Swagger UI | http://localhost:8001/docs |
| ReDoc | http://localhost:8001/redoc |
| Live JSON | http://localhost:8001/openapi.json |

Regenerate static spec after API changes:

```bash
python3 scripts/export_openapi.py
```

### Key routes

| Route | Description |
|-------|-------------|
| `POST /api/v1/auth/login` | Operator login (MFA challenge when enabled) |
| `POST /api/v1/auth/mfa/verify` | Complete TOTP login |
| `POST /api/v1/auth/step-up` | Step-up MFA for high-risk actions |
| `GET /api/v1/auth/me` | Session validation |
| `GET/POST /api/v1/clients/` | Client fleet |
| `GET/POST /api/v1/registrations/` | Signup intake |
| `POST /api/v1/registrations/{id}/approve` | Provision client |
| `GET /api/v1/subscriptions/` | Subscriptions |
| `GET /api/v1/licenses/` | Licenses |
| `POST /api/v1/licenses/validate` | Validate license key |
| `GET /api/v1/audit/` | Audit log |
| `GET /api/v1/servers/` | Agent registry |
| `GET /api/v1/monitoring/agents` | Fleet telemetry |
| `GET /api/v1/billing/invoices` | Billing invoices |
| `GET /api/v1/billing/stats` | Fleet MRR + dunning stats |
| `POST /webhooks/v1/stripe` | Stripe payment webhooks |
| `GET /api/v1/updates/fleet` | Fleet update state |
| `GET /api/v1/updates/versions` | ERP version catalog |
| `GET /api/v1/modules/` | Module catalog + client entitlements |
| `GET /api/v1/backups/fleet` | Backup policy + verification status |
| `GET /api/v1/api-keys/` | Scoped API keys |
| `GET /api/v1/ai/fleet` | Fleet AI provisioning + credits |
| `GET /api/v1/ai/recommendations` | Platform AI suggestions |
| `GET /api/v1/platform-settings/` | Integrations (PageSpeed, SMTP, OpenAI) |
| `GET /api/v1/agents/commands` | Agent command queue |
| `GET /api/v1/agents/sync-queues` | Offline sync queue status |
| `GET /api/v1/agents/diagnostics` | Diagnostics bundle lifecycle |
| `POST /agent/v1/heartbeat` | Edge Agent (Bearer token) |

## End-to-end test flow

1. `./setup.sh && ./start.sh`
2. Login → Dashboard shows fleet KPIs
3. **Registrations** → Approve a signup → save agent token
4. Run Edge Agent with token → **Monitoring** shows metrics
5. **Clients** → view subscription + agent tabs
6. **Audit** → see `registration.approve`, `client.create` entries

## Tech Stack

| Layer | Technology |
|-------|------------|
| API | FastAPI + SQLAlchemy + PostgreSQL |
| UI | Next.js 16 + Tailwind + shadcn/ui |
| Agent | Python + httpx + psutil |
| Auth | JWT (operators) + agent tokens |
| Infra | Docker Compose (PostgreSQL 16, Redis 7) |

## Documentation

- [Master Index](./control/ControlCenter/MASTER_INDEX.md)
- [Project Structure](./control/ControlCenter/16_Project_Structure.md)
- [Changelog](./CHANGELOG.md)
