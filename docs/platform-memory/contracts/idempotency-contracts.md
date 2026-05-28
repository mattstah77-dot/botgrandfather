# Idempotency Contracts

**Purpose:** Define idempotency guarantees for all runtime operations  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## IDEMPOTENCY PHILOSOPHY

### What Idempotency Means

> An operation is idempotent if executing it multiple times has the same effect as executing it once.

### Platform-Level Idempotency

BotGrandFather guarantees idempotency at the **webhook level** via ProcessedUpdate.

BotGrandFather does NOT guarantee idempotency at the **business logic level** unless explicitly stated.

### Why This Distinction Matters

```
Webhook Level (Platform)
├── Telegram sends update_id=12345
├── ProcessedUpdate checks (botId, 12345)
├── If exists → skip (idempotent)
└── If not → process + mark

Business Logic Level (Template)
├── User clicks "confirm" button
├── No idempotency key
├── Double-click → double effect
└── Status validation prevents
```

---

## IDEMPOTENCY INVARIANTS

### Invariant 1: Webhook Processing Is Idempotent

```typescript
// Platform guarantee
async processUpdate(botId, secret, update) {
  const isProcessed = await isUpdateProcessed(botId, update.update_id);
  if (isProcessed) return { skipped: true };  // ✅ Idempotent
  // ... process ...
  await markUpdateAsProcessed(botId, update.update_id);
}
```

### Invariant 2: Duplicate ProcessedUpdate Write Is Safe

```typescript
// Database unique constraint prevents duplicates
@Entity('processed_updates')
@Unique(['botId', 'updateId'])  // Database-level idempotency
```

### Invariant 3: Status-Based Operations Are Idempotent

Operations that check status before acting are naturally idempotent:

```typescript
// Booking: double-confirm → safe
if (booking.status !== 'pending') {
  throw new Error('Cannot confirm');  // ✅ Idempotent by status
}

// Support: double-resolve → safe
if (ticket.status !== 'open' && ticket.status !== 'in-progress') {
  throw new Error('Cannot resolve');  // ✅ Idempotent by status
}
```

### Invariant 4: Append-Only Operations Are Idempotent

Appending to a collection is idempotent if duplicates are acceptable:

```typescript
// Support: duplicate message → append
await this.appendMessage(ticket, message);  // ✅ Idempotent (append)
```

### Invariant 5: Create Operations Are NOT Idempotent (Without Constraint)

```typescript
// Lead: duplicate submission → two leads
await this.leadRepository.save(lead);  // ❌ NOT idempotent
```

---

## IDEMPOTENCY BY CAPABILITY

### Lead Funnel

| Operation | Idempotent? | Mechanism | Risk |
|-----------|-------------|-----------|------|
| /start | ✅ Yes | UserState creation with unique constraint | None |
| Answer question | ✅ Yes | State update via UPDATE | None |
| Contact submission | ❌ No | No unique constraint on Lead | Duplicate lead |
| Callback click | ⚠️ Partial | State validation | Stale callback |

### Booking

| Operation | Idempotent? | Mechanism | Risk |
|-----------|-------------|-----------|------|
| /start | ✅ Yes | UserState creation | None |
| Select service | ✅ Yes | State update | None |
| Select date | ✅ Yes | State update | None |
| Select time | ✅ Yes | State update | None |
| Confirm booking | ⚠️ Partial | Pre-check + unique constraint | Race condition |
| Cancel booking | ✅ Yes | Status validation | None |
| Owner confirm | ✅ Yes | Status validation | None |
| Owner cancel | ✅ Yes | Status validation | None |
| Owner complete | ✅ Yes | Status validation | None |

### Support Desk

| Operation | Idempotent? | Mechanism | Risk |
|-----------|-------------|-----------|------|
| Customer message | ✅ Yes | Find existing ticket | Append message |
| Create ticket | ⚠️ Partial | No unique constraint | Duplicate ticket |
| Take ticket | ✅ Yes | Status validation | None |
| Assign ticket | ✅ Yes | Status validation | None |
| Reply to ticket | ❌ No | No deduplication | Duplicate reply |
| Resolve ticket | ✅ Yes | Status validation | None |
| Close ticket | ✅ Yes | Status validation | None |
| Reopen ticket | ✅ Yes | Status validation | None |

---

## DUPLICATE EXECUTION PREVENTION STRATEGY

### Strategy 1: Database Unique Constraints

**When to use:** Entity creation that must happen once.

**Examples:**
```typescript
// Lead entity — ADD UNIQUE CONSTRAINT
@Entity('leads')
@Unique(['botId', 'userId'])
class Lead { ... }

// Booking entity — already has unique constraint
@Entity('bookings')
@Unique(['botId', 'date', 'timeSlot', 'status'])
class Booking { ... }

// Ticket entity — no unique constraint needed (customer can have multiple)
```

