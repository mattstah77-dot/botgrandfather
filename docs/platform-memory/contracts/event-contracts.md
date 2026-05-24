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

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial canonical contract |

---

**Version 1.0 — 2026-05-23**
