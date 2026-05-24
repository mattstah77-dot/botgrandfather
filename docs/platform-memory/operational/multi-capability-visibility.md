# Multi-Capability Operational Visibility

**Purpose:** Define safe operational aggregation across capabilities  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — CORE PRINCIPLE

Operational visibility may aggregate across capabilities.
Runtime behavior must NEVER aggregate across capabilities.

```
Operational Layer (Mini App)
    ├── BookingQueryService → bookings
    ├── SupportQueryService → tickets
    └── LeadFunnelQueryService → leads
         ↓
    DashboardService.composeView()
         ↓
    Unified operational visibility ✅

Runtime Layer (Templates)
    ├── BookingRuntimeService → booking logic
    ├── SupportRuntimeService → ticket logic
    └── LeadFunnelService → funnel logic
         ↓
    NO cross-template calls ❌
```

---

## SECTION 2 — SAFE AGGREGATION

### Safe Pattern 1: Capability-Neutral Metrics

```typescript
// DashboardService aggregates totals
async getOwnerStats(ownerId: string) {
  let totalInteractions = 0;
  for (const provider of capabilityRegistry.getAll()) {
    const metrics = await provider.getOwnerMetrics(ownerId);
    totalInteractions += metrics.total;  // Just a number
  }
  return { totalInteractions };
}
```

**Why safe:** Summing numbers has no semantic coupling.

### Safe Pattern 2: Parallel Capability Lists

```typescript
// Customer profile shows parallel lists
interface CustomerOperationalView {
  identity: Customer;
  bookings: Booking[];    // From BookingQueryService
  tickets: Ticket[];      // From SupportQueryService
  leads: Lead[];          // From LeadFunnelQueryService
}
```

**Why safe:** Each list is independent. No list affects another.

### Safe Pattern 3: Event Timeline

```typescript
// Activity feed aggregates events by customerId
interface ActivityEvent {
  timestamp: Date;
  eventType: string;      // 'booking.created', 'ticket.resolved'
  capability: string;     // 'booking', 'support'
  summary: string;
}

// Events are observational facts
const feed = await analyticsService.getCustomerEvents(customerId);
```

**Why safe:** Events are read-only facts. They do not trigger actions.

### Safe Pattern 4: Status Distribution Charts

```typescript
// Dashboard shows status breakdown per capability
const bookingStatus = await bookingQueryService.getStatusDistribution(botId);
const ticketStatus = await supportQueryService.getStatusDistribution(botId);

// Rendered as separate charts
// No interaction between distributions
```

**Why safe:** Status distributions are independent statistics.

---

## SECTION 3 — FORBIDDEN AGGREGATION

### Forbidden Pattern 1: Cross-Capability State Dependencies

```typescript
// ❌ FORBIDDEN
if (booking.status === 'confirmed') {
  ticket.priority = 'high';  // Booking affects ticket
}
```

**Why forbidden:** Capabilities must not mutate each other's state.

### Forbidden Pattern 2: Capability Execution Chains

```typescript
// ❌ FORBIDDEN
async function customerJourney(customerId: string) {
  const lead = await leadService.createLead(customerId);
  const booking = await bookingService.createBooking(customerId, lead.preferences);
  const ticket = await supportService.createTicket(customerId, 'Welcome');
  // Capabilities orchestrate each other
}
```

**Why forbidden:** This is a workflow engine disguised as customer journey.

### Forbidden Pattern 3: Universal Timeline Engine

```typescript
// ❌ FORBIDDEN
class UniversalTimelineEngine {
  async processEvent(event: PlatformEvent) {
    // Event triggers capability transitions
    if (event.type === 'booking.completed') {
      await this.triggerFollowUp(event);
    }
  }
}
```

**Why forbidden:** Event-driven runtime automation is orchestration.

### Forbidden Pattern 4: Cross-Capability Validation

```typescript
// ❌ FORBIDDEN
async function validateBooking(customerId: string) {
  const openTickets = await supportQueryService.getOpenTickets(customerId);
  if (openTickets.length > 0) {
    throw new Error('Cannot book with open tickets');  // Cross-capability rule
  }
}
```

**Why forbidden:** Business rules must not span capabilities.

### Forbidden Pattern 5: Shared Operational State

```typescript
// ❌ FORBIDDEN
interface UniversalCustomerState {
  customerId: string;
  globalStatus: 'active' | 'blocked' | 'vip';  // Status derived from all capabilities
  nextAction: 'book' | 'support' | 'survey';   // Orchestration hint
}
```

**Why forbidden:** Global state couples all capabilities.

---

## SECTION 4 — OPERATIONAL COHESION RULES

### Rule 1: Operational Views May Compose

Operational views can show data from multiple capabilities side by side.

```typescript
// ✅ SAFE
const view = {
  customer: await customerService.getById(id),
  bookings: await bookingQueryService.getCustomerBookings(id),
  tickets: await supportQueryService.getCustomerTickets(id),
};
```

### Rule 2: Operational Views Must Not Transform

Operational views must not derive new state from multiple capabilities.

```typescript
// ❌ FORBIDDEN
customer.engagementScore = computeFrom(bookings, tickets, leads);
// Derived state couples capabilities
```

### Rule 3: Operational Aggregation Is Summation Only

Numbers may be summed. Semantics must not be merged.

