# Update SDK

**Status:** ⬜ Scaffold  
**Scope:** ERP version catalog, rollout contracts

## Current location (Center)

| Asset | Path |
|-------|------|
| Update service | `apps/api/app/services/update_service.py` |
| Update router | `apps/api/app/routers/updates.py` |
| Models | `erp_version.py`, `update_rollout.py`, `client_update_state.py` |
| Spec | `ControlCenter/12_Update_Manager.md` |

## MoharazNX

Receives update commands via Edge Agent — no local update authority.

## Migration phase

Phase 3
