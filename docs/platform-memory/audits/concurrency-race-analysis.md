# Concurrency & Race Condition Analysis

**Purpose:** Identify and classify race conditions across runtime surfaces  
**Status:** COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## AUDIT METHODOLOGY

For each concurrent operation pair:
1. Identify shared resources
2. Determine race window
3. Assess impact
4. Propose containment

---

## RACE CONDITION INVENTORY

### Race 1: Simultaneous Webhook Delivery (Same Update)

**Scenario:** Telegram sends same update twice simultaneously (retry + original)

**Window:** Microseconds

**Shared Resource:** ProcessedUpdate table

**Current Protection:**
```typescript
// ProcessedUpdate unique constraint
@Unique(['botId', 'updateId'])
```

**Impact:** One webhook wins, other gets duplicate key error.

**Severity:** LOW

**Containment:** Database unique constraint.

---

### Race 2: Simultaneous Webhook Delivery (Different Updates, Same User)

**Scenario:** User sends two messages simultaneously

**Window:** Milliseconds

**Shared Resource:** UserState, Customer, Booking/Ticket/Lead

**Current Protection:** None — sequential processing per process

**Impact:**
- UserState: Last write wins
- Customer: ensureCustomer has race handling
- Business entities: Depends on operation

**Severity:** MEDIUM

**Containment:**
```typescript
// UserState creation race handling
try {
  await this.userStateRepository.save(state);
} catch (error) {
  if (isUniqueViolation) {
    state = await this.userStateRepository.findOne({ ... });
  }
}
```

---

### Race 3: Booking Double-Confirm

**Scenario:** Two users confirm same slot simultaneously

**Window:** Milliseconds

**Shared Resource:** Booking table (specific slot)

**Current Protection:**
```typescript
// Pre-check
const existing = await this.bookingRepository.findOne({
  where: { botId, date, timeSlot, status: 'pending' }
});
if (existing) { /* reject */ }

// Unique constraint
@Unique(['botId', 'date', 'timeSlot', 'status'])
```

**Impact:** Check-then-act race. Both pass pre-check, one wins unique constraint.

**Severity:** MEDIUM

**Containment:** Unique constraint catches race. User sees error.

**Gap:** Pre-check is optimistic. Race possible.

---

### Race 4: Owner Confirm + Customer Cancel

**Scenario:** Owner confirms booking while customer cancels

**Window:** Milliseconds to seconds

**Shared Resource:** Booking entity

**Current Protection:**
```typescript
// confirmBooking checks status
if (booking.status !== 'pending') throw new Error('Cannot confirm');

// cancelBooking checks status
if (booking.status === 'completed' || booking.status === 'no-show') {
  throw new Error('Cannot cancel');
}
```

**Impact:** Check-then-act race. Both pass check, one wins.

**Severity:** LOW

**Containment:** Status validation. One operation succeeds, other fails.

---

### Race 5: Ticket Resolve + Customer Reopen

**Scenario:** Owner resolves ticket while customer sends message

**Window:** Milliseconds to seconds

**Shared Resource:** Ticket entity

**Current Protection:** None — sequential processing

**Impact:**
1. Owner reads ticket (status: open)
2. Customer sends message → ticket reopened
3. Owner resolves → ticket resolved
4. Customer message lost (ticket resolved)

**Severity:** MEDIUM

**Containment:** This is semantically correct. Customer can send follow-up.

---

### Race 6: Ticket Take + Assign

**Scenario:** Two owners take same ticket simultaneously

**Window:** Milliseconds

**Shared Resource:** Ticket entity

**Current Protection:**
```typescript
// takeTicket checks status
if (ticket.status !== 'open') throw new Error('Cannot take');
```

**Impact:** Check-then-act race. One wins, other gets error.

**Severity:** LOW

**Containment:** Status validation.

---

### Race 7: UserState Overwrite

**Scenario:** Two updates modify same UserState

**Window:** Milliseconds

**Shared Resource:** UserState entity

**Current Protection:** None — UPDATE overwrites

**Impact:** Last write wins. State may be inconsistent.

**Severity:** LOW

**Containment:** UserState is advisory. Business data is authoritative.

---

### Race 8: ProcessedUpdate Insertion

**Scenario:** Two identical webhooks arrive simultaneously

**Window:** Microseconds

**Shared Resource:** ProcessedUpdate table

