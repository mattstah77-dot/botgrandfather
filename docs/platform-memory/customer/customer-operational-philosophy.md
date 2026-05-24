# Customer Operational Philosophy

**Purpose:** Define what Customer IS and IS NOT in multi-capability context  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — CUSTOMER AS OPERATIONAL IDENTITY

### What Customer IS

Customer is an **operational identity layer**.

It exists to answer ONE question:
> "Who interacted with this bot?"

Customer provides:
- **Identity:** Telegram user ID, username, profile
- **Operational visibility:** "This person exists across capabilities"
- **Analytics aggregation:** "This person triggered events"
- **Ownership boundary:** "This person belongs to this bot"

Customer is:
- Universal across all templates
- Template-agnostic
- Capability-neutral
- Operational, not behavioral

### What Customer IS NOT

Customer is NOT a **universal business entity abstraction**.

Customer does NOT provide:
- Business semantics ("this customer has appointments")
- Workflow state ("this customer is in step 3 of funnel")
- Capability coupling ("this customer's booking affects their ticket")
- Orchestration triggers ("when customer converts, create ticket")

Customer does NOT know:
- What template the bot uses
- What capabilities are active
- What business logic applies
- What state transitions are valid

---

## SECTION 2 — MULTI-CAPABILITY CUSTOMER MODEL

### The Reality

One customer CAN interact with multiple capabilities:

```
Customer: @alice
  ├── Bot A (booking): has 3 bookings
  ├── Bot B (support): has 2 tickets  
  └── Bot C (lead-funnel): completed funnel, became lead
```

This is SAFE because:
- Customer is identity only
- Capabilities do not reference each other through Customer
- Customer does not mediate capability interactions

### The Boundary

Customer may be **referenced** by multiple capabilities.
Customer must NOT **mediate** capability interactions.

```typescript
// ✅ SAFE: Booking references customer
booking.customerId = customer.id;

// ✅ SAFE: Ticket references customer
ticket.customerId = customer.id;

// ✅ SAFE: Lead references customer
lead.customerId = customer.id;

// ❌ FORBIDDEN: Customer mediates capabilities
customer.getBookings(); // Customer should not know about bookings
booking.onComplete(() => customer.createTicket()); // Cross-capability orchestration
```

---

## SECTION 3 — OPERATIONAL IDENTITY BOUNDARIES

### Boundary 1: Customer Has No Capability State

```typescript
// ❌ FORBIDDEN
interface Customer {
  bookingStatus: string;      // Customer should not know
  ticketCount: number;        // Customer should not know
  funnelStep: string;         // Customer should not know
  lastAppointment: Date;      // Customer should not know
}

// ✅ CORRECT
interface Customer {
  id: string;
  botId: string;
  telegramUserId: bigint;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  status: 'new' | 'active' | 'converted';  // Universal lifecycle only
  tags: Record<string, any>;                // Operational tags only
  createdAt: Date;
  updatedAt: Date;
}
```

### Boundary 2: Customer Service Has No Capability Logic

```typescript
// ❌ FORBIDDEN
class CustomerService {
  async getCustomerBookings(customerId: string) { ... }
  async getCustomerTickets(customerId: string) { ... }
  async getCustomerFunnelStatus(customerId: string) { ... }
}

// ✅ CORRECT
class CustomerService {
  async ensureCustomer(botId, telegramUserId, profile) { ... }
  async updateStatus(botId, telegramUserId, status) { ... }
  async getCustomerById(customerId: string) { ... }  // Identity lookup only
}
```

Capability-specific queries belong in capability query services:
- `BookingQueryService.getCustomerBookings(customerId)`
- `SupportQueryService.getCustomerTickets(customerId)`

### Boundary 3: Customer Events Are Identity Events Only

```typescript
// ✅ CORRECT
customer.created     // Identity established
customer.updated     // Profile changed
customer.converted   // Universal conversion milestone

// ❌ FORBIDDEN
customer.booking.created     // Customer should not emit capability events
customer.ticket.resolved     // Customer should not emit capability events
customer.funnel.completed    // Customer should not emit capability events
```

---

## SECTION 4 — FORBIDDEN CUSTOMER DRIFT

### Drift Vector 1: Customer as Universal Aggregate

**Temptation:** "Customer has bookings, tickets, and leads. Let's put them all on Customer."

**Danger:** Customer becomes god-entity. Capabilities couple through Customer.

**Forbidden:**
```typescript
interface Customer {
  bookings: Booking[];      // ❌
  tickets: Ticket[];        // ❌
  leads: Lead[];            // ❌
}
```

