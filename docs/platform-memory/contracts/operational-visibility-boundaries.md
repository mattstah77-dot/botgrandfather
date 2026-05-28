# Operational Visibility Boundaries

**Purpose:** Define what operational surfaces may observe vs mutate  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — VISIBILITY VS AUTHORITY

### Core Principle

```
Visibility ≠ Authority

Operational surfaces MAY observe.
Operational surfaces MUST NOT mutate (except capability-specific actions).
```

### What This Means

| Concept | Meaning | Example |
|---------|---------|---------|
| **Visibility** | Read-only observation of data | Dashboard shows ticket list |
| **Authority** | Right to mutate state | SupportRuntimeService creates ticket |
| **Boundary** | Surfaces observe, capabilities mutate | Dashboard reads, Runtime writes |

---

## SECTION 2 — VISIBILITY MATRIX

### What Each Surface MAY Observe

| Surface | Observes | Authority |
|---------|----------|-----------|
| **Customer Dashboard** | Own bookings, tickets, leads | ✅ Create/cancel own |
| **Owner Dashboard** | All bot bookings, tickets, leads | ✅ Full bot-level mutation |
| **Support Dashboard** | All bot tickets | ✅ Assign, resolve, respond |
| **Booking Dashboard** | All bot bookings | ✅ Confirm, complete, cancel |
| **Lead Funnel Dashboard** | All bot leads | ✅ Convert, update status |
| **Customer Profile** | Own identity, history | ✅ Update own profile |

### What Each Surface MUST NOT Observe

| Surface | Cannot Observe | Reason |
|---------|---------------|--------|
| **Customer Dashboard** | Other customers' data | Privacy |
| **Owner Dashboard** | Other owners' bots | Multi-tenant |
| **Support Dashboard** | Booking runtime state | Capability isolation |
| **Booking Dashboard** | Lead conversion logic | Capability isolation |
| **Lead Funnel Dashboard** | Support ticket content | Privacy |

---

## SECTION 3 — MUTATION BOUNDARIES

### Capability-Specific Mutations (ALLOWED)

| Surface | May Mutate | Boundary |
|---------|-----------|----------|
| **Customer Dashboard** | Own bookings, tickets | Single customer |
| **Owner Dashboard** | Bot bookings, tickets, leads | Single bot |
| **Support Dashboard** | Assigned tickets | Support capability |
| **Booking Dashboard** | Bot bookings | Booking capability |
| **Lead Funnel Dashboard** | Bot leads | Lead capability |

### Cross-Capability Mutations (FORBIDDEN)

| Action | Why Forbidden |
|--------|--------------|
| Create ticket from booking | Cross-capability orchestration |
| Convert lead from support | Cross-capability orchestration |
| Cancel booking from lead | Cross-capability orchestration |
| Auto-assign ticket from booking | Automation trigger |
| Sync customer across capabilities | State synchronization |

---

## SECTION 4 — OPERATIONAL SURFACE EXAMPLES

### Example 1: Support Dashboard

**Observes:**
```typescript
async getBotTickets(botId: string): Promise<Ticket[]> {
  // Read-only visibility
  return this.supportQueryService.getBotTickets(botId);
}
```

**May Mutate:**
```typescript
async resolveTicket(botId: string, ticketId: string): Promise<void> {
  // Capability-specific mutation (within support)
  await this.supportRuntimeService.resolveTicket(ticketId);
}
```

**Must NOT Mutate:**
```typescript
// ❌ FORBIDDEN
async resolveTicketFromBooking(botId: string, bookingId: string) {
  const booking = await this.bookingQueryService.getBooking(bookingId);
  const ticket = await this.supportQueryService.createTicket({
    // Cross-capability mutation
    subject: `Issue with booking ${bookingId}`,
  });
}
```

---

### Example 2: Customer Profile Aggregation

**Observes:**
```typescript
async getCustomerProfile(customerId: string): Promise<CustomerProfile> {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
    this.leadFunnelQueryService.getCustomerLeads(customerId),
  ]);
  
  // Aggregates visibility (read-only)
  return { bookings, tickets, leads };
}
```

**May Mutate:**
```typescript
async updateCustomerProfile(customerId: string, data: ProfileData) {
  // Mutates customer identity only
  await this.customerService.updateProfile(customerId, data);
}
```

**Must NOT Mutate:**
```typescript
// ❌ FORBIDDEN
async createTicketFromProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  // Cross-capability orchestration
  for (const booking of bookings) {
    await this.supportQueryService.createTicket({
      subject: `Follow-up for booking ${booking.id}`,
    });
  }
}
```

---

### Example 3: Owner Dashboard Metrics

**Observes:**
```typescript
async getBotStats(botId: string): Promise<BotStats> {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getBotMetrics(botId),
    this.supportQueryService.getBotMetrics(botId),
    this.leadFunnelQueryService.getBotMetrics(botId),
  ]);
  
  // Aggregates visibility (read-only)
  return { bookings, tickets, leads };
}
```

