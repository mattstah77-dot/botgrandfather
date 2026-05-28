# Dashboard Consumption Contract

**Purpose:** Define how dashboards consume projections safely  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 05 — Projection Consumption & Operational Read Models  
**Date:** 2026-05-23

---

## DASHBOARD AS OBSERVER

### Role

Dashboard observes operational reality produced by capabilities.

### Contract

```typescript
// ✅ CORRECT: Dashboard observes
class DashboardService {
  async observeBotState(botId: string) {
    const bookings = await this.bookingQueryService.getBotMetrics(botId);
    const tickets = await this.supportQueryService.getBotMetrics(botId);
    
    return {
      bookings: { total: bookings.total, pending: bookings.pending },
      tickets: { open: tickets.open, resolved: tickets.resolved },
    };
  }
}
```

### Rules
- Queries capability query services
- Receives capability-defined projections
- Does not modify projections
- Does not compute business logic

---

## DASHBOARD AS RENDERER

### Role

Dashboard renders capability-defined projections for human consumption.

### Contract

```typescript
// ✅ CORRECT: Dashboard renders
class DashboardController {
  @Get(':id/overview')
  async renderOverview(@Param('id') botId: string) {
    const state = await this.dashboardService.observeBotState(botId);
    
    return {
      // Rendering adds NO semantics
      // Just formats capability-defined data
      cards: [
        { type: 'bookings', data: state.bookings },
        { type: 'tickets', data: state.tickets },
      ],
    };
  }
}
```

### Rules
- Formats data for display
- Adds NO business meaning
- Adds NO business logic
- UI-only transformations (colors, labels from backend)

---

## DASHBOARD AS AGGREGATOR

### Role

Dashboard aggregates capability-provided metrics into capability-neutral views.

### Contract

```typescript
// ✅ CORRECT: Dashboard aggregates capability-neutral metrics
class DashboardService {
  async aggregateOwnerMetrics(ownerId: string) {
    const providers = this.registry.getAll();
    let totalInteractions = 0;
    
    for (const provider of providers) {
      const metrics = await provider.getOwnerMetrics(ownerId);
      totalInteractions += metrics.total;
    }
    
    return { totalInteractions };  // Capability-neutral
  }
}
```

### Rules
- Aggregates only capability-provided metrics
- Uses capability-neutral terminology
- Does not know capability internals
- Read-only aggregation

---

## DASHBOARD FORBIDDEN ROLES

### NOT Orchestrator

```typescript
// ❌ FORBIDDEN: Dashboard orchestrates
class DashboardService {
  async processCustomer(customerId: string) {
    const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
    
    if (bookings.length > 0) {
      await this.supportRuntimeService.createTicket({
        customerId,
        subject: 'Follow-up',
      });  // Orchestration!
    }
  }
}
```

### NOT Coordinator

```typescript
// ❌ FORBIDDEN: Dashboard coordinates
class DashboardService {
  async coordinateBot(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    if (tickets.length > 10) {
      await this.escalationService.escalate(botId);  // Coordination!
    }
  }
}
```

### NOT Synchronizer

```typescript
// ❌ FORBIDDEN: Dashboard synchronizes
class DashboardService {
  async syncCapabilities(botId: string) {
    const bookings = await this.bookingQueryService.getBotBookings(botId);
    
    for (const booking of bookings) {
      await this.supportRuntimeService.createTicket({
        subject: `Booking: ${booking.id}`,  // Synchronization!
      });
    }
  }
}
```

### NOT Automation Engine

```typescript
// ❌ FORBIDDEN: Dashboard automates
class DashboardService {
  async monitorBot(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    if (tickets.length > 10) {
      await this.notificationService.sendAlert(botId);  // Automation!
    }
  }
}
```

---

## DASHBOARD CONSUMPTION FLOW

```
Capability Runtime
    │
    ├── Produces operational reality
    │
    ▼
Capability Query Service
    │
    ├── Exposes capability-defined projections
    │
    ▼
Dashboard Service
    │
    ├── OBSERVES: Reads projections
    ├── RENDERS: Formats for display
    └── AGGREGATES: Combines metrics
    │
    ▼
Dashboard Controller
    │
    └── Serves HTTP response
    │
    ▼
Client (Mini App / Browser)
    │
    └── Renders UI
```

### Key Properties

1. **No cross-capability imports in dashboard** — Dashboard imports query services only
2. **No runtime service imports** — Dashboard never imports runtime services
3. **Read-only** — Dashboard endpoints are GET-only (with rare capability-specific POST via separate controllers)
4. **No business logic** — Dashboard contains no business rules

---

## CANONICAL RULES

### Rule 1: Dashboard Observes Only

Dashboard reads projections. It does not create operational reality.

### Rule 2: Dashboard Renders Only

Dashboard formats data. It does not define business meaning.

### Rule 3: Dashboard Aggregates Neutrally

Dashboard combines metrics. It does not compute business logic.

### Rule 4: Dashboard Never Orchestrates

Dashboard does not coordinate capabilities.

### Rule 5: Dashboard Never Automates

Dashboard does not trigger automated actions.

### Rule 6: Dashboard Never Synchronizes

Dashboard does not sync state across capabilities.

### Rule 7: Dashboard Is Visibility Layer Only

Dashboard is the final layer of operational visibility, not execution.

---

**Version 1.0 — UNIT 05 — 2026-05-23**
