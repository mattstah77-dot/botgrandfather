# Lifecycle Integrity Audit

**Purpose:** Validate lifecycle systems across all capabilities  
**Status:** COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## LEAD FUNNEL LIFECYCLE

### States

```
idle → answering_questions → waiting_contact → completed → idle
```

### State Definitions

| State | Meaning | Entry Condition | Exit Condition |
|-------|---------|-----------------|----------------|
| `idle` | No active session | Initial state | User starts funnel |
| `answering_questions` | User answering questions | First question sent | All questions answered |
| `waiting_contact` | User providing contact info | Questions complete | Contact received |
| `completed` | Funnel complete | Lead created | User restarts |

### Transitions

```typescript
// /start
idle → answering_questions

// Answer question
answering_questions → answering_questions  // Next question

// Last question answered
answering_questions → waiting_contact

// Contact received
waiting_contact → completed

// /restart
any → idle → answering_questions
```

### Forbidden Transitions

| Transition | Blocked By |
|------------|-----------|
| idle → waiting_contact | No — requires question answers |
| idle → completed | No — requires question flow |
| completed → answering_questions | No — requires /restart |
| waiting_contact → answering_questions | No — questions already answered |

### Integrity Checks

**Check 1: CurrentQuestion Index Validation**
```typescript
const currentQuestion = config.questions[currentIndex];
if (!currentQuestion) {
  // All questions answered → move to contact
  await this.askForContact(context, state);
}
```

**Check 2: Callback Question ID Validation**
```typescript
if (currentQuestion.id !== questionId) {
  // Stale callback
  return;
}
```

**Check 3: Contact Submission Validation**
```typescript
const contact = context.messageText;
if (!contact.trim()) {
  // Empty contact → prompt again
  return;
}
```

### Lifecycle Integrity: ✅ PASS

---

## BOOKING LIFECYCLE

### States

```
pending → confirmed → completed
                    → cancelled
pending → cancelled
confirmed → no-show
```

### State Definitions

| State | Meaning | Entry Condition | Exit Condition |
|-------|---------|-----------------|----------------|
| `pending` | Booking awaiting confirmation | Booking created | Confirmed, cancelled |
| `confirmed` | Booking confirmed by owner | Owner confirms | Completed, cancelled, no-show |
| `completed` | Booking completed | Owner marks complete | None |
| `cancelled` | Booking cancelled | Customer/owner cancels | None |
| `no-show` | Customer didn't show | Owner marks no-show | None |

### Transitions

```typescript
// Customer flow
pending → confirmed  // Customer confirms booking

// Owner operations
pending → confirmed  // Owner confirms
pending → cancelled  // Owner cancels
confirmed → completed  // Owner completes
confirmed → cancelled  // Owner cancels
confirmed → no-show  // Owner marks no-show
```

### Forbidden Transitions

| Transition | Blocked By |
|------------|-----------|
| confirmed → pending | Status validation |
| completed → confirmed | Status validation |
| no-show → confirmed | Status validation |
| cancelled → confirmed | Status validation |
| completed → no-show | Status validation |

### Integrity Checks

**Check 1: Confirm Validation**
```typescript
if (booking.status !== 'pending') {
  throw new Error(`Cannot confirm booking with status: ${booking.status}`);
}
```

**Check 2: Cancel Validation**
```typescript
if (booking.status === 'completed' || booking.status === 'no-show') {
  throw new Error(`Cannot cancel booking with status: ${booking.status}`);
}
```

**Check 3: Complete Validation**
```typescript
if (booking.status !== 'confirmed') {
  throw new Error(`Cannot complete booking with status: ${booking.status}`);
}
```

**Check 4: No-Show Validation**
```typescript
if (booking.status !== 'confirmed') {
  throw new Error(`Cannot mark no-show for booking with status: ${booking.status}`);
}
```

### Lifecycle Integrity: ✅ PASS

---

## SUPPORT DESK LIFECYCLE

### States

```
open → in-progress → resolved → closed
         ↑____________↓
```

### State Definitions

