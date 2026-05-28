# Runtime Reliability Philosophy

**Purpose:** Define canonical reliability philosophy for BotGrandFather  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — RELIABILITY PRINCIPLES

### Principle 1: Explicit Containment Over Orchestration

**What this means:**
- Handle errors where they occur
- Do not build error orchestration systems
- Do not build retry frameworks
- Do not build circuit breakers

**What this does NOT mean:**
- Do not handle errors
- Do not validate inputs
- Do not check preconditions

**Example:**
```typescript
// ✅ CORRECT: Explicit containment
async confirmBooking() {
  const booking = await this.getBooking(id);
  if (booking.status !== 'pending') {
    throw new Error('Cannot confirm');  // Contained locally
  }
  // ... confirm ...
}

// ❌ FORBIDDEN: Orchestration
class ErrorOrchestrator {
  async handleError(error) {
    await this.circuitBreaker.trip();
    await this.retryQueue.enqueue(error);
    await this.alertManager.notify(error);
  }
}
```

---

### Principle 2: Transactional Where Critical

**What this means:**
- Business data writes are transactional
- Related entity updates are atomic
- Rollback on failure

**What this does NOT mean:**
- Everything is transactional
- Analytics is transactional
- Notifications are transactional
- External API calls are transactional

**Example:**
```typescript
// ✅ CORRECT: Transactional for critical data
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.startTransaction();
try {
  await queryRunner.manager.save(booking);
  await queryRunner.manager.update(Customer, ...);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
}

// After transaction: non-critical operations
await this.analyticsService.trackEvent(...);  // Eventual
await this.telegramService.sendMessage(...);  // Best-effort
```

---

### Principle 3: Eventually Consistent Where Acceptable

**What this means:**
- Analytics is eventual
- Notifications are eventual
- Dashboard data is eventual
- ProcessedUpdate is eventual

**What this does NOT mean:**
- Business data is eventual
- Bookings are eventual
- Tickets are eventual
- Leads are eventual

**Example:**
```typescript
// ✅ CORRECT: Business data is strong
await queryRunner.manager.save(booking);  // Transactional

// ✅ CORRECT: Analytics is eventual
await this.analyticsService.trackEvent(...);  // Eventual
```

---

### Principle 4: Isolation Over Automation

**What this means:**
- Capabilities are isolated
- Runtime services do not import each other
- Operational views are read-only
- No cross-capability orchestration

**What this does NOT mean:**
- Capabilities cannot coexist
- Operational views cannot aggregate
- Customers cannot be shared

**Example:**
```typescript
// ✅ CORRECT: Isolation
class BookingRuntimeService {
  // Only booking logic
}

class SupportRuntimeService {
  // Only support logic
}

// ❌ FORBIDDEN: Automation
class BookingRuntimeService {
  async confirmBooking() {
    await this.supportService.createTicket(...);  // Cross-capability
  }
}
```

---

### Principle 5: Recovery Over Complexity

**What this means:**
- Database is source of truth
- Restart is safe
- UserState is rebuildable
- Manual recovery is acceptable

**What this does NOT mean:**
- No error handling
- No validation
- No transactions

**Example:**
```typescript
// ✅ CORRECT: Simple recovery
// After restart: database state is consistent
// User sends /restart to rebuild state
// Telegram retries failed webhooks

// ❌ FORBIDDEN: Complex recovery
class RecoveryOrchestrator {
  async recover() {
    await this.replayEvents();
    await this.rebuildState();
    await this.reconcileData();
  }
}
```

---

### Principle 6: Observability Over Magic

**What this means:**
- Log everything important
- Errors are visible
- State transitions are visible
- Performance is visible

**What this does NOT mean:**
- Distributed tracing
- Complex metrics
- Real-time dashboards
- Alerting platforms

**Example:**
```typescript
// ✅ CORRECT: Simple observability
this.logger.info(`Booking created: bot=${botId} user=${userId}`);
this.logger.error(`Webhook failed: bot=${botId} error=${error.message}`);

// ❌ FORBIDDEN: Magic observability
const span = tracer.startSpan('webhook.process');
span.setTag('botId', botId);
metrics.histogram('webhook.duration', duration);
```

---

### Principle 7: Explicit State Transitions

**What this means:**
- Each transition is explicit method
- Status validation before transition
- Illegal transitions throw errors
- No generic transition method

**What this does NOT mean:**
- No transitions
- Silent failures
- Generic state machine

**Example:**
```typescript
// ✅ CORRECT: Explicit transitions
async confirmBooking() {
  if (booking.status !== 'pending') throw new Error('Cannot confirm');
  booking.status = 'confirmed';
  await this.save(booking);
}

// ❌ FORBIDDEN: Generic transitions
async transition(entity, toStatus) {
  entity.status = toStatus;
  await this.save(entity);
}
```

