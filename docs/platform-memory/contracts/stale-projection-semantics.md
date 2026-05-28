# Stale Projection Semantics

**Purpose:** Define which stale states are acceptable and which are dangerous  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 06 — Concurrency & Reliability Validation  
**Date:** 2026-05-23

---

## STALE STATE TAXONOMY

### Category 1: Acceptable Stale (No Action Needed)

| Stale State | Example | Impact | Action |
|-------------|---------|--------|--------|
| **Dashboard count off by 1** | Owner sees 10 bookings, actual is 11 | Observational only | Manual refresh |
| **Calendar shows old availability** | Owner removed Wednesday, calendar still shows it | UX only | Refresh page |
| **Slot list slightly outdated** | Customer sees slot that was just booked | Caught at write time | Select different slot |
| **Booking status in list outdated** | Booking was confirmed, list still shows pending | Observational only | Refresh list |
| **Analytics snapshot outdated** | Revenue snapshot is 2 minutes old | Advisory only | Expected |

### Category 2: Dangerous Stale (Must Be Blocked)

| Stale State | Example | Impact | Prevention |
|-------------|---------|--------|------------|
| **Booking created on occupied slot** | Double-booking | Data corruption | DB unique constraint |
| **Booking created on excluded date** | Violates owner config | Business rule broken | Write-time availability check |
| **Status transition from wrong state** | Cancel completed booking | Invalid state | Status validation |
| **Reschedule to occupied slot** | Double-booking | Data corruption | DB unique constraint |
| **Availability modification lost** | Owner change overwritten | Config lost | Transaction isolation |

### Category 3: Acceptable With Graceful Handling

| Stale State | Example | Handling |
|-------------|---------|----------|
| **Slot selected but now occupied** | Customer clicks taken slot | "Slot just booked, please select another" |
| **Booking cancelled during confirmation** | Owner cancels, customer confirms | "Booking status has changed" |
| **Date excluded during booking flow** | Owner removes date | "This date is no longer available" |

---

## STALE STATE MATRIX

| Projection | Stale Tolerance | Dangerous If | Handling |
|------------|----------------|--------------|----------|
| **Available slots** | Seconds | Booking succeeds on occupied slot | Write-time validation |
| **Booking list** | Seconds | None (observational) | Manual refresh |
| **Booking status** | Seconds | Status transition from wrong state | Write-time status check |
| **Calendar view** | Seconds | None (observational) | Manual refresh |
| **Dashboard metrics** | Minutes | None (observational) | Manual refresh |
| **Occupancy summary** | Seconds | None (observational) | Manual refresh |
| **Customer history** | Seconds | None (observational) | Manual refresh |
| **Owner overview** | Seconds | None (observational) | Manual refresh |

---

## WHAT REQUIRES BLOCKING

### Must Block: Data Integrity Violations

```typescript
// ❌ MUST BLOCK: Double-booking
try {
  await createBooking(botId, date, timeSlot);  // Slot already occupied
} catch (error) {
  if (isUniqueViolation(error)) {
    // BLOCK: Return error to user
    return { error: 'Slot already booked' };
  }
}

// ❌ MUST BLOCK: Invalid status transition
try {
  await cancelBooking(bookingId);  // Booking is already completed
} catch (error) {
  if (error.message === 'Cannot cancel completed booking') {
    // BLOCK: Return error to user
    return { error: 'Cannot cancel completed booking' };
  }
}
```

### Must Block: Business Rule Violations

```typescript
// ❌ MUST BLOCK: Booking on excluded date
if (availability.excludedDates.includes(date)) {
  // BLOCK: Return error to user
  return { error: 'This date is not available for booking' };
}

// ❌ MUST BLOCK: Booking in past
if (isPastDate(date, timeSlot)) {
  // BLOCK: Return error to user
  return { error: 'Cannot book in the past' };
}
```

---

## WHAT ONLY REQUIRES REFRESH/RECOMPUTE

### Refresh Only: Observational Staleness

```typescript
// ✅ REFRESH ONLY: Dashboard count
// Owner sees 10 bookings, actual is 11
// Action: Owner refreshes page
// No data integrity risk

// ✅ REFRESH ONLY: Calendar view
// Calendar shows old state
// Action: Owner refreshes page
// No data integrity risk

// ✅ REFRESH ONLY: Slot list
// Slot list shows slot that was just booked
// Action: Customer refreshes and selects different slot
// Write-time validation prevents actual double-booking
```

---

## DO NOT OVERREACT TO STALE VIEWS

### Operational Systems Tolerate Eventual Consistency

```
Owner Dashboard:
    ├── Shows 10 bookings
    ├── Actual: 11 bookings
    ├── Impact: None (observational)
    ├── Action: Refresh page
    └── Risk: ZERO

Customer Slot List:
    ├── Shows 09:00 available
    ├── Actual: 09:00 just booked
    ├── Impact: None (write-time validation catches)
    ├── Action: Select different slot
    └── Risk: ZERO (if write-time validation exists)
```

### What NOT To Do

```typescript
// ❌ FORBIDDEN: Auto-refresh infrastructure
class DashboardService {
  @Interval(5000)  // Auto-refresh every 5 seconds
  async autoRefresh() {
    // FORBIDDEN: Creates reactive infrastructure
  }
}

// ❌ FORBIDDEN: Real-time sync
class SlotSyncService {
  @OnEvent('booking.created')
  async syncSlots(event) {
    // FORBIDDEN: Creates event-driven sync
  }
}

// ❌ FORBIDDEN: Cache invalidation
class CacheInvalidationService {
  async invalidateSlots(botId: string) {
    // FORBIDDEN: Creates invalidation complexity
  }
}
```

---

## CANONICAL RULES

### Rule 1: Observational Staleness Is Acceptable

Dashboards, lists, and summaries may be seconds stale. This is normal.

### Rule 2: Data Integrity Staleness Is Unacceptable

Double-booking, invalid transitions, and rule violations must be blocked.

### Rule 3: Write-Time Validation Blocks Dangerous Staleness

All dangerous stale states are caught at write time by validation + DB constraints.

### Rule 4: Refresh Handles Acceptable Staleness

Manual refresh is the correct response to observational staleness.

### Rule 5: Do Not Build Infrastructure For Stale Views

No auto-refresh, no real-time sync, no cache invalidation for projections.

---

**Version 1.0 — UNIT 06 — 2026-05-23**
