# Operational Freshness Contract

**Purpose:** Validate freshness semantics under operational load  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 05 — Projection Consumption & Operational Read Models  
**Date:** 2026-05-23

---

## FRESHNESS UNDER LOAD

### Stale Read Scenarios

**Scenario 1: Customer Sees Stale Slots**
```
T+0: Customer A loads slots → sees 09:00 available
T+1: Customer B books 09:00 → succeeds
T+2: Customer A clicks 09:00 → "No longer available"
```

**Expected Behavior:**
- Customer A sees stale slots (acceptable)
- Write-time validation catches conflict
- Customer A receives clear message

**Validation:** ✅ SAFE — stale read + strict write = correct

---

**Scenario 2: Owner Sees Stale Dashboard**
```
T+0: Owner loads dashboard → sees 10 bookings
T+1: Customer books → new booking created
T+2: Owner's dashboard still shows 10
```

**Expected Behavior:**
- Owner sees stale count (acceptable)
- Refresh shows updated count
- No operational impact

**Validation:** ✅ SAFE — dashboard is observational

---

**Scenario 3: Concurrent Booking After Slot Display**
```
T+0: Customer A loads slots → 09:00, 09:30, 10:00
T+0: Customer B loads slots → 09:00, 09:30, 10:00
T+1: Customer A clicks 09:00 → success
T+1: Customer B clicks 09:00 → "Just booked"
```

**Expected Behavior:**
- Customer A succeeds
- Customer B gets clear conflict message
- DB constraint prevents double-booking

**Validation:** ✅ SAFE — DB is final authority

---

## RECOMPUTATION PRESSURE

### Load Analysis

| Metric | Value |
|--------|-------|
| Requests per second | 100 (peak) |
| Queries per request | 2-3 |
| Query time | 1-3ms each |
| Computation time | 0.1-0.5ms |
| Total per request | 3-10ms |
| Total compute/second | 300-1000ms |

**Assessment:** Trivial compute pressure. No optimization needed.

---

### Operational Refresh Behavior

| Surface | Refresh Pattern | Stale Tolerance |
|---------|----------------|-----------------|
| Customer booking page | On navigation | Seconds |
| Owner dashboard | On load + manual refresh | Seconds |
| Slot picker | On date change | Seconds |
| Ticket list | On load | Seconds |
| Calendar view | On navigation | Seconds |

**Key Principle:** Manual refresh is acceptable. No automatic refresh needed.

---

## DASHBOARD REFRESH SEMANTICS

### What Dashboard Does

```typescript
// ✅ CORRECT: Dashboard shows data at load time
class DashboardController {
  @Get(':id/overview')
  async getOverview(@Param('id') botId: string) {
    // Data reflects state at request time
    return this.dashboardService.getBotState(botId);
  }
}
```

### What Dashboard Does NOT Do

```typescript
// ❌ FORBIDDEN: Dashboard does not auto-refresh
class DashboardController {
  @Get(':id/overview')
  async getOverview(@Param('id') botId: string) {
    // ❌ FORBIDDEN: No real-time updates
    // ❌ FORBIDDEN: No WebSocket push
    // ❌ FORBIDDEN: No polling
    return this.dashboardService.getBotState(botId);
  }
}
```

---

## ACTOR CONSISTENCY EXPECTATIONS

### Customer Expectation

| Action | Expectation |
|--------|-------------|
| Load booking page | See current availability |
| Book slot | Slot is available or clearly unavailable |
| View history | See own bookings |

**Consistency Model:** Eventual consistency acceptable. Write-time validation strict.

---

### Owner Expectation

| Action | Expectation |
|--------|-------------|
| Load dashboard | See recent operational state |
| Confirm booking | Booking status updates |
| View calendar | See current bookings |

**Consistency Model:** Eventual consistency acceptable. Manual refresh for updates.

---

### Operator Expectation

| Action | Expectation |
|--------|-------------|
| Load ticket queue | See assigned tickets |
| Respond to ticket | Response saved |
| Resolve ticket | Status updates |

**Consistency Model:** Eventual consistency acceptable. Page reload for updates.

---

## WHAT IS NOT INTRODUCED

### No Synchronization Infrastructure

```typescript
// ❌ FORBIDDEN: No sync infrastructure
- No Redis cache for projections
- No WebSocket for real-time updates
- No Server-Sent Events
- No polling endpoints
```

### No Reactive Invalidation

```typescript
// ❌ FORBIDDEN: No reactive invalidation
- No @OnEvent('booking.created') → update dashboard
- No event-driven refresh
- No reactive recomputation
```

### No Projection Persistence

```typescript
// ❌ FORBIDDEN: No projection persistence
- No materialized views
- No projection tables
- No read-model databases
```

---

## PRESERVED: RECOMPUTATION-FIRST

```typescript
// ✅ CORRECT: Recompute per request
async getAvailableSlots(botId: string, date: string) {
  // Fresh computation every time
  const availability = await this.getProviderAvailability(botId);
  const bookings = await this.getBookingsForDate(botId, date);
  
  return this.computeSlots(availability, bookings);
}
```

**Why Preserved:**
- Simple
- Correct
- Scalable
- No infrastructure

---

## CANONICAL RULES

### Rule 1: Stale Reads Are Acceptable

Read projections may be seconds stale. This is normal and safe.

### Rule 2: Write-Time Validation Is Strict

All mutations re-check truth at write time. Stale reads are harmless.

### Rule 3: No Automatic Refresh

Dashboards do not auto-refresh. Manual refresh is acceptable.

### Rule 4: No Real-Time Infrastructure

No WebSockets, SSE, polling, or reactive updates for projections.

### Rule 5: Recomputation Handles Load

Per-request recomputation is sufficient for realistic operational loads.

### Rule 6: Database Is Consistency Authority

PostgreSQL transactions ensure write consistency. Projections are advisory.

---

**Version 1.0 — UNIT 05 — 2026-05-23**
