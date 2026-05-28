# Infrastructure Drift Containment

**Purpose:** Explicitly validate that NO pressure scenario justifies forbidden infrastructure  
**Status:** CANONICAL — Tier 4 Audit  
**Version:** 1.0  
**Unit:** 06 — Concurrency & Reliability Validation  **Date:** 2026-05-23

---

## AUDIT METHODOLOGY

For each forbidden infrastructure direction:
1. Identify the pressure scenario that might justify it
2. Explain why it appears attractive
3. Explain why it is unnecessary
4. Explain how current architecture handles the problem safely
5. Confirm: NO SCENARIO JUSTIFIES THIS INFRASTRUCTURE

---

## FORBIDDEN 1: Redis

### Pressure Scenario
"Computing slots on every request is slow. Let's cache slots in Redis."

### Why It Appears Attractive
- "Fast" reads from cache
- "Scalable" shared state
- "Industry standard" for caching

### Why It Is Unnecessary
- Slot computation is ~3-5ms per request
- At 1000 requests/day = 5 seconds of compute
- Database queries are already fast (indexed)
- No performance problem exists

### How Current Architecture Handles It
```typescript
// Recompute per request — trivial cost
async getAvailableSlots(botId: string, date: string) {
  const availability = await this.providerAvailabilityRepository.findOne({ where: { botId } });
  const bookings = await this.bookingRepository.find({ where: { botId, date } });
  return this.computeSlots(availability, bookings);  // ~3ms
}
```

### Risk If Added
- Cache becomes secondary truth
- Cache invalidation complexity
- Stale cache = double-booking risk
- Infrastructure dependency

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 2: Distributed Locks

### Pressure Scenario
"Two customers might book the same slot simultaneously. Let's use distributed locks."

### Why It Appears Attractive
- "Guarantees" exclusive access
- "Prevents" race conditions
- "Industry standard" for concurrency

### Why It Is Unnecessary
- Database unique constraint already prevents double-booking
- PostgreSQL transactions serialize writes
- Distributed locks add complexity without value
- Single-database scenario = no distribution needed

### How Current Architecture Handles It
```typescript
// DB constraint is the lock
@Unique(['botId', 'date', 'timeSlot', 'status'])
class Booking { ... }

// Race condition handled by constraint
try {
  await this.bookingRepository.save(booking);
} catch (error) {
  if (isUniqueViolation(error)) {
    throw new Error('Slot just booked');  // Graceful
  }
}
```

### Risk If Added
- Redis dependency
- Lock timeout complexity
- Deadlock risk
- Network partition handling
- Infrastructure explosion

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 3: Queues

### Pressure Scenario
"Booking creation might fail under load. Let's queue booking requests."

### Why It Appears Attractive
- "Buffers" load spikes
- "Reliable" delivery
- "Scalable" processing

### Why It Is Unnecessary
- Booking creation is ~10ms
- PostgreSQL handles concurrent writes
- No load spike problem exists
- Queue adds latency and complexity

### How Current Architecture Handles It
```typescript
// Direct processing — fast and simple
async createBooking(data: CreateBookingDto) {
  const booking = this.bookingRepository.create(data);
  await this.bookingRepository.save(booking);  // ~10ms
  return booking;
}
```

### Risk If Added
- Queue infrastructure (Bull, RabbitMQ)
- Worker processes
- Retry logic
- Dead letter queues
- Monitoring complexity
- Increased latency

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 4: Reservation Engines

### Pressure Scenario
"Customer selects slot but doesn't complete booking. Let's reserve the slot temporarily."

### Why It Appears Attractive
- "Prevents" slot from being taken during flow
- "Improves" UX
- "Industry standard" (hotels, airlines)

### Why It Is Unnecessary
- Booking flow is simple (select date → select time → confirm)
- No complex multi-step flow
- Pessimistic occupancy (pending occupies) already prevents double-booking
- Reservation adds state machine complexity

### How Current Architecture Handles It
```typescript
// Customer creates booking directly
// Pending status occupies slot immediately
// No reservation needed
async createBooking(data: CreateBookingDto) {
  const booking = this.bookingRepository.create({
    ...data,
    status: 'pending',  // Occupies immediately
  });
  await this.bookingRepository.save(booking);
}
```

### Risk If Added
- Reservation entity
- Expiration logic
- Cleanup workers
- TTL management
- State machine complexity
- Ghost reservations

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 5: Kafka

### Pressure Scenario
"We need event-driven architecture for booking events."

### Why It Appears Attractive
- "Event-driven" is modern
- "Decoupled" services
- "Scalable" event processing

