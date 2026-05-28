# PRE-UNIT-02 Research — Temporal Semantics Stabilization

**Status:** MANDATORY — Pre-UNIT-02 Corrective Research  
**Priority:** CRITICAL  
**Date:** 2026-05-23  
**Unit:** 02 — Occupancy Semantics (BLOCKED pending this research)

---

## CRITICAL CLARIFICATION 1 — BOOKING IS NOT A SLOT

### The Wrong Mental Model

```
❌ SLOT-FIRST ARCHITECTURE (FORBIDDEN)
slot → reserve slot → mutate slot → release slot
```

This path leads to:
- Slot engines
- Reservation infrastructure
- Distributed temporal systems
- Queue orchestration
- Temporal corruption

### The Correct Mental Model

```
✅ TEMPORAL CAPACITY ARCHITECTURE (CANONICAL)
availability − occupancy = discoverable temporal opportunities
```

### Canonical Flow

```
ProviderAvailability (truth)
    │
    ├── defines → availability (weekly hours, exclusions)
    │
Booking (truth)
    │
    ├── defines → occupancy (pending, confirmed)
    │
COMPUTATION (pure function)
    │
    availability − occupancy = slots (projection)
    │
CUSTOMER
    │
    discovers → slots (projection)
    selects → date + time (customer choice)
    │
BOOKING CREATION (runtime)
    │
    creates → Booking entity (truth)
    │
OCCUPANCY UPDATED (implicit)
    │
    next computation reflects new occupancy
```

### Key Distinction

| Aspect | Slot | Booking |
|--------|------|---------|
| **Exists in DB?** | NO | YES |
| **Has lifecycle?** | NO | YES (status transitions) |
| **Consumes capacity?** | NO (advisory) | YES (if pending/confirmed) |
| **Can be reserved?** | NO | N/A (booking IS the reservation) |
| **Mutated by runtime?** | NO | YES |

### Canonical Rule

```
Booking reserves temporal capacity.
Slots are ONLY projections, discovery surfaces, computed representations.
```

---

## CRITICAL CLARIFICATION 2 — OCCUPANCY IS TEMPORAL, NOT BUSINESS

### Separation of Concerns

**Occupancy answers:** Does this booking currently consume temporal capacity?

**Occupancy does NOT answer:** What business stage is this booking in?

### Status Matrix: Business vs Temporal

| Status | Business Meaning | Temporal Meaning (Occupancy) |
|--------|-----------------|------------------------------|
| **pending** | Awaiting confirmation | ✅ OCCUPIES (default policy) |
| **confirmed** | Approved booking | ✅ OCCUPIES |
| **completed** | Service finished | ❌ DOES NOT OCCUPY |
| **cancelled** | Invalid booking | ❌ DOES NOT OCCUPY |
| **no-show** | Failed attendance | ❌ DOES NOT OCCUPY (policy-dependent) |

### Why This Separation Is Critical

**Without separation:**
```
❌ WRONG: Business status drives temporal logic
if (booking.status === 'confirmed') {
  occupy();  // Business logic leaking into temporal
}
```

**With separation:**
```
✅ CORRECT: Temporal occupancy is explicit
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
}
// Business meaning is irrelevant to occupancy
```

### Corruption Risks

| If Occupancy = Business | Result |
|------------------------|--------|
| Lifecycle logic corrupts temporal logic | Double-booking, stale availability |
| CRM semantics leak into scheduling | Customer status affects availability |
| Operational state mutates temporal authority | Manual booking status changes break availability |

### Canonical Rule

```
Occupancy semantics remain temporal-only.
Business lifecycle and temporal occupancy are separate dimensions.
```

---

## CRITICAL CLARIFICATION 3 — OCCUPANCY IS NOT UNIVERSAL RESOURCE ALLOCATION

### Booking's Scope

**Booking currently owns:** Business-specific temporal capacity.

**Booking does NOT own:**
- Rooms
- Equipment
- Inventory
- Arbitrary resources

### Future Considerations

Even if future capabilities MAY use rooms, providers, chairs, equipment:

```
❌ FORBIDDEN: Extract ResourceAllocationEngine
class ResourceAllocationEngine {
  async allocate(resource: Resource, time: Time) { ... }
}
```

```
✅ CORRECT: Template-specific temporal logic
class BookingRuntimeService {
  async createBooking(...) {
    // Booking-specific temporal validation
  }
}
```

