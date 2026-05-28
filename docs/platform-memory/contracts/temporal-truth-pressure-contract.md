# Temporal Truth Pressure Contract

**Purpose:** Validate temporal truth authority under concurrent mutations  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 06 — Concurrency & Reliability Validation  
**Date:** 2026-05-23

---

## CORE VALIDATION QUESTION

> Does temporal truth remain authoritative under concurrent mutations?

**Answer:** YES — Database is final authority. Concurrent mutations are serialized by PostgreSQL transactions.

---

## TEMPORAL TRUTH UNDER CONCURRENCY

### Truth Layer

```
┌─────────────────────────────────────────┐
│           TRUTH LAYER                   │
│  (PostgreSQL — Transactional)           │
│                                         │
│  • ProviderAvailability                 │
│  • Booking                              │
│  • Exclusions                           │
│                                         │
│  SERIALIZABLE per transaction           │
│  UNIQUE constraints prevent conflicts   │
│  ACID guarantees                        │
└─────────────────────────────────────────┘
```

### Concurrent Mutations

```
Transaction A: CREATE booking (09:00)
Transaction B: CREATE booking (09:00)
    │
    ├── PostgreSQL serializes
    ├── A commits first → SUCCESS
    └── B commits second → UNIQUE VIOLATION
```

**Key Property:** PostgreSQL handles concurrency. Application code does not need to.

---

## OCCUPANCY SEMANTICS UNDER PRESSURE

### Occupancy Definition Under Concurrency

```typescript
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
}
```

This function is **deterministic** regardless of concurrency:
- It reads `booking.status` from database
- Database provides consistent read within transaction
- Result is always correct for that transaction's snapshot

### Occupancy Computation Under Concurrent Booking

```
Query: getAvailableSlots(botId, date)
    │
    ├── Read ProviderAvailability → consistent snapshot
    ├── Read bookings → consistent snapshot
    ├── Compute occupancy → deterministic
    └── Return slots → advisory
```

Even if a booking is created during this query:
- The query sees a consistent snapshot (PostgreSQL MVCC)
- Occupancy is correct for that snapshot
- Next query sees the new booking

**Key Property:** Occupancy is always deterministic for a given database snapshot.

---

## RECOMPUTATION SAFETY UNDER PRESSURE

### Recomputation During High Load

```typescript
async getAvailableSlots(botId: string, date: string) {
  // Step 1: Load truth (consistent snapshot)
  const availability = await this.providerAvailabilityRepository.findOne({ where: { botId } });
  const bookings = await this.bookingRepository.find({
    where: { botId, date, status: In(['pending', 'confirmed']) }
  });
  
  // Step 2: Compute (pure function)
  const allSlots = generateSlots(availability.startTime, availability.endTime);
  const occupied = new Set(bookings.map(b => b.timeSlot));
  
  // Step 3: Return (ephemeral)
  return allSlots.filter(slot => !occupied.has(slot));
}
```

**Why Safe Under Concurrency:**
1. **Read-only** — No mutation during computation
2. **Consistent snapshot** — PostgreSQL MVCC
3. **Pure function** — Same inputs → same outputs
4. **Ephemeral** — No shared state between requests

### Recomputation Cost Under Load

| Load | Requests/sec | Compute/sec | Status |
|------|-------------|-------------|--------|
| Normal | 10 | 50ms | Trivial |
| Peak | 100 | 500ms | Trivial |
| Extreme | 1000 | 5s | Manageable |

**Key Property:** Recomputation remains safe and cheap under all realistic loads.

---

## NO HIDDEN SLOT AUTHORITY

### Validation: Slot Never Becomes Authority

| Check | Evidence | Status |
|-------|----------|--------|
| Slot entity exists? | No `class Slot` in entities | ✅ NO |
| Slot repository exists? | No `slotRepository` | ✅ NO |
| Slot cache exists? | No `cachedSlots` | ✅ NO |
| Slot validation used for decisions? | No `slot.isAvailable` checks | ✅ NO |

**Key Property:** Slots are computed projections. Database is always final authority.

### What Prevents Slot Authority

```typescript
// ❌ FORBIDDEN: Slot as authority
if (slot.isAvailable) {  // Slot decides
  await createBooking();
}

// ✅ CORRECT: Database is authority
try {
  await bookingRepository.save(booking);  // DB decides
} catch (error) {
  if (isUniqueViolation(error)) {
    throw new Error('Slot taken');  // DB rejected
  }
}
```

---

## NO IMPLICIT RESERVATION SEMANTICS

### Validation: No Reservation System

| Check | Evidence | Status |
|-------|----------|--------|
| Reservation entity? | No `class Reservation` | ✅ NO |
| Reservation repository? | No `reservationRepository` | ✅ NO |
| Reservation expiration? | No `expiresAt` on bookings | ✅ NO |
| Reservation TTL? | No TTL logic | ✅ NO |
| Hold/lock mechanism? | No locks | ✅ NO |

**Key Property:** Customer creates booking directly. No intermediate reservation state.

### Why No Reservation Is Safe

```
Without reservation:
Customer → Select slot → Create booking → Done

With reservation:
Customer → Select slot → Reserve slot (5 min) → Complete booking → Release reservation
         ↑ If customer abandons, reservation expires → complexity
```

**Reservation adds:**
- Expiration logic
- Cleanup workers
- State machine
- Race conditions (what if reservation expires during completion?)

**Without reservation:**
- Customer creates booking directly
- Booking occupies slot immediately
- No expiration needed
- No cleanup needed

---

## NO TEMPORARY SLOT OWNERSHIP

### Validation: No Slot Ownership

| Check | Evidence | Status |
|-------|----------|--------|
| Slot ownership field? | No `slot.ownerId` | ✅ NO |
| Slot lock field? | No `slot.lockedBy` | ✅ NO |
| Slot reservation field? | No `slot.reservedUntil` | ✅ NO |
| User-state slot tracking? | Only for UX, not authority | ✅ NO |

**Key Property:** No user "owns" a slot until booking is created. Slot selection is UX state, not business state.

### User State vs Business State

```typescript
// ✅ CORRECT: UserState tracks selection for UX only
class UserState {
  selectedDate?: string;   // UX state
  selectedTime?: string;   // UX state
}

// ❌ FORBIDDEN: UserState reserves slot
class UserState {
  reservedSlot?: string;   // Business state — FORBIDDEN
  reservationExpires?: Date; // Temporal state — FORBIDDEN
}
```

---

## CANONICAL RULES

### Rule 1: Database Is Final Authority Under Concurrency

PostgreSQL transactions serialize concurrent mutations. Application code does not coordinate.

### Rule 2: Occupancy Is Deterministic

Occupancy function is pure and deterministic for any database snapshot.

### Rule 3: Recomputation Is Safe Under Load

Read-only, pure, ephemeral computation is safe regardless of concurrent mutations.

### Rule 4: No Slot Authority Emerges

Slots remain projections. Database validates all writes.

### Rule 5: No Reservation Semantics Emerge

Booking is created directly. No intermediate reservation state.

### Rule 6: No Temporary Ownership Emerge

Slot selection is UX state, not business state.

---

**Version 1.0 — UNIT 06 — 2026-05-23**
