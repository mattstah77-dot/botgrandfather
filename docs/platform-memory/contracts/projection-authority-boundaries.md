# Projection Authority Boundaries

**Purpose:** Define what projections ARE and MUST NEVER BE  
**Status:** CANONICAL — Tier 1 Contract  
**Version:** 1.0  
**Phase:** PRE-UNIT-04 Stabilization  
**Date:** 2026-05-23

---

## SECTION 1 — PROJECTION IS

### Definition

**Projection** is an observational interpretation of truth for UI consumption.

### Projection IS

| Property | Meaning |
|----------|---------|
| **Observational** | Shows what exists, does not create |
| **Derived** | Computed from truth, not truth itself |
| **Disposable** | Can be discarded and recomputed |
| **Recomputable** | Always recomputed from truth |
| **Actor-Scoped** | Filtered by actor's visibility boundary |
| **Capability-Scoped** | Belongs to a specific capability |

---

## SECTION 2 — PROJECTION IS NOT

### Projection is NOT

| Property | Why Not |
|----------|---------|
| **Authoritative** | Truth is in database, not projection |
| **Executable** | Does not trigger actions |
| **Orchestrative** | Does not coordinate capabilities |
| **Synchronizing** | Does not sync state across capabilities |
| **Lifecycle-Owning** | Does not manage entity lifecycle |
| **State-Owning** | Does not own persistent state |

---

## SECTION 3 — WHAT PROJECTION MAY DO

### Allowed Actions

| Action | Example | Why Safe |
|--------|---------|----------|
| **Summarize** | "5 open tickets" | Aggregation of truth |
| **Aggregate** | "Total bookings: 10" | Count of truth |
| **Correlate** | "Customer has 2 bookings" | Identity link |
| **Visualize** | Calendar grid of bookings | Rendering truth |
| **Expose** | List of available slots | Computed from truth |

### Code Example: Safe Projection

```typescript
// ✅ SAFE: Projection summarizes truth
async getBookingSummary(botId: string): Promise<BookingSummary> {
  const bookings = await this.bookingRepository.find({ where: { botId } });
  
  return {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };
}
```

---

## SECTION 4 — WHAT PROJECTION MUST NEVER DO

### Forbidden Actions

| Action | Example | Why Forbidden |
|--------|---------|---------------|
| **Coordinate runtimes** | Trigger booking from support | Orchestration |
| **Trigger capability actions** | Auto-create ticket from booking | Automation |
| **Mutate operational state** | Update booking from dashboard | State mutation |
| **Synchronize capabilities** | Sync booking status with ticket | State sync |
| **Become business authority** | Cache as truth | Authority corruption |

### Code Example: Forbidden Projection

```typescript
// ❌ FORBIDDEN: Projection triggers action
async getBookingSummary(botId: string): Promise<BookingSummary> {
  const bookings = await this.bookingRepository.find({ where: { botId } });
  
  // ❌ FORBIDDEN: Projection triggers automation
  if (bookings.length > 10) {
    await this.sendOwnerAlert(botId);  // Automation trigger!
  }
  
  return {
    total: bookings.length,
    // ...
  };
}
```

---

## SECTION 5 — PROJECTION AUTHORITY HIERARCHY

### The Hierarchy

```
Level 1: Database Truth (Authoritative)
    ├── bookings table
    ├── tickets table
    └── leads table
    
Level 2: Projection (Advisory)
    ├── booking summaries
    ├── ticket lists
    └── lead metrics
    
Level 3: UI State (Ephemeral)
    ├── client-side cache
    ├── local state
    └── session data
```

### Key Principle

**Higher levels override lower levels. Lower levels are authoritative for their domain.**

Database truth is always authoritative. Projection is advisory. UI state is ephemeral.

---

## SECTION 6 — PROJECTION BOUNDARIES

### Capability Boundary

```typescript
// ✅ SAFE: Booking projection stays in booking
class BookingQueryService {
  async getBookingSummary(botId: string) {
    return this.bookingRepository.find({ where: { botId } });
  }
}

// ✅ SAFE: Support projection stays in support
class SupportQueryService {
  async getTicketSummary(botId: string) {
    return this.ticketRepository.find({ where: { botId } });
  }
}

// ❌ FORBIDDEN: Cross-capability projection
class UniversalProjectionService {
  async getUnifiedSummary(botId: string) {
    // Cross-capability projection with orchestration
    const bookings = await this.bookingQueryService.getSummary(botId);
    const tickets = await this.supportQueryService.getSummary(botId);
    
    // ❌ FORBIDDEN: Projection correlates and triggers
    if (bookings.length > tickets.length) {
      await this.createTicketForEachBooking(botId);  // Orchestration!
    }
    
    return { bookings, tickets };
  }
}
```

---

### Actor Boundary

```typescript
// ✅ SAFE: Customer projection
class BookingQueryService {
  async getCustomerBookings(customerId: string) {
    return this.bookingRepository.find({ where: { customerId } });
  }
}

// ✅ SAFE: Owner projection
class BookingQueryService {
  async getBotBookings(botId: string) {
    return this.bookingRepository.find({ where: { botId } });
  }
}

// ❌ FORBIDDEN: Cross-actor projection
class AdminProjectionService {
  async getAllBookings() {
    // ❌ FORBIDDEN: Cross-tenant projection
    return this.bookingRepository.find();  // No tenant filter!
  }
}
```

---

## SECTION 7 — VALIDATION GATES

### Gate 1: No Projection Authority

```bash
grep -r "projection.*authority\|cache.*truth\|cached.*available" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Projection Orchestration

```bash
grep -r "projection.*trigger\|summary.*action\|metric.*alert" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Projection Synchronization

```bash
grep -r "sync.*projection\|projection.*sync\|unified.*projection" src/
# Expected: no results
```

**Status:** ✅ PASS

---

## SECTION 8 — CANONICAL RULES

### Rule 1: Projections Are Observational

Projections show what exists. They do not create.

### Rule 2: Projections Are Derived

Projections are computed from truth. They are not truth.

### Rule 3: Projections Are Disposable

Projections can be discarded and recomputed.

### Rule 4: Projections Are Actor-Scoped

Projections are filtered by actor's visibility boundary.

### Rule 5: Projections Are Capability-Scoped

Projections belong to a specific capability.

### Rule 6: Projections Never Orchestrate

Projections do not coordinate capabilities.

### Rule 7: Projections Never Trigger Actions

Projections do not trigger automated actions.

### Rule 8: Projections Never Mutate State

Projections do not mutate operational state.

---

**Version 1.0 — PRE-UNIT-04 — 2026-05-23**