### Canonical Rule

```
Booking semantics remain template-owned temporal business logic.
No generic resource management abstraction emerges during Booking evolution.
```

---

## CRITICAL CLARIFICATION 4 — PENDING IS THE MOST DANGEROUS STATE

### The Core Dilemma

**Question:** Does pending occupy?

**If YES (pessimistic occupancy):**
- Abandoned flows block capacity
- Stale reservations emerge
- Cleanup systems appear (temptation)
- Expiration infrastructure appears (temptation)

**If NO (optimistic occupancy):**
- Race conditions increase
- Double-booking probability rises
- Optimistic concurrency becomes critical

### Architectural Decision

**Decision:** Pending DOES occupy.

**Rationale:**
1. **Customer expectation:** When customer selects a time and creates a booking, they expect that time to be held.
2. **Race condition mitigation:** If pending does not occupy, two customers could simultaneously create pending bookings for the same slot.
3. **Simplicity:** No cleanup/expiration infrastructure needed.
4. **Owner control:** Owner can cancel stale pending bookings manually.

**Trade-offs accepted:**
- Abandoned pending bookings may block capacity
- Owner must manually cancel stale bookings
- No automatic expiration (no background workers)

### Pending Occupancy Model

```typescript
// Canonical occupancy function
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
}

// Pending is occupancy
const pendingBooking = { status: 'pending', date: '2024-06-15', timeSlot: '09:00' };
occupies(pendingBooking); // true

// Confirmed is occupancy
const confirmedBooking = { status: 'confirmed', date: '2024-06-15', timeSlot: '10:00' };
occupies(confirmedBooking); // true

// Cancelled is NOT occupancy
const cancelledBooking = { status: 'cancelled', date: '2024-06-15', timeSlot: '11:00' };
occupies(cancelledBooking); // false
```

### Risk Mitigation: No Automatic Cleanup

**Forbidden:**
```typescript
// ❌ FORBIDDEN: Automatic expiration
class PendingExpirationWorker {
  @Cron('*/5 * * * *')
  async expireStalePendingBookings() {
    // Automatically cancel pending bookings older than X hours
  }
}
```

**Allowed:**
```typescript
// ✅ ALLOWED: Owner manual cleanup
class BookingRuntimeService {
  async cancelBooking(botId: string, bookingId: string) {
    // Owner explicitly cancels stale pending booking
  }
}
```

### Canonical Rule

```
Pending occupies temporal capacity.
No automatic expiration or cleanup infrastructure exists.
Owner manually manages stale pending bookings.
```

---

## CRITICAL CLARIFICATION 5 — BOOKING WINDOWS ARE POLICY, NOT TEMPORAL TRUTH

### Policy vs Truth

| Concept | Type | Role | Example |
|---------|------|------|---------|
| **Advance notice** | Policy | Business rule | "Book at least 2 hours ahead" |
| **Cancellation window** | Policy | Business rule | "Cancel at least 24 hours before" |
| **Reschedule window** | Policy | Business rule | "Reschedule at least 24 hours before" |
| **Booking horizon** | Policy | Business rule | "Book up to 30 days ahead" |
| **Availability** | Truth | Provider schedule | "Monday 09:00–17:00" |
| **Occupancy** | Truth | Booking record | "2024-06-15 09:00 — confirmed" |

### Why Distinction Is Critical

**Without separation:**
```
❌ WRONG: Policy drives temporal authority
if (withinCancellationWindow(booking)) {
  booking.occupancy = false;  // Policy mutating truth!
}
```

**With separation:**
```
✅ CORRECT: Policy validates, truth remains separate
if (!withinCancellationWindow(booking)) {
  throw new Error('Cannot cancel within window');  // Policy blocks action
}
// Booking status unchanged until explicit cancellation
```

### Policy Engine Drift Risk

If policies become temporal authority:
- Policy engines emerge
- Temporal framework drift begins
- Hidden rules mutate availability

### Canonical Rule

```
Booking windows are business policies.
They validate actions but do not mutate temporal truth.
Policy rules are authority for actions, not for temporal state.
```

---

## CRITICAL CLARIFICATION 6 — TIME ITSELF IS NOT AUTHORITATIVE

### The Danger of Implicit "Now"

