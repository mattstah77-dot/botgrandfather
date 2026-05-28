# Scheduling Engine Drift

**Purpose:** Document forbidden scheduling framework patterns  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0  
**Date:** 2026-05-23

---

## THE DRIFT THREAT

As BotGrandFather adds real temporal semantics, new temptations emerge:

1. "We need a universal scheduling engine"
2. "All capabilities need calendar views"
3. "Let's build a recurrence framework"
4. "We should extract availability logic"

**This document exists to prevent that drift.**

---

## FORBIDDEN DIRECTIONS

### ❌ 1. Universal Scheduling Engine

**Temptation:** "Booking has scheduling. Future capability X might need scheduling. Let's extract a universal scheduling engine."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
class SchedulingEngine {
  async schedule(entity: SchedulableEntity, time: Time): Promise<void> {
    await this.validateAvailability(entity, time);
    await this.reserveSlot(entity, time);
    await this.createEvent(entity, time);
  }

  async reschedule(entityId: string, newTime: Time): Promise<void> {
    const entity = await this.getEntity(entityId);
    await this.releaseSlot(entity, entity.scheduledTime);
    await this.schedule(entity, newTime);
  }

  async cancel(entityId: string): Promise<void> {
    const entity = await this.getEntity(entityId);
    await this.releaseSlot(entity, entity.scheduledTime);
  }
}
```

**Why Forbidden:**
- Scheduling is booking-specific, not universal
- Future capabilities may have different scheduling semantics
- Creates framework behavior by stealth

**What To Do Instead:**
```typescript
// ✅ CORRECT: Booking-specific
class BookingRuntimeService {
  async confirmBooking(botId: string, bookingId: string) {
    // Booking-specific scheduling logic
  }

  async rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
    // Booking-specific rescheduling
  }
}
```

---

### ❌ 2. Workflow Orchestration

**Temptation:** "Booking lifecycle has temporal states. Let's build a temporal workflow engine."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
class TemporalWorkflowEngine {
  workflows = {
    'booking': {
      states: ['pending', 'confirmed', 'completed'],
      transitions: [
        { from: 'pending', to: 'confirmed', condition: 'owner.confirmed' },
        { from: 'confirmed', to: 'completed', condition: 'time.arrived' },
      ],
    },
  };

  async executeTransition(entityId: string, toState: string) {
    const workflow = this.workflows[entity.workflowType];
    const transition = workflow.transitions.find(t => t.to === toState);
    
    if (await this.evaluateCondition(transition.condition)) {
      await this.transitionTo(entityId, toState);
    }
  }
}
```

**Why Forbidden:**
- Workflow engines are complex and unmaintainable
- Booking lifecycle is simple (5 states, explicit methods)
- Future capabilities have different lifecycle semantics

**What To Do Instead:**
```typescript
// ✅ CORRECT: Explicit methods
class BookingRuntimeService {
  async confirmBooking(botId: string, bookingId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== 'pending') throw new Error('Cannot confirm');
    booking.status = 'confirmed';
    await this.save(booking);
  }

  async completeBooking(botId: string, bookingId: string) {
    const booking = await this.getBooking(bookingId);
    if (booking.status !== 'confirmed') throw new Error('Cannot complete');
    booking.status = 'completed';
    await this.save(booking);
  }
}
```

---

### ❌ 3. RRULE Recurrence Framework

**Temptation:** "Provider has weekly availability. Let's use RRULE for recurrence."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
class RecurrenceFramework {
  async generateOccurrences(rule: RRULE, start: Date, end: Date): Promise<Date[]> {
    // Parse RRULE string
    // Generate all occurrences
    // Handle exceptions
    // Return array of dates
  }
}

// Usage
const rule = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20241231';
const occurrences = await this.recurrenceFramework.generateOccurrences(rule, start, end);
```

**Why Forbidden:**
- RRULE is overly complex for weekly availability
- Booking needs simple weekly config, not recurrence engine
- Creates framework behavior

**What To Do Instead:**
```typescript
// ✅ CORRECT: Explicit weekly config
interface WorkingHours {
  monday: { enabled: true; slots: ['09:00', '10:00', '11:00'] };
  tuesday: { enabled: true; slots: ['09:00', '10:00', '11:00'] };
  // ... explicit per day
}

