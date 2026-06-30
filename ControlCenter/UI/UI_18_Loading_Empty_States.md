# Control Center UI — Step 18: Loading & Empty States

> **Status:** UI Prototype  
> **Step:** UI 18 (UX polish)  
> **Route:** All `/center/*`  
> **Parent:** [UI_MASTER_INDEX.md](./UI_MASTER_INDEX.md)  
> **Previous:** [UI 17 — Monitoring Charts](./UI_17_Monitoring_Charts.md)

---

## Purpose

Standardize loading skeletons and empty filter states across the Control Center — consistent violet platform UX while mock data loads and when filters return no results.

## Scope

Shared `Skeleton`, `CenterPageSkeleton`, `CenterEmptyState`; route-level `loading.tsx`; client detail not-found state. No API latency simulation.

---

## Components

| Component | Use |
|-----------|-----|
| `Skeleton` | Base shadcn pulse block |
| `CenterPageSkeleton` | `list` · `dashboard` · `detail` variants |
| `CenterEmptyState` | Icon, title, optional description, action slot |

---

## Route Loading

| File | Variant |
|------|---------|
| `app/center/loading.tsx` | `list` — default for all center routes |
| `app/center/clients/[id]/loading.tsx` | `detail` — client tab layout |

Shown during Next.js App Router navigations before client components hydrate.

---

## Empty States

All filterable list pages migrated from inline dashed boxes to `CenterEmptyState` with **Reset filters** action:

- Clients, registrations, monitoring, modules, updates, backups  
- AI access, billing, audit, licenses  
- Agent commands, activations, sync queues, diagnostics  
- Settings operators, API keys  

Client not-found (`/center/clients/[id]`) uses empty state with back link.

---

## Best Practices

- Empty states never imply missing API — copy references filters  
- Skeleton layout mirrors real page stack (header → stats → toolbar → table)  
- Violet icon circle matches platform identity  
- Detail skeleton matches tabbed client layout  

---

## Summary

UI Step 18 polishes Control Center UX with shared loading skeletons and empty states — ready for API wiring when real fetch latency replaces instant mock data.

**Implemented in code:** `skeleton.tsx`, `center-page-skeleton.tsx`, `center-empty-state.tsx`, route loading files, 16 list empty states updated.
