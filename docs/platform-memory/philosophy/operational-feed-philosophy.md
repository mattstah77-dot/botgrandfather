# Operational Feed Philosophy

**Purpose:** Define boundaries for operational activity feeds  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — THE DANGER

Activity feeds are the most dangerous feature in operational platforms.

**Why dangerous:**
- Feeds display events
- Events tempt orchestration
- Orchestration becomes workflows
- Workflows become engines
- Engines become frameworks

**The slippery slope:**
```
Activity Feed (safe)
    ↓
"When booking confirmed, show in feed" (safe)
    ↓
"When booking confirmed, notify owner" (tempting)
    ↓
"When booking confirmed, create follow-up ticket" (dangerous)
    ↓
"When X happens, do Y, then Z, then notify W" (workflow engine)
```

**This document exists to prevent that slope.**

---

## SECTION 2 — WHAT OPERATIONAL FEED IS

Operational feed is **observational visibility**.

It answers:
- "What happened?"
- "When did it happen?"
- "Who was involved?"

It does NOT answer:
- "What should happen next?"
- "How should we respond?"
- "What actions should trigger?"

### Feed Is a Mirror

```
Runtime (actions happen)
    ↓
Events emitted (facts recorded)
    ↓
Feed displays (visibility provided)
    ↓
Owner sees (human decision)
    ↓
Owner acts (manual action)
    ↓
Runtime (new actions happen)
```

**Critical:** The arrow from Feed to Runtime goes through a HUMAN. Never automatic.

---

## SECTION 3 — FEED BOUNDARIES

### Boundary 1: Feed Displays Events, Never Commands

```typescript
// ✅ SAFE: Feed displays facts
interface FeedItem {
  timestamp: Date;
  eventType: string;      // 'booking.confirmed'
  actor: string;          // 'customer' | 'owner'
  subject: string;        // 'Booking #123'
  summary: string;        // 'Consultation on Jan 15'
}

// ❌ FORBIDDEN: Feed contains commands
interface FeedItem {
  timestamp: Date;
  command: 'createTicket';     // Command in feed
  params: { customerId: string };  // Command parameters
}
```

### Boundary 2: Feed Is Read-Only

```typescript
// ✅ SAFE: Feed is queried, never mutated
const feed = await analyticsService.getEvents(botId, { limit: 50 });

// ❌ FORBIDDEN: Feed triggers mutations
feed.on('booking.confirmed', async (event) => {
  await ticketService.createTicket(event.customerId);
});
```

### Boundary 3: Feed Has No Side Effects

Reading the feed must not:
- Change system state
- Trigger notifications
- Start workflows
- Update metrics
- Modify entities

```typescript
// ✅ SAFE: Pure read
const events = await feedService.getEvents(customerId);
return events;  // No side effects

// ❌ FORBIDDEN: Read with side effects
const events = await feedService.getEvents(customerId);
await markEventsAsRead(events);  // Side effect!
await notifyOwnerOfNewEvents(events);  // Side effect!
```

### Boundary 4: Feed Events Are Historical Facts

Events in the feed represent things that ALREADY happened.
They do not represent things that SHOULD happen.

```typescript
// ✅ SAFE: Past tense, factual
{ type: 'booking.confirmed', timestamp: '2024-01-15T10:00:00Z' }

// ❌ FORBIDDEN: Future-oriented, imperative
{ type: 'booking.confirmRequired', deadline: '2024-01-15T12:00:00Z' }
```

---

## SECTION 4 — EVENT VISIBILITY BOUNDARIES

### What Events May Appear in Feed

**Safe event types:**
- `session.started` — Customer started interaction
- `booking.created` — Booking was created
- `booking.confirmed` — Booking was confirmed
- `ticket.created` — Ticket was created
- `ticket.resolved` — Ticket was resolved
- `customer.created` — Customer was created
- `customer.converted` — Customer converted

**Unsafe event types (must NOT appear):**
- `workflow.step.completed` — Orchestration event
- `automation.triggered` — Automation event
- `rule.matched` — Rule engine event
- `orchestration.started` — Workflow engine event

### Event Aggregation Rules

**Safe aggregation:**
- Group by customer
- Group by time period
- Group by capability
- Filter by event type

**Forbidden aggregation:**
- Derive next actions from event sequence
- Compute workflow state from events
- Trigger actions based on event patterns
- Build state machines from event history

---

## SECTION 5 — FORBIDDEN EVENT ORCHESTRATION

### Anti-Pattern 1: Event-Driven Actions

```typescript
// ❌ FORBIDDEN
class EventDrivenRuntime {
  async onEvent(event: PlatformEvent) {
    if (event.type === 'booking.confirmed') {
      await this.createFollowUpTicket(event);
      await this.sendSatisfactionSurvey(event);
      await this.updateCRM(event);
    }
  }
}
```

