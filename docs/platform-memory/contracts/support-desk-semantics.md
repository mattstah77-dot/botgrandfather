# Support Desk Semantics

**Purpose:** Define canonical semantics for Support Desk template  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — SUPPORT DESK PHILOSOPHY

### Why Support Desk Validates Universality

Support Desk is the third capability. It introduces fundamentally different operational semantics:

| Dimension | Lead-Funnel | Booking | Support Desk |
|-----------|-------------|---------|--------------|
| Direction | Business-initiated | Customer-initiated | Customer-initiated |
| Purpose | Qualification | Scheduling | Problem resolution |
| Time semantics | None | Critical (slots, dates) | None (asynchronous) |
| Lifecycle | Linear (start → complete) | Linear with terminal states | Cyclic (can reopen) |
| Agent concept | None | None (single resource) | Yes (assignee) |
| Two-way comm | Limited | Limited (confirmation only) | Rich (ongoing dialog) |

### Why Support Desk Stays Template-Contained

The platform provides:
- Customer lifecycle (universal)
- Event tracking (universal)
- Ownership verification (universal)
- Operational composition (universal)

The Support Desk template provides:
- Ticket lifecycle (template-specific)
- Assignment logic (template-specific)
- Response tracking (template-specific)
- Category management (template-specific)

**Invariant:** Platform core services have ZERO support desk awareness.

---

## SECTION 2 — TICKET ENTITY SEMANTICS

### Ticket States

```typescript
type TicketStatus =
  | 'open'        // Created, awaiting first response
  | 'in-progress' // Agent is actively working
  | 'resolved'    // Agent provided solution, awaiting customer confirmation
  | 'closed';     // Confirmed resolved or auto-closed
```

**No `reopened` state:** When a resolved/closed ticket receives a new message, it transitions directly to `in-progress`. `reopened` is a transition label, not a persistent state.

### Ticket Fields

```typescript
interface Ticket {
  id: string;
  botId: string;
  customerId: string;       // References Customer entity
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;        // E.g., "Billing", "Technical", "General"
  subject?: string;         // Auto-generated from first message or manual
  assignedTo?: string;      // Telegram username or owner ID
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}
```

### Ticket Message Entity

```typescript
interface TicketMessage {
  id: string;
  ticketId: string;
  senderType: 'customer' | 'agent' | 'system';
  senderId: string;         // Telegram user ID or owner ID
  content: string;
  isInternal: boolean;      // true = note (not visible to customer)
  createdAt: Date;
}
```

---

## SECTION 3 — TICKET LIFECYCLE SEMANTICS

### Allowed State Transitions

```
open → in-progress    (agent takes or is assigned)
open → resolved       (agent resolves immediately)
open → closed         (owner closes as invalid/spam)

in-progress → resolved  (agent provides solution)
in-progress → closed    (owner closes)

resolved → closed     (customer confirms or auto-close after 48h)
resolved → in-progress  (customer sends follow-up message)

closed → in-progress  (customer sends new message)
```

### Transition Rules

| Transition | Trigger | Who |
|------------|---------|-----|
| `open → in-progress` | Agent takes ticket | Owner/Agent |
| `open → resolved` | Agent resolves without in-progress | Owner/Agent |
| `open → closed` | Owner marks as spam/invalid | Owner |
| `in-progress → resolved` | Agent clicks "Resolve" | Owner/Agent |
| `in-progress → closed` | Owner clicks "Close" | Owner |
| `resolved → closed` | 48h auto-close or owner clicks "Close" | System/Owner |
| `resolved → in-progress` | Customer sends message | Customer |
| `closed → in-progress` | Customer sends message | Customer |

### No Persistent Reopened State

**Why:** `reopened` is a transition event, not a state. When a customer sends a message to a resolved/closed ticket:

1. Ticket transitions to `in-progress`.
2. Event `ticket.reopened` is emitted.
3. Dashboard shows "Reopened" label on `in-progress` ticket.

**This avoids:**
- Extra state in state machine.
- Confusion between "reopened" and "in-progress".
- Temptation to build "reopen count" analytics (can be done via events).

---

## SECTION 4 — CUSTOMER INTERACTION FLOW

### Flow 1: New Ticket

