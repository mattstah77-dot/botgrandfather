# Ecosystem Drift

**Purpose:** Document forbidden future directions as ecosystem grows  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — THE DRIFT THREAT

As BotGrandFather grows from 3 to 5 to 10+ capabilities, new temptations emerge.

**The pattern:**
1. Multiple capabilities exist
2. Owner requests cross-capability features
3. Developer sees "common patterns"
4. Abstraction temptation grows
5. Framework creep begins

**This document is a shield against that pattern.**

---

## SECTION 2 — FORBIDDEN DIRECTIONS

### Forbidden 1: Capability-to-Capability Runtime Calls

**Temptation:** "When booking is confirmed, the customer might need support. Let's create a ticket automatically."

**Bad Example:**
```typescript
class BookingRuntimeService {
  async confirmBooking() {
    await this.bookingRepository.save(booking);
    await this.analytics.trackEvent('booking.confirmed');

    // ❌ FORBIDDEN: Booking calls support
    await this.supportRuntimeService.createTicket(
      booking.customerId,
      'Post-booking follow-up'
    );
  }
}
```

**Why dangerous:**
- Booking now depends on support
- Support changes break booking
- Testing requires both capabilities
- Deployment is coupled

**What to do instead:**
- Owner manually creates follow-up ticket
- Or: Support template has independent logic
- Never: Automatic cross-capability action

---

### Forbidden 2: Cross-Template Workflow Engines

**Temptation:** "Owners want customer journeys: lead → booking → support. Let's build a workflow engine."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Universal workflow engine
class WorkflowEngine {
  workflows = {
    'customer-onboarding': [
      { step: 'captureLead', capability: 'lead-funnel' },
      { step: 'scheduleBooking', capability: 'booking' },
      { step: 'provideSupport', capability: 'support' },
    ],
  };

  async execute(workflowId: string, customerId: string) {
    for (const step of this.workflows[workflowId]) {
      await this.capabilities[step.capability].execute(step.step, customerId);
    }
  }
}
```

**Why dangerous:**
- This IS a framework
- Capabilities lose independence
- Workflows become untestable
- Platform becomes no-code engine

**What to do instead:**
- Each capability operates independently
- Owner manually moves customer between capabilities
- No automatic journey execution

---

### Forbidden 3: Global Orchestration Systems

**Temptation:** "We need a central system that knows about all capabilities and coordinates them."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Global orchestrator
class OrchestrationService {
  async processCustomerEvent(event: CustomerEvent) {
    // Central brain decides what happens
    if (event.type === 'message.received') {
      const context = await this.buildContext(event);
      const actions = await this.decideActions(context);
      for (const action of actions) {
        await this.executeAction(action);
      }
    }
  }

  async decideActions(context: Context): Promise<Action[]> {
    // AI/ML/rules decide cross-capability actions
    // This is a framework
  }
}
```

**Why dangerous:**
- Central brain becomes god service
- All capabilities depend on orchestrator
- Logic is opaque and untestable
- Platform becomes chatbot framework

**What to do instead:**
- Each handler processes its own messages
- No central decision maker
- Explicit routing in template factory

---

### Forbidden 4: Universal Lifecycle Engines

**Temptation:** "Booking has states. Tickets have states. Leads have states. Let's extract a universal state machine."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Universal state machine
abstract class LifecycleEntity {
  id: string;
  status: string;
  abstract transitions: Record<string, string[]>;
}

class UniversalStateMachine {
  async transition(entity: LifecycleEntity, toStatus: string) {
    if (entity.transitions[entity.status].includes(toStatus)) {
      entity.status = toStatus;
      await this.repository.save(entity);
    }
  }
}
```

**Why dangerous:**
- Forces different capabilities into same abstraction
- State semantics vary (booking "confirmed" ≠ ticket "resolved")
- Transition logic becomes generic and wrong
- Capabilities lose expressiveness

**What to do instead:**
- Each capability has explicit methods: `confirmBooking()`, `resolveTicket()`
- No generic transition method
- State is capability-specific

---

### Forbidden 5: Event-Driven Runtime Automation

**Temptation:** "Events are already emitted. Let's use them to trigger actions automatically."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Event-driven automation
class EventAutomationEngine {
  rules = [
    {
      when: 'booking.confirmed',
      then: [
        { action: 'createTicket', params: { priority: 'high' } },
        { action: 'sendEmail', params: { template: 'confirmation' } },
        { action: 'updateCRM', params: { stage: 'booked' } },
      ],
    },
  ];

  async onEvent(event: PlatformEvent) {
    const matchingRules = this.rules.filter(r => r.when === event.type);
    for (const rule of matchingRules) {
      for (const action of rule.then) {
        await this.executeAction(action, event);
      }
    }
  }
}
```

**Why dangerous:**
- Events trigger mutations
- Causal chains become invisible
- Debugging is impossible
- Platform becomes IFTTT/Zapier clone

**What to do instead:**
- Events are observational only
- Analytics tracks events for reporting
- No event handlers that mutate state

---

### Forbidden 6: Shared Runtime State Machines

**Temptation:** "Customer has a global state across all capabilities. Let's track it."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Shared customer state
class CustomerStateManager {
  states = new Map<string, CustomerState>();

  async updateState(customerId: string, capability: string, state: string) {
    const current = this.states.get(customerId);
    current[capability] = state;
    current.globalState = this.computeGlobalState(current);
    this.states.set(customerId, current);
  }

