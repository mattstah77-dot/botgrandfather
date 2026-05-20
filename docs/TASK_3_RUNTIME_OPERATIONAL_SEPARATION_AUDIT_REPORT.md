# RUNTIME / OPERATIONAL SEPARATION AUDIT REPORT

**TASK:** 3 — Runtime / Operational Separation Audit  
**Date:** 2026-05-19  
**Status:** ✅ COMPLETE

---

## 1. Current Runtime Architecture Map

### Runtime Layer Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **WebhookService** | `src/webhook/webhook.service.ts` | Receives Telegram updates, routes to template |
| **TemplateFactory** | `src/templates/template.factory.ts` | Registry of template handlers |
| **Template Handlers** | `src/templates/*/handler.ts` | Process Telegram context |
| **Template Services** | `src/templates/*/service.ts` | Business logic for each template |
| **UserState** | `src/bot/entities/user-state.entity.ts` | Runtime conversation state |

### Runtime Data Flow

```
Telegram Update
    ↓
WebhookController (/webhook/:botId/:secret)
    ↓
WebhookService.processUpdate()
    ↓
TemplateFactory.handleUpdate()
    ↓
TemplateHandler.handle(context)
    ↓
TemplateService (booking-runtime, lead-funnel, etc.)
    ↓
TelegramService.sendMessage() / answerCallbackQuery()
```

### Runtime Characteristics

- **Stateless**: Each update processed independently
- **Template-driven**: Different handlers per template
- **Event-sourced**: UserState tracks conversation
- **No MiniApp dependencies**: Does NOT import miniapp module

---

## 2. Current Operational Architecture Map

### Operational Layer Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **MiniappModule** | `src/miniapp/miniapp.module.ts` | Owner dashboard API |
| **DashboardService** | `src/miniapp/services/dashboard.service.ts` | Data aggregation |
| **NavigationService** | `src/miniapp/services/navigation.service.ts` | Dynamic navigation |
| **OwnerModuleRegistry** | `src/owner-modules/owner-module.registry.ts` | Metadata-driven UI |
| **Owner Dashboard Controllers** | `src/miniapp/controllers/*` | REST API endpoints |
| **BookingQueryService** | `src/templates/booking/booking-query.service.ts` | Read-only booking queries |
| **LeadFunnelQueryService** | `src/templates/lead-funnel/lead-funnel-query.service.ts` | Read-only lead queries |

### Operational Data Flow

```
Telegram WebApp
    ↓
MiniAppAuthGuard (validates initData)
    ↓
Dashboard Controller (/miniapp/*)
    ↓
DashboardService (aggregates data)
    ↓
Query Services (BookingQueryService, LeadFunnelQueryService)
    ↓
JSON Response
```

### Operational Characteristics

- **Query-oriented**: DashboardService only reads data
- **Metadata-driven**: Uses OwnerModuleRegistry for UI
- **Template-agnostic core**: BotService, CustomerService are universal
- **Template-specific queries**: BookingQueryService, LeadFunnelQueryService

---

## 3. Dependency Analysis

### Runtime Dependencies (What Runtime Imports)

```
WebhookService
├── TemplateFactory
│   ├── Template1Service, Template2Service, Template3Service
│   ├── LeadFunnelService
│   └── BookingRuntimeService
├── BotService (verifyWebhook, isUpdateProcessed, markUpdateAsProcessed)
└── TelegramService
```

**Runtime does NOT import:**
- ❌ MiniappModule
- ❌ DashboardService
- ❌ OwnerModuleRegistry
- ❌ Any React/UI components

### Operational Dependencies (What Operational Imports)

```
MiniappModule
├── BotModule (BotService)
├── OwnerModule (OwnerService)
├── CustomerModule (CustomerService)
├── AnalyticsModule
├── OwnershipModule
└── TemplateModule exports:
    ├── BookingQueryService ✅ (query-only)
    └── LeadFunnelQueryService ✅ (query-only)
```

