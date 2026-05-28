# Forbidden Operational Patterns

**Purpose:** Document and ban operational orchestration patterns  
**Status:** CANONICAL — Tier 2 Anti-Pattern  
**Version:** 1.0  
**Phase:** PRE-UNIT-04 Stabilization  
**Date:** 2026-05-23

---

## FORBIDDEN PATTERN 1: Operational Orchestration Engines

### What It Is

A system that orchestrates operational actions across capabilities.

```typescript
// ❌ FORBIDDEN
@Injectable()
class OperationalOrchestrator {
  async executeOperation(operation: string, context: OperationContext) {
    switch (operation) {
      case 'onboard':
        await this.bookingRuntimeService.createWelcomeBooking(context);
        await this.supportRuntimeService.createOnboardingTicket(context);
        await this.leadFunnelService.createLeadEntry(context);
        break;
      case 'resolve':
        await this.bookingRuntimeService.completeBooking(context.bookingId);
        await this.supportRuntimeService.resolveTicket(context.ticketId);
        break;
    }
  }
}
```

### Why It Appears Attractive
- "One-click" operations
- Consistent user experience
- "Smart" platform features

### Why It Corrupts Architecture
- Becomes workflow engine
- Orchestrates capabilities
- Creates cross-capability dependencies
- Platform becomes BPM

### Safe Alternative
```typescript
// ✅ CORRECT: Owner manually executes
class BookingController {
  async createBooking(data: CreateBookingDto) {
    return this.bookingRuntimeService.createBooking(data);
  }
}

class SupportController {
  async createTicket(data: CreateTicketDto) {
    return this.supportRuntimeService.createTicket(data);
  }
}
// No orchestration. Owner manually performs each action.
```

---

## FORBIDDEN PATTERN 2: Cross-Capability Workflows

### What It Is

Workflows that span multiple capabilities.

```typescript
// ❌ FORBIDDEN
@Injectable()
class CustomerOnboardingWorkflow {
  async execute(customerId: string) {
    // Step 1: Create booking
    const booking = await this.bookingRuntimeService.createBooking({
      customerId,
      date: getNextAvailableDate(),
    });
    
    // Step 2: Create support ticket
    await this.supportRuntimeService.createTicket({
      customerId,
      subject: 'Welcome! How can we help?',
    });
    
    // Step 3: Create lead entry
    await this.leadFunnelService.createLead({
      customerId,
      source: 'onboarding',
    });
    
    // Step 4: Schedule follow-up
    await this.scheduler.schedule(customerId, 7);
  }
}
```

### Why It Appears Attractive
- Automated onboarding
- Consistent customer journey
- "Seamless" experience

### Why It Corrupts Architecture
- Creates workflow dependencies
- Capabilities become coupled
- Platform becomes BPM
- Hard to change individual capabilities

### Safe Alternative
```typescript
// ✅ CORRECT: No workflows
// Owner manually:
// 1. Creates booking
// 2. Creates ticket (if needed)
// 3. Creates lead (if needed)
// No automated sequence
```

---

## FORBIDDEN PATTERN 3: Shared Lifecycle Systems

### What It Is

A system that manages lifecycle across capabilities.

```typescript
// ❌ FORBIDDEN
@Injectable()
class CustomerLifecycleManager {
  async processLifecycle(customerId: string) {
    const customer = await this.getCustomer(customerId);
    
    // Determine lifecycle stage
    const stage = this.determineStage(customer);
    
    // Execute lifecycle actions
    switch (stage) {
      case 'new':
        await this.onboardCustomer(customerId);
        break;
      case 'active':
        await this.engageCustomer(customerId);
        break;
      case 'at-risk':
        await this.retainCustomer(customerId);
        break;
      case 'churned':
        await this.winBackCustomer(customerId);
        break;
    }
  }
}
```

### Why It Appears Attractive
- "Smart" customer management
- Automated engagement
- Lifecycle optimization

### Why It Corrupts Architecture
- Becomes CRM engine
- Orchestrates all capabilities
- Encodes business rules
- Platform becomes customer lifecycle manager

### Safe Alternative
```typescript
// ✅ CORRECT: No lifecycle management
// Capabilities manage their own lifecycle
// No cross-capability lifecycle
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Booking manages its own lifecycle
  }
}
```

---

## FORBIDDEN PATTERN 4: Projection Synchronization

### What It Is

Synchronizing projections across systems.

```typescript
// ❌ FORBIDDEN
@Injectable()
class ProjectionSyncService {
  @Cron('*/1 * * * *')
  async syncProjections() {
    const bookings = await this.bookingRepository.find();
    
    for (const booking of bookings) {
      // Sync projection to cache
      await this.redis.set(
        `booking:${booking.id}`,
        JSON.stringify(booking)
      );
      
      // Sync projection to search index
      await this.searchIndex.index(booking);
      
      // Sync projection to analytics
      await this.analytics.track(booking);
    }
  }
}
```

