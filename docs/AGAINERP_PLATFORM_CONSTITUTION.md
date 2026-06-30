# AgainERP Platform Constitution

> **Version:** 1.0.0  
> **Status:** FROZEN — PERMANENT  
> **Effective:** 2026-06-30  
> **Authority:** Chief Enterprise Platform Architect  
> **Supersedes:** All prior architectural decisions, third-repo plans, and pre-constitution layouts

This document is the **permanent Single Source of Truth** for AgainERP platform architecture. Every Cursor task, every developer, and every future ERP product must conform to this constitution before making architectural or implementation decisions.

---

## Preamble

AgainERP is an **Enterprise AI Platform** with a stable, frozen architecture. Center owns the platform. Client ERP owns the business. Architecture simplicity outweighs feature quantity. Platform evolves; business modules scale. **Never redesign the platform for a client.**

---

## Article I — Platform Philosophy

1. **AgainERP Center owns the Platform.**
2. **Client ERP owns the Business.**
3. **Business data never leaves the Client** — Center stores metadata only.
4. **AI never directly accesses ERP** — AI works through Tools.
5. **Every new ERP inherits MoharazNX architecture** — never redesign per vertical.
6. **Two repositories only** — never create another platform repository.

---

## Article II — Repositories

| # | Repository | Role |
|---|------------|------|
| 1 | `againerp-center` | Platform Brain — all shared platform code |
| 2 | `moharaznx` | Business ERP template — runtime consumer |

**Permanently deprecated:** `againerp-platform` and any third platform repository.

---

## Article III — Platform Structure (`againerp-center/platform/`)

```
platform/
├── ai-core/
│   ├── kernel/
│   ├── orchestrator/
│   ├── registry/
│   ├── context/
│   ├── prompt/
│   ├── memory/
│   ├── knowledge/
│   ├── tools/
│   ├── providers/
│   └── security/
├── runtime-sdk/
│   ├── conversation/
│   ├── context/
│   ├── prompt-runtime/
│   ├── memory-connector/
│   ├── knowledge-connector/
│   ├── tool-connector/
│   ├── streaming/
│   └── runtime-config/
├── shared-contracts/
│   ├── dto/
│   ├── events/
│   ├── interfaces/
│   ├── schemas/
│   ├── permissions/
│   ├── protocols/
│   ├── types/
│   └── errors/
├── provider-gateway/
│   └── providers/
│       ├── openai/
│       ├── claude/
│       ├── gemini/
│       ├── azure/
│       ├── deepseek/
│       ├── ollama/
│       └── openrouter/
├── plugin-sdk/
├── integration-sdk/
├── edge-sdk/
├── monitoring-sdk/
├── licensing-sdk/
├── update-sdk/
└── governance/
```

**Deprecated:** `conversation-sdk/` → merged into `runtime-sdk/conversation/`

---

## Article IV — AI Core

AI Core exists **ONLY** inside `againerp-center/platform/ai-core/`.

AI Core owns:

| Module | Responsibility |
|--------|----------------|
| **kernel** | Core runtime loop, lifecycle, platform AI entry |
| **orchestrator** | Platform pipeline coordination |
| **registry** | Authoritative agent + model catalog |
| **context** | Platform context policies |
| **prompt** | Global prompt marketplace |
| **memory** | Platform memory policies (not tenant data) |
| **knowledge** | Global knowledge collections |
| **tools** | Global tool registry |
| **providers** | Provider routing config (delegates to provider-gateway) |
| **security** | Safety guard, PII, injection filter, policies |

**Never duplicate AI Core** in MoharazNX or any client ERP.

---

## Article V — Provider Gateway

All LLM providers exist **ONLY** in `platform/provider-gateway/providers/`:

| Provider | Folder |
|----------|--------|
| OpenAI | `openai/` |
| Claude (Anthropic) | `claude/` |
| Gemini | `gemini/` |
| Azure OpenAI | `azure/` |
| OpenRouter | `openrouter/` |
| DeepSeek | `deepseek/` |
| Ollama | `ollama/` |
| Local models | via `ollama/` or gateway local adapter |

**Client ERP must never communicate directly with providers.**

---

## Article VI — Runtime SDK

`@againerp/runtime` in `platform/runtime-sdk/` is the **only** client-side AI runtime.

MoharazNX and all future ERPs **import** runtime — they never own orchestrator, provider calls, or global registry authority.

---

## Article VII — Shared Contracts

`@againerp/contracts` in `platform/shared-contracts/` is the **only** source of cross-repo types, DTOs, events, protocols, and errors.

**Never duplicate contracts** in client repos.

---

## Article VIII — Client ERP (MoharazNX)

MoharazNX is the **Business ERP Template**.

### Owns (business layer)

