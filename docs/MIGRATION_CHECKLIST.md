# Platform Migration Checklist

> Track progress aligning with two-repository architecture.  
> **Rule:** Never create a third repository.

---

## Phase 0 — Consolidate platform home ✅

- [x] Create `againerp-center/platform/` tree
- [x] Codify [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
- [x] Move `@againerp/contracts` → `platform/shared-contracts/`
- [x] Scaffold README for all platform packages
- [x] Write Architecture Migration Report
- [x] Write Folder Migration Report
- [x] Update `PROJECT_MAP.md`
- [x] Update `MASTER_INDEX.md`
- [x] Update `BRAIN.md`
- [x] Deprecate `againerp-platform/` (notice only, no delete)
- [x] **Step A:** Normalize platform folder structure (final layout)
- [x] Reorganize `shared-contracts` into dto/events/types/protocols/errors
- [x] Deprecate `conversation-sdk` → `runtime-sdk/conversation/`
- [x] Publish [ARCHITECTURE.md](./ARCHITECTURE.md) + [PLATFORM_GUIDE.md](./PLATFORM_GUIDE.md)
- [ ] Build `platform/shared-contracts` in CI
- [ ] MoharazNX `package.json` link to `platform/shared-contracts`
- [ ] Replace `lib/conversation/types.ts` with `@againerp/contracts` imports

---

## Phase 1 — Provider Gateway

- [ ] Create `platform/provider-gateway/` Python package
- [ ] Implement OpenAI adapter (from `moharaznx/llm_client.py`)
- [ ] Add Center routes `/ai/v1/complete`, `/ai/v1/stream`
- [ ] Add `/agent/v1/conversation` using contracts
- [ ] MoharazNX strangler: `AI_CENTER_GATEWAY=true` flag
- [ ] Migrate API keys to Center vault
- [ ] Anthropic + Gemini adapters

---

## Phase 2 — Runtime SDK

- [ ] `git mv` `moharaznx/ai/` → `platform/runtime-sdk/`
- [ ] Rename `@againerp/ai` → `@againerp/runtime`
- [ ] MoharazNX shim at `ai/` re-exporting runtime
- [ ] Move `center-client.ts` into runtime package
- [ ] Wire storefront chat through runtime
- [ ] Extract edge protocol to `platform/edge-sdk/`

---

## Phase 3 — AI Core + registries

- [ ] Consolidate `ai_service.py` → `platform/ai-core/`
- [ ] Center authoritative agent/model registry
- [ ] MoharazNX tenant `ai_agents` → Center sync refs
- [ ] Licensing/update/monitoring SDK type exports

---

## Phase 4 — Cleanup

- [ ] One Chat UI in MoharazNX
- [ ] Remove MoharazNX `/center` legacy routes
- [ ] Remove `againerp-center/control/` mirror
- [ ] Plugin SDK MVP
- [ ] Contract compatibility CI

---

## Documentation sync

- [x] Center `PROJECT_MAP.md`
- [x] Center `MASTER_INDEX.md`
- [x] Center `BRAIN.md`
- [x] Center `docs/ARCHITECTURE.md` (platform SSOT)
- [x] Center `docs/PLATFORM_GUIDE.md`
- [x] `ControlCenter/18_Platform_Package_Architecture.md`
- [ ] MoharazNX `docs/PROJECT_MAP.md`
- [ ] MoharazNX `docs/PLATFORM_SPLIT.md`
- [ ] MoharazNX `BRAIN.md`
- [ ] `ControlCenter/14_AI_Control.md`
- [ ] `ControlCenter/16_Project_Structure.md`
- [ ] Update `PLATFORM_ECOSYSTEM_AUDIT.md` (normalization complete note)

---

## Compatibility gates (before each release)

- [ ] Conforms to [FROZEN_RULES.md](./FROZEN_RULES.md)
- [ ] `@againerp/contracts` semver unchanged OR migration guide written
- [ ] MoharazNX smoke: storefront, PC builder, admin login
- [ ] Center smoke: fleet, AI access, agent heartbeat
- [ ] No direct LLM calls from MoharazNX when gateway flag on
- [ ] No new architecture violations — see [REMAINING_TODO.md](./REMAINING_TODO.md)

---

## Step B — Validation & freeze ✅

- [x] Architecture validation report
- [x] Architecture freeze report (v1.0.0)
- [x] Architecture version registry
- [x] Frozen rules published
- [x] Migration complete report (spec)
- [x] Remaining TODO list

---

## Constitution — permanent governance ✅

- [x] [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) ratified v1.0.0
- [x] [PLATFORM_GOVERNANCE_CONFIRMATION.md](./PLATFORM_GOVERNANCE_CONFIRMATION.md)
- [x] [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md)
- [x] [DOCUMENTATION_CONSISTENCY_REPORT.md](./DOCUMENTATION_CONSISTENCY_REPORT.md)
- [x] Mandatory read order synchronized (9 steps)
- [x] Architecture freeze box in all entry docs
- [x] Cursor rules updated (Center + MoharazNX)
