# Booking Temporal Contracts

**Purpose:** Define temporal contracts for booking capability  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## TEMPORAL CONTRACTS

### Contract 1: Date/Time Storage

```typescript
// Booking entity temporal fields
interface BookingTemporalData {
  date: string;        // YYYY-MM-DD in provider timezone
  timeSlot: string;    // HH:MM in provider timezone
  timezone: string;    // IANA timezone identifier: 'UTC', 'Europe/Moscow'
  durationMinutes: number;  // Slot duration
}
```

**Rules:**
- `date` is stored as string, not Date object
- `timeSlot` is stored as string, not Date object
- `timezone` is stored as IANA identifier
- Provider timezone is stored with booking (immutable after creation)

---

### Contract 2: Timezone Conversion Boundary

```typescript
// Input boundary (customer → system)
function parseCustomerInput(input: { date: string; time: string }, providerTimezone: string) {
  // Input assumed to be in provider timezone
  return {
    date: input.date,      // Store as-is
    timeSlot: input.time,  // Store as-is
    timezone: providerTimezone,
  };
}

// Output boundary (system → customer)
function formatForCustomer(booking: Booking, customerTimezone: string) {
  // Convert to customer timezone
  const dateTime = parse(`${booking.date}T${booking.timeSlot}`, 'yyyy-MM-dd HH:mm', new Date(), { timezone: booking.timezone });
  return formatInTimeZone(dateTime, customerTimezone, 'yyyy-MM-dd HH:mm');
}

// Internal boundary (system → system)
function compareBookings(a: Booking, b: Booking) {
  // Compare in UTC for consistency
  const aUtc = toUTC(a.date, a.timeSlot, a.timezone);
  const bUtc = toUTC(b.date, b.timeSlot, b.timezone);
  return aUtc.getTime() - bUtc.getTime();
}
```

**Rules:**
- Conversion happens at input/output boundaries only
- Internal comparison uses UTC
- No implicit timezone conversion

---

### Contract 3: Availability Generation

```typescript
interface AvailabilityConfig {
  workingHours: {
    monday: { enabled: boolean; startTime: string | null; endTime: string | null };
    tuesday: { enabled: boolean; startTime: string | null; endTime: string | null };
    wednesday: { enabled: boolean; startTime: string | null; endTime: string | null };
    thursday: { enabled: boolean; startTime: string | null; endTime: string | null };
    friday: { enabled: boolean; startTime: string | null; endTime: string | null };
    saturday: { enabled: boolean; startTime: string | null; endTime: string | null };
    sunday: { enabled: boolean; startTime: string | null; endTime: string | null };
  };
  slotDurationMinutes: number;  // Default: 30
}

// Slot generation
function generateSlots(config: AvailabilityConfig, date: string, bookedSlots: string[]): string[] {
  const dayOfWeek = getDayOfWeek(date);  // 'monday', 'tuesday', etc.
  const dayConfig = config.workingHours[dayOfWeek];
  
  if (!dayConfig || !dayConfig.enabled || !dayConfig.startTime || !dayConfig.endTime) {
    return [];  // Closed
  }
  
  const slots = computeSlots(dayConfig.startTime, dayConfig.endTime, config.slotDurationMinutes);
  return slots.filter(slot => !bookedSlots.includes(slot));
}
```

**Rules:**
- Weekly availability ONLY (no recurrence)
- Slot generation is explicit function
- Booked slots subtracted from availability
- Returns array of HH:MM strings

---

### Contract 4: Booking Window

```typescript
interface BookingWindow {
  advanceBookingDays: number;     // Default: 30
  minimumNoticeHours: number;     // Default: 2
  cancellationWindowHours: number; // Default: 24
}

// Validation
function validateBookingWindow(config: BookingWindow, bookingDate: string, bookingTime: string, timezone: string): boolean {
  const bookingDateTime = parse(`${bookingDate}T${bookingTime}`, 'yyyy-MM-dd HH:mm', new Date(), { timezone });
  const now = new Date();
  
  // Advance booking limit
  const maxDate = addDays(now, config.advanceBookingDays);
  if (bookingDateTime > maxDate) {
    throw new Error(`Bookings can only be made up to ${config.advanceBookingDays} days in advance`);
  }
  
  // Minimum notice
  const minTime = addHours(now, config.minimumNoticeHours);
  if (bookingDateTime < minTime) {
    throw new Error(`Bookings must be made at least ${config.minimumNoticeHours} hours in advance`);
  }
  
  return true;
}
```

**Rules:**
- Booking window is configurable per bot
- Advance booking limits future dates
- Minimum notice prevents last-minute bookings
- All comparisons in provider timezone

---

### Contract 5: Cancellation Window

```typescript
// Cancellation validation
function validateCancellation(booking: Booking, config: BookingWindow, now: Date = new Date()): boolean {
  const bookingDateTime = parse(`${booking.date}T${booking.timeSlot}`, 'yyyy-MM-dd HH:mm', new Date(), { timezone: booking.timezone });
  const hoursUntil = differenceInHours(bookingDateTime, now);
  
  if (hoursUntil < config.cancellationWindowHours) {
    throw new Error(`Cannot cancel within ${config.cancellationWindowHours} hours of appointment`);
  }
  
  return true;
}
```

**Rules:**
- Cancellation window is configurable per bot
- Cancellation prevented within window
- Owner can override (administrative action)

