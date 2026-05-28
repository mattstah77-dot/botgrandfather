# Hidden CRM Drift Analysis

**Purpose:** Analyze risk of accidental CRM/orchestration emergence  
**Status:** CANONICAL — Tier 2 Audit  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — THE DANGER

### What Is CRM Drift

**CRM Drift** is the gradual, often unintentional evolution of operational visibility into:
- CRM orchestration
- Workflow automation
- Lifecycle engines
- Sales pipelines
- Unified customer execution

### Why It's Dangerous

| Risk | Impact |
|------|--------|
| **Hidden orchestration** | System automates without explicit design |
| **Workflow emergence** | Business logic emerges unintentionally |
| **Capability coupling** | Templates become interconnected |
| **Automation complexity** | Hidden automation is hard to debug |
| **Platform identity loss** | Becomes general workflow platform |

---

## SECTION 2 — HOW CRM DRIFT HAPPENS

### Stage 1: Customer History Accumulation (SAFE)

**What happens:**
```typescript
async getCustomerProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  const tickets = await this.supportQueryService.getCustomerTickets(customerId);
  const leads = await this.leadFunnelQueryService.getCustomerLeads(customerId);
  
  return { bookings, tickets, leads };  // Just history
}
```

**Why SAFE:**
- Read-only aggregation
- No automation
- No orchestration
- Purely observational

---

### Stage 2: Contextual Recommendations (DANGEROUS EDGE)

**What happens:**
```typescript
async getCustomerProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  const tickets = await this.supportQueryService.getCustomerTickets(customerId);
  
  // ❌ DANGEROUS: Implicit orchestration logic
  const hasOpenTickets = tickets.some(t => t.status === 'open');
  const recentBooking = bookings[bookings.length - 1];
  
  return {
    bookings,
    tickets,
    recommendations: hasOpenTickets 
      ? ['Resolve open tickets before booking']  // Business logic
      : ['Book again', 'Refer friend'],
  };
}
```

**Why DANGEROUS:**
- Business logic in aggregation layer
- Implicit workflow rules
- Could evolve into automation

---

### Stage 3: Automated Follow-Ups (FULL CRM DRIFT)

**What happens:**
```typescript
async getCustomerProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  // ❌ CRM ORCHESTRATION: Automation trigger
  const lastBooking = bookings[bookings.length - 1];
  if (lastBooking && isOverdue(lastBooking.completedAt, 7)) {
    await this.emailService.sendFollowUp(customerId);  // Automation!
  }
  
  return { bookings };
}
```

**Why FULL DRIFT:**
- System automates actions
- Hidden workflow execution
- Lifecycle orchestration emerged

---

### Stage 4: Sales Pipeline (COMPLETE CRM)

**What happens:**
```typescript
async getSalesPipeline(ownerId: string) {
  const leads = await this.leadFunnelQueryService.getOwnerLeads(ownerId);
  const bookings = await this.bookingQueryService.getOwnerBookings(ownerId);
  
  // ❌ CRM ENGINE: Sales pipeline orchestration
  const pipeline = leads.map(lead => {
    const booking = bookings.find(b => b.customerId === lead.customerId);
    return {
      stage: booking ? 'closed' : 'open',
      value: booking?.amount || 0,
      nextAction: booking 
        ? 'Follow up for repeat'
        : 'Convert to booking',  // Workflow orchestration
    };
  });
  
  return { pipeline };
}
```

**Why COMPLETE DRIFT:**
- Full CRM pipeline emerged
- Workflow stages defined
- Automation rules encoded
- Platform became workflow engine

---

## SECTION 3 — SAFE VS FORBIDDEN PATTERNS

### SAFE: Customer History

```typescript
// ✅ SAFE: Just history
async getCustomerHistory(customerId: string) {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
    this.leadFunnelQueryService.getCustomerLeads(customerId),
  ]);
  
  return { bookings, tickets, leads };
}
```

**Why Safe:**
- Read-only aggregation
- No business logic
- No automation
- Pure observation

---

### FORBIDDEN: Automated Follow-Ups

```typescript
// ❌ FORBIDDEN: Automation
async getCustomerHistory(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  const lastBooking = bookings[bookings.length - 1];
  if (lastBooking && isOverdue(lastBooking.completedAt, 7)) {
    await this.emailService.sendFollowUp(customerId);  // Automation!
  }
  
  return { bookings };
}
```

**Why Forbidden:**
- Triggers automated actions
- Lifecycle orchestration
- Hidden workflow

---

### SAFE: Status Display

