# Control Center UI — Step 21: Collapsible Sidebar

> **Status:** UI Prototype  
> **Step:** UI 21 (shell extension)  
> **Route:** `/center/*` shell  
> **Parent:** [UI_MASTER_INDEX.md](./UI_MASTER_INDEX.md)  
> **Previous:** [UI 20 — Command Palette](./UI_20_Command_Palette.md)  
> **Architecture:** [UI 01 — Shell & Design System](./UI_01_Shell_And_Design_System.md)

---

## Purpose

Add a collapsible desktop sidebar — icon-rail mode for dense operator workflows. Also adds **Notifications** to the Platform nav group (page shipped in UI 19).

## Scope

Persisted collapse preference, icon-only mode with tooltips, toggle control, unread badges in collapsed mode. Mobile drawer unchanged (always expanded).

---

## Behavior

| State | Width | Content |
|-------|-------|---------|
| Expanded | 224px (`w-56`) | Group labels, titles, badges |
| Collapsed | 64px (`w-16`) | Icons only + `title` tooltip |

- Preference stored in `useCenterSidebarStore` (localStorage)  
- Collapse toggle in sidebar footer  
- Registration + notification unread badges adapt to collapsed layout  

---

## Nav update

Platform group now includes **Notifications** (`/center/notifications`) with unread count badge synced to notification store.

---

## Component Files

```text
lib/store/center-sidebar-store.ts
components/center/center-sidebar.tsx (updated)
lib/navigation/center-nav.ts (Notifications entry)
```

---

## Summary

UI Step 21 completes the deferred collapsible sidebar from UI 01 and wires the notifications page into primary navigation — improving operator density without losing wayfinding.

**Implemented in code:** collapse store, sidebar rail mode, nav + badges.
