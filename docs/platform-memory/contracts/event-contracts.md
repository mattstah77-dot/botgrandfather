# Event Contracts

**Purpose:** Canonical event naming, payload, and emission contracts  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0

---

## EVENT NAMING CONTRACT

### Format

```
{domain}.{subject?}.{verb}
```

### Rules

1. **Dot notation:** `booking.created`
2. **Past tense:** `created`, not `create`
3. **Singular nouns:** `customer`, not `customers`
4. **Capability-neutral:** `conversion.completed`, not `booking.completed`
5. **Domain-first:** `customer.tag.added`, not `tag.added.to.customer`

### Canonical Events

#### Runtime Events
```
session.started
session.completed
session.abandoned
```

#### Conversion Events
```
conversion.completed
```

#### Customer Lifecycle Events
```
customer.created
customer.updated
customer.converted
```

#### Booking Capability Events
```
booking.created
booking.confirmed
booking.cancelled
```

#### Platform Events
```
bot.connected
bot.deleted
subscription.activated
quota.exceeded
```

---

## PAYLOAD CONTRACT

### Standard Structure

```typescript
interface PlatformEvent {
  event: string;
  timestamp: string;       // ISO 8601
  botId: string;
  ownerId?: string;
  customerId?: string;
  userId?: number;         // Telegram user ID
  payload: Record<string, unknown>;
  metadata?: {
    template?: string;
    channel?: string;
    source?: string;
  };
}
```

### Payload Rules

| Field | Required | Type |
|-------|----------|------|
| event | ✅ Yes | string (canonical name) |
| timestamp | ✅ Yes | ISO 8601 string |
| botId | ✅ Yes | string |
| payload | ✅ Yes | Record<string, unknown> |
| ownerId | Optional | string |
| customerId | Optional | string |
| userId | Optional | number |
| metadata | Optional | object |

### Metadata Rules

**Allowed:**
- `template`: Template key ('booking', 'lead-funnel')
- `channel`: Communication channel ('chat', 'miniapp', 'api')
- `source`: Event source ('webhook', 'manual')

**Forbidden:**
- Business logic flags
- Control signals
- Secrets or tokens
- Infrastructure details

---

## EMISSION CONTRACT

### Synchronous-First

```typescript
// ✅ CORRECT
const result = await service.doWork();
await analytics.trackEvent(botId, 'work.completed', result);

// ❌ FORBIDDEN
await eventBus.emit('doWork', params);
// Handler does work asynchronously
```

### Events Are Facts

```typescript
// ✅ CORRECT
await analytics.trackEvent(botId, 'booking.created', {
  serviceId: booking.serviceId,
  date: booking.date,
});

// ❌ FORBIDDEN
await eventBus.emit('createBooking', { serviceId, date });
```

### No Orchestration

```typescript
// ✅ CORRECT
await bookingService.createBooking(params);
await analytics.trackEvent(botId, 'booking.created', params);

// ❌ FORBIDDEN
await eventBus.emit('booking.createRequested', params);
// Event handlers:
// 1. Create booking
// 2. Send notification
// 3. Update calendar
```

---

## ANTI-PATTERNS

### Anti-Pattern 1: Template-Specific Core Events

```typescript
// ❌ FORBIDDEN — Template-specific events in core
await analytics.trackEvent(botId, 'funnel.started');
await analytics.trackEvent(botId, 'leadfunnel.converted');
await analytics.trackEvent(botId, 'booking:created');

// ✅ CORRECT — Capability-neutral events with metadata
await analytics.trackEvent(botId, 'session.started', {
  template: 'lead-funnel',
  flowType: 'funnel',
});
await analytics.trackEvent(botId, 'conversion.completed', {
  template: 'lead-funnel',
});
await analytics.trackEvent(botId, 'booking.created', {
  template: 'booking',
});
```

### Anti-Pattern 2: Event-Driven Orchestration

```typescript
// ❌ FORBIDDEN — Events trigger distributed workflows
await eventBus.emit('booking.createRequested', params);
// Handler 1: creates booking
// Handler 2: sends notification
// Handler 3: updates calendar

// ✅ CORRECT — Explicit synchronous orchestration
const booking = await bookingService.createBooking(params);
await analytics.trackEvent(botId, 'booking.created', { bookingId: booking.id });
await notificationService.sendBookingConfirmation(booking);
```

### Anti-Pattern 3: Events as Commands

