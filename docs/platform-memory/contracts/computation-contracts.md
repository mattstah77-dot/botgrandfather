# Computation Contracts

**Purpose:** Define booking computation model, projection economics, and recomputation philosophy  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 03 — Computation Model & Projection Economics  
**Date:** 2026-05-23

---

## SECTION 1 — COMPUTATION BOUNDARY MAP

### What Is Truth (Authoritative)

```
┌─────────────────────────────────────────┐
│           TRUTH LAYER                   │
│  (Database — PostgreSQL)                │
│                                         │
│  • ProviderAvailability (weekly hours)  │
│  • Booking (confirmed/pending)          │
│  • ExcludedDates (holidays, breaks)     │
│  • BotConfiguration (templates)         │
│                                         │
│  NEVER: slots, projections, cache       │
└─────────────────────────────────────────┘
```

**Rule:** Only database tables are authoritative. Everything else is derived.

---

### What Is Derived (Computed)

```
┌─────────────────────────────────────────┐
│         DERIVED LAYER                   │
│  (Request-Scoped Computation)           │
│                                         │
│  • Available slots for a date           │
│  • Occupancy map for a date             │
│  • Calendar view data                   │
│  • Dashboard summaries                  │
│                                         │
│  Computed from: Truth + Query params    │
│  Lifetime: Single request               │
│  Authority: NONE                        │
└─────────────────────────────────────────┘
```

**Rule:** Derived data has zero authority. It is advisory only.

---

### What Is Ephemeral (Exists Only During Request)

```
┌─────────────────────────────────────────┐
│        EPHEMERAL LAYER                  │
│  (In-Memory Only)                       │
│                                         │
│  • Slot arrays (generated per request)  │
│  • Availability projections             │
│  • Occupancy filters                    │
│  • Timezone conversions                 │
│                                         │
│  Lifetime: Request only                 │
│  Persistence: NONE                      │
│  Sharing: NONE (per-request)            │
└─────────────────────────────────────────┘
```

**Rule:** Ephemeral data dies with the request. No sharing across requests.

---

### What MAY Be Cached (With Strict Boundaries)

```
┌─────────────────────────────────────────┐
│      CACHED LAYER (Future)              │
│  (Optional, Non-Authoritative)          │
│                                         │
│  SAFE:                                  │
│  • ProviderAvailability (rarely changes)│
│  • BotConfiguration (rarely changes)    │
│  • Static template metadata             │
│                                         │
│  DANGEROUS:                             │
│  • Booking lists (frequently change)    │
│  • Slot projections (always change)     │
│  • Occupancy maps (frequently change)   │
│                                         │
│  FORBIDDEN:                             │
│  • Slot entities                        │
│  • Availability as cache-truth          │
│  • Occupancy as cache-truth             │
└─────────────────────────────────────────┘
```

**Rule:** Cache may accelerate reads, but NEVER becomes authoritative.

---

### What Is Forbidden-To-Persist

| Entity | Why Forbidden | Alternative |
|--------|---------------|-------------|
| **Slot** | Not a real entity | Compute on demand |
| **Slot table** | Materializes projections | Query bookings + availability |
| **Availability cache** | Cache-as-truth risk | Recompute per request |
| **Occupancy cache** | Staleness danger | Filter bookings per request |
| **Projection store** | Infrastructure complexity | In-memory computation |
| **Slot lifecycle** | Framework drift | No lifecycle (ephemeral) |

---

## SECTION 2 — COMPUTATION PIPELINE

### Standard Flow

```
Request ("Show available slots for 2026-06-01")
    │
    ▼
┌─────────────────────────────────────────┐
│ Step 1: Load Truth                      │
│  • Fetch ProviderAvailability           │
│  • Fetch bookings for date              │
│  • Fetch excluded dates                 │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Step 2: Compute Availability            │
│  • Generate base slots from weekday     │
│  • Apply excluded dates                 │
│  • Apply policies (advance notice)      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Step 3: Compute Occupancy               │
│  • Filter bookings by date              │
│  • Extract occupied time slots          │
│  • Map to availability grid             │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Step 4: Derive Projection               │
│  • available = base − occupied          │
│  • Format for response                  │
│  • Return to client                     │
└─────────────────────────────────────────┘
    │
    ▼
Response (["09:00", "09:30", "10:00", ...])
```

