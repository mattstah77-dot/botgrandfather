# Forbidden Optimization Patterns

**Purpose:** Explicit anti-patterns for booking computation optimization  
**Status:** CANONICAL — Tier 2 Anti-Pattern  
**Version:** 1.0  
**Unit:** 03 — Computation Model & Projection Economics  
**Date:** 2026-05-23

---

## FORBIDDEN PATTERN 1: Slot Materialization

### What It Is

Persisting generated slots into a database table.

```typescript
// ❌ FORBIDDEN
@Entity('slots')
class Slot {
  @Id()
  id: string;
  
  @Column()
  botId: string;
  
  @Column()
  date: string;
  
  @Column()
  timeSlot: string;
  
  @Column()
  status: 'available' | 'booked' | 'reserved';
  
  @Column()
  expiresAt: Date;
}
```

### Why It Appears Attractive

- "We need slots to persist across requests"
- "Querying slots is faster than computing"
- "We can track slot lifecycle"
- "Materialization is a standard pattern"

### How It Corrupts Architecture

1. **Slots become authoritative** — Cache now has truth
2. **Lifecycle emerges** — Slots are created, updated, deleted
3. **Synchronization needed** — DB slots must match real availability
4. **Invalidation required** — When availability changes, slots must be updated
5. **Stale data risk** — Materialized slots diverge from truth
6. **Framework drift** — Booking becomes a scheduling engine

### Architectural Corruption Chain

```
Slot materialization
    ↓
Slot lifecycle management
    ↓
Slot synchronization jobs
    ↓
Slot invalidation engine
    ↓
Slot cache infrastructure
    ↓
Scheduling framework emerges
```

### Safe Alternative

```typescript
// ✅ CORRECT: Compute on demand
async getAvailableSlots(botId: string, date: string): Promise<string[]> {
  const availability = await this.getProviderAvailability(botId);
  const bookings = await this.getBookingsForDate(botId, date);
  
  const occupied = bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status))
    .map(b => b.timeSlot);
  
  return this.generateSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration
  ).filter(slot => !occupied.includes(slot));
}
```

**Why Safe:** No slots persist. No lifecycle. No synchronization.

---

## FORBIDDEN PATTERN 2: Cache-As-Truth

### What It Is

Using Redis cache as the authoritative source for slot availability.

```typescript
// ❌ FORBIDDEN
@Injectable()
class SlotCacheService {
  async isSlotAvailable(botId: string, date: string, time: string): Promise<boolean> {
    const cacheKey = `availability:${botId}:${date}:${time}`;
    const cached = await this.redis.get(cacheKey);
    return cached === 'true';  // Cache becomes truth!
  }
  
  async setSlotAvailable(botId: string, date: string, time: string) {
    const cacheKey = `availability:${botId}:${date}:${time}`;
    await this.redis.set(cacheKey, 'true', 'EX', 300);
  }
}
```

### Why It Appears Attractive

- "Cache is faster than database"
- "We need sub-millisecond reads"
- "Database queries are expensive"
- "Industry best practice is caching"

### How It Corrupts Architecture

1. **Cache becomes authoritative** — Cache dictates availability
2. **Cache invalidation needed** — When availability changes, cache must update
3. **Stale cache risk** — Old cache = wrong availability
4. **Double-booking** — Cache says available, DB says booked
5. **Cache inconsistency** — Cache diverges from database
6. **Cache failure = system failure** — No Redis = no availability

### Architectural Corruption Chain

```
Cache for performance
    ↓
Cache as primary read path
    ↓
Cache as authority
    ↓
Cache invalidation infrastructure
    ↓
Cache consistency monitoring
    ↓
Cache reconciliation jobs
    ↓
System depends on cache
```

### Safe Alternative

