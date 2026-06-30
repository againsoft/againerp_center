# Control Center UI — Step 19: Platform Notifications

> **Status:** UI Prototype  
> **Step:** UI 19 (shell extension)  
> **Route:** Header bell · `/center/notifications`  
> **Parent:** [UI_MASTER_INDEX.md](./UI_MASTER_INDEX.md)  
> **Previous:** [UI 18 — Loading & Empty States](./UI_18_Loading_Empty_States.md)  
> **Architecture:** [03 — Component Architecture](../03_Component_Architecture.md) · Notification Service

---

## Purpose

Design the platform notification bell and full notification inbox — operational alerts for AgainSoft operators (agent issues, registrations, billing, security, updates). Closes the deferred UI 01 header improvement.

## Scope

Header dropdown preview, read/unread state (local persist), full list page with filters. Push/WebSocket delivery is API phase.

---

## Architecture

```mermaid
flowchart LR
    SVC[Platform services] --> NTF[Notification feed]
    NTF --> BELL[Header bell]
    NTF --> PAGE[/center/notifications]
    BELL -->|mark read| STORE[Local read state]
```

Notifications link to existing Control Center routes — no client business data in bodies.

---

## Header Bell

| Feature | Behavior |
|---------|----------|
| Badge | Violet count of unread (9+ cap) |
| Preview | 6 most recent, unread first |
| Actions | Mark all read, view all |
| Click item | Navigate + mark read |

---

## Notifications Page

1. `CenterPageHeader` + mark all read  
2. Stats — unread, critical unread, total  
3. Toolbar — search, category, severity, unread-only  
4. Card list with severity + category badges  

---

## Mock Data

| Type | Count |
|------|-------|
| `CenterPlatformNotification` | 8 items |

Categories: agent, registration, billing, security, update, system.

Store: `useCenterNotificationStore` — persisted read IDs.

---

## Component Files

```text
components/center/
├── center-notification-center.tsx
└── notifications/
    ├── center-notifications-page.tsx
    ├── center-notifications-toolbar.tsx
    └── center-notifications-list.tsx

lib/store/center-notification-store.ts
app/center/notifications/page.tsx
```

---

## Summary

UI Step 19 adds the platform notification bell to `CenterHeader` and a full inbox at `/center/notifications` — operator alerts with deep links across the Control Center prototype.

**Implemented in code:** mock notifications, zustand read state, header dropdown, list page.