**Key Property:** Every request recomputes from truth. No shared state between requests.

---

### Code Example

```typescript
// Current implementation (BookingQueryService)
async getAvailableSlots(
  botId: string,
  date: string
): Promise<string[]> {
  // Step 1: Load truth
  const availability = await this.getProviderAvailability(botId);
  const bookings = await this.getBookingsForDate(botId, date);
  
  // Step 2: Compute availability
  const weekday = getWeekday(date);
  const isExcluded = availability.excludedDates.includes(date);
  const isWorkingDay = availability.weekday === weekday;
  
  if (isExcluded || !isWorkingDay) return [];
  
  // Step 3: Compute occupancy
  const occupiedSlots = bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status))
    .map(b => b.timeSlot);
  
  // Step 4: Derive projection
  const allSlots = this.generateSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration
  );
  
  return allSlots.filter(slot => !occupiedSlots.includes(slot));
}
```

---

## SECTION 3 — PROJECTION ECONOMICS

### Why Recomputation Is Cheap

**Current Scale Assumptions:**
- Bots per platform: 1,000
- Bookings per bot per day: 20
- Slots per day: 20 (e.g., 09:00–18:00, 30-min slots)
- Requests per day: 10,000

**Computation Cost:**
```
Per request:
  1 DB query (ProviderAvailability) — indexed, ~1ms
  1 DB query (bookings for date) — indexed, ~2ms
  Array generation — negligible
  Array filtering — negligible
  
Total per request: ~3-5ms
```

**Daily Computation Cost:**
```
10,000 requests × 5ms = 50 seconds of compute per day
```

**Conclusion:** Recomputation is trivially cheap at current scale.

---

### Why Invalidation Is Expensive

**Hypothetical Invalidation System:**
```
Components needed:
  1. Cache layer (Redis)
  2. Cache invalidation logic
  3. Event system for invalidation triggers
  4. Cache warming strategy
  5. Cache consistency monitoring
  6. Cache failure handling
  7. Stale cache detection
  8. Cache reconciliation logic

Operational complexity:
  • Cache invalidation is "hard problem" in computer science
  • Stale cache = double-booking risk
  • Cache failure = availability system down
  • Cache warming = pre-computation infrastructure
  • Monitoring = additional operational burden
```

**Cost Comparison:**
| Approach | Dev Complexity | Ops Complexity | Risk | Total Cost |
|----------|---------------|----------------|------|------------|
| Recomputation | LOW | NONE | LOW | LOW |
| Cache + Invalidation | HIGH | HIGH | HIGH | VERY HIGH |

**Conclusion:** Invalidation is orders of magnitude more expensive than recomputation.

---

### Why Coordination Is Dangerous

**Hypothetical Coordination System:**
```
Components needed:
  1. Distributed cache (Redis Cluster)
  2. Cache invalidation messages
  3. Message queue (for invalidation)
  4. Consistency checks
  5. Reconciliation jobs
  6. Conflict resolution logic
  7. Failure recovery

Failure modes:
  • Network partition: cache diverges from DB
  • Message loss: invalidation never happens
  • Race condition: read stale cache during write
  • Cache eviction: unexpected cold start
```

**Conclusion:** Coordination introduces more problems than it solves.

---

### Scaling Threshold Analysis

**When does recomputation become expensive?**

| Scale Factor | Current | 10x | 100x | 1000x |
|--------------|---------|-----|------|-------|
| Bots | 1,000 | 10,000 | 100,000 | 1,000,000 |
| Bookings/day | 20,000 | 200,000 | 2,000,000 | 20,000,000 |
| Requests/day | 10,000 | 100,000 | 1,000,000 | 10,000,000 |
| Compute/day | 50s | 500s | 5,000s | 50,000s |
| Compute/hour | 2s | 21s | 208s | 2,083s |

