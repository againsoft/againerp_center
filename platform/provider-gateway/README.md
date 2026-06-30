# Provider Gateway

**Status:** 🟡 Scaffolded — implementation Phase 1  
**Location:** Center only — MoharazNX must never call LLM providers directly

## Normalized tree

```
platform/provider-gateway/
├── providers/
│   ├── openai/
│   ├── claude/        # Anthropic
│   ├── gemini/
│   ├── azure/
│   ├── deepseek/
│   ├── ollama/
│   └── openrouter/
├── router.py          # model selection, failover (planned)
├── metering.py        # credits → client_ai_access (planned)
└── safety.py          # PII scrub, injection filter (planned)
```

## Source to migrate (MoharazNX)

| Asset | Current path |
|-------|--------------|
| LLM client | `moharaznx/apps/api/app/services/llm_client.py` |
| PC builder LLM | `moharaznx/apps/api/app/services/pc_builder_llm.py` |

## Center API mount

`apps/api` → `/ai/v1/complete`, `/ai/v1/stream`, `/ai/v1/structured`

## Contracts

Uses `@againerp/contracts/protocols` — `GatewayCompletionRequest`, `PROVIDER_IDS`
