# Platform Package Boundaries

> **Constitution:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) — permanent SSOT  
> **Policy:** Two repositories — all platform packages in `againerp-center/platform/`

---

## Boundary matrix

| Concern | Center (`againerp-center`) | MoharazNX | Future client ERP |
|---------|---------------------------|-----------|-------------------|
| Shared contracts | ✅ `platform/shared-contracts` | import only | import only |
| Runtime SDK | ✅ `platform/runtime-sdk` | import only | import only |
| Provider Gateway | ✅ `platform/provider-gateway` | ❌ never | ❌ never |
| AI Core (incl. kernel) | ✅ `platform/ai-core` | ❌ never | ❌ never |
| Model Registry | ✅ Center DB + ai-core/registry | ❌ never | ❌ never |
| Agent Registry (authoritative) | ✅ Center | read-only cache | read-only cache |
| Prompt Marketplace (global) | ✅ ai-core/prompt | ❌ never | ❌ never |
| Business prompts | ❌ | ✅ tenant config | ✅ tenant config |
| Plugin SDK / Marketplace | ✅ `platform/plugin-sdk` | load plugins | load plugins |
| Integration SDK | ✅ `platform/integration-sdk` | use contracts | use contracts |
| Governance | ✅ `platform/governance` | ❌ never | ❌ never |
| Edge SDK | ✅ `platform/edge-sdk` | agent protocol only | agent protocol only |
| Fleet / Licensing / Billing | ✅ `apps/api` + SDKs | ❌ never | ❌ never |
| Monitoring (platform) | ✅ Center + monitoring-sdk | Edge heartbeat only | Edge heartbeat only |
| Catalog / Orders / CRM | ❌ | ✅ | ✅ business modules |
| Storefront | ❌ | ✅ | ✅ |
| Conversation UI | ❌ | ✅ thin UI | ✅ |
| Business tools | ❌ | ✅ ERP tools | ✅ |
| Business knowledge | ❌ | ✅ | ✅ |
| LLM API keys | ✅ Center vault | ❌ never | ❌ never |
| Direct OpenAI/Claude calls | ❌ | ❌ (migrate away) | ❌ |

---

## Package dependency rules

```
@moharaznx/apps/web
  → @againerp/runtime
  → @againerp/contracts

@moharaznx/apps/api
  → @againerp/contracts
  → Center HTTP API (gateway) — NOT llm_client direct

@againerp-center/apps/api
  → platform/provider-gateway
  → platform/ai-core
  → platform/governance
  → @againerp/contracts

@againerp-center/apps/web
  → @againerp/contracts (future)
  → apps/api
```

**Forbidden:** MoharazNX → LLM provider APIs  
**Required:** Client UI → Runtime → Provider Gateway → LLM  
**Required:** AI → ERP data only through Tools

---

## npm package names

| Path | Name |
|------|------|
| `platform/shared-contracts` | `@againerp/contracts` |
| `platform/runtime-sdk` | `@againerp/runtime` |
| `platform/plugin-sdk` | `@againerp/plugin-sdk` |
| `platform/integration-sdk` | `@againerp/integration-sdk` |
| `platform/edge-sdk` | `@againerp/edge-sdk` |

Python: `provider-gateway`, `ai-core`, `governance` — internal modules mounted by `apps/api`.

---

## Client template inheritance

New ERP projects (Hospital, School, Restaurant, Manufacturing, Real Estate, NGO, Courier, …) fork MoharazNX:

1. Copy business module structure
2. Link `@againerp/contracts` and `@againerp/runtime` from Center
3. **Do not** copy `llm_client.py`, `ai/`, or provider code
4. **Do not** redesign platform architecture

---

## Compatibility

Before changing any `@againerp/contracts` type:

1. Bump `CONTRACT_VERSION` in `platform/shared-contracts/src/protocols/version.ts`
2. Update JSON schemas in `schemas/`
3. Test MoharazNX integration
4. Document in CHANGELOG
5. Verify against [FROZEN_RULES.md](./FROZEN_RULES.md)
