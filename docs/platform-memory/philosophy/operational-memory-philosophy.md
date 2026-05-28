# Operational Memory Philosophy

**Purpose:** Define what operational memory IS and MUST NEVER BE  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — WHAT IS OPERATIONAL MEMORY

### Definition

**Operational Memory** is accumulated operational context that provides historical visibility and observational continuity.

### Operational Memory IS

| Aspect | Meaning |
|--------|---------|
| **Accumulated Context** | Historical data about past interactions |
| **Observational Continuity** | Ability to see patterns over time |
| **Historical Visibility** | Past bookings, tickets, leads visible |
| **Identity Links** | Customer identity across capabilities |
| **Temporal Patterns** | Trends, frequencies, sequences |

### Operational Memory is NOT

| Aspect | Why Not |
|--------|---------|
| **Orchestration State** | Does not coordinate actions |
| **Automation Memory** | Does not trigger workflows |
| **Workflow Coordination** | Does not manage processes |
| **Business Execution State** | Does not encode business rules |
| **Lifecycle State** | Does not track customer stages |

---

## SECTION 2 — THE CANONICAL DISTINCTION

### Core Principle

```
Platform MAY know:          Platform MUST NOT know:
- Customer booked before    - Customer lifecycle stage
- Customer contacted support - Customer automation state
- Customer converted        - Customer workflow position
- Customer inactive         - Customer follow-up schedule
```

### What This Means

1. **Platform CAN accumulate** historical data
2. **Platform CAN expose** patterns over time
3. **Platform MUST NOT encode** business rules
4. **Platform MUST NOT trigger** automated actions

---

## SECTION 3 — SAFE OPERATIONAL MEMORY

### What MAY Exist

| Memory | Example | Why Safe |
|--------|---------|----------|
| **Booking history** | "Customer booked 5 times" | Pure history |
| **Ticket history** | "Customer opened 3 tickets" | Pure history |
| **Lead history** | "Customer submitted 2 leads" | Pure history |
| **Timeline** | "Last booking: 2 weeks ago" | Temporal pattern |
| **Frequency** | "Books 2x per month" | Observation |
| **Status counts** | "3 open tickets" | Aggregation |
| **Identity** | "Same customer ID" | Identity link |

---

### Safe Example: Customer Profile

```typescript
async getCustomerProfile(customerId: string) {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getCustomerBookings(customerId),
    this.supportQueryService.getCustomerTickets(customerId),
    this.leadFunnelQueryService.getCustomerLeads(customerId),
  ]);
  
  // ✅ SAFE: Historical visibility
  return {
    customerId,
    bookingCount: bookings.length,
    ticketCount: tickets.length,
    leadCount: leads.length,
    lastBookingDate: bookings[bookings.length - 1]?.createdAt,
    lastTicketDate: tickets[tickets.length - 1]?.createdAt,
  };
}
```

**Why Safe:**
- Read-only aggregation
- Historical visibility
- No automation
- No workflow state

---

## SECTION 4 — FORBIDDEN OPERATIONAL MEMORY

### What MUST NOT Exist

| Memory | Example | Why Forbidden |
|--------|---------|---------------|
| **Lifecycle stage** | "Customer: active" | Lifecycle orchestration |
| **Automation state** | "Follow-up: pending" | Automation trigger |
| **Workflow position** | "Stage: conversion" | Workflow engine |
| **Next action** | "Call in 3 days" | Automation schedule |
| **Conversion state** | "Lead: qualified" | CRM orchestration |
| **Engagement score** | "Score: 75/100" | Business logic |
| **Churn risk** | "Risk: high" | Automation trigger |

---

### Forbidden Example: Lifecycle Tracking