```
Customer sends message to bot
    ↓
Bot: "Thank you! Your ticket #123 has been created. We'll get back to you soon."
    ↓
Ticket created (status: open)
    ↓
Event: ticket.created
    ↓
Owner sees new ticket in dashboard
```

### Flow 2: Agent Response

```
Owner clicks "Take" or "Assign"
    ↓
Ticket status: in-progress
    ↓
Owner replies via dashboard or Telegram
    ↓
Message stored as TicketMessage (senderType: 'agent')
    ↓
Customer receives reply in Telegram chat
    ↓
Event: ticket.message.sent
```

### Flow 3: Resolution

```
Owner clicks "Resolve"
    ↓
Ticket status: resolved
    ↓
Bot: "Your ticket #123 has been resolved. Reply if you need more help."
    ↓
Event: ticket.resolved
    ↓
[48 hours pass with no customer response]
    ↓
System auto-closes ticket
    ↓
Ticket status: closed
    ↓
Event: ticket.closed
```

### Flow 4: Reopen

```
Customer sends message to resolved/closed ticket
    ↓
Ticket status: in-progress
    ↓
Bot: "Your ticket #123 has been reopened. We're on it."
    ↓
Event: ticket.reopened
    ↓
Owner sees reopened ticket in dashboard
```

---

## SECTION 5 — ASSIGNMENT SEMANTICS

### MVP: Manual Assignment Only

**Rule:** For MVP, assignment is manual. Owner clicks "Take" or selects assignee.

**Why:** Automatic assignment algorithms (round-robin, load-balanced, skill-based) are complex and premature.

### Assignment Entity

```typescript
interface TicketAssignment {
  ticketId: string;
  assignedTo: string;       // Telegram username or owner ID
  assignedBy: string;       // Who made the assignment
  assignedAt: Date;
  unassignedAt?: Date;
}
```

### Assignment Rules

1. **Self-assignment:** Owner clicks "Take" → assignedTo = ownerId.
2. **Manual assignment:** Owner selects assignee from list.
3. **Unassignment:** Owner clicks "Unassign" → ticket returns to open.
4. **Reassignment:** Owner changes assignee → new assignment record.

### No Assignment Algorithm

**Forbidden for MVP:**
- Round-robin assignment.
- Load-balanced assignment.
- Skill-based routing.
- Automatic escalation.

**Why:** Assignment algorithms are business logic, not platform concerns. If needed, they are template-specific.

---

## SECTION 6 — PRIORITY SEMANTICS

### Priority Levels

```typescript
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
```

### Priority Rules

1. **Default:** New tickets are `medium` priority.
2. **Owner changes:** Owner can change priority at any time.
3. **No automatic escalation:** Priority does not auto-escalate.
4. **Dashboard sorting:** High/urgent tickets appear first.

### Priority vs. SLA

**Priority** is a static label. **SLA** is a dynamic target.

**MVP has priority but NO SLA.**

**Why:** SLA tracking (response time targets, breach alerts) is complex and premature.

---

## SECTION 7 — CATEGORY SEMANTICS

### Categories

Categories are owner-defined labels for ticket classification.

**Examples:**
- "Billing"
- "Technical Support"
- "Feature Request"
- "Complaint"
- "General"

### Category Rules

1. **Owner-defined:** Categories are configured in settings.
2. **Optional:** Tickets can be uncategorized.
3. **Single category:** One ticket has one category.
4. **No subcategories:** Categories are flat.

---

## SECTION 8 — OPERATIONAL VISIBILITY RULES

### What Operational Layer MAY See

Operational layer MAY read:
- Ticket count (aggregated via Capability Provider).
- Recent tickets list (via `TicketQueryService`).
- Ticket status distribution (open, in-progress, resolved, closed).
- Agent workload (tickets per assignee).

**Pattern:** All reads go through `TicketQueryService` implementing `DashboardCapabilityProvider`.

### What Dashboard Aggregates

Dashboard aggregates via Capability Provider:
```typescript
// DashboardService calls
const metrics = await ticketProvider.getOwnerMetrics(ownerId);
// Returns: { total: number }
```

**Dashboard shows:**
- "Interactions" count (includes tickets, summed with bookings/leads).
- Template-specific widget (provided by Support Desk capability).