```typescript
// ✅ SAFE: Just display status
async getLeadStatus(leadId: string) {
  const lead = await this.leadFunnelQueryService.getLead(leadId);
  return { status: lead.status };
}
```

---

### FORBIDDEN: Status Automation

```typescript
// ❌ FORBIDDEN: Automation based on status
async getLeadStatus(leadId: string) {
  const lead = await this.leadFunnelQueryService.getLead(leadId);
  
  if (lead.status === 'qualified' && !lead.contacted) {
    await this.contactService.scheduleCall(lead.customerId);  // Automation!
  }
  
  return { status: lead.status };
}
```

**Why Forbidden:**
- Workflow orchestration
- Automated actions
- Lifecycle engine

---

## SECTION 4 — DRIFT DETECTION CHECKLIST

### Early Warning Signs

| Sign | Risk Level | Action |
|------|-----------|--------|
| Business logic in aggregation layer | ⚠️ MEDIUM | Review immediately |
| Conditional automation in queries | 🔴 HIGH | Stop and refactor |
| Cross-capability state sync | 🔴 HIGH | Stop and refactor |
| Workflow stages in data model | 🔴 HIGH | Stop and refactor |
| Automated follow-up triggers | 🔴 CRITICAL | Immediate rollback |
| Sales pipeline views | 🔴 CRITICAL | Immediate rollback |

---

### Detection Questions

| Question | YES = Drift Risk |
|----------|-----------------|
| Does aggregation layer contain business rules? | ✅ Risk |
| Do queries trigger side effects? | ✅ Risk |
| Is there automated follow-up logic? | ✅ Risk |
| Are workflow stages encoded in data? | ✅ Risk |
| Do capabilities sync state with each other? | ✅ Risk |
| Is there a sales pipeline view? | ✅ Risk |
| Are there conversion automation triggers? | ✅ Risk |
| Does the system auto-create records across capabilities? | ✅ Risk |

---

## SECTION 5 — SAFE OPERATIONAL MEMORY

### What MAY Exist

| Memory Type | Example | Why Safe |
|-------------|---------|----------|
| **Historical visibility** | "Customer booked 3 times" | Pure observation |
| **Aggregated metrics** | "5 open tickets" | Read-only stats |
| **Timeline view** | "Last interaction: 2 days ago" | Observational |
| **Status summaries** | "3 bookings, 1 ticket" | Aggregation only |
| **Identity references** | "Customer ID: 123" | Identity link |

---

### What MUST NOT Exist

| Memory Type | Example | Why Forbidden |
|-------------|---------|---------------|
| **Workflow state** | "Lead stage: qualified" | Workflow orchestration |
| **Automation triggers** | "Send email after 7 days" | Lifecycle engine |
| **Pipeline stages** | "Deal stage: negotiation" | CRM emergence |
| **Conversion rules** | "Auto-convert lead after booking" | Cross-capability sync |
| **Follow-up schedules** | "Schedule call in 3 days" | Automation trigger |
| **Lifecycle state** | "Customer stage: active" | Lifecycle orchestration |

---

## SECTION 6 — CANONICAL RULES

### Rule 1: History Is Safe, Automation Is Not

Aggregating customer history is safe. Automating actions is forbidden.

### Rule 2: Observation Is Safe, Orchestration Is Not

Observing operational reality is safe. Orchestrating capabilities is forbidden.

### Rule 3: Read-Only Is Safe, Side Effects Are Not

Read-only queries are safe. Queries with side effects are forbidden.

### Rule 4: Aggregation Is Safe, Workflow Is Not

Aggregating visibility is safe. Encoding workflow rules is forbidden.

### Rule 5: Visibility Is Safe, Automation Triggers Are Not

Showing data is safe. Triggering automated actions is forbidden.

### Rule 6: Capabilities Must Not Sync

Capabilities must never synchronize state with each other.

### Rule 7: No Pipeline Abstractions

No sales pipeline, no workflow stages, no conversion logic.

### Rule 8: No Lifecycle Engines

No customer lifecycle, no follow-up automation, no automated sequences.

---

## SECTION 7 — VALIDATION GATES

### Gate 1: No Business Logic in Aggregation

```bash
grep -r "if.*hasOpenTickets\|if.*isOverdue\|recommendations:" src/dashboard/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Automation Triggers

```bash
grep -r "sendFollowUp\|scheduleCall\|autoConvert" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Workflow Stages

```bash
grep -r "leadStage\|pipelineStage\|workflowStage" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Cross-Capability Sync

```bash
grep -r "createTicket.*booking\|createBooking.*lead\|convertLead.*ticket" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Sales Pipeline

```bash
grep -r "salesPipeline\|pipeline.*value\|deal.*stage" src/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
