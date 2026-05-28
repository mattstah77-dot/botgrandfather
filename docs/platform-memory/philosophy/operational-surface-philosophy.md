# Operational Surface Philosophy

**Purpose:** Define what operational surfaces ARE and MUST NEVER BE  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — WHAT IS OPERATIONAL SURFACE

### Definition

**Operational Surface** is the layer that exposes operational reality to humans for observation and decision-making.

### Operational Surface IS

| Aspect | Meaning |
|--------|---------|
| **Operational Visibility Layer** | Shows what is happening in capabilities |
| **Operational Coordination Surface** | Enables humans to coordinate actions |
| **Business Observation Layer** | Aggregates data for human insight |
| **Human Decision Support Layer** | Provides context for human decisions |
| **Capability Aggregation Layer** | Combines multiple capability views |

### Operational Surface is NOT

| Aspect | Why Not |
|--------|---------|
| **Orchestration Engine** | Does not execute workflows |
| **Workflow System** | Does not automate processes |
| **Automation Runtime** | Does not trigger actions automatically |
| **Business Execution Layer** | Does not mutate cross-capability state |
| **Cross-Template Coordinator** | Does not orchestrate templates |

---

## SECTION 2 — THE CANONICAL DISTINCTION

### Core Principle

```
Capabilities produce:    OPERATIONAL REALITY
Mini App / Dashboard:    OPERATIONAL VISIBILITY
Platform aggregates:     OBSERVATION, NOT EXECUTION
```

### What This Means

1. **Capabilities** (Booking, Support, LeadFunnel) create operational truth
2. **Operational surfaces** (Dashboard, Mini App) expose that truth
3. **Platform** aggregates visibility across capabilities
4. **Execution** always happens in capabilities, NOT in surfaces

### Example: Booking + Support

```typescript
// CAPABILITY: Booking creates reality
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Creates booking (operational reality)
    const booking = this.bookingRepository.create(data);
    await this.bookingRepository.save(booking);
  }
}

// CAPABILITY: Support creates reality
class SupportRuntimeService {
  async createTicket(data: CreateTicketDto) {
    // Creates ticket (operational reality)
    const ticket = this.ticketRepository.create(data);
    await this.ticketRepository.save(ticket);
  }
}

// OPERATIONAL SURFACE: Dashboard exposes visibility
class SupportDashboardController {
  async getBotTickets(botId: string) {
    // Exposes existing tickets (operational visibility)
    return this.supportQueryService.getBotTickets(botId);
  }
}

// PLATFORM: Aggregates visibility across capabilities
class DashboardService {
  async getOwnerStats(ownerId: string) {
    const bookings = await this.bookingQueryService.getOwnerMetrics(ownerId);
    const tickets = await this.supportQueryService.getOwnerMetrics(ownerId);
    const leads = await this.leadFunnelQueryService.getOwnerMetrics(ownerId);
    
    // Aggregates visibility (NOT execution)
    return { bookings, tickets, leads };
  }
}
```

**Key Property:** The Dashboard does NOT create bookings, tickets, or leads. It only exposes what capabilities created.

---

## SECTION 3 — OPERATIONAL SURFACE BOUNDARIES

### What Operational Surfaces MAY Do

| Action | Example |
|--------|---------|
| **Aggregate** | Show bookings + tickets + leads together |
| **Summarize** | Display total counts, status distributions |
| **Expose** | List tickets with filters and sorting |
| **Visualize** | Render charts, calendars, timelines |
| **Filter** | Apply search, date ranges, status filters |
| **Sort** | Order by date, priority, status |
| **Paginate** | Split large lists into pages |

### What Operational Surfaces MUST NOT Do

| Action | Why Forbidden |
|--------|--------------|
| **Orchestrate** | Does not coordinate capability actions |
| **Synchronize runtimes** | Does not sync state between capabilities |
| **Mutate cross-capability state** | Does not create bookings from support tickets |
| **Automate capability interactions** | Does not auto-create tickets from bookings |
| **Execute business logic** | Does not implement business rules |
| **Trigger workflows** | Does not start automated processes |
| **Coordinate templates** | Does not orchestrate templates together |

---

## SECTION 4 — OPERATIONAL SURFACE USE CASES

### Use Case 1: Owner Dashboard

**Purpose:** Show aggregated operational status.

**What it does:**
- Shows total bookings, tickets, leads
- Displays status distributions
- Aggregates metrics across capabilities

**What it does NOT do:**
- Does not create bookings
- Does not modify tickets
- Does not coordinate between capabilities

---

### Use Case 2: Support Desk

**Purpose:** Operational visibility for support management.

**What it does:**
- Lists tickets with filters
- Shows ticket details
- Displays message history
- Provides search functionality

**What it does NOT do:**
- Does not auto-assign tickets
- Does not trigger escalations
- Does not coordinate with booking system

---

### Use Case 3: Customer Profile Aggregation

**Purpose:** Show customer history across capabilities.

