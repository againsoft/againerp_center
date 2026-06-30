# AgainERP Platform Developer Guide

> **Constitution:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) — read first  
> **Ownership:** [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md) — full package registry  
> For engineers working on `platform/` packages or integrating MoharazNX with Center.

---

## Mandatory read order

1. [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)
2. [FROZEN_RULES.md](./FROZEN_RULES.md)
3. [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
4. [README.md](../README.md)
5. [MASTER_INDEX.md](../MASTER_INDEX.md)
6. [PROJECT_MAP.md](../PROJECT_MAP.md)
7. [ARCHITECTURE.md](./ARCHITECTURE.md)
8. [ControlCenter/MASTER_INDEX.md](../ControlCenter/MASTER_INDEX.md)
9. Task-specific documentation

---

## Quick start

```bash
# Build contracts (required before MoharazNX links)
cd platform/shared-contracts
npm install && npm run build
```

MoharazNX `package.json` (target):

```json
{
  "@againerp/contracts": "file:../againerp-center/platform/shared-contracts",
  "@againerp/runtime": "file:../againerp-center/platform/runtime-sdk"
}
```

---

## Package reference

> **Full ownership matrix:** [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md)

### `@againerp/contracts` — `platform/shared-contracts/`

| Subfolder | Contents | Import path |
|-----------|----------|-------------|
| `types/` | Branded ID types (`ClientId`, `AgentId`, …) | `@againerp/contracts` or `./types` |
| `dto/` | Conversation, agent, context DTOs | `@againerp/contracts` or `./dto` |
| `protocols/` | Gateway protocol, contract version headers | `@againerp/contracts/protocols` |
| `events/` | `AiUsageEvent`, `HeartbeatEvent`, … | `@againerp/contracts/events` |
| `errors/` | `AI_ERROR_CODES`, `PlatformContractError` | `@againerp/contracts/errors` |
| `permissions/` | Operator and agent tool scopes | `@againerp/contracts/permissions` |
| `interfaces/` | Re-exported interface contracts | `@againerp/contracts/interfaces` |
| `schemas/` | JSON Schema v1 (OpenAPI / Pydantic gen) | file path |

**Rule:** Never duplicate these types in MoharazNX. Replace `lib/conversation/types.ts` with imports.

### `@againerp/runtime` — `platform/runtime-sdk/`

Client-side AI runtime. **MoharazNX consumes; Center defines.**

| Module | Role |
|--------|------|
| `conversation/` | Threads, Center Client, streaming UI bridge |
| `context/` | Context assembly (from MoharazNX `ai/context`) |
| `prompt-runtime/` | Business prompt merge layer |
| `memory-connector/` | Tenant memory (from `ai/memory`) |
| `knowledge-connector/` | Tenant RAG |
| `tool-connector/` | ERP tool execution interface |
| `streaming/` | SSE chunk handling |
| `runtime-config/` | Client ID, Center URL, feature flags |

**Does NOT contain:** Provider Gateway, API keys, platform agent authority.

### Provider Gateway — `platform/provider-gateway/`

Center-only Python package. One folder per provider under `providers/`.

Mounted by `apps/api` at `/ai/v1/complete`, `/ai/v1/stream`, `/ai/v1/structured`.

### AI Core — `platform/ai-core/`

Center-only platform brain modules. MoharazNX never imports.

### Satellite SDKs

| Package | Role |
|---------|------|
| `plugin-sdk/` | Signed plugin manifests, marketplace extensions |
| `integration-sdk/` | Third-party integration contracts + adapters |
| `edge-sdk/` | Heartbeat + command protocol (from `agent/edge-agent`) |
| `monitoring-sdk/` | Health event types + client hooks |
| `licensing-sdk/` | License validation contracts |
| `update-sdk/` | Fleet update state contracts |
| `governance/` | Platform policies, compliance, audit schemas |

---

## Adding a new provider

1. Create `platform/provider-gateway/providers/<name>/`
2. Add adapter implementing `GatewayCompletionRequest` → `GatewayCompletionResponse`
3. Register `PROVIDER_IDS` in `@againerp/contracts` if new ID
4. Add Center route handler — **no MoharazNX changes**

---

## Changing a contract

1. Edit source in `platform/shared-contracts/src/`
2. Bump `CONTRACT_VERSION` in `protocols/version.ts`
3. Update matching JSON Schema in `schemas/`
4. `npm run build`
5. Test MoharazNX integration
6. Document in CHANGELOG

---

## MoharazNX integration checklist

- [ ] Link `@againerp/contracts` via `file:`
- [ ] Replace `lib/conversation/types.ts` imports
- [ ] Route AI through `@againerp/runtime` (after Phase 2)
- [ ] Set `AGAINERP_CENTER_URL`, `AGAINERP_CLIENT_ID`, `AGAINERP_CLIENT_API_KEY`
- [ ] Never add `llm_client.py` patterns to new modules

---

## Read order

1. [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)
2. [FROZEN_RULES.md](./FROZEN_RULES.md)
3. [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
4. [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md)
5. [ARCHITECTURE.md](./ARCHITECTURE.md)
6. [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md)
7. [platform/README.md](../platform/README.md)
