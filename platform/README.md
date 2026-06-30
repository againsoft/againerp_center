# AgainERP Platform Packages

All platform SDKs live **inside `againerp-center`** — there is no third repository.

> **Constitution:** [docs/AGAINERP_PLATFORM_CONSTITUTION.md](../docs/AGAINERP_PLATFORM_CONSTITUTION.md)  
> **Ownership (full):** [docs/PLATFORM_PACKAGE_OWNERSHIP.md](../docs/PLATFORM_PACKAGE_OWNERSHIP.md)  
> **Rules:** [docs/FROZEN_RULES.md](../docs/FROZEN_RULES.md)

---

## Architecture freeze

| Field | Value |
|-------|-------|
| Architecture Version | **1.0.0** |
| Status | **FROZEN** |

---

## Constitution platform tree (v1.0.0)

```
platform/
├── ai-core/              kernel, orchestrator, registry, context, prompt, memory, knowledge, tools, providers, security
├── runtime-sdk/          conversation, context, prompt-runtime, connectors, streaming, runtime-config
├── shared-contracts/     dto, events, interfaces, schemas, permissions, protocols, types, errors
├── provider-gateway/     openai, claude, gemini, azure, deepseek, ollama, openrouter
├── plugin-sdk/ integration-sdk/ edge-sdk/ monitoring-sdk/ licensing-sdk/ update-sdk/ governance/
```

**Deprecated:** `conversation-sdk/` → `runtime-sdk/conversation/`

---

## Package summary

| Package | Owner | Consumers | Key rule |
|---------|-------|-----------|----------|
| [shared-contracts](./shared-contracts/) | Center | All repos | Types only — no runtime logic |
| [runtime-sdk](./runtime-sdk/) | Center | MoharazNX, future ERPs | No provider calls |
| [provider-gateway](./provider-gateway/) | Center | `apps/api` only | MoharazNX never imports |
| [ai-core](./ai-core/) | Center | `apps/api` only | MoharazNX never imports |
| [plugin-sdk](./plugin-sdk/) | Center | Runtime + clients | Marketplace manifests |
| [integration-sdk](./integration-sdk/) | Center | Center + clients | Non-LLM integrations |
| [edge-sdk](./edge-sdk/) | Center | Edge Agent | Protocol only |
| [monitoring-sdk](./monitoring-sdk/) | Center | Center + agents | Health contracts |
| [licensing-sdk](./licensing-sdk/) | Center | Center + clients | Center is authority |
| [update-sdk](./update-sdk/) | Center | Center + agents | Fleet updates |
| [governance](./governance/) | Center | Center internal | Policies + compliance |
| conversation-sdk | **Deprecated** | — | Use `runtime-sdk/conversation/` |

Full ownership matrix: [docs/PLATFORM_PACKAGE_OWNERSHIP.md](../docs/PLATFORM_PACKAGE_OWNERSHIP.md)

---

## Rules

1. Never create a third platform repository.
2. MoharazNX links via `file:../againerp-center/platform/...`
3. AI Core and Provider Gateway are **Center-only**.
4. All cross-repo types from `@againerp/contracts`.
5. Mandatory flow: `Client UI → Runtime → Provider Gateway → LLM`
