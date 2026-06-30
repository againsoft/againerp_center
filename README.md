# AgainERP Center

> **Standalone platform control plane** — separate from MoharazNX tenant ERP.

AgainERP Center is the AgainSoft operator console for managing client fleets, subscriptions, licenses, edge agents, AI access, billing, and platform governance.

MoharazNX (tenant ERP) **does not** embed Center UI. Tenant apps connect to Center via API when configured (`AGAINERP_CENTER_URL`).

---

## IMPORTANT — read before ANY task

1. [docs/AGAINERP_PLATFORM_CONSTITUTION.md](./docs/AGAINERP_PLATFORM_CONSTITUTION.md)
2. [docs/FROZEN_RULES.md](./docs/FROZEN_RULES.md)
3. [docs/DEVELOPMENT_RULES.md](./docs/DEVELOPMENT_RULES.md)
4. [README.md](./README.md) (this file)
5. [MASTER_INDEX.md](./MASTER_INDEX.md)
6. [PROJECT_MAP.md](./PROJECT_MAP.md)
7. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
8. [ControlCenter/MASTER_INDEX.md](./ControlCenter/MASTER_INDEX.md)
9. Task-specific documentation

**Documentation wins over implementation.** See [BRAIN.md](./BRAIN.md).

---

## Architecture freeze

| Field | Value |
|-------|-------|
| **Architecture Version** | 1.0.0 |
| **Status** | **FROZEN** |
| **Platform Brain** | AgainERP Center |
| **Business ERP Template** | MoharazNX |

Modifications require version bump, executive approval, documentation update, and compatibility validation.

---

## Structure

```
againerp-center/
├── platform/               # All platform SDKs (FROZEN layout)
├── apps/web/               # Operator UI — port 3100
├── apps/api/               # Platform API — port 8100
├── agent/edge-agent/
├── ControlCenter/          # Enterprise architecture docs
├── docs/                   # Governance + architecture SSOT
├── BRAIN.md                # Developer entry
├── MASTER_INDEX.md
└── PROJECT_MAP.md
```

---

## Quick Start

```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:3100**

---

## MoharazNX integration

MoharazNX is the **client** ERP — business only. Full split: [../moharaznx/docs/PLATFORM_SPLIT.md](../moharaznx/docs/PLATFORM_SPLIT.md)

---

## Related

- Developer entry: [BRAIN.md](./BRAIN.md)
- Package ownership: [docs/PLATFORM_PACKAGE_OWNERSHIP.md](./docs/PLATFORM_PACKAGE_OWNERSHIP.md)
- Platform packages: [platform/README.md](./platform/README.md)
