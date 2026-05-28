# Projection Isolation Rules

**Purpose:** Define projection, capability, runtime, and operational isolation  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## ISOLATION LAYERS

### Layer 1 — Projection Isolation

**Rule:** Projections are isolated per request.

```
Request A: Compute slots for 2026-06-01
    │
    ├── Query DB
    ├── Compute projection
    ├── Return to client
    └── Discard
    
Request B: Compute slots for 2026-06-01
    │
    ├── Query DB (fresh)
    ├── Compute projection (fresh)
    ├── Return to client
    └── Discard
    
NO SHARED STATE between A and B
```

**Enforcement:**
- No projection persistence
- No projection cache
- No projection sharing
- Each request starts fresh

---

### Layer 2 — Capability Isolation

**Rule:** Capabilities do not share projection logic.

```
Booking Capability
    │
    ├── BookingQueryService (booking projections)
    ├── BookingRuntimeService (booking mutations)
    └── Booking projections ONLY

Support Capability
    │
    ├── SupportQueryService (support projections)
    ├── SupportRuntimeService (support mutations)
    └── Support projections ONLY

NO SHARED PROJECTION CODE
```

**Enforcement:**
- No cross-capability imports
- No shared projection services
- No shared query logic
- Each capability owns its projections

---

### Layer 3 — Runtime Isolation

**Rule:** Runtime services do not access operational projections.

```
Runtime Layer (Webhook Processing)
    │
    ├── Template handlers
    ├── Customer service
    └── Booking runtime
    │
    └── NO access to dashboard projections
    └── NO access to operational views

Operational Layer (Dashboard)
    │
    ├── Query services
    ├── Dashboard controllers
    └── Operational views
    │
    └── MAY read runtime data
    └── MUST NOT mutate runtime state
```

**Enforcement:**
- Runtime/operational separation invariant
- Runtime never imports operational
- Operational may read runtime data

---

### Layer 4 — Operational Isolation

**Rule:** Operational surfaces do not coordinate capabilities.

```
Dashboard
    │
    ├── Reads Booking metrics
    ├── Reads Support metrics
    ├── Reads Lead metrics
    │
    └── AGGREGATES only
    └── NEVER coordinates
    └── NEVER orchestrates
```

**Enforcement:**
- No cross-capability mutations
- No automation triggers
- No workflow orchestration
- Read-only aggregation only

---

## FORBIDDEN ISOLATION VIOLATIONS

### Violation 1: Cross-Capability Lifecycle Coordination

```typescript
// ❌ FORBIDDEN
class UnifiedLifecycleService {
  async processCustomer(customerId: string) {
    const bookings = await this.bookingQueryService.getBookings(customerId);
    const tickets = await this.supportQueryService.getTickets(customerId);
    
    if (bookings.length > 0 && tickets.length === 0) {
      await this.createFollowUpTicket(customerId);  // Cross-capability!
    }
  }
}
```

---

### Violation 2: Projection Synchronization

```typescript
// ❌ FORBIDDEN
class ProjectionSyncService {
  async syncSlots(botId: string) {
    const slots = await this.computeSlots(botId);
    await this.redis.set(`slots:${botId}`, JSON.stringify(slots));
    await this.cache.set(`slots:${botId}`, slots);
  }
}
```

---

### Violation 3: Reactive Orchestration

```typescript
// ❌ FORBIDDEN
class ReactiveProjectionService {
  @OnEvent('booking.created')
  async onBookingCreated(event: BookingCreated) {
    await this.updateDashboard(event.botId);
    await this.updateAnalytics(event.customerId);
    await this.notifyOwner(event.botId);
  }
}
```

---

### Violation 4: Projection-Triggered Execution

```typescript
// ❌ FORBIDDEN
class SmartProjectionService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    if (tickets.length > 10) {
      await this.escalationService.escalate(botId);  // Triggered by projection!
    }
    
    return { openTickets: tickets.length };
  }
}
```

---

## CANONICAL RULES

### Rule 1: Projections Are Request-Isolated

Each request computes its own projections. No sharing.

### Rule 2: Capabilities Are Code-Isolated

No cross-capability imports or shared projection logic.

### Rule 3: Runtime Is Separated

Runtime never accesses operational projections.

### Rule 4: Operational Is Read-Only

Operational surfaces aggregate, never coordinate.

### Rule 5: No Lifecycle Coordination

No cross-capability lifecycle management.

### Rule 6: No Projection Synchronization

Projections are never synced across systems.

### Rule 7: No Reactive Orchestration

Projections do not trigger events or actions.

### Rule 8: No Projection-Triggered Execution

Projections do not cause mutations.

---

**Version 1.0 — UNIT 04 — 2026-05-23**
