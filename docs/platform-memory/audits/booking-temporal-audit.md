# Booking Temporal Audit

**Purpose:** Audit booking temporal surface and define temporal boundaries  
**Status:** COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## CURRENT TEMPORAL SURFACE

### Existing Temporal Fields

| Field | Type | Timezone | Usage |
|-------|------|----------|-------|
| `date` | string (YYYY-MM-DD) | Provider timezone | Booking date |
| `timeSlot` | string (HH:MM) | Provider timezone | Booking time |
| `timezone` | string (IANA) | N/A | Provider timezone |
| `createdAt` | Date | UTC | Record creation |
| `updatedAt` | Date | UTC | Record update |

### Existing Temporal Logic

| Location | Logic |
|----------|-------|
| `BookingRuntimeService.handleDateSelected()` | Past-date protection, advance booking limit |
| `BookingRuntimeService.sendTimeSelection()` | Minimum notice hours, booked slot filtering |
| `BookingQueryService.getAvailableSlots()` | Slot generation, booked slot subtraction |
| `BookingQueryService.getBookedSlots()` | Database query for booked times |

---

## TEMPORAL DOMAIN MODEL

### ProviderAvailability (New Entity)

**Purpose:** Store provider working hours configuration.

**Note:** This is NOT a universal scheduling entity. It is booking-template-specific.

```typescript
@Entity('provider_availability')
@Unique(['botId', 'providerId', 'weekday'])
class ProviderAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column()  // Optional — if null, applies to all providers
  providerId: string | null;

  @Column()
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

  @Column({ nullable: true })
  startTime: string | null;  // HH:MM in provider timezone

  @Column({ nullable: true })
  endTime: string | null;  // HH:MM in provider timezone

  @Column({ default: true })
  isWorkingDay: boolean;

  @Column({ type: 'jsonb', default: [] })
  excludedDates: string[];  // YYYY-MM-DD — exceptions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Key Points:**
- Weekly availability ONLY (no recurrence engine)
- No RRULE support
- No universal calendar abstractions
- Template-specific entity

### BookingSlot (Optional — Deferred)

**Purpose:** Materialized availability slot (only if operational pressure proves necessary).

**Current Approach:** Computed availability on-demand.

```typescript
// NOT IMPLEMENTED — only if needed later
@Entity('booking_slots')
class BookingSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  botId: string;

  @Column()
  date: string;  // YYYY-MM-DD

  @Column()
  timeSlot: string;  // HH:MM

  @Column()
  isAvailable: boolean;

  @Column()
  bookingId: string | null;  // If booked
}
```

---

## SLOT GENERATION STRATEGY

### Current: Computed On-Demand

```typescript
// BookingQueryService.getAvailableSlots()
async getAvailableSlots(botId: string, date: string): Promise<string[]> {
  // 1. Get working hours from config
  const bot = await this.botRepository.findOne({ where: { id: botId } });
  const workingHours = bot.config.workingHours[dayOfWeek];
  
  // 2. Generate all possible slots
  const slots = this.generateTimeSlots(workingHours.open, workingHours.close, slotDuration);
  
  // 3. Get booked slots from DB
  const bookedSlots = await this.getBookedSlots(botId, date);
  
  // 4. Subtract booked from possible
  return slots.filter(slot => !bookedSlots.has(slot));
}
```

**Advantages:**
- No slot materialization overhead
- Always up-to-date with config changes
- Simple, debuggable

**Disadvantages:**
- Computation on every request
- May be slow for complex availability

### Future: Materialized Slots (If Needed)

**Trigger:** Operational pressure (performance degradation on compute).

**Strategy:**
- Materialize weekly slots
- Update on config change
- Invalidate on booking creation/cancellation

**Still:**
- Booking-template-specific
- No universal slot engine
- No slot framework

---

## TIMEZONE STRATEGY

### Storage Strategy

| Data Type | Storage Format | Timezone |
|-----------|---------------|----------|
| Booking date | string (YYYY-MM-DD) | Provider timezone |
| Booking time | string (HH:MM) | Provider timezone |
| Provider timezone | string (IANA) | N/A (metadata) |
| Created/updated | Date | UTC (PostgreSQL default) |

### Conversion Boundaries

```typescript
// ✅ CORRECT: Conversion at input/output boundaries
function parseBookingInput(input: { date: string; time: string }, providerTimezone: string) {
  // Input is in provider timezone — store as-is
  return { date: input.date, time: input.time };
}

function displayBookingTime(booking: Booking, userTimezone: string) {
  // Output is converted to user timezone
  const providerTime = parseISO(booking.date + 'T' + booking.timeSlot);
  return formatInTimeZone(providerTime, userTimezone);
}

// ❌ FORBIDDEN: Implicit server time
function displayBookingTime(booking: Booking) {
  return new Date(booking.date + 'T' + booking.timeSlot);  // Uses server TZ (WRONG)
}
```

### Timezone Invariants

1. **Provider timezone is stored with booking** — Cannot change after booking creation.
2. **All temporal queries use provider timezone** — Consistent business logic.
3. **User timezone is client-side only** — No server storage needed.
4. **UTC is used for system timestamps** — createdAt, updatedAt.

---

## TEMPORAL EDGE CASES

### Edge Case 1: DST Transitions

**Scenario:** Provider timezone has DST (e.g., 'America/New_York').

**Impact:** 25-hour day (spring forward) or 23-hour day (fall back).

**Mitigation:**
```typescript
// Use library that handles DST (e.g., date-fns-tz)
import { formatInTimeZone, parse } from 'date-fns-tz';

function parseProviderTime(date: string, time: string, timezone: string) {
  return parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date(), { timezone });
}

