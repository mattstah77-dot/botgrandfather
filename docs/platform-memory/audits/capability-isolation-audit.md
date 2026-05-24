# Capability Isolation Audit

**Purpose:** Deep audit of capability isolation across 3 implemented capabilities  
**Status:** AUDIT COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## AUDIT METHODOLOGY

For each isolation boundary, verify:
1. **Code Inspection:** Search for cross-template imports
2. **Dependency Analysis:** Check module imports
3. **Entity Review:** Verify no shared entities
4. **Runtime Review:** Verify no cross-template service calls

---

## CAPABILITY INVENTORY

| Capability | Runtime Service | Query Service | Handler | Module |
|------------|----------------|---------------|---------|--------|
| lead-funnel | `LeadFunnelService` | `LeadFunnelQueryService` | `LeadFunnelHandler` | `LeadFunnelModule` |
| booking | `BookingRuntimeService` | `BookingQueryService` | `BookingHandler` | `BookingModule` |
| support | `SupportRuntimeService` | `SupportQueryService` | `SupportHandler` | `SupportModule` |

---

## ISOLATION BOUNDARY 1 — NO CROSS-TEMPLATE IMPORTS

### Audit Method

Search for imports between template directories:
- `src/templates/lead-funnel/` importing from `src/templates/booking/`
- `src/templates/booking/` importing from `src/templates/support/`
- `src/templates/support/` importing from `src/templates/lead-funnel/`

### Results

**Lead Funnel → Booking:**
- ❌ NO imports found

**Lead Funnel → Support:**
- ❌ NO imports found

**Booking → Lead Funnel:**
- ❌ NO imports found

**Booking → Support:**
- ❌ NO imports found

**Support → Lead Funnel:**
- ❌ NO imports found

**Support → Booking:**
- ❌ NO imports found

### Verdict: ✅ PASS

---

## ISOLATION BOUNDARY 2 — NO SHARED ENTITIES

### Audit Method

Compare entities across capabilities:

| Capability | Entities | Shared? |
|------------|----------|---------|
| lead-funnel | `Lead` | No |
| booking | `Booking` | No |
| support | `Ticket`, `TicketMessage` | No |

### Results

- `Lead` entity: Only in `src/bot/entities/lead.entity.ts`
- `Booking` entity: Only in `src/templates/booking/entities/booking.entity.ts`
- `Ticket` entity: Only in `src/templates/support/entities/ticket.entity.ts`
- `TicketMessage` entity: Only in `src/templates/support/entities/ticket-message.entity.ts`

**NO shared entities between capabilities.**

### Verdict: ✅ PASS

---

## ISOLATION BOUNDARY 3 — NO SHARED RUNTIME SERVICES

### Audit Method

Verify each runtime service has no dependency on other template runtime services.

### Results

**LeadFunnelService dependencies:**
- `TelegramService` (platform)
- `CustomerService` (platform)
- `AnalyticsService` (platform)
- `LeadRepository` (own entity)
- ❌ NO `BookingRuntimeService`
- ❌ NO `SupportRuntimeService`

**BookingRuntimeService dependencies:**
- `TelegramService` (platform)
- `CustomerService` (platform)
- `AnalyticsService` (platform)
- `BookingQueryService` (own query)
- `BookingRepository` (own entity)
- `UserStateRepository` (platform)
- ❌ NO `LeadFunnelService`
- ❌ NO `SupportRuntimeService`

**SupportRuntimeService dependencies:**
- `TelegramService` (platform)
- `CustomerService` (platform)
- `AnalyticsService` (platform)
- `TicketRepository` (own entity)
- `TicketMessageRepository` (own entity)
- ❌ NO `LeadFunnelService`
- ❌ NO `BookingRuntimeService`

### Verdict: ✅ PASS

---

## ISOLATION BOUNDARY 4 — NO SHARED STATE TRANSITIONS

### Audit Method

Verify each capability has independent lifecycle logic.

### Results

**Lead Funnel Lifecycle:**
- States: Implicit (funnel steps)
- Transitions: Funnel flow logic
- ❌ NO references to booking or ticket states

**Booking Lifecycle:**
- States: `pending → confirmed → cancelled/completed/no-show`
- Transitions: `confirmBooking()`, `cancelBooking()`, `completeBooking()`, `markNoShow()`
- ❌ NO references to ticket or lead states

**Support Desk Lifecycle:**
- States: `open → in-progress → resolved → closed`
- Transitions: `takeTicket()`, `resolveTicket()`, `closeTicket()`, `reopenTicketOwner()`
- ❌ NO references to booking or lead states

### Verdict: ✅ PASS

---

## ISOLATION BOUNDARY 5 — NO SHARED LIFECYCLE ABSTRACTIONS

### Audit Method

Verify NO base classes, interfaces, or shared abstractions for lifecycle.

### Results

- ❌ NO `BaseLifecycleService`
- ❌ NO `ILifecycleController`
- ❌ NO `StateMachine`
- ❌ NO `AbstractTemplateRuntime`
- ❌ NO `UniversalTransitionHandler`

Each capability has:
- Independent lifecycle methods
- Independent state definitions
- Independent transition logic

### Verdict: ✅ PASS

---

## ISOLATION BOUNDARY 6 — NO OPERATIONAL SHELL LOGIC DEPENDENCIES

### Audit Method

Verify templates do not depend on operational layer.

### Results

**Template imports checked:**
- ❌ NO `import { DashboardService } from '../../miniapp/...'`
- ❌ NO `import { NavigationService } from '../../miniapp/...'`
- ❌ NO `import { OwnerViewService } from '../../miniapp/...'`