**Forbidden pattern:**
```typescript
// ❌ FORBIDDEN: Implicit time authority
class BookingService {
  async processBooking(booking: Booking) {
    if (booking.date < new Date()) {  // Hidden "now" logic
      booking.status = 'completed';  // Automatic mutation!
    }
  }
}
```

This leads to:
- Scheduler drift
- Hidden lifecycle automation
- Background workers
- Temporal corruption

### Correct Pattern: Explicit Validation

```typescript
// ✅ CORRECT: Explicit temporal validation
class BookingRuntimeService {
  async completeBooking(botId: string, bookingId: string) {
    const booking = await this.getBooking(bookingId);
    
    // Explicit owner action required
    if (booking.status !== 'confirmed') {
      throw new Error('Cannot complete: status is not confirmed');
    }
    
    // Owner explicitly marks as completed
    booking.status = 'completed';
    await this.save(booking);
  }
}
```

### Temporal Authority Hierarchy

```
1. Database state ( Booking record )
      ↑
2. Explicit validation ( Runtime methods )
      ↑
3. Policy rules ( Configurable windows )
      ↑
4. Owner action ( Human decision )
```

**"Now" is NOT in the hierarchy.**

### Canonical Rule

```
Database state is authority.
Policy rules are authority for actions.
Explicit temporal validation is authority.
"Current time" is NOT implicit authority.
```

---

## ADDITIONAL RESEARCH: TEMPORAL OWNERSHIP SEMANTICS

### Who Owns What

| Entity | Owner | Mutable By |
|--------|-------|------------|
| ProviderAvailability | Provider/Business | Owner via config |
| Booking | Customer (created), Business (managed) | Runtime service |
| Exclusions | Provider/Business | Owner via config |
| Policies | Business | Owner via config |
| Slot | NOBODY (computed) | N/A |
| Projection | NOBODY (computed) | N/A |

### Ownership Boundaries

```
Customer          Owner/Provider         Platform
    │                    │                   │
    │──creates──────────►│                   │
    │   Booking          │                   │
    │                    │                   │
    │◄──discovers────────│                   │
    │   Slots            │                   │
    │   (projections)    │                   │
    │                    │                   │
    │                    │──modifies────────►│
    │                    │   Availability    │
    │                    │   Exclusions      │
    │                    │   Policies        │
```

---

## ADDITIONAL RESEARCH: PENDING-STATE RISK MODELS

### Risk: Abandoned Pending Bookings

**Scenario:** Customer starts booking flow, creates pending booking, never completes payment/confirmation.

**Impact:** Temporal capacity blocked.

**Mitigation (Chosen):**
- No automatic expiration
- Owner manually cancels stale bookings
- Operational visibility of pending bookings

**Rejected Mitigations:**
- ❌ Auto-expiration worker
- ❌ Pending timeout cron job
- ❌ Reservation TTL

### Risk: Stale Pending Race

**Scenario:** Two customers simultaneously create pending bookings for same slot.

**Impact:** One succeeds, other gets unique constraint error.

**Mitigation:** Database unique constraint (`botId, date, timeSlot, status`).

### Risk: Pending Flood

**Scenario:** Malicious actor creates many pending bookings.

**Impact:** Capacity blocked.

**Mitigation:** Rate limiting (future), owner manual cleanup.

---

## ADDITIONAL RESEARCH: OPTIMISTIC VS PESSIMISTIC OCCUPANCY

### Comparison

| Aspect | Optimistic (Pending = No Occupancy) | Pessimistic (Pending = Occupancy) |
|--------|-------------------------------------|-----------------------------------|
| **Double-booking risk** | HIGH | LOW |
| **Abandoned booking impact** | LOW | MEDIUM |
| **Cleanup infrastructure** | Required | Not required |
| **Complexity** | HIGH | LOW |
| **Customer expectation** | Violated | Met |
| **Race conditions** | Critical | Managed by DB constraint |

### Decision: Pessimistic Occupancy

**Pending occupies.**

**Trade-offs accepted:**
- Owner must manually manage stale pending bookings
- No automatic cleanup infrastructure
- Simpler mental model
- Lower double-booking risk

---

## ADDITIONAL RESEARCH: TEMPORAL CAPACITY VS BUSINESS LIFECYCLE

### Dimensions

