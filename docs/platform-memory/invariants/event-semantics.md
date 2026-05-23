# Event Semantics

**Purpose:** Canonical event naming and semantics  
**Status:** CANONICAL — Tier 1 Invariant  
**Version:** 1.0

---

## NAMING LAWS

### Law 1 — Dot Notation Only

```
✅ GOOD:  booking.created
❌ BAD:   booking:created
❌ BAD:   booking_created
❌ BAD:   bookingCreated
```

### Law 2 — Past Tense for Facts

```
✅ GOOD:  booking.created    (fact: something happened)
❌ BAD:   booking.create     (command)
❌ BAD:   createBooking      (function name)
```

### Law 3 — Domain.Subject.Verb Pattern

```
✅ GOOD:  customer.tag.added
✅ GOOD:  booking.slot.reserved
❌ BAD:   leadDone
❌ BAD:   userDidThing
```

### Law 4 — Singular Nouns

```
✅ GOOD:  customer.created
❌ BAD:   customers.created
```

### Law 5 — Capability-Neutral Where Possible

```
✅ GOOD:  conversion.completed
✅ GOOD:  session.started
❌ BAD:   leadfunnel.completed
❌ BAD:   bookingflow.started
```

---

## EVENT CATEGORIES

### Runtime Events

Business flow events from template runtime.

```
session.started
session.completed
session.abandoned
```

### Conversion Events

Universal conversion tracking.

```
conversion.completed
```

### Customer Lifecycle Events

Customer entity lifecycle.

```
customer.created
customer.updated
customer.converted
```

### Capability Events

Template-specific business events.

```
booking.created
booking.confirmed
booking.cancelled
lead.created
```

### Platform Events

Platform infrastructure events.

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
  event: string;           // Canonical event name
  timestamp: string;       // ISO 8601
  botId: string;           // Multi-tenant scope
  ownerId?: string;        // If owner-triggered
  customerId?: string;     // If customer-triggered
  userId?: number;         // Telegram user ID
  payload: Record<string, unknown>;  // Business facts
  metadata?: {
    template?: string;     // 'booking', 'lead-funnel'
    channel?: string;      // 'chat', 'miniapp', 'api'
    source?: string;       // 'webhook', 'manual'
  };
}
```

### Payload Rules

| Field | Required | Forbidden |
|-------|----------|-----------|
| event | ✅ Yes | — |
| timestamp | ✅ Yes | — |
| botId | ✅ Yes | — |
| payload | ✅ Yes | Secrets, tokens, PII |
| metadata | Optional | Business logic, flags |

### Metadata Rules

**GOOD:**
```typescript
metadata: {
  template: 'booking',
  channel: 'miniapp',
  source: 'webhook'
}
```

**BAD:**
```typescript
metadata: {
  shouldSendNotification: true,  // Business logic!
  retryCount: 3                  // Infrastructure!
}
```

---

## EVENT PHILOSOPHY

### Events Are Facts, Not Orchestration

```typescript
// ✅ CORRECT — Event describes a fact
await analytics.trackEvent(botId, 'booking.created', {
  serviceId: 'consultation',
  date: '2026-05-20',
});

// ❌ FORBIDDEN — Event is a command
await eventBus.emit('createBooking', { serviceId: 'consultation' });
```

### Synchronous-First

Business logic is synchronous. Events are supplementary.

```typescript
// ✅ CORRECT
const booking = await bookingService.createBooking(params);
await analytics.trackEvent(botId, 'booking.created', { bookingId: booking.id });

// ❌ FORBIDDEN
await eventBus.emit('booking.createRequested', params);
// Event handler creates booking asynchronously
```

### Events Support Analytics, Not Distributed Workflows

```typescript
// ✅ CORRECT — Event stored for analytics
await analytics.trackEvent(botId, 'customer.converted', { userId: 123 });

// ❌ FORBIDDEN — Event triggers distributed workflow
await eventBus.emit('customer.converted', { userId: 123 });
// Handler 1: sends email
// Handler 2: updates CRM
// Handler 3: triggers automation
```

---

## INVARIANTS

> **Invariant ES.1:** Events use dot notation (`booking.created`, not `booking:created`).

> **Invariant ES.2:** Events are past-tense facts (`created`, not `create`).

> **Invariant ES.3:** Events are capability-neutral where possible (`conversion.completed`, not `booking.completed`).

> **Invariant ES.4:** Events are semantic facts, not orchestration mechanisms.

> **Invariant ES.5:** Event emission does not replace explicit service orchestration.

> **Invariant ES.6:** Platform remains synchronous-first. Events are side effects.

> **Invariant ES.7:** Metadata contains context only, not business logic or control flags.

> **Invariant ES.8:** Event payload contains business facts, never secrets or tokens.

---

**Version 1.0 — 2026-05-23**
