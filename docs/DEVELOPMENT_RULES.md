# AgainERP Development Rules

> **Constitution:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) — read first  
> **Status:** Canonical — FROZEN v1.0.0  
> **Last updated:** 2026-06-30

These rules govern every architectural decision, code change, and new project in the AgainERP ecosystem.

---

## Mandatory read order

1. [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)
2. [FROZEN_RULES.md](./FROZEN_RULES.md)
3. [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) (this file)
4. [README.md](../README.md)
5. [MASTER_INDEX.md](../MASTER_INDEX.md)
6. [PROJECT_MAP.md](../PROJECT_MAP.md)
7. [ARCHITECTURE.md](./ARCHITECTURE.md)
8. [ControlCenter/MASTER_INDEX.md](../ControlCenter/MASTER_INDEX.md)
9. Task-specific documentation

**If implementation conflicts with documentation, documentation wins.**

---

## Core rules

1. **Never create a new repository unless explicitly approved.**

2. **AgainERP Center is the Platform Repository.**
   - Fleet, licensing, billing, AI Core, Provider Gateway, operator UI, Edge Agent protocol
   - All platform SDKs live in `platform/` inside this repo

3. **MoharazNX is the Client ERP Repository.**
   - Business modules, storefront, tenant admin, business tools, runtime integration
   - Reference template for all future client ERP products

4. **All Platform SDKs, Runtime, Shared Contracts, and AI Core belong inside AgainERP Center.**
   - `@againerp/contracts` → `platform/shared-contracts/`
   - `@againerp/runtime` → `platform/runtime-sdk/`
   - Provider Gateway → `platform/provider-gateway/`
   - AI Core → `platform/ai-core/`
   - Never duplicate these in MoharazNX or a third repo

5. **Every Client ERP must inherit the architecture from MoharazNX.**
   - Hospital, School, Restaurant, Manufacturing, Real Estate, NGO ERPs fork MoharazNX patterns
   - Never redesign platform architecture per client
   - Link Center packages via `file:../againerp-center/platform/...`

6. **Every architectural decision must preserve compatibility between AgainERP Center and MoharazNX.**
   - Before Center changes → read MoharazNX `docs/PROJECT_MAP.md` and `docs/PLATFORM_SPLIT.md`
   - Before MoharazNX changes → read Center `PROJECT_MAP.md` and `docs/PACKAGE_BOUNDARIES.md`
   - Contract changes require `@againerp/contracts` semver bump + migration notes
   - No breaking API or package changes without dual-repo verification

---

## Two-repository model

```
againerp-center/          ← Platform Brain + platform/
moharaznx/                ← Client ERP template (business only)
```

**Forbidden without approval:** `againerp-platform`, any third platform repo, duplicate SDK copies in client repos.

---

## MoharazNX must NOT contain

- AI Core, Provider Gateway, Model Registry, Prompt Marketplace (global)
- Platform licensing, billing, fleet registry authority
- Direct LLM provider calls in production
- Duplicate DTOs, events, or types (use `@againerp/contracts`)

## MoharazNX must contain

- Business modules (catalog, orders, customers, inventory, …)
- Storefront and tenant admin UI
- Runtime **integration** (consume `@againerp/runtime`, not own AI Core)
- Conversation UI, business tools, business knowledge, local cache

---

## AI call chain (mandatory)

```
Client UI → @againerp/runtime → Center Provider Gateway → LLM Provider
```

MoharazNX never calls OpenAI, Claude, or Gemini directly in production.

---

## Related documents

- [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md) — **read first**
- [FROZEN_RULES.md](./FROZEN_RULES.md)
- [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [PLATFORM_GOVERNANCE_CONFIRMATION.md](./PLATFORM_GOVERNANCE_CONFIRMATION.md)
- [REMAINING_TODO.md](./REMAINING_TODO.md)

| Document | Repo |
|----------|------|
| [PACKAGE_BOUNDARIES.md](./PACKAGE_BOUNDARIES.md) | Center |
| [ARCHITECTURE_MIGRATION_REPORT.md](./ARCHITECTURE_MIGRATION_REPORT.md) | Center |
| [PLATFORM_SPLIT.md](../../moharaznx/docs/PLATFORM_SPLIT.md) | MoharazNX |
| [MASTER_INDEX.md](../MASTER_INDEX.md) | Center |

---

## Cursor rules

| Repo | File |
|------|------|
| AgainERP Center | `.cursor/rules/againerp-center.mdc` |
| MoharazNX | `.cursor/rules/platform-split.mdc` |