```typescript
// ✅ CORRECT: Database is truth
async isSlotAvailable(botId: string, date: string, time: string): Promise<boolean> {
  const availability = await this.getProviderAvailability(botId);
  const bookings = await this.getBookingsForDate(botId, date);
  
  const isOccupied = bookings.some(b => 
    b.timeSlot === time && ['pending', 'confirmed'].includes(b.status)
  );
  
  return !isOccupied;
}
```

**Why Safe:** Database is always authoritative. No cache dependency.

---

## FORBIDDEN PATTERN 3: Invalidation Infrastructure

### What It Is

Building a system to invalidate cache when availability changes.

```typescript
// ❌ FORBIDDEN
@Injectable()
class SlotInvalidationService {
  async invalidateSlotCache(botId: string, date: string, time: string) {
    const key = `availability:${botId}:${date}:${time}`;
    await this.redis.del(key);
  }
  
  async invalidateAvailabilityCache(botId: string, date: string) {
    const pattern = `availability:${botId}:${date}:*`;
    await this.redis.keys(pattern).then(keys => 
      this.redis.del(...keys)
    );
  }
  
  async onBookingCreated(booking: Booking) {
    // Invalidate cache when booking created
    await this.invalidateSlotCache(
      booking.botId,
      booking.date,
      booking.timeSlot
    );
  }
}
```

### Why It Appears Attractive

- "Cache needs invalidation to stay fresh"
- "We need cache consistency"
- "Event-driven invalidation is modern"
- "Industry uses cache invalidation patterns"

### How It Corrupts Architecture

1. **Invalidation logic complexity** — Must invalidate all related keys
2. **Race conditions** — Read during invalidation = stale data
3. **Message loss** — Invalidation event lost = stale cache
4. **Partial invalidation** — Some keys updated, some not
5. **Monitoring needed** — Detect stale cache
6. **Reconciliation required** — Fix stale cache

### Architectural Corruption Chain

```
Cache invalidation logic
    ↓
Event system for invalidation
    ↓
Message queue for events
    ↓
Invalidation failure handling
    ↓
Stale cache detection
    ↓
Cache reconciliation jobs
    ↓
Invalidation becomes critical path
```

### Safe Alternative

```typescript
// ✅ CORRECT: No invalidation needed
async getAvailableSlots(botId: string, date: string): Promise<string[]> {
  // Always compute from database
  // No cache = no invalidation
  return this.computeSlots(botId, date);
}
```

**Why Safe:** Recomputation is simpler than invalidation.

---

## FORBIDDEN PATTERN 4: Projection Synchronization

### What It Is

Background jobs that synchronize computed projections with database.

```typescript
// ❌ FORBIDDEN
@Injectable()
class ProjectionSyncService {
  @Cron('*/1 * * * *')  // Every minute
  async syncProjections() {
    const bookings = await this.bookingRepository.find({
      where: { status: In(['pending', 'confirmed']) }
    });
    
    for (const booking of bookings) {
      const key = `projection:${booking.botId}:${booking.date}`;
      const projection = await this.redis.get(key);
      
      if (!projection || !projection.includes(booking.timeSlot)) {
        await this.redis.set(key, projection + `,${booking.timeSlot}`);
      }
    }
  }
}
```

### Why It Appears Attractive

- "Pre-compute projections for speed"
- "Background jobs are efficient"
- "Separation of concerns"
- "Industry uses projection tables"

### How It Corrupts Architecture

1. **Sync lag** — Projections lag behind reality
2. **Sync failures** — Jobs fail, projections stale
3. **Race conditions** — Read during sync = inconsistent
4. **Stale projections** — Old data = wrong availability
5. **Sync complexity** — Handle conflicts, partial updates
6. **Infrastructure overhead** — Cron, queues, monitoring

### Architectural Corruption Chain

```
Background sync jobs
    ↓
Projection tables
    ↓
Sync failure handling
    ↓
Stale projection detection
    ↓
Sync reconciliation
    ↓
Projection orchestration
    ↓
Temporal infrastructure emerges
```

### Safe Alternative