### What MUST Remain Runtime-Only

Runtime-only (operational layer MUST NOT access directly):
- Ticket message content (privacy).
- Internal notes (privacy).
- Assignment history (implementation detail).
- Response time calculations (business logic).

---

## SECTION 9 — ANALYTICS EVENTS

### Canonical Events

```typescript
// Template-specific events
ticket.created
ticket.assigned
ticket.resolved
ticket.closed
ticket.reopened

// Universal events
session.started      // Customer starts interaction
session.completed    // Ticket resolved
conversion.completed // Ticket resolved (alternative)
customer.created     // New customer
customer.updated     // Customer status changes
```

### Event Payloads

```typescript
// ticket.created
{
  ticketId: string,
  customerId: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  category?: string,
}

// ticket.assigned
{
  ticketId: string,
  assignedTo: string,
  assignedBy: string,
}

// ticket.resolved
{
  ticketId: string,
  resolvedBy: string,
  messageCount: number,
}

// ticket.closed
{
  ticketId: string,
  closedBy: 'system' | 'owner',
  reason?: string,
}

// ticket.reopened
{
  ticketId: string,
  reopenedBy: 'customer',
  previousStatus: 'resolved' | 'closed',
}
```

---

## SECTION 10 — FORBIDDEN DIRECTIONS

### Explicitly Forbidden

| Forbidden Direction | Why Forbidden |
|---------------------|---------------|
| **SLA engine** | No proven need. Response time tracking is query-layer, not engine. |
| **Assignment algorithm** | Manual assignment sufficient for MVP. Algorithms are template-specific. |
| **Automatic escalation** | Premature complexity. Escalation rules are business logic. |
| **Knowledge base** | Canned responses are template config, not platform service. |
| **Skill-based routing** | Requires agent skills model. Premature. |
| **Multi-level support** | Tiers (L1, L2, L3) are enterprise complexity. Not MVP. |
| **Universal ticket abstraction** | Booking is not a ticket. Lead is not a ticket. No universal entity. |
| **Ticket-centric platform** | Platform must remain capability-neutral. |
| **Metadata-driven workflows** | Business logic in code, not metadata. |
| **Platform-wide support desk** | Support desk is ONE template, not platform identity. |

---

## SECTION 11 — MVP BOUNDARIES

### What MVP Includes

1. Ticket creation from Telegram messages.
2. Manual assignment (take/assign/unassign).
3. Agent reply via dashboard.
4. Customer reply via Telegram.
5. Status transitions (open, in-progress, resolved, closed).
6. Reopen on customer message.
7. Auto-close after 48h of resolved.
8. Priority levels.
9. Categories.
10. Basic operational views (list, detail).

### What MVP Excludes

1. SLA tracking.
2. Response time analytics.
3. Automatic assignment.
4. Internal notes.
5. Canned responses.
6. Satisfaction surveys.
7. Agent performance dashboard.
8. Ticket merging.
9. Ticket linking.
10. Custom fields.

---

## SECTION 12 — ANTI-DRIFT PROTECTIONS

### Protection 1: No SLA Engine

**Forbidden:** `src/sla/sla.service.ts`
**Safe:** Response time tracked in `TicketQueryService` as operational metric.

### Protection 2: No Assignment Algorithm

**Forbidden:** `src/assignment/assignment.service.ts`
**Safe:** Manual assignment in `TicketRuntimeService`.

### Protection 3: No Universal Ticket

**Forbidden:** `UniversalTicketEntity` in core schema.
**Safe:** `Ticket` entity in `src/templates/support/entities/`.

### Protection 4: No Workflow Engine

**Forbidden:** Metadata-driven ticket workflows.
**Safe:** Explicit state transitions in `TicketRuntimeService`.

### Protection 5: No Platform Support Desk Identity

**Forbidden:** Platform marketed as "support desk tool."
**Safe:** Platform remains "multi-tenant Telegram business operations platform."

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial support desk semantics |

---

**This document is the CANONICAL AUTHORITY for all Support Desk semantics.**

**All future Support Desk work MUST comply with these semantics.**

**Violations of these semantics are architectural drift.**

**Version 1.0 — 2026-05-23**
