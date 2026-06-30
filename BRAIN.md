# AgainERP Center — Developer Entry

> **Cursor:** This repo **is** AgainERP Center. When anyone says "center", they mean **this project** — not MoharazNX.

---

## IMPORTANT — read before ANY task

Before performing **any** task, always read these files **in order**:

1. [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md)
2. [docs/FROZEN_RULES.md](./docs/FROZEN_RULES.md)
3. [docs/DEVELOPMENT_RULES.md](./docs/DEVELOPMENT_RULES.md)
4. [PROJECT_MAP.md](./PROJECT_MAP.md)
5. [MASTER_INDEX.md](./MASTER_INDEX.md)

**If any implementation conflicts with these documents, the documentation always wins.**

- Never redesign the platform.
- Never create another repository.
- Never duplicate Platform packages.
- Never place AI Core inside a Client ERP.

---

## Architecture freeze

| Field | Value |
|-------|-------|
| **Architecture Version** | 1.0.0 |
| **Status** | **FROZEN** |
| **Platform Brain** | AgainERP Center |
| **Business ERP Template** | MoharazNX |

Architecture modifications require: **Version Bump** · **Executive Approval** · **Documentation Update** · **Compatibility Validation**

Otherwise: architecture modification is **prohibited**.

---

## Purpose

AgainSoft **Platform Brain** — fleet, licenses, edge agents, AI Core, provider gateway, shared SDKs, billing. **Metadata only** — never client business data.

## Two repositories only

| Repository | Role |
|------------|------|
| **AgainERP Center** (this) | Platform Brain + all SDKs in `platform/` |
| **MoharazNX** | Client ERP template — business modules only |

**Never create a third platform repository.**

## Sibling project

| Project | Role | Path |
|---------|------|------|
| **AgainERP Center** (this) | Platform operators + SDKs | `againerp-center/` |
| **MoharazNX** | Client tenant ERP | `../moharaznx/` |

MoharazNX connects via `AGAINERP_CENTER_URL` + runtime packages from `platform/`.

---

## Mandatory read order

1. [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md)
2. [docs/FROZEN_RULES.md](./docs/FROZEN_RULES.md)
3. [docs/DEVELOPMENT_RULES.md](./docs/DEVELOPMENT_RULES.md)
4. [README.md](./README.md)
5. [MASTER_INDEX.md](./MASTER_INDEX.md)
6. [PROJECT_MAP.md](./PROJECT_MAP.md)
7. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
8. [ControlCenter/MASTER_INDEX.md](./ControlCenter/MASTER_INDEX.md)
9. Task-specific documentation

---

## Platform ownership

### AgainERP Center owns

Platform · AI Core · Runtime SDK · Shared Contracts · Provider Gateway · Plugin System · Marketplace · Monitoring · Licensing · Fleet · Global Configuration · Global Prompt · Global Policies · Governance

### MoharazNX owns

Business Modules · Storefront · Customer Experience · Business Knowledge · Business Prompts · Business Tools · ERP Integration · Conversation UI · Context · Local Cache · Business Configuration

**Never violate these ownership boundaries.**  
Detail: [docs/PLATFORM_PACKAGE_OWNERSHIP.md](./docs/PLATFORM_PACKAGE_OWNERSHIP.md)

---

## Platform packages

| Package | Path | Owner |
|---------|------|-------|
| Shared Contracts | `platform/shared-contracts/` | Center |
| Runtime SDK | `platform/runtime-sdk/` | Center (MoharazNX consumes) |
| Provider Gateway | `platform/provider-gateway/` | Center only |
| AI Core | `platform/ai-core/` | Center only |
| Satellite SDKs | `platform/*-sdk/`, `governance/` | Center |

Overview: [platform/README.md](./platform/README.md) · [docs/PLATFORM_GUIDE.md](./docs/PLATFORM_GUIDE.md)

---

## Run

```bash
cd apps/web
npm install
npm run dev   # http://localhost:3100
```

## Quick rules

- Routes at `/` — **no** `/center` prefix
- Platform UI only — no tenant catalog/orders/storefront
- All SDKs under `platform/` — MoharazNX consumes, never duplicates
- Cursor rule: `.cursor/rules/againerp-center.mdc`

## Related

- MoharazNX split: `../moharaznx/docs/PLATFORM_SPLIT.md`
- Governance: [docs/PLATFORM_GOVERNANCE_CONFIRMATION.md](./docs/PLATFORM_GOVERNANCE_CONFIRMATION.md)
- Consistency: [docs/DOCUMENTATION_CONSISTENCY_REPORT.md](./docs/DOCUMENTATION_CONSISTENCY_REPORT.md)
