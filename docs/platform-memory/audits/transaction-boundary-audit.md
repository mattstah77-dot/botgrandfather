# Transaction Boundary Audit

**Purpose:** Audit all write operations and define transaction boundaries  
**Status:** COMPLETE  
**Version:** 1.0  
**Date:** 2026-05-23

---

## AUDIT METHODOLOGY

For each write operation:
1. Identify all database writes
2. Determine if writes are related
3. Classify as transactional or eventually consistent
4. Assess failure impact

---

## WRITE OPERATION INVENTORY

### Platform-Level Writes

| Operation | Entities Written | Transactional? | Consistency |
|-----------|-----------------|----------------|-------------|
| Connect bot | Bot | ✅ Yes | Strong |
| Mark update processed | ProcessedUpdate | ❌ No | Eventual |
| Track analytics | AnalyticsEvent | ❌ No | Eventual |
| Create UserState | UserState | ⚠️ Best-effort | Eventual |
| Update UserState | UserState | ❌ No | Eventual |
| Ensure customer | Customer | ❌ No | Eventual |
| Update customer status | Customer | ❌ No | Eventual |

### Lead Funnel Writes

| Operation | Entities Written | Transactional? | Consistency |
|-----------|-----------------|----------------|-------------|
| Create lead | Lead, Customer | ✅ Yes | Strong |
| Track session start | AnalyticsEvent | ❌ No | Eventual |
| Track conversion | AnalyticsEvent | ❌ No | Eventual |
| Update UserState | UserState | ❌ No | Eventual |

### Booking Writes

| Operation | Entities Written | Transactional? | Consistency |
|-----------|-----------------|----------------|-------------|
| Create booking | Booking, Customer | ✅ Yes | Strong |
| Confirm booking | Booking | ✅ Yes | Strong |
| Cancel booking | Booking | ✅ Yes | Strong |
| Complete booking | Booking | ✅ Yes | Strong |
| Mark no-show | Booking | ✅ Yes | Strong |
| Track events | AnalyticsEvent | ❌ No | Eventual |
| Update UserState | UserState | ❌ No | Eventual |

### Support Desk Writes

| Operation | Entities Written | Transactional? | Consistency |
|-----------|-----------------|----------------|-------------|
| Create ticket | Ticket, TicketMessage | ✅ Yes | Strong |
| Append message | TicketMessage, Ticket | ⚠️ Partial | Eventual |
| Take ticket | Ticket, TicketMessage | ✅ Yes | Strong |
| Assign ticket | Ticket, TicketMessage | ✅ Yes | Strong |
| Reply to ticket | TicketMessage, Ticket | ⚠️ Partial | Eventual |
| Resolve ticket | Ticket, TicketMessage | ✅ Yes | Strong |
| Close ticket | Ticket, TicketMessage | ✅ Yes | Strong |
| Reopen ticket | Ticket, TicketMessage | ✅ Yes | Strong |
| Track events | AnalyticsEvent | ❌ No | Eventual |

---

## TRANSACTION BOUNDARY MAP

### Transaction Boundary 1: Bot Connection

```typescript
// BotService.connectBot()
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  bot = await queryRunner.manager.save(bot);  // Bot entity
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
}

// After transaction: set webhook on Telegram
await this.telegramService.setWebhook(dto.token, webhookUrl);
```

**Classification:** ✅ Transactional (Bot entity)
**After transaction:** Telegram webhook setup (external, non-transactional)
**Failure mode:** If webhook fails after transaction → bot in DB but webhook not set. Manual fix.

---

### Transaction Boundary 2: Lead Creation

```typescript
// LeadFunnelService.handleContact()
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  await queryRunner.manager.save(lead);        // Lead entity
  await queryRunner.manager.update(Customer);   // Customer status
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}

// After transaction: analytics, notifications
await this.analyticsService.trackEvent(...);
await this.telegramService.sendMessage(...);
await this.notifyOwner(...);
```

**Classification:** ✅ Transactional (Lead + Customer)
**After transaction:** Analytics, Telegram, notifications (eventual)
**Failure mode:** If transaction succeeds but analytics fails → lead exists, no event. Acceptable.

---

### Transaction Boundary 3: Booking Creation

```typescript
// BookingRuntimeService.handleConfirmBooking()
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  await queryRunner.manager.save(booking);      // Booking entity
  await queryRunner.manager.update(Customer);    // Customer status
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  // Handle unique constraint violation
} finally {
  await queryRunner.release();
}

// After transaction: analytics, Telegram, notifications
await this.analyticsService.trackEvent(...);
await this.telegramService.sendMessage(...);
await this.notifyOwner(...);
```

**Classification:** ✅ Transactional (Booking + Customer)
**After transaction:** Analytics, Telegram, notifications (eventual)
**Failure mode:** If transaction succeeds but notification fails → booking exists, owner not notified. Acceptable.

---

### Transaction Boundary 4: Booking Lifecycle Actions