function displayUserTime(booking: Booking, userTimezone: string) {
  const providerTime = parseProviderTime(booking.date, booking.timeSlot, booking.timezone);
  return formatInTimeZone(providerTime, userTimezone, 'yyyy-MM-dd HH:mm');
}
```

### Edge Case 2: Midnight Boundary

**Scenario:** Booking crosses midnight (e.g., 23:30-01:00).

**Impact:** Date vs datetime ambiguity.

**Mitigation:**
- Store start date/time explicitly
- Calculate end time in code
- Do NOT store end date (derived)

```typescript
function getBookingEndTime(booking: Booking) {
  const start = parseProviderTime(booking.date, booking.timeSlot, booking.timezone);
  return addMinutes(start, booking.durationMinutes);
}
```

### Edge Case 3: Overlapping Availability

**Scenario:** Provider config has overlapping time slots.

**Impact:** Duplicate slots in availability.

**Mitigation:**
```typescript
function generateTimeSlots(open: string, close: string, duration: number) {
  const slots: string[] = [];
  const times = parseTimeRange(open, close, duration);
  
  // Deduplicate
  const unique = new Set(times);
  return Array.from(unique);
}
```

### Edge Case 4: Stale Slot Selection

**Scenario:** User selects slot, but slot becomes unavailable before confirmation.

**Impact:** Booking creation fails.

**Mitigation:**
```typescript
async function confirmBooking(botId, date, timeSlot) {
  // Pre-check availability
  const isAvailable = await checkSlotAvailability(botId, date, timeSlot);
  if (!isAvailable) {
    throw new Error('Slot no longer available');
  }
  
  // Create booking (unique constraint catches race)
  const booking = new Booking({ botId, date, timeSlot });
  try {
    await save(booking);
  } catch (error) {
    if (isUniqueViolation) {
      throw new Error('Slot just booked by someone else');
    }
    throw error;
  }
}
```

---

## RESCHEDULING SEMANTICS

### Reschedule Operation

```typescript
async function rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
  const booking = await getBooking(bookingId);
  
  // Validate new slot
  const isAvailable = await checkSlotAvailability(booking.botId, newDate, newTime);
  if (!isAvailable) {
    throw new Error('New slot not available');
  }
  
  // Validate cancellation window (if applicable)
  if (booking.status === 'confirmed') {
    const now = new Date();
    const bookingTime = parseProviderTime(booking.date, booking.timeSlot, booking.timezone);
    const hoursUntil = diffInHours(now, bookingTime);
    
    const cancellationWindow = booking.config.cancellationWindowHours || 24;
    if (hoursUntil < cancellationWindow) {
      throw new Error('Cannot reschedule within cancellation window');
    }
  }
  
  // Update booking
  booking.date = newDate;
  booking.timeSlot = newTime;
  await save(booking);
}
```

### Cancellation Window

```typescript
// BookingConfig
cancellationWindowHours: number;  // Default: 24

// Validation
if (hoursUntil < cancellationWindowHours) {
  throw new Error(`Cannot cancel within ${cancellationWindowHours} hours`);
}
```

---

## CONFLICT HANDLING

### Double Booking Prevention

**Strategy:** Pre-check + database unique constraint.

```typescript
// Pre-check (optimistic)
const existing = await findOne({ 
  where: { botId, date, timeSlot, status: 'pending' } 
});
if (existing) {
  throw new Error('Slot already taken');
}

// Create (constraint is final authority)
const booking = new Booking({ botId, date, timeSlot, status: 'pending' });
await save(booking);  // Unique constraint catches race
```

### Simultaneous Booking Attempts

**Scenario:** Two users click "confirm" simultaneously for same slot.

**Resolution:** One succeeds, other gets unique constraint error.

```typescript
try {
  await save(booking);
} catch (error) {
  if (error.code === '23505') {  // PostgreSQL unique violation
    throw new Error('Slot just booked. Please select another time.');
  }
  throw error;
}
```

### Cancelled Slot Reopening

**Scenario:** Booking cancelled, slot becomes available again.

**Resolution:** Automatic via status filter.

```typescript
async function getBookedSlots(botId: string, date: string) {
  return findMany({
    where: { botId, date, status: In(['pending', 'confirmed']) }  // Exclude cancelled
  });
}
```

---

## TEMPORAL RELIABILITY MATRIX

| Failure Point | Severity | Mitigation |
|---------------|----------|------------|
| DST transition | MEDIUM | Use timezone-aware library |
| Midnight boundary | LOW | Explicit datetime parsing |
| Overlapping slots | LOW | Deduplication in slot generation |
| Stale slot selection | MEDIUM | Unique constraint + user feedback |
| Timezone mismatch | HIGH | Store provider timezone, convert at display |
| Concurrent booking | MEDIUM | Unique constraint + graceful error |
| Cancelled slot not reopened | LOW | Status filter in query |

---

## RECOMMENDATIONS

### Immediate

1. **Add timezone conversion library** — date-fns-tz or moment-timezone
2. **Add ProviderAvailability entity** — For explicit working hours storage
3. **Add cancellation window validation** — Per booking config

### Future (If Needed)

1. **Materialized slots** — Only if performance degradation proven
2. **Excluded dates** — Holiday support in ProviderAvailability
3. **Multi-provider scheduling** — providerId in ProviderAvailability

### Never

1. **Universal scheduling engine** — Template-specific only
2. **RRULE recurrence** — Explicit weekly config only
3. **Cross-template scheduling** — Booking isolated
4. **Metadata-driven scheduling** — Explicit code only

---

**Version 1.0 — 2026-05-23**
