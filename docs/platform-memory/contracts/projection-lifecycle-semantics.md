# Projection Lifecycle Semantics

**Purpose:** Define projection lifecycle and forbidden persistence  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Phase:** PRE-UNIT-04 Stabilization  
**Date:** 2026-05-23

---

## SECTION 1 — PROJECTION LIFECYCLE

### Lifecycle Flow

```
Truth Changes
    │
    ├── Database mutation (booking created)
    ├── Status change (booking confirmed)
    └── Exclusion added (holiday added)
    │
    ▼
Projection Recomputed
    │
    ├── Query truth from database
    ├── Compute availability
    ├── Compute occupancy
    └── Derive projection
    │
    ▼
Projection Rendered
    │
    ├── Sent to client
    ├── Displayed in UI
    └── Formatted for user
    │
    ▼
Projection Discarded
    │
    ├── Memory freed
    ├── No persistence
    └── No synchronization
```

### Key Property

**Projection lifecycle is: ephemeral. Projections exist only during request processing.**

---

## SECTION 2 — TRUTH CHANGES

### What Triggers Recomputation

| Change | Trigger | Recomputation Scope |
|--------|---------|-------------------|
| **Booking created** | Database insert | Slots for date, booking lists |
| **Booking status changed** | Database update | Status distributions, lists |
| **Availability updated** | Database update | All slots for bot |
| **Excluded date added** | Database update | Slots for specific date |
| **Customer profile updated** | Database update | Customer displays |

### Code Example: Truth Change

```typescript
// ✅ CORRECT: Truth change in runtime service
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    // Truth changes: booking created
    const booking = this.bookingRepository.create(data);
    await this.bookingRepository.save(booking);
    
    // Next request will recompute projection
    return booking;
  }
}
```

---

## SECTION 3 — PROJECTION RECOMPUTED

### Recomputation Flow

```typescript
// ✅ CORRECT: Projection recomputed per request
class BookingQueryService {
  async getAvailableSlots(botId: string, date: string): Promise<string[]> {
    // Step 1: Query truth
    const availability = await this.availabilityRepository.findOne({
      where: { botId },
    });
    
    const bookings = await this.bookingRepository.find({
      where: { botId, date },
    });
    
    // Step 2: Compute availability
    const allSlots = this.generateSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration
    );
    
    // Step 3: Compute occupancy
    const occupied = bookings
      .filter(b => ['pending', 'confirmed'].includes(b.status))
      .map(b => b.timeSlot);
    
    // Step 4: Derive projection
    return allSlots.filter(slot => !occupied.includes(slot));
  }
}
```

---

## SECTION 4 — PROJECTION RENDERED

### Rendering Flow

```typescript
// ✅ CORRECT: Projection rendered in controller
@Controller('miniapp/bots')
class BookingDashboardController {
  @Get(':id/bookings/slots')
  async getAvailableSlots(
    @Param('id') botId: string,
    @Query('date') date: string,
  ) {
    // Projection is computed and rendered
    const slots = await this.bookingQueryService.getAvailableSlots(botId, date);
    
    // Sent to client as JSON
    return { slots };
  }
}
```

---

## SECTION 5 — PROJECTION DISCARDED

### What Happens After Rendering

| Action | Result |
|--------|--------|
| **Response sent** | Projection data sent to client |
| **Memory freed** | Server-side projection discarded |
| **No persistence** | Projection not saved anywhere |
| **No synchronization** | Projection not synced to other systems |

### Code Example: Projection Discarded

```typescript
// ✅ CORRECT: Projection is ephemeral
@Controller('miniapp/bots')
class BookingDashboardController {
  @Get(':id/bookings/slots')
  async getAvailableSlots(
    @Param('id') botId: string,
    @Query('date') date: string,
  ) {
    const slots = await this.bookingQueryService.getAvailableSlots(botId, date);
    
    // Projection sent to client
    return { slots };
    
    // After return:
    // - slots array is garbage collected
    // - No persistence
    // - No synchronization
  }
}
```

---

## SECTION 6 — WHAT PROJECTION MUST NEVER DO

### Forbidden: Persist Independently

