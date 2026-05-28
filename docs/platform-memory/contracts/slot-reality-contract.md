# Slot Reality Contract

**Purpose:** Define canonical slot semantics for BotGrandFather Booking  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — WHAT A SLOT IS NOT

### Slot Is NOT a Resource

```typescript
// ❌ WRONG: Slot as resource
class Slot {
  id: string;
  resource: string;  // Treats slot as allocatable resource
  isAvailable: boolean;
}
```

**Why Wrong:** Resources are persistent, slots are ephemeral.

---

### Slot Is NOT a Reservation

```typescript
// ❌ WRONG: Slot as reservation
class Slot {
  id: string;
  userId: string;  // Reserves slot for user
  expiresAt: Date; // Reservation timeout
}
```

**Why Wrong:** Reservation implies lifecycle, slots have no lifecycle.

---

### Slot Is NOT an Entity

```typescript
// ❌ WRONG: Slot as database entity
@Entity('slots')
class Slot {
  @Id()
  id: string;
  
  @Column()
  date: string;
  
  @Column()
  timeSlot: string;
}
```

**Why Wrong:** Entities persist, slots are computed.

---

### Slot Is NOT a State Machine

```typescript
// ❌ WRONG: Slot with lifecycle
class Slot {
  status: 'available' | 'reserved' | 'booked' | 'released';
  
  reserve() { this.status = 'reserved'; }
  book() { this.status = 'booked'; }
  release() { this.status = 'released'; }
}
```

**Why Wrong:** State machines imply transitions, slots have no state.

---

### Slot Is NOT a Lock

```typescript
// ❌ WRONG: Slot as lock
class SlotLock {
  async acquire(botId: string, date: string, time: string) {
    await redis.lock(`slot:${botId}:${date}:${time}`);
  }
}
```

**Why Wrong:** Locks prevent concurrent access, slots are advisory.

---

### Slot Is NOT an Operational Object

```typescript
// ❌ WRONG: Slot in business logic
class BookingService {
  async processSlot(slot: Slot) {
    // Business logic operating on slots
  }
}
```

**Why Wrong:** Business logic operates on bookings, not slots.

---

## SECTION 2 — WHAT A SLOT IS

### Canonical Definition

**A slot IS:** A computed temporal opportunity projection.

**Formula:**
```
slot = availability − occupancy
```

Where:
- **availability** = ProviderAvailability + Exclusions (truth)
- **occupancy** = Bookings with status IN ('pending', 'confirmed') (truth)
- **slot** = Computed difference (ephemeral projection)

### What Slot Exists As

| Context | Form | Lifetime |
|---------|------|----------|
| **During computation** | Array of strings `['09:00', '09:30', ...]` | Function execution |
| **During response generation** | JSON payload in API response | Request duration |
| **During UI rendering** | Component props in frontend | Component lifecycle |

### What Slot Is Used For

| Use Case | Role | Authority |
|----------|------|-----------|
| Customer discovers available times | Discovery surface | Advisory |
| Owner views calendar availability | Operational visibility | Advisory |
| Validation of booking selection | Pre-check | Advisory (DB constraint is final) |

---

## SECTION 3 — SLOT LIFECYCLE (OR LACK THEREOF)

### Slot Has NO Lifecycle

```typescript
// ❌ WRONG: Slot lifecycle
class Slot {
  create() { /* slots are created */ }
  update() { /* slots are updated */ }
  delete() { /* slots are deleted */ }
}
```

**Why Wrong:** Slots are never created, updated, or deleted. They are computed.

### Slot Lifecycle Reality

```
Query arrives
    │
    ▼
availability = getAvailability(date)  // From truth
occupancy = getOccupancy(date)        // From truth
    │
    ▼
slots = availability − occupancy       // Computation
    │
    ▼
return slots                           // Response
    │
    ▼
slots discarded                        // End of request
```

**Key Property:** Slots are computed per-request and discarded.

---

## SECTION 4 — SLOT MUST NEVER DO

### ❌ NEVER Persist

```typescript
// ❌ FORBIDDEN: Slot persistence
class SlotRepository {
  async save(slot: Slot) {
    await this.db.insert('slots', slot);  // NEVER
  }
}
```

**Consequence:** Stale slots, double-booking risk, cache invalidation complexity.

---

### ❌ NEVER Synchronize

```typescript
// ❌ FORBIDDEN: Slot synchronization
class SlotSyncService {
  async syncSlots(botId: string) {
    // Synchronize slots across services
  }
}
```

**Consequence:** Distributed complexity, synchronization hell, eventual consistency issues.

---

### ❌ NEVER Mutate

