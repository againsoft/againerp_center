# Runtime SDK

**Status:** 🟡 Scaffolded — source identified in MoharazNX  
**npm name:** `@againerp/runtime` (planned)

Client-side AI runtime consumed by MoharazNX and all future client ERPs.

## Normalized tree

```
platform/runtime-sdk/
├── conversation/           # thread manager, Center Client (ex-conversation-sdk)
├── context/                # from moharaznx/ai/context
├── prompt-runtime/         # business prompt merge layer
├── memory-connector/       # from moharaznx/ai/memory
├── knowledge-connector/    # tenant RAG
├── tool-connector/         # ERP tool execution interface
├── streaming/              # SSE chunk handling
└── runtime-config/         # client ID, Center URL, flags
```

## Source (MoharazNX — migrate here, do not duplicate)

| Asset | Current path | Files |
|-------|--------------|-------|
| AI OS foundation | `moharaznx/ai/` | 181 TS modules (`@againerp/ai` v0.6.0) |
| Center client bridge | `moharaznx/apps/web/src/lib/conversation/center-client.ts` | → `conversation/` |
| PC builder orchestrator | `moharaznx/apps/web/src/lib/builder/ai/` | business layer only |

## Does NOT contain

Provider Gateway, AI Core, LLM API keys, platform agent authority.

## MoharazNX after migration

```json
"@againerp/runtime": "file:../againerp-center/platform/runtime-sdk"
```

Shim at `moharaznx/ai/` re-exports `@againerp/runtime` during transition.

## Migration phase

Phase 2 — `git mv` with compatibility shim.