**May Mutate:**
```typescript
async confirmBooking(botId: string, bookingId: string) {
  // Capability-specific mutation (within booking)
  await this.bookingRuntimeService.confirmBooking(bookingId);
}
```

**Must NOT Mutate:**
```typescript
// ❌ FORBIDDEN
async autoAssignTickets(botId: string) {
  const tickets = await this.supportQueryService.getUnassignedTickets(botId);
  
  // Automation trigger
  for (const ticket of tickets) {
    await this.supportRuntimeService.assignTicket(ticket.id, 'agent-1');
  }
}
```

---

## SECTION 5 — DEPENDENCY DIRECTION

### Correct Flow

```
Capabilities (Booking, Support, LeadFunnel)
    │
    ├── produce → operational reality
    │
    ▼
Query Services (read-only)
    │
    ├── expose → operational data
    │
    ▼
Operational Surfaces (Dashboard, Mini App)
    │
    ├── aggregate → visibility
    │
    ▼
Humans (observe + decide)
    │
    └──→ explicit actions → Capabilities (mutate)
```

### Forbidden Flow

```
❌ WRONG:

Operational Surfaces
    │
    ├── orchestrate → Capabilities
    │
    ▼
Capabilities
    │
    ├── mutate → other Capabilities
    │
    ▼
Cross-Capability Automation
```

---

## SECTION 6 — VALIDATION RULES

### Rule 1: Query Services Are Read-Only

Query services must NEVER mutate state.

```typescript
// ✅ CORRECT
@Injectable()
class SupportQueryService {
  async getBotTickets(botId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({ where: { botId } });
  }
}

// ❌ FORBIDDEN
@Injectable()
class SupportQueryService {
  async getBotTickets(botId: string): Promise<Ticket[]> {
    const tickets = await this.ticketRepository.find({ where: { botId } });
    
    // Mutating in query service
    if (tickets.length > 10) {
      await this.sendAlert(botId);  // NEVER
    }
    
    return tickets;
  }
}
```

---

### Rule 2: Controllers Serve Visibility

Controllers must NOT orchestrate capabilities.

```typescript
// ✅ CORRECT
@Controller('miniapp/bots')
class SupportDashboardController {
  async getBotTickets(botId: string) {
    // Serves visibility
    return this.supportQueryService.getBotTickets(botId);
  }
  
  async resolveTicket(botId: string, ticketId: string) {
    // Capability-specific mutation
    return this.supportRuntimeService.resolveTicket(ticketId);
  }
}

// ❌ FORBIDDEN
@Controller('miniapp/bots')
class SupportDashboardController {
  async processTicketFromBooking(botId: string, bookingId: string) {
    // Cross-capability orchestration
    const booking = await this.bookingQueryService.getBooking(bookingId);
    const ticket = await this.supportRuntimeService.createTicket({
      subject: `Issue with booking ${bookingId}`,
    });
  }
}
```

---

### Rule 3: No Automation Triggers

Operational surfaces must NOT trigger automated actions.

```typescript
// ✅ CORRECT
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    return { openTickets: tickets.length };  // Visibility only
  }
}

// ❌ FORBIDDEN
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    if (tickets.length > 10) {
      await this.sendAlert(botId);  // Automation trigger
    }
    
    return { openTickets: tickets.length };
  }
}
```

---

### Rule 4: No Cross-Capability State Sync

Capabilities must NOT synchronize state with each other.

```typescript
// ✅ CORRECT
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Booking creates booking
    const booking = this.bookingRepository.create(data);
    await this.bookingRepository.save(booking);
  }
}

class SupportRuntimeService {
  async createTicket(data: CreateTicketDto) {
    // Support creates ticket
    const ticket = this.ticketRepository.create(data);
    await this.ticketRepository.save(ticket);
  }
}

// ❌ FORBIDDEN
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    const booking = this.bookingRepository.create(data);
    await this.bookingRepository.save(booking);
    
    // Auto-create ticket
    await this.supportRuntimeService.createTicket({
      subject: `New booking: ${booking.id}`,
    });
  }
}
```

---

## SECTION 7 — CANONICAL RULES

### Rule 1: Visibility Is Read-Only

Operational surfaces may only observe data, never mutate (except capability-specific actions).

### Rule 2: Authority Is Capability-Owned

Mutations happen in capability runtime services, not operational surfaces.

### Rule 3: No Cross-Capability Mutations

No surface may mutate state across capability boundaries.

### Rule 4: No Automation Triggers

Surfaces must never trigger automated actions or workflows.

### Rule 5: No State Synchronization

Capabilities must never sync state with each other.

### Rule 6: Query Services Are Pure

Query services must be read-only, no side effects.

### Rule 7: Controllers Serve Visibility

Controllers expose data, do not orchestrate.

### Rule 8: Aggregation Is Observational

Aggregating visibility is allowed. Aggregating execution is forbidden.

---

**Version 1.0 — 2026-05-23**
