# Runtime Implementation Methodology

**Purpose:** Define correct implementation flow for BotGrandFather runtime features  
**Status:** CANONICAL — Tier 1 Implementation Governance  
**Version:** 1.0  
**Unit:** Booking Implementation Transition  
**Date:** 2026-05-23

---

## IMPLEMENTATION FLOW

```
Load Context → Identify Contracts → Implement Minimally → Validate Against Invariants → Validate Against Anti-Patterns → Drift Review → STOP
```

---

## STEP 1: LOAD CONTEXT

### What to Load

| Task Type | Mandatory Documents | Optional Documents |
|-----------|--------------------|--------------------|
| **Booking runtime** | temporal-truth-contracts, occupancy-contracts, write-time-validation-contracts, runtime-isolation-reinforcement | booking-concurrency-audit, booking-temporal-audit |
| **Booking query** | projection-authority-boundaries, projection-ownership-semantics, stale-projection-semantics | aggregation-pressure-validation |
| **Booking dashboard** | dashboard-consumption-contract, projection-composition-rules, projection-isolation-rules | operational-gravity-revalidation |
| **Customer surface** | surface-taxonomy-contracts, runtime-modality-contracts, chat-miniapp-boundaries, customer-friction-philosophy | surface-interaction-audit |
| **Owner surface** | unified-operational-surface, operational-visibility-boundaries, actor-consumption-boundaries | — |

### What NOT to Load

- Unrelated capability docs
- Historical decision logs
- Governance reports
- Scalability analyses (unless relevant)

### Max Docs Per Task

**Maximum 5 mandatory + 2 optional = 7 documents.**

If more than 7 docs seem relevant, the task is too broad. Split it.

---

## STEP 2: IDENTIFY CONTRACTS

### Extract Constraints

From each mandatory document, extract:

1. **MUST** statements → Hard constraints
2. **MUST NEVER** statements → Forbidden patterns
3. **IS / IS NOT** statements → Boundary definitions

### Example: Booking Creation

From `write-time-validation-contracts.md`:
- MUST re-read truth at write time
- MUST check DB unique constraint
- MUST NOT trust read-time projections

From `temporal-truth-contracts.md`:
- MUST validate date is not in past
- MUST validate date is not excluded
- MUST validate time is within working hours

From `occupancy-contracts.md`:
- MUST check slot is not occupied
- MUST use DB constraint as final authority

---

## STEP 3: IMPLEMENT MINIMALLY

### Definition

**Minimal sufficient implementation** = simplest code that:
- Preserves all relevant contracts
- Passes all invariants
- Avoids all anti-patterns
- Has no speculative abstraction

### What Minimal Means

```typescript
// ✅ MINIMAL: Direct implementation
@Injectable()
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // 1. Validate (write-time)
    await this.validateBooking(data);
    
    // 2. Create
    const booking = this.bookingRepository.create(data);
    await this.bookingRepository.save(booking);
    
    return booking;
  }
}

// ❌ NOT MINIMAL: Speculative abstraction
@Injectable()
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    return this.workflowEngine.execute('booking.create', data);
  }
}
// FORBIDDEN: Workflow engine is speculative abstraction
```

### Minimal Checklist

- [ ] No generalized infrastructure
- [ ] No reusable systems without proven need
- [ ] No future-proofing without pressure
- [ ] No framework extraction
- [ ] No abstraction before repetition
- [ ] Implementation scoped to current capability only

---

## STEP 4: VALIDATE AGAINST INVARIANTS

### Check Each Invariant

| Invariant | Check |
|-----------|-------|
| Runtime/Operational separation | No operational imports in runtime |
| Capability neutrality | No booking-centric platform semantics |
| Template isolation | No cross-template imports |
| Metadata discipline | No metadata-driven business logic |
| Event semantics | Canonical event names (dot notation, past tense) |
| Multi-tenant integrity | Owner scope on all queries |

### Validation Code Review

```typescript
// Before commit, verify:

// ❌ CHECK: No operational imports
import { DashboardService } from '../miniapp/services/dashboard.service';
// → FAIL if found in runtime

// ❌ CHECK: No cross-template imports
import { LeadFunnelService } from '../lead-funnel/lead-funnel.service';
// → FAIL if found

// ✅ CHECK: Owner scope
.where('booking.botId IN (:...botIds)', { botIds })
// → PASS

// ✅ CHECK: Canonical events
await this.analytics.trackEvent(botId, 'booking.created');
// → PASS
```

---

## STEP 5: VALIDATE AGAINST ANTI-PATTERNS

### Check Each Anti-Pattern

| Anti-Pattern | Check |
|--------------|-------|
| Operational orchestration | No cross-capability coordination |
| Projection escalation | No projection used for decisions |
| Projection orchestration | No side effects in projections |
| Executable dashboards | No mutations in dashboard endpoints |
| Workflow dashboards | No multi-step workflow endpoints |
| Runtime duplication | No duplicated flows across surfaces |
| Chat-side runtime | No runtime recreation in chat |
| Universal workflow engine | No generic workflow abstraction |

