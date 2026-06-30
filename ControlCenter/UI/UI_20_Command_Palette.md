# Control Center UI — Step 20: Command Palette (⌘K)

> **Status:** UI Prototype  
> **Step:** UI 20 (shell extension)  
> **Route:** Global within `/center/*`  
> **Parent:** [UI_MASTER_INDEX.md](./UI_MASTER_INDEX.md)  
> **Previous:** [UI 19 — Platform Notifications](./UI_19_Notifications.md)  
> **Architecture:** [UI 01 — Shell & Design System](./UI_01_Shell_And_Design_System.md)

---

## Purpose

Design the Control Center command palette — fast navigation to pages, clients, and common operator actions via **⌘K** / **Ctrl+K**. Closes the deferred UI 01 shell improvement.

## Scope

Center-specific palette when on `/center/*`; ERP admin palette disabled on center routes to avoid conflict. Header search trigger on desktop, icon on mobile.

---

## Command Groups

| Group | Source |
|-------|--------|
| Quick actions | Registrations, monitoring, agents, notifications, ERP Admin |
| Overview / Fleet / Commercial / Technical / Platform | `centerNavGroups` |
| Clients | Fleet registry quick jump |

---

## UX

- Violet-bordered modal, grouped headings  
- Fuzzy filter on label, hint, keywords  
- Select → `router.push` + close  
- Header search input opens palette (readonly, shows ⌘K)  

---

## Component Files

```text
lib/navigation/center-command-palette.ts
components/center/
├── center-command-palette.tsx
└── center-command-search.tsx
```

Updated: `center-shell.tsx`, `center-header.tsx`, `command-palette.tsx` (skip on `/center`)

---

## Summary

UI Step 20 adds operator-grade quick navigation to the Control Center shell — ⌘K palette with nav, client jump, and quick actions aligned with platform identity.

**Implemented in code:** palette + search trigger, command registry, ERP palette route guard.