```typescript
// ✅ CORRECT: Compute on each request
async getAvailableSlots(botId: string, date: string): Promise<string[]> {
  // Fresh computation every time
  return this.computeSlots(botId, date);
}
```

**Why Safe:** No sync needed. Always fresh.

---

## FORBIDDEN PATTERN 5: Reactive Recomputation

### What It Is

Event-driven system that triggers recomputation when data changes.

```typescript
// ❌ FORBIDDEN
@Injectable()
class ReactiveAvailabilityService {
  constructor(
    @InjectEvent('booking.created')
    private bookingCreatedEvent: EventStream<BookingCreated>,
    
    @InjectEvent('booking.cancelled')
    private bookingCancelledEvent: EventStream<BookingCancelled>
  ) {}
  
  @OnEvent('booking.created')
  async onBookingCreated(event: BookingCreated) {
    // Trigger recomputation
    await this.recomputeSlots(event.botId, event.date);
  }
  
  async recomputeSlots(botId: string, date: string) {
    const slots = await this.computeSlots(botId, date);
    await this.cache.set(`slots:${botId}:${date}`, slots);
  }
}
```

### Why It Appears Attractive

- "Reactive architecture is modern"
- "Event-driven is scalable"
- "Automatic recomputation"
- "Separation of concerns"

### How It Corrupts Architecture

1. **Event loss** — Events lost = stale cache
2. **Event ordering** — Wrong order = wrong state
3. **Reprocessing** — Duplicate events = duplicate work
4. **Eventual consistency** — System not consistent
5. **Event infrastructure** — Kafka, RabbitMQ, monitoring
6. **Reactive complexity** — Handle failures, retries

### Architectural Corruption Chain

```
Event-driven recomputation
    ↓
Event infrastructure
    ↓
Event ordering guarantees
    ↓
Event failure handling
    ↓
Eventual consistency
    ↓
Reactive orchestration
    ↓
Temporal event system
```

### Safe Alternative

```typescript
// ✅ CORRECT: Synchronous computation
async createBooking(bookingData: CreateBookingDto): Promise<Booking> {
  // Check availability synchronously
  const isAvailable = await this.isSlotAvailable(
    bookingData.botId,
    bookingData.date,
    bookingData.timeSlot
  );
  
  if (!isAvailable) throw new Error('Slot not available');
  
  // Create booking
  const booking = this.bookingRepository.create(bookingData);
  await this.bookingRepository.save(booking);
  
  return booking;
}
```

**Why Safe:** Synchronous, consistent, simple.

---

## FORBIDDEN PATTERN 6: Temporal Event Orchestration

### What It Is

Using events to orchestrate temporal state transitions.

```typescript
// ❌ FORBIDDEN
@Injectable()
class TemporalOrchestrationService {
  constructor(
    @InjectEvent('booking.pending')
    private pendingEvent: EventStream<BookingPending>,
    
    @InjectEvent('booking.expired')
    private expiredEvent: EventStream<BookingExpired>
  ) {}
  
  @OnEvent('booking.pending')
  async onBookingPending(event: BookingPending) {
    // Schedule expiration check
    await this.scheduler.schedule(
      event.bookingId,
      'checkExpiration',
      event.expirationTime
    );
  }
  
  @OnEvent('booking.expired')
  async onBookingExpired(event: BookingExpired) {
    // Auto-cancel expired booking
    await this.cancelBooking(event.bookingId);
  }
}
```

### Why It Appears Attractive

- "Automate time-based workflows"
- "Event orchestration is powerful"
- "Automatic expiration"
- "Temporal automation"

### How It Corrupts Architecture

1. **Time orchestrates state** — Time becomes authority
2. **Hidden transitions** — State changes when no one watches
3. **Scheduler complexity** — Queue, timing, failures
4. **Eventual consistency** — State not consistent
5. **Temporal daemon** — Background processes forever
6. **Framework drift** — Booking becomes workflow engine

### Architectural Corruption Chain

