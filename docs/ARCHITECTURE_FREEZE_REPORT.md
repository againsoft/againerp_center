# Architecture Freeze Report

> **Date:** 2026-06-30  
> **Architecture Version:** `1.0.0`  
> **Status:** **FROZEN**  
> **Authority:** Step B — Platform Validation & Freeze  
> **Validation:** [ARCHITECTURE_VALIDATION_REPORT.md](./ARCHITECTURE_VALIDATION_REPORT.md) — PASS WITH CONDITIONS

---

## Freeze declaration

The AgainERP **Platform Architecture v1.0.0** is hereby **frozen**.

From this date forward:

1. **No architecture redesign** without explicit executive approval and version bump.
2. **No new repositories** for platform code.
3. **No duplicate packages** — contracts, runtime, provider gateway, AI Core live only in `againerp-center/platform/`.
4. **Every future feature** must respect [FROZEN_RULES.md](./FROZEN_RULES.md).

Implementation migration (Phases 1–4) continues under the frozen spec — it does not alter the spec.

---

## Architecture version

| Field | Value |
|-------|-------|
| Platform Architecture | **1.0.0** |
| Contract Package | **1.0.0** (`CONTRACT_VERSION`) |
| Freeze date | 2026-06-30 |
| SSOT document | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Version registry | [ARCHITECTURE_VERSION.md](./ARCHITECTURE_VERSION.md) |

---

## Compatibility matrix (frozen)

| Component | Version | Center | MoharazNX | Future ERP | Breaking change policy |
|-----------|---------|--------|-----------|------------|------------------------|
| Platform Architecture | 1.0.0 | defines | consumes | inherits MoharazNX | Major approval only |
| `@againerp/contracts` | 1.0.0 | defines | must import | must import | Semver + migration guide |
| `@againerp/runtime` | planned 1.0.0 | defines | must import | must import | Shim during transition |
| Provider Gateway | — | runs | never | never | Additive adapters only |
| AI Core | — | runs | never | never | Internal Center module |
| plugin-sdk | — | publishes | loads | loads | Manifest in contracts |
| Edge protocol | v1 | defines | agent only | agent only | Additive messages |
| Center API | 2.0.0 | — | HTTP client | HTTP client | Additive routes preferred |

---

## Repository relationship diagram

```mermaid
flowchart TB
    subgraph Ecosystem["AgainERP Ecosystem — TWO REPOS ONLY"]
        subgraph Center["againerp-center — Platform Brain"]
            WEB["apps/web"]
            API["apps/api"]
            PLAT["platform/"]
            AG["agent/edge-agent"]
            WEB --> API
            API --> PLAT
            AG --> API
        end

        subgraph Client["moharaznx — Client ERP Template"]
            MWEB["apps/web — storefront + admin"]
            MAPI["apps/api — business"]
            RTI["runtime integration"]
            MWEB --> MAPI
            MWEB --> RTI
            MAPI --> RTI
        end
    end

    subgraph Future["Future ERPs — fork MoharazNX"]
        HOSP["Hospital"]
        SCH["School"]
        REST["Restaurant"]
        MFG["Manufacturing"]
        RE["Real Estate"]
        NGO["NGO"]
        COUR["Courier"]
    end

    Client -->|file: packages| PLAT
    Future -->|inherit architecture| Client
    RTI -->|AI HTTP| API
```

---

## Platform diagram

```mermaid
flowchart TB
    subgraph Platform["againerp-center/platform/"]
        SC["shared-contracts<br/>@againerp/contracts"]
        RT["runtime-sdk<br/>@againerp/runtime"]
        PG["provider-gateway"]
        AC["ai-core"]
        PL["plugin-sdk / marketplace"]
        ED["edge-sdk"]
        MON["monitoring-sdk"]
        LIC["licensing-sdk"]
        UPD["update-sdk"]
    end

    LLM["LLM Providers<br/>OpenAI · Claude · Gemini · Azure · DeepSeek · Ollama · OpenRouter"]

    AC --> PG
    PG --> LLM
    RT --> SC
    PG --> SC
    AC --> SC
    PL --> SC
    ED --> SC
    MON --> SC
    LIC --> SC
    UPD --> SC
```

---

## Dependency diagram

```mermaid
flowchart BT
    CONTRACTS["@againerp/contracts"]

    RUNTIME["@againerp/runtime"]
    PGW["provider-gateway"]
    AIC["ai-core"]
    PLG["plugin-sdk"]
    EDGE["edge-sdk"]
    MON["monitoring-sdk"]
    LIC["licensing-sdk"]
    UPD["update-sdk"]

    CAPI["apps/api"]
    CWEB["apps/web"]
    MOHA_W["MoharazNX web"]
    MOHA_A["MoharazNX api"]
    EA["edge-agent"]

    RUNTIME --> CONTRACTS
    PGW --> CONTRACTS
    AIC --> CONTRACTS
    AIC --> PGW
    PLG --> CONTRACTS
    EDGE --> CONTRACTS
    MON --> CONTRACTS
    LIC --> CONTRACTS
    UPD --> CONTRACTS

    CAPI --> PGW
    CAPI --> AIC
    CAPI --> CONTRACTS
    CWEB --> CAPI

    MOHA_W --> RUNTIME
    MOHA_A --> CONTRACTS
    MOHA_A -->|AI requests| CAPI
    MOHA_W --> MOHA_A

    EA --> EDGE
    EA --> CAPI
```

**Forbidden edges:** MoharazNX → LLM providers · MoharazNX → `ai-core` · MoharazNX → `provider-gateway`

---

## Frozen rule sets

| Rule set | Document |
|----------|----------|
| Architecture rules | [FROZEN_RULES.md](./FROZEN_RULES.md) § Architecture |
| Developer rules | [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) |
| Platform rules | [FROZEN_RULES.md](./FROZEN_RULES.md) § Platform |
| Client rules | [FROZEN_RULES.md](./FROZEN_RULES.md) § Client |
| Future development rules | [FROZEN_RULES.md](./FROZEN_RULES.md) § Future |

---

## What changed at freeze

| Step | Deliverable | Status |
|------|-------------|--------|
| A | Folder normalization | ✅ Complete |
| A | `@againerp/contracts` layout | ✅ Complete |
| B | Validation report | ✅ This cycle |
| B | Freeze report | ✅ This document |
| B | Version registry | ✅ ARCHITECTURE_VERSION.md |
| B | Frozen rules | ✅ FROZEN_RULES.md |

---

## Post-freeze development gate

Before shipping any feature:

- [ ] Conforms to Architecture 1.0.0
- [ ] No new platform repository
- [ ] No duplicate contracts/types
- [ ] MoharazNX does not add new provider integrations
- [ ] Contract semver respected if touching DTOs

---

*Architecture Freeze Report — AgainERP Platform v1.0.0 — EFFECTIVE 2026-06-30*
