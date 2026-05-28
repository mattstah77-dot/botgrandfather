# Occupancy Semantics Boundary

**Purpose:** Define occupancy semantics and separate temporal from business concerns  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — CANONICAL OCCUPANCY DEFINITION

### What Occupancy Is

**Occupancy means ONLY:** Temporal capacity is consumed.

**Occupancy answers:** "Can another booking exist at this temporal interval?"

**Occupancy does NOT answer:** "Is this business process complete?"

### Temporal vs Business Meaning

| Status | Business Meaning | Temporal Meaning (Occupancy) |
|--------|-----------------|------------------------------|
| **pending** | Awaiting owner confirmation | ✅ OCCUPIES |
| **confirmed** | Owner approved | ✅ OCCUPIES |
| **completed** | Service rendered | ❌ DOES NOT OCCUPY |
| **cancelled** | Invalid/void | ❌ DOES NOT OCCUPY |
| **no-show** | Customer didn't attend | ❌ DOES NOT OCCUPY |

### The Single Question

```typescript
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
}
```

**This function is the complete definition of occupancy.**

No other logic. No business meaning. No workflow state. No customer intent.

---

## SECTION 2 — WHAT OCCUPANCY IS NOT

### Occupancy Is NOT Customer Commitment

**Wrong interpretation:** "Customer confirmed, therefore occupancy."

**Why Wrong:** Customer commitment is a business concept. Occupancy is temporal.

**Correct:** A pending booking occupies capacity even if customer hasn't "committed" to anything.

---

### Occupancy Is NOT Business Confirmation

**Wrong interpretation:** "Owner confirmed, therefore occupancy."

**Why Wrong:** Owner confirmation is a business action. Occupancy exists independently.

**Correct:** A pending booking occupies capacity even before owner confirms.

---

### Occupancy Is NOT Payment Completion

**Wrong interpretation:** "Customer paid, therefore occupancy."

**Why Wrong:** Payment is financial. Occupancy is temporal.

**Correct:** A pending booking occupies capacity regardless of payment status.

---

### Occupancy Is NOT Operational Readiness

**Wrong interpretation:** "Staff assigned, therefore occupancy."

**Why Wrong:** Staff assignment is operational. Occupancy is temporal.

**Correct:** A pending booking occupies capacity even if no staff is assigned.

---

### Occupancy Is NOT Workflow State

**Wrong interpretation:** "Workflow step 3, therefore occupancy."

**Why Wrong:** Workflow is business process. Occupancy is temporal.

**Correct:** A pending booking occupies capacity regardless of workflow position.

---

## SECTION 3 — OCCUPANCY MATRIX

### Complete Occupancy Matrix

| Status | Occupies? | Reason | Business Meaning |
|--------|-----------|--------|------------------|
| **pending** | ✅ YES | Customer created booking, temporal capacity consumed | Awaiting owner confirmation |
| **confirmed** | ✅ YES | Owner approved, temporal capacity still consumed | Approved booking |
| **completed** | ❌ NO | Service rendered, capacity freed | Done |
| **cancelled** | ❌ NO | Booking void, capacity freed | Invalid booking |
| **no-show** | ❌ NO | Customer absent, capacity freed (policy) | Failed attendance |

### Occupancy vs Status Independence

```
Status Dimension          Occupancy Dimension
    │                            │
    │── pending ──►              │── occupies
    │    (business: awaiting)    │    (temporal: consumes capacity)
    │                            │
    │── confirmed ──►            │── occupies
    │    (business: approved)    │    (temporal: consumes capacity)
    │                            │
    │── completed ──►            │── does not occupy
    │    (business: done)        │    (temporal: capacity freed)
    │                            │
    │── cancelled ──►            │── does not occupy
    │    (business: void)        │    (temporal: capacity freed)
    │                            │
    │── no-show ──►              │── does not occupy
         (business: absent)           (temporal: capacity freed)
```

**Key Property:** Status and occupancy are independent dimensions. Status changes may or may not affect occupancy.

---

## SECTION 4 — OCCUPANCY SEMANTICS BY STATUS

### Pending → Occupies

**Decision:** Pending bookings occupy temporal capacity.

**Rationale:**
1. Customer expectation (slot held upon booking)
2. Race condition mitigation (prevents double-booking)
3. Simplicity (no separate reservation state)

**Trade-off:** Abandoned pending bookings may block capacity.

**Mitigation:** Owner manual cleanup.

---

### Confirmed → Occupies

**Decision:** Confirmed bookings occupy temporal capacity.

**Rationale:** Obviously. This is the canonical occupied state.

---

### Completed → Does Not Occupy

**Decision:** Completed bookings do not occupy capacity.

**Rationale:** Service rendered, capacity no longer consumed.

**Implication:** Completed bookings appear in history but not in availability computation.

---

