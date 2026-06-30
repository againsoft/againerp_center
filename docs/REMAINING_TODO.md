# Remaining TODO List

> **Constitution:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) — FROZEN v1.0.0  
> **Gate:** Complete before claiming full platform boundary compliance  
> **Rules:** [FROZEN_RULES.md](./FROZEN_RULES.md)

---

## Priority 0 — Contract adoption (before new AI features)

- [ ] Add `platform/shared-contracts` build to CI
- [ ] Link `@againerp/contracts` in MoharazNX `apps/web/package.json` (`file:../againerp-center/platform/shared-contracts`)
- [ ] Replace `moharaznx/apps/web/src/lib/conversation/types.ts` with `@againerp/contracts` imports
- [ ] Update `center-client.ts` to import `CenterAiRequest` / `CenterAiResponse` from contracts

---

## Phase 1 — Provider Gateway

- [ ] Implement `platform/provider-gateway/` Python package (start with `providers/openai/`)
- [ ] Migrate logic from `moharaznx/apps/api/app/services/llm_client.py`
- [ ] Add Center routes: `/ai/v1/complete`, `/ai/v1/stream`, `/ai/v1/structured`
- [ ] Add `/agent/v1/conversation` per contract DTOs
- [ ] MoharazNX strangler flag `AI_CENTER_GATEWAY=true`
- [ ] Migrate API keys to Center vault; tenant stores refs only
- [ ] Adapters: claude, gemini, azure, deepseek, ollama, openrouter

---

## Phase 2 — Runtime SDK

- [ ] `git mv` `moharaznx/ai/` → `platform/runtime-sdk/src/`
- [ ] Publish `@againerp/runtime` package.json
- [ ] MoharazNX shim at `ai/` re-exporting runtime
- [ ] Move `center-client.ts` → `runtime-sdk/conversation/`
- [ ] Wire storefront chat through runtime
- [ ] Remove `openai` from MoharazNX web production path
- [ ] Extract edge protocol → `platform/edge-sdk/`

---

## Phase 3 — AI Core + satellite SDKs

- [ ] Extract `ai_service.py` → `platform/ai-core/` (start with `kernel/`)
- [ ] Center authoritative agent/model registry API
- [ ] MoharazNX `ai_agents` → Center catalog refs
- [ ] Export types in `monitoring-sdk`, `licensing-sdk`, `update-sdk`
- [ ] `plugin-sdk` MVP for marketplace manifests
- [ ] `integration-sdk` contracts for third-party connectors
- [ ] `governance/` policy schemas aligned with contracts

---

## Phase 4 — Cleanup

- [ ] One Chat UI in MoharazNX (merge ai-consultant, PC builder chat, support)
- [ ] Remove MoharazNX `/center` legacy routes (if any remain)
- [ ] Remove `againerp-center/control/` mirror
- [ ] Contract compatibility CI across repos
- [ ] Remove `llm_client.py` direct path (dev fallback only or delete)

---

## Documentation debt

- [ ] Update `ControlCenter/14_AI_Control.md` for Provider Gateway + Runtime split
- [ ] Update `ControlCenter/16_Project_Structure.md` — remove legacy `control/` placement
- [ ] MoharazNX `ai/ARCHITECTURE.md` — redirect to `@againerp/runtime`
- [ ] Mark `PLATFORM_ECOSYSTEM_AUDIT.md` violations as frozen debt with phase refs

---

## Compatibility gates (every release)

- [ ] `@againerp/contracts` semver unchanged OR migration guide written
- [ ] MoharazNX smoke: storefront, PC builder, admin login
- [ ] Center smoke: fleet, AI access, agent heartbeat
- [ ] No new direct LLM calls from MoharazNX
- [ ] No new files in deprecated packages

---

## STOP condition

When all Priority 0 + Phases 1–4 checkboxes are ✅:

1. Update [MIGRATION_COMPLETE_REPORT.md](./MIGRATION_COMPLETE_REPORT.md) — implementation complete
2. Re-run validation per [ARCHITECTURE_VALIDATION_REPORT.md](./ARCHITECTURE_VALIDATION_REPORT.md)
3. Bump Architecture to 1.1.0 only if additive; 2.0.0 if breaking

Until then: **development may proceed under frozen rules; violations must not grow.**
