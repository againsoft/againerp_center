# Edge SDK

**Status:** ⬜ Scaffold  
**npm name:** `@againerp/edge-sdk` / Python package (planned)

Edge Agent protocol, heartbeat, command execution, offline AI queue.

## Current location

| Asset | Path |
|-------|------|
| Edge Agent | `agent/edge-agent/` |
| Agent API | `apps/api/app/routers/agent.py` |
| Agent console | `apps/api/app/services/agent_console_service.py` |
| Spec | `ControlCenter/04_Client_Edge_Agent.md` |

## Target

```
platform/edge-sdk/
├── protocol/           # heartbeat, commands, conversation queue
├── python/             # edge-agent imports
└── schemas/            # from shared-contracts events
```

## Migration phase

Phase 2 — extract protocol types to shared-contracts first
