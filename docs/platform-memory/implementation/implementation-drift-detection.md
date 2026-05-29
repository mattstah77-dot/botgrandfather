# Implementation Drift Detection

**Purpose:** Define runtime drift signals during coding  
**Status:** CANONICAL — Tier 1 Implementation Governance  
**Version:** 1.0  
**Unit:** Booking Implementation Transition  
**Date:** 2026-05-23

---

## DRIFT SIGNAL TAXONOMY

### HIGH RISK — STOP IMMEDIATELY

When these signals appear, implementation MUST stop.
Architecture review is required.
Semantic stabilization may need to resume.

| Signal | Example | Why Dangerous |
|--------|---------|---------------|
| **"generic scheduler"** | `class GenericScheduler<T>` | Becomes scheduling framework |
| **"shared workflow"** | `class SharedWorkflowEngine` | Cross-capability coupling |
| **"universal lifecycle"** | `class UniversalLifecycleManager` | Orchestration engine |
| **"cross-capability state"** | `class CrossCapabilityState` | Breaks isolation |
| **"smart routing"** | `class SmartRoutingService` | Decision engine |
| **"global orchestration"** | `class GlobalOrchestrator` | BPM drift |
| **"shared temporal coordinator"** | `class TemporalCoordinator` | Centralizes time |
| **"capability synchronization"** | `class CapabilitySyncService` | Sync infrastructure |
| **"generic runtime abstraction"** | `interface UniversalRuntime<T>` | Framework extraction |

### HIGH RISK — ACTION

```
SIGNAL DETECTED
    │
    ├── STOP implementation
    ├── Review architecture
    ├── Check against invariants
    ├── Check against anti-patterns
    ├── Decide: continue / rewrite / redesign
    └── Document decision
```

---

### MEDIUM RISK — REVIEW REQUIRED

When these signals appear, implementation must pause for review.
May continue after review if justified.

| Signal | Example | Why Concerning |
|--------|---------|----------------|
| **duplicated semantics** | Same logic in 2+ places | Maintenance burden |
| **hidden authority** | Projection used for validation | Authority corruption |
| **frontend state ownership** | UI owns business state | Backend authority lost |
| **excessive metadata** | Business logic in JSON | Metadata-driven drift |
| **reusable infrastructure without repetition** | Generic class for 1 use | Premature abstraction |
| **"manager" class** | `class BookingManager` | Vague responsibility |
| **"coordinator" class** | `class BookingCoordinator` | Orchestration hint |
| **"orchestrator" in comments** | `// orchestrates booking flow` | Semantic drift |

### MEDIUM RISK — ACTION

```
SIGNAL DETECTED
    │
    ├── PAUSE implementation
    ├── Review specific code
    ├── Check: is this justified?
    ├── If justified: document why
    ├── If not justified: refactor
    └── Resume
```

---

### LOW RISK — MONITOR

When these signals appear, note for monitoring.
No immediate action required.

| Signal | Example | Why Monitor |
|--------|---------|-------------|
| **growing class size** | >300 lines | May need splitting |
| **deep nesting** | >3 levels | May need refactoring |
| **many parameters** | >5 params | May need DTO |
| **comment explaining code** | `// this is complex because...` | Code may be too complex |

---

## WHEN TO STOP

### Stop Conditions

| Condition | Action |
|-----------|--------|
| HIGH RISK signal detected | STOP. Architecture review mandatory. |
| 2+ MEDIUM RISK signals in same PR | STOP. Review required. |
| Invariant violation detected | STOP. Rewrite required. |
| Anti-pattern detected | STOP. Refactor required. |
| Contract violation detected | STOP. Correction required. |

### Stop Protocol

```
1. STOP writing code
2. Document the signal
3. Load relevant contracts
4. Determine: drift or justified?
5. If drift: rewrite
6. If justified: document exception
7. Resume only after resolution
```

---

## WHEN ARCHITECTURE REVIEW IS REQUIRED

### Review Triggers

| Trigger | Review Type |
|---------|-------------|
| "Engine" in class name | Architecture review |
| "Universal" in class name | Architecture review |
| "Generic" type parameter | Architecture review |
| Cross-capability import | Architecture + semantic review |
| Framework-like abstraction | Architecture review |
| Event listener triggering mutations | Semantic review |
| Projection used for validation | Semantic review |
| Dashboard endpoint with mutation | Architecture review |

### Review Process

```
Trigger detected
    │
    ├── Load relevant invariants
    ├── Load relevant contracts
    ├── Load relevant anti-patterns
    ├── Analyze: does this violate?
    ├── Decision:
    │   ├── YES → Rewrite
    │   ├── NO → Document justification
    │   └── UNCLEAR → Escalate
    └── Resume after decision
```

---

## WHEN SEMANTIC STABILIZATION MUST RESUME

### Resume Conditions

| Condition | Why |
|-----------|-----|
| Fundamental contract unclear | Implementation cannot proceed without clarity |
| New semantic domain discovered | Existing contracts insufficient |
| Conflicting contracts | Hierarchy cannot resolve |
| Anti-pattern emerges from new requirement | Existing anti-patterns insufficient |

### Resume Protocol

```
1. STOP all implementation
2. Identify missing semantics
3. Create new contract / philosophy / anti-pattern
4. Validate against existing contracts
5. Update CANONICAL_INDEX
6. Resume implementation
```

---

## DRIFT DETECTION CHECKLIST

### Daily Implementation Review

- [ ] No "engine" in new class names?
- [ ] No "universal" in new class names?
- [ ] No "generic" in new type parameters?
- [ ] No cross-capability imports?
- [ ] No framework-like abstractions?
- [ ] No projection used for validation?
- [ ] No dashboard mutations?
- [ ] No event-driven mutations?
- [ ] No "manager" / "coordinator" classes?

### Per-PR Review

- [ ] All HIGH RISK signals checked?
- [ ] All MEDIUM RISK signals reviewed?
- [ ] All invariants pass?
- [ ] All anti-patterns avoided?
- [ ] Contracts preserved?

---

## CANONICAL RULES

### Rule 1: HIGH RISK = STOP

High risk signals require immediate stop.

### Rule 2: MEDIUM RISK = PAUSE

Medium risk signals require review before continuing.

### Rule 3: Invariant Violation = STOP

Any invariant violation stops implementation.

### Rule 4: Document All Stops

Every stop must be documented with signal, decision, resolution.

### Rule 5: Semantic Stabilization Is Always Available

When contracts are insufficient, stop and stabilize.

### Rule 6: Better to Stop Than to Drift

Stopping is cheaper than fixing drift later.

---

**Version 1.0 — Booking Implementation Transition — 2026-05-23**
