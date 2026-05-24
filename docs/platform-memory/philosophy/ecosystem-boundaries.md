# Ecosystem Boundaries

**Purpose:** Define canonical ecosystem law for multi-capability coexistence  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — THE ECOSYSTEM QUESTION

BotGrandFather now has 3 capabilities:
- lead-funnel
- booking
- support

Soon it may have 5, 10, or more.

**The critical question:**
> How do capabilities coexist without the platform becoming a framework?

This document answers that question.

---

## SECTION 2 — CAPABILITY COEXISTENCE MODEL

### The Metaphor: City, Not Factory

**Factory metaphor (WRONG):**
- Assembly line connects stations
- Each station depends on previous
- Central control orchestrates flow
- Changing one station affects others

**City metaphor (RIGHT):**
- Buildings coexist independently
- Each building has its own purpose
- People move between buildings
- No building controls another
- City provides roads, power, water (platform)
- Buildings provide services (capabilities)

### Platform as City Infrastructure

```
Platform (city infrastructure)
├── Ownership system (property records)
├── Customer layer (resident directory)
├── Analytics (city statistics)
├── Dashboard (city hall displays)
└── Telegram integration (public transport)

Capabilities (buildings)
├── Lead Funnel (marketing office)
├── Booking (appointment center)
├── Support (help desk)
└── [Future capabilities] (new buildings)
```

**Key insight:** Buildings share infrastructure. Buildings do not control each other.

---

## SECTION 3 — SAFE CAPABILITY INTERACTIONS

### Capabilities MAY Coexist Operationally

```typescript
// ✅ SAFE: Owner sees all capabilities in dashboard
const dashboard = {
  totalCustomers: 150,
  totalInteractions: 420,  // Sum of all capability totals
  capabilities: {
    booking: { total: 120 },
    support: { total: 80 },
    'lead-funnel': { total: 220 },
  },
};
```

### Capabilities MAY Share Customers

```typescript
// ✅ SAFE: Same customer exists across capabilities
const customer = await customerService.ensureCustomer(botId, userId);
// Booking references customer
booking.customerId = customer.id;
// Ticket references customer
ticket.customerId = customer.id;
```

### Capabilities MAY Share Analytics Aggregation

```typescript
// ✅ SAFE: Events from all capabilities aggregate
const events = await analyticsService.getBotEvents(botId);
// Events: booking.created, ticket.resolved, session.started
```

### Capabilities MAY Share Ownership Visibility

```typescript
// ✅ SAFE: Owner sees all their bots and capabilities
const bots = await botService.getOwnerBots(ownerId);
// Bot A: booking template
// Bot B: support template
// Bot C: lead-funnel template
```

---

## SECTION 4 — FORBIDDEN CAPABILITY INTERACTIONS

### Capabilities MUST NOT Execute Each Other

```typescript
// ❌ FORBIDDEN
class BookingRuntimeService {
  async confirmBooking() {
    await this.bookingRepository.save(booking);
    await this.supportService.createTicket(customerId, 'Follow-up');  // NO!
  }
}
```

**Why forbidden:** Booking runtime must not execute support logic.

### Capabilities MUST NOT Orchestrate Each Other

```typescript
// ❌ FORBIDDEN
class CustomerJourneyEngine {
  async processCustomer(customerId: string) {
    const lead = await leadService.createLead(customerId);
    const booking = await bookingService.createBooking(customerId, lead);
    const ticket = await supportService.createTicket(customerId, 'Welcome');
    // Capabilities orchestrated into journey
  }
}
```

**Why forbidden:** This is a workflow engine.

### Capabilities MUST NOT Mutate Each Other's State

```typescript
// ❌ FORBIDDEN
class CrossCapabilityUpdater {
  async onBookingComplete(bookingId: string) {
    const booking = await bookingService.getById(bookingId);
    await supportService.updateTicketPriority(
      booking.customerId,
      'high'  // Booking affects ticket state
    );
  }
}
```

**Why forbidden:** Capabilities must not modify each other's entities.

### Capabilities MUST NOT Own Shared Runtime Workflows

```typescript
// ❌ FORBIDDEN
class UniversalWorkflowEngine {
  workflows = {
    'post-booking': [
      { step: 'createTicket', capability: 'support' },
      { step: 'sendSurvey', capability: 'lead-funnel' },
      { step: 'updateCRM', capability: 'external' },
    ],
  };
}
```

**Why forbidden:** Shared workflows couple capabilities.

---

## SECTION 5 — BOUNDARY DEFINITIONS

### Boundary 1: Runtime Is Absolute

