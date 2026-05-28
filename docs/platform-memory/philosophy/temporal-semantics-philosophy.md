# Temporal Semantics Philosophy

**Purpose:** Define canonical temporal semantics for BotGrandFather  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — TEMPORAL SEMANTICS ARE TEMPLATE-OWNED

### Booking Is NOT a Workflow

**Booking IS:** Temporal operational state.  
**Booking IS NOT:** A workflow step in a broader orchestration.

### Time Semantics Belong To:
- The booking template
- Explicit runtime logic
- Template configuration

### Time Semantics Do NOT Belong To:
- The platform core
- A scheduling framework
- A calendar engine
- A temporal orchestration system

### Principle: Capability Isolation Over Universal Abstraction

```typescript
// ✅ CORRECT: Temporal logic in booking template
class BookingRuntimeService {
  async handleDateSelection() {
    // Explicit temporal logic
  }
}

// ❌ FORBIDDEN: Universal temporal engine
class TemporalEngine {
  async processTemporalEvent() {
    // Universal scheduling logic
  }
}
```

---

## SECTION 2 — TEMPORAL INVARIANTS

### Invariant 1: UTC Storage

All temporal data MUST be stored in UTC.

```typescript
// ✅ CORRECT: Store in UTC
@CreateDateColumn()
createdAt: Date;  // PostgreSQL stores as UTC

// Booking date is string (YYYY-MM-DD) in provider timezone
@Column()
date: string;  // YYYY-MM-DD

// Booking time is string (HH:MM) in provider timezone
@Column()
timeSlot: string;  // HH:MM
```

### Invariant 2: Explicit Timezone Conversion

Timezone conversion MUST happen at explicit boundaries.

```typescript
// ✅ CORRECT: Conversion at display boundary
function displayTime(booking: Booking, userTimezone: string) {
  const providerTime = parseTime(booking.date, booking.timeSlot, booking.timezone);
  return convertToTimezone(providerTime, userTimezone);
}

// ❌ FORBIDDEN: Implicit server time
function displayTime(booking: Booking) {
  return new Date();  // Uses server timezone (WRONG)
}
```

### Invariant 3: No Recurrence Engine

Recurrence is NOT a platform concern.

```typescript
// ✅ CORRECT: Explicit weekly availability
interface WorkingHours {
  monday: { enabled: true; slots: ['09:00', '10:00'] };
  tuesday: { enabled: true; slots: ['09:00', '10:00'] };
  // ... explicit per day
}

// ❌ FORBIDDEN: RRULE recurrence
interface RecurrenceRule {
  rrule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
  until: '2024-12-31';
}
```

### Invariant 4: No Universal Calendar Abstraction

Calendar is a template-specific view.

```typescript
// ✅ CORRECT: Booking-specific calendar
class BookingQueryService {
  async getCalendarView(botId: string, start: Date, end: Date) {
    // Booking-specific calendar logic
  }
}

// ❌ FORBIDDEN: Universal calendar
class UniversalCalendarService {
  async getCalendarEvents(botId: string, start: Date, end: Date) {
    // Universal calendar logic
  }
}
```

---

## SECTION 3 — SLOT GENERATION PHILOSOPHY

### Preferred: Computed Availability

Do not materialize all slots upfront. Compute on-demand.

```typescript
// ✅ CORRECT: Computed on-demand
async function getAvailableSlots(botId: string, date: string) {
  const workingHours = await getWorkingHours(botId);  // From config
  const bookedSlots = await getBookedSlots(botId, date);  // From DB
  return computeAvailable(workingHours, bookedSlots);  // In-memory computation
}

// ❌ FORBIDDEN: Materialized slots
class BookingSlot {
  @Column()
  date: string;
  
  @Column()
  timeSlot: string;
  
  @Column()
  isAvailable: boolean;  // Pre-computed (WRONG)
}
```

### When Materialization May Be Acceptable

After operational pressure proves:
- Performance degradation on compute
- High concurrent slot queries
- Complex availability rules

Even then:
- Materialization stays in booking template
- No universal slot abstraction
- No slot engine framework

---

## SECTION 4 — RESCHEDULING SEMANTICS

### Rescheduling IS NOT Workflow

Rescheduling is a booking-specific operation.

```typescript
// ✅ CORRECT: Explicit reschedule
async function rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
  const booking = await getBooking(bookingId);
  
  // Validate new slot
  const isAvailable = await checkSlotAvailability(booking.botId, newDate, newTime);
  if (!isAvailable) throw new Error('Slot not available');
  
  // Update booking
  booking.date = newDate;
  booking.timeSlot = newTime;
  await save(booking);
}

// ❌ FORBIDDEN: Reschedule as workflow
class RescheduleWorkflow {
  async execute(bookingId: string, newTime: Time) {
    // Workflow steps
  }
}
```

### Forbidden: RescheduleService Extraction

Rescheduling logic MUST stay in booking template.

```typescript
// ❌ FORBIDDEN: Universal reschedule service
class RescheduleService {
  async reschedule(entity: any, newTime: Time) {
    // Universal rescheduling (WRONG)
  }
}

// ✅ CORRECT: Booking-specific
class BookingRuntimeService {
  async rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
    // Booking-specific rescheduling
  }
}
```

---

## SECTION 5 — CONFLICT HANDLING

### Double Booking Prevention

Database unique constraint is the final authority.