### Why It Appears Attractive
- "Always fresh" projections
- Real-time search
- Analytics accuracy

### Why It Corrupts Architecture
- Projection becomes truth
- Synchronization complexity
- Race conditions
- System depends on sync

### Safe Alternative
```typescript
// ✅ CORRECT: Recompute on demand
class BookingQueryService {
  async getBooking(bookingId: string) {
    // Fresh on each request
    return this.bookingRepository.findOne({ where: { id: bookingId } });
  }
}
```

---

## FORBIDDEN PATTERN 5: Reactive Operational Automations

### What It Is

Automated actions triggered by operational events.

```typescript
// ❌ FORBIDDEN
@Injectable()
class ReactiveAutomationService {
  @OnEvent('booking.created')
  async onBookingCreated(event: BookingCreated) {
    // Auto-create welcome ticket
    await this.supportRuntimeService.createTicket({
      customerId: event.customerId,
      subject: 'Welcome! Questions about your booking?',
    });
    
    // Auto-add to lead funnel
    await this.leadFunnelService.createLead({
      customerId: event.customerId,
      source: 'booking',
    });
    
    // Auto-schedule follow-up
    await this.scheduler.schedule(event.customerId, 7);
  }
}
```

### Why It Appears Attractive
- "Smart" automation
- Proactive customer service
- Efficiency gains

### Why It Corrupts Architecture
- Events trigger actions
- Hidden automation
- Cross-capability coupling
- Platform becomes reactive engine

### Safe Alternative
```typescript
// ✅ CORRECT: No reactive automation
// Owner manually:
// 1. Creates booking
// 2. Creates ticket (if needed)
// 3. Schedules follow-up (if needed)
// No automatic triggers
```

---

## FORBIDDEN PATTERN 6: Runtime-Triggered Operational Mutations

### What It Is

Runtime services triggering operational mutations.

```typescript
// ❌ FORBIDDEN
@Injectable()
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    const booking = await this.bookingRepository.save(data);
    
    // ❌ FORBIDDEN: Runtime triggers operational mutation
    await this.analyticsService.trackEvent('booking.created', {
      botId: data.botId,
      customerId: data.customerId,
    });
    
    // ❌ FORBIDDEN: Runtime triggers notification
    await this.notificationService.notifyOwner(data.botId, 'New booking');
    
    return booking;
  }
}
```

### Why It Appears Attractive
- "Complete" booking flow
- Automatic notifications
- Analytics tracking

### Why It Corrupts Architecture
- Runtime triggers side effects
- Hidden automation
- Side effects in business logic
- Hard to reason about

### Safe Alternative
```typescript
// ✅ CORRECT: Runtime only mutates its own state
@Injectable()
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Only creates booking
    const booking = this.bookingRepository.create(data);
    await this.bookingRepository.save(booking);
    
    return booking;
  }
}

// Analytics tracked separately
// Notifications handled separately
// No side effects in runtime
```

---

## FORBIDDEN PATTERN 7: Dashboard Execution Systems

### What It Is

Dashboards that execute business logic.

```typescript
// ❌ FORBIDDEN
@Controller('miniapp/bots')
class DashboardExecutionController {
  @Post(':id/bulk-resolve')
  async bulkResolveTickets(
    @Param('id') botId: string,
    @Body() ticketIds: string[],
  ) {
    // ❌ FORBIDDEN: Dashboard executes bulk actions
    for (const ticketId of ticketIds) {
      await this.supportRuntimeService.resolveTicket(ticketId);
    }
    
    await this.notificationService.notifyOwner(
      botId,
      `${ticketIds.length} tickets resolved`
    );
  }
}
```

### Why It Appears Attractive
- Bulk operations
- "Power user" features
- Efficiency

### Why It Corrupts Architecture
- Dashboard becomes execution layer
- Orchestrates bulk mutations
- Enables batch workflows
- Dashboard is now runtime

### Safe Alternative
```typescript
// ✅ CORRECT: Capability-specific execution
@Controller('miniapp/bots')
class SupportController {
  @Post(':id/tickets/:ticketId/resolve')
  async resolveTicket(
    @Param('id') botId: string,
    @Param('ticketId') ticketId: string,
  ) {
    // Single ticket resolution
    return this.supportRuntimeService.resolveTicket(ticketId);
  }
}
```

---

## FORBIDDEN PATTERN 8: Unified Customer Workflows

### What It Is

Workflows that manage customer across all capabilities.

