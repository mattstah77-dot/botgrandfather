# Runtime Failure Matrix

**Purpose:** Complete runtime failure surface audit across all capabilities  
**Status:** COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## AUDIT SCOPE

### Capabilities Audited
- Lead Funnel (`LeadFunnelService`)
- Booking (`BookingRuntimeService`)
- Support Desk (`SupportRuntimeService`)

### Platform Layers Audited
- Telegram webhook processing (`WebhookService`)
- ProcessedUpdate lifecycle (`BotService`)
- UserState lifecycle (`UserStateRepository`)
- Analytics event emission (`AnalyticsService`)
- Dashboard aggregation (`DashboardService`)
- Mini App operational APIs (controllers)

---

## SECTION 1 — WEBHOOK PROCESSING FAILURE SURFACE

### Failure Point 1: Duplicate Webhook Delivery

**Symptom:** Telegram retries webhook on timeout (even after 200 OK)

**Current Protection:**
```typescript
// WebhookService.processUpdate()
const isAlreadyProcessed = await this.botService.isUpdateProcessed(
  botId,
  update.update_id
);
if (isAlreadyProcessed) return { skipped: true };
```

**Severity:** LOW — Idempotency via ProcessedUpdate

**Recovery Strategy:** Duplicate updates are silently skipped. No state corruption.

**Risk:** If ProcessedUpdate write fails after business logic succeeds → duplicate processing.

**Mitigation:** ProcessedUpdate write happens AFTER business logic. Duplicate handling relies on unique constraint.

---

### Failure Point 2: Webhook Timeout

**Symptom:** Telegram webhook timeout (30s limit)

**Current Protection:**
```typescript
// WebhookController.handleWebhook()
const result = await this.webhookService.processUpdate(...);  // AWAIT
res.status(200).json({ ok: true });
```

**Severity:** MEDIUM — If processing takes >30s, Telegram retries

**Recovery Strategy:** Idempotency prevents duplicate side effects.

**Risk:** Long-running operations (owner notification, multiple Telegram calls) can exceed timeout.

**Mitigation:** ProcessedUpdate prevents duplicates. Timeout returns 5xx → Telegram retries.

---

### Failure Point 3: Webhook Authentication Failure

**Symptom:** Invalid botId or secret in webhook URL

**Current Protection:**
```typescript
const bot = await this.botService.verifyWebhook(botId, secret);
if (!bot) throw new BadRequestException('Invalid credentials');
```

**Severity:** LOW — Auth failure returns 4xx, not retried by Telegram

**Recovery Strategy:** Owner fixes webhook configuration.

**Risk:** None — authentication failures are expected and safe.

---

### Failure Point 4: Template Dispatch Failure

**Symptom:** Unknown template or invalid TemplateContext

**Current Protection:**
```typescript
await this.templateFactory.handleUpdate(bot.template, context);
```

**Severity:** MEDIUM — Template not found or throws error

**Recovery Strategy:** 5xx response → Telegram retries. ProcessedUpdate prevents duplicate.

**Risk:** If template throws after partial writes, duplicate retry may fail.

**Mitigation:** Each template uses transactions for critical writes.

---

## SECTION 2 — BOOKING CAPABILITY FAILURE SURFACE

### Failure Point 5: Double Booking (Race Condition)

**Symptom:** Two users click "confirm" simultaneously for same slot

**Current Protection:**
```typescript
// Pre-check in runtime
const existing = await this.bookingRepository.findOne({
  where: { botId, date, timeSlot, status: 'pending' }
});
if (existing) { /* show error */ }

// Unique constraint in database
@Unique(['botId', 'date', 'timeSlot', 'status'])
class Booking { ... }
```

**Severity:** MEDIUM — Race between check and write

**Recovery Strategy:** Unique constraint violation caught, user shown error.

**Risk:** Both users see "confirmed" message, one fails.

**Mitigation:** Database unique constraint is final. Race condition handled gracefully.

---

### Failure Point 6: Double Confirmation

**Symptom:** User clicks "confirm" button twice rapidly

**Current Protection:** None — no idempotency on callback queries

**Severity:** MEDIUM — Second click may fail or corrupt state

**Recovery Strategy:** Booking status check in `confirmBooking()`.

**Risk:** If booking already confirmed, throws error. User sees error message.

**Mitigation:** Status validation prevents double confirmation.

---