**Analysis:**
- 10x scale: Still trivial (21s/hour)
- 100x scale: Manageable (3.5 min/hour)
- 1000x scale: Noticeable (35 min/hour)

**Conclusion:** Recomputation remains viable up to 100x current scale. At 1000x, optimization may be warranted, but NOT before.

**Optimization Priority:**
1. Database indexing (already done)
2. Query optimization (if needed)
3. Read replicas (if needed)
4. Selective caching (last resort)
5. NEVER: slot materialization

---

## SECTION 4 — FRESHNESS SEMANTICS

### Freshness Requirements by Operation

| Operation | Freshness Required | Reason | Implementation |
|-----------|-------------------|--------|----------------|
| **Slot display** | Eventual (seconds) | UX only | Recompute per request |
| **Booking creation** | Strict (immediate) | Prevents double-booking | DB unique constraint |
| **Booking confirmation** | Strict (immediate) | Status accuracy | DB read at confirmation |
| **Cancellation** | Strict (immediate) | Releases capacity | DB transaction |
| **Owner calendar** | Eventual (seconds) | Observational | Recompute per request |
| **Dashboard summary** | Eventual (minutes) | Analytics | Recompute per request |
| **Rescheduling** | Strict (immediate) | Atomic transfer | DB transaction |

### Key Principle

**Write operations require strict freshness. Read operations tolerate eventual freshness.**

### Why Write-Time Validation Is Sufficient

```typescript
// Slot display: eventual freshness OK
const slots = await getAvailableSlots(botId, date);  // May be slightly stale

// Booking creation: strict freshness REQUIRED
async function createBooking(botId, date, time) {
  // Re-check availability at write time
  const isAvailable = await checkSlotAvailability(botId, date, time);
  if (!isAvailable) throw new Error('Slot no longer available');
  
  // Create booking (DB constraint as final guard)
  await bookingRepository.save(booking);
}
```

**Conclusion:** Read-time staleness is acceptable because write-time validation is strict.

---

## SECTION 5 — CACHE PHILOSOPHY

### What MAY Be Cached (Safe)

| Data | Change Frequency | Cache TTL | Risk |
|------|-----------------|-----------|------|
| ProviderAvailability | Rare (weekly) | 5 minutes | Very Low |
| BotConfiguration | Rare (setup) | 5 minutes | Very Low |
| Template metadata | Rare (deploy) | 1 hour | Very Low |

**Rule:** Cache only data that changes rarely and is not temporal.

---

### What MUST NEVER Be Cached (Dangerous)

| Data | Why Dangerous | Failure Mode |
|------|--------------|--------------|
| **Slot projections** | Temporal, always changing | Stale slots = double-booking |
| **Booking lists** | Frequently changing | Stale list = missed bookings |
| **Occupancy maps** | Frequently changing | Stale map = overbooking |
| **Availability status** | Business-critical | Stale status = wrong decisions |

**Rule:** Never cache temporal data. Never cache business-critical availability.

---

### Cache Boundary Contract

```typescript
// ✅ SAFE: Cache static configuration
@Cacheable({ ttl: 300 })  // 5 minutes
async getBotConfiguration(botId: string): Promise<BotConfig> {
  return this.botConfigRepository.findOne({ where: { botId } });
}

// ❌ FORBIDDEN: Cache temporal data
@Cacheable({ ttl: 60 })  // NEVER DO THIS
async getAvailableSlots(botId: string, date: string): Promise<string[]> {
  // This would create cache-as-truth risk
}

// ❌ FORBIDDEN: Cache occupancy
@Cacheable({ ttl: 30 })  // NEVER DO THIS
async getOccupancyMap(botId: string, date: string): Promise<OccupancyMap> {
  // This would create stale occupancy risk
}
```

---

## SECTION 6 — RECOMPUTATION COST MODEL

### Cost Breakdown

#### 1. Database Queries

| Query | Cost | Index | Frequency |
|-------|------|-------|-----------|
| ProviderAvailability lookup | ~1ms | botId (PK) | Per request |
| Bookings for date | ~2ms | botId + date | Per request |
| Booking creation | ~5ms | Unique constraint | Per booking |

#### 2. Computation

