# AgainERP Center — Railway Docker Deployment

Deploy the Control Center on [Railway](https://railway.app) using Docker. You need **3 resources**:

1. **PostgreSQL** (Railway plugin)
2. **API** service (`apps/api`)
3. **Web** service (`apps/web`)

---

## Prerequisites

- GitHub repo pushed: `https://github.com/againsoft/againerp_center`
- [Railway account](https://railway.app)
- Railway CLI (optional): `npm i -g @railway/cli`

---

## Step 1 — Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. **Deploy from GitHub repo** → select `againerp_center`
3. Railway creates a first service — you can delete/rename it later

---

## Step 2 — Add PostgreSQL

1. In your project → **+ New** → **Database** → **PostgreSQL**
2. Wait until it shows **Active**
3. Open PostgreSQL → **Variables** → copy `DATABASE_URL`

---

## Step 3 — Deploy API Service

1. **+ New** → **GitHub Repo** → same repo (or **Empty Service** → connect repo)
2. Service settings:
   - **Name:** `center-api`
   - **Root Directory:** `apps/api`
   - **Builder:** Dockerfile (auto-detected from `railway.toml`)
3. **Variables** tab — add:

| Variable | Value |
|----------|-------|
| `APP_ENV` | `production` |
| `SECRET_KEY` | Long random string (32+ chars) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference variable) |
| `CORS_ORIGINS` | `https://YOUR-WEB-URL.up.railway.app` (update after Step 4) |
| `INITIAL_ADMIN_EMAIL` | Your admin email |
| `INITIAL_ADMIN_PASSWORD` | Strong password (**max 72 characters** — not the same as `SECRET_KEY`) |
| `SEED_DEMO_DATA` | `false` |
| `MFA_ENFORCE` | `false` (enable later) |

Reference syntax: click **Add Reference** → select PostgreSQL → `DATABASE_URL`

4. **Deploy** → wait for build
5. **Settings** → **Networking** → **Generate Domain**
6. Copy API URL, e.g. `https://center-api-production-xxxx.up.railway.app`
7. Test: `https://YOUR-API-URL/health` → should return `{"status":"ok"}`

---

## Step 4 — Deploy Web Service

1. **+ New** → **GitHub Repo** → same repo
2. Service settings:
   - **Name:** `center-web`
   - **Root Directory:** `apps/web`
   - **Builder:** Dockerfile
3. **Variables** tab:

| Variable | Value |
|----------|-------|
| `API_PROXY_TARGET` | `https://YOUR-API-URL.up.railway.app` |

**Important:** `API_PROXY_TARGET` is used at **build time** for Next.js API rewrites. After setting it, trigger a **Redeploy**.

4. **Deploy** → **Settings** → **Networking** → **Generate Domain**
5. Copy Web URL, e.g. `https://center-web-production-xxxx.up.railway.app`

---

## Step 5 — Update CORS on API

Go back to **center-api** → **Variables**:

```
CORS_ORIGINS=https://center-web-production-xxxx.up.railway.app
```

Redeploy API (or it may auto-redeploy).

---

## Step 6 — Login

Open your Web URL:

```
https://center-web-production-xxxx.up.railway.app/login
```

Login with `INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`.

Then configure integrations:
```
/center/settings/integrations
```

---

## Architecture on Railway

```
Browser → center-web (Next.js Docker)
              ↓ rewrite /api/v1/*
          center-api (FastAPI Docker)
              ↓
          PostgreSQL (Railway plugin)
```

---

## CLI Deploy (optional)

```bash
# Login
railway login

# API
cd apps/api
railway link
railway up

# Web (set API_PROXY_TARGET first in dashboard)
cd ../web
railway link
railway up
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Web shows login but API fails | Check `API_PROXY_TARGET` matches API public URL; **redeploy Web** |
| CORS error in browser | Set `CORS_ORIGINS` on API to exact Web URL (https, no trailing slash) |
| API crash on start | Check `DATABASE_URL` reference; PostgreSQL must be linked |
| `postgres://` error | Fixed in code — redeploy latest API |
| Cannot login | Set `INITIAL_ADMIN_EMAIL` + `INITIAL_ADMIN_PASSWORD` before first deploy |
| `password cannot be longer than 72 bytes` | `INITIAL_ADMIN_PASSWORD` must be ≤72 characters — do not reuse `SECRET_KEY` |
| `error reading bcrypt version` | Redeploy latest code (passlib removed); ensure **Root Directory = apps/api** and **Dockerfile** builder |
| Build uses Python 3.13 / `.venv` | Railway is using Nixpacks — set Root Directory to `apps/api` and builder to **Dockerfile** |
| Health check failing | API: `/health` — Web: `/login` |

---

## Environment templates

- API: [`deploy/railway/env.api.example`](./env.api.example)
- Web: [`deploy/railway/env.web.example`](./env.web.example)

---

## Custom domain

1. Railway → service → **Settings** → **Networking** → **Custom Domain**
2. Add CNAME record at your DNS provider
3. Update `CORS_ORIGINS` (API) if Web domain changes

---

## Cost note

Railway hobby plan works for staging. For 100+ clients, see [`docs/AUDIT_REPORT.md`](../../docs/AUDIT_REPORT.md) — production scale needs Kubernetes.
