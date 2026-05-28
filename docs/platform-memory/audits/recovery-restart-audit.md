# Recovery & Restart Safety Audit

**Purpose:** Audit restart behavior and define recovery guidelines  
**Status:** COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## RESTART SCENARIOS

### Scenario 1: Graceful Restart (SIGTERM)

**What happens:**
1. NestJS receives SIGTERM
2. Active requests complete
3. New requests rejected
4. Process exits

**Impact:**
- In-flight webhooks: Complete if within timeout
- In-flight transactions: Complete or rollback
- ProcessedUpdate writes: Complete if within timeout
- Analytics events: May be lost

**Safety:** ✅ SAFE — Graceful shutdown preserves consistency

---

### Scenario 2: Hard Crash (OOM, SIGKILL)

**What happens:**
1. Process terminates immediately
2. Active requests aborted mid-flight
3. In-flight database writes may be incomplete

**Impact:**
- Transaction in progress → rolled back by database
- ProcessedUpdate not written → duplicate processing on retry
- Analytics not emitted → lost
- Telegram message not sent → not retried

**Safety:** ⚠️ PARTIAL — Database transactions are safe. External operations may be lost.

---

### Scenario 3: Database Connection Loss

**What happens:**
1. Database connection drops
2. Active queries fail
3. New queries fail

**Impact:**
- Transaction in progress → rolled back
- ProcessedUpdate write fails → duplicate processing on retry
- Analytics write fails → lost
- Business reads fail → errors

**Safety:** ⚠️ PARTIAL — Transactions safe. Service unavailable until reconnection.

---

### Scenario 4: Telegram API Failure

**What happens:**
1. Telegram API returns error
2. Message send fails
3. Callback answer fails

**Impact:**
- Customer message not sent → customer confused
- Owner notification not sent → owner not notified
- Callback answer not sent → Telegram may retry

**Safety:** ✅ SAFE — Business data is consistent. Notifications are best-effort.

---

## STATE SURVIVABILITY MATRIX

| State | Survives Restart? | Corruption Risk? | Recovery |
|-------|-------------------|------------------|----------|
| Bot entity | ✅ Yes | None | Automatic |
| Customer entity | ✅ Yes | None | Automatic |
| Booking entity | ✅ Yes | None | Automatic |
| Ticket entity | ✅ Yes | None | Automatic |
| Lead entity | ✅ Yes | None | Automatic |
| ProcessedUpdate | ✅ Yes | Duplicate processing | Retry + idempotency |
| UserState | ✅ Yes | Stale state | /restart command |
| AnalyticsEvent | ✅ Yes | Event loss | Acceptable |
| Owner entity | ✅ Yes | None | Automatic |
| Webhook configuration | ✅ Yes | None | Automatic |

---

## STALE STATE CLEANUP

### Stale UserState

**Problem:** UserState persists indefinitely. User may be stuck in stale state.

**Current:** No automatic cleanup.

**Recommendation:**
```typescript
// Manual: User sends /restart
await this.clearUserState(context);

// Automatic: Cleanup after 7 days (future)
// Not needed for MVP — manual restart sufficient
```

**Philosophy:** UserState is advisory. Stale state is not a bug.

---

### Stale Callbacks

**Problem:** Old callback queries remain in Telegram UI.

**Current:** Callbacks validated against current state.

**Recommendation:** No cleanup needed. Stale callbacks are ignored.

---

### Stale Bookings

**Problem:** Pending bookings may accumulate.

**Current:** No automatic expiration.

**Recommendation:**
```typescript
// Future: Auto-cancel pending bookings after 24 hours
// Not needed for MVP
```

**Philosophy:** Owner manages bookings via dashboard.

---

## CALLBACK EXPIRATION PHILOSOPHY

### Callback Query Expiration

**Telegram behavior:** Callback queries expire after some time (undocumented, ~1 hour).

**Platform behavior:** Callbacks validated against current state.

**Philosophy:** No explicit expiration needed. State validation handles stale callbacks.

### Inline Keyboard Expiration

**Problem:** Old inline keyboards remain in chat history.

**Impact:** User clicks old button → callback processed with state validation.

**Philosophy:** State validation is sufficient. No keyboard expiration needed.

---

## RUNTIME RECOVERY GUIDELINES

### Guideline 1: Database Is Source of Truth

After restart, database state is authoritative.

```typescript
// On restart: no special recovery needed
// Database state is consistent
```

### Guideline 2: UserState Is Rebuildable

If UserState is lost or stale, user can restart.

```typescript
// /restart command clears state
await this.clearUserState(context);
await this.handleStart(context);
```

### Guideline 3: ProcessedUpdate Prevents Duplicates

After restart, duplicate webhooks are prevented by ProcessedUpdate.

```typescript
const isProcessed = await this.isUpdateProcessed(botId, updateId);
if (isProcessed) return { skipped: true };
```

### Guideline 4: Analytics Is Eventual

Analytics events may be lost. Not critical.

```typescript
// Analytics after transaction
await this.analyticsService.trackEvent(...);
// If this fails, event is lost. Acceptable.
```

### Guideline 5: Telegram Notifications Are Best-Effort

Notifications may be lost. Not critical.

```typescript
// Notify owner
try {
  await this.telegramService.sendMessage(...);
} catch (error) {
  this.logger.warn(`Notification failed: ${error.message}`);
  // Acceptable — owner checks dashboard
}
```

---

## RECOVERY PROCEDURES

### Procedure 1: Webhook Processing Down

**Symptoms:** All webhooks failing

**Steps:**
1. Check database connectivity
2. Check Telegram API status
3. Check bot webhook configuration
4. Restart if needed

**Expected outcome:** Webhooks resume processing

---

### Procedure 2: Database Unavailable

**Symptoms:** All database operations failing

**Steps:**
1. Check database server status
2. Check connection pool
3. Restart application

**Expected outcome:** Database reconnection

---

### Procedure 3: Stuck UserState

**Symptoms:** User stuck in old state

**Steps:**
1. User sends /restart
2. State cleared
3. User starts fresh

**Expected outcome:** User can continue

---

### Procedure 4: Duplicate Webhooks

**Symptoms:** Same action processed twice

**Steps:**
1. Check ProcessedUpdate table
2. Verify unique constraint
3. Investigate why ProcessedUpdate not written

**Expected outcome:** Root cause identified

---

## FORBIDDEN RECOVERY

### ❌ Job Orchestration

```typescript
// FORBIDDEN
class RecoveryOrchestrator {
  async recoverAfterRestart() {
    await this.replayFailedEvents();
    await this.rebuildState();
    await this.notifyAdmins();
  }
}
```

**Why forbidden:** Over-engineering. Database is source of truth.

### ❌ Event Replay

```typescript
// FORBIDDEN
class EventReplayer {
  async replayEvents(from: Date) {
    const events = await this.getFailedEvents(from);
    for (const event of events) {
      await this.replay(event);
    }
  }
}
```

**Why forbidden:** Event replay is complex and error-prone.

### ❌ State Reconstruction

```typescript
// FORBIDDEN
class StateReconstructor {
  async reconstructState() {
    const bookings = await this.bookingRepository.find();
    for (const booking of bookings) {
      await this.rebuildUserState(booking);
    }
  }
}
```

**Why forbidden:** UserState is advisory. Reconstruction not needed.

---

**Version 1.0 — 2026-05-23**