**Templates import ONLY:**
- Platform services (Telegram, Customer, Analytics)
- Their own entities and repositories
- Universal types

### Verdict: ✅ PASS

---

## DRIFT RISK ANALYSIS

### Risk 1: Universal Ticket Abstraction (MEDIUM)

**Trigger:** "Booking is a ticket. Lead is a ticket. Support is a ticket."

**Current State:** Each capability has its own entity.
- `Booking` — booking-specific
- `Lead` — lead-specific
- `Ticket` — support-specific

**Danger:** If a 4th capability needs "something like a ticket," temptation to extract `BaseTicketEntity`.

**Mitigation:** Documented in `anti-patterns/metadata-creep.md`.

**Prevention:** Each new capability gets its own entity, even if structurally similar.

### Risk 2: Scheduling Abstraction Leak (LOW)

**Trigger:** "Support desk needs SLA tracking with deadlines."

**Current State:** No SLA tracking in support desk.

**Danger:** SLA deadlines are scheduling semantics. If added to support desk, might tempt universal scheduling service.

**Mitigation:** `support-desk-semantics.md` explicitly forbids SLA engine.

**Prevention:** Response time tracking stays in query layer, never becomes engine.

### Risk 3: Workflow Temptation (HIGH)

**Trigger:** "When booking is confirmed, customer might need support."

**Current State:** Capabilities are completely independent.

**Danger:** Cross-capability user journeys tempt workflow engines.

**Mitigation:** `ecosystem-boundaries.md` forbids capability orchestration.

**Prevention:** Any cross-capability flow is manual owner action, never automatic.

### Risk 4: Assignment Abstraction (MEDIUM)

**Trigger:** "Booking has assignee (owner). Support has assignee (agent)."

**Current State:** Each capability handles assignment independently.

**Danger:** Temptation to extract `AssignmentService` for both.

**Mitigation:** Manual assignment only. No algorithm.

**Prevention:** Each template has explicit assignment logic.

### Risk 5: Capability Orchestration (HIGH)

**Trigger:** "Owner wants lead → booking → support flow."

**Current State:** No capability calls another.

**Danger:** Building "customer journey" that chains capabilities.

**Mitigation:** `multi-capability-visibility.md` forbids execution chains.

**Prevention:** Customer journey is operational visibility, not runtime orchestration.

---

## SAFE PATTERNS

### Pattern 1: Parallel Independent Queries

```typescript
const [bookings, tickets] = await Promise.all([
  bookingQueryService.getCustomerBookings(id),
  supportQueryService.getCustomerTickets(id),
]);
```

### Pattern 2: Capability-Neutral Aggregation

```typescript
let total = 0;
for (const provider of registry.getAll()) {
  total += (await provider.getBotMetrics(botId)).total;
}
```

### Pattern 3: Independent Lifecycle Methods

```typescript
// Booking: explicit methods
bookingRuntimeService.confirmBooking();
bookingRuntimeService.cancelBooking();

// Support: explicit methods
supportRuntimeService.resolveTicket();
supportRuntimeService.closeTicket();
```

---

## FORBIDDEN PATTERNS

### Pattern 1: Cross-Capability Service Calls

```typescript
// ❌ FORBIDDEN
class BookingRuntimeService {
  async confirmBooking() {
    await this.supportService.createTicket(customerId, 'Follow-up');
  }
}
```

### Pattern 2: Shared Entity Inheritance

```typescript
// ❌ FORBIDDEN
abstract class BaseTicket {
  id: string;
  status: string;
}

class Booking extends BaseTicket { ... }
class Ticket extends BaseTicket { ... }
```

### Pattern 3: Universal Lifecycle Manager

```typescript
// ❌ FORBIDDEN
class LifecycleManager {
  async transition(entity: BaseTicket, toStatus: string) {
    // Universal transition logic
  }
}
```

### Pattern 4: Capability Dependency Graph

```typescript
// ❌ FORBIDDEN
const CAPABILITY_DEPENDENCIES = {
  'lead-funnel': ['booking'],
  'booking': ['support'],
};
```

---

## FUTURE DANGER AREAS

| Danger Area | Risk Level | Trigger | Prevention |
|-------------|-----------|---------|------------|
| Universal ticket abstraction | MEDIUM | 4th capability with "ticket-like" entity | Each capability gets own entity |
| Workflow engine | HIGH | Cross-capability user journeys | Manual actions only |
| Event-driven runtime | HIGH | "When X happens, do Y in other capability" | Events are observational only |
| Scheduling leak | MEDIUM | SLA/deadline in support desk | Query-layer only |
| Assignment framework | LOW | Multiple capabilities need assignment | Manual assignment |
| Capability marketplace | MEDIUM | External templates need integration | SDK first, 5+ internal templates |

---

## SUMMARY

| Isolation Boundary | Status |
|-------------------|--------|
| No cross-template imports | ✅ PASS |
| No shared entities | ✅ PASS |
| No shared runtime services | ✅ PASS |
| No shared state transitions | ✅ PASS |
| No shared lifecycle abstractions | ✅ PASS |
| No operational shell dependencies | ✅ PASS |

**OVERALL VERDICT:** ✅ **ALL ISOLATION BOUNDARIES INTACT**

**Drift Risks:** 6 identified, all mitigated by existing invariants.

**Future Danger:** Workflow engines and event-driven runtime are highest risks.

---

**Version 1.0 — 2026-05-23**
