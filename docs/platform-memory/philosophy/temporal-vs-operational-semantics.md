# Temporal vs Operational Semantics

**Purpose:** Separate temporal and operational layers in Booking capability  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — TWO LAYERS

### Temporal Layer

**Concerned with:**
- Intervals (when things happen)
- Overlaps (what conflicts)
- Occupancy (what consumes capacity)
- Availability (what is possible)
- Ordering (sequence of events)
- Constraints (what is allowed temporally)

**Example:**
```typescript
// Temporal concern: Does this booking occupy capacity?
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
}

// Temporal concern: Is this slot available?
function isSlotAvailable(
  availability: ProviderAvailability,
  occupancy: Booking[],
  date: string,
  time: string
): boolean {
  const isWorkingDay = availability.weekday === getDayOfWeek(date);
  const isExcluded = availability.excludedDates.includes(date);
  const isOccupied = occupancy.some(b => b.timeSlot === time);
  
  return isWorkingDay && !isExcluded && !isOccupied;
}
```

### Operational Layer

**Concerned with:**
- Confirmations (owner approval)
- Business meaning (what status means)
- Workflows (customer journey)
- Customer interaction (messages, notifications)
- Owner actions (dashboard operations)
- Analytics (metrics, reporting)

**Example:**
```typescript
// Operational concern: Owner confirms booking
async function confirmBooking(bookingId: string): Promise<Booking> {
  const booking = await this.getBooking(bookingId);
  
  // Business validation
  if (booking.status !== 'pending') {
    throw new Error('Cannot confirm: not pending');
  }
  
  // Business action
  booking.status = 'confirmed';
  await this.save(booking);
  
  // Customer notification
  await this.telegramService.sendMessage(
    booking.botId,
    booking.userId,
    'Your booking has been confirmed!'
  );
  
  // Analytics
  await this.analytics.trackEvent('booking.confirmed', { bookingId });
  
  return booking;
}
```

---

## SECTION 2 — LAYER INTERACTION MAP

### How Layers Interact

```
┌─────────────────────────────────────────┐
│         OPERATIONAL LAYER               │
│                                         │
│  • Owner confirms booking               │
│  • Customer receives message            │
│  • Analytics event emitted              │
│  • Dashboard updated                    │
│                                         │
│  DOES NOT directly manipulate           │
│  temporal capacity.                     │
│                                         │
│  Mutates Booking.status which           │
│  IMPLICITLY affects occupancy.          │
└─────────────────────────────────────────┘
                    │
                    │ Status transition
                    │ (operational action)
                    ▼
┌─────────────────────────────────────────┐
│           TEMPORAL LAYER                │
│                                         │
│  • Booking.status determines occupancy  │
│  • Occupancy affects availability       │
│  • Availability generates slots         │
│                                         │
│  DOES NOT know about:                   │
│  - Customer messages                    │
│  - Owner dashboard                      │
│  - Analytics                            │
│  - Business workflows                   │
│                                         │
│  Only knows: status → occupancy         │
└─────────────────────────────────────────┘
```

### Interaction Rules

| Direction | Allowed | Example |
|-----------|---------|---------|
| Operational → Temporal | ✅ Indirect | Owner confirms → status changes → occupancy changes |
| Temporal → Operational | ❌ No | Occupancy does not trigger messages |
| Temporal → Temporal | ✅ Yes | Status → occupancy → availability → slots |
| Operational → Operational | ✅ Yes | Confirm → notify → analytics |

---

## SECTION 3 — DEPENDENCY DIRECTION

### Temporal Is Foundation

```
Temporal Layer (foundation)
    │
    ├── defines → availability
    ├── defines → occupancy
    └── defines → constraints
    │
Operational Layer (built on top)
    │
    ├── uses → availability (for validation)
    ├── uses → occupancy (for display)
    └── respects → constraints (for policy)
```

**Key Property:** Operational layer depends on temporal layer. Temporal layer does NOT depend on operational layer.

### Example: Booking Creation

