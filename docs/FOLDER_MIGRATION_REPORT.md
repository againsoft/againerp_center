# Folder Migration Report

> **Date:** 2026-06-30  
> **Update:** Step A normalization complete — final subfolder layout  
> **Policy:** Move and reorganize only — no deletions, no rewrites

---

## Target tree — `againerp-center/`

```
againerp-center/
├── apps/
│   ├── web/                          # Operator UI (unchanged)
│   └── api/                          # Platform API (unchanged)
├── agent/
│   └── edge-agent/                   # → platform/edge-sdk (Phase 2)
├── platform/                         # ✅ FINAL normalized layout
│   ├── README.md
│   ├── shared-contracts/             # dto, events, types, protocols, errors, permissions
│   ├── runtime-sdk/                  # conversation, context, connectors, streaming
│   ├── provider-gateway/             # providers/openai, claude, gemini, azure, …
│   ├── ai-core/                      # orchestrator, registry, prompt, security, …
│   ├── plugin-sdk/
│   ├── edge-sdk/
│   ├── monitoring-sdk/
│   ├── licensing-sdk/
│   └── update-sdk/
│   # DEPRECATED: conversation-sdk/ → runtime-sdk/conversation/
├── services/                         # ⬜ future extracted microservices (optional)
├── ControlCenter/                    # Architecture docs (unchanged)
├── docs/
│   ├── ARCHITECTURE_MIGRATION_REPORT.md
│   ├── FOLDER_MIGRATION_REPORT.md      # this file
│   ├── MIGRATION_CHECKLIST.md
│   └── PLATFORM_ECOSYSTEM_AUDIT.md
├── deploy/                           # unchanged
├── scripts/                          # unchanged
├── PROJECT_MAP.md                    # ✅ updated
├── MASTER_INDEX.md                   # ✅ updated
└── BRAIN.md                          # ✅ updated
```

---

## File-level migration map

### Completed ✅ (Step A — 2026-06-30)

| From | To |
|------|-----|
| `againerp-platform/packages/contracts/src/*` | `platform/shared-contracts/src/*` |
| `againerp-platform/packages/contracts/schemas/*` | `platform/shared-contracts/schemas/*` |
| Flat `shared-contracts/src/*.ts` | `dto/`, `events/`, `types/`, `protocols/`, `errors/`, `permissions/` |
| `conversation-sdk/` concept | `runtime-sdk/conversation/` |
| Platform package scaffolds | All subfolders per [ARCHITECTURE.md](./ARCHITECTURE.md) |

### Planned — MoharazNX → Center

| From (moharaznx) | To (againerp-center) | Method |
|------------------|----------------------|--------|
| `ai/**/*` | `platform/runtime-sdk/src/` | `git mv` + npm package |
| `ai/package.json` (`@againerp/ai`) | `platform/runtime-sdk/package.json` (`@againerp/runtime`) | rename + shim |
| `apps/api/app/services/llm_client.py` | `platform/provider-gateway/` + `apps/api` mount | extract module |
| `apps/api/app/services/pc_builder_llm.py` | `platform/provider-gateway/adapters/` | extract |
| `apps/web/src/lib/conversation/center-client.ts` | `platform/runtime-sdk/src/center-client/` | move |
| `apps/web/src/lib/conversation/types.ts` | **delete after** `@againerp/contracts` adoption | replace imports |
| `apps/web/src/lib/builder/ai/agents/orchestrator.ts` | `platform/runtime-sdk/` business pipeline | move |

### Planned — Center internal reorganize

| From | To |
|------|-----|
| `apps/api/app/services/ai_service.py` | `platform/ai-core/` (import from api) |
| `apps/api/app/services/license_service.py` | keep in api; types → `platform/licensing-sdk/` |
| `apps/api/app/services/update_service.py` | keep in api; types → `platform/update-sdk/` |
| `agent/edge-agent/` | keep; protocol → `platform/edge-sdk/protocol/` |

### Deprecated — do not use

| Path | Replacement |
|------|-------------|
| `againerp-platform/` | `againerp-center/platform/` |
| `againerp-center/control/` (mirror) | `ControlCenter/` |
| `moharaznx/control/` | `againerp-center/ControlCenter/` |
| `moharaznx/apps/web/src/app/center/` | `againerp-center/apps/web/` |

---

## MoharazNX — allowed structure after migration

```
moharaznx/
├── apps/
│   ├── web/                    # Business UI + Runtime integration
│   └── api/                    # Business API + gateway client (no direct LLM)
├── docs/                       # Client docs only
├── package.json                # links @againerp/contracts, @againerp/runtime
└── ai/                         # TEMP: re-export shim → ../againerp-center/platform/runtime-sdk
```

### MoharazNX must NOT contain (post-migration)

- `llm_client.py` direct provider calls
- `ai_providers` platform registry tables (migrate authority to Center)
- `/center` routes
- Duplicate contract types

### MoharazNX keeps

- All `catalog_*`, `commerce_*`, `storefront_*`, `marketing_*`, etc.
- Business tools (`chat_order_service`, FAQ)
- Conversation UI components (thin — call runtime)
- `lib/conversation/` as integration layer

---

## Package boundaries

| Package | Location | Imported by |
|---------|----------|-------------|
| `@againerp/contracts` | `platform/shared-contracts` | Center web, Center api (generated), MoharazNX, Edge |
| `@againerp/runtime` | `platform/runtime-sdk` | MoharazNX web, future ERPs |
| `@againerp/provider-gateway` | Python in `platform/provider-gateway` | Center api only |
| `@againerp/plugin-sdk` | `platform/plugin-sdk` | MoharazNX + marketplace |

---

## npm link setup (MoharazNX)

```json
{
  "dependencies": {
    "@againerp/contracts": "file:../againerp-center/platform/shared-contracts",
    "@againerp/runtime": "file:../againerp-center/platform/runtime-sdk"
  }
}
```

---

## Verification checklist

- [ ] `platform/shared-contracts` builds (`npm run build`)
- [ ] No new references to `againerp-platform` in docs
- [ ] MoharazNX `PROJECT_MAP.md` points to Center platform packages
- [ ] Center `PROJECT_MAP.md` documents `platform/` tree
- [ ] Legacy third repo marked DEPRECATED
