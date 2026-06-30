# Architecture Migration Report

> **Date:** 2026-06-30  
> **Decision:** Two repositories only — `againerp-center` + `moharaznx`  
> **Supersedes:** Third-repo plan (`againerp-platform`) from prior audit Step 1

---

## 1. Executive summary

AgainERP platform assets must live **inside `againerp-center/platform/`**, not in a separate repository. MoharazNX remains the **reference client ERP template** — business modules only, consuming Center packages via `file:` links.

| Action | Status |
|--------|--------|
| `@againerp/contracts` moved to `platform/shared-contracts/` | ✅ Done |
| Platform folder scaffold (10 packages) | ✅ Done |
| `againerp-platform` deprecated (not deleted) | ✅ Noted |
| **Step A:** Final platform folder normalization | ✅ Done |
| `shared-contracts` subfolder layout | ✅ Done |
| `docs/ARCHITECTURE.md` published | ✅ Done |
| MoharazNX `ai/` → `platform/runtime-sdk/` | 🟡 Planned |
| MoharazNX `llm_client.py` → `platform/provider-gateway/` | 🟡 Planned |
| MoharazNX consumes `@againerp/contracts` | 🟡 Planned |

**No working code deleted. No functionality removed.**

---

## 2. Inventory — third repository (deprecated)

### `againerp-platform/` (htdocs sibling)

| Path | Asset | Migration target | Status |
|------|-------|------------------|--------|
| `packages/contracts/src/*` | `@againerp/contracts` source | `againerp-center/platform/shared-contracts/` | ✅ Copied |
| `packages/contracts/schemas/*` | JSON Schemas | same | ✅ Copied |
| `package.json`, `README.md`, `BRAIN.md` | Monorepo root | **Deprecated** — use Center |
| `node_modules/`, `dist/` | Build artifacts | Rebuild in Center | Regenerate on demand |

**Deprecation notice:** See `againerp-platform/DEPRECATED.md`

---

## 3. Inventory — MoharazNX (migrate TO Center)

### Platform violations (must leave MoharazNX)

| Category | Current path | Target in Center | Phase |
|----------|--------------|------------------|-------|
| **Runtime SDK** | `moharaznx/ai/` (181 files, `@againerp/ai`) | `platform/runtime-sdk/` | 2 |
| **Provider Gateway** | `apps/api/app/services/llm_client.py` | `platform/provider-gateway/` | 1 |
| **Provider Gateway** | `apps/api/app/services/pc_builder_llm.py` | `platform/provider-gateway/` | 1 |
| **Platform AI registry** | `apps/api/app/models/ai_provider.py`, `ai_agent.py` | Center DB + `platform/ai-core/` | 3 |
| **Tenant API keys** | `apps/api/app/models/ai_api_connection.py` | Center vault; tenant refs only | 2 |
| **Provider constants** | `ai/constants/providers.ts` | `@againerp/contracts/providers` | 1 |

### Stays in MoharazNX (business layer)

| Category | Path | Notes |
|----------|------|-------|
| Catalog, orders, commerce | `apps/api/app/routers/catalog_*`, `commerce_*` | Business |
| Storefront | `apps/web/src/app/(storefront)/` | Business |
| Business tools | `chat_order_service.py`, `customer_support_faq.py` | ERP tools |
| Conversation UI | `ai-consultant/`, chat widgets | UI only — calls runtime |
| Runtime integration | `lib/conversation/` (after migration) | Thin wrapper over `@againerp/runtime` |
| Legacy Center UI | `apps/web/src/app/center/` | Remove in Phase 4 |

---

## 4. Inventory — already in Center (keep + extend)

| Category | Path | Package mapping |
|----------|------|-----------------|
| Operator UI | `apps/web/` | Apps layer |
| Platform API | `apps/api/` | Apps layer |
| Edge Agent | `agent/edge-agent/` | → `platform/edge-sdk/` |
| AI metadata | `apps/api/app/services/ai_service.py` | → `platform/ai-core/` |
| Licensing | `license_service.py` | → `platform/licensing-sdk/` |
| Updates | `update_service.py` | → `platform/update-sdk/` |
| Monitoring | `monitoring.py`, health models | → `platform/monitoring-sdk/` |
| Architecture docs | `ControlCenter/` | Docs |
| Shared contracts | `platform/shared-contracts/` | ✅ New |

---

## 5. Target architecture diagram

```mermaid
flowchart TB
    subgraph Center["againerp-center"]
        subgraph Apps["apps/"]
            WEB[web]
            API[api]
        end
        subgraph Platform["platform/"]
            SC[shared-contracts]
            RT[runtime-sdk]
            PG[provider-gateway]
            AC[ai-core]
            PL[plugin-sdk]
            ED[edge-sdk]
        end
        AG[agent/edge-agent]
        CC[ControlCenter/docs]
    end

    subgraph MoharazNX["moharaznx — Client ERP template"]
        BIZ[Business modules]
        SF[Storefront]
        RTI[Runtime integration]
    end

    MoharazNX -->|@againerp/runtime| RT
    MoharazNX -->|@againerp/contracts| SC
    RT --> SC
    API --> PG
    API --> AC
    PG --> LLM[LLM Providers]
    AG --> API
    WEB --> API
    BIZ --> RTI
```

---

## 6. Two-repository rule

```
✅ againerp-center  — Platform Brain + all SDKs + operator UI + API + Edge
✅ moharaznx        — Business ERP template (consumes Center packages)
❌ againerp-platform — DEPRECATED (never use)
❌ Any third repo   — FORBIDDEN
```

Future ERPs (Hospital, School, Restaurant, …) **fork MoharazNX architecture**, not Center.

---

## 7. Compatibility matrix

| Change | Center | MoharazNX | Breaking? |
|--------|--------|-----------|-----------|
| Contracts in Center | New path | Update `file:` link | No if shim kept |
| Deprecate `againerp-platform` | — | Update docs | No |
| Move `ai/` to runtime-sdk | Publish package | `@againerp/ai` re-export shim | No during transition |
| Provider gateway | New `/ai/v1/*` | Strangler flag on llm_client | No with fallback |
| Remove MoharazNX `/center` | — | Delete legacy routes | Low — use Center repo |

---

## 8. Migration phases

| Phase | Deliverable | Repos touched |
|-------|-------------|---------------|
| **0** ✅ | Contracts in `platform/shared-contracts/` | Center |
| **1** | Provider Gateway + Center `/ai/v1/*` | Center; MoharazNX strangler |
| **2** | Move `moharaznx/ai/` → `runtime-sdk/` | Center; MoharazNX shim |
| **3** | AI Core consolidation, key vault | Center |
| **4** | One Chat UI, plugin SDK, cleanup legacy | MoharazNX |

---

## 9. Git history preservation

Use **`git mv`** when moving `moharaznx/ai/` → `againerp-center/platform/runtime-sdk/`:

```bash
# From moharaznx repo (when ready):
git mv ai/ ../againerp-center/platform/runtime-sdk/src-legacy/
# Add re-export shim at moharaznx/ai/package.json → file:../againerp-center/platform/runtime-sdk
```

Cross-repo moves may require `git filter-repo` or subtree — document in PR.

---

## 10. Related documents

- [FOLDER_MIGRATION_REPORT.md](./FOLDER_MIGRATION_REPORT.md)
- [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)
- [PLATFORM_ECOSYSTEM_AUDIT.md](./PLATFORM_ECOSYSTEM_AUDIT.md)
- [../platform/README.md](../platform/README.md)
- [../PROJECT_MAP.md](../PROJECT_MAP.md)
- [../MASTER_INDEX.md](../MASTER_INDEX.md)
