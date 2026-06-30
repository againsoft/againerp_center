# AI Core — Orchestrator

**Owner:** AgainERP Center (`platform/ai-core/`)  
**Consumer:** `apps/api` only — MoharazNX must never import

Platform-level AI pipeline coordinator. Routes requests through Provider Gateway, applies global policies, emits usage events.

**Source to migrate:** extend `apps/api/app/services/ai_service.py` (Phase 3)
