# Runtime Observability Philosophy

**Purpose:** Define minimal operational visibility standards  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — OBSERVABILITY PHILOSOPHY

### What We Need

Operational visibility for:
- Webhook processing failures
- Runtime errors
- Lifecycle transitions
- Data integrity issues
- Performance anomalies

### What We Don't Need

- Distributed tracing
- Real-time monitoring dashboards
- Log aggregation infrastructure
- Complex alerting rules
- Performance metrics platforms

### Principle: Logs Are Enough

Structured console logs + log files provide 95% of operational visibility.
The remaining 5% requires investigation, not instrumentation.

---

## SECTION 2 — LOGGING CONVENTIONS

### Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `error` | Runtime error, operation failed | `Error processing webhook: timeout` |
| `warn` | Expected but noteworthy | `Owner notification skipped: no ownerChatId` |
| `info` | Important events | `Booking created: bot=123 user=456` |
| `debug` | Detailed debugging | `Received callback: id=abc data=booking:service:xyz` |

### Log Structure

```typescript
// Standard format
this.logger.log(`Booking created: bot=${botId} user=${userId} date=${date} time=${time}`);

// Error format
this.logger.error(`Booking creation failed: bot=${botId} error=${error.message}`);

// Warning format
this.logger.warn(`Owner notification skipped: no ownerChatId configured for bot=${botId}`);
```

### Mandatory Fields

Every log MUST include:
- Context (what operation)
- Identifiers (botId, userId, bookingId, etc.)
- Outcome (success, failure, skip)

### Forbidden Logging

```typescript
// ❌ NEVER log sensitive data
this.logger.log(`Token: ${token}`);  // Token
this.logger.log(`Password: ${password}`);  // Password
this.logger.log(`Webhook secret: ${secret}`);  // Secret

// ❌ NEVER log raw objects
this.logger.log(`Update: ${JSON.stringify(update)}`);  // Too verbose
```

---

## SECTION 3 — ERROR CLASSIFICATION

### Error Type 1: Validation Errors

**Source:** Invalid input, missing required fields

**Example:**
```typescript
if (!bookingId) {
  throw new BadRequestException('Booking ID required');
}
```

**Log Level:** `warn`
**Action:** Fix input

---

### Error Type 2: Authorization Errors

**Source:** Invalid credentials, cross-tenant access

**Example:**
```typescript
if (!bot) {
  this.logger.warn(`Invalid webhook credentials: botId=${botId}`);
  throw new BadRequestException('Invalid credentials');
}
```

**Log Level:** `warn`
**Action:** Fix configuration

---

### Error Type 3: Business Logic Errors

**Source:** Invalid state transitions, constraint violations

**Example:**
```typescript
if (booking.status !== 'pending') {
  throw new Error(`Cannot confirm booking with status: ${booking.status}`);
}
```

**Log Level:** `info` (expected)
**Action:** Handle gracefully

---

### Error Type 4: Infrastructure Errors

**Source:** Database failures, network timeouts

**Example:**
```typescript
catch (error) {
  this.logger.error(`Database error: ${error.message}`);
  throw error;
}
```

**Log Level:** `error`
**Action:** Retry, alert, investigate

---

### Error Type 5: Unexpected Errors

**Source:** Code bugs, unhandled exceptions

**Example:**
```typescript
catch (error) {
  this.logger.error(`Unexpected error: ${error.message}`);
  throw error;
}
```

**Log Level:** `error`
**Action:** Investigate, fix

---

## SECTION 4 — OPERATIONAL DIAGNOSTICS

### Webhook Diagnostics

**Key Metrics (from logs):**
- Webhook success rate
- Webhook failure rate
- Duplicate skip rate
- Average processing time

**Log Pattern:**
```typescript
this.logger.debug(`Webhook start: botId=${botId} updateId=${updateId}`);
// ... processing ...
this.logger.debug(`Webhook complete: botId=${botId} updateId=${updateId} duration=${duration}ms`);
```

**Warning Signal:** High failure rate (>5%)

---

### Runtime Diagnostics

**Key Metrics:**
- Template handler success rate
- State transition failures
- Callback validation failures

**Log Pattern:**
```typescript
this.logger.debug(`Processing update: bot=${botId} template=${template} user=${userId}`);
// ... handling ...
this.logger.info(`Update processed: bot=${botId} template=${template} user=${userId}`);
```

**Warning Signal:** Repeated validation failures

---