Products · Orders · Inventory · CRM · Accounting · Storefront · Website · Business Knowledge · Business Prompts · Business Tools · Context · Conversation UI · ERP Integration · Local Cache

### Never owns (platform layer)

AI Core · Provider Gateway · Global Registry · Marketplace authority · Platform Policies · LLM Keys

### Package links (mandatory target)

```json
{
  "@againerp/contracts": "file:../againerp-center/platform/shared-contracts",
  "@againerp/runtime": "file:../againerp-center/platform/runtime-sdk"
}
```

---

## Article IX — Communication Flow

**Mandatory — never bypass:**

```
Client UI
    ↓
Runtime SDK (@againerp/runtime)
    ↓
Provider Gateway (Center)
    ↓
LLM Provider
    ↓
Response
```

AI accesses ERP data **only through Tools** — never direct database access.

---

## Article X — Future Client ERPs

These products **must fork MoharazNX** — never redesign architecture:

Hospital ERP · School ERP · Restaurant ERP · Manufacturing ERP · Real Estate ERP · NGO ERP · Courier ERP · all future ERP products

---

## Article XI — Satellite Platform Packages

| Package | Role |
|---------|------|
| `plugin-sdk/` | Plugin manifests, marketplace extensions |
| `integration-sdk/` | Third-party integration contracts + adapters |
| `edge-sdk/` | Edge Agent protocol |
| `monitoring-sdk/` | Fleet health contracts + hooks |
| `licensing-sdk/` | License validation contracts |
| `update-sdk/` | Fleet update contracts |
| `governance/` | Platform policies, compliance, audit schemas |

---

## Article XII — Permanent Rules

After constitution ratification:

1. **Never redesign architecture** without constitution version bump + executive approval.
2. **Never create another repository** for platform code.
3. **Never duplicate** Runtime, Contracts, AI Core, or Provider Gateway.
4. **Every future feature** must follow this constitution.
5. **Every Cursor task** must read documents in this order:
   1. `AGAINERP_PLATFORM_CONSTITUTION.md`
   2. `FROZEN_RULES.md`
   3. `DEVELOPMENT_RULES.md`
   4. `README.md`
   5. `MASTER_INDEX.md`
   6. `PROJECT_MAP.md`
   7. `ARCHITECTURE.md`
   8. `ControlCenter/MASTER_INDEX.md`
   9. Task-specific documentation

**If implementation conflicts with documentation, documentation wins.**

---

## Article XIII — Document Hierarchy

| Priority | Document |
|----------|----------|
| 1 | **AGAINERP_PLATFORM_CONSTITUTION.md** (this file) |
| 2 | [FROZEN_RULES.md](./FROZEN_RULES.md) |
| 3 | [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) |
| 4 | [README.md](../README.md) |
| 5 | [MASTER_INDEX.md](../MASTER_INDEX.md) |
| 6 | [PROJECT_MAP.md](../PROJECT_MAP.md) |
| 7 | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| 8 | [ARCHITECTURE_FREEZE_REPORT.md](./ARCHITECTURE_FREEZE_REPORT.md) |
| 9 | [ARCHITECTURE_VALIDATION_REPORT.md](./ARCHITECTURE_VALIDATION_REPORT.md) |
| 10 | [PLATFORM_PACKAGE_OWNERSHIP.md](./PLATFORM_PACKAGE_OWNERSHIP.md) |
| 11 | [DOCUMENTATION_CONSISTENCY_REPORT.md](./DOCUMENTATION_CONSISTENCY_REPORT.md) |
| 12 | [BRAIN.md](../BRAIN.md) |
| 13 | [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) |

These documents override all previous architectural decisions.

---

## Article XIV — Implementation Status

| Layer | Spec | Code |
|-------|------|------|
| Constitution + folder structure | ✅ FROZEN | ✅ Scaffolded |
| `@againerp/contracts` | ✅ FROZEN | ✅ v1.0.0 built |
| `@againerp/runtime` | ✅ FROZEN | ⬜ Phase 2 migration |
| Provider Gateway | ✅ FROZEN | ⬜ Phase 1 migration |
| AI Core | ✅ FROZEN | ⬜ Phase 3 migration |
| MoharazNX compliance | ✅ FROZEN rules | 🔴 Pre-migration debt |

Implementation debt: [REMAINING_TODO.md](./REMAINING_TODO.md)  
Do not expand violations. Fix only via migration phases.

---

## Ratification

| Field | Value |
|-------|-------|
| Constitution Version | **1.0.0** |
| Architecture Version | **1.0.0** |
| Contract Version | **1.0.0** |
| Ratified | 2026-06-30 |
| Status | **FROZEN — PERMANENT** |

---

*AgainERP Platform Constitution v1.0.0 — The architecture shall not be redesigned.*
