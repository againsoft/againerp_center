# AgainERP Control Center — Platform Package Architecture

> **Status:** **FROZEN v1.0.0** — Constitution ratified (2026-06-30)  
> **Version:** 3.0  
> **Step:** 18 of 18  
> **Constitution:** [../docs/AGAINERP_PLATFORM_CONSTITUTION.md](../docs/AGAINERP_PLATFORM_CONSTITUTION.md)  
> **Parent Index:** [MASTER_INDEX.md](./MASTER_INDEX.md)

---

## Purpose

Enterprise reference for the **frozen** platform package layout inside AgainERP Center.

## Normalized architecture (Constitution Article III)

```
againerp-center/platform/
├── ai-core/              kernel, orchestrator, registry, context, prompt, memory, knowledge, tools, providers, security
├── runtime-sdk/          conversation, context, prompt-runtime, connectors, streaming, runtime-config
├── shared-contracts/     dto, events, interfaces, schemas, permissions, protocols, types, errors
├── provider-gateway/     openai, claude, gemini, azure, deepseek, ollama, openrouter
├── plugin-sdk/
├── integration-sdk/
├── edge-sdk/
├── monitoring-sdk/
├── licensing-sdk/
├── update-sdk/
└── governance/
```

## Mandatory flow

```
Client UI → @againerp/runtime → Provider Gateway → LLM → Response
```

## See also

[../docs/AGAINERP_PLATFORM_CONSTITUTION.md](../docs/AGAINERP_PLATFORM_CONSTITUTION.md) · [../docs/FROZEN_RULES.md](../docs/FROZEN_RULES.md) · [../docs/PLATFORM_GOVERNANCE_CONFIRMATION.md](../docs/PLATFORM_GOVERNANCE_CONFIRMATION.md)