### Failure Point 7: Booking Transaction Failure

**Symptom:** Database write fails after analytics emitted

**Current Protection:**
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  await queryRunner.manager.save(booking);
  await queryRunner.manager.update(Customer, ...);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}

// Analytics emitted AFTER transaction
await this.analyticsService.trackEvent(...);
```

**Severity:** LOW — Analytics after transaction

**Recovery Strategy:** Transaction rollback on failure. Analytics is eventual.

**Risk:** Transaction succeeds, analytics fails → booking exists but no event.

**Mitigation:** Analytics is non-critical. Eventual consistency acceptable.

---

### Failure Point 8: Stale UserState

**Symptom:** UserState not updated after booking confirmation

**Current Protection:**
```typescript
await this.clearUserState(context);  // After booking created
```

**Severity:** LOW — UserState is advisory only

**Recovery Strategy:** User sends /restart to reset state.

**Risk:** Stale state blocks new booking. User must restart.

**Mitigation:** /restart command clears state.

---

## SECTION 3 — SUPPORT DESK FAILURE SURFACE

### Failure Point 9: Duplicate Ticket Creation

**Symptom:** Customer sends same message twice

**Current Protection:**
```typescript
const existingTicket = await this.findExistingTicket(botId, customerId);
if (existingTicket) {
  await this.appendMessage(existingTicket, message);
} else {
  await this.createTicket(...);
}
```

**Severity:** LOW — Messages appended to existing ticket

**Recovery Strategy:** Duplicate messages are valid in support context.

**Risk:** None — duplicate messages are semantically valid.

---

### Failure Point 10: Duplicate Resolve/Close

**Symptom:** Owner clicks "resolve" twice

**Current Protection:**
```typescript
if (ticket.status !== 'open' && ticket.status !== 'in-progress') {
  throw new Error(`Cannot resolve ticket with status: ${ticket.status}`);
}
```

**Severity:** LOW — Status validation prevents duplicate

**Recovery Strategy:** Error returned. Owner sees error message.

**Risk:** None — status check is final.

---

### Failure Point 11: Reopen Race

**Symptom:** Customer sends message while owner is closing ticket

**Current Protection:** None — sequential processing

**Severity:** MEDIUM — Lost update if concurrent

**Recovery Strategy:** Database optimistic locking (updatedAt check).

**Risk:** Owner closes ticket, customer message reopens it → ticket ends up in-progress.

**Mitigation:** This is semantically correct behavior. Reopen is valid.

---

## SECTION 4 — LEAD FUNNEL FAILURE SURFACE

### Failure Point 12: Duplicate Lead Creation

**Symptom:** User submits contact information twice

**Current Protection:**
```typescript
// Transaction in handleContact()
const lead = this.leadRepository.create({ ... });
await queryRunner.manager.save(lead);
```

**Severity:** MEDIUM — No unique constraint on Lead

**Recovery Strategy:** User must /restart to create new lead.

**Risk:** Two leads for same user.

**Mitigation:** Add unique constraint on (botId, userId).

---

### Failure Point 13: Stale Callback

**Symptom:** User clicks old callback button (from previous question)

**Current Protection:**
```typescript
if (state.currentStep !== 'answering_questions') {
  this.logger.warn(`Stale callback ignored`);
  return;
}