```typescript
async getCustomerProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  // ❌ FORBIDDEN: Lifecycle state
  const lastBooking = bookings[bookings.length - 1];
  const daysSinceLast = daysBetween(lastBooking.createdAt, now);
  
  let lifecycleStage: string;
  if (daysSinceLast < 30) {
    lifecycleStage = 'active';
  } else if (daysSinceLast < 90) {
    lifecycleStage = 'at-risk';
  } else {
    lifecycleStage = 'churned';
  }
  
  return {
    customerId,
    lifecycleStage,  // Lifecycle orchestration
    nextFollowUp: daysSinceLast > 30 ? 'Call customer' : null,  // Automation!
  };
}
```

**Why Forbidden:**
- Encodes lifecycle state
- Triggers automation logic
- Becomes lifecycle engine

---

### Forbidden Example: Automation Schedule

```typescript
async getCustomerProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  // ❌ FORBIDDEN: Automation schedule
  const lastBooking = bookings[bookings.length - 1];
  if (lastBooking && daysBetween(lastBooking.completedAt, now) >= 7) {
    return {
      customerId,
      followUpScheduled: true,  // Automation trigger
      followUpDate: addDays(now, 3),
      followUpAction: 'Send email',
    };
  }
  
  return { customerId, followUpScheduled: false };
}
```

**Why Forbidden:**
- Schedules automated actions
- Encodes follow-up logic
- Becomes automation engine

---

## SECTION 5 — TEMPORAL PATTERNS VS AUTOMATION

### SAFE: Temporal Pattern Display

```typescript
async getCustomerActivity(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  // ✅ SAFE: Just show pattern
  const bookingsByMonth = groupByMonth(bookings);
  return {
    customerId,
    activity: bookingsByMonth,  // Observational
  };
}
```

---

### FORBIDDEN: Pattern-Based Automation

```typescript
async getCustomerActivity(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  const bookingsByMonth = groupByMonth(bookings);
  
  // ❌ FORBIDDEN: Automation based on pattern
  const lastMonthCount = bookingsByMonth[getCurrentMonth()];
  if (lastMonthCount < 2) {
    await this.reengagementService.sendOffer(customerId);  // Automation!
  }
  
  return {
    customerId,
    activity: bookingsByMonth,
  };
}
```

**Why Forbidden:**
- Triggers automation based on pattern
- Encodes business rules
- Becomes engagement engine

---

## SECTION 6 — CANONICAL RULES

### Rule 1: History Is Safe, Lifecycle Is Not

Accumulating historical data is safe. Encoding lifecycle state is forbidden.

### Rule 2: Patterns Are Safe, Automation Is Not

Displaying temporal patterns is safe. Triggering actions based on patterns is forbidden.

### Rule 3: Visibility Is Safe, Orchestration Is Not

Showing accumulated context is safe. Orchestrating based on context is forbidden.

### Rule 4: Aggregation Is Safe, Scoring Is Not

Aggregating counts and totals is safe. Computing engagement scores is forbidden.

### Rule 5: Timeline Is Safe, Schedule Is Not

Displaying timeline of events is safe. Scheduling future actions is forbidden.

### Rule 6: Identity Links Are Safe, Unification Is Not

Linking customer identity across capabilities is safe. Creating unified customer view with automation is forbidden.

### Rule 7: Read-Only Memory Is Safe, Stateful Memory Is Not

Accumulating read-only history is safe. Maintaining orchestration state is forbidden.

### Rule 8: Observation Is Safe, Intervention Is Not

Observing patterns is safe. Intervening based on patterns is forbidden.

---

## SECTION 7 — VALIDATION GATES

### Gate 1: No Lifecycle State

```bash
grep -r "lifecycleStage\|customerStage\|engagementStage" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Automation Schedules

```bash
grep -r "followUpDate\|nextAction\|scheduleFollowUp" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Workflow Position

```bash
grep -r "workflowPosition\|conversionStage\|pipelineStage" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Automation Triggers

```bash
grep -r "triggerFollowUp\|sendReengagement\|scheduleAutomation" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Scoring

```bash
grep -r "engagementScore\|churnRisk\|loyaltyScore" src/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