```typescript
// ❌ FORBIDDEN
@Injectable()
class CustomerWorkflowService {
  async processCustomer(customerId: string) {
    const customer = await this.getCustomer(customerId);
    
    // Analyze customer across all capabilities
    const bookings = await this.bookingQueryService.getBookings(customerId);
    const tickets = await this.supportQueryService.getTickets(customerId);
    const leads = await this.leadFunnelQueryService.getLeads(customerId);
    
    // Determine workflow stage
    const stage = this.determineStage(bookings, tickets, leads);
    
    // Execute workflow actions
    await this.executeWorkflow(customerId, stage);
  }
}
```

### Why It Appears Attractive
- "360-degree" customer view
- Automated customer management
- Lifecycle optimization

### Why It Corrupts Architecture
- Becomes CRM workflow engine
- Orchestrates all capabilities
- Encodes customer lifecycle
- Platform becomes customer management system

### Safe Alternative
```typescript
// ✅ CORRECT: No unified workflows
// Each capability manages its own data
// No cross-capability customer workflow
```

---

## FORBIDDEN PATTERN 9: Smart Operational Routing

### What It Is

"Intelligent" routing based on operational data.

```typescript
// ❌ FORBIDDEN
@Injectable()
class SmartRoutingService {
  async routeTicket(ticketId: string) {
    const ticket = await this.ticketRepository.findOne(ticketId);
    const customer = await this.customerRepository.findOne(ticket.customerId);
    
    // Analyze customer history
    const bookings = await this.bookingQueryService.getBookings(customer.id);
    const leads = await this.leadFunnelQueryService.getLeads(customer.id);
    
    // Smart routing logic
    if (bookings.length > 10 && leads.length > 5) {
      ticket.priority = 'urgent';
      ticket.assignedTo = 'senior-agent';
    } else if (bookings.length > 5) {
      ticket.priority = 'high';
      ticket.assignedTo = 'experienced-agent';
    } else {
      ticket.priority = 'medium';
      ticket.assignedTo = 'junior-agent';
    }
    
    await this.ticketRepository.save(ticket);
  }
}
```

### Why It Appears Attractive
- "Intelligent" routing
- Personalized experience
- Optimized operations

### Why It Corrupts Architecture
- Cross-capability data used for decisions
- Platform makes business decisions
- Becomes AI/ML coordination layer
- Platform becomes decision engine

### Safe Alternative
```typescript
// ✅ CORRECT: Manual routing
@Injectable()
class SupportRuntimeService {
  async assignTicket(ticketId: string, agentId: string) {
    // Owner manually assigns
    const ticket = await this.ticketRepository.findOne(ticketId);
    ticket.assignedTo = agentId;
    await this.ticketRepository.save(ticket);
  }
}
```

---

## FORBIDDEN PATTERN 10: Event-Driven Business Coordination

### What It Is

Using events to coordinate business logic across capabilities.

```typescript
// ❌ FORBIDDEN
@Injectable()
class BusinessCoordinationService {
  @OnEvent('booking.confirmed')
  async onBookingConfirmed(event: BookingConfirmed) {
    // Coordinate support
    await this.supportRuntimeService.createTicket({
      customerId: event.customerId,
      subject: `Booking confirmed: ${event.bookingId}`,
    });
    
    // Coordinate lead funnel
    await this.leadFunnelService.updateLeadStatus(
      event.customerId,
      'converted'
    );
    
    // Coordinate analytics
    await this.analyticsService.trackConversion(event);
  }
}
```

### Why It Appears Attractive
- Decoupled architecture
- Event-driven design
- "Scalable" system

### Why It Corrupts Architecture
- Events orchestrate capabilities
- System becomes event-driven
- Capabilities coupled via events
- Platform becomes event bus

### Safe Alternative
```typescript
// ✅ CORRECT: No event coordination
// Capabilities do not listen to each other's events
// No cross-capability event handling
```

---

## SUMMARY TABLE

| Pattern | Complexity | Risk | Infrastructure | Safe Alternative |
|---------|-----------|------|----------------|------------------|
| Operational orchestration | VERY HIGH | VERY HIGH | Workflow engine | Manual execution |
| Cross-capability workflows | VERY HIGH | VERY HIGH | BPM engine | No workflows |
| Shared lifecycle | VERY HIGH | VERY HIGH | CRM engine | Capability-specific lifecycle |
| Projection sync | VERY HIGH | HIGH | Sync infrastructure | Recompute on demand |
| Reactive automation | VERY HIGH | VERY HIGH | Event bus | No automation |
| Runtime-triggered mutations | HIGH | HIGH | Notification system | Separate concerns |
| Dashboard execution | HIGH | HIGH | Execution engine | Capability-specific endpoints |
| Unified workflows | VERY HIGH | VERY HIGH | CRM engine | No unified workflows |
| Smart routing | HIGH | MEDIUM | AI/ML layer | Manual routing |
| Event-driven coordination | VERY HIGH | VERY HIGH | Event bus | No event coordination |

---

**Version 1.0 — PRE-UNIT-04 — 2026-05-23**
