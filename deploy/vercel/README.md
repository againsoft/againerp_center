# Vercel Deployment (Web UI)

Deploy the Next.js operator UI to Vercel while the API runs on Railway.

## Project settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js |

## Environment variables (optional)

| Variable | Value | Required |
|----------|-------|----------|
| `API_PROXY_TARGET` | `https://againerpcenter-production.up.railway.app` | Optional* |

\* If omitted, production defaults to the Railway API URL baked into the runtime proxy route.

## Railway API — CORS

On Railway **center-api**, set:

```
CORS_ORIGINS=https://againerp-center.vercel.app
```

## Login

https://againerp-center.vercel.app/login

Default credentials (if Railway DB seeded with dev admin):

- Email: `admin@againerp.com`
- Password: `Admin@1234`

## How it works

```
Browser → Vercel (/api/v1/*)
              ↓ runtime proxy route
          Railway API (FastAPI)
```

The proxy lives at `apps/web/src/app/api/v1/[...path]/route.ts` and reads `API_PROXY_TARGET` at **request time** (not build time).

## Troubleshooting

| Error | Fix |
|-------|-----|
| HTTP 404 on login | Redeploy after pulling latest code (runtime proxy route) |
| HTTP 502 | Check Railway API is up: `/health` |
| CORS error | Set `CORS_ORIGINS` on Railway API |
| Invalid credentials | Use Railway admin email/password |