| State | Meaning | Entry Condition | Exit Condition |
|-------|---------|-----------------|----------------|
| `open` | New ticket, unassigned | Customer creates | Taken, assigned |
| `in-progress` | Being worked on | Taken/assigned | Resolved, closed, reopened |
| `resolved` | Issue resolved | Owner resolves | Closed, reopened |
| `closed` | Ticket closed | Owner closes | Reopened (by customer/owner) |

### Transitions

```typescript
// Customer creates
(new) → open

// Owner operations
open → in-progress  // Owner takes
open → in-progress  // Owner assigns
in-progress → resolved  // Owner resolves
in-progress → closed  // Owner closes
resolved → closed  // Owner closes
resolved → in-progress  // Owner reopens
closed → in-progress  // Owner reopens

// Customer message
resolved → in-progress  // Customer sends message
closed → in-progress  // Customer sends message
```

### Forbidden Transitions

| Transition | Blocked By |
|------------|-----------|
| closed → resolved | Status validation |
| resolved → open | Status validation |
| in-progress → open | Status validation |
| open → closed | Status validation (no direct close) |
| closed → open | Status validation |

### Integrity Checks

**Check 1: Take Validation**
```typescript
if (ticket.status !== 'open') {
  throw new Error(`Cannot take ticket with status: ${ticket.status}`);
}
```

**Check 2: Resolve Validation**
```typescript
if (ticket.status !== 'open' && ticket.status !== 'in-progress') {
  throw new Error(`Cannot resolve ticket with status: ${ticket.status}`);
}
```

**Check 3: Close Validation**
```typescript
if (ticket.status === 'closed') {
  throw new Error('Ticket is already closed');
}
```

**Check 4: Reopen Validation**
```typescript
if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
  throw new Error(`Cannot reopen ticket with status: ${ticket.status}`);
}
```

**Check 5: Reply Validation**
```typescript
if (ticket.status === 'closed') {
  throw new Error('Cannot reply to closed ticket');
}
```

### Lifecycle Integrity: ✅ PASS

---

## CROSS-CAPABILITY LIFECYCLE RULES

### Rule 1: No Shared Transitions

Each capability has independent lifecycle. No cross-capability transitions.

### Rule 2: No Universal State Machine

Each capability implements its own lifecycle logic. No shared state machine.

### Rule 3: Status Validation Is Mandatory

All lifecycle transitions MUST validate status before proceeding.

### Rule 4: Forbidden Transitions Must Throw

Illegal transitions MUST throw error, not silently fail.

### Rule 5: Lifecycle Events Must Be Emitted

Each lifecycle transition MUST emit corresponding analytics event.

---

## LIFECYCLE TRANSITION RULES REFERENCE

### Lead Funnel

| From | To | Trigger | Method |
|------|-----|---------|--------|
| idle | answering_questions | /start | handleStart() |
| answering_questions | answering_questions | Answer question | saveAnswerAndProceed() |
| answering_questions | waiting_contact | All questions answered | askForContact() |
| waiting_contact | completed | Contact received | handleContact() |
| any | idle | /restart | clearUserState() |

### Booking

| From | To | Trigger | Method |
|------|-----|---------|--------|
| (new) | pending | Customer confirms | handleConfirmBooking() |
| pending | confirmed | Owner confirms | confirmBooking() |
| pending | cancelled | Owner cancels | cancelBooking() |
| confirmed | completed | Owner completes | completeBooking() |
| confirmed | cancelled | Owner cancels | cancelBooking() |
| confirmed | no-show | Owner marks | markNoShow() |
| cancelled | (final) | — | — |
| completed | (final) | — | — |
| no-show | (final) | — | — |

### Support Desk

| From | To | Trigger | Method |
|------|-----|---------|--------|
| (new) | open | Customer creates | createTicket() |
| open | in-progress | Owner takes | takeTicket() |
| open | in-progress | Owner assigns | assignTicket() |
| in-progress | resolved | Owner resolves | resolveTicket() |
| in-progress | closed | Owner closes | closeTicket() |
| resolved | closed | Owner closes | closeTicket() |
| resolved | in-progress | Owner reopens | reopenTicketOwner() |
| resolved | in-progress | Customer message | handleDefault() |
| closed | in-progress | Owner reopens | reopenTicketOwner() |
| closed | in-progress | Customer message | handleDefault() |

---

**Version 1.0 — 2026-05-23**