| Operation | Cost | Complexity |
|-----------|------|------------|
| Slot generation | ~0.1ms | O(slots per day) |
| Occupancy filtering | ~0.1ms | O(bookings per day) |
| Array operations | ~0.01ms | O(n) |

#### 3. Total Per Request

```
Available slots query: ~3-5ms
Booking creation: ~8-10ms
Calendar view: ~5-7ms
Dashboard summary: ~10-15ms
```

**Conclusion:** All operations are sub-15ms. No optimization needed.

---

### Scaling Pressure Points

| Pressure Point | Current | 10x | 100x | Mitigation |
|----------------|---------|-----|------|------------|
| DB query volume | 10K/day | 100K/day | 1M/day | Connection pooling |
| Booking table size | 20K rows | 200K rows | 2M rows | Partitioning |
| Computation time | 5ms | 5ms | 5ms | Constant |

**Conclusion:** Database scales independently of computation logic. Computation remains constant-time.

---

## SECTION 7 — TEMPORAL FRESHNESS VALIDATION

### Scenario 1: Stale Slot Display

**Setup:**
- Customer A loads slot page → sees 09:00 available
- Customer B books 09:00 → succeeds
- Customer A clicks 09:00 → what happens?

**Expected:**
```
Customer A → Click 09:00 → Re-check availability → "Slot no longer available"
```

**Validation:** ✅ Write-time validation catches stale projection.

---

### Scenario 2: Stale Calendar View

**Setup:**
- Owner loads calendar → sees 3 bookings
- Customer books new slot → pending
- Owner's calendar still shows 3 bookings

**Expected:**
```
Owner → Refreshes calendar → Sees 4 bookings
```

**Validation:** ✅ Calendar is observational. Refresh shows current state. No operational impact.

---

### Scenario 3: Concurrent Booking After Slot Display

**Setup:**
- Customer A loads slots → 09:00, 09:30, 10:00
- Customer B loads slots → 09:00, 09:30, 10:00
- Both click 09:00 simultaneously

**Expected:**
```
Customer A → Create booking → Success
Customer B → Create booking → "Slot just booked"
```

**Validation:** ✅ DB unique constraint prevents double-booking. Stale projection harmless.

---

### Freshness Validation Summary

| Scenario | Staleness Tolerance | Validation Point | Status |
|----------|-------------------|-----------------|--------|
| Slot display | Seconds | Write time | ✅ Safe |
| Calendar view | Seconds | Refresh | ✅ Safe |
| Booking creation | Immediate | DB constraint | ✅ Safe |
| Rescheduling | Immediate | DB transaction | ✅ Safe |

---

## SECTION 8 — VALIDATION GATES

### Gate 1: No Slot Persistence

```bash
grep -r "class Slot\|@Entity.*slot\|slotRepository" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Background Slot Generators

```bash
grep -r "@Cron.*slot\|generateSlots.*background\|slotWorker" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Cache Authority

```bash
grep -r "cache.*available\|redis.*slot\|cachedSlots" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Queue Infrastructure

```bash
grep -r "Queue\|Bull\|RabbitMQ\|queue.*booking" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Projection Synchronization

```bash
grep -r "syncProjections\|invalidateSlots\|refreshCache" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

---

## SECTION 9 — CANONICAL RULES

### Rule 1: Database Is Truth

All temporal authority resides in PostgreSQL. No exceptions.

### Rule 2: Recompute Per Request

Every request recomputes projections from truth. No shared derived state.

### Rule 3: Cache Never Authoritative

Cache may accelerate but never authorizes. Database validates all writes.

### Rule 4: Write-Time Validation

All mutations re-check truth at write time. Stale reads are acceptable.

### Rule 5: Ephemeral Projections

Slots exist only during request. No persistence. No lifecycle.

### Rule 6: No Premature Optimization

Recomputation is cheap. Optimization only when proven necessary.

### Rule 7: No Invalidation Infrastructure

Invalidation is more complex than recomputation. Avoid.

### Rule 8: No Coordination

Distributed coordination introduces more problems than it solves.

---

**Version 1.0 — UNIT 03 — 2026-05-23**
