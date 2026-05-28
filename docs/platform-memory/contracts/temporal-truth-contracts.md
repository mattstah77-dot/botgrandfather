# Temporal Truth Contracts

**Purpose:** Define canonical temporal truth for BotGrandFather Booking  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 01 — Temporal Source of Truth  
**Date:** 2026-05-23

---

## SECTION 1 — CANONICAL TRUTH DEFINITION

### What IS Truth

Truth in the Booking capability is:

| Entity | Role | Storage |
|--------|------|---------|
| **ProviderAvailability** | Defines when provider is available to work | Database (`provider_availability` table) |
| **Booking** | Records a customer reservation at a specific time | Database (`bookings` table) |
| **Exclusions** | Dates/times provider is explicitly unavailable | Database (`provider_availability.excludedDates`) |
| **Policies** | Business rules (advance booking, cancellation window) | Bot configuration |

### What IS NOT Truth

| Concept | Role | Why Not Truth |
|---------|------|---------------|
| **Slot** | Computed availability interval | Derived from truth, ephemeral |
| **Projection** | Frontend view of available slots | Computed on-demand, disposable |
| **Cache** | Any cached availability data | Stale by definition |
| **Frontend State** | UI representation of booking data | Client-side, not authoritative |

### Truth Authority Hierarchy

```
ProviderAvailability (db) ──┐
Booking (db) ───────────────┼──► Slot (computed) ──► Projection (ephemeral)
Exclusions (db) ────────────┘
Policies (config) ──────────┘
```

**Rule:** Arrows point from truth to derived. Derived never writes back to truth.

---

## SECTION 2 — CONCEPTUAL DEFINITIONS

### Availability

**Definition:** The set of all time intervals during which a provider is willing and able to accept bookings.

**Source:** ProviderAvailability + Exclusions

**Form:** Weekly schedule + exceptions

**Example:**
```
Monday: 09:00–17:00
Tuesday: 09:00–17:00
Wednesday: CLOSED (excluded)
2024-12-25: CLOSED (holiday exclusion)
```

**Invariant:** Availability is configuration, not computation. It changes only when owner modifies schedule.

---

### Occupancy

**Definition:** The set of all time intervals that are already committed to bookings.

**Source:** Booking entities with status IN ('pending', 'confirmed')

**Form:** Set of (date, timeSlot, durationMinutes) tuples

**Example:**
```
2024-06-15: 09:00 (30 min) — pending
2024-06-15: 10:00 (60 min) — confirmed
```

**Invariant:** Occupancy is derived from Booking table. It changes when bookings are created, cancelled, or rescheduled.

---

### Booking

**Definition:** A customer reservation for a specific service at a specific date and time.

**Source:** Booking entity in database

**Form:** Single record with (botId, userId, date, timeSlot, status)

**Example:**
```
{ botId: "bot_123", userId: 456, date: "2024-06-15", timeSlot: "09:00", status: "confirmed" }
```

**Invariant:** Booking is the only mutable temporal record. Status transitions are explicit.

---

### Slot

**Definition:** A time interval that is potentially bookable.

**Source:** Computed from Availability − Occupancy

**Form:** Array of HH:MM strings (e.g., ["09:00", "09:30", "10:00"])

**Example:**
```typescript
// Computed on-demand
const slots = computeSlots(availability, occupancy);
// Result: ["09:00", "09:30", "10:00", ...] for a specific date
```

**Invariant:**
- Slot is NEVER persisted
- Slot is NEVER cached as truth
- Slot is computed at query time
- Slot becomes stale immediately after computation

---

### Projection

**Definition:** Any derived view of temporal data presented to users.

**Source:** Computed from Truth entities

**Forms:**
- Available slots list (customer booking flow)
- Calendar day view (owner dashboard)
- Upcoming bookings list (owner dashboard)

**Example:**
```typescript
// Projection: available slots for customer
const projection = {
  date: "2024-06-15",
  availableSlots: ["09:00", "09:30", "10:00"],
  bookedSlots: ["10:30", "11:00"],
};
```

**Invariant:**
- Projection is disposable
- Projection is never authoritative
- Projection may be stale (user must re-query)
- Projection never writes back to truth

---

## SECTION 3 — TRUTH VS DERIVED MATRIX

