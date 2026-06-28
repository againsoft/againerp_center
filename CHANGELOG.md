# Changelog

## [2.0.0-alpha] — Phase 2 Notifications + Chief AI Briefing — 2026-06-29

### Added

**Notifications API**
- `GET /api/v1/notifications/` — derived platform alerts from fleet metadata
- Sources: suspended clients, agent health, pending registrations, rollouts, API key expiry, invoices, backups

**Chief AI Briefing API**
- `GET /api/v1/ai/briefing` — synthesized daily operator summary from live fleet + AI stats
- Insights cite specialist agents (monitoring, license, recommendation, health, update)

**UI wired to live API**
- Header bell + `/center/notifications` — live feed, local read/unread persist
- Dashboard Chief AI briefing card — live insights from API
- Sidebar notification badge from live unread count

OpenAPI export: 84 paths.

---

## [2.0.0-alpha] — Phase 2 Agent Console — 2026-06-29

### Added

**Agent Console API**
- `agent_commands`, `activation_bundles`, `agent_diagnostics` models
- `GET /api/v1/agents/stats|commands|activations|sync-queues|diagnostics`
- `POST /api/v1/agents/commands|activations|diagnostics` — issue commands, create bundles, request diagnostics
- Sync queues computed from pending commands + agent connectivity
- Backup trigger enqueues `backup.run` command
- Bootstrap seeds sample console data

**Agent Console UI**
- `/center/agents` — commands, activations, sync queues, diagnostics tabs wired to live API
- Stats row uses live fleet + console metrics

---

## [2.0.0-alpha] — Phase 2 API Keys + AI Access — 2026-06-29

### Added

**API Keys API**
- `api_keys` model — scoped keys with hash + prefix display
- `GET/POST /api/v1/api-keys/` — list and create (secret shown once)
- `POST /api/v1/api-keys/{id}/revoke` — revoke with step-up MFA
- Bootstrap seeds sample keys

**AI Access API**
- `client_ai_access` model — per-client AI provisioning metadata
- `GET /api/v1/ai/stats|fleet|recommendations|agents`
- `GET/PATCH /api/v1/ai/clients/{id}` — fleet AI entitlements
- Auto-provision on client create / registration approve
- Dynamic recommendations from credit usage and plan fit

**UI wired to live API**
- `/center/settings/api-keys` — list, create, revoke (+ step-up)
- `/center/ai-access` — fleet stats, provisioning grid, platform agents
- Integrations page was already live via platform-settings

---

## [2.0.0-alpha] — Phase 2 OpenAPI — 2026-06-29

### Added

**OpenAPI 3.1 publication**
- Tagged OpenAPI metadata on FastAPI app (17 resource groups)
- Live spec at `/openapi.json`, Swagger at `/docs`, ReDoc at `/redoc`
- Static export: `docs/api/openapi/control-center.openapi.json` (69 paths)
- `scripts/export_openapi.py` — regenerate spec from running app definition

### Fixed

- Circular import between `auth` deps and `mfa_service` (lazy token import)
- Python 3.9 compatibility for MFA login response models

---

## [2.0.0-alpha] — Phase 2 MFA — 2026-06-29

### Added

**Operator MFA (TOTP)**
- TOTP setup, confirm, disable via `pyotp`
- Login flow: password → MFA challenge when enabled
- `POST /api/v1/auth/mfa/verify|setup|confirm|disable`
- `POST /api/v1/auth/step-up` — 5-minute window for high-risk actions
- Registration approve requires step-up when MFA enabled
- `GET /api/v1/operators/` — fleet operator list with MFA status

**MFA UI**
- Login page two-step flow
- `/center/settings/security` — TOTP enrollment
- Step-up sheet on registration approve
- Operators page wired to live API

---

## [2.0.0-alpha] — Phase 2 Backups — 2026-06-29

### Added