---

### Contract 6: Rescheduling

```typescript
// Reschedule contract
interface RescheduleRequest {
  bookingId: string;
  newDate: string;      // YYYY-MM-DD
  newTime: string;      // HH:MM
  reason?: string;
}

async function rescheduleBooking(request: RescheduleRequest, config: BookingConfig): Promise<Booking> {
  const booking = await getBooking(request.bookingId);
  
  // Validate new slot
  const isAvailable = await checkSlotAvailability(booking.botId, request.newDate, request.newTime);
  if (!isAvailable) {
    throw new Error('New slot not available');
  }
  
  // Validate cancellation window (if applicable)
  if (booking.status === 'confirmed') {
    validateCancellation(booking, config);
  }
  
  // Update booking
  booking.date = request.newDate;
  booking.timeSlot = request.newTime;
  
  // If status was pending, keep pending
  // If status was confirmed, keep confirmed
  
  await save(booking);
  
  // Emit event
  await trackEvent('booking.rescheduled', {
    bookingId: booking.id,
    oldDate: booking.date,
    oldTime: booking.timeSlot,
    newDate: request.newDate,
    newTime: request.newTime,
  });
  
  return booking;
}
```

**Rules:**
- New slot must be available
- Cancellation window applies to confirmed bookings
- Status preserved (pending → pending, confirmed → confirmed)
- Reschedule event emitted

---

### Contract 7: Conflict Prevention

```typescript
// Database-level conflict prevention
@Entity('bookings')
@Unique(['botId', 'date', 'timeSlot', 'status'])
class Booking { ... }

// Application-level conflict prevention
async function createBooking(botId: string, date: string, timeSlot: string, status: string): Promise<Booking> {
  // Optimistic check
  const existing = await findOne({ where: { botId, date, timeSlot, status } });
  if (existing) {
    throw new Error('Slot already taken');
  }
  
  // Create (constraint catches race)
  const booking = new Booking({ botId, date, timeSlot, status });
  try {
    await save(booking);
  } catch (error) {
    if (isUniqueViolation) {
      throw new Error('Slot just booked by someone else. Please select another time.');
    }
    throw error;
  }
  
  return booking;
}
```

**Rules:**
- Database unique constraint is final authority
- Optimistic pre-check for user feedback
- Graceful error on race condition
- Status matters (pending + pending = conflict, pending + cancelled = OK)

---

## TEMPORAL EVENTS

### Canonical Events

| Event | When | Payload |
|-------|------|---------|
| `booking.created` | Booking created | date, timeSlot, serviceId |
| `booking.confirmed` | Booking confirmed | date, timeSlot |
| `booking.cancelled` | Booking cancelled | reason |
| `booking.completed` | Booking completed | date, timeSlot |
| `booking.rescheduled` | Booking rescheduled | oldDate, oldTime, newDate, newTime |
| `booking.no-show` | Booking marked no-show | date, timeSlot |

**Rules:**
- All events include temporal data
- Events emitted after transaction commit
- Events are observational (not orchestrational)

---

## TEMPORAL INVARIANTS

### Invariant 1: Immutable Provider Timezone

```typescript
// Provider timezone set at booking creation, never changed
booking.timezone = providerTimezone;  // Immutable
```

### Invariant 2: Date/Time Validity

```typescript
// Date must be valid YYYY-MM-DD
// Time must be valid HH:MM
function validateDateTime(date: string, time: string): boolean {
  const dateTime = parse(`${date}T${time}`, 'yyyy-MM-dd HH:mm', new Date());
  return isValid(dateTime);
}
```

### Invariant 3: Booking Window

```typescript
// Booking must be within advance booking limit
// Booking must be after minimum notice period
validateBookingWindow(config, date, time, timezone);
```

### Invariant 4: Cancellation Window

```typescript
// Cancellation must be outside cancellation window
// Owner can override
validateCancellation(booking, config);
```

### Invariant 5: No Double Booking

```typescript
// Unique constraint prevents double booking
@Unique(['botId', 'date', 'timeSlot', 'status'])
```

### Invariant 6: UTC System Timestamps

```typescript
// System timestamps in UTC
@CreateDateColumn()
createdAt: Date;  // UTC

@UpdateDateColumn()
updatedAt: Date;  // UTC
```

---

## FORBIDDEN TEMPORAL PATTERNS

### ❌ Implicit Timezone

```typescript
// ❌ FORBIDDEN
const dateTime = new Date(`${date}T${time}`);  // Uses server timezone
```

### ❌ Manual DST

```typescript
// ❌ FORBIDDEN
if (isDST()) {
  return addHours(time, 1);  // Manual DST
}
```

### ❌ Recurrence Engine

```typescript
// ❌ FORBIDDEN
const rule = new RRule({
  freq: RRule.WEEKLY,
  byweekday: [RRule.MO, RRule.TU, RRule.WE],
});
```

### ❌ Universal Calendar

```typescript
// ❌ FORBIDDEN
class UniversalCalendar {
  async getEvents(entityType: string, entityId: string) {
    // Universal calendar logic
  }
}
```

### ❌ Metadata Scheduling

```typescript
// ❌ FORBIDDEN
const schedulingMetadata = {
  availability: { rules: [...] },
  conflicts: { strategy: 'first-come' },
};
```

---

**Version 1.0 — 2026-05-23**
