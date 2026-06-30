# AgainERP Architecture Version

> **Constitution Version:** 1.0.0  
> **Status:** FROZEN — PERMANENT  
> **Effective:** 2026-06-30  
> **Authority:** [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)

---

## Version identifiers

| Identifier | Version | Scope |
|------------|---------|-------|
| **Platform Architecture** | `1.0.0` | Constitution — permanent SSOT |
| **Contract Package** | `1.0.0` | `@againerp/contracts` — `CONTRACT_VERSION` in `platform/shared-contracts/` |
| **Runtime Package** | — (planned `1.0.0`) | `@againerp/runtime` — not published until Phase 2 |
| **Center API** | `2.0.0` | Operator + agent surfaces (additive `/ai/v1` in Phase 1) |

---

## Semver policy

| Change type | Bump | Example |
|-------------|------|---------|
| New platform package subfolder (no API change) | Architecture patch | 1.0.0 → 1.0.1 |
| New contract field (optional) | Contract minor | 1.0.0 → 1.1.0 |
| Breaking DTO / event shape | Contract major | 1.0.0 → 2.0.0 |
| New repository | **Forbidden** | — |

---

## Freeze authority

After **Architecture 1.0.0** freeze:

- No architecture redesign without explicit executive approval
- No third platform repository
- No duplicate contracts, runtime, or provider gateway in MoharazNX
- All new features must conform to [FROZEN_RULES.md](./FROZEN_RULES.md)

---

## Related documents

- [AGAINERP_PLATFORM_CONSTITUTION.md](./AGAINERP_PLATFORM_CONSTITUTION.md)
- [ARCHITECTURE_FREEZE_REPORT.md](./ARCHITECTURE_FREEZE_REPORT.md)
- [ARCHITECTURE_VALIDATION_REPORT.md](./ARCHITECTURE_VALIDATION_REPORT.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