**Operational does NOT import:**
- ❌ BookingRuntimeService (NOT exported from TemplateModule)
- ❌ WebhookService
- ❌ Template handlers
- ❌ Any runtime conversation logic

---

## 4. Invariant Verification

### ✅ Invariant 1: Runtime MUST NOT depend on Mini App layer

**Verification:**
```typescript
// src/webhook/webhook.service.ts
import { TemplateFactory } from '../templates/template.factory';
import { BotService } from '../bot/bot.service';
// NO imports from miniapp

// src/templates/*/service.ts
// NO imports from miniapp
```

**Result:** ✅ PASS — Runtime is fully isolated from Mini App.

---

### ✅ Invariant 2: Operational layer MUST NOT contain runtime orchestration

**Verification:**
```typescript
// src/miniapp/services/dashboard.service.ts
// Only reads data:
await this.botService.getOwnerBots(ownerId);
await this.customerService.countByStatusForBots(botIds);
await this.bookingQueryService.countBookingsByBotIds(botIds);
// NO runtime state mutations
// NO webhook logic
// NO callback handling
```

**Result:** ✅ PASS — DashboardService is read-only aggregation.

---

### ✅ Invariant 3: Templates remain runtime-oriented

**Verification:**
```typescript
// src/templates/booking/booking-runtime.service.ts
// Handles conversation flow:
// - handleStart() → sends welcome with CTA
// - handleCallback() → processes button clicks
// NO UI rendering
// NO dashboard knowledge

// src/templates/lead-funnel/lead-funnel.service.ts
// Handles conversation flow
// NO React/UI imports
```

**Result:** ✅ PASS — Templates handle conversation, not UI.

---

### ✅ Invariant 4: Operational layer is metadata-driven

**Verification:**
```typescript
// src/owner-modules/owner-module.registry.ts
// Dynamic registry loaded at startup:
registerOwnerModule({
  template: 'booking',
  displayName: 'Booking',
  navigation: [...],
  widgets: [...],
});

// src/miniapp/services/navigation.service.ts
const modules = getAllOwnerModules();
// Renders UI dynamically from metadata
```

**Result:** ✅ PASS — OwnerModuleRegistry drives UI dynamically.

---

### ✅ Invariant 5: Booking capability is NOT coupled to booking template

**Verification:**
```typescript
// TemplateModule exports (src/templates/template.module.ts)
exports: [TemplateFactory, LeadFunnelQueryService, BookingQueryService]
// ❌ BookingRuntimeService is NOT exported

// MiniappModule imports TemplateModule and uses:
private readonly bookingQueryService: BookingQueryService
// This is READ-ONLY query service

// CustomerMiniappModule imports BookingModule:
import { BookingModule } from '../templates/booking/booking.module';
// But uses CustomerBookingService (separate), NOT BookingRuntimeService
```

**Result:** ✅ PASS — BookingRuntimeService is internal to template layer, not exposed to operational or customer layers.

---

## 5. Coupling Analysis

### Runtime → Operational Coupling

| Coupling Type | Status | Details |
|---------------|--------|---------|
| Runtime → Miniapp | ✅ NONE | WebhookService does not import miniapp |
| Runtime → Dashboard | ✅ NONE | No dashboard knowledge in templates |
| Runtime → OwnerModules | ✅ NONE | No registry imports in templates |

### Operational → Runtime Coupling

| Coupling Type | Status | Details |
|---------------|--------|---------|
| Miniapp → Runtime Services | ✅ NONE | Uses only query services |
| Miniapp → BookingRuntime | ✅ NONE | BookingRuntimeService not exported |
| Miniapp → Webhook | ✅ NONE | No webhook logic in dashboard |

### Customer → Runtime Coupling