```typescript
// ❌ FORBIDDEN — Events are commands
await eventBus.emit('createBooking', { serviceId: 'consultation' });

// ✅ CORRECT — Events are facts
const booking = await bookingService.createBooking(params);
await analytics.trackEvent(botId, 'booking.created', { bookingId: booking.id });
```

---

## CROSS-CAPABILITY EVENT RULES

### Rule 1: Events Are Observational Only

Events represent things that HAPPENED. They do NOT represent commands or triggers.

```typescript
// ✅ CORRECT: Event is a fact
await analytics.trackEvent(botId, 'booking.confirmed', { bookingId });

// ❌ FORBIDDEN: Event is a command
await eventBus.emit('booking.confirm', { bookingId });
// Handler confirms booking
```

### Rule 2: Events Do Not Orchestrate

Events must NOT trigger actions in other capabilities.

```typescript
// ❌ FORBIDDEN: Cross-capability orchestration
class BookingRuntimeService {
  async confirmBooking() {
    await analytics.trackEvent('booking.confirmed');
    await supportService.createTicket(customerId, 'Follow-up');  // NO!
  }
}

// ✅ CORRECT: Event is observational only
class BookingRuntimeService {
  async confirmBooking() {
    await bookingRepository.save(booking);
    await analytics.trackEvent('booking.confirmed');
    // No other capability calls
  }
}
```

### Rule 3: Capability Events Are Self-Contained

Each capability emits its own events. No capability emits events on behalf of another.

```typescript
// ✅ CORRECT: Booking emits booking events
await analytics.trackEvent(botId, 'booking.confirmed');

// ✅ CORRECT: Support emits support events
await analytics.trackEvent(botId, 'ticket.resolved');

// ❌ FORBIDDEN: Booking emits support events
await analytics.trackEvent(botId, 'ticket.created');  // From booking service? NO!
```

### Rule 4: Event Aggregation Is Summation Only

Events may be counted, filtered, and displayed. They must NOT be composed into workflows.

```typescript
// ✅ SAFE: Count events
totalBookings = countEvents('booking.confirmed');
totalTickets = countEvents('ticket.resolved');

// ❌ FORBIDDEN: Event composition
if (hasEvent('booking.confirmed') && hasEvent('ticket.created')) {
  await doSomething();  // Event-driven workflow
}
```

### Rule 5: Event Feed Is Observational

Activity feeds display events for human visibility. They do NOT trigger system actions.

```typescript
// ✅ SAFE: Display events
const feed = await analytics.getEvents(botId);
return feed.map(formatEvent);

// ❌ FORBIDDEN: Feed triggers actions
feed.on('booking.confirmed', async (e) => {
  await createTicket(e.customerId);  // NO!
});
```

## FORBIDDEN ORCHESTRATION PATTERNS

### Pattern 1: Event-Driven Runtime

```typescript
// ❌ FORBIDDEN
class EventDrivenRuntime {
  async handleEvent(event: PlatformEvent) {
    switch (event.type) {
      case 'booking.confirmed':
        await this.createTicket(event);
        await this.sendSurvey(event);
        break;
      case 'ticket.resolved':
        await this.closeBooking(event);
        break;
    }
  }
}
```

### Pattern 2: Event Subscription System

```typescript
// ❌ FORBIDDEN
class EventSubscriptionSystem {
  subscribe(eventType: string, action: Function) {
    this.handlers[eventType] = action;
  }

  async emit(event: PlatformEvent) {
    await this.handlers[event.type]?.(event);
  }
}
```

### Pattern 3: Complex Event Processing

```typescript
// ❌ FORBIDDEN
class ComplexEventProcessor {
  async detectPatterns(events: PlatformEvent[]) {
    if (this.matches(events, ['booking.confirmed', 'ticket.created'])) {
      await this.escalateCustomer(events[0].customerId);
    }
  }
}
```

## OBSERVATIONAL EVENT PRINCIPLES

1. **Events are facts, not commands.**
2. **Events describe the past, not the future.**
3. **Events are read by humans, not executed by machines.**
4. **Events aggregate by counting, not by composition.**
5. **Events from different capabilities are independent.**
6. **Events never trigger cross-capability actions.**

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-05-23 | Added cross-capability event rules, forbidden orchestration patterns, observational principles |
| 1.0 | 2026-05-23 | Initial canonical contract |

---

**Version 1.1 — 2026-05-23**