if (!currentQuestion || currentQuestion.id !== questionId) {
  this.logger.warn(`Stale callback ignored: question mismatch`);
  return;
}
```

**Severity:** LOW — Stale callbacks are ignored

**Recovery Strategy:** User restarts funnel.

**Risk:** None — callbacks are validated against current state.

---

## SECTION 5 — USERSTATE FAILURE SURFACE

### Failure Point 14: UserState Creation Race

**Symptom:** Two webhooks for same user arrive simultaneously

**Current Protection:**
```typescript
let state = await this.userStateRepository.findOne({ ... });
if (!state) {
  state = this.userStateRepository.create({ ... });
  try {
    await this.userStateRepository.save(state);
  } catch (error) {
    if (error instanceof QueryFailedError) {
      const isUniqueViolation = driverError?.code === '23505';
      if (isUniqueViolation) {
        // Race resolved — fetch existing
        state = await this.userStateRepository.findOne({ ... });
      }
    }
  }
}
```

**Severity:** LOW — Unique constraint + retry

**Recovery Strategy:** One webhook wins, other fetches existing state.

**Risk:** Minimal — state is advisory, not business-critical.

---

### Failure Point 15: UserState Overwrite

**Symptom:** Multiple updates modify state simultaneously

**Current Protection:** None — UPDATE overwrites

**Severity:** MEDIUM — Lost updates possible

**Recovery Strategy:** State is transient. Business data (Booking, Ticket, Lead) is authoritative.

**Risk:** UserState becomes inconsistent with reality.

**Mitigation:** UserState is purely advisory. Not used for business decisions.

---

## SECTION 6 — ANALYTICS FAILURE SURFACE

### Failure Point 16: Analytics Emission Failure

**Symptom:** AnalyticsService.trackEvent() throws

**Current Protection:** None — analytics is fire-and-forget

**Severity:** LOW — Analytics is non-critical

**Recovery Strategy:** Event lost. Business operation succeeds.

**Risk:** Data loss in analytics.

**Mitigation:** Analytics is eventually consistent. Eventual data loss acceptable.

---

### Failure Point 17: Analytics Duplicate

**Symptom:** Duplicate event due to webhook retry

**Current Protection:** None — no idempotency on analytics

**Severity:** LOW — Duplicates in analytics acceptable

**Recovery Strategy:** Data cleaning in analytics layer.

**Risk:** Inflated metrics.

**Mitigation:** Analytics aggregation can deduplicate.

---

## SECTION 7 — PROCESSSEDUPDATE FAILURE SURFACE

### Failure Point 18: ProcessedUpdate Write Failure

**Symptom:** Database error when marking update as processed

**Current Protection:**
```typescript
try {
  await this.processedUpdateRepository.save(...);
} catch (error) {
  // Duplicate key is expected and safe
  this.logger.debug(`Update already marked as processed`);
}
```

**Severity:** LOW — Duplicate key is safe

**Recovery Strategy:** Next webhook retry will see duplicate, skip.

**Risk:** If write fails (not duplicate), update not marked → duplicate processing.

**Mitigation:** Database unique constraint prevents duplicates.

---

### Failure Point 19: ProcessedUpdate Retention Gap

**Symptom:** Update arrives after retention period (7 days)

**Current Protection:** None — ProcessedUpdate deleted

**Severity:** MEDIUM — No idempotency after 7 days

**Recovery Strategy:** Duplicate processing is semantically valid for most updates.

**Risk:** Old update processed twice.

**Mitigation:** Telegram typically retries within minutes, not days. 7-day window is sufficient.

---

## SECTION 8 — CALLBACK SECURITY FAILURE SURFACE

### Failure Point 20: Stale Callback Abuse

**Symptom:** Attacker replays old callback query

**Current Protection:**
```typescript
// In LeadFunnelService.handleCallback()
if (state.currentStep !== 'answering_questions') {
  return;  // Stale callback ignored
}

