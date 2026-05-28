# Temporal Automation Drift

**Purpose:** Explicitly ban temporal automation patterns that cause architectural corruption  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0  
**Date:** 2026-05-23

---

## THE DRIFT THREAT

Booking systems naturally drift into automation. This document exists to prevent that drift.

**The pattern:**
```
"This is manual. Let's automate it."
    ↓
Background worker created
    ↓
Temporal complexity emerges
    ↓
Scheduling infrastructure appears
    ↓
Platform becomes orchestration system
```

**This MUST be prevented.**

---

## FORBIDDEN PATTERN 1: Automatic Pending Expiration

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class PendingExpirationWorker {
  @Cron('*/5 * * * *')
  async expireStalePendingBookings() {
    const staleBookings = await this.bookingRepository.find({
      where: {
        status: 'pending',
        createdAt: LessThan(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      },
    });
    
    for (const booking of staleBookings) {
      booking.status = 'cancelled';
      await this.bookingRepository.save(booking);
      this.logger.log(`Auto-cancelled pending booking ${booking.id}`);
    }
  }
}
```

### Why It Is Dangerous

1. **Hidden temporal mutation:** Time itself mutates booking state. This violates "time is not authority."
2. **Owner disempowerment:** Owner loses control over which bookings are cancelled.
3. **Customer confusion:** Customer's booking disappears without explanation.
4. **Cleanup pressure emergence:** Once you have one cleanup worker, you need more.
5. **Scheduler drift:** Cron jobs become scheduling infrastructure.

### Architectural Corruption

```
PendingExpirationWorker
    ↓
Cron infrastructure
    ↓
More workers (cleanup, sync, reconcile)
    ↓
Scheduling platform emerges
```

### Safe Alternative

```typescript
// ✅ CORRECT: Owner manual cancellation
class BookingRuntimeService {
  async cancelBooking(botId: string, bookingId: string, reason?: string) {
    const booking = await this.getBooking(bookingId);
    
    // Owner explicitly cancels
    booking.status = 'cancelled';
    await this.save(booking);
    
    // Audit trail
    await this.analytics.trackEvent('booking.cancelled', {
      bookingId,
      reason: reason || 'owner_cancelled',
    });
  }
}
```

**Owner opens dashboard → sees stale pending bookings → clicks "Cancel" on each.**

---

## FORBIDDEN PATTERN 2: Automatic Slot Release

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class SlotReleaseService {
  async releaseSlotIfStale(botId: string, date: string, timeSlot: string) {
    const booking = await this.bookingRepository.findOne({
      where: { botId, date, timeSlot, status: 'pending' },
    });
    
    if (booking && this.isStale(booking)) {
      // Automatically release slot
      await this.bookingRepository.delete(booking.id);
    }
  }
}
```

### Why It Is Dangerous

1. **Slot doesn't exist:** You can't release something that doesn't exist. Slots are projections.
2. **Truth corruption:** Deleting bookings destroys audit trail.
3. **Race conditions:** What if owner is about to confirm?
4. **Implicit authority:** Time decides when slot is "released."

### Architectural Corruption

```
SlotReleaseService
    ↓
Slot lifecycle emerges
    ↓
Slot state machine
    ↓
Reservation framework
```

### Safe Alternative

```typescript
// ✅ CORRECT: Owner cancels booking
// Slot is automatically "released" because status changes to 'cancelled'
// No separate release action needed
```

---

## FORBIDDEN PATTERN 3: Temporal Cleanup Daemons

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class TemporalCleanupDaemon {
  @Cron('0 * * * *')
  async cleanupTemporalState() {
    // Clean up orphaned bookings
    // Clean up stale user states
    // Clean up expired reservations
    // Clean up abandoned flows
    // ...
  }
}
```

### Why It Is Dangerous

1. **Implicit state mutation:** Background processes mutate state without owner action.
2. **Unpredictable behavior:** State changes when no one is watching.
3. **Debugging nightmare:** Why did this booking disappear? Check the daemon logs.
4. **Infrastructure creep:** One daemon becomes many.

### Architectural Corruption

```
TemporalCleanupDaemon
    ↓
More daemons
    ↓
Daemon orchestration
    ↓
Distributed system
```

### Safe Alternative

```typescript
// ✅ CORRECT: No cleanup needed
// Database state is truth. If state exists, it's truth.
// Owner manually manages stale bookings.
// No background cleanup.
```

---

## FORBIDDEN PATTERN 4: Scheduler Workers

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class BookingScheduler {
  @Cron('*/1 * * * *')
  async processScheduledBookings() {
    const now = new Date();
    const upcoming = await this.bookingRepository.find({
      where: {
        date: format(now, 'yyyy-MM-dd'),
        timeSlot: format(now, 'HH:mm'),
        status: 'confirmed',
      },
    });
    
    for (const booking of upcoming) {
      await this.notifyOwner(booking);
      await this.markAsInProgress(booking);
    }
  }
}
```

### Why It Is Dangerous

1. **Time as authority:** Time triggers business actions.
2. **Lifecycle automation:** Bookings automatically transition states.
3. **Orchestration emergence:** Scheduler becomes workflow engine.
4. **Distributed complexity:** What if scheduler crashes? What if it runs twice?

### Architectural Corruption

```
BookingScheduler
    ↓
Workflow engine
    ↓
Temporal orchestration
    ↓
Platform becomes scheduling system
```

### Safe Alternative

```typescript
// ✅ CORRECT: Owner manually confirms/completes
// No automatic state transitions
// Owner decides when booking is "in progress" or "completed"
```

---

## FORBIDDEN PATTERN 5: Temporal Reconciliation Jobs

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class TemporalReconciliationJob {
  @Cron('0 0 * * *')
  async reconcileBookings() {
    // Find bookings where status doesn't match temporal reality
    const inconsistent = await this.bookingRepository.find({
      where: {
        status: 'confirmed',
        date: LessThan(format(new Date(), 'yyyy-MM-dd')),
      },
    });
    
    for (const booking of inconsistent) {
      // Automatically fix inconsistency
      booking.status = 'completed';
      await this.bookingRepository.save(booking);
    }
  }
}
```

### Why It Is Dangerous

1. **Truth corruption:** Automated reconciliation may fix things that aren't broken.
2. **Hidden assumptions:** "Past confirmed bookings should be completed" is an assumption.
3. **Owner disempowerment:** Owner loses control over status transitions.
4. **Audit trail destruction:** Automatic changes lack context.

### Architectural Corruption

```
TemporalReconciliationJob
    ↓
Reconciliation framework
    ↓
Self-healing system
    ↓
Autonomous platform
```

### Safe Alternative

```typescript
// ✅ CORRECT: Owner manually completes past bookings
// Or leaves them as "confirmed" until explicitly completed
// No automatic reconciliation
```

---

## FORBIDDEN PATTERN 6: Reservation Synchronization

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class ReservationSyncService {
  async syncReservations() {
    // Sync with external calendar
    // Sync with external booking system
    // Sync with external scheduler
    // ...
  }
}
```

### Why It Is Dangerous

1. **Distributed complexity:** Multiple sources of truth.
2. **Eventual consistency:** Sync delays create inconsistencies.
3. **Conflict resolution:** Who wins when systems disagree?
4. **Infrastructure explosion:** Sync services, queues, retries.

### Architectural Corruption

```
ReservationSyncService
    ↓
Sync framework
    ↓
Event bus
    ↓
Distributed system
```

### Safe Alternative

```typescript
// ✅ CORRECT: Single source of truth (database)
// No external sync
// If external integration needed: webhook push, not sync
```

---

## FORBIDDEN PATTERN 7: Heartbeat Systems

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class BookingHeartbeatService {
  @Cron('*/30 * * * *')
  async checkBookingHeartbeats() {
    const stale = await this.bookingRepository.find({
      where: {
        lastHeartbeat: LessThan(new Date(Date.now() - 60 * 60 * 1000)),
      },
    });
    
    for (const booking of stale) {
      booking.status = 'cancelled';
      await this.bookingRepository.save(booking);
    }
  }
}
```

### Why It Is Dangerous

1. **Implicit lifecycle:** Heartbeats create hidden lifecycle.
2. **Failure mode:** What if heartbeat fails? Booking auto-cancels.
3. **Complexity:** Heartbeat infrastructure, retry logic, failure handling.
4. **Distributed coordination:** Heartbeats imply distributed state.

### Architectural Corruption

```
BookingHeartbeatService
    ↓
Distributed coordination
    ↓
Consensus system
    ↓
Distributed locking
```

### Safe Alternative

```typescript
// ✅ CORRECT: No heartbeat needed
// Booking state is persistent
// No need to "keep alive"
// Owner manually cancels if needed
```

---

## FORBIDDEN PATTERN 8: Slot Refresh Loops

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class SlotRefreshService {
  @Cron('*/1 * * * *')
  async refreshSlots() {
    for (const bot of await this.botRepository.find()) {
      const slots = await this.computeSlots(bot.id);
      await this.cache.set(`slots:${bot.id}`, slots);
    }
  }
}
```

### Why It Is Dangerous

1. **Cache-as-truth:** Cached slots become source of truth.
2. **Stale data:** Refresh interval creates window of inconsistency.
3. **Infrastructure:** Cache invalidation, refresh coordination.
4. **Materialization:** Pre-computing slots is materialization.

### Architectural Corruption

```
SlotRefreshService
    ↓
Cache infrastructure
    ↓
Cache invalidation complexity
    ↓
Distributed cache
```

### Safe Alternative

```typescript
// ✅ CORRECT: Compute slots on-demand
// No caching
// No refresh
// Each request computes fresh slots from truth
```

---

## FORBIDDEN PATTERN 9: Reservation Keepalive

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class ReservationKeepaliveService {
  @Cron('*/10 * * * *')
  async extendReservations() {
    const expiring = await this.reservationRepository.find({
      where: {
        expiresAt: LessThan(new Date(Date.now() + 5 * 60 * 1000)),
      },
    });
    
    for (const reservation of expiring) {
      reservation.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await this.reservationRepository.save(reservation);
    }
  }
}
```

### Why It Is Dangerous

1. **Reservation abstraction:** Creates reservation entity (not booking).
2. **Temporal complexity:** Expiration, extension, TTL management.
3. **State machine:** Reservation has lifecycle (created, extended, expired).
4. **Infrastructure:** Cron jobs, expiration tracking.

### Architectural Corruption

```
ReservationKeepaliveService
    ↓
Reservation framework
    ↓
TTL management
    ↓
Temporal orchestration
```

### Safe Alternative

```typescript
// ✅ CORRECT: No reservations
// Customer creates booking directly
// Booking is the only temporal entity
// No expiration, no keepalive
```

---

## FORBIDDEN PATTERN 10: Distributed Temporal Ownership

### What It Is

```typescript
// ❌ FORBIDDEN
@Injectable()
class DistributedTemporalOwnershipService {
  async claimTemporalOwnership(botId: string, date: string, time: string) {
    const lock = await this.distributedLock.acquire(`temporal:${botId}:${date}:${time}`);
    
    try {
      // Perform temporal operation
    } finally {
      await this.distributedLock.release(lock);
    }
  }
}
```

### Why It Is Dangerous

1. **Distributed complexity:** Locking, consensus, failure handling.
2. **Infrastructure:** Redis, ZooKeeper, etcd.
3. **Temporal authority:** Distributed locks imply distributed truth.
4. **Failure modes:** What if lock holder crashes? What if network partitions?

### Architectural Corruption

```
DistributedTemporalOwnershipService
    ↓
Distributed locking
    ↓
Consensus protocol
    ↓
Distributed system
```

### Safe Alternative

```typescript
// ✅ CORRECT: Database is single source of truth
// Unique constraint prevents double-booking
// No distributed locking needed
// Transactional guarantees from PostgreSQL
```

---

## SUMMARY TABLE

| Forbidden Pattern | Danger | Safe Alternative |
|-------------------|--------|------------------|
| Automatic pending expiration | Time mutates state | Owner manual cancellation |
| Automatic slot release | Slot lifecycle emerges | Owner cancels booking |
| Temporal cleanup daemons | Hidden state mutation | No cleanup needed |
| Scheduler workers | Orchestration emerges | Owner manual actions |
| Temporal reconciliation | Truth corruption | No auto-reconciliation |
| Reservation synchronization | Distributed complexity | Single source of truth |
| Heartbeat systems | Implicit lifecycle | No heartbeat needed |
| Slot refresh loops | Cache-as-truth | Compute on-demand |
| Reservation keepalive | Reservation framework | Direct booking creation |
| Distributed temporal ownership | Distributed complexity | Database constraints |

---

## CANONICAL RULES

### Rule 1: No Automatic Temporal Mutation

Time itself must NEVER mutate booking state.

### Rule 2: No Background Workers

No cron jobs, no daemons, no workers for booking state.

### Rule 3: No Cleanup Infrastructure

Database state is truth. If state exists, it's truth.

### Rule 4: No Scheduler Services

No automatic state transitions based on time.

### Rule 5: No Reservation Abstraction

Booking is the only temporal entity. No reservations.

### Rule 6: No Distributed Coordination

Database constraints handle concurrency. No locks.

### Rule 7: No Cache-as-Truth

Compute on-demand. No slot caching.

### Rule 8: Owner Is Authority

Owner actions mutate state. Not time. Not automation.

---

## VALIDATION GATES

### Gate 1: No Cron Jobs

```bash
grep -r "@Cron\|@Interval\|@Timeout" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Background Workers

```bash
grep -r "Worker\|Daemon\|BackgroundService" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Reservation Entities

```bash
grep -r "class Reservation\|reservationRepository" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Distributed Locks

```bash
grep -r "distributedLock\|redis.*lock\|acquireLock" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Expiration Logic

```bash
grep -r "expiresAt\|expiration\|TTL\|timeout.*booking" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