**What it does:**
- Aggregates customer bookings
- Aggregates customer tickets
- Aggregates customer leads
- Displays timeline of interactions

**What it does NOT do:**
- Does not auto-create tickets from bookings
- Does not auto-follow up on leads
- Does not coordinate customer lifecycle

---

## SECTION 5 — DEPENDENCY DIRECTION

### Correct Dependency Flow

```
Capabilities (Booking, Support, LeadFunnel)
    │
    ├── produce → operational reality (database)
    │
    ▼
Query Services (BookingQueryService, SupportQueryService)
    │
    ├── expose → operational data (read-only)
    │
    ▼
Operational Surfaces (Dashboard, Mini App)
    │
    ├── aggregate → visibility for humans
    │
    ▼
Human Decision-Making
```

### Forbidden Dependency Flow

```
❌ WRONG:

Operational Surfaces
    │
    ├── orchestrate → capabilities
    │
    ▼
Capabilities
    │
    ├── mutate → other capabilities
    │
    ▼
Cross-Capability Automation
```

---

## SECTION 6 — OPERATIONAL SURFACE ARCHITECTURE

### Architecture Pattern

```typescript
// Query Services (read-only, capability-specific)
@Injectable()
class SupportQueryService {
  async getBotTickets(botId: string): Promise<Ticket[]> {
    // Reads tickets for bot
  }
}

// Controllers (serve operational surfaces)
@Controller('miniapp/bots')
class SupportDashboardController {
  constructor(private supportQueryService: SupportQueryService) {}
  
  async getBotTickets(botId: string) {
    // Serves operational visibility
    return this.supportQueryService.getBotTickets(botId);
  }
}

// Dashboard (aggregates visibility)
class DashboardService {
  constructor(
    private bookingQueryService: BookingQueryService,
    private supportQueryService: SupportQueryService,
  ) {}
  
  async getBotStats(botId: string) {
    // Aggregates visibility (NOT execution)
    const [bookings, tickets] = await Promise.all([
      this.bookingQueryService.getBotMetrics(botId),
      this.supportQueryService.getBotMetrics(botId),
    ]);
    return { bookings, tickets };
  }
}
```

### Key Properties

1. **Query Services** are read-only
2. **Controllers** serve visibility, do not mutate
3. **Dashboard** aggregates, does not orchestrate
4. **No cross-capability mutations**

---

## SECTION 7 — VALIDATION RULES

### Rule 1: No Cross-Capability Mutations

```typescript
// ❌ FORBIDDEN: Cross-capability mutation
class DashboardService {
  async createTicketFromBooking(botId: string, bookingId: string) {
    const booking = await this.bookingQueryService.getBooking(bookingId);
    const ticket = await this.supportQueryService.createTicket({
      botId,
      subject: `Issue with booking ${bookingId}`,
      // Creates ticket from booking — orchestration!
    });
  }
}

// ✅ CORRECT: Capabilities own mutations
class SupportRuntimeService {
  async createTicket(data: CreateTicketDto) {
    // Support creates tickets
  }
}

class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Booking creates bookings
  }
}
```

---

### Rule 2: No Automation Triggers

```typescript
// ❌ FORBIDDEN: Automation trigger
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    if (tickets.length > 10) {
      await this.sendAlert(botId);  // Automation!
    }
  }
}

// ✅ CORRECT: Observation only
class DashboardService {
  async getBotStats(botId: string) {
    const tickets = await this.supportQueryService.getOpenTickets(botId);
    
    // Just expose data
    return { openTickets: tickets.length };
  }
}
```

---

### Rule 3: No Workflow Orchestration

```typescript
// ❌ FORBIDDEN: Workflow orchestration
class DashboardService {
  async processCustomerOnboarding(customerId: string) {
    // Orchestrates workflow across capabilities
    await this.createWelcomeBooking(customerId);
    await this.createOnboardingTicket(customerId);
    await this.createLeadEntry(customerId);
  }
}

// ✅ CORRECT: Capabilities independent
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Booking creates bookings
  }
}

class SupportRuntimeService {
  async createTicket(data: CreateTicketDto) {
    // Support creates tickets
  }
}
```

---

## SECTION 8 — CANONICAL RULES

### Rule 1: Capabilities Produce Reality

Capabilities (Booking, Support, LeadFunnel) create operational truth.

### Rule 2: Surfaces Expose Visibility

Operational surfaces (Dashboard, Mini App) expose operational truth for observation.

### Rule 3: No Cross-Capability Mutations

Operational surfaces must never mutate state across capabilities.

### Rule 4: No Automation Triggers

Operational surfaces must never trigger automated actions.

### Rule 5: No Workflow Orchestration

Operational surfaces must never coordinate workflows.

### Rule 6: Aggregation Only

Operational surfaces may aggregate visibility, but not execution.

### Rule 7: Read-Only Queries

Query services must be read-only, no mutations.

### Rule 8: Capability Independence

Capabilities must remain runtime-independent.

---

**Version 1.0 — 2026-05-23**
