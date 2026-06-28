# Control Center OpenAPI Specification

OpenAPI **3.1** contract for the AgainERP Control Center API.

## Live (running API)

| Resource | URL |
|----------|-----|
| Swagger UI | http://localhost:8001/docs |
| ReDoc | http://localhost:8001/redoc |
| JSON spec | http://localhost:8001/openapi.json |

## Static export

Regenerate after API route or schema changes:

```bash
cd /path/to/againerp-center
python3 scripts/export_openapi.py
```

Output: [`control-center.openapi.json`](./control-center.openapi.json)

## Surfaces

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/v1/*` | Operator JWT (+ MFA step-up for high-risk) | Fleet management REST |
| `/agent/v1/*` | Agent bearer token | Edge Agent heartbeat & commands |
| `/webhooks/v1/*` | Provider signature | Stripe and inbound integrations |
| `/health` | None | Liveness probe |

Architecture reference: [`control/ControlCenter/07_API_Architecture.md`](../../../control/ControlCenter/07_API_Architecture.md)