**Backup Orchestration API**
- `backup_policies` + `backup_records` models (metadata only)
- `GET /api/v1/backups/stats|fleet|runs`
- `POST /api/v1/backups/clients/{id}/trigger` — queue backup via Edge Agent
- `POST /api/v1/backups/runs/{id}/verify` — mark checksum verification
- Auto-provision policy on client create; sample records on bootstrap

**Backup UI**
- `/center/backups` wired to live API
- Fleet status + recent runs tabs
- Detail sheet: trigger backup + run verify

---

## [2.0.0-alpha] — Phase 2 Modules — 2026-06-29

### Added

**Module Management API**
- `modules` registry + `client_modules` entitlement tables
- `GET /api/v1/modules/` — platform catalog (11 ERP modules)
- `GET /api/v1/modules/stats` — tier counts + fleet enablement
- `GET/PUT /api/v1/modules/clients/{id}` — per-client module state
- `POST .../enable` and `.../disable` with dependency + plan validation
- Auto-provision on client create / registration approve

**Module UI**
- `/center/modules` wired to live API
- Client detail **Modules & AI** tab — live toggles + save

---

## [2.0.0-alpha] — Phase 2 Updates — 2026-06-29

### Added

**Update Manager API**
- `erp_versions`, `update_rollouts`, `client_update_states` models
- Version catalog, staged rollouts (canary → GA), fleet update state
- `POST /api/v1/updates/rollouts` — create rollout
- `POST /api/v1/updates/rollouts/{id}/advance|pause|resume`
- `POST /api/v1/updates/fleet/{client_id}/push|schedule|rollback`
- Syncs `current_version` from Edge Agent heartbeat (`servers.erp_version`)

**Update Manager UI**
- `/center/updates` wired to live API
- Active rollout banner with pause/advance controls
- New rollout dialog, push/rollback from client detail sheet

---

## [2.0.0-alpha] — Phase 2 Billing — 2026-06-29

### Added

**Billing API**
- `billing_invoices` model with line items, status lifecycle
- `GET /api/v1/billing/invoices`, `/stats`, `/mrr`
- `POST /api/v1/billing/invoices` — generate invoice for subscription
- `POST /api/v1/billing/invoices/{id}/record-payment` — manual payment
- `POST /webhooks/v1/stripe` — Stripe webhook handler (invoice.paid, payment_failed, finalized)
- Auto-seed sample invoices for existing subscriptions on bootstrap

**Billing UI**
- `/center/billing` wired to live API (stats, invoice list, fleet MRR tab)

### Configuration

- `STRIPE_WEBHOOK_SECRET` and `STRIPE_API_KEY` in `apps/api/.env`

---

## [1.0.0] — Phase 1 Foundation — 2026-06-29

First implementation release of the AgainERP Control Center.

### Added

**Platform API (FastAPI)**
- Operator JWT authentication with RBAC
- Client registry CRUD with auto subscription, license, and agent token
- Registration intake with approve/reject provisioning workflow
- Subscriptions, licenses, audit log, and server registry APIs
- Edge Agent heartbeat endpoint (`POST /agent/v1/heartbeat`)
- Monitoring APIs (fleet agents, health snapshots, metric series)
- Audit logging on all operator actions

**Operator UI (Next.js)**
- Control Center shell with collapsible sidebar
- Live pages: Dashboard, Clients, Registrations, Subscriptions, Licenses, Audit, Agents, Monitoring
- Login flow with persisted JWT session
- Client create form with one-time agent token display

**Edge Agent (Python)**
- Heartbeat loop with psutil metrics collection
- Configurable interval with failure backoff
- Docker support

**Infrastructure**
- Docker Compose for PostgreSQL 16 + Redis
- `setup.sh`, `start.sh`, `scripts/init_db.py`, `scripts/health_check.sh`

### Deferred to Phase 2

- MFA for operators
- Billing webhooks (Stripe)
- Staged update rollout
- Module enable/disable API
- Backup orchestration
- OpenAPI publication
- mTLS for agent communication
