# Edge Agent

Client-side bridge between AgainERP installations and the Control Center.

## Quick Start

### 1. Get agent token

Create a client in Control Center UI (`/center/clients` → Add client). Copy the **agent token** shown once after creation.

### 2. Configure

```bash
cd agent/edge-agent
cp .env.example .env
# Edit .env — set AGENT_TOKEN
```

### 3. Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 4. Run with Docker

```bash
docker compose -f docker-compose.agent.yml up -d
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_CONTROL_CENTER_URL` | `http://127.0.0.1:8001` | Control Center API |
| `AGENT_TOKEN` | — | Bearer token from client creation |
| `AGENT_HEARTBEAT_INTERVAL` | `60` | Seconds between heartbeats |
| `AGENT_AGENT_VERSION` | `1.0.0` | Reported agent version |
| `AGENT_ERP_VERSION` | `1.0.0` | Reported ERP version |

## What it does (Phase 1)

- Generates a stable `instance_id` (persisted in `.agent-data/`)
- Collects CPU, memory, disk, uptime via `psutil`
- Sends `POST /agent/v1/heartbeat` every 60 seconds
- Adaptive backoff on failures (up to 300s)

## Verify

1. Run `./start.sh` (Control Center API + UI)
2. Run Edge Agent with token
3. Open http://localhost:3001/center/agents → **Fleet heartbeat** tab
4. Or client detail → **Agent & Server** tab

See [`control/ControlCenter/04_Client_Edge_Agent.md`](../control/ControlCenter/04_Client_Edge_Agent.md) for full architecture.