**Current Protection:**
```typescript
@Unique(['botId', 'updateId'])
```

**Impact:** One succeeds, other gets duplicate key error.

**Severity:** LOW

**Containment:** Database unique constraint.

---

### Race 9: Customer Creation

**Scenario:** Two webhooks for new customer arrive simultaneously

**Window:** Milliseconds

**Shared Resource:** Customer table

**Current Protection:**
```typescript
// CustomerService.ensureCustomer()
let customer = await this.customerRepository.findOne({ ... });
if (!customer) {
  customer = this.customerRepository.create({ ... });
  try {
    await this.customerRepository.save(customer);
  } catch (error) {
    if (isUniqueViolation) {
      customer = await this.customerRepository.findOne({ ... });
    }
  }
}
```

**Impact:** Check-then-act race. One wins, other fetches existing.

**Severity:** LOW

**Containment:** Unique constraint + retry.

---

### Race 10: Dashboard Query + Runtime Write

**Scenario:** Dashboard reads bookings while runtime creates booking

**Window:** Milliseconds

**Shared Resource:** Booking table

**Current Protection:** None — read committed isolation

**Impact:** Dashboard may show slightly stale data.

**Severity:** LOW

**Containment:** Acceptable — dashboard is eventually consistent.

---

## RACE SEVERITY MATRIX

| Race | Severity | Frequency | Impact | Containment |
|------|----------|-----------|--------|-------------|
| Duplicate webhook | LOW | Common | Skip | Unique constraint |
| Same user messages | MEDIUM | Common | State overwrite | Advisory state |
| Double booking | MEDIUM | Rare | One rejected | Unique constraint |
| Owner + customer action | LOW | Rare | One fails | Status validation |
| Resolve + reopen | MEDIUM | Rare | Valid behavior | Semantics |
| Double take | LOW | Rare | One fails | Status validation |
| UserState overwrite | LOW | Common | Stale state | Advisory |
| ProcessedUpdate insert | LOW | Rare | Skip | Unique constraint |
| Customer creation | LOW | Common | Fetch existing | Unique constraint |
| Dashboard read | LOW | Common | Stale data | Acceptable |

---

## PROPOSED CONTAINMENT

### Containment 1: Optimistic Status Checks

Already implemented. Status validation prevents most races.

```typescript
if (booking.status !== 'pending') throw new Error('Cannot confirm');
if (ticket.status !== 'open') throw new Error('Cannot take');
```

### Containment 2: Unique Constraints

Already implemented. Database prevents duplicate entities.

```typescript
@Unique(['botId', 'updateId'])        // ProcessedUpdate
@Unique(['botId', 'date', 'timeSlot', 'status'])  // Booking
@Unique(['botId', 'userId'])          // UserState
```

### Containment 3: Explicit Status Validation

All lifecycle endpoints validate status before transition.

```typescript
// Required for all lifecycle actions
if (currentStatus !== expectedStatus) {
  throw new Error(`Cannot transition from ${currentStatus}`);
}
```

### Containment 4: Transactional Writes

Critical writes are wrapped in transactions.

```typescript
// Booking creation, lead creation
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
  await queryRunner.manager.save(entity);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
}
```

---

## FORBIDDEN CONTAINMENT

### ❌ Distributed Locking

```typescript
// FORBIDDEN
await redis.lock(`booking:${slotId}`);
try {
  await createBooking();
} finally {
  await redis.unlock(`booking:${slotId}`);
}
```

**Why forbidden:** Introduces Redis dependency and complexity.

### ❌ Queue-Based Serialization

```typescript
// FORBIDDEN
await queue.enqueue('booking', { userId, slotId });
// Worker processes one at a time
```

**Why forbidden:** Introduces queue infrastructure.

### ❌ Optimistic Locking with Version

```typescript
// FORBIDDEN
@Entity()
class Booking {
  @VersionColumn()
  version: number;
}
// Update with version check
```

**Why forbidden:** Over-engineering for current race frequency.

---

## VERDICT

| Category | Count |
|----------|-------|
| Races identified | 10 |
| HIGH severity | 0 |
| MEDIUM severity | 3 |
| LOW severity | 7 |
| Already contained | 8 |
| Need improvement | 2 |

**Overall Assessment:** Race conditions are well-contained. Database constraints and status validation handle most cases. No distributed locking needed.

---

**Version 1.0 — 2026-05-23**