```typescript
// ✅ CORRECT: DB-level protection
@Unique(['botId', 'date', 'timeSlot', 'status'])
class Booking { ... }

// Pre-check + constraint
async function createBooking(botId, date, timeSlot) {
  const existing = await findOne({ botId, date, timeSlot, status: 'pending' });
  if (existing) throw new Error('Slot taken');
  
  const booking = new Booking({ botId, date, timeSlot });
  await save(booking);  // Unique constraint catches race
}

// ❌ FORBIDDEN: Distributed locking
class SlotLockService {
  async acquireLock(botId, date, timeSlot) {
    await redis.lock(`slot:${botId}:${date}:${timeSlot}`);
  }
}
```

### Race Condition Containment

Accept race, handle gracefully.

```typescript
// ✅ CORRECT: Graceful race handling
async function confirmBooking(botId, date, timeSlot) {
  try {
    const booking = new Booking({ botId, date, timeSlot });
    await save(booking);
  } catch (error) {
    if (isUniqueViolation) {
      // Slot taken by concurrent request
      return { error: 'Slot no longer available' };
    }
    throw error;
  }
}
```

---

## SECTION 6 — CALENDAR OPERATIONAL UX

### Calendar IS Operational Visibility

Calendar view is read-only operational data.

```typescript
// ✅ CORRECT: Calendar as operational view
class BookingCalendarController {
  @Get('calendar')
  async getCalendar(botId: string, start: Date, end: Date) {
    const bookings = await this.bookingQueryService.getBookingsInRange(botId, start, end);
    return this.formatForCalendar(bookings);  // Read-only view
  }
}

// ❌ FORBIDDEN: Calendar as orchestration
class CalendarOrchestrator {
  async dragAndDrop(bookingId: string, newDate: Date) {
    // Calendar triggers rescheduling (WRONG)
  }
}
```

### Forbidden: Visual Workflow Management

Calendar UI is NOT a workflow editor.

```typescript
// ✅ CORRECT: Calendar is display-only
<Calendar
  bookings={bookings}
  onBookingClick={(id) => navigate(`/bookings/${id}`)}
/>

// ❌ FORBIDDEN: Calendar is orchestrator
<Calendar
  bookings={bookings}
  onDrop={(bookingId, newDate) => this.rescheduleBooking(bookingId, newDate)}
/>
```

---

## SECTION 7 — TEMPORAL RELIABILITY

### DST Transitions

DST changes must be handled at display boundary.

```typescript
// ✅ CORRECT: DST-aware conversion
function displayTime(booking: Booking, userTimezone: string) {
  const providerTime = parseISO(booking.date + 'T' + booking.timeSlot);
  return formatInTimeZone(providerTime, userTimezone);  // Handles DST
}

// ❌ FORBIDDEN: Manual DST handling
function displayTime(booking: Booking) {
  if (isDST()) {
    return addHours(booking.time, 1);  // Manual DST (WRONG)
  }
  return booking.time;
}
```

### Midnight Boundaries

Date boundaries must be explicit.

```typescript
// ✅ CORRECT: Explicit date handling
function isPastMidnight(booking: Booking, now: Date) {
  const bookingDateTime = parse(booking.date, booking.timeSlot);
  return bookingDateTime < now;
}

// ❌ FORBIDDEN: Implicit date comparison
function isPastMidnight(booking: Booking, now: Date) {
  return booking.timeSlot < now.toTimeString();  // Wrong (compares across dates)
}
```

---

## SECTION 8 — FORBIDDEN DIRECTIONS

### ❌ Universal Scheduling Engine

```typescript
// FORBIDDEN
class SchedulingEngine {
  async schedule(entity: any, time: Time) {
    // Universal scheduling (WRONG)
  }
}
```

### ❌ Workflow Orchestration

```typescript
// FORBIDDEN
class TemporalWorkflow {
  async executeTemporalStep(bookingId: string) {
    // Workflow orchestration (WRONG)
  }
}
```

### ❌ RRULE Recurrence Framework

```typescript
// FORBIDDEN
class RecurrenceFramework {
  async generateOccurrences(rule: RRULE, start: Date, end: Date) {
    // Universal recurrence (WRONG)
  }
}
```

### ❌ Temporal DSL

```typescript
// FORBIDDEN
const schedulingConfig = {
  temporal: {
    availability: {
      days: ['mon', 'tue', 'wed'],
      slots: '09:00-17:00',
      interval: 30,
    },
  },
};

// Metadata-driven scheduling (WRONG)
```

### ❌ Metadata-Driven Scheduling

```typescript
// FORBIDDEN
interface SchedulingMetadata {
  rules: {
    availability: { ... };
    conflicts: { ... };
    rescheduling: { ... };
  };
}

// Scheduling logic derived from metadata (WRONG)
```

---

## SECTION 9 — CANONICAL TEMPORAL RULES

### Rule 1: UTC Storage

All temporal data stored in UTC or as timezone-aware strings.

### Rule 2: Explicit Conversion

Timezone conversion happens at explicit boundaries (display/input).

### Rule 3: Template Ownership

Temporal logic belongs to booking template, not platform core.

### Rule 4: Computed Over Materialized

Slot availability computed on-demand unless operational pressure proves otherwise.

### Rule 5: DB Constraints Final

Database unique constraints are the final authority on conflicts.

### Rule 6: Calendar Is Operational

Calendar views are read-only operational data, not orchestration tools.

### Rule 7: No Recurrence Engine

Recurrence is template-specific, not platform-wide.

### Rule 8: Graceful Race Handling

Accept race conditions, handle gracefully with user feedback.

---

**Version 1.0 — 2026-05-23**