---

### Principle 8: Simple Operational Recovery

**What this means:**
- Recovery procedures are simple
- Database is source of truth
- Manual steps are documented
- No automated recovery systems

**What this does NOT mean:**
- No recovery procedures
- No documentation
- No monitoring

**Example:**
```typescript
// ✅ CORRECT: Simple recovery
// 1. Check database state
// 2. If inconsistent, fix manually
// 3. Restart application
// 4. Verify webhooks resume

// ❌ FORBIDDEN: Complex recovery
class AutoRecoveryService {
  async autoRecover() {
    await this.detectInconsistencies();
    await this.repairData();
    await selfHeal();
  }
}
```

---

## SECTION 2 — FORBIDDEN DIRECTIONS

### Forbidden 1: Orchestration Engines

```typescript
// ❌ FORBIDDEN
class OrchestrationEngine {
  async orchestrate(operation) {
    await this.circuitBreaker.check();
    await this.retryPolicy.execute(operation);
    await this.fallbackPolicy.execute(operation);
  }
}
```

**Why forbidden:** Orchestration engines add complexity without value.

---

### Forbidden 2: Workflow Recovery Frameworks

```typescript
// ❌ FORBIDDEN
class WorkflowRecoveryFramework {
  async recoverWorkflow(workflowId) {
    const state = await this.getWorkflowState(workflowId);
    await this.replaySteps(state);
    await this.reconcileState(state);
  }
}
```

**Why forbidden:** Workflows are not the platform model.

---

### Forbidden 3: Distributed Coordination

```typescript
// ❌ FORBIDDEN
class DistributedCoordinator {
  async acquireLock(resource) {
    await redis.set(`lock:${resource}`, '1', 'EX', 30);
  }
}
```

**Why forbidden:** Distributed coordination requires distributed infrastructure.

---

### Forbidden 4: Generic Retry Systems

```typescript
// ❌ FORBIDDEN
class GenericRetrySystem {
  async retry(operation, maxAttempts = 3) {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxAttempts - 1) throw error;
        await this.delay(1000 * Math.pow(2, i));
      }
    }
  }
}
```

**Why forbidden:** Generic retry masks root causes. Explicit handling is better.

---

### Forbidden 5: Queue-First Thinking

```typescript
// ❌ FORBIDDEN
class QueueFirstArchitecture {
  async processUpdate(update) {
    await this.queue.enqueue('webhook', update);
    // Worker processes asynchronously
  }
}
```

**Why forbidden:** Queues add infrastructure complexity. Direct processing is simpler.

---

### Forbidden 6: Event-Driven Business Execution

```typescript
// ❌ FORBIDDEN
class EventDrivenExecution {
  async onEvent(event) {
    if (event.type === 'booking.confirmed') {
      await this.createTicket(event);
      await this.sendSurvey(event);
      await this.updateCRM(event);
    }
  }
}
```

**Why forbidden:** Events are observational, not orchestrational.

---

## SECTION 3 — RELIABILITY HIERARCHY

### Level 1: Database Reliability (FOUNDATION)

**What:** ACID transactions, unique constraints, indexes
**Status:** ✅ ACHIEVED
**Why:** Database is source of truth

### Level 2: Idempotency (WEBHOOK)

**What:** ProcessedUpdate prevents duplicate processing
**Status:** ✅ ACHIEVED
**Why:** Telegram retries are expected

### Level 3: Status Validation (LIFECYCLE)

**What:** All transitions validate status
**Status:** ✅ ACHIEVED
**Why:** Prevents invalid state changes

### Level 4: Transactional Writes (BUSINESS)

**What:** Critical writes are transactional
**Status:** ✅ ACHIEVED
**Why:** Prevents partial writes

### Level 5: Observability (VISIBILITY)

**What:** Structured logging, error classification
**Status:** ⚠️ PARTIAL
**Why:** Need standardization

### Level 6: Recovery (RESILIENCE)

**What:** Restart safety, manual recovery
**Status:** ⚠️ PARTIAL
**Why:** Need documented procedures

### Level 7: Automation (FUTURE)

**What:** Automated recovery, self-healing
**Status:** ❌ NEVER
**Why:** Complexity exceeds value

---

## SECTION 4 — CHECKLIST

### Before Production

- [x] Webhook processing is idempotent
- [x] Critical writes are transactional
- [x] Lifecycle transitions validate status
- [x] Cross-tenant access is prevented
- [x] Race conditions are contained
- [x] Database is source of truth
- [x] Errors are logged
- [x] State transitions are logged
- [ ] Log format standardized
- [ ] Rate limiting added
- [ ] Health check endpoint added
- [ ] Recovery procedures documented

---

**Version 1.0 — 2026-05-23**
