# Write-Time Validation Contracts

**Purpose:** Define canonical write-time validation semantics  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 06 — Concurrency & Reliability Validation  
**Date:** 2026-05-23

---

## VALIDATION PHILOSOPHY

**Read-time validation is advisory.**
**Write-time validation is mandatory.**
**Database constraints are final authority.**

```
Read projection → Advisory (may be stale)
    │
    ▼
Write validation → Mandatory (current truth)
    │
    ▼
Database constraint → Final authority (cannot be bypassed)
```

---

## WHAT GETS VALIDATED

### Booking Creation

| Validation | When | Authority | Failure Mode |
|------------|------|-----------|--------------|
| Date is not in past | Write time | Code | "Cannot book in the past" |
| Date is not excluded | Write time | Code | "This date is not available" |
| Time is within working hours | Write time | Code | "This time is outside working hours" |
| Slot is not occupied | Write time | DB query | "This slot is already booked" |
| Unique constraint | Write time | DB constraint | "Slot just booked by someone else" |

### Booking Confirmation

| Validation | When | Authority | Failure Mode |
|------------|------|-----------|--------------|
| Booking exists | Write time | DB query | "Booking not found" |
| Status is pending | Write time | Code | "Booking is not pending" |
| Booking belongs to bot | Write time | Code | "Unauthorized" |

### Booking Cancellation

| Validation | When | Authority | Failure Mode |
|------------|------|-----------|--------------|
| Booking exists | Write time | DB query | "Booking not found" |
| Status allows cancellation | Write time | Code | "Cannot cancel completed booking" |
| Booking belongs to bot/customer | Write time | Code | "Unauthorized" |

### Rescheduling

| Validation | When | Authority | Failure Mode |
|------------|------|-----------|--------------|
| Booking exists | Write time | DB query | "Booking not found" |
| Status allows reschedule | Write time | Code | "Cannot reschedule cancelled booking" |
| New slot is available | Write time | DB query | "New slot is not available" |
| Unique constraint (new slot) | Write time | DB constraint | "Slot just booked" |

---

## WHEN VALIDATION OCCURS

### Validation Timing

```
Request arrives
    │
    ├── Authentication (always)
    ├── Authorization (always)
    │
    ▼
Business validation (write time)
    ├── Re-read truth from DB
    ├── Check invariants
    ├── Check policies
    │
    ▼
Attempt mutation
    ├── INSERT / UPDATE
    ├── DB constraint check
    │
    ├── Success → commit
    └── Failure → rollback + error
```

### Key Principle

**Validation re-reads truth at write time.** It does not trust read-time projections.

```typescript
// ✅ CORRECT: Re-read at write time
async createBooking(data: CreateBookingDto) {
  // Re-read availability at write time (not from projection)
  const availability = await this.getProviderAvailability(data.botId);
  
  // Re-read occupancy at write time
  const existing = await this.bookingRepository.findOne({
    where: {
      botId: data.botId,
      date: data.date,
      timeSlot: data.timeSlot,
      status: In(['pending', 'confirmed'])
    }
  });
  
  if (existing) {
    throw new Error('Slot already taken');  // Stale projection caught
  }
  
  // Final authority: DB constraint
  await this.bookingRepository.save(booking);
}
```

---

## WHAT INVALIDATES BOOKING CREATION

### Invalidation Conditions

| Condition | Invalidates? | Reason |
|-----------|-------------|--------|
| Slot already occupied | ✅ YES | Double-booking prevention |
| Date is excluded | ✅ YES | Owner configuration |
| Time outside working hours | ✅ YES | Owner configuration |
| Date in past | ✅ YES | Temporal impossibility |
| Customer already has booking at same time | ⚠️ Policy | Business rule |
| Bot is inactive | ✅ YES | Platform rule |

### What Does NOT Invalidate

| Condition | Invalidates? | Reason |
|-----------|-------------|--------|
| Dashboard shows slot available | ❌ NO | Projection is advisory |
| Slot was available 5 seconds ago | ❌ NO | Stale projection acceptable |
| Customer "selected" slot in UI | ❌ NO | UX state, not business state |
| Owner has not confirmed yet | ❌ NO | Pending is valid state |

---

## WHAT INVALIDATES RESCHEDULING

### Invalidation Conditions

| Condition | Invalidates? | Reason |
|-----------|-------------|--------|
| New slot already occupied | ✅ YES | Double-booking prevention |
| New date is excluded | ✅ YES | Owner configuration |
| New time outside working hours | ✅ YES | Owner configuration |
| Booking status doesn't allow reschedule | ✅ YES | Lifecycle rule |
| Booking doesn't exist | ✅ YES | Data integrity |

---

## FINAL AUTHORITY CHECKS

### Mandatory Final Authority Checks

| Operation | Final Authority Check |
|-----------|----------------------|
| **Create booking** | DB unique constraint on `(botId, date, timeSlot, status)` |
| **Confirm booking** | DB status validation (re-read before update) |
| **Cancel booking** | DB status validation (re-read before update) |
| **Reschedule booking** | DB unique constraint on new slot + status validation |
| **Modify availability** | DB transaction (owner authorization) |

### Why DB Constraint Is Final

```typescript
// Code validation can race:
const existing = await this.bookingRepository.findOne({...});
if (existing) throw new Error('Taken');  // Race window here!
await this.bookingRepository.save(booking);  // Another booking may have been created

// DB constraint cannot race:
await this.bookingRepository.save(booking);  // Either succeeds or violates constraint
```

**Key Property:** Code validation reduces races. DB constraint eliminates them.

---

## VALIDATION LAYERS

```
Layer 1: Input Validation (DTO)
    ├── Type checking
    ├── Format validation
    └── Range validation
    
Layer 2: Authorization (Guard)
    ├── Is customer authorized?
    ├── Is owner authorized?
    └── Is bot active?
    
Layer 3: Business Validation (Service)
    ├── Re-read truth from DB
    ├── Check business rules
    └── Check policies
    
Layer 4: Database Constraint
    ├── Unique constraint
    ├── Foreign key constraint
    └── Check constraint
```

### Failure Handling

| Layer | Failure | Response |
|-------|---------|----------|
| Input | Invalid date format | 400 Bad Request |
| Auth | Unauthorized | 403 Forbidden |
| Business | Slot taken | 409 Conflict |
| DB | Unique violation | 409 Conflict |

---

## CANONICAL RULES

### Rule 1: Write-Time Validation Is Mandatory

All mutations re-check truth at write time. No trust in read-time projections.

### Rule 2: Database Constraint Is Final

Unique constraints and foreign keys are the ultimate safety net.

### Rule 3: Validation Re-Reads Truth

Validation queries database at write time, not from projection or cache.

### Rule 4: Graceful Failure

All validation failures produce clear, actionable user messages.

### Rule 5: No Pre-Reservation

Validation happens at booking creation, not during slot selection.

### Rule 6: Status Validation On Every Mutation

Every status-changing operation re-validates current status.

---

**Version 1.0 — UNIT 06 — 2026-05-23**