  computeGlobalState(states: Record<string, string>): string {
    // Derive global state from all capability states
    // "active-booking-open-ticket"
  }
}
```

**Why dangerous:**
- Global state couples all capabilities
- Race conditions between capabilities
- State semantics become meaningless
- Capabilities cannot exist independently

**What to do instead:**
- Each capability tracks its own state
- Customer has identity only
- No global state computation

---

### Forbidden 7: Capability Dependency Graphs

**Temptation:** "Let's define which capabilities depend on which."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Capability dependencies
const CAPABILITY_GRAPH = {
  'lead-funnel': {
    provides: ['leads'],
    requires: [],
    triggers: ['booking'],
  },
  'booking': {
    provides: ['appointments'],
    requires: ['lead-funnel'],
    triggers: ['support'],
  },
  'support': {
    provides: ['tickets'],
    requires: ['booking'],
    triggers: [],
  },
};
```

**Why dangerous:**
- Capabilities cannot exist independently
- Adding capability requires graph updates
- Circular dependencies emerge
- Deployment order becomes critical

**What to do instead:**
- No dependency graph
- Each capability is self-contained
- Capabilities coexist, not depend

---

### Forbidden 8: Universal Operational DSLs

**Temptation:** "Let's create a DSL for defining operational views."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Operational DSL
const dashboardConfig = {
  widgets: [
    {
      type: 'metric',
      source: 'booking.count',
      filter: { status: 'confirmed' },
    },
    {
      type: 'list',
      source: 'support.tickets',
      filter: { status: 'open' },
      sort: 'createdAt:desc',
    },
  ],
};
```

**Why dangerous:**
- DSL becomes no-code engine
- Logic moves from code to configuration
- Type safety lost
- Debugging becomes configuration debugging

**What to do instead:**
- Explicit TypeScript code
- Explicit components
- No configuration-driven logic

---

### Forbidden 9: Recursive Operational Metadata

**Temptation:** "Metadata can describe itself. Let's make metadata recursive."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Recursive metadata
interface MetaMetadata {
  type: 'metadata';
  schema: MetaMetadataSchema;
  validators: MetaMetadataValidator[];
  // Metadata about metadata about metadata...
}
```

**Why dangerous:**
- Infinite recursion
- Unbounded complexity
- Metadata becomes self-referential nightmare
- No ground truth

**What to do instead:**
- Flat metadata structures
- No self-reference
- Explicit, bounded schemas

---

### Forbidden 10: Automatic Capability Chaining

**Temptation:** "When customer finishes one capability, automatically start the next."

**Bad Example:**
```typescript
// ❌ FORBIDDEN: Automatic chaining
class CapabilityChainEngine {
  chains = {
    'onboarding': ['lead-funnel', 'booking', 'support'],
  };

  async onCapabilityComplete(capability: string, customerId: string) {
    const chain = this.findChain(capability);
    const nextIndex = chain.indexOf(capability) + 1;
    if (nextIndex < chain.length) {
      await this.startCapability(chain[nextIndex], customerId);
    }
  }
}
```

**Why dangerous:**
- Capabilities forced into sequences
- Customer has no choice
- Platform becomes funnel builder
- Capabilities lose independence

**What to do instead:**
- Customer chooses which capability to use
- Owner configures bots independently
- No automatic progression

---

## SECTION 3 — DRIFT DETECTION SIGNALS

### Signal 1: "When X happens, do Y"

**Example:** "When booking is confirmed, create a ticket."

**Diagnosis:** Event-driven orchestration.

**Response:** Reject. Events are observational.

### Signal 2: "All capabilities need..."

**Example:** "All capabilities need a state machine."

**Diagnosis:** Universal abstraction temptation.

**Response:** Reject. Abstract at 3+ proven repetitions.

### Signal 3: "Let's make it configurable"

**Example:** "Let's make the dashboard configurable per capability."

**Diagnosis:** DSL/metadata creep.

**Response:** Reject. Explicit code over configuration.

### Signal 4: "The customer journey..."

**Example:** "The customer journey flows from lead to booking to support."

**Diagnosis:** Workflow engine temptation.

**Response:** Reject. Capabilities are independent.

### Signal 5: "We need a central..."

**Example:** "We need a central orchestration service."

**Diagnosis:** Framework building.

**Response:** Reject. No central brain.

---

## SECTION 4 — WHAT TO DO INSTEAD

| Forbidden | Safe Alternative |
|-----------|-----------------|
| Cross-capability runtime calls | Manual owner action |
| Workflow engine | Independent capabilities |
| Global orchestrator | Explicit handler routing |
| Universal state machine | Explicit lifecycle methods |
| Event-driven automation | Observational events only |
| Shared runtime state | Per-capability state |
| Capability dependency graph | Capability coexistence |
| Operational DSL | Explicit TypeScript |
| Recursive metadata | Flat metadata |
| Automatic capability chaining | Customer choice |

---

## SECTION 5 — ESCALATION PATH

When ecosystem drift is detected:

1. **Stop implementation immediately**
2. **Identify the drift pattern** (reference this document)
3. **Propose safe alternative** (reference "What to do instead")
4. **Document the decision** in decision log
5. **Update invariants** if new drift pattern discovered

---

**Version 1.0 — 2026-05-23**
