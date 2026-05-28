# Operational Gravity Analysis

**Purpose:** Analyze how platforms drift from visibility into orchestration  
**Status:** CANONICAL — Tier 2 Audit  
**Version:** 1.0  
**Phase:** PRE-UNIT-04 Stabilization  
**Date:** 2026-05-23

---

## SECTION 1 — WHAT IS OPERATIONAL GRAVITY

### Definition

**Operational Gravity** is the natural tendency of operational surfaces to evolve into orchestration systems.

### Why It Happens

1. **Visibility suggests action** — Seeing a problem makes you want to fix it
2. **Convenience suggests automation** — If you see data, why not act on it?
3. **Efficiency suggests orchestration** — Why do manually what can be automated?
4. **User experience suggests intelligence** — Users expect "smart" features

### The Drift Pattern

```
Operational Visibility
    ↓
Convenient Actions
    ↓
Automated Actions
    ↓
Workflow Orchestration
    ↓
Business Execution Engine
```

---

## SECTION 2 — DANGEROUS DRIFT PATTERNS

### Pattern 1: Unified Activity Feed

**What It Looks Like:**
```typescript
async getActivityFeed(customerId: string) {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
    this.leadFunnelQueryService.getCustomerLeads(customerId),
  ]);
  
  // ❌ DANGEROUS: Unified feed
  const feed = [...bookings, ...tickets, ...leads]
    .sort((a, b) => b.createdAt - a.createdAt);
  
  return feed;
}
```

**Why Attractive:**
- Single view of all activity
- Customer sees complete history
- "Holistic" customer view

**Why Corrupts:**
- Creates unified customer entity
- Enables cross-capability queries
- Sets up cross-capability actions
- Becomes customer lifecycle view

**Prevention:**
```typescript
// ✅ SAFE: Separate views
async getBookings(customerId: string) {
  return this.bookingQueryService.getCustomerBookings(customerId);
}

async getTickets(customerId: string) {
  return this.supportQueryService.getCustomerTickets(customerId);
}
// User navigates between views, no unified feed
```

---

### Pattern 2: Cross-Capability Actions

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Cross-capability action
class CustomerProfileController {
  async createTicketFromBooking(botId: string, bookingId: string) {
    const booking = await this.bookingQueryService.getBooking(bookingId);
    
    const ticket = await this.supportRuntimeService.createTicket({
      botId,
      customerId: booking.customerId,
      subject: `Issue with booking ${bookingId}`,
    });
    
    return ticket;
  }
}
```

**Why Attractive:**
- "One-click" support creation
- Contextual actions
- Seamless experience

**Why Corrupts:**
- Orchestrates booking → support
- Creates workflow dependency
- Enables booking → support automation
- Becomes cross-capability execution

**Prevention:**
```typescript
// ✅ SAFE: Capability-specific actions
class SupportController {
  async createTicket(data: CreateTicketDto) {
    // Support creates tickets
    return this.supportRuntimeService.createTicket(data);
  }
}

// User manually creates ticket with context
// Platform does NOT orchestrate
```

---

### Pattern 3: Operational Automations

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Operational automation
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    if (tickets.length > 10) {
      // ❌ FORBIDDEN: Automation trigger
      await this.sendOwnerAlert(botId, 'Too many open tickets');
    }
    
    return { openTickets: tickets.length };
  }
}
```

**Why Attractive:**
- Proactive notifications
- "Smart" dashboard
- Automated insights

**Why Corrupts:**
- Dashboard triggers automation
- Becomes monitoring engine
- Enables alert workflows
- Creates operational orchestration

**Prevention:**
```typescript
// ✅ SAFE: Observational only
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    // Just expose data
    return { openTickets: tickets.length };
  }
}

// Owner manually checks dashboard
// No automatic alerts
```

---

### Pattern 4: Shared Lifecycle Engines

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Shared lifecycle engine
class LifecycleEngine {
  async processCustomerLifecycle(customerId: string) {
    const bookings = await this.bookingQueryService.getBookings(customerId);
    const tickets = await this.supportQueryService.getTickets(customerId);
    
    // ❌ FORBIDDEN: Cross-capability lifecycle
    if (bookings.length > 0 && tickets.length === 0) {
      await this.createFollowUpTicket(customerId);
    }
    
    if (bookings.length === 0 && tickets.length > 5) {
      await this.sendRetentionOffer(customerId);
    }
  }
}
```

**Why Attractive:**
- "Smart" customer lifecycle
- Automated engagement
- Unified customer view

**Why Corrupts:**
- Becomes customer lifecycle engine
- Orchestrates all capabilities
- Creates customer workflow
- Platform becomes CRM

**Prevention:**
```typescript
// ✅ SAFE: No shared lifecycle
// Each capability manages its own lifecycle
// No cross-capability lifecycle logic

