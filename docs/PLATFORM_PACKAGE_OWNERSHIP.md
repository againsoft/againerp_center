# Platform Package Ownership

> **Architecture Version:** 1.0.0 — FROZEN  
> **Authority:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)  
> **Boundaries:** [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md)

Permanent ownership registry for every package under `againerp-center/platform/`.

---

## Architecture freeze

| Field | Value |
|-------|-------|
| **Architecture Version** | 1.0.0 |
| **Status** | **FROZEN** |
| **Platform Brain** | AgainERP Center (`againerp-center`) |
| **Business ERP Template** | MoharazNX (`moharaznx`) |

**Architecture modifications require:** Architecture Version Bump · Executive Approval · Documentation Update · Compatibility Validation

**Otherwise:** architecture modification is **prohibited**.

---

## Platform ownership (Center vs Client)

### AgainERP Center owns

Platform · AI Core · Runtime SDK · Shared Contracts · Provider Gateway · Plugin System · Marketplace · Monitoring · Licensing · Fleet · Global Configuration · Global Prompt · Global Policies · Governance · Integration contracts

### MoharazNX owns

Business Modules · Storefront · Customer Experience · Business Knowledge · Business Prompts · Business Tools · ERP Integration · Conversation UI · Context · Local Cache · Business Configuration

**Never violate these ownership boundaries.**

---

## Package registry

### AI Core — `platform/ai-core/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Platform Brain — kernel, orchestrator, registry, global prompt/context/memory/knowledge/tools, provider routing config, security policies |
| **Consumers** | `apps/api` only (internal mount) |
| **Allowed dependencies** | `@againerp/contracts`, `provider-gateway`, `governance` |
| **Forbidden dependencies** | MoharazNX, client ERP code, direct LLM SDKs from client paths |

---

### Runtime SDK — `platform/runtime-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center (defines) |
| **Purpose** | Client-side AI runtime — conversation, context, prompt-runtime, memory/knowledge/tool connectors, streaming, runtime-config |
| **Consumers** | MoharazNX web/API, all future client ERPs |
| **Allowed dependencies** | `@againerp/contracts`, Center HTTP API (`/ai/v1`, `/agent/v1`) |
| **Forbidden dependencies** | `ai-core`, `provider-gateway`, LLM provider SDKs, direct provider HTTP |

---

### Shared Contracts — `platform/shared-contracts/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Cross-repo DTOs, events, types, protocols, errors, permissions, JSON schemas (`@againerp/contracts`) |
| **Consumers** | Center apps, Runtime SDK, MoharazNX, Edge Agent, all future ERPs |
| **Allowed dependencies** | None (leaf package — types only) |
| **Forbidden dependencies** | Runtime, AI Core, Provider Gateway, business logic |

---

### Provider Gateway — `platform/provider-gateway/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | LLM provider adapters — OpenAI, Claude, Gemini, Azure, OpenRouter, DeepSeek, Ollama, local models |
| **Consumers** | `apps/api` only — mounted at `/ai/v1/*` |
| **Allowed dependencies** | `@againerp/contracts`, provider vendor SDKs (server-side only) |
| **Forbidden dependencies** | MoharazNX, client ERP, Runtime SDK imports |

---

### Plugin SDK — `platform/plugin-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center (defines + marketplace authority) |
| **Purpose** | Signed plugin manifests, marketplace extension contracts, loader interfaces |
| **Consumers** | Center (registry), Runtime SDK (loader), MoharazNX (loads business plugins) |
| **Allowed dependencies** | `@againerp/contracts` |
| **Forbidden dependencies** | Provider Gateway, AI Core internals, tenant business DB |

---

### Integration SDK — `platform/integration-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Third-party integration contracts — webhooks, OAuth, external service adapters (non-LLM) |
| **Consumers** | Center API, MoharazNX (business integration config) |
| **Allowed dependencies** | `@againerp/contracts` |
| **Forbidden dependencies** | Provider Gateway (LLM), AI Core orchestrator |

---

### Monitoring SDK — `platform/monitoring-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Fleet health event types, monitoring hooks, heartbeat contract extensions |
| **Consumers** | Center API, Edge Agent, client ERPs (heartbeat emitters only) |
| **Allowed dependencies** | `@againerp/contracts` |
| **Forbidden dependencies** | Business module logic, Provider Gateway |

---

### Licensing SDK — `platform/licensing-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | License validation contracts, fleet entitlement types |
| **Consumers** | Center API (authority), client ERPs (validate via Center) |
| **Allowed dependencies** | `@againerp/contracts` |
| **Forbidden dependencies** | Client-side license authority, MoharazNX-owned signing keys |

---

### Edge SDK — `platform/edge-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Edge Agent protocol — heartbeat, commands, offline queue contracts |
| **Consumers** | `agent/edge-agent`, Center API `/agent/v1/*` |
| **Allowed dependencies** | `@againerp/contracts` |
| **Forbidden dependencies** | MoharazNX business code, Provider Gateway |

---

### Conversation SDK — `platform/conversation-sdk/` **DEPRECATED**

| Field | Value |
|-------|-------|
| **Owner** | **Merged into Runtime SDK** — `platform/runtime-sdk/conversation/` |
| **Purpose** | Former thread/session module — do not add code here |
| **Consumers** | Use `@againerp/runtime` conversation module |
| **Allowed dependencies** | N/A — deprecated |
| **Forbidden dependencies** | Any new code in this folder |

---

### Update SDK — `platform/update-sdk/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Fleet update state contracts, rollout metadata types |
| **Consumers** | Center API (authority), Edge Agent, client ERPs (report state) |
| **Allowed dependencies** | `@againerp/contracts` |
| **Forbidden dependencies** | Client-owned update authority |

---

### Governance — `platform/governance/`

| Field | Value |
|-------|-------|
| **Owner** | AgainERP Center |
| **Purpose** | Platform policies, compliance schemas, audit standards, architecture enforcement metadata |
| **Consumers** | Center internal only |
| **Allowed dependencies** | `@againerp/contracts`, `ai-core` |
| **Forbidden dependencies** | MoharazNX, client ERPs |

---

## Mandatory communication flow

```
Client UI → Runtime SDK → Provider Gateway → LLM → Response
```

AI accesses ERP data **only through Tools** — never direct database access.

---

## Related documents

- [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)
- [FROZEN_RULES.md](./FROZEN_RULES.md)
- [PLATFORM_GUIDE.md](./PLATFORM_GUIDE.md)
- [platform/README.md](../platform/README.md)
