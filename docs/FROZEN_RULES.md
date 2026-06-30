# AgainERP Frozen Rules

> **Constitution:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) — **read first**  
> **Architecture Version:** 1.0.0  
> **Status:** FROZEN — PERMANENT (2026-06-30)  
> **Authority:** Constitution Article XII + [ARCHITECTURE_FREEZE_REPORT.md](./ARCHITECTURE_FREEZE_REPORT.md)

All AgainERP development must follow these rules. No exceptions without executive approval and architecture version bump.

**If implementation conflicts with documentation, documentation wins.**

---

## Mandatory read order

1. [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)
2. [FROZEN_RULES.md](./FROZEN_RULES.md) (this file)
3. [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
4. [README.md](../README.md)
5. [MASTER_INDEX.md](../MASTER_INDEX.md)
6. [PROJECT_MAP.md](../PROJECT_MAP.md)
7. [ARCHITECTURE.md](./ARCHITECTURE.md)
8. [ControlCenter/MASTER_INDEX.md](../ControlCenter/MASTER_INDEX.md)
9. Task-specific documentation

---

## Architecture freeze

| Field | Value |
|-------|-------|
| Architecture Version | **1.0.0** |
| Status | **FROZEN** |
| Platform Brain | AgainERP Center |
| Business ERP Template | MoharazNX |

Modifications require: version bump · executive approval · documentation update · compatibility validation.

---

## Platform ownership

**Center owns:** Platform · AI Core · Runtime SDK · Shared Contracts · Provider Gateway · Plugin System · Marketplace · Monitoring · Licensing · Fleet · Global Configuration · Global Prompt · Global Policies · Governance

**MoharazNX owns:** Business Modules · Storefront · Customer Experience · Business Knowledge · Business Prompts · Business Tools · ERP Integration · Conversation UI · Context · Local Cache · Business Configuration

Detail: [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md)

---

## Architecture rules

1. **Two repositories only:** `againerp-center` (platform) + `moharaznx` (client template).
2. **No third platform repository** — ever. `againerp-platform` is dead.
3. **All platform SDKs** live under `againerp-center/platform/`.
4. **No architecture redesign** after freeze without version bump to 2.0.0+ and written approval.
5. **Metadata boundary:** Center stores fleet/licensing/health metadata only — never tenant business rows.
6. **AI call chain is mandatory:**
   ```
   Client UI → @againerp/runtime → Center Provider Gateway → LLM
   ```

---

## Platform rules (AgainERP Center)

| Rule | Detail |
|------|--------|
| Own contracts | `@againerp/contracts` in `platform/shared-contracts/` |
| Own runtime | `@againerp/runtime` in `platform/runtime-sdk/` |
| Own provider gateway | `platform/provider-gateway/` — Center API mounts only |
| Own AI Core | `platform/ai-core/` incl. `kernel/` — never export to MoharazNX |
| Own marketplace | `platform/plugin-sdk/` + Center module registry |
| Own integrations | `platform/integration-sdk/` — contracts only in Center |
| Own governance | `platform/governance/` — policies, compliance schemas |
| Own fleet/licensing/monitoring | `apps/api` services + satellite SDKs |
| Operator UI | `apps/web/` — platform console only, no tenant storefront |
| Routes | Root paths only — no `/center` prefix |

**Center must NOT:** Store catalog, orders, customers, or tenant PII.

---

## Client rules (MoharazNX + future ERPs)

| Rule | Detail |
|------|--------|
| Business only | Catalog, orders, storefront, CRM, inventory, SEO, etc. |
| Import contracts | `@againerp/contracts` from Center — never duplicate DTOs |
| Import runtime | `@againerp/runtime` from Center — never duplicate orchestrator |
| Never import | `provider-gateway`, `ai-core`, platform provider adapters |
| Never own | AI Core, Model Registry authority, LLM API keys, global prompts |
| Center bridge | Only `center-client.ts` + `againerp-center-link.tsx` |
| No legacy Center UI | No `/center` routes, no `components/center/` |
| Conversation UI | Allowed — thin UI calling runtime, not providers |

**MoharazNX must NOT:** Call OpenAI, Claude, Gemini, or any LLM API directly in production.

---

## Developer rules

1. Read [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) first.
2. Then [FROZEN_RULES.md](./FROZEN_RULES.md) → [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md).
3. Read MoharazNX [PLATFORM_SPLIT.md](../../moharaznx/docs/PLATFORM_SPLIT.md) before client work.
4. Bump `CONTRACT_VERSION` on breaking DTO changes.
5. Use `git mv` for cross-repo package moves — preserve history.
6. Feature flags for strangler migrations (`AI_CENTER_GATEWAY`, `AI_RUNTIME_ENABLED`).
7. No new files in deprecated `conversation-sdk/` or `againerp-platform/`.
8. Match naming: `center-*` components, snake_case Python, kebab-case API routes.
9. Adapters in Center web bridge API → UI types — do not leak ORM shapes to UI.

---

## Future development rules

### New client ERP (Hospital, School, Restaurant, Manufacturing, Real Estate, NGO, Courier, …)

1. **Fork MoharazNX** — copy business module structure.
2. **Link Center packages:**
   ```json
   "@againerp/contracts": "file:../againerp-center/platform/shared-contracts",
   "@againerp/runtime": "file:../againerp-center/platform/runtime-sdk"
   ```
3. **Do not** copy `llm_client.py`, `ai/`, or provider integration code.
4. **Do not** redesign platform architecture per vertical.
5. Register client in Center fleet; use `AGAINERP_CENTER_URL` + client API key.

### New platform capability

1. Add to existing `platform/` package — do not create new repo.
2. Update `ARCHITECTURE.md` only if structure changes (requires version bump).
3. Add types to `@againerp/contracts` first.
4. Update [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) if migration needed.

### New feature in existing apps

| If feature is… | Build in… |
|----------------|-----------|
| Fleet, license, AI governance | Center `apps/` |
| Product, order, customer | MoharazNX `apps/` |
| Shared type / event | `platform/shared-contracts/` |
| Client AI runtime behavior | `platform/runtime-sdk/` |
| LLM provider call | `platform/provider-gateway/` |

---

## Violations (do not expand)

These exist pre-freeze and are **frozen debt** — fix only via migration phases, never add new instances:

| Violation | Location | Fix phase |
|-----------|----------|-----------|
| Direct LLM calls | `moharaznx/.../llm_client.py` | Phase 1 |
| Local AI package | `moharaznx/ai/` | Phase 2 |
| Duplicate conversation types | `lib/conversation/types.ts` | Phase 0 |
| OpenAI in web deps | `moharaznx/apps/web/package.json` | Phase 2 |
| AI service not in ai-core | `apps/api/.../ai_service.py` | Phase 3 |

**Adding new violations after freeze is prohibited.**

---

## Enforcement

| Gate | Document |
|------|----------|
| Pre-merge | [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) compatibility gates |
| Architecture drift | [ARCHITECTURE_VALIDATION_REPORT.md](./ARCHITECTURE_VALIDATION_REPORT.md) |
| Package boundaries | [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md) |

---

*Frozen Rules — Architecture 1.0.0*