**Safe:**
```typescript
// Each capability queries independently
const bookings = await bookingQueryService.getCustomerBookings(customerId);
const tickets = await supportQueryService.getCustomerTickets(customerId);
```

### Drift Vector 2: Customer as Orchestration Hub

**Temptation:** "When a customer completes a booking, update their ticket status."

**Danger:** Customer mediates cross-capability workflows.

**Forbidden:**
```typescript
customer.onBookingComplete = async () => {
  await ticketService.createTicket(customerId, 'Post-booking follow-up');
};
```

**Safe:**
```typescript
// Capabilities are independent
// If owner wants connection: manual action, not automatic
```

### Drift Vector 3: Customer Status as Capability State

**Temptation:** "Customer status should reflect their most recent capability state."

**Danger:** Universal status becomes meaningless aggregate.

**Forbidden:**
```typescript
// Customer status becomes "booking-pending-ticket-open"
customer.status = deriveFromCapabilities(customer);
```

**Safe:**
```typescript
// Customer status: universal lifecycle only
customer.status = 'new' | 'active' | 'converted';
// Capability status: in capability entities only
booking.status = 'pending' | 'confirmed' | ...;
ticket.status = 'open' | 'in-progress' | ...;
```

### Drift Vector 4: Customer Tags as Capability Configuration

**Temptation:** "Use customer tags to store capability-specific data."

**Danger:** Tags become hidden capability state.

**Forbidden:**
```typescript
customer.tags = {
  preferredService: 'consultation',  // Business logic in tags
  lastBookingDate: '2024-01-15',    // Capability data in tags
  ticketPriority: 'high',           // Capability state in tags
};
```

**Safe:**
```typescript
// Tags: operational labels only
customer.tags = {
  source: 'instagram',     // Acquisition channel
  segment: 'premium',      // Business segment
  language: 'ru',          // Preferred language
};
```

---

## SECTION 5 — WHY CUSTOMER UNIVERSALITY WORKS

### Reason 1: Identity Is Universal

Every capability needs to know "who is this person?" Identity is the same regardless of capability.

### Reason 2: Operational Visibility Is Shared

Owners need to see "who are my customers?" regardless of which capability they used.

### Reason 3: Analytics Aggregation Needs Identity

Events need a common subject for aggregation. Customer ID provides that.

### Reason 4: Capability Independence Requires Common Identity

If each capability had its own identity system, cross-capability visibility would be impossible.

### Reason 5: Customer Does Not Know Capabilities

The critical design decision: Customer knows NOTHING about capabilities. This prevents coupling.

---

## SECTION 6 — CUSTOMER IN MULTI-CAPABILITY OPERATIONAL VIEWS

### Safe: Customer Profile View

```typescript
// Operational composition: identity + capability references
interface CustomerProfileView {
  // Identity (from Customer)
  id: string;
  name: string;
  username: string;

  // Operational references (from capability query services)
  bookings: BookingSummary[];   // From BookingQueryService
  tickets: TicketSummary[];     // From SupportQueryService
  leads: LeadSummary[];         // From LeadFunnelQueryService
}
```

**Key:** Each section comes from a SEPARATE query service. No shared entity.

### Safe: Customer Activity Feed

```typescript
// Events aggregated by customerId
interface CustomerActivityFeed {
  customerId: string;
  events: Array<{
    timestamp: Date;
    type: string;           // 'booking.created', 'ticket.resolved', etc.
    capability: string;     // 'booking', 'support', 'lead-funnel'
    summary: string;
  }>;
}
```

**Key:** Events are observational. They do not trigger actions.

### Forbidden: Customer as Capability Orchestrator

```typescript
// ❌ FORBIDDEN
interface CustomerOrchestrator {
  async onBookingComplete() {
    await this.createFollowUpTicket();
    await this.sendSatisfactionSurvey();
    await this.updateCRMRecord();
  }
}
```

---

## SECTION 7 — CANONICAL CUSTOMER RULES

### Rule 1: Customer Is Identity

Customer answers "who?" not "what did they do?"

### Rule 2: Capabilities Reference Customer

Capabilities point TO customer. Customer does not point to capabilities.

### Rule 3: Customer Service Is Universal

CustomerService has zero capability imports.

### Rule 4: Customer Events Are Identity Events

Customer emits identity lifecycle events only.

### Rule 5: Operational Composition Is Query-Layer

Multi-capability customer views are composed in query services, not in Customer entity.

---

**Version 1.0 — 2026-05-23**