```typescript
// ❌ FORBIDDEN: Projection persisted
@Injectable()
class SlotProjectionService {
  async saveProjection(botId: string, date: string, slots: string[]) {
    // ❌ FORBIDDEN: Projection persisted
    await this.projectionRepository.save({
      botId,
      date,
      slots,
      computedAt: new Date(),
    });
  }
}
```

**Why Forbidden:**
- Projection becomes secondary truth
- Stale data risk
- Synchronization needed
- Cache invalidation required

---

### Forbidden: Synchronize

```typescript
// ❌ FORBIDDEN: Projection synchronized
@Injectable()
class SlotSyncService {
  async syncProjections(botId: string) {
    const slots = await this.computeSlots(botId);
    
    // ❌ FORBIDDEN: Projection synchronized across systems
    await this.redis.set(`slots:${botId}`, JSON.stringify(slots));
    await this.cache.set(`slots:${botId}`, slots);
  }
}
```

**Why Forbidden:**
- Projection becomes shared state
- Consistency issues
- Race conditions
- Coordination complexity

---

### Forbidden: Reconcile

```typescript
// ❌ FORBIDDEN: Projection reconciled
@Injectable()
class ProjectionReconciliationService {
  @Cron('0 * * * *')
  async reconcileProjections() {
    // ❌ FORBIDDEN: Reconcile projection with truth
    const projectedSlots = await this.projectionRepository.find();
    const actualBookings = await this.bookingRepository.find();
    
    for (const projection of projectedSlots) {
      if (projection.slots.length !== actualBookings.length) {
        await this.updateProjection(projection);  // Reconciliation!
      }
    }
  }
}
```

**Why Forbidden:**
- Projection needs reconciliation
- Background jobs required
- Complexity explosion
- System depends on projection

---

### Forbidden: Own State

```typescript
// ❌ FORBIDDEN: Projection owns state
@Injectable()
class SlotStateService {
  private slotState: Map<string, string[]> = new Map();
  
  async updateSlotState(botId: string, slots: string[]) {
    // ❌ FORBIDDEN: Projection owns state
    this.slotState.set(botId, slots);
  }
  
  async getSlotState(botId: string): Promise<string[]> {
    return this.slotState.get(botId) || [];
  }
}
```

**Why Forbidden:**
- Projection becomes stateful
- Memory leak risk
- Stale data risk
- State management complexity

---

### Forbidden: Emit Orchestration Events

```typescript
// ❌ FORBIDDEN: Projection emits events
@Injectable()
class ProjectionEventService {
  async emitProjectionEvents(botId: string, slots: string[]) {
    // ❌ FORBIDDEN: Projection emits orchestration events
    if (slots.length === 0) {
      await this.eventEmitter.emit('slots.empty', { botId });
    }
    
    if (slots.length < 5) {
      await this.eventEmitter.emit('slots.low', { botId });
    }
  }
}
```

**Why Forbidden:**
- Projection triggers actions
- Event-driven orchestration
- System becomes reactive
- Hidden automation

---

## SECTION 7 — VALIDATION GATES

### Gate 1: No Projection Persistence

```bash
grep -r "projectionRepository\|saveProjection\|ProjectionRepository" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Projection Synchronization

```bash
grep -r "syncProjection\|ProjectionSync\|cache.*slots" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Projection Reconciliation

```bash
grep -r "reconcileProjection\|ProjectionReconciliation" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Projection State

```bash
grep -r "slotState\|projectionState\|SlotStateService" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Projection Events

```bash
grep -r "emit.*projection\|projection.*event\|slots.empty" src/
# Expected: no results
```

**Status:** ✅ PASS

---

## SECTION 8 — CANONICAL RULES

### Rule 1: Projection Is Ephemeral

Projections exist only during request processing.

### Rule 2: Projection Is Not Persisted

Projections are never saved to database or cache.

### Rule 3: Projection Is Not Synchronized

Projections are never synced across systems.

### Rule 4: Projection Is Not Reconciled

Projections are never reconciled with truth.

### Rule 5: Projection Does Not Own State

Projections are stateless. No projection state management.

### Rule 6: Projection Does Not Emit Events

Projections do not trigger events or actions.

### Rule 7: Truth Changes Trigger Recomputation

When truth changes, next request recomputes projection.

### Rule 8: Projection Is Recomputed Per Request

Every request recomputes projection from truth.

---

**Version 1.0 — PRE-UNIT-04 — 2026-05-23**
