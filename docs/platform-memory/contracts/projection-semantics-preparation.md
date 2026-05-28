# Projection Semantics Preparation

**Purpose:** Define projection ownership, isolation, and non-authority before UNIT 04  
**Status:** DEPRECATED — Superseded by PRE-UNIT-04 stabilization  
**Replacement:** `contracts/projection-lifecycle-semantics.md` + `contracts/projection-ownership-semantics.md`  
**Version:** 1.0-DEPRECATED  
**Date:** 2026-05-23

---

> ⚠️ **DEPRECATION NOTICE**
> This document has been superseded by PRE-UNIT-04 stabilization artifacts:
> - `contracts/projection-lifecycle-semantics.md` — Defines projection lifecycle
> - `contracts/projection-ownership-semantics.md` — Defines projection ownership
> 
> This document is kept for historical trace only. Do NOT consult for semantic truth.

---

## SECTION 1 — PROJECTION OWNERSHIP

### What Is a Projection

**Projection** is an observational interpretation of truth for UI consumption.

### Projection Ownership Rules

| Rule | Meaning |
|------|---------|
| **Capability-owned** | Each capability owns its projections |
| **No cross-capability projections** | No unified projection tables |
| **No shared projection state** | Projections are isolated |
| **No projection authority** | Projections are never authoritative |

---

## SECTION 2 — PROJECTION ISOLATION

### Isolation Boundaries

```
Capability A (Booking)
    │
    ├── Truth: bookings table
    │
    ├── Projection: booking views for UI
    │
    └── Projection isolation: NO sharing

Capability B (Support)
    │
    ├── Truth: tickets table
    │
    ├── Projection: ticket views for UI
    │
    └── Projection isolation: NO sharing

Dashboard (Aggregation)
    │
    ├── Reads: Capability A projection
    ├── Reads: Capability B projection
    └── Aggregates: Observational only
```

### Key Property

**Projections do not synchronize.** Each projection is computed independently per capability.

---

## SECTION 3 — ACTOR-SPECIFIC PROJECTIONS

### Customer Projection

**Purpose:** Show customer's own data.

```typescript
async getCustomerBookings(customerId: string) {
  return this.bookingRepository.find({ where: { customerId } });
}
```

**Boundaries:**
- Only customer's own bookings
- No other customer data
- Read-only

---

### Owner Projection

**Purpose:** Show owner's bot data.

```typescript
async getBotBookings(botId: string) {
  return this.bookingRepository.find({ where: { botId } });
}
```

**Boundaries:**
- Only owner's bot bookings
- No other owner data
- Read-only (for query service)

---

### Operator Projection (Future)

**Purpose:** Show assigned support data.

```typescript
async getAssignedTickets(operatorId: string) {
  return this.ticketRepository.find({ where: { assignedTo: operatorId } });
}
```

**Boundaries:**
- Only assigned tickets
- No unassigned data
- Read-only (for query service)

---

## SECTION 4 — OBSERVATIONAL PROJECTIONS

### What Projections MAY Do

| Action | Example |
|--------|---------|
| **Filter** | Show bookings for specific bot |
| **Sort** | Order bookings by date |
| **Paginate** | Split large lists |
| **Aggregate** | Count bookings by status |
| **Transform** | Format dates for display |
| **Join** | Include customer name in booking |

### What Projections MUST NOT Do

| Action | Why Forbidden |
|--------|--------------|
| **Mutate truth** | Projections are read-only |
| **Synchronize** | Projections don't sync across capabilities |
| **Orchestrate** | Projections don't trigger actions |
| **Automate** | Projections don't trigger workflows |
| **Coordinate** | Projections don't coordinate capabilities |

---

## SECTION 5 — FRESHNESS BOUNDARIES

### Freshness Requirements

