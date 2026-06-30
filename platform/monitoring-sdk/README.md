# Monitoring SDK

**Status:** ⬜ Scaffold  
**Scope:** Fleet health contracts + client telemetry hooks

## Current location (Center)

| Asset | Path |
|-------|------|
| Monitoring API | `apps/api/app/routers/monitoring.py` |
| Health snapshots | `apps/api/app/models/health_snapshot.py` |
| Edge heartbeat | `agent/edge-agent/app/heartbeat/` |
| UI | `apps/web/src/components/center/monitoring/` |
| Spec | `ControlCenter/10_Monitoring.md` |

## Contracts

`@againerp/contracts/events` — `HeartbeatEvent`

## Client integration

MoharazNX reports via Edge Agent only — no duplicate monitoring stack.

## Migration phase

Phase 3 — formalize SDK wrappers for future ERP templates