### Lifecycle Diagnostics

**Key Metrics:**
- Booking confirmation rate
- Ticket resolution time
- Lead conversion rate

**Log Pattern:**
```typescript
this.logger.info(`Booking confirmed: bot=${botId} bookingId=${bookingId} userId=${userId}`);
this.logger.info(`Ticket resolved: bot=${botId} ticketId=${ticketId} resolvedBy=${ownerId}`);
```

**Warning Signal:** Low conversion rate

---

### Data Integrity Diagnostics

**Key Metrics:**
- Unique constraint violations
- Missing entity errors
- Transaction rollbacks

**Log Pattern:**
```typescript
this.logger.warn(`Slot race condition: bot=${botId} date=${date} time=${time}`);
this.logger.error(`Transaction rollback: bot=${botId} reason=${reason}`);
```

**Warning Signal:** Frequent constraint violations

---

## SECTION 5 — ERROR SEVERITY TAXONOMY

### Severity 1: Critical (Immediate Action)

**Symptoms:**
- Webhook processing completely down
- Database connection lost
- All bookings failing

**Response:** Immediate investigation, rollback if needed

**Log:** `this.logger.error('CRITICAL: Webhook processing down')`

---

### Severity 2: High (24-Hour Resolution)

**Symptoms:**
- 10%+ webhook failure rate
- Sporadic booking failures
- Analytics not tracking

**Response:** Investigate within 24 hours

**Log:** `this.logger.error('High webhook failure rate detected')`

---

### Severity 3: Medium (One-Week Resolution)

**Symptoms:**
- 1-10% webhook failure rate
- Occasional state validation errors
- Stale callbacks

**Response:** Investigate, fix in next release

**Log:** `this.logger.warn('Webhook failure rate elevated: 5%')`

---

### Severity 4: Low (Monitor)

**Symptoms:**
- <1% webhook failure rate
- Rare validation errors
- Expected business logic rejections

**Response:** Monitor, optimize if pattern worsens

**Log:** `this.logger.info('Stale callback ignored: user=123')`

---

## SECTION 6 — FORBIDDEN OBSERVABILITY

### ❌ Distributed Tracing Infrastructure

```typescript
// FORBIDDEN
import opentelemetry from 'opentelemetry';
const tracer = opentelemetry.tracer;
const span = tracer.startSpan('webhook.process');
```

**Why forbidden:** Over-engineering. Console logs sufficient.

### ❌ Log Aggregation Platform

```typescript
// FORBIDDEN
import elk from 'elk-sdk';
await elk.index({ log: 'Webhook processed' });
```

**Why forbidden:** Infrastructure complexity. File logs sufficient.

### ❌ Real-Time Monitoring Dashboard

```typescript
// FORBIDDEN
import prometheus from 'prom-client';
const gauge = new prometheus.Gauge({ name: 'webhook_duration' });
```

**Why forbidden:** Monitoring overkill. Logs + occasional queries sufficient.

### ❌ Complex Alerting Rules

```typescript
// FORBIDDEN
if (errorRate > 0.05 && duration > 1000 && uniqueViolations > 10) {
  await alerting.sendAlert('Webhook degradation');
}
```

**Why forbidden:** Alert fatigue. Simple rules only.

---

## SECTION 7 — SIMPLE OPERATIONAL RULES

### Rule 1: Log Every State Transition

```typescript
this.logger.info(`Ticket resolved: bot=${botId} ticketId=${ticketId}`);
```

### Rule 2: Log Every Error

```typescript
this.logger.error(`Booking creation failed: bot=${botId} error=${error.message}`);
```

### Rule 3: Log Every Warning

```typescript
this.logger.warn(`Owner notification skipped: no ownerChatId`);
```

### Rule 4: Include Identifiers

```typescript
this.logger.info(`Booking created: bot=${botId} user=${userId} bookingId=${bookingId}`);
```

### Rule 5: No Sensitive Data

```typescript
// ✅ OK
this.logger.info(`Webhook processed: botId=${botId}`);

// ❌ FORBIDDEN
this.logger.info(`Webhook secret: ${webhookSecret}`);
```

### Rule 6: Structured Messages

```typescript
// ✅ OK
this.logger.info(`Operation: booking.created bot=${botId} user=${userId}`);

// ❌ FORBIDDEN
this.logger.info('Booking created successfully for user 123');  // Unstructured
```

---

**Version 1.0 — 2026-05-23**