```typescript
// ❌ FORBIDDEN: Slot mutation
class SlotService {
  async updateSlot(slotId: string, newTime: string) {
    // Update slot (slots don't exist to be updated)
  }
}
```

**Consequence:** Slots don't exist. Only truth (Booking, ProviderAvailability) mutates.

---

### ❌ NEVER Own Lifecycle

```typescript
// ❌ FORBIDDEN: Slot lifecycle events
class SlotEventEmitter {
  emitSlotCreated(slot: Slot) { ... }
  emitSlotBooked(slot: Slot) { ... }
  emitSlotReleased(slot: Slot) { ... }
}
```

**Consequence:** Slots don't have lifecycle events. Bookings do.

---

### ❌ NEVER Emit Events

```typescript
// ❌ FORBIDDEN: Slot events
slotCreated { slotId, time }
slotBooked { slotId, bookingId }
slotReleased { slotId }
```

**Consequence:** Events should be about bookings (`booking.created`, `booking.cancelled`), not slots.

---

### ❌ NEVER Become Authoritative

```typescript
// ❌ FORBIDDEN: Slot as authority
class SlotAuthorityService {
  async isSlotAvailable(slotId: string): Promise<boolean> {
    const slot = await this.slotRepository.findById(slotId);
    return slot.isAvailable;  // WRONG: Query database instead
  }
}
```

**Consequence:** Slots become source of truth instead of advisory projection.

---

## SECTION 5 — SLOT COMPUTATION PATTERN

### Canonical Computation

```typescript
async function getAvailableSlots(botId: string, date: string): Promise<string[]> {
  // 1. Get availability (truth)
  const providerAvailability = await this.providerAvailabilityRepository.findOne({
    where: { botId, weekday: getDayOfWeek(date) }
  });
  
  // 2. Get occupancy (truth)
  const bookedSlots = await this.bookingRepository.find({
    where: { botId, date, status: In(['pending', 'confirmed']) }
  });
  
  // 3. Compute slots (pure function)
  const allSlots = generateSlots(providerAvailability.startTime, providerAvailability.endTime);
  const occupiedSet = new Set(bookedSlots.map(b => b.timeSlot));
  const availableSlots = allSlots.filter(slot => !occupiedSet.has(slot));
  
  // 4. Return (no persistence)
  return availableSlots;
}
```

### Computation Properties

| Property | Value |
|----------|-------|
| **Side effects** | None (read-only) |
| **Persistence** | None |
| **Caching** | None (by default) |
| **Lifetime** | Request-scoped |
| **Authority** | Advisory only |

---

## SECTION 6 — SLOT CORRUPTION PATTERNS

### Pattern 1: Slot Materialization

**Symptom:** "Slots are slow to compute. Let's pre-generate and store them."

**Danger:** Stale data, double-booking, cache invalidation.

**Mitigation:** Profile first. If needed, optimize computation, don't materialize.

### Pattern 2: Slot as Reservation

**Symptom:** "Let's reserve slots during booking flow."

**Danger:** Ghost reservations, abandoned bookings block capacity.

**Mitigation:** Create booking directly, don't reserve slots.

### Pattern 3: Slot Events

**Symptom:** "We need to track slot changes."

**Danger:** Slots don't change. Bookings change.

**Mitigation:** Track booking events, not slot events.

### Pattern 4: Slot Synchronization

**Symptom:** "Slots need to sync across services."

**Danger:** Distributed complexity, eventual consistency.

**Mitigation:** Slots are local projections, don't sync.

---

## SECTION 7 — CANONICAL RULES

### Rule 1: Slots Are Computed

Slots are pure function: `f(availability, occupancy) → slots`.

### Rule 2: Slots Never Persist

No slot tables, no slot cache, no slot storage.

### Rule 3: Slots Are Advisory

Slots guide user decisions, but database is final authority.

### Rule 4: Slots Have No Lifecycle

No create, update, delete, events, or state transitions.

### Rule 5: Slots Are Request-Scoped

Slots exist only during request/response cycle.

### Rule 6: Slots Don't Emit Events

Bookings emit events, not slots.

### Rule 7: Slots Don't Own State

Slots are projections, not state holders.

### Rule 8: Database Is Final Authority

Unique constraint on booking prevents double-booking, not slot locks.

---

## SECTION 8 — VALIDATION GATES

### Gate 1: No Slot Entity

```bash
grep -r "class Slot" src/templates/booking/entities/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Slot Repository

```bash
grep -r "slotRepository\|SlotRepository" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Slot Persistence

```bash
grep -r "saveSlot\|insertSlot\|deleteSlot" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Slot Events

```bash
grep -r "slotCreated\|slotBooked\|slotReleased" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Slot Lifecycle

```bash
grep -r "slotLifecycle\|SlotLifecycle" src/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