```
Temporal event handlers
    ↓
Scheduled tasks
    ↓
Time-based automation
    ↓
Workflow orchestration
    ↓
Temporal daemon
    ↓
Workflow engine emerges
```

### Safe Alternative

```typescript
// ✅ CORRECT: Owner explicitly acts
async cancelBooking(bookingId: string): Promise<Booking> {
  const booking = await this.getBooking(bookingId);
  
  // Owner explicitly cancels
  booking.status = 'cancelled';
  await this.bookingRepository.save(booking);
  
  return booking;
}
```

**Why Safe:** Owner action, not time, mutates state.

---

## FORBIDDEN PATTERN 7: Queue-Driven Scheduling

### What It Is

Using message queues to schedule booking-related work.

```typescript
// ❌ FORBIDDEN
@Injectable()
class BookingQueueService {
  constructor(
    @InjectQueue('booking-availability')
    private availabilityQueue: Queue<BookingAvailabilityJob>
  ) {}
  
  async checkAvailability(botId: string, date: string, time: string) {
    // Enqueue availability check
    await this.availabilityQueue.add({
      botId,
      date,
      time,
      type: 'availability_check'
    });
  }
}
```

### Why It Appears Attractive

- "Queues improve performance"
- "Asynchronous processing"
- "Scalable architecture"
- "Industry standard pattern"

### How It Corrupts Architecture

1. **Async availability** — Availability not immediate
2. **Queue failures** — Jobs lost, availability stale
3. **Queue ordering** — Wrong order = wrong availability
4. **Queue infrastructure** — Redis, RabbitMQ, monitoring
5. **Eventual consistency** — System not consistent
6. **Queue complexity** — Handle retries, failures, poison messages

### Architectural Corruption Chain

```
Queue for performance
    ↓
Async availability checks
    ↓
Queue infrastructure
    ↓
Queue failure handling
    ↓
Eventual consistency
    ↓
Queue orchestration
    ↓
Temporal queue system
```

### Safe Alternative

```typescript
// ✅ CORRECT: Synchronous availability check
async checkAvailability(botId: string, date: string, time: string): Promise<boolean> {
  // Direct computation
  return this.isSlotAvailable(botId, date, time);
}
```

**Why Safe:** Synchronous, consistent, no infrastructure.

---

## SUMMARY TABLE

| Pattern | Complexity | Risk | Infrastructure | Safe Alternative |
|---------|-----------|------|----------------|------------------|
| Slot materialization | HIGH | HIGH | DB tables | Recompute |
| Cache-as-truth | HIGH | HIGH | Redis | DB queries |
| Invalidation infrastructure | VERY HIGH | VERY HIGH | Events + Queue | No cache |
| Projection synchronization | VERY HIGH | HIGH | Cron + Jobs | Per-request |
| Reactive recomputation | VERY HIGH | HIGH | Events + Queue | Synchronous |
| Temporal orchestration | VERY HIGH | VERY HIGH | Scheduler | Owner action |
| Queue-driven scheduling | HIGH | MEDIUM | Message Queue | Direct compute |

---

## VALIDATION GATES

### Gate 1: No Slot Materialization

```bash
grep -r "@Entity.*slot\|slot.*table\|slotRepository" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Cache Authority

```bash
grep -r "redis.*slot\|cache.*available\|cache.*truth" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Invalidation

```bash
grep -r "invalidate.*slot\|clearSlotCache\|removeSlot" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Projection Sync

```bash
grep -r "syncProjections\|projection.*sync\|background.*slot" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Reactive Recomputation

```bash
grep -r "@OnEvent.*booking\|recompute.*event\|reactive.*slot" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 6: No Temporal Orchestration

```bash
grep -r "temporal.*orchestration\|schedule.*booking\|time.*orchestration" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 7: No Queue-Driven Scheduling

```bash
grep -r "queue.*slot\|queue.*availability\|QueueService" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — UNIT 03 — 2026-05-23**