Runtime services NEVER:
- Import other template runtime services
- Call other template business methods
- Emit events that trigger other templates
- Share state with other templates

```
BookingRuntimeService ──❌── SupportRuntimeService
     │
     ✅ Platform services only
     (Telegram, Customer, Analytics)
```

### Boundary 2: Operational Is Compositional

Operational services MAY:
- Query multiple templates for display
- Aggregate metrics across templates
- Compose views from multiple templates
- Show parallel capability data

```
DashboardService ──✅── BookingQueryService
              ──✅── SupportQueryService
              ──✅── LeadFunnelQueryService
              │
              ❌ NO runtime calls
```

### Boundary 3: Customer Is Identity Only

Customer layer NEVER:
- Knows about capability entities
- Mediates capability interactions
- Stores capability-specific state
- Emits capability-specific events

### Boundary 4: Events Are Observational

Events NEVER:
- Trigger cross-capability actions
- Start workflows
- Execute business logic
- Mutate state

### Boundary 5: Metadata Is Declarative

Metadata (OwnerModuleRegistry) NEVER:
- Contains business logic
- Defines transitions
- Specifies workflows
- Conditions behavior

---

## SECTION 6 — WHERE BOUNDARIES MUST NEVER BE CROSSED

### Red Line 1: Runtime Cross-Calls

**NEVER allow:**
```typescript
// In BookingRuntimeService
await supportRuntimeService.createTicket(...);
```

**Consequence if crossed:** Capabilities become tightly coupled. Changing one breaks another.

### Red Line 2: Event-Driven Orchestration

**NEVER allow:**
```typescript
eventBus.on('booking.confirmed', async (e) => {
  await supportService.createTicket(e.customerId);
});
```

**Consequence if crossed:** Platform becomes event-driven workflow engine.

### Red Line 3: Universal State Machines

**NEVER allow:**
```typescript
class UniversalStateMachine {
  async transition(entity: any, from: string, to: string) {
    // Works for bookings, tickets, leads...
  }
}
```

**Consequence if crossed:** All capabilities forced into same abstraction.

### Red Line 4: Capability Dependency Graphs

**NEVER allow:**
```typescript
const DEPENDENCIES = {
  'lead-funnel': ['booking'],
  'booking': ['support'],
};
```

**Consequence if crossed:** Capabilities cannot exist independently.

### Red Line 5: Shared Runtime State

**NEVER allow:**
```typescript
class SharedRuntimeState {
  customerStates = new Map();  // All capabilities write here
}
```

**Consequence if crossed:** Race conditions, coupling, untraceable bugs.

---

## SECTION 7 — ECOSYSTEM MATURITY LEVELS

### Level 1: Coexistence (CURRENT)

Capabilities:
- Exist independently
- Share operational visibility
- Share customers
- Have no runtime interaction

**Status:** ✅ ACHIEVED

### Level 2: Operational Composition (CURRENT)

Capabilities:
- Display side by side in dashboard
- Aggregate metrics together
- Show in unified customer views
- Still no runtime interaction

**Status:** ✅ ACHIEVED

### Level 3: Operational Coordination (NOT YET)

Capabilities:
- Owner manually coordinates between capabilities
- Example: Owner sees booking, manually creates follow-up ticket
- No automatic coordination

**Status:** ⚠️ FUTURE — Manual only, never automatic

### Level 4: Ecosystem Automation (FORBIDDEN)

Capabilities:
- Automatically trigger each other
- Cross-capability workflows
- Event-driven orchestration

**Status:** ❌ NEVER

---

## SECTION 8 — CANONICAL ECOSYSTEM RULES

### Rule 1: Capabilities Are Islands

Each capability is an independent island. Platform provides the ocean.

### Rule 2: Operational Visibility Is a Telescope

Dashboard shows islands from above. It does not build bridges.

### Rule 3: Customer Is the Passport

Customer identity lets owner recognize the same person across islands. It does not grant visa-free travel.

### Rule 4: Events Are Postcards

Events tell owner what happened on an island. They are not telegrams ordering action.

### Rule 5: Metadata Is a Map

Metadata shows where islands are. It does not control island behavior.

---

## SECTION 9 — VALIDATION CHECKLIST

Before adding any cross-capability feature:

- [ ] No runtime service imports another template
- [ ] No event triggers cross-capability action
- [ ] No capability mutates another's state
- [ ] No shared workflow engine
- [ ] No capability dependency graph
- [ ] No universal state machine
- [ ] Operational composition is read-only
- [ ] Human decision required for cross-capability actions

---

**Version 1.0 — 2026-05-23**
