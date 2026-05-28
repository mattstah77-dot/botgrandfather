# Read Model Anti-Patterns

**Purpose:** Document forbidden read-model, aggregation, and dashboard patterns  
**Status:** CANONICAL — Tier 3 Anti-Pattern  
**Version:** 1.0  
**Unit:** 05 — Projection Consumption & Operational Read Models  
**Date:** 2026-05-23

---

## ANTI-PATTERN 1: Executable Dashboards

### What It Is

Dashboards that execute business logic or mutations.

```typescript
// ❌ FORBIDDEN: Executable dashboard
class DashboardController {
  @Post(':id/process-bookings')
  async processBookings(@Param('id') botId: string) {
    const bookings = await this.bookingQueryService.getPendingBookings(botId);
    
    // ❌ FORBIDDEN: Dashboard executes mutations
    for (const booking of bookings) {
      await this.bookingRuntimeService.confirmBooking(booking.id);
    }
    
    return { processed: bookings.length };
  }
}
```

### Why Forbidden
- Dashboard becomes execution layer
- Bulk operations without explicit intent
- Dashboard is now runtime

### Safe Alternative
```typescript
// ✅ CORRECT: Capability-specific endpoint
class BookingController {
  @Post(':id/bookings/:bookingId/confirm')
  async confirmBooking(
    @Param('id') botId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingRuntimeService.confirmBooking(bookingId);
  }
}
```

---

## ANTI-PATTERN 2: Workflow Dashboards

### What It Is

Dashboards that orchestrate multi-step workflows.

```typescript
// ❌ FORBIDDEN: Workflow dashboard
class OnboardingDashboardController {
  @Post(':id/onboard-customer')
  async onboardCustomer(
    @Param('id') botId: string,
    @Body() customerId: string,
  ) {
    // ❌ FORBIDDEN: Dashboard orchestrates workflow
    await this.bookingRuntimeService.createWelcomeBooking(customerId);
    await this.supportRuntimeService.createTicket({
      customerId,
      subject: 'Welcome!',
    });
    await this.leadFunnelService.createLead({ customerId });
    
    return { onboarded: true };
  }
}
```

### Why Forbidden
- Dashboard becomes workflow engine
- Cross-capability orchestration
- Hidden automation

### Safe Alternative
```typescript
// ✅ CORRECT: No workflow dashboard
// Owner manually performs each action
// No automated sequences
```

---

## ANTI-PATTERN 3: Synchronization Dashboards

### What It Is

Dashboards that synchronize state across capabilities.

```typescript
// ❌ FORBIDDEN: Synchronization dashboard
class SyncDashboardController {
  @Post(':id/sync-bookings-to-tickets')
  async syncBookingsToTickets(@Param('id') botId: string) {
    const bookings = await this.bookingQueryService.getBotBookings(botId);
    
    // ❌ FORBIDDEN: Dashboard synchronizes capabilities
    for (const booking of bookings) {
      await this.supportRuntimeService.createTicket({
        customerId: booking.customerId,
        subject: `Booking: ${booking.id}`,
      });
    }
  }
}
```

### Why Forbidden
- State synchronization across capabilities
- Creates coupling
- Becomes integration layer

### Safe Alternative
```typescript
// ✅ CORRECT: Capabilities remain independent
// No synchronization
// No cross-capability state linking
```

---

## ANTI-PATTERN 4: Smart Operational Routing

### What It Is

Dashboards that make operational decisions based on data.

```typescript
// ❌ FORBIDDEN: Smart routing
class SmartDashboardService {
  async getTicketRecommendations(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    // ❌ FORBIDDEN: Dashboard makes decisions
    return tickets.map(ticket => ({
      ...ticket,
      recommendedAction: this.determineAction(ticket),  // Business logic!
      priority: this.calculatePriority(ticket),          // Scoring!
      shouldEscalate: this.shouldEscalate(ticket),      // Decision!
    }));
  }
}
```

### Why Forbidden
- Dashboard becomes decision engine
- Business logic in projection
- Automation from analytics

### Safe Alternative
```typescript
// ✅ CORRECT: Dashboard shows data only
class DashboardService {
  async getTickets(botId: string) {
    return this.supportQueryService.getOpenTickets(botId);
    // No recommendations
    // No scoring
    // No decisions
  }
}
```

---

## ANTI-PATTERN 5: Projection-Owned Lifecycle Logic

### What It Is

Read models that encode lifecycle state or transitions.

```typescript
// ❌ FORBIDDEN: Projection owns lifecycle
class CustomerReadModel {
  async getCustomerState(customerId: string) {
    const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
    const tickets = await this.supportQueryService.getCustomerTickets(customerId);
    
    // ❌ FORBIDDEN: Projection defines lifecycle
    let lifecycleStage: string;
    if (bookings.length === 0) {
      lifecycleStage = 'new';
    } else if (this.daysSinceLastBooking(bookings) > 30) {
      lifecycleStage = 'at-risk';
    } else {
      lifecycleStage = 'active';
    }
    
    return { customerId, lifecycleStage };
  }
}
```

### Why Forbidden
- Projection becomes lifecycle manager
- Business logic in read model
- CRM drift

### Safe Alternative
```typescript
// ✅ CORRECT: Projection shows history only
class CustomerReadModel {
  async getCustomerHistory(customerId: string) {
    const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
    
    return {
      customerId,
      bookingCount: bookings.length,
      lastBookingDate: bookings[bookings.length - 1]?.date,
      // No lifecycle stage
      // No business logic
    };
  }
}
```

---

## ANTI-PATTERN 6: Read Model Authority

### What It Is

Read models used as authority for business decisions.

```typescript
// ❌ FORBIDDEN: Read model as authority
class BookingReadModel {
  async canAcceptBooking(botId: string): Promise<boolean> {
    const count = await this.bookingRepository.count({ where: { botId } });
    return count < 100;  // Read model enforces rule!
  }
}

class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // ❌ FORBIDDEN: Uses read model for validation
    if (!await this.bookingReadModel.canAcceptBooking(data.botId)) {
      throw new Error('Limit reached');
    }
    
    return this.bookingRepository.save(data);
  }
}
```

### Why Forbidden
- Read model becomes business rule
- Projection enforces authority
- Violates authority hierarchy

### Safe Alternative
```typescript
// ✅ CORRECT: Runtime validates against truth
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Runtime validates against truth (if needed)
    // Or database constraint enforces limit
    return this.bookingRepository.save(data);
  }
}
```

---

## SUMMARY TABLE

| Anti-Pattern | Risk | Prevention |
|--------------|------|------------|
| Executable dashboards | VERY HIGH | Capability-specific endpoints only |
| Workflow dashboards | VERY HIGH | No workflow endpoints |
| Synchronization dashboards | VERY HIGH | No sync endpoints |
| Smart operational routing | HIGH | Show data, don't decide |
| Projection-owned lifecycle | HIGH | No lifecycle in projections |
| Read model authority | HIGH | Runtime validates against truth |

---

**Version 1.0 — UNIT 05 — 2026-05-23**
