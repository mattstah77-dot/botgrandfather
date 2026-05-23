# PLATFORM EVENT TAXONOMY

**Status:** CANONICAL  
**Date:** 2026-05-19  
**Version:** 1.0

---

## Canonical Event Naming Laws

### Law 1 — Dot Notation Only
```
✅ GOOD:  booking.created
✅ GOOD:  customer.converted
❌ BAD:   booking:created
❌ BAD:   booking_created
❌ BAD:   bookingCreated
```

### Law 2 — Past Tense for Facts
```
✅ GOOD:  booking.created    (fact)
✅ GOOD:  session.started    (fact)
❌ BAD:   booking.create     (command)
❌ BAD:   createBooking      (function)
```

### Law 3 — Domain.Subject.Verb Pattern
```
✅ GOOD:  booking.slot.reserved
✅ GOOD:  customer.tag.added
✅ GOOD:  session.started
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

## Canonical Event List

### Runtime Events (Template Layer)

| Event | Description | Emitter |
|-------|-------------|---------|
| `session.started` | User began template flow | TemplateService |
| `session.completed` | User completed template flow | TemplateService |
| `session.abandoned` | User left flow without completing | TemplateService |

### Conversion Events (Universal)

| Event | Description | Emitter |
|-------|-------------|---------|
| `conversion.completed` | User achieved conversion goal | TemplateService, CustomerBookingService |

### Customer Lifecycle Events (CustomerModule)

| Event | Description | Emitter |
|-------|-------------|---------|
| `customer.created` | New customer record created | CustomerService.ensureCustomer() |
| `customer.updated` | Customer profile updated | CustomerService |
| `customer.converted` | Customer status changed to converted | CustomerService.updateStatus() |

### Booking Capability Events (Future)

| Event | Description | Emitter |
|-------|-------------|---------|
| `booking.created` | Booking record created | CustomerBookingService |
| `booking.confirmed` | Booking confirmed | BookingRuntimeService |
| `booking.cancelled` | Booking cancelled | BookingRuntimeService |
| `booking.rescheduled` | Booking rescheduled | BookingRuntimeService |
| `slot.reserved` | Time slot reserved | BookingRuntimeService |
| `slot.released` | Time slot released | BookingRuntimeService |

### Lead Capability Events

| Event | Description | Emitter |
|-------|-------------|---------|
| `lead.created` | Lead record created | LeadFunnelService |

### Bot Lifecycle Events (Platform)

| Event | Description | Emitter |
|-------|-------------|---------|
| `bot.connected` | Bot registered on platform | BotService |
| `bot.deleted` | Bot removed from platform | BotService |
| `bot.config_updated` | Bot configuration changed | BotService |

### Owner Lifecycle Events

| Event | Description | Emitter |
|-------|-------------|---------|
| `owner.created` | New owner registered | OwnerService |

### Subscription/Billing Events (Future)

| Event | Description | Emitter |
|-------|-------------|---------|
| `subscription.activated` | Subscription activated | BillingService |
| `subscription.cancelled` | Subscription cancelled | BillingService |
| `subscription.renewed` | Subscription renewed | BillingService |
| `quota.exceeded` | Usage quota exceeded | BillingService |

---

## Event Payload Contract

### Standard Structure

```typescript
interface PlatformEvent {
  // REQUIRED — Event identity
  event: string;           // Canonical event name
  timestamp: string;       // ISO 8601
  
  // REQUIRED — Tenant context
  botId: string;           // Multi-tenant scope
  
  // OPTIONAL — Actor context
  ownerId?: string;        // If owner-triggered
  customerId?: string;     // If customer-triggered
  userId?: number;         // Telegram user ID
  
  // OPTIONAL — Event-specific data
  payload: Record<string, unknown>;
  
  // OPTIONAL — Context metadata
  metadata?: {
    template?: string;     // 'booking', 'lead-funnel'
    channel?: string;      // 'chat', 'miniapp', 'api'
    source?: string;       // 'webhook', 'manual', 'automation'
  };
}
```

### Payload Rules

| Rule | Required | Forbidden |
|------|----------|-----------|
| **Root fields** | event, timestamp, botId | — |
| **Payload** | Business facts | Secrets, tokens, PII |
| **Metadata** | Context only | Business logic, flags |
| **Actor** | userId, customerId, ownerId | Passwords, auth tokens |

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

## Event Ownership Matrix

| Domain | Owns Events | Emitted By | Consumed By |
|--------|-------------|------------|-------------|
| **CustomerModule** | `customer.*` | CustomerService | Analytics, CRM, Automations |
| **Booking Capability** | `booking.*`, `slot.*` | BookingRuntimeService, CustomerBookingService | Analytics, Owner Dashboard |
| **Lead Funnel** | `lead.*` | LeadFunnelService | Analytics, Owner Dashboard |
| **Platform** | `bot.*`, `owner.*`, `platform.*` | BotService, OwnerService | Analytics, Admin |
| **Billing** | `subscription.*`, `quota.*` | BillingService | Analytics, Notifications |
| **Runtime** | `session.*`, `conversion.*` | TemplateService | Analytics, Billing |

### Ownership Invariant

> A module MUST NOT emit another module's semantic events.

Example:
- ✅ Booking module emits `booking.created`
- ❌ Booking module MUST NOT emit `customer.tag.added`
- ✅ Customer module emits `customer.tag.added`

---

## Event Categories

### Runtime Events
Business flow events from template runtime.

### Operational Events
Dashboard/owner interactions and system operations.

### Platform Events
Platform lifecycle and infrastructure events.

### Customer Events
Customer lifecycle events (universal across templates).

---

## Legacy Events (REMOVED)

The following events have been removed from the canonical taxonomy:

| Legacy Event | Replacement | Reason |
|-------------|-------------|--------|
| `funnel:started` | `session.started` | Capability-neutral |
| `funnel:completed` | `session.completed` | Capability-neutral |
| `funnel:abandoned` | `session.abandoned` | Capability-neutral |
| `session:started` | `session.started` | Dot notation |
| `session:completed` | `session.completed` | Dot notation |
| `session:abandoned` | `session.abandoned` | Dot notation |
| `conversion:achieved` | `conversion.completed` | Past tense |

---

## Analytics Compatibility

### Aggregation Queries

Current aggregation continues to work:
```sql
SELECT eventType, COUNT(*) 
FROM analytics_events 
GROUP BY eventType;
```

### Historical Data

Old events with colon separator remain in database.
New events use dot notation.
Analytics dashboards should handle both during transition.

---

## Future Capability Events

### CRM Capability

```
customer.tag.added
customer.tag.removed
customer.note.added
customer.note.updated
segment.created
segment.member.added
```

### AI Assistant Capability

```
conversation.started
conversation.escalated
conversation.resolved
ai.response.generated
ai.response.rated
```

### Referrals Capability

```
referral.created
referral.converted
referral.reward.issued
referral.reward.redeemed
```

### Subscriptions Capability

```
subscription.activated
subscription.renewed
subscription.cancelled
subscription.expired
quota.exceeded
quota.warning
```

---

**Canonical Event Taxonomy v1.0 — Stable**
