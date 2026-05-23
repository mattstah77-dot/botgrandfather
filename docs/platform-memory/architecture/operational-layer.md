# Operational Layer

**Purpose:** Describe operational layer architecture  
**Status:** CANONICAL — Tier 4 Description  
**Version:** 1.0

---

## DEFINITION

Operational layer provides owner-facing dashboards, analytics views, and settings management.

**May read from runtime data, but never mutates runtime state directly.**

---

## COMPONENTS

### Mini App Module

- Owner dashboard APIs.
- Bot management endpoints.
- Analytics aggregation.
- Settings management.

### Ownership Module

- `BotOwnershipGuard`: Verifies bot ownership.
- Cross-cutting concern used by both runtime and operational.

### Owner Modules Registry

- `OwnerModuleRegistry`: Metadata registry for templates.
- Navigation composition.
- Settings schema registry.

### Dashboard Module

- `DashboardService`: Aggregates metrics.
- `DashboardCapabilityRegistry`: Capability provider registry.
- Template-agnostic metric aggregation.

---

## DATA FLOW

```
Owner Request
  → MiniAppAuthGuard (authentication)
  → BotOwnershipGuard (authorization)
    → DashboardService
      → DashboardCapabilityRegistry
        → Capability Providers (LeadFunnelQueryService, BookingQueryService)
          → Database (read-only)
    → NavigationService
      → OwnerModuleRegistry
        → Metadata composition
```

---

## INVARIANTS ENFORCED

- Operational NEVER processes webhooks.
- Operational NEVER executes template logic.
- All endpoints verify ownership.
- All queries scoped by ownerId.
- Dashboard metrics are capability-neutral.

---

**Version 1.0 — 2026-05-23**