// Generate slots from config
function generateWeeklySlots(config: WorkingHours): string[] {
  const slots: string[] = [];
  for (const [day, hours] of Object.entries(config)) {
    if (hours.enabled) {
      slots.push(...hours.slots.map(slot => `${day} ${slot}`));
    }
  }
  return slots;
}
```

---

### ❌ 4. Temporal DSL

**Temptation:** "Scheduling rules should be configurable. Let's build a temporal DSL."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
const schedulingConfig = {
  temporal: {
    availability: {
      pattern: 'weekly',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      slots: {
        start: '09:00',
        end: '17:00',
        interval: 30,
      },
      exceptions: [
        { date: '2024-12-25', reason: 'Christmas' },
      ],
    },
    conflicts: {
      strategy: 'first-come-first-served',
      buffer: 15,  // minutes
    },
    rescheduling: {
      allowed: true,
      window: 24,  // hours
      fee: 10,  // dollars
    },
  },
};

// Metadata-driven scheduling logic
class TemporalDSL {
  async evaluateConfig(config: SchedulingConfig) {
    // Parse DSL
    // Build scheduling rules
    // Execute scheduling logic
  }
}
```

**Why Forbidden:**
- DSL becomes no-code engine
- Logic moves from code to configuration
- Type safety lost
- Debugging becomes configuration debugging

**What To Do Instead:**
```typescript
// ✅ CORRECT: Explicit TypeScript
interface BookingConfig {
  workingHours: {
    monday: { enabled: boolean; slots: string[] };
    // ...
  };
  cancellationWindowHours: number;
}

class BookingRuntimeService {
  async validateCancellation(booking: Booking) {
    const window = this.config.cancellationWindowHours;
    // Explicit validation logic
  }
}
```

---

### ❌ 5. Universal Availability Layer

**Temptation:** "Booking has availability. Support might have availability (agent shifts). Let's extract a universal availability layer."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
@Entity('availability')
@Index(['entityType', 'entityId'])
class UniversalAvailability {
  @Column()
  entityType: 'booking' | 'support' | 'future_capability';

  @Column()
  entityId: string;

  @Column()
  weekday: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;
}

class AvailabilityService {
  async checkAvailability(entityType: string, entityId: string, time: Time) {
    const availability = await this.getAvailability(entityType, entityId);
    return this.isAvailable(availability, time);
  }
}
```

**Why Forbidden:**
- Availability semantics vary by capability
- Booking availability ≠ support agent shifts
- Universal entity couples capabilities

**What To Do Instead:**
```typescript
// ✅ CORRECT: Capability-specific
@Entity('provider_availability')  // Booking-specific
class ProviderAvailability {
  @Column()
  botId: string;

  @Column()
  weekday: string;
  
  // Booking-specific fields
}

@Entity('agent_shifts')  // Support-specific (if needed)
class AgentShifts {
  @Column()
  botId: string;

  @Column()
  agentId: string;
  
  // Support-specific fields
}
```

---

### ❌ 6. Cross-Template Scheduling Services

**Temptation:** "Both booking and support need scheduling logic. Let's extract a shared scheduling service."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
class SharedSchedulingService {
  async generateSlots(config: ScheduleConfig): Promise<TimeSlot[]> {
    // Universal slot generation
  }

  async checkConflict(time: Time, entity: any): Promise<boolean> {
    // Universal conflict detection
  }
}

// In BookingRuntimeService
constructor(private schedulingService: SharedSchedulingService) {}

// In SupportRuntimeService
constructor(private schedulingService: SharedSchedulingService) {}
```

**Why Forbidden:**
- Shared service couples capabilities
- Scheduling semantics may diverge
- Future capabilities need different scheduling

**What To Do Instead:**
```typescript
// ✅ CORRECT: Independent implementations
class BookingRuntimeService {
  async generateBookingSlots() {
    // Booking-specific slot generation
  }
}

class SupportRuntimeService {
  async generateAgentShifts() {
    // Support-specific shift generation
  }
}
```

---

### ❌ 7. Queue-Based Slot Reservation

**Temptation:** "Slots need to be reserved during booking flow. Let's use a queue."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
class SlotReservationService {
  async reserveSlot(botId: string, date: string, timeSlot: string) {
    await this.queue.enqueue('slot-reservation', { botId, date, timeSlot });
    // Async processing
  }