### Anti-Pattern Code Review

```typescript
// ❌ CHECK: No orchestration
async createBooking(data) {
  await this.bookingRuntimeService.create(data);
  await this.supportRuntimeService.createTicket(data);  // → FAIL
}

// ❌ CHECK: No projection authority
async canBook(botId, slot) {
  const projection = await this.slotProjection.get(botId, slot);
  return projection.available;  // → FAIL
}

// ✅ CHECK: No duplication
// Runtime exists in MiniApp only
// Chat provides entry only
// → PASS
```

---

## STEP 6: DRIFT REVIEW

### Review Code For Drift Signals

| Signal | Risk | Action |
|--------|------|--------|
| "generic scheduler" | VERY HIGH | STOP, review architecture |
| "shared workflow" | VERY HIGH | STOP, review architecture |
| "universal lifecycle" | VERY HIGH | STOP, review architecture |
| "cross-capability state" | VERY HIGH | STOP, review architecture |
| "smart routing" | HIGH | STOP, review semantics |
| "global orchestration" | VERY HIGH | STOP, review architecture |
| "duplicated semantics" | MEDIUM | Refactor, remove duplication |
| "frontend state ownership" | MEDIUM | Move state to backend |
| "excessive metadata" | MEDIUM | Reduce metadata usage |

### Drift Review Checklist

- [ ] No "engine" in class names (unless proven need)
- [ ] No "universal" in class names
- [ ] No "generic" in type parameters
- [ ] No cross-capability imports
- [ ] No framework-like abstractions
- [ ] No speculative future-proofing

---

## STEP 7: STOP

### When to Stop

Implementation is complete when:
- All contracts preserved
- All invariants pass
- No anti-patterns present
- No drift signals detected
- Code is minimal
- Tests pass

### What NOT to Do After Stop

- [ ] Do NOT add "just one more feature"
- [ ] Do NOT refactor for "cleaner code"
- [ ] Do NOT add "nice to have" optimizations
- [ ] Do NOT extract reusable patterns (yet)
- [ ] Do NOT generalize for future capabilities

---

## FORBIDDEN DURING IMPLEMENTATION

### ❌ SPECULATIVE ABSTRACTION

```typescript
// FORBIDDEN: Abstract before repetition
interface UniversalScheduler<T> {
  schedule(item: T): Promise<ScheduleResult>;
}

// FORBIDDEN: Generic before specific
class GenericBookingService<T extends BookingConfig> {
  async create(data: T): Promise<Booking>;
}
```

### ❌ FUTURE-PROOFING WITHOUT PRESSURE

```typescript
// FORBIDDEN: Preparing for 10 templates
class PluginRuntime {
  loadTemplate(packageName: string): Promise<Template>;
}

// FORBIDDEN: Preparing for distributed system
class DistributedLockService {
  acquireLock(resource: string): Promise<Lock>;
}
```

### ❌ FRAMEWORK EXTRACTION

```typescript
// FORBIDDEN: Extracting framework from 2 templates
class BaseTemplateService {
  abstract execute(params: any): Promise<any>;
}

// FORBIDDEN: Universal builder
class UniversalBuilder {
  createForm(): FormBuilder;
  createWorkflow(): WorkflowBuilder;
}
```

### ❌ REUSABLE ENGINES BEFORE REPETITION

```typescript
// FORBIDDEN: Reusable before 3+ instances
class UniversalQueryEngine {
  query<T>(type: string, filters: any): Promise<T[]>;
}

// FORBIDDEN: Generic before proven
class GenericValidator<T> {
  validate(data: T): Promise<ValidationResult>;
}
```

### ❌ IMPLEMENTATION BEYOND SCOPE

```typescript
// FORBIDDEN: Building recurrence before basic booking works
class RecurrenceEngine {
  generateRRULE(config: RecurrenceConfig): string;
}

// FORBIDDEN: Building optimization before performance pressure
class SlotOptimizer {
  optimizeSlots(slots: Slot[]): Slot[];
}
```

---

## CANONICAL RULES

### Rule 1: Load Context First

Never implement without loading relevant contracts.

### Rule 2: Extract Constraints

Convert contract statements into implementation checklist.

### Rule 3: Implement Minimally

Simplest code preserving contracts. No more.

### Rule 4: Validate Before Commit

Invariant + anti-pattern validation is mandatory.

### Rule 5: Drift Review Is Mandatory

Every implementation must pass drift review.

### Rule 6: Stop When Done

No feature creep. No premature optimization.

### Rule 7: No Speculative Abstraction

Abstract only after proven repetition (3+ instances).

### Rule 8: No Future-Proofing

Solve current problems. Not hypothetical future problems.

---

**Version 1.0 — Booking Implementation Transition — 2026-05-23**