```typescript
// ✅ SAFE: Summing numbers
totalInteractions = bookings + tickets + leads;

// ❌ FORBIDDEN: Merging semantics
totalConversions = bookings.confirmed + tickets.resolved + leads.converted;
// "Confirmed booking" and "resolved ticket" are NOT the same thing
```

### Rule 4: Capability Queries Are Independent

Each capability query must execute independently.

```typescript
// ✅ SAFE: Parallel independent queries
const [bookings, tickets] = await Promise.all([
  bookingQueryService.getCustomerBookings(id),
  supportQueryService.getCustomerTickets(id),
]);

// ❌ FORBIDDEN: Sequential dependent queries
const bookings = await bookingQueryService.getCustomerBookings(id);
const tickets = await supportQueryService.getTicketsForBookings(bookings);
// Second query depends on first — cross-capability dependency
```

### Rule 5: Operational Feed Is Observational

Activity feeds show what happened. They do not trigger what happens next.

```typescript
// ✅ SAFE: Observational feed
feed.push({
  type: 'booking.confirmed',
  timestamp: booking.confirmedAt,
  summary: `Booking confirmed: ${booking.serviceName}`,
});

// ❌ FORBIDDEN: Feed triggers actions
feed.on('booking.confirmed', async (event) => {
  await ticketService.createTicket(event.customerId, 'Follow-up');
});
```

---

## SECTION 5 — RUNTIME ISOLATION RULES

### Rule 1: Runtime Services Do Not Import Each Other

```typescript
// ❌ FORBIDDEN
import { SupportRuntimeService } from '../support/support-runtime.service';

class BookingRuntimeService {
  constructor(private supportService: SupportRuntimeService) {}
}

// ✅ CORRECT
class BookingRuntimeService {
  // No imports from other templates
}
```

### Rule 2: Runtime Events Do Not Trigger Cross-Capability Actions

```typescript
// ❌ FORBIDDEN
class BookingRuntimeService {
  async confirmBooking() {
    await this.analytics.trackEvent('booking.confirmed');
    await this.supportService.createTicket(customerId, 'Post-booking');
    // Booking runtime calls support runtime
  }
}

// ✅ CORRECT
class BookingRuntimeService {
  async confirmBooking() {
    await this.analytics.trackEvent('booking.confirmed');
    // Only booking-related actions
  }
}
```

### Rule 3: Customer Interactions Are Per-Capability

```typescript
// ❌ FORBIDDEN
class UniversalCustomerHandler {
  async handleMessage(context: TemplateContext) {
    await this.bookingService.handle(context);
    await this.supportService.handle(context);
    await this.leadService.handle(context);
    // All capabilities process same message
  }
}

// ✅ CORRECT
class BookingHandler {
  async handle(context: TemplateContext) {
    await this.bookingService.handle(context);
    // Only booking processes the message
  }
}
```

---

## SECTION 6 — EXAMPLES

### Example 1: Customer Profile Page (Safe)

```typescript
// CustomerProfileController
@Get('customers/:customerId/profile')
async getCustomerProfile(@Param('customerId') customerId: string) {
  const customer = await customerService.getById(customerId);

  // Parallel independent queries
  const [bookings, tickets, leads] = await Promise.all([
    bookingQueryService.getCustomerBookings(customerId).catch(() => []),
    supportQueryService.getCustomerTickets(customerId).catch(() => []),
    leadFunnelQueryService.getCustomerLeads(customerId).catch(() => []),
  ]);

  return {
    identity: customer,
    capabilities: {
      bookings: { count: bookings.length, items: bookings },
      tickets: { count: tickets.length, items: tickets },
      leads: { count: leads.length, items: leads },
    },
  };
}
```

**Safe because:** Each section is independent. No cross-capability logic.

### Example 2: Owner Dashboard (Safe)

```typescript
// OwnerDashboardController
@Get('dashboard')
async getDashboard(@Owner() owner: Owner) {
  const stats = await dashboardService.getOwnerStats(owner.id);
  const bots = await botService.getOwnerBots(owner.id);

  // Per-bot capability metrics
  const botMetrics = await Promise.all(
    bots.map(async (bot) => ({
      botId: bot.id,
      template: bot.template,
      metrics: await dashboardService.getBotStats(bot.id),
    }))
  );

  return { stats, bots: botMetrics };
}
```

**Safe because:** Metrics are aggregated per capability, then summed.

### Example 3: Activity Feed (Safe)

```typescript
// ActivityFeedController
@Get('customers/:customerId/activity')
async getActivity(@Param('customerId') customerId: string) {
  const events = await analyticsService.getCustomerEvents(customerId);

  return events.map((event) => ({
    timestamp: event.timestamp,
    type: event.eventType,
    capability: event.metadata?.template,
    summary: formatEventSummary(event),
  }));
}
```

**Safe because:** Events are read-only. No actions triggered.

---

## SECTION 7 — VALIDATION CHECKLIST

Before implementing multi-capability operational views, verify:

- [ ] Each capability query is independent
- [ ] No capability state depends on another capability
- [ ] No cross-capability business rules
- [ ] No event triggers cross-capability actions
- [ ] Aggregation is summation only
- [ ] Views are observational, not transformational
- [ ] Runtime services have no cross-template imports

---

**Version 1.0 — 2026-05-23**
