# Projection Composition Rules

**Purpose:** Define how projections compose, aggregate, and what they must never expose  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## CORE DISTINCTIONS

### Aggregation ≠ Orchestration

| Aggregation (SAFE) | Orchestration (FORBIDDEN) |
|-------------------|--------------------------|
| Combines read-only data | Triggers actions across capabilities |
| `return { bookings, tickets }` | `await createTicketFromBooking()` |
| Observational only | Mutates state |
| No side effects | Side effects across capabilities |

### Visibility ≠ Coordination

| Visibility (SAFE) | Coordination (FORBIDDEN) |
|-------------------|-------------------------|
| Shows what exists | Determines what should happen |
| `return ticket.status` | `if (tickets > 10) { alert() }` |
| Passive observation | Active decision-making |
| No business logic | Encodes business rules |

### Projection ≠ Execution

| Projection (SAFE) | Execution (FORBIDDEN) |
|-------------------|----------------------|
| Computes derived view | Triggers runtime mutations |
| `return computedSlots` | `await bookingService.cancel()` |
| Read-only | Write operations |
| Advisory | Authoritative |

---

## SAFE COMPOSITION PATTERNS

### Pattern 1: Parallel Aggregation

```typescript
// ✅ SAFE: Parallel read-only aggregation
async getCustomerProfile(customerId: string) {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
    this.leadFunnelQueryService.getCustomerLeads(customerId),
  ]);
  
  // Pure aggregation — no logic, no mutation
  return {
    customerId,
    bookings: { count: bookings.length, items: bookings },
    tickets: { count: tickets.length, items: tickets },
    leads: { count: leads.length, items: leads },
  };
}
```

**Why Safe:**
- Read-only queries
- No business logic
- No state mutation
- Pure data composition

---

### Pattern 2: Capability-Neutral Metrics

```typescript
// ✅ SAFE: Capability-neutral aggregation
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

**Why Safe:**
- Aggregates capability-provided metrics
- Does not compute business logic
- No cross-capability knowledge
- Registry pattern isolates capabilities

---

### Pattern 3: Identity Linking

```typescript
// ✅ SAFE: Identity linking across capabilities
async getCustomerActivity(customerId: string) {
  const [bookings, tickets] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
  ]);
  
  // Links by identity only
  return {
    customerId,
    hasBookings: bookings.length > 0,
    hasTickets: tickets.length > 0,
  };
}
```

**Why Safe:**
- Links by customer identity only
- No inference about relationships
- No cross-capability logic
- Observational only

---

## FORBIDDEN COMPOSITION PATTERNS

### Pattern 1: Cross-Capability Mutation

```typescript
// ❌ FORBIDDEN: Cross-capability mutation in projection
async processCustomer(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  // ❌ FORBIDDEN: Projection triggers cross-capability mutation
  if (bookings.length > 0) {
    await this.supportRuntimeService.createTicket({
      customerId,
      subject: 'Follow-up for your booking',
    });
  }
}
```

**Why Forbidden:**
- Projection triggers mutation
- Cross-capability orchestration
- Hidden automation

---

### Pattern 2: Business Logic in Aggregation

```typescript
// ❌ FORBIDDEN: Business logic in projection
async getCustomerStatus(customerId: string) {
  const [bookings, tickets] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
  ]);
  
  // ❌ FORBIDDEN: Projection encodes business logic
  let status: string;
  if (bookings.length > 5 && tickets.length === 0) {
    status = 'vip';
  } else if (tickets.length > 3) {
    status = 'at-risk';
  } else {
    status = 'standard';
  }
  
  return { customerId, status };
}
```

**Why Forbidden:**
- Encodes business rules
- Becomes decision engine
- Cross-capability logic

---

### Pattern 3: Workflow Trigger

```typescript
// ❌ FORBIDDEN: Workflow trigger in projection
async getBotStats(botId: string) {
  const tickets = await this.supportQueryService.getOpenTickets(botId);
  
  // ❌ FORBIDDEN: Projection triggers workflow
  if (tickets.length > 10) {
    await this.escalationService.escalate(botId);
  }
  
  return { openTickets: tickets.length };
}
```

**Why Forbidden:**
- Triggers automation
- Becomes monitoring engine
- Projection causes side effects

---

## COMPOSITION RULES

### Rule 1: Composition Is Read-Only

Projections may compose data from multiple sources, but never mutate.

### Rule 2: Composition Is Observational

Projections observe and aggregate. They do not decide or act.

### Rule 3: Composition Does Not Encode Logic

Projections do not encode business rules, lifecycle logic, or automation.

### Rule 4: Composition Is Capability-Agnostic

Dashboard-level composition does not know capability internals.

### Rule 5: Composition Preserves Isolation

Composed projections preserve capability isolation boundaries.

---

**Version 1.0 — UNIT 04 — 2026-05-23**
