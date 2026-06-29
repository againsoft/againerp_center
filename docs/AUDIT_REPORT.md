# AgainERP Center — Architecture Audit Report

**Audit date:** 2026-06-29  
**Repository:** `againerp-center`  
**Remote:** `https://github.com/againsoft/againerp_center.git`  
**Auditor role:** Lead Software Architect (READ ONLY analysis)

---

## Executive Summary

AgainERP Control Center is a **multi-service control plane** (FastAPI API + Next.js UI + Python Edge Agent) for managing a fleet of AgainERP client stores. The project is at **Phase 2 alpha** with a rich API surface and mostly live-wired UI. It is **production-ready for local/dev** but **not ready for Railway or 100+ client scale** without migrations, containerization, security hardening, and background workers.

| Dimension | Status |
|-----------|--------|
| Dev experience | Good |
| Feature completeness | Phase 2 alpha |
| Production readiness | Not ready |
| Railway readiness | Not ready (addressed in STEP 02) |
| Vercel readiness | Partial (Web only) |
| Security | Dev-grade |
| Scalability (100+ clients) | Will break |

---

# Current Architecture

### Runtime components

| Component | Path | Port | Role |
|-----------|------|------|------|
| Platform API | `apps/api/` | 8001 | FastAPI REST — operators, agents, webhooks |
| Operator Web UI | `apps/web/` | 3001 | Next.js 16 dashboard at `/center/*` |
| Edge Agent | `agent/edge-agent/` | — | Heartbeat + PageSpeed audit client |
| PostgreSQL | `deploy/docker/` | 5432 | Primary datastore |
| Redis | `deploy/docker/` | 6379 | **Provisioned but unused in application code** |

### API surfaces

1. **Operator API** — `/api/v1/*` — JWT bearer auth
2. **Agent API** — `/agent/v1/*` — agent bearer token (mTLS planned, not implemented)
3. **Webhooks** — `/webhooks/v1/*` — Stripe signature verification

### Business domains

Clients, registrations, subscriptions, licenses, billing, modules, updates, agents, monitoring, backups, AI access, notifications, audit, platform settings, PageSpeed proxy — all implemented at API level with corresponding UI routes under `/center/*`.

### Documentation (non-runtime)

`control/ControlCenter/` — 17 architecture docs + 13 UI specs describing target enterprise architecture.

---

# Folder Tree

```
againerp-center/
├── README.md
├── CHANGELOG.md
├── setup.sh
├── start.sh
├── apps/
│   ├── api/
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── config.py, database.py, schema_sync.py
│   │       ├── deps/          (auth.py, agent.py)
│   │       ├── models/        (24 SQLAlchemy models)
│   │       ├── routers/       (22 route modules)
│   │       └── services/      (12 business logic modules)
│   └── web/
│       ├── next.config.ts
│       ├── package.json
│       └── src/
│           ├── app/           (App Router — login + center/*)
│           ├── components/    (center/*, ui/*, layout/*)
│           └── lib/           (api/, adapters/, hooks/, store/, mock-data/)
├── agent/edge-agent/
├── control/ControlCenter/
├── deploy/docker/
├── docs/api/openapi/
└── scripts/
```

**Missing:** `.github/`, Alembic, API/Web Dockerfiles (pre-STEP 02), `vercel.json`, root monorepo tooling.

---

# Technology Stack

| Layer | Technology |
|-------|------------|
| API | Python 3.11, FastAPI 0.111+, SQLAlchemy 2.x, uvicorn |
| Auth | JWT (python-jose), bcrypt (passlib), TOTP (pyotp) |
| Web | Next.js 16.2.9, React 19.2.4, Tailwind CSS 4, shadcn/ui |
| State | Zustand 5 + persist |
| Agent | Python 3.11, httpx, psutil |
| DB | PostgreSQL 16 |
| Docs | OpenAPI 3.1 |

---

# Current Strengths

1. Clear router → service → model separation
2. Comprehensive domain coverage (15+ business modules)
3. OpenAPI 3.1 with static export
4. MFA + step-up for high-risk actions
5. Agent-first monitoring (no direct client DB queries from UI)
6. Adapter pattern in web layer (`lib/adapters/`)
7. Live route registry (`center-live-routes.ts`)
8. Reproducible dev setup (`setup.sh`, `start.sh`)
9. Extensive architecture documentation in `control/`
10. Audit logging for operator actions
11. Platform settings for shared integration keys (PageSpeed, OpenAI, SMTP)
12. PageSpeed proxy for client stores via agent token

---

# Current Problems