if (currentQuestion.id !== questionId) {
  return;  // Question mismatch
}
```

**Severity:** MEDIUM — Callback validation is state-dependent

**Recovery Strategy:** State must be valid for callback to succeed.

**Risk:** If user is in correct state, callback may succeed.

**Mitigation:** Callbacks include questionId validation. State must match.

---

### Failure Point 21: Callback Query ID Reuse

**Symptom:** Attacker replays callback_query_id

**Current Protection:** None — Telegram callback_query_id not tracked

**Severity:** LOW — Callback requires valid user state

**Recovery Strategy:** State validation prevents abuse.

**Risk:** Minimal — callback_query_id is Telegram-specific, not platform.

---

## SECTION 9 — OPERATIONAL API FAILURE SURFACE

### Failure Point 22: Duplicate Lifecycle Action

**Symptom:** Owner clicks "confirm" button twice in Mini App

**Current Protection:**
```typescript
// In BookingRuntimeService.confirmBooking()
if (booking.status !== 'pending') {
  throw new Error(`Cannot confirm booking with status: ${booking.status}`);
}
```

**Severity:** LOW — Status validation prevents duplicate

**Recovery Strategy:** Error returned. UI should disable button after click.

**Risk:** None — status check is authoritative.

---

### Failure Point 23: Cross-Tenant Access

**Symptom:** Owner A tries to access Owner B's bot

**Current Protection:**
```typescript
// All controllers verify ownership
const bot = await this.botRepository.findOne({
  where: { id: botId, ownerId: currentOwnerId }
});
```

**Severity:** HIGH — Authorization bypass

**Recovery Strategy:** Proper ownership validation in every endpoint.

**Risk:** Data leak between owners.

**Mitigation:** Ownership check is mandatory in all operational endpoints.

---

## SECTION 10 — RESTART SAFETY FAILURE SURFACE

### Failure Point 24: Incomplete Webhook Processing

**Symptom:** Server restarts during webhook processing

**Current Protection:** None — no distributed transactions

**Severity:** MEDIUM — Partial writes possible

**Recovery Strategy:**
- ProcessedUpdate not written → webhook retry
- Business data written → idempotent (unique constraints)
- Analytics not written → lost

**Risk:** Business data may be inconsistent if transaction not committed.

**Mitigation:** All critical writes are transactional.

---

### Failure Point 25: Stale UserState After Restart

**Symptom:** Server restart, UserState not cleared

**Current Protection:** None — UserState persists

**Severity:** LOW — UserState is advisory

**Recovery Strategy:** User sends /restart to clear state.

**Risk:** User may be stuck in stale state.

**Mitigation:** /restart command always available.

---

## FAILURE SEVERITY SUMMARY

| Failure Point | Severity | Frequency | Recovery |
|---------------|----------|-----------|----------|
| Duplicate webhook | LOW | Common | Idempotency |
| Webhook timeout | MEDIUM | Occasional | Retry + idempotency |
| Auth failure | LOW | Rare | Fix config |
| Template dispatch | MEDIUM | Rare | Retry |
| Double booking | MEDIUM | Rare | Unique constraint |
| Double confirmation | MEDIUM | Rare | Status validation |
| Booking transaction | LOW | Rare | Rollback |
| Stale UserState | LOW | Occasional | /restart |
| Duplicate ticket | LOW | Common | Append message |
| Duplicate resolve | LOW | Rare | Status validation |
| Reopen race | MEDIUM | Rare | Valid behavior |
| Duplicate lead | MEDIUM | Rare | Add unique constraint |
| Stale callback | LOW | Occasional | State validation |
| UserState race | LOW | Rare | Unique constraint |
| UserState overwrite | MEDIUM | Rare | Advisory only |
| Analytics failure | LOW | Occasional | Eventual |
| Analytics duplicate | LOW | Rare | Deduplicate |
| ProcessedUpdate write | LOW | Rare | Retry |
| Retention gap | MEDIUM | Rare | Accept duplicate |
| Stale callback abuse | MEDIUM | Rare | State validation |
| Callback replay | LOW | Rare | State validation |
| Duplicate lifecycle | LOW | Rare | Status validation |
| Cross-tenant access | HIGH | Rare | Authorization |
| Incomplete webhook | MEDIUM | Rare | Retry |
| Stale UserState | LOW | Occasional | /restart |

---

## CRITICAL FINDINGS

### 1. No Idempotency on Callback Queries

**Issue:** Callback queries (inline button clicks) are not idempotent.

**Impact:** Double-clicks may cause errors or state corruption.

**Recommendation:** Track processed callback_query_id for 5-minute window.

---

### 2. No Unique Constraint on Lead

**Issue:** Lead entity has no unique constraint on (botId, userId).

**Impact:** Duplicate leads possible if user submits contact twice.

**Recommendation:** Add @Unique(['botId', 'userId']) to Lead entity.

---

### 3. ProcessedUpdate Retention Too Short

**Issue:** 7-day retention may miss duplicate webhooks in edge cases.

**Impact:** Very old duplicate webhooks processed twice.

**Recommendation:** Increase to 30 days or make configurable per bot.

---

### 4. Analytics Not Transactional

**Issue:** Analytics emitted after transaction. If analytics fails, event lost.

**Impact:** Data inconsistency between business data and analytics.

**Recommendation:** Accept eventual consistency. Analytics is non-critical.

---

## RECOMMENDED IMMEDIATE FIXES

### Fix 1: Add Unique Constraint to Lead

```typescript
@Entity('leads')
@Unique(['botId', 'userId'])  // ADD THIS
class Lead { ... }
```

### Fix 2: Add Callback Query Idempotency

Track callback_query_id in ProcessedUpdate or separate table for 5-minute window.

### Fix 3: Increase ProcessedUpdate Retention

Change default from 7 days to 30 days via environment variable.

---

**Version 1.0 — 2026-05-23**