class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Booking-specific lifecycle only
  }
}

class SupportRuntimeService {
  async createTicket(data: CreateTicketDto) {
    // Support-specific lifecycle only
  }
}
```

---

### Pattern 5: Reactive Projection Systems

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Reactive projection
@Injectable()
class ReactiveProjectionService {
  constructor(
    @InjectEvent('booking.created')
    private bookingCreatedEvent: EventStream<BookingCreated>,
  ) {}
  
  @OnEvent('booking.created')
  async onBookingCreated(event: BookingCreated) {
    // ❌ FORBIDDEN: Reactive projection update
    await this.updateCustomerProfile(event.customerId);
    await this.updateDashboardMetrics(event.botId);
    await this.sendAnalyticsEvent(event);
  }
}
```

**Why Attractive:**
- Real-time updates
- Event-driven architecture
- "Always fresh" projections

**Why Corrupts:**
- Projections become reactive
- Events trigger side effects
- Projections orchestrate updates
- System becomes event-driven

**Prevention:**
```typescript
// ✅ SAFE: Request-scoped computation
class DashboardService {
  async getBotStats(botId: string) {
    // Compute fresh on each request
    return this.supportQueryService.getBotMetrics(botId);
  }
}

// No reactive updates
// Fresh on read
```

---

### Pattern 6: Operational Workflows

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Operational workflow
class OnboardingWorkflowService {
  async onboardCustomer(customerId: string) {
    // ❌ FORBIDDEN: Cross-capability workflow
    await this.createWelcomeBooking(customerId);
    await this.createOnboardingTicket(customerId);
    await this.createLeadEntry(customerId);
    
    // Schedule follow-up
    await this.scheduleFollowUp(customerId, 7);
  }
}
```

**Why Attractive:**
- Automated onboarding
- "One-click" setup
- Consistent customer journey

**Why Corrupts:**
- Becomes workflow engine
- Orchestrates capabilities
- Creates business process
- Platform becomes BPM

**Prevention:**
```typescript
// ✅ SAFE: No workflows
// Owner manually creates bookings, tickets, leads
// No automated sequences
```

---

### Pattern 7: Dashboard-Triggered Execution

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Dashboard execution
class DashboardController {
  async bulkProcessTickets(botId: string, ticketIds: string[]) {
    // ❌ FORBIDDEN: Dashboard triggers execution
    for (const ticketId of ticketIds) {
      await this.supportRuntimeService.resolveTicket(ticketId);
    }
    
    await this.sendBulkNotification(botId, 'Tickets resolved');
  }
}
```

**Why Attractive:**
- Bulk operations
- Efficient workflow
- "Power user" features

**Why Corrupts:**
- Dashboard becomes execution layer
- Orchestrates bulk mutations
- Enables batch workflows
- Dashboard is now runtime

**Prevention:**
```typescript
// ✅ SAFE: Capability-specific execution
class SupportController {
  async resolveTicket(botId: string, ticketId: string) {
    return this.supportRuntimeService.resolveTicket(ticketId);
  }
}

// Bulk operations require capability-specific endpoints
// Dashboard does NOT orchestrate
```

---

### Pattern 8: Event-Driven Orchestration

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Event-driven orchestration
@Injectable()
class BusinessOrchestrator {
  constructor(
    @InjectEvent('booking.confirmed')
    private bookingConfirmedEvent: EventStream<BookingConfirmed>,
  ) {}
  
  @OnEvent('booking.confirmed')
  async onBookingConfirmed(event: BookingConfirmed) {
    // ❌ FORBIDDEN: Cross-capability orchestration
    await this.createWelcomeTicket(event.customerId);
    await this.addToFulfillmentQueue(event.bookingId);
    await this.sendAnalyticsEvent(event);
  }
}
```

**Why Attractive:**
- Decoupled architecture
- Event-driven design
- "Scalable" system

**Why Corrupts:**
- Events orchestrate capabilities
- System becomes event-driven
- Capabilities are coupled via events
- Platform becomes event bus

**Prevention:**
```typescript
// ✅ SAFE: No event orchestration
// Capabilities do not listen to each other's events
// No cross-capability event handling
```

---

### Pattern 9: "Smart" Operational Coordination

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Smart coordination
class SmartRoutingService {
  async routeTicketToAgent(ticketId: string) {
    const ticket = await this.ticketRepository.findOne(ticketId);
    
    // Analyze customer history
    const customer = await this.customerRepository.findOne(ticket.customerId);
    const bookings = await this.bookingQueryService.getBookings(customer.id);
    
    // ❌ FORBIDDEN: Smart routing based on cross-capability data
    if (bookings.length > 5) {
      // VIP customer → route to senior agent
      ticket.assignedTo = 'senior-agent';
    } else {
      ticket.assignedTo = 'junior-agent';
    }
    
    await this.ticketRepository.save(ticket);
  }
}
```