```typescript
// BookingRuntimeService.confirmBooking()
booking.status = 'confirmed';
await this.bookingRepository.save(booking);  // Single entity

// Analytics after
await this.analyticsService.trackEvent(...);
```

**Classification:** ✅ Transactional (single entity update)
**After transaction:** Analytics (eventual)
**Failure mode:** If save succeeds but analytics fails → booking confirmed, no event. Acceptable.

---

### Transaction Boundary 5: Ticket Lifecycle Actions

```typescript
// SupportRuntimeService.resolveTicket()
ticket.status = 'resolved';
ticket.resolvedAt = new Date();
await this.ticketRepository.save(ticket);  // Ticket entity

// System message
await this.ticketMessageRepository.save(systemMsg);  // Separate entity

// Analytics after
await this.analyticsService.trackEvent(...);
```

**Classification:** ⚠️ Partial — Ticket save + message save NOT in same transaction
**Risk:** Ticket saved but message not → inconsistent state.
**Recommendation:** Wrap ticket + message in transaction.

---

### Transaction Boundary 6: Ticket Creation

```typescript
// SupportRuntimeService.createTicket()
const ticket = await this.ticketRepository.save(ticket);

// Initial message
const initialMessage = this.ticketMessageRepository.create({ ... });
await this.ticketMessageRepository.save(initialMessage);

// Analytics after
await this.analyticsService.trackEvent(...);
```

**Classification:** ⚠️ Partial — Ticket + message NOT in same transaction
**Risk:** Ticket created but message not → ticket with no initial message.
**Recommendation:** Wrap ticket + message in transaction.

---

## CONSISTENCY CLASSIFICATION

### Strong Consistency (Transactional)

Operations that MUST be atomic:

1. **Bot creation** — Bot entity must exist before webhook set
2. **Lead creation** — Lead + Customer status update must be atomic
3. **Booking creation** — Booking + Customer status update must be atomic
4. **Booking lifecycle** — Status change must be atomic
5. **Ticket lifecycle** — Status change + system message should be atomic

### Eventual Consistency (Non-Transactional)

Operations that are acceptable to be eventual:

1. **Analytics tracking** — Eventual, non-critical
2. **Telegram notifications** — External service, non-transactional
3. **Owner notifications** — External service, non-transactional
4. **UserState updates** — Advisory state, non-critical
5. **ProcessedUpdate marking** — Idempotency marker, non-critical

### Best-Effort Consistency

Operations that are best-effort:

1. **UserState creation** — Race condition handled, but not transactional
2. **Ticket message append** — Message append is independent

---

## FAILURE IMPACT ASSESSMENT

### Critical Failures (Transaction Rollback Required)

| Failure | Impact | Recovery |
|---------|--------|----------|
| Bot creation fails | Bot not connected | Retry by owner |
| Lead creation fails | No lead, customer not converted | User retries |
| Booking creation fails | No booking, slot not reserved | User retries |
| Booking status update fails | Inconsistent booking state | Manual fix |

### Acceptable Failures (No Rollback)

| Failure | Impact | Recovery |
|---------|--------|----------|
| Analytics event lost | Missing analytics | None (acceptable) |
| Telegram notification fails | User not notified | User checks app |
| Owner notification fails | Owner not notified | Owner checks dashboard |
| UserState update fails | Stale state | /restart command |
| ProcessedUpdate write fails | Duplicate processing | Idempotency handles |

---

## GAPS AND RECOMMENDATIONS

### Gap 1: Ticket Lifecycle Not Fully Transactional

**Issue:** Ticket status change and system message are separate saves.

**Impact:** Inconsistent state if one fails.

**Recommendation:** Wrap in transaction.

```typescript
// SupportRuntimeService.resolveTicket()
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  await queryRunner.manager.save(ticket);
  await queryRunner.manager.save(systemMsg);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

### Gap 2: Ticket Creation Not Transactional

**Issue:** Ticket and initial message are separate saves.

**Impact:** Ticket without initial message.

**Recommendation:** Wrap in transaction.

### Gap 3: Analytics Not Transactional

**Issue:** Analytics emitted after transaction.

**Impact:** Event lost if analytics fails.

**Recommendation:** Accept eventual consistency. Analytics is non-critical.

---

## TRANSACTION BOUNDARY RULES

### Rule 1: Business Data Is Transactional

All business entity writes (Booking, Ticket, Lead, Customer) must be transactional.

### Rule 2: Analytics Is Eventual

Analytics events are emitted after transaction. Eventual consistency is acceptable.

### Rule 3: External Services Are Non-Transactional

Telegram API calls, owner notifications are external and non-transactional.

### Rule 4: UserState Is Advisory

UserState updates are best-effort. Not business-critical.

### Rule 5: ProcessedUpdate Is Idempotent

ProcessedUpdate writes are idempotent by unique constraint. Not transactional.

---

**Version 1.0 — 2026-05-23**