| Projection | Freshness | Reason |
|------------|-----------|--------|
| Customer booking list | Eventual | UX only |
| Owner booking list | Eventual | Observational |
| Booking detail | Strict | User action |
| Support ticket list | Eventual | UX only |
| Ticket detail | Strict | User action |
| Dashboard metrics | Eventual | Analytics |

### Write-Time Validation

```typescript
async createBooking(bookingData: CreateBookingDto) {
  // Re-check availability at write time
  const isAvailable = await this.isSlotAvailable(
    bookingData.botId,
    bookingData.date,
    bookingData.timeSlot
  );
  
  if (!isAvailable) throw new Error('Slot no longer available');
  
  // Create booking
  const booking = this.bookingRepository.create(bookingData);
  await this.bookingRepository.save(booking);
}
```

**Key Property:** Even if projection is stale, write-time validation ensures correctness.

---

## SECTION 6 — PROJECTION COMPOSABILITY

### Safe Composition

```typescript
async getCustomerProfile(customerId: string) {
  // ✅ SAFE: Compose read-only projections
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
    this.leadFunnelQueryService.getCustomerLeads(customerId),
  ]);
  
  return { bookings, tickets, leads };  // Observational aggregation
}
```

**Why Safe:**
- Read-only projections
- No state mutation
- Pure aggregation

---

### Forbidden Composition

```typescript
async getCustomerProfile(customerId: string) {
  const [bookings, tickets] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
  ]);
  
  // ❌ FORBIDDEN: Cross-capability orchestration
  const openTickets = tickets.filter(t => t.status === 'open');
  if (openTickets.length > 0) {
    // Auto-cancel bookings
    for (const booking of bookings) {
      if (booking.status === 'pending') {
        await this.cancelBooking(booking.id);  // Cross-capability mutation
      }
    }
  }
  
  return { bookings, tickets };
}
```

**Why Forbidden:**
- Orchestrates across capabilities
- Mutates state based on projection
- Encodes workflow logic

---

## SECTION 7 — PROJECTION NON-AUTHORITY

### Core Principle

**Projections are NEVER authoritative.** Truth is always in database.

### Authority Hierarchy

```
1. Database Truth (Authoritative)
    ├── bookings table
    ├── tickets table
    └── leads table
    
2. Projections (Advisory Only)
    ├── booking views
    ├── ticket views
    └── lead views
    
3. UI State (Ephemeral)
    ├── client-side cache
    ├── local state
    └── session data
```

### Validation

```typescript
// ❌ WRONG: Using projection as authority
async confirmBooking(bookingId: string) {
  const booking = await this.bookingViewRepository.findById(bookingId);  // Projection
  
  if (booking.status === 'pending') {  // Projection state
    booking.status = 'confirmed';
    await this.bookingViewRepository.save(booking);  // WRONG!
  }
}

// ✅ CORRECT: Using truth as authority
async confirmBooking(bookingId: string) {
  const booking = await this.bookingRepository.findById(bookingId);  // Truth
  
  if (booking.status === 'pending') {  // Truth state
    booking.status = 'confirmed';
    await this.bookingRepository.save(booking);  // Correct
  }
}
```

---

## SECTION 8 — CANONICAL RULES

### Rule 1: Projections Are Capability-Owned

Each capability owns its projections. No shared projection tables.

### Rule 2: Projections Are Isolated

Projections do not synchronize across capabilities.

### Rule 3: Actor-Specific Projections

Projections are filtered by actor (customer, owner, operator).

### Rule 4: Projections Are Observational

Projections expose data for observation, not execution.

### Rule 5: Freshness Tolerances

Read projections tolerate eventual freshness. Write operations require strict freshness.

### Rule 6: Write-Time Validation

All mutations re-check truth at write time.

### Rule 7: Safe Composition

Aggregating read-only projections is safe. Orchestrating across projections is forbidden.

### Rule 8: Projections Are Non-Authoritative

Database is always authoritative. Projections are advisory only.

---

**Version 1.0 — 2026-05-23**
