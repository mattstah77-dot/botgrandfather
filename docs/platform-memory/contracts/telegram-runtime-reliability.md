# Telegram Runtime Reliability

**Purpose:** Define Telegram-specific runtime reliability semantics  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 06 — Concurrency & Reliability Validation  
**Date:** 2026-05-23

---

## TELEGRAM RUNTIME REALITIES

### Reality 1: Duplicate Webhook Delivery

**What:** Telegram may deliver the same update multiple times.

**Why:** Network timeouts, retries, or Telegram-side redelivery.

**Impact:** Same user action processed multiple times.

**Protection Required:**
```typescript
// ✅ REQUIRED: update_id deduplication
@Injectable()
class WebhookService {
  private processedUpdateIds = new Set<number>();
  
  async processUpdate(update: TelegramUpdate) {
    if (this.processedUpdateIds.has(update.update_id)) {
      return;  // Skip duplicate
    }
    
    this.processedUpdateIds.add(update.update_id);
    
    // Process update...
    await this.handleUpdate(update);
    
    // Cleanup old IDs (keep last 10,000)
    if (this.processedUpdateIds.size > 10000) {
      const ids = Array.from(this.processedUpdateIds).sort((a, b) => a - b);
      this.processedUpdateIds = new Set(ids.slice(-5000));
    }
  }
}
```

**Protection Unnecessary:**
- Distributed deduplication (single instance is sufficient)
- Persistent deduplication store (in-memory set is sufficient)
- Complex deduplication framework

---

### Reality 2: Delayed Updates

**What:** Webhook may arrive seconds or minutes late.

**Why:** Network delays, Telegram queue delays, or platform downtime.

**Impact:** User action processed after delay. State may have changed.

**Protection Required:**
```typescript
// ✅ REQUIRED: Idempotent handlers
async handleBookingConfirmation(context: TemplateContext, progress: BookingProgress) {
  // Re-check current state before acting
  const booking = await this.bookingRepository.findOne({
    where: { id: progress.bookingId }
  });
  
  if (booking.status !== 'pending') {
    // Already processed or state changed
    return;  // Idempotent no-op
  }
  
  // Proceed with confirmation...
}
```

**Protection Unnecessary:**
- Timestamp-based rejection (delays are acceptable)
- Update ordering enforcement (out-of-order is acceptable)
- Complex delay handling

---

### Reality 3: Callback Replay

**What:** User clicks inline button. Telegram sends callback_query. If handler times out, Telegram may retry.

**Why:** Telegram expects callback answer within timeout.

**Impact:** Same callback processed multiple times.

**Protection Required:**
```typescript
// ✅ REQUIRED: Callback idempotency
async handleCallbackQuery(callbackQuery: CallbackQuery) {
  const callbackId = callbackQuery.id;
  const userId = callbackQuery.from.id;
  
  // Check if already processed
  if (await this.isCallbackProcessed(callbackId)) {
    await this.answerCallback(callbackId, 'Already processed');
    return;
  }
  
  // Mark as processed
  await this.markCallbackProcessed(callbackId);
  
  // Process...
}
```

**Protection Unnecessary:**
- Callback locking
- Distributed callback tracking
- Complex callback state machine

---

### Reality 4: Retry Semantics

**What:** Telegram retries failed webhook deliveries.

**Why:** Telegram guarantees at-least-once delivery.

**Impact:** Same update may arrive multiple times.

**Protection Required:**
- update_id deduplication (same as Reality 1)
- Idempotent handlers (same as Reality 2)

**Protection Unnecessary:**
- Exactly-once delivery guarantee (not needed)
- Message queue for ordering (not needed)
- Complex retry handling

---

### Reality 5: Out-of-Order Updates

**What:** Updates may arrive out of order.

**Example:**
```
T+0: User sends "Book"
T+1: User sends "Cancel"
T+2: "Cancel" arrives first
T+3: "Book" arrives second
```

**Impact:** User intent may be processed in wrong order.

**Protection Required:**
```typescript
// ✅ REQUIRED: State-machine validation
async handleMessage(message: Message, context: TemplateContext) {
  const customer = await this.customerService.findOrCreate(message.from.id);
  
  // Validate message against current state
  if (message.text === 'Cancel' && customer.status !== 'booking_flow') {
    await this.sendMessage(customer.id, 'Nothing to cancel');
    return;
  }
  
  // Process in context of current state
}
```

**Protection Unnecessary:**
- Update sequencing (not possible with webhooks)
- Message queue ordering (overkill)
- Distributed ordering guarantees

---

## IDEMPOTENCY GUARANTEES

### Required Idempotency

| Operation | Idempotency | Mechanism |
|-----------|-------------|-----------|
| **Booking creation** | REQUIRED | update_id + DB unique constraint |
| **Booking confirmation** | REQUIRED | Status check (idempotent if already confirmed) |
| **Booking cancellation** | REQUIRED | Status check (idempotent if already cancelled) |
| **Message sending** | NOT REQUIRED | Sending message twice is acceptable |
| **State update** | REQUIRED | State-machine validation |

### Idempotency Implementation

```typescript
// ✅ CORRECT: Idempotent booking creation
async createBooking(data: CreateBookingDto, updateId: number) {
  // Deduplication
  if (await this.isUpdateProcessed(updateId)) {
    return this.getBookingByUpdateId(updateId);  // Return existing
  }
  
  // Create booking
  const booking = await this.bookingRepository.save(data);
  
  // Track update
  await this.trackProcessedUpdate(updateId, booking.id);
  
  return booking;
}
```

---

## WHAT PROTECTIONS ARE REQUIRED

| Protection | Required? | Implementation |
|------------|-----------|---------------|
| update_id deduplication | ✅ YES | In-memory Set (last 10K) |
| Idempotent handlers | ✅ YES | State re-check before mutation |
| Graceful timeout handling | ✅ YES | Answer callback before processing |
| Status validation | ✅ YES | Re-read state before mutation |
| Message queue | ❌ NO | Not needed |
| Distributed locking | ❌ NO | Not needed |
| Persistent dedup store | ❌ NO | In-memory sufficient |
| Retry framework | ❌ NO | Telegram handles retries |
| Ordering guarantees | ❌ NO | State machine handles out-of-order |

---

## CANONICAL RULES

### Rule 1: update_id Deduplication Is Required

Process each update_id exactly once. Skip duplicates.

### Rule 2: Handlers Must Be Idempotent

Re-check state before mutation. No-op if already processed.

### Rule 3: Status Validation Is Required

Re-read entity status before status transitions.

### Rule 4: No Message Queue Needed

Telegram retries + deduplication + idempotency = sufficient.

### Rule 5: No Distributed Locking Needed

Single-instance deduplication + DB constraints = sufficient.

### Rule 6: Out-of-Order Is Acceptable

State machine validation handles out-of-order updates.

---

**Version 1.0 — UNIT 06 — 2026-05-23**
