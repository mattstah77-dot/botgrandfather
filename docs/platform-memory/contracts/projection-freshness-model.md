# Projection Freshness Model

**Purpose:** Define stale tolerance, recomputation semantics, freshness boundaries  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## FRESHNESS HIERARCHY

### Strict Freshness (Immediate)

**When Required:**
- Booking creation
- Booking confirmation
- Booking cancellation
- Rescheduling
- Any write operation

**Implementation:**
```typescript
async createBooking(data: CreateBookingDto) {
  // Strict freshness: re-check at write time
  const isAvailable = await this.isSlotAvailable(
    data.botId, data.date, data.timeSlot
  );
  if (!isAvailable) throw new Error('Slot no longer available');
  
  // Create with DB constraint as final guard
  return this.bookingRepository.save(data);
}
```

**Why Strict:**
- Prevents double-booking
- Ensures data consistency
- Database is authoritative

---

### Eventual Freshness (Seconds)

**When Tolerated:**
- Slot display
- Booking list
- Calendar view
- Ticket list
- Dashboard metrics

**Implementation:**
```typescript
async getAvailableSlots(botId: string, date: string) {
  // Eventual freshness: computed per request
  // May be slightly stale between request and display
  const availability = await this.getProviderAvailability(botId);
  const bookings = await this.getBookingsForDate(botId, date);
  
  return this.computeSlots(availability, bookings);
}
```

**Why Eventual:**
- UX only, no operational impact
- Refreshed on next request
- Stale display harmless

---

### Relaxed Freshness (Minutes)

**When Tolerated:**
- Analytics projections
- Historical trends
- Usage statistics
- Aggregated metrics

**Implementation:**
```typescript
async getBookingTrends(botId: string) {
  // Relaxed freshness: historical data changes slowly
  const bookings = await this.getBookingsForBot(botId);
  return this.computeTrends(bookings);
}
```

**Why Relaxed:**
- Historical data changes slowly
- No operational impact
- Trends are observational

---

## RECOMPUTATION SEMANTICS

### Principle: Recomputation Over Synchronization

```
❌ FORBIDDEN: Synchronization
    Cache → Invalidation → Re-sync → Monitor

✅ CORRECT: Recomputation
    Request → Compute from DB → Return → Discard
```

### Recomputation Flow

```
Request arrives
    │
    ▼
Query truth from database
    │
    ▼
Compute projection
    │
    ▼
Return projection
    │
    ▼
Discard projection
```

### Why Recomputation Is Safe

1. **No stale data** — Always computed from current truth
2. **No synchronization** — No cache invalidation needed
3. **No infrastructure** — No Redis, no queues, no workers
4. **Predictable** — Same input always produces same output
5. **Cheap** — 3-5ms per request at current scale

---

## FRESHNESS BOUNDARIES BY PROJECTION TYPE

| Projection Type | Freshness | Validation Point | Stale Impact |
|-----------------|-----------|-----------------|--------------|
| Slot display | Eventual | Write time | None (UX only) |
| Booking list | Eventual | Write time | None (observational) |
| Calendar view | Eventual | Write time | None (observational) |
| Booking creation | Strict | DB constraint | Double-booking prevented |
| Booking confirmation | Strict | DB read | Wrong status prevented |
| Cancellation | Strict | DB transaction | Overbooking prevented |
| Rescheduling | Strict | DB transaction | Double-booking prevented |
| Dashboard metrics | Eventual | None | None (analytics) |
| Historical trends | Minutes | None | None (historical) |

---

## ADVISORY SEMANTICS

### Projection Is Always Advisory

```
Database Truth:    "Booking #123 status = confirmed"
Projection:        "Booking #123 appears confirmed"
                    ↑
            Advisory — may be microseconds stale
```

### User Action Validates

```
User sees:         "Slot 09:00 available" (projection)
User clicks:       "Book 09:00"
System validates:  "09:00 still available?" (strict check)
Result:            "Booked" or "No longer available"
```

### Key Insight

**Stale projection is harmless because write-time validation is strict.**

---

## INVALIDATION PHILOSOPHY

### No Invalidation Needed

```typescript
// ✅ CORRECT: No invalidation
class BookingQueryService {
  async getAvailableSlots(botId: string, date: string) {
    // Fresh computation every time
    return this.computeSlots(botId, date);
  }
}

// ❌ FORBIDDEN: Invalidation infrastructure
class SlotInvalidationService {
  @OnEvent('booking.created')
  async invalidateSlots(event: BookingCreated) {
    // NEVER do this
    await this.cache.del(`slots:${event.botId}:${event.date}`);
  }
}
```

### Why No Invalidation

1. **Recomputation is cheaper** than invalidation
2. **No cache to invalidate** — no cache exists
3. **No race conditions** — no shared state
4. **No infrastructure** — no event bus needed

---

## CANONICAL RULES

### Rule 1: Read Tolerates Eventual Freshness

Read projections may be seconds stale. This is acceptable.

### Rule 2: Write Requires Strict Freshness

All mutations re-check truth at write time.

### Rule 3: Recomputation Over Synchronization

Compute fresh per request. Never synchronize projections.

### Rule 4: No Invalidation Infrastructure

No cache invalidation, no event-driven updates, no reactive systems.

### Rule 5: Stale Projection Is Harmless

Stale read + strict write = correct behavior.

---

**Version 1.0 — UNIT 04 — 2026-05-23**