### Why It Is Unnecessary
- Platform is monolithic NestJS app
- No distributed services
- No event consumers outside app
- Direct method calls are simpler

### How Current Architecture Handles It
```typescript
// Direct service calls within monolith
async createBooking(data: CreateBookingDto) {
  const booking = await this.bookingRepository.save(data);
  await this.analytics.trackEvent('booking.created', { bookingId: booking.id });
  // Direct call, no event bus needed
}
```

### Risk If Added
- Kafka cluster
- Topic management
- Consumer groups
- Schema registry
- Operational complexity
- Debugging nightmare

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 6: Saga Systems

### Pressure Scenario
"Rescheduling involves multiple steps. Let's use saga pattern for reliability."

### Why It Appears Attractive
- "Reliable" multi-step operations
- "Compensating" transactions
- "Distributed" transaction pattern

### Why It Is Unnecessary
- Rescheduling is a single UPDATE
- No multi-step distributed operation
- PostgreSQL transaction is sufficient
- Saga is overkill for single-table update

### How Current Architecture Handles It
```typescript
// Single transaction
async rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
  await this.dataSource.transaction(async manager => {
    const booking = await manager.findOne(Booking, { where: { id: bookingId } });
    booking.date = newDate;
    booking.timeSlot = newTime;
    await manager.save(booking);
  });
}
```

### Risk If Added
- Saga orchestrator
- Compensation logic
- State machine
- Timeout handling
- Complexity explosion

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 7: Synchronization Layers

### Pressure Scenario
"Dashboard needs to stay in sync with booking state. Let's build a sync layer."

### Why It Appears Attractive
- "Real-time" dashboard
- "Consistent" views
- "Fresh" data

### Why It Is Unnecessary
- Dashboard is observational, not operational
- Manual refresh is acceptable
- No business decision made from dashboard
- Stale dashboard is UX issue, not data issue

### How Current Architecture Handles It
```typescript
// Dashboard recomputes per request
@Get(':id/overview')
async getOverview(@Param('id') botId: string) {
  return this.dashboardService.getBotState(botId);  // Fresh per request
}
```

### Risk If Added
- Sync infrastructure
- Cache invalidation
- Event listeners
- WebSocket connections
- Complexity for no operational benefit

**VERDICT:** ❌ NOT JUSTIFIED

---

## FORBIDDEN 8: Temporal Coordinators

### Pressure Scenario
"Past bookings should auto-complete. Let's build a temporal coordinator."

### Why It Appears Attractive
- "Automated" state management
- "No manual" intervention
- "Smart" platform

### Why It Is Unnecessary
- Time must not mutate state (platform law)
- Owner explicitly completes bookings
- Background workers violate architecture
- No temporal automation allowed

### How Current Architecture Handles It
```typescript
// Owner explicitly completes
async completeBooking(botId: string, bookingId: string) {
  const booking = await this.getBooking(bookingId);
  if (booking.status !== 'confirmed') throw new Error('Cannot complete');
  booking.status = 'completed';
  await this.save(booking);
}
```

### Risk If Added
- Cron jobs
- Background workers
- Temporal state machine
- Automation drift
- Platform becomes orchestrator

**VERDICT:** ❌ NOT JUSTIFIED (ALSO ARCHITECTURALLY FORBIDDEN)

---

## SUMMARY TABLE

| Infrastructure | Pressure Scenario | Why Unnecessary | Current Solution | Justified? |
|----------------|-------------------|-----------------|------------------|------------|
| **Redis** | Slow slot computation | Computation is 3ms | Recompute per request | ❌ NO |
| **Distributed Locks** | Double-booking race | DB constraint handles it | Unique constraint | ❌ NO |
| **Queues** | Load spikes | No spike problem | Direct processing | ❌ NO |
| **Reservation Engine** | Slot reservation during flow | No complex flow | Direct booking creation | ❌ NO |
| **Kafka** | Event-driven architecture | Monolith, no consumers | Direct method calls | ❌ NO |
| **Saga Systems** | Multi-step rescheduling | Single UPDATE | Single transaction | ❌ NO |
| **Sync Layers** | Dashboard freshness | Observational only | Recompute per request | ❌ NO |
| **Temporal Coordinators** | Auto-complete bookings | Time must not mutate state | Owner explicit action | ❌ NO |

---

## KEY FINDING

**NO PRESSURE SCENARIO JUSTIFIES FORBIDDEN INFRASTRUCTURE.**

Current architecture (database constraints + write-time validation + recomputation + graceful errors) safely handles all realistic concurrency scenarios without additional infrastructure.

---

**Version 1.0 — UNIT 06 — 2026-05-23**