| Dimension | Concern | Mutated By |
|-----------|---------|------------|
| **Temporal capacity** | Does booking occupy time? | Status transitions (runtime) |
| **Business lifecycle** | What stage is booking in? | Owner actions (operational) |
| **Customer journey** | What has customer experienced? | Conversation flow (runtime) |
| **Operational state** | What does owner see? | Dashboard queries (operational) |

### Independence

```
Temporal capacity ── independent ──► Business lifecycle
     │                                    │
     │ Occupancy function                 │ Status meaning
     │ (status-based)                     │ (business-defined)
     │                                    │
     ▼                                    ▼
  ['pending',                          'pending' = awaiting
   'confirmed']                        'confirmed' = approved
  = occupies                           'completed' = done
```

---

## ADDITIONAL RESEARCH: OCCUPANCY RELEASE SEMANTICS

### When Occupancy Is Released

| Event | Previous Status | Occupancy Released? | Mechanism |
|-------|-----------------|---------------------|-----------|
| Booking cancelled | pending | ✅ YES | Status → 'cancelled' |
| Booking cancelled | confirmed | ✅ YES | Status → 'cancelled' |
| Booking completed | confirmed | ✅ YES | Status → 'completed' |
| Booking rescheduled | confirmed | ✅ YES (old slot) | Status preserved, date/time changed |
| Booking marked no-show | confirmed | ✅ YES | Status → 'no-show' |

### When Occupancy Is NOT Released

| Event | Status | Occupancy Released? |
|-------|--------|---------------------|
| Owner confirms pending | pending → confirmed | ❌ NO (still occupies) |
| Customer updates notes | any | ❌ NO |
| Owner adds payment info | any | ❌ NO |

### Release Mechanics

```typescript
// Occupancy is implicit in status
function getOccupiedSlots(botId: string, date: string): string[] {
  const bookings = await bookingRepository.find({
    where: {
      botId,
      date,
      status: In(['pending', 'confirmed']),  // These occupy
    },
  });
  return bookings.map(b => b.timeSlot);
}
```

---

## ADDITIONAL RESEARCH: TEMPORAL ROLLBACK SEMANTICS

### What Is Rollback

**Definition:** Reverting a booking to previous temporal state.

**Example:** Rescheduling reverts old slot, occupies new slot.

### Rollback Mechanics

```typescript
// Rescheduling as rollback + forward
async function rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
  const booking = await getBooking(bookingId);
  
  // 1. Implicitly release old occupancy (by changing date/time)
  const oldDate = booking.date;
  const oldTime = booking.timeSlot;
  
  // 2. Check new slot availability
  const isAvailable = await checkSlotAvailability(booking.botId, newDate, newTime);
  if (!isAvailable) throw new Error('Slot not available');
  
  // 3. Occupy new slot (by updating booking)
  booking.date = newDate;
  booking.timeSlot = newTime;
  await save(booking);
  
  // Old slot automatically released (no longer matches query)
  // New slot automatically occupied (matches query)
}
```

### No Explicit Rollback Needed

Occupancy is implicit. No `releaseSlot()` or `rollbackOccupancy()` needed.

---

## ADDITIONAL RESEARCH: BOOKING ABANDONMENT IMPLICATIONS

### Abandonment Scenarios

| Scenario | Result | Occupancy Impact |
|----------|--------|-----------------|
| Customer abandons during flow | No booking created | None |
| Customer abandons after booking creation | Pending booking exists | Blocks capacity |
| Owner never confirms | Pending booking remains | Blocks capacity |
| Owner cancels stale pending | Status → 'cancelled' | Released |

### Cleanup Pressure

**Pressure:** Owner sees stale pending bookings.

**Response (Manual):**
```
Owner opens dashboard
    │
    ├── sees pending bookings
    │
    ├── identifies stale ones
    │
    └── clicks "Cancel" on stale booking
```

**Response (Forbidden — Automatic):**
```
❌ Background worker auto-cancels pending bookings after X hours
```

---

## ADDITIONAL RESEARCH: TEMPORAL AUTHORITY HIERARCHY

### Authority Stack

