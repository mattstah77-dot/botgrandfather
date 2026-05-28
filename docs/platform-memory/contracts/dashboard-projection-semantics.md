# Dashboard Projection Semantics

**Purpose:** Define dashboard visibility, aggregation, and non-authority semantics  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## DASHBOARD IS

### Observational

Dashboard observes operational reality.

```typescript
// ✅ CORRECT: Dashboard observes
async getBotStats(botId: string) {
  const bookings = await this.bookingQueryService.getBotMetrics(botId);
  const tickets = await this.supportQueryService.getBotMetrics(botId);
  
  return {
    totalBookings: bookings.total,
    openTickets: tickets.open,
  };
}
```

### Aggregational

Dashboard aggregates capability-provided metrics.

```typescript
// ✅ CORRECT: Dashboard aggregates
async getOwnerStats(ownerId: string) {
  const providers = this.registry.getAll();
  let totalInteractions = 0;
  
  for (const provider of providers) {
    const metrics = await provider.getOwnerMetrics(ownerId);
    totalInteractions += metrics.total;
  }
  
  return { totalInteractions };
}
```

### Visualizational

Dashboard visualizes data for human consumption.

```typescript
// ✅ CORRECT: Dashboard visualizes
async getBotDashboard(botId: string) {
  const [bookings, tickets] = await Promise.all([
    this.bookingQueryService.getStatusDistribution(botId),
    this.supportQueryService.getStatusDistribution(botId),
  ]);
  
  return {
    bookingChart: bookings,  // For chart rendering
    ticketChart: tickets,    // For chart rendering
  };
}
```

---

## DASHBOARD IS NOT

### NOT Coordinating

```typescript
// ❌ FORBIDDEN: Dashboard coordinates
async processBot(botId: string) {
  const tickets = await this.supportQueryService.getOpenTickets(botId);
  
  if (tickets.length > 10) {
    await this.escalationService.escalate(botId);  // Coordination!
  }
}
```

### NOT Executing

```typescript
// ❌ FORBIDDEN: Dashboard executes
async bulkResolve(botId: string, ticketIds: string[]) {
  for (const id of ticketIds) {
    await this.supportRuntimeService.resolveTicket(id);  // Execution!
  }
}
```

### NOT Synchronizing

```typescript
// ❌ FORBIDDEN: Dashboard synchronizes
async syncBotData(botId: string) {
  const bookings = await this.bookingQueryService.getBotBookings(botId);
  
  for (const booking of bookings) {
    await this.supportRuntimeService.createTicket({
      subject: `Follow-up: ${booking.id}`,  // Sync!
    });
  }
}
```

### NOT Orchestrating

```typescript
// ❌ FORBIDDEN: Dashboard orchestrates
async onboardCustomer(customerId: string) {
  await this.bookingRuntimeService.createWelcomeBooking(customerId);
  await this.supportRuntimeService.createTicket({
    subject: 'Welcome!',
  });
  await this.leadFunnelService.createLead({
    customerId,
  });
}
```

---

## DASHBOARD BOUNDARIES

### What Dashboard MAY Do

| Action | Example | Why Safe |
|--------|---------|----------|
| **Observe** | Show ticket list | Read-only |
| **Aggregate** | Sum metrics | Capability-neutral |
| **Visualize** | Render charts | UI only |
| **Filter** | Apply date range | UX only |
| **Sort** | Order by date | UX only |
| **Paginate** | Split lists | UX only |

### What Dashboard MUST NOT Do

| Action | Example | Why Forbidden |
|--------|---------|---------------|
| **Coordinate** | Escalate based on metrics | Orchestration |
| **Execute** | Bulk resolve tickets | Execution layer |
| **Synchronize** | Create tickets from bookings | State sync |
| **Orchestrate** | Onboarding workflows | Workflow engine |
| **Automate** | Send alerts | Automation |
| **Decide** | Auto-assign tickets | Business logic |

---

## DASHBOARD IS HIGHEST DRIFT RISK

### Why Dashboard Is Dangerous

1. **Natural gravity well** — Dashboard sees all data
2. **Convenient actions** — Easy to add "quick actions"
3. **User expectations** — Users want "smart" features
4. **Visibility suggests control** — Seeing data makes you want to act

### Prevention Rules

| Rule | Implementation |
|------|---------------|
| **Read-only by default** | All dashboard endpoints are GET |
| **Capability-specific mutations** | POST goes to capability controllers |
| **No cross-capability endpoints** | No `/process` or `/orchestrate` |
| **No automation triggers** | No alerts, no schedules |
| **Explicit audit** | Review all dashboard PRs for drift |

---

## CANONICAL RULES

### Rule 1: Dashboard Observes

Dashboard shows operational reality. It does not create it.

### Rule 2: Dashboard Aggregates

Dashboard combines capability metrics. It does not compute business logic.

### Rule 3: Dashboard Visualizes

Dashboard renders data for humans. It does not act on data.

### Rule 4: Dashboard Never Coordinates

Dashboard does not orchestrate capabilities.

### Rule 5: Dashboard Never Executes

Dashboard does not trigger mutations.

### Rule 6: Dashboard Never Synchronizes

Dashboard does not sync state across capabilities.

### Rule 7: Dashboard Is Highest Risk

Dashboard requires maximum vigilance against drift.

---

**Version 1.0 — UNIT 04 — 2026-05-23**