```typescript
// Temporal layer: Check if slot is available
const isAvailable = await this.checkSlotAvailability(botId, date, time);

// Operational layer: Create booking if available
if (isAvailable) {
  // Business logic
  const booking = await this.createBooking({ botId, userId, date, time });
  
  // Customer interaction
  await this.notifyCustomer(booking);
  
  // Analytics
  await this.trackEvent('booking.created', booking);
}
```

**Dependency:** Operational uses temporal (availability check). Temporal does not use operational.

---

## SECTION 4 — FORBIDDEN LEAKAGE

### Leakage Pattern 1: Business Logic in Temporal

```typescript
// ❌ WRONG: Business logic in temporal layer
function occupies(booking: Booking): boolean {
  // Business logic leaking into temporal
  if (booking.status === 'pending' && !booking.isPaid) {
    return false;  // Business logic (payment) affects occupancy
  }
  
  return ['pending', 'confirmed'].includes(booking.status);
}
```

**Why Wrong:** Payment is business concern. Occupancy is temporal concern.

**Correct:**
```typescript
// ✅ CORRECT: Temporal only
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
  // Payment status is irrelevant to occupancy
}
```

---

### Leakage Pattern 2: Temporal Logic in Business

```typescript
// ❌ WRONG: Temporal logic in operational layer
async function confirmBooking(bookingId: string) {
  const booking = await this.getBooking(bookingId);
  
  // Temporal logic in business method
  const now = new Date();
  const bookingTime = parse(`${booking.date}T${booking.timeSlot}`);
  
  if (bookingTime < now) {
    // Business method handling temporal logic
    booking.status = 'completed';  // Wrong!
  }
  
  await this.save(booking);
}
```

**Why Wrong:** Time-based state transition is temporal automation.

**Correct:**
```typescript
// ✅ CORRECT: Business method only handles business logic
async function confirmBooking(bookingId: string) {
  const booking = await this.getBooking(bookingId);
  
  // Business validation only
  if (booking.status !== 'pending') {
    throw new Error('Cannot confirm: not pending');
  }
  
  // Business action
  booking.status = 'confirmed';
  await this.save(booking);
}
```

---

### Leakage Pattern 3: Operational State Affects Temporal

```typescript
// ❌ WRONG: Operational state affects temporal
async function getAvailableSlots(botId: string, date: string) {
  const bookings = await this.getBookings(botId, date);
  
  // Operational state affecting temporal
  const occupied = bookings.filter(b => {
    if (b.status === 'pending' && b.ownerNotified) {
      return false;  // Operational state affects occupancy!
    }
    return ['pending', 'confirmed'].includes(b.status);
  });
  
  // ...
}
```

**Why Wrong:** `ownerNotified` is operational state. It should not affect occupancy.

**Correct:**
```typescript
// ✅ CORRECT: Temporal only
async function getAvailableSlots(botId: string, date: string) {
  const bookings = await this.getBookings(botId, date);
  
  // Temporal only: status determines occupancy
  const occupied = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status)
  );
  
  // ...
}
```

---

### Leakage Pattern 4: Temporal Events Trigger Operations

```typescript
// ❌ WRONG: Temporal events trigger operations
class TemporalEventHandler {
  async onBookingTimeReached(booking: Booking) {
    // Temporal event triggering operations
    await this.notifyOwner('Booking time reached');
    await this.markBookingAsInProgress(booking);
    await this.sendReminderToCustomer(booking);
  }
}
```

**Why Wrong:** Time reaching booking time is temporal. Operations should not be triggered by time.

**Correct:**
```typescript
// ✅ CORRECT: No temporal event handlers
// Owner manually checks upcoming bookings
// Customer manually receives reminders (if requested)
// No automatic triggers based on time
```

---

## SECTION 5 — CORRUPTION EXAMPLES

### Example 1: Payment Status Corrupts Occupancy

**Scenario:** Business decides unpaid bookings don't occupy capacity.