| # | Issue |
|---|-------|
| 1 | No Alembic migrations — `create_all()` + manual `schema_sync.py` |
| 2 | Redis running but unused |
| 3 | Mock data still imported in 30+ UI files |
| 4 | Settings hub uses mock `centerPlatformSettings` |
| 5 | No Next.js middleware — client-side auth only |
| 6 | API keys CRUD exists but no request auth middleware |
| 7 | License validate requires operator JWT (stores cannot self-validate) |
| 8 | No background worker service |
| 9 | Bootstrap seeds sample data on startup |
| 10 | No CI/CD (`.github/workflows/` missing) |
| 11 | API and Web not containerized (pre-STEP 02) |
| 12 | Incomplete UI RBAC — all authenticated users see all routes |
| 13 | Client DB credentials stored plaintext |
| 14 | `test-connection` opens direct TCP to client PostgreSQL |
| 15 | Platform secrets stored unencrypted in `platform_settings` |
| 16 | No pagination on most list endpoints |
| 17 | Health snapshots append-only with no retention policy |

---

# Scalability Problems (100+ Clients)

| Area | Failure mode |
|------|--------------|
| Heartbeat ingestion | ~144K snapshot rows/day at 100 clients; no rollup or TTL |
| Monitoring dashboard | O(n) API calls; no cached aggregates |
| Single API instance | No horizontal scaling config |
| PageSpeed audits | Synchronous 30–60s Google API calls block workers |
| Database | Single PostgreSQL, no read replicas, default connection pool |
| Agent commands | Polling-based; no Redis queue despite Redis running |
| Audit log | Unbounded growth, no archival |
| External API keys | Shared platform keys with no per-client quota |

Architecture docs state Railway is unsuitable for 100+ clients; production target is Kubernetes.

---

# Production Problems (Railway)

| Blocker | Detail |
|---------|--------|
| No Railway config | No `railway.toml` (addressed in STEP 02) |
| No API Dockerfile | FastAPI runs via local venv only (addressed in STEP 02) |
| No Web production pipeline | Proxy assumes localhost API |
| Two services required | API + Web need separate Railway services |
| Default secrets in code | Fallback `SECRET_KEY`, admin password in bootstrap |
| CORS locked to localhost | Must update for production domain |
| No worker service | Documented but not implemented |
| Seed admin on empty DB | Creates default credentials automatically |

---

# Security Problems

| Severity | Issue |
|----------|-------|
| Critical | Default admin auto-seeded (`admin@againerp.com / Admin@1234`) |
| Critical | JWT in `localStorage` — XSS session theft risk |
| Critical | Client DB passwords plaintext in `clients` table |
| Critical | Platform API keys plaintext in `platform_settings` |
| High | 7-day JWT expiry, no refresh token rotation |
| High | No token revocation — logout is client-side only |
| High | Agent mTLS documented but not implemented |
| High | Direct client DB connection via `test-connection` |
| Medium | RBAC enforced on few routes only |
| Medium | Scoped API keys cannot authenticate requests |
| Medium | `MFA_ENFORCE=false` by default |

---

# Recommended Architecture

```
Operators → CDN/Vercel → Next.js Web
                        ↓
              FastAPI API ← Background Worker
                   ↓              ↓
            PostgreSQL         Redis (cache + queues)
                   ↓
            Object Storage (diagnostics/artifacts)

Client Edge Agents → mTLS + Bearer → FastAPI API
Stripe Webhooks → signed → FastAPI API
```

| Layer | Ideal hosting |
|-------|---------------|
| Web UI | Vercel |
| API | Railway (seed) → K8s (scale) |
| Worker | Railway worker / K8s |
| Database | Managed PostgreSQL + read replica |
| Cache | Managed Redis |
| Secrets | Vault / KMS + encrypted at rest |
| Migrations | Alembic in CI/CD |

---

# Gap Analysis

| Area | Current | Ideal | Gap |
|------|---------|-------|-----|
| Migrations | `create_all()` | Alembic | Critical |
| Docker | DB + agent only | Full stack | STEP 02 |
| Railway | None | 3 services + managed DB | STEP 02 |
| Auth | localStorage JWT | httpOnly cookie + refresh | Major |
| Redis | Unused | Cache + job queue | Major |
| Worker | None | ARQ/Celery | Major |
| RBAC | Partial API | Full API + UI middleware | Medium |
| Secrets | Plaintext DB | Encrypted + KMS | Critical |
| Time-series | PostgreSQL rows | TSDB or rollup | Critical at scale |
| CI/CD | None | GitHub Actions | Medium |

---

# Remediation Roadmap

| Step | Focus | Status |
|------|-------|--------|
| STEP 01 | Architecture audit (this document) | Complete |
| STEP 02 | Deployment foundation (Docker + Railway) | Complete |
| STEP 03 | Alembic migrations | Planned |
| STEP 04 | Security hardening (secrets, auth cookies) | Planned |
| STEP 05 | Redis worker + job queue | Planned |
| STEP 06 | CI/CD (GitHub Actions) | Planned |
| STEP 07 | Scalability (snapshot retention, pagination, caching) | Planned |

---

*Generated from READ ONLY repository analysis. No application code was modified during STEP 01.*
