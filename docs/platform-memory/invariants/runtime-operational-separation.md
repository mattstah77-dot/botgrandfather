# Runtime / Operational Separation

**Purpose:** Define the absolute boundary between runtime and operational layers  
**Status:** CANONICAL — Tier 1 Invariant  
**Version:** 1.0

---

## THE LAW

> **Runtime NEVER imports Operational.**
> **Operational MAY read from Runtime.**

This is the foundational architectural law of BotGrandFather.

---

## RUNTIME LAYER

### Definition

The runtime layer processes Telegram webhooks, executes template business logic, and manages customer lifecycle.

### Components

- `src/webhook/` — Webhook reception and dispatch
- `src/templates/` — Template business logic
- `src/customer/` — Universal customer lifecycle
- `src/analytics/` — Event tracking
- `src/bot/` — Bot entity management
- `src/telegram/` — Telegram API interaction

### Responsibilities

- Receive and validate Telegram webhooks.
- Dispatch updates to template handlers.
- Execute template business logic.
- Manage customer state (find/create, status updates).
- Track analytics events.
- Ensure idempotency.
- Handle transactions.

### What Runtime MUST NOT Do

- Import `miniapp/` or `ownership/` modules.
- Access dashboard data or operational views.
- Execute operational queries.
- Render operational UI.
- Know about owner dashboard.

### What Runtime MUST NOT Import

```typescript
// FORBIDDEN in runtime layer
import { DashboardService } from '../miniapp/services/dashboard.service';
import { OwnerViewService } from '../miniapp/services/owner-view.service';
import { NavigationService } from '../miniapp/services/navigation.service';
import { MiniAppAuthGuard } from '../miniapp/auth/miniapp-auth.guard';
```

---

## OPERATIONAL LAYER

### Definition

The operational layer provides owner-facing dashboards, analytics views, and settings management.

### Components

- `src/miniapp/` — Owner dashboard APIs
- `src/owner-modules/` — Metadata registry
- `src/ownership/` — Ownership verification
- `src/lifecycle/` — Data cleanup jobs

### Responsibilities

- Serve owner dashboard data.
- Compose navigation from metadata.
- Render widgets from capability contracts.
- Verify ownership.
- Aggregate analytics.
- Manage data lifecycle.

### What Operational MUST NOT Do

- Process webhooks.
- Execute template business logic.
- Modify customer state directly (use runtime services).
- Access template-specific repositories directly.
- Modify bot state without going through runtime.

### What Operational MAY Do

- Read from Customer entity (via `CustomerService`).
- Read from AnalyticsEvent entity (via `AnalyticsService`).
- Read from Bot entity (via `BotService`).
- Compose views from metadata.
- Verify ownership.

---

## BOUNDARY ENFORCEMENT

### Module-Level Enforcement

```
RuntimeModule
├── WebhookModule
├── TemplateModule
├── CustomerModule
├── AnalyticsModule
└── BotModule
    (NO imports from MiniappModule)

MiniappModule
├── DashboardService
├── NavigationService
├── OwnerViewService
└── Controllers
    (imports from CustomerModule, BotModule for READS)
```

### Code-Level Enforcement

**Runtime services have ZERO imports from `miniapp/` or `ownership/`:**

```typescript
// src/webhook/webhook.service.ts
import { TemplateFactory } from '../templates/template.factory';
import { BotService } from '../bot/bot.service';
// NO imports from miniapp/

// src/templates/lead-funnel/lead-funnel.service.ts
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';
// NO imports from miniapp/
```

### Exception: Ownership Verification

`BotOwnershipGuard` lives in `src/ownership/` but is used by BOTH runtime controllers (BotController) and operational controllers (OwnerDashboardController).

This is NOT a violation. Ownership verification is a cross-cutting concern, not operational logic.

---

## VIOLATION CONSEQUENCES

### If Runtime Imports Operational

- Webhook processing depends on dashboard logic.
- Template execution depends on operational state.
- Runtime becomes fragile to operational changes.
- Platform loses stability.

### If Operational Modifies Runtime State

- Dashboard triggers business logic.
- Operational layer becomes runtime orchestrator.
- Separation boundary breaks.
- Architecture degrades into spaghetti.

---

## INVARIANTS

> **Invariant ROS.1:** Runtime NEVER imports Operational.

> **Invariant ROS.2:** Operational MAY read from Runtime data, but MUST NOT mutate Runtime state directly.

> **Invariant ROS.3:** Template services (runtime) have ZERO imports from miniapp/ or ownership/.

> **Invariant ROS.4:** Operational services (miniapp/) do NOT process webhooks or execute template logic.

> **Invariant ROS.5:** Cross-cutting concerns (ownership verification) are exceptions, not violations.

---

**Version 1.0 — 2026-05-23**