**Code:**
```typescript
function occupies(booking: Booking): boolean {
  if (booking.status === 'pending' && !booking.isPaid) {
    return false;  // Payment affects occupancy
  }
  return ['pending', 'confirmed'].includes(booking.status);
}
```

**Result:**
- Customer A books, doesn't pay → doesn't occupy
- Customer B books same slot → succeeds
- Customer A pays later → double booking

**Root Cause:** Business logic (payment) leaked into temporal logic (occupancy).

**Fix:** Separate concerns.
```typescript
function occupies(booking: Booking): boolean {
  return ['pending', 'confirmed'].includes(booking.status);
  // Payment is separate concern
}
```

---

### Example 2: Owner Notification Corrupts Availability

**Scenario:** Owner wants to see "new" pending bookings differently.

**Code:**
```typescript
async function getAvailableSlots(botId: string, date: string) {
  const bookings = await this.getBookings(botId, date);
  
  const occupied = bookings.filter(b => {
    // Operational state affects temporal
    if (b.status === 'pending' && !b.ownerViewed) {
      return false;  // Owner hasn't seen = not occupied?
    }
    return ['pending', 'confirmed'].includes(b.status);
  });
  
  // ...
}
```

**Result:**
- Customer books → owner hasn't viewed → slot appears available
- Another customer books same slot → double booking

**Root Cause:** Operational state (owner viewed) leaked into temporal logic.

**Fix:** Separate concerns.
```typescript
async function getAvailableSlots(botId: string, date: string) {
  const bookings = await this.getBookings(botId, date);
  
  // Temporal only
  const occupied = bookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status)
  );
  
  // ...
}
```

---

### Example 3: Time-Based Auto-Completion

**Scenario:** System automatically marks past bookings as completed.

**Code:**
```typescript
@Cron('0 * * * *')
async autoCompletePastBookings() {
  const pastBookings = await this.bookingRepository.find({
    where: {
      date: LessThan(format(new Date(), 'yyyy-MM-dd')),
      status: 'confirmed',
    },
  });
  
  for (const booking of pastBookings) {
    booking.status = 'completed';
    await this.bookingRepository.save(booking);
  }
}
```

**Result:**
- Booking passes → auto-marked completed
- Owner wanted to mark no-show → can't, already completed
- Customer disputes service → status says completed

**Root Cause:** Temporal automation (time passing) triggered operational state change.

**Fix:** Owner manually marks status.
```typescript
// No auto-completion
// Owner explicitly marks as completed or no-show
```

---

## SECTION 6 — CANONICAL RULES

### Rule 1: Temporal Is Foundation

Temporal layer defines availability, occupancy, constraints. Operational layer builds on top.

### Rule 2: Operational Depends on Temporal

Operational layer uses temporal data for validation and display.

### Rule 3: Temporal Does Not Depend on Operational

Temporal layer never uses operational state (notifications, workflows, analytics).

### Rule 4: Status Is the Bridge

Booking.status is the ONLY link between layers. Status is temporal (affects occupancy) but mutated operationally (owner actions).

### Rule 5: Business Logic Stays Operational

Payment, confirmation, workflow — all operational. Never affect occupancy directly.

### Rule 6: Temporal Logic Stays Temporal

Availability, occupancy, constraints — all temporal. Never trigger operations.

### Rule 7: No Temporal Automation

Time passing never triggers operational actions.

### Rule 8: Explicit Over Implicit

Explicit status transitions. Explicit owner actions. Explicit temporal checks.

---

## SECTION 7 — VALIDATION GATES

### Gate 1: No Business Logic in Occupancy

```bash
grep -r "occupies.*payment\|occupies.*confirmed\|occupies.*notified" src/templates/booking/
# Expected: no results (except status-based)
```

**Status:** ✅ PASS

### Gate 2: No Temporal Events Triggering Operations

```bash
grep -r "onBookingTimeReached\|onSlotExpired\|onTemporalEvent" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Operational State in Temporal Queries

```bash
grep -r "ownerViewed\|customerNotified\|workflowStep" src/templates/booking/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