### Strategy 2: Status Validation

**When to use:** State transitions that must happen once.

**Examples:**
```typescript
// Booking confirmation
if (booking.status !== 'pending') {
  throw new Error('Cannot confirm');
}

// Ticket resolution
if (ticket.status !== 'open' && ticket.status !== 'in-progress') {
  throw new Error('Cannot resolve');
}
```

### Strategy 3: ProcessedUpdate Tracking

**When to use:** Webhook-level idempotency.

**Current implementation:**
```typescript
@Unique(['botId', 'updateId'])
class ProcessedUpdate { ... }
```

**Gap:** Does not track callback_query_id separately.

### Strategy 4: Explicit Idempotency Keys (Future)

**When to use:** API calls that need idempotency.

**Pattern:**
```typescript
// Client generates idempotency key
POST /api/bookings/{id}/confirm
Idempotency-Key: abc-123-xyz

// Server stores key for 24 hours
// Duplicate key → return cached response
```

**Status:** NOT IMPLEMENTED. Consider for Mini App API.

---

## ENDPOINT-LEVEL IDEMPOTENCY CHECKLIST

### Webhook Endpoints

| Endpoint | Idempotent? | Test |
|----------|-------------|------|
| POST /webhook/:botId/:secret | ✅ Yes | Send same update twice → second skipped |
| POST /webhook/:botId/:secret (callback) | ⚠️ Partial | Click button twice → status check |

### Operational Endpoints

| Endpoint | Idempotent? | Test |
|----------|-------------|------|
| POST /bookings/:id/confirm | ✅ Yes | Double confirm → error |
| POST /bookings/:id/cancel | ✅ Yes | Double cancel → error |
| POST /bookings/:id/complete | ✅ Yes | Double complete → error |
| POST /tickets/:id/resolve | ✅ Yes | Double resolve → error |
| POST /tickets/:id/close | ✅ Yes | Double close → error |
| POST /tickets/:id/reopen | ✅ Yes | Double reopen → error |
| POST /tickets/:id/take | ✅ Yes | Double take → error |
| POST /tickets/:id/reply | ❌ No | Double reply → two messages |

---

## TELEGRAM RETRY EDGE CASES

### Edge Case 1: Retry During Processing

**Scenario:**
1. Telegram sends update_id=100
2. Server starts processing
3. Server crashes before marking processed
4. Server restarts
5. Telegram retries update_id=100
6. Server processes again

**Result:** Double processing.

**Mitigation:** Business operations must be idempotent or use transactions.

### Edge Case 2: Retry After Success

**Scenario:**
1. Server processes update_id=100 successfully
2. ProcessedUpdate write succeeds
3. Telegram times out waiting for 200 OK
4. Telegram retries update_id=100
5. ProcessedUpdate check → skip

**Result:** Correctly skipped.

**Mitigation:** ProcessedUpdate write is within same database.

### Edge Case 3: Callback Query Retry

**Scenario:**
1. User clicks button → callback_query_id=abc
2. Server processes callback
3. Telegram does not receive answerCallbackQuery
4. User clicks again → new callback_query_id=def
5. Server processes new callback

**Result:** Two separate callbacks with different IDs.

**Mitigation:** State validation prevents stale callbacks.

### Edge Case 4: Network Partition

**Scenario:**
1. Server processes update
2. ProcessedUpdate write succeeds locally
3. Network partition prevents 200 OK response
4. Telegram retries
5. Server sees ProcessedUpdate → skip

**Result:** Correctly skipped.

---

## GAPS AND RECOMMENDATIONS

### Gap 1: No Callback Query Idempotency

**Issue:** Callback queries are not tracked for idempotency.

**Recommendation:** Track callback_query_id in ProcessedUpdate or separate table.

**Priority:** LOW — Status validation provides sufficient protection.

### Gap 2: No Lead Unique Constraint

**Issue:** Lead entity has no unique constraint.

**Recommendation:** Add @Unique(['botId', 'userId']) to Lead.

**Priority:** MEDIUM — Duplicate leads pollute data.

### Gap 3: No API Idempotency Keys

**Issue:** Mini App API has no idempotency mechanism.

**Recommendation:** Add Idempotency-Key header support for POST endpoints.

**Priority:** LOW — UI should disable buttons after click.

### Gap 4: No Ticket Reply Deduplication

**Issue:** Duplicate ticket replies possible.

**Recommendation:** Accept as valid — duplicate replies are semantically possible.

**Priority:** LOW — Not a bug, a feature.

---

**Version 1.0 — 2026-05-23**