| Coupling Type | Status | Details |
|---------------|--------|---------|
| CustomerMiniapp → Runtime | ✅ NONE | Uses CustomerBookingService (HTTP) |
| CustomerMiniapp → BookingRuntime | ✅ NONE | Separate service |
| CustomerMiniapp → Miniapp | ✅ NONE | Fully isolated module |

---

## 6. Architectural Strengths

| Strength | Description |
|----------|-------------|
| **Clean separation** | Runtime and operational are completely separate modules |
| **Query services** | TemplateModule exports read-only query services for operational |
| **Metadata-driven UI** | OwnerModuleRegistry enables dynamic owner dashboard |
| **Isolated customer layer** | CustomerMiniappModule has no owner dependencies |
| **No circular dependencies** | Verified: no cycles between runtime/operational |
| **Template-agnostic core** | BotService, CustomerService are universal |

---

## 7. Architectural Weaknesses

| Weakness | Severity | Description |
|----------|----------|-------------|
| Owner APIs at /miniapp/* | Low | Mixed namespace (not yet /api/owner/*) |
| BookingQueryService in TemplateModule | Low | Exports template-specific queries to operational |
| No runtime health check | Low | Cannot monitor runtime independently |

---

## 8. Violated Invariants

**NONE** — All 5 invariants verified and passing.

---

## 9. Required Refactors BEFORE Booking Engine

### No Critical Refactors Required

The current architecture is ready for Booking Engine development because:

1. ✅ Runtime is isolated — BookingRuntimeService stays in template layer
2. ✅ Query services available — BookingQueryService already exported
3. ✅ Customer layer isolated — CustomerBookingService separate from runtime
4. ✅ Metadata-driven UI — OwnerModuleRegistry supports booking owner UI
5. ✅ No coupling — operational doesn't depend on runtime internals

### Recommended Future Improvements (Not Blocking)

| Improvement | Priority | Notes |
|-------------|----------|-------|
| Move owner APIs to /api/owner/* | Low | Namespace consistency |
| Add runtime health endpoint | Low | Monitoring |
| Extract BookingQueryService to separate module | Low | Cleaner boundaries |

---

## 10. Risks If Ignored

**NONE** — Current architecture supports Booking Engine without changes.

---

## 11. Summary

| Metric | Status |
|--------|--------|
| Runtime isolation from MiniApp | ✅ PASS |
| Operational read-only pattern | ✅ PASS |
| Template runtime-only | ✅ PASS |
| Metadata-driven UI | ✅ PASS |
| Booking capability separation | ✅ PASS |
| No circular dependencies | ✅ PASS |
| Customer layer isolation | ✅ PASS |

---

## 12. Conclusion

**The runtime and operational layers are properly separated.**

The architecture is ready for Booking Engine development without any refactoring.

Key architectural guarantees:
- BookingRuntimeService remains internal to template layer
- BookingQueryService provides read-only access for operational
- CustomerMiniappModule is fully isolated from owner operational
- OwnerModuleRegistry enables dynamic booking owner UI

---

**Audit Complete.** Awaiting approval for next task.

---

## Appendix: Dependency Graph

```
Runtime Layer
├── WebhookModule
│   ├── WebhookService
│   │   ├── TemplateFactory
│   │   │   ├── Template1Handler + Service
│   │   │   ├── Template2Handler + Service
│   │   │   ├── Template3Handler + Service
│   │   │   ├── LeadFunnelHandler + Service
│   │   │   └── BookingHandler + BookingRuntimeService ❌ NOT EXPORTED
│   │   └── TelegramService
│   └── BotService (verifyWebhook only)
│
Operational Layer
├── MiniappModule
│   ├── DashboardService → uses BookingQueryService (READ-ONLY)
│   ├── NavigationService → uses OwnerModuleRegistry
│   └── Controllers → /miniapp/*
│
├── OwnerModulesModule
│   └── OwnerModuleRegistry (metadata)
│
└── CustomerMiniappModule (ISOLATED)
    └── CustomerBookingService → uses BookingQueryService (READ-ONLY)
```
