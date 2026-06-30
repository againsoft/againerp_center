# AI Core

**Status:** 🟡 Scaffolded — implementation Phase 3  
**Target:** Platform Brain — Center only  
**Constitution:** Article IV — [docs/AGAINERP_PLATFORM_CONSTITUTION.md](../../docs/AGAINERP_PLATFORM_CONSTITUTION.md)

## Normalized tree

```
platform/ai-core/
├── kernel/           # core lifecycle, platform AI entry
├── orchestrator/     # platform pipeline coordinator
├── registry/         # authoritative agent + model catalog
├── context/          # platform context policies
├── prompt/           # global prompt marketplace
├── memory/           # platform memory policies
├── knowledge/        # global knowledge collections
├── tools/            # global tool registry
├── providers/        # routing config → provider-gateway
└── security/         # safety guard, PII, policies
```

## Current location (do not delete)

| Asset | Path |
|-------|------|
| AI provisioning | `apps/api/app/services/ai_service.py` |
| AI router | `apps/api/app/routers/ai.py` |
| Chief AI UI | `apps/web/src/components/center/ai-access/` |

## MoharazNX must NOT contain

AI Core, kernel, orchestrator, model registry, provider keys, global prompts.

## Migration phase

Phase 3 — after Provider Gateway and Runtime SDK extraction.