  async releaseSlot(bookingId: string) {
    await this.queue.enqueue('slot-release', { bookingId });
  }
}
```

**Why Forbidden:**
- Introduces queue infrastructure
- Adds complexity without value
- Simple database constraint is sufficient

**What To Do Instead:**
```typescript
// ✅ CORRECT: Database constraint
async function createBooking(botId: string, date: string, timeSlot: string) {
  const booking = new Booking({ botId, date, timeSlot });
  try {
    await this.bookingRepository.save(booking);
  } catch (error) {
    if (isUniqueViolation) {
      throw new Error('Slot already taken');
    }
    throw error;
  }
}
```

---

### ❌ 8. Distributed Locking

**Temptation:** "We need to prevent double-booking. Let's use distributed locks."

**Bad Example:**
```typescript
// ❌ FORBIDDEN
class DistributedSlotLock {
  async acquireLock(botId: string, date: string, timeSlot: string): Promise<boolean> {
    const key = `slot:${botId}:${date}:${timeSlot}`;
    return await this.redis.set(key, 'locked', 'EX', 300, 'NX');
  }

  async releaseLock(botId: string, date: string, timeSlot: string) {
    const key = `slot:${botId}:${date}:${timeSlot}`;
    await this.redis.del(key);
  }
}
```

**Why Forbidden:**
- Introduces Redis dependency
- Over-engineering for single-database scenario
- Database unique constraint is sufficient

**What To Do Instead:**
```typescript
// ✅ CORRECT: Database unique constraint
@Unique(['botId', 'date', 'timeSlot'])
class Booking { ... }

// Race condition handled by constraint
```

---

## DRIFT DETECTION SIGNALS

### Signal 1: "All Capabilities Need Scheduling"

**Example:** "Booking has scheduling. Support has agent shifts. CRM has follow-up reminders. We need a universal scheduling system."

**Diagnosis:** Scheduling engine temptation.

**Response:** Reject. Each capability has its own scheduling logic.

---

### Signal 2: "Let's Make It Configurable"

**Example:** "Scheduling rules should be configurable via metadata."

**Diagnosis:** Temporal DSL temptation.

**Response:** Reject. Explicit TypeScript code is better.

---

### Signal 3: "We Need Better Performance"

**Example:** "Computing slots on-demand is slow. Let's materialize them with a scheduling engine."

**Diagnosis:** Premature optimization → scheduling framework.

**Response:** Profile first. If needed, materialize slots in booking template only.

---

### Signal 4: "Recurrence Would Be Nice"

**Example:** "Providers have weekly availability. Let's use RRULE for recurrence."

**Diagnosis:** Recurrence framework temptation.

**Response:** Reject. Explicit weekly config is sufficient.

---

### Signal 5: "Calendar Views Are Universal"

**Example:** "Booking has calendar. Support has agent calendar. Let's build a universal calendar component."

**Diagnosis:** Universal calendar abstraction.

**Response:** Reject. Each capability has its own calendar view.

---

## WHAT TO DO INSTEAD

| Forbidden | Safe Alternative |
|-----------|-----------------|
| Universal scheduling engine | Booking-specific scheduling logic |
| Workflow orchestration | Explicit lifecycle methods |
| RRULE recurrence | Explicit weekly config |
| Temporal DSL | Explicit TypeScript |
| Universal availability | Capability-specific availability |
| Cross-template scheduling | Independent implementations |
| Queue-based reservation | Database unique constraint |
| Distributed locking | Database constraint + graceful error |

---

## CANONICAL SCHEDULING RULES

### Rule 1: Scheduling Is Template-Local

All scheduling logic stays in booking template.

### Rule 2: No Recurrence Engine

Explicit weekly config only. No RRULE.

### Rule 3: No Universal Availability

Each capability owns its availability semantics.

### Rule 4: Database Constraints Final

Unique constraints handle conflicts, not distributed locks.

### Rule 5: Computed Over Materialized

Slot availability computed on-demand unless proven otherwise.

### Rule 6: Explicit Code Over Metadata

Scheduling logic in TypeScript, not configuration.

---

**Version 1.0 — 2026-05-23**