```
Level 5: Owner/Business (human decision)
    │
    ├── approves bookings
    ├── modifies availability
    └── sets policies
    │
Level 4: Policy Rules (configurable constraints)
    │
    ├── advance notice
    ├── cancellation window
    └── reschedule window
    │
Level 3: Database State (persistent truth)
    │
    ├── ProviderAvailability
    ├── Booking records
    └── Exclusions
    │
Level 2: Runtime Validation (explicit checks)
    │
    ├── slot availability check
    ├── status transition validation
    └── policy enforcement
    │
Level 1: Computed Projections (advisory)
    │
    ├── available slots
    ├── calendar views
    └── occupancy maps
```

### Key Principle

**Higher levels override lower levels, but lower levels are authoritative for their domain.**

---

## ADDITIONAL RESEARCH: RESERVATION CORRUPTION PATTERNS

### Pattern 1: Ghost Reservations

**Cause:** Pending booking created, customer never completes, owner never cancels.

**Result:** Capacity permanently blocked.

**Mitigation:** Owner manual cleanup.

### Pattern 2: Stale Projections

**Cause:** Slot computed, then booking created by another customer.

**Result:** First customer sees stale "available" slot.

**Mitigation:** Unique constraint on booking creation, graceful error.

### Pattern 3: Status-Occupancy Mismatch

**Cause:** Business logic mutates status without updating occupancy.

**Result:** Availability and occupancy diverge.

**Mitigation:** Occupancy is purely status-based, no separate occupancy tracking.

### Pattern 4: Timezone Corruption

**Cause:** Implicit timezone conversion.

**Result:** Bookings at wrong times.

**Mitigation:** Explicit timezone boundaries, UTC storage.

---

## VALIDATION: FORBIDDEN COMPONENTS CHECK

### Check 1: No Slot Lifecycle

```
Search: "class Slot" in src/
Result: No matches
Status: ✅ PASS
```

### Check 2: No Reservation Expiration Engine

```
Search: "PendingExpiration\|ExpirationWorker\|ReservationTTL" in src/
Result: No matches
Status: ✅ PASS
```

### Check 3: No Temporal Cleanup Workers

```
Search: "CleanupService\|CleanupWorker\|StaleBooking" in src/
Result: No matches
Status: ✅ PASS
```

### Check 4: No Pending-Timeout Automation

```
Search: "@Cron\|@Interval\|timeout.*pending" in src/templates/booking/
Result: No matches
Status: ✅ PASS
```

### Check 5: No Resource-Allocation Abstractions

```
Search: "ResourceAllocator\|CapacityManager\|ResourceAllocation" in src/
Result: No matches
Status: ✅ PASS
```

### Check 6: No Scheduler Service

```
Search: "SchedulerService\|SchedulingService\|TemporalScheduler" in src/
Result: No matches
Status: ✅ PASS
```

### Check 7: No Background Booking Mutation

```
Search: "@Cron.*booking\|background.*booking\|auto.*booking" in src/
Result: No matches
Status: ✅ PASS
```

---

## PRE-UNIT-02 SIGN-OFF

| Item | Status |
|------|--------|
| Critical Clarification 1 — Booking is not a slot | ✅ Documented |
| Critical Clarification 2 — Occupancy is temporal | ✅ Documented |
| Critical Clarification 3 — Not universal resource | ✅ Documented |
| Critical Clarification 4 — Pending occupies | ✅ Decided (pessimistic) |
| Critical Clarification 5 — Windows are policy | ✅ Documented |
| Critical Clarification 6 — Time is not authority | ✅ Documented |
| Additional research — Temporal ownership | ✅ Documented |
| Additional research — Pending-state risks | ✅ Documented |
| Additional research — Optimistic vs pessimistic | ✅ Documented |
| Additional research — Capacity vs lifecycle | ✅ Documented |
| Additional research — Release semantics | ✅ Documented |
| Additional research — Rollback semantics | ✅ Documented |
| Additional research — Abandonment | ✅ Documented |
| Additional research — Authority hierarchy | ✅ Documented |
| Additional research — Corruption patterns | ✅ Documented |
| Forbidden components check | ✅ All 7 checks PASS |

---

## UNIT 02 READINESS

**Status:** READY for execution (after review)

**Prerequisites satisfied:**
- ✅ Temporal truth stabilized (UNIT 01)
- ✅ Semantic clarifications documented (this research)
- ✅ Pending occupancy decided (pessimistic)
- ✅ Forbidden components verified absent
- ✅ Drift risks identified and mitigated

---

**Version 1.0 — PRE-UNIT-02 — 2026-05-23**