**Why Attractive:**
- "Intelligent" routing
- Personalized experience
- Optimized operations

**Why Corrupts:**
- Cross-capability data used for decisions
- Platform makes business decisions
- Becomes AI/ML coordination layer
- Platform becomes decision engine

**Prevention:**
```typescript
// ✅ SAFE: Manual assignment
class SupportRuntimeService {
  async assignTicket(ticketId: string, agentId: string) {
    // Owner manually assigns
    const ticket = await this.ticketRepository.findOne(ticketId);
    ticket.assignedTo = agentId;
    await this.ticketRepository.save(ticket);
  }
}

// No smart routing
// Owner makes decisions
```

---

### Pattern 10: Recommendation Systems Becoming Automation

**What It Looks Like:**
```typescript
// ❌ DANGEROUS: Recommendation → automation
class RecommendationService {
  async getRecommendations(customerId: string) {
    const bookings = await this.bookingQueryService.getBookings(customerId);
    
    const lastBooking = bookings[bookings.length - 1];
    if (lastBooking && daysSince(lastBooking.completedAt) >= 30) {
      return [
        { type: 'book_again', message: 'Book again for 10% off' },
      ];
    }
    
    return [];
  }
}

// Later becomes:
class AutomationService {
  async triggerRecommendations(customerId: string) {
    const recommendations = await this.recommendationService.getRecommendations(customerId);
    
    for (const rec of recommendations) {
      if (rec.type === 'book_again') {
        // ❌ FORBIDDEN: Recommendation becomes automation
        await this.sendPromoEmail(customerId, '10% off');
      }
    }
  }
}
```

**Why Attractive:**
- "Smart" recommendations
- Automated marketing
- Increased conversions

**Why Corrupts:**
- Recommendations become actions
- Platform executes business logic
- Becomes marketing automation
- Platform becomes CRM

**Prevention:**
```typescript
// ✅ SAFE: Recommendations only, no automation
class RecommendationService {
  async getRecommendations(customerId: string) {
    const bookings = await this.bookingQueryService.getBookings(customerId);
    
    // Just show recommendations
    return [
      { type: 'book_again', message: 'Book again for 10% off' },
    ];
  }
}

// Owner manually sends emails if needed
// No automation from recommendations
```

---

## SECTION 3 — PREVENTION STRATEGIES

### Strategy 1: Strict Capability Boundaries

```typescript
// ✅ CORRECT: Each capability isolated
class BookingQueryService { /* booking-only logic */ }
class SupportQueryService { /* support-only logic */ }
class LeadFunnelQueryService { /* lead-only logic */ }

// No shared query services
// No cross-capability logic
```

### Strategy 2: Read-Only Projections

```typescript
// ✅ CORRECT: Projections are read-only
class DashboardService {
  async getBotStats(botId: string) {
    const bookings = await this.bookingQueryService.getMetrics(botId);
    const tickets = await this.supportQueryService.getMetrics(botId);
    
    return { bookings, tickets };  // Read-only aggregation
  }
}
```

### Strategy 3: No Automation Triggers

```typescript
// ✅ CORRECT: No automation in projections
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    // Just expose data
    return { openTickets: tickets.length };
    // No sendAlert(), no triggerAutomation()
  }
}
```

### Strategy 4: Manual Execution Only

```typescript
// ✅ CORRECT: Owner manually executes
class SupportController {
  async resolveTicket(botId: string, ticketId: string) {
    return this.supportRuntimeService.resolveTicket(ticketId);
  }
}

// No bulk operations
// No automated workflows
// No scheduled actions
```

---

## SECTION 4 — VALIDATION GATES

### Gate 1: No Unified Activity Feed

```bash
grep -r "activityFeed\|unified.*history\|all.*activity" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Cross-Capability Actions

```bash
grep -r "createTicket.*booking\|createBooking.*ticket\|cross.*capability" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Operational Automations

```bash
grep -r "dashboard.*alert\|metric.*trigger\|summary.*action" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Shared Lifecycle Engines

```bash
grep -r "LifecycleEngine\|customerLifecycle\|unified.*lifecycle" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Reactive Projections

```bash
grep -r "ReactiveProjection\|@OnEvent.*booking\|@OnEvent.*ticket" src/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — PRE-UNIT-04 — 2026-05-23**