**Why forbidden:** Events trigger runtime behavior. This is an event-driven workflow engine.

### Anti-Pattern 2: Feed as Trigger System

```typescript
// ❌ FORBIDDEN
class FeedTriggerSystem {
  async processFeedItem(item: FeedItem) {
    const rule = await this.findMatchingRule(item);
    if (rule) {
      await this.executeAction(rule.action, item);
    }
  }
}
```

**Why forbidden:** Feed items trigger rules. This is a rule engine.

### Anti-Pattern 3: Event Sequencing Engine

```typescript
// ❌ FORBIDDEN
class EventSequenceEngine {
  async checkSequences(customerId: string) {
    const events = await this.getRecentEvents(customerId);
    if (this.matchesPattern(events, ['booking.confirmed', 'ticket.created'])) {
      await this.escalate(customerId);
    }
  }
}
```

**Why forbidden:** Event patterns trigger actions. This is a complex event processing (CEP) engine.

### Anti-Pattern 4: Feed Subscription System

```typescript
// ❌ FORBIDDEN
class FeedSubscriptionSystem {
  subscribe(eventType: string, handler: Function) {
    this.subscribers[eventType].push(handler);
  }

  async emit(event: PlatformEvent) {
    for (const handler of this.subscribers[event.type]) {
      await handler(event);  // Handlers mutate state
    }
  }
}
```

**Why forbidden:** Subscription system with mutable handlers. This is an event bus with side effects.

---

## SECTION 6 — WHY FEEDS ARE OBSERVATIONAL ONLY

### Reason 1: Human Decision Required

Operational feeds exist for OWNER visibility, not SYSTEM automation.

The owner:
- Sees a booking was confirmed
- Decides whether to follow up
- Takes manual action

The system:
- Records the event
- Displays the event
- Does NOTHING else

### Reason 2: Event Ordering Is Unreliable

Events may:
- Arrive out of order
- Be duplicated
- Be lost
- Be delayed

If feeds trigger actions, unreliable events cause unreliable actions.

### Reason 3: Event Semantics Vary

`booking.confirmed` means different things in different contexts.
- Manual confirmation by owner
- Auto-confirmation on payment
- Confirmation after availability check

If feeds trigger actions, semantic variation causes incorrect actions.

### Reason 4: Circular Dependencies

```
booking.confirmed → create ticket
ticket.resolved → complete booking
booking.completed → close ticket
```

If feeds trigger cross-capability actions, circular dependencies emerge.

### Reason 5: Debugging Complexity

When actions are triggered by events:
- "Why was this ticket created?" → "Because a booking was confirmed"
- "Why was this email sent?" → "Because a ticket was resolved"

Causal chains become invisible and untraceable.

---

## SECTION 7 — SAFE FEED IMPLEMENTATIONS

### Safe Implementation 1: Simple Event List

```typescript
// Get events, display them
const events = await analyticsService.getBotEvents(botId, { limit: 50 });
return events.map(e => ({
  time: e.timestamp,
  what: formatEventType(e.eventType),
  who: e.metadata?.customerName || 'Unknown',
  detail: e.payload?.summary || '',
}));
```

### Safe Implementation 2: Customer Activity Timeline

```typescript
// Get customer events, display chronologically
const events = await analyticsService.getCustomerEvents(customerId);
return events.sort((a, b) => a.timestamp - b.timestamp);
```

### Safe Implementation 3: Capability Filtered Feed

```typescript
// Get events filtered by capability
const events = await analyticsService.getBotEvents(botId, {
  filter: { template: 'booking' },
  limit: 50,
});
```

---

## SECTION 8 — CANONICAL FEED RULES

### Rule 1: Feed Is Read-Only

Feed data is never modified by reading it.

### Rule 2: Feed Has No Side Effects

Reading feed does not trigger any system behavior.

### Rule 3: Feed Events Are Past Tense

All events represent things that already happened.

### Rule 4: Feed Does Not Orchestrate

Feed never triggers actions in capabilities.

### Rule 5: Feed Is for Humans

Feed exists for owner visibility, not system automation.

### Rule 6: Feed Events Are Independent

Each event stands alone. Event sequences do not imply actions.

---

## SECTION 9 — VALIDATION CHECKLIST

Before implementing any feed feature:

- [ ] Feed is read-only
- [ ] Feed has no side effects
- [ ] Feed events are past tense
- [ ] Feed does not trigger actions
- [ ] Feed does not derive state
- [ ] Feed does not sequence events into workflows
- [ ] Feed is for human consumption
- [ ] Feed events are independently meaningful

---

**Version 1.0 — 2026-05-23**