| Aspect | Truth | Derived |
|--------|-------|---------|
| **Storage** | Database | Memory / Response payload |
| **Mutability** | Owner/config | Immutable (computed) |
| **Authority** | Final | Advisory |
| **Lifetime** | Persistent | Request-scoped |
| **Concurrency** | Transaction-protected | Race-tolerant |
| **Invalidation** | N/A (truth doesn't invalidate) | Immediate on any truth change |

---

## SECTION 4 — AVAILABILITY INVALIDATION

### What Invalidates Availability

| Event | Invalidated | Action |
|-------|-------------|--------|
| Owner modifies working hours | All future projections | Recompute on next query |
| Owner adds exclusion date | Projections for that date | Recompute on next query |
| Owner removes exclusion date | Projections for that date | Recompute on next query |
| Booking created | Projections for booking date | Recompute on next query |
| Booking cancelled | Projections for booking date | Recompute on next query |
| Booking rescheduled | Projections for old AND new date | Recompute on next query |
| Booking confirmed | None (already occupied) | No change |
| Booking completed | None | No change |

### Invalidation Strategy

**Strategy:** NONE

No explicit invalidation mechanism exists. Projections are recomputed on every query.

**Rationale:**
- Simplicity: no cache invalidation complexity
- Correctness: always computes from latest truth
- Performance: acceptable for current scale

**Future:** If performance requires caching, invalidate on truth mutation events.

---

## SECTION 5 — WHAT MUST NEVER BE PERSISTED

### Forbidden Persistence

| Concept | Why Forbidden | Consequence if Persisted |
|---------|-------------|-------------------------|
| **Generated slots** | Becomes stale immediately | Double-booking risk, stale data |
| **Availability cache** | Truth changes invalidate cache | Outdated availability shown |
| **Projection state** | Frontend-specific, temporal | State synchronization hell |
| **Slot reservation** | Without booking = ghost state | Phantom occupancy, lost slots |
| **Computed availability matrix** | Derived from truth | Cache invalidation complexity |

### Canonical Rule

```
IF it can be computed from truth
THEN it MUST NOT be persisted
```

---

## SECTION 6 — PROJECTION VS TRUTH BOUNDARIES

### Boundary Map

```
┌─────────────────────────────────────────┐
│           PROJECTION LAYER              │
│  (Customer Mini App, Owner Dashboard)   │
│                                         │
│  • Available slots list                 │
│  • Calendar day view                    │
│  • Upcoming bookings                    │
│  • Booking summary                      │
│                                         │
│  READ-ONLY. NEVER WRITES TO TRUTH.      │
└─────────────────────────────────────────┘
                    │
                    ▼ (HTTP GET)
┌─────────────────────────────────────────┐
│           QUERY LAYER                   │
│  (BookingQueryService)                  │
│                                         │
│  • getAvailableSlots()                  │
│  • getBookedSlots()                     │
│  • getUpcomingBookings()                │
│                                         │
│  COMPUTES PROJECTIONS FROM TRUTH.       │
│  NO STATE MUTATION.                     │
└─────────────────────────────────────────┘
                    │
                    ▼ (TypeORM Repository)
┌─────────────────────────────────────────┐
│           TRUTH LAYER                   │
│  (Database)                             │
│                                         │
│  • ProviderAvailability                 │
│  • Booking                              │
│  • Exclusions                           │
│                                         │
│  AUTHORITATIVE. FINAL. TRANSACTIONAL.   │
└─────────────────────────────────────────┘
                    ▲
                    │ (TypeORM Repository)
┌─────────────────────────────────────────┐
│           RUNTIME LAYER                 │
│  (BookingRuntimeService)                │
│                                         │
│  • createBooking()                      │
│  • cancelBooking()                      │
│  • rescheduleBooking()                  │
│  • confirmBooking()                     │
│                                         │
│  MUTATES TRUTH. VALIDATES INVARIANTS.   │
└─────────────────────────────────────────┘
```

### Crossing the Boundary

**Safe (Projection → Truth):**
- NEVER. Projection never writes to truth.

**Safe (Truth → Projection):**
- ALWAYS. Truth is always the source.

**Safe (Runtime → Truth):**
- Through explicit methods with validation.
- Through transactions.

**Forbidden (Any → Projection persistence):**
- NEVER persist projection.

---

## SECTION 7 — DRIFT RISKS

### Risk 1: Slot Materialization

**Symptom:** "Computing slots on every request is slow. Let's pre-generate and store them."

**Danger:** Slot becomes stale when booking created. Double-booking risk.

**Mitigation:** Profile first. If needed, optimize compute, not materialize.

### Risk 2: Cache-as-Truth

**Symptom:** "Let's cache availability in Redis for performance."

**Danger:** Cache becomes source of truth. Invalidation complexity.

**Mitigation:** Database is final authority. Cache only if proven necessary.

### Risk 3: Projection State Persistence

**Symptom:** "Let's store user's selected slot in database during booking flow."

**Danger:** Creates "soft booking" without real booking. Ghost occupancy.

**Mitigation:** User state (UserState) stores selection, not slot reservation.

### Risk 4: Universal Availability Abstraction

**Symptom:** "Support Desk also has agent shifts. Let's share availability logic."

**Danger:** Cross-template coupling. Scheduling framework emergence.

**Mitigation:** Availability logic stays in booking template.

---

## SECTION 8 — VALIDATION GATES

### Gate 1: No Slot Entity

```bash
grep -r "class Slot" src/templates/booking/entities/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Slot Persistence

```bash
grep -r "slotRepository" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Scheduling Engine

```bash
grep -r "SchedulingEngine" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Recurrence Engine

```bash
grep -r "RRULE\|rrule\|recurrence" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Universal Availability

```bash
grep -r "UniversalAvailability\|AvailabilityService" src/
# Expected: no results
```

**Status:** ✅ PASS

---

## SECTION 9 — CANONICAL RULES

### Rule 1: Database is Final Authority

All temporal truth lives in database tables.

### Rule 2: Slots are Computed, Not Stored

Slot generation is pure function: `f(availability, occupancy) → slots`.

### Rule 3: Projections are Disposable

Projections are computed per-request and discarded.

### Rule 4: Truth Mutates Through Runtime Only

Only BookingRuntimeService modifies truth entities.

### Rule 5: No Write-Back from Projection

Projection layer never modifies truth.

### Rule 6: Invalidation is Implicit

No explicit cache invalidation. Recompute on query.

### Rule 7: Derived Never Outlives Request

Slots and projections exist only during request lifecycle.

### Rule 8: Owner Controls Availability

Only owner modifies ProviderAvailability. Customer never does.

---

**Version 1.0 — UNIT 01 — 2026-05-23**