### Cancelled → Does Not Occupy

**Decision:** Cancelled bookings do not occupy capacity.

**Rationale:** Booking voided, capacity freed.

**Implication:** Cancelled bookings appear in history but not in availability computation.

---

### No-Show → Does Not Occupy

**Decision:** No-show bookings do not occupy capacity.

**Rationale:** Customer didn't attend, capacity was wasted but is now freed.

**Policy Note:** Some businesses may choose to treat no-shows as occupying (penalty). This is a business policy, not temporal truth. Temporal occupancy is freed.

---

## SECTION 5 — TEMPORAL VS BUSINESS SEPARATION

### Why Separation Is Critical

**Without separation:**

```typescript
// ❌ WRONG: Business logic drives occupancy
class BookingService {
  async processStatusChange(bookingId: string, newStatus: string) {
    const booking = await this.getBooking(bookingId);
    booking.status = newStatus;
    
    // Business logic corrupting temporal
    if (newStatus === 'confirmed') {
      await this.occupy(booking);  // Business meaning leaking into temporal
    }
    
    if (newStatus === 'completed') {
      await this.free(booking);  // Business meaning leaking into temporal
    }
  }
}
```

**With separation:**

```typescript
// ✅ CORRECT: Temporal occupancy is explicit
class BookingService {
  async changeStatus(bookingId: string, newStatus: string) {
    const booking = await this.getBooking(bookingId);
    
    // Business action: change status
    booking.status = newStatus;
    await this.save(booking);
    
    // Temporal occupancy is IMPLICIT in status
    // No separate occupy/free action needed
    // Occupancy function: occupies(booking) = ['pending','confirmed'].includes(status)
  }
}
```

### Separation Benefits

| Aspect | Without Separation | With Separation |
|--------|-------------------|-----------------|
| **Double-booking risk** | HIGH (business logic may forget to occupy) | LOW (occupancy is status-based) |
| **Complexity** | HIGH (separate occupancy tracking) | LOW (single source of truth) |
| **Debugging** | HARD (occupancy may diverge from status) | EASY (occupancy = function of status) |
| **Extensibility** | HARD (new status requires occupancy logic) | EASY (new status → update function) |

---

## SECTION 6 — CORRUPTION PATTERNS

### Pattern 1: Business Status Drives Occupancy

**Symptom:** "Only confirmed bookings occupy capacity."

**Danger:** Pending bookings don't occupy, leading to double-booking.

**Mitigation:** Pending occupies by default. Business confirmation is separate from temporal occupancy.

### Pattern 2: Payment Status Affects Occupancy

**Symptom:** "Unpaid bookings don't occupy capacity."

**Danger:** Customer books slot, doesn't pay, another customer books same slot.

**Mitigation:** Payment is business concern. Occupancy is temporal concern.

### Pattern 3: Operational State Affects Occupancy

**Symptom:** "Staff not assigned, therefore slot is available."

**Danger:** Customer books slot, staff not available.

**Mitigation:** Staff assignment is operational. Occupancy is temporal.

### Pattern 4: Workflow Position Affects Occupancy

**Symptom:** "Workflow step 2 doesn't occupy, step 3 does."

**Danger:** Workflow complexity leaks into temporal logic.

**Mitigation:** Workflow is business process. Occupancy is temporal.

---

## SECTION 7 — CANONICAL RULES

### Rule 1: Occupancy Is Temporal-Only

Occupancy answers: "Does this booking consume temporal capacity?"

### Rule 2: Occupancy Is Status-Based

Occupancy is pure function of status: `occupies(status) → boolean`.

### Rule 3: Business Meaning Is Separate

Business meaning (confirmation, payment, workflow) does not affect occupancy.

### Rule 4: No Separate Occupancy Tracking

No `isOccupied` flag, no `occupancy` table, no `free()` method.

### Rule 5: Occupancy Is Implicit

Occupancy is derived from status, not explicitly set.

### Rule 6: Status Transitions May Change Occupancy

Status transitions may implicitly change occupancy, but this is a side effect, not the purpose.

### Rule 7: Temporal Authority Is Database

Database state (Booking.status) determines occupancy. Not business logic.

### Rule 8: No Business Logic in Occupancy

Business rules (payment, confirmation, workflow) never directly affect occupancy.

---

## SECTION 8 — VALIDATION GATES

### Gate 1: No Separate Occupancy Tracking

```bash
grep -r "isOccupied\|occupancyTable\|freeSlot" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: Occupancy Is Status-Based

```bash
grep -r "occupies.*status\|In.*pending.*confirmed" src/templates/booking/
# Expected: found in getBookedSlots
```

**Status:** ✅ PASS

### Gate 3: No Business Logic in Occupancy

```bash
grep -r "occupies.*payment\|occupies.*confirmed" src/templates/booking/
# Expected: no results (except status-based)
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
