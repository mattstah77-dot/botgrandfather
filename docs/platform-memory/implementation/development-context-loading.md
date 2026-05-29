# Development Context Loading

**Purpose:** Define how documentation is loaded during implementation  
**Status:** CANONICAL — Tier 1 Implementation Governance  
**Version:** 1.0  
**Unit:** Booking Implementation Transition  
**Date:** 2026-05-23

---

## CORE PRINCIPLE

> **Documentation exists to constrain implementation. NOT to endlessly generate more documentation.**

During implementation:
- Load only what is needed.
- Load only what is authoritative.
- Load only what is relevant.

---

## CONTEXT LOADING BY TASK

### Task: Building Booking Runtime

#### MANDATORY (Max 5)

| Priority | Document | Why Mandatory |
|----------|----------|---------------|
| 1 | `contracts/temporal-truth-contracts.md` | Temporal authority hierarchy |
| 2 | `contracts/occupancy-contracts.md` | Slot occupancy semantics |
| 3 | `contracts/write-time-validation-contracts.md` | Validation timing |
| 4 | `contracts/runtime-isolation-reinforcement.md` | Runtime boundaries |
| 5 | `anti-patterns/runtime-duplication-anti-patterns.md` | Duplication prevention |

#### OPTIONAL (Max 2)

| Document | When Useful |
|----------|-------------|
| `audits/booking-concurrency-audit.md` | Handling race conditions |
| `contracts/stale-projection-semantics.md` | Projection staleness handling |

#### IRRELEVANT

| Document | Why Irrelevant |
|----------|----------------|
| `contracts/support-desk-semantics.md` | Different capability |
| `contracts/lead-funnel-contracts.md` | Different capability |
| `audits/aggregation-pressure-validation.md` | Not booking-specific |
| `historical/decision-log.md` | Historical only |

---

### Task: Building Booking Query Service

#### MANDATORY (Max 5)

| Priority | Document | Why Mandatory |
|----------|----------|---------------|
| 1 | `contracts/projection-authority-boundaries.md` | Projection hierarchy |
| 2 | `contracts/projection-ownership-semantics.md` | Projection ownership |
| 3 | `contracts/stale-projection-semantics.md` | Staleness handling |
| 4 | `contracts/computation-contracts.md` | Computation semantics |
| 5 | `anti-patterns/projection-anti-patterns.md` | Projection safety |

#### OPTIONAL (Max 2)

| Document | When Useful |
|----------|-------------|
| `audits/aggregation-pressure-validation.md` | Aggregation safety |
| `contracts/operational-freshness-contract.md` | Freshness expectations |

---

### Task: Building Customer MiniApp

#### MANDATORY (Max 5)

| Priority | Document | Why Mandatory |
|----------|----------|---------------|
| 1 | `contracts/surface-taxonomy-contracts.md` | Surface definitions |
| 2 | `contracts/runtime-modality-contracts.md` | Hybrid runtime |
| 3 | `contracts/chat-miniapp-boundaries.md` | Surface boundaries |
| 4 | `philosophy/customer-friction-philosophy.md` | UX laws |
| 5 | `contracts/actor-semantics-contract.md` | Actor boundaries |

#### OPTIONAL (Max 2)

| Document | When Useful |
|----------|-------------|
| `philosophy/runtime-access-philosophy.md` | Access layer semantics |
| `audits/surface-interaction-audit.md` | Surface safety validation |

---

### Task: Building Owner Dashboard

#### MANDATORY (Max 5)

| Priority | Document | Why Mandatory |
|----------|----------|---------------|
| 1 | `contracts/dashboard-consumption-contract.md` | Dashboard semantics |
| 2 | `contracts/projection-composition-rules.md` | Composition rules |
| 3 | `contracts/projection-isolation-rules.md` | Isolation rules |
| 4 | `contracts/actor-consumption-boundaries.md` | Actor boundaries |
| 5 | `philosophy/unified-operational-surface.md` | Unified surface |

#### OPTIONAL (Max 2)

| Document | When Useful |
|----------|-------------|
| `contracts/operational-read-model-taxonomy.md` | Read model types |
| `audits/operational-gravity-revalidation.md` | Drift containment |

---

## ANTI-OVERLOAD ROUTING

### Max Documents Per Task

```
MANDATORY: 5 documents maximum
OPTIONAL: 2 documents maximum
TOTAL: 7 documents maximum
```

### If More Than 7 Docs Seem Relevant

The task is too broad. Split it.

```
❌ WRONG: "Build booking system"
    → 15+ documents relevant
    → Task too broad

✅ CORRECT: "Build booking creation endpoint"
    → 5 documents relevant
    → Task appropriately scoped
```

---

## DOCUMENTATION USAGE RULES

### Rule 1: Load Before Implement

Never write code without loading relevant contracts.

### Rule 2: Mandatory First

Load all mandatory documents before optional.

### Rule 3: Skip Irrelevant

Do not load documents for other capabilities.

### Rule 4: Historical Last

Historical docs are context, not constraints. Load last if at all.

### Rule 5: No Documentation Generation During Implementation

Implementation time is not documentation time.

```
❌ FORBIDDEN: During implementation, creating new philosophy docs
✅ CORRECT: During implementation, reading existing contract docs
```

---

## CONTEXT LOADING CHECKLIST

Before starting implementation:

- [ ] Task is scoped to < 7 relevant docs?
- [ ] Mandatory docs loaded?
- [ ] Constraints extracted from each doc?
- [ ] Anti-patterns noted?
- [ ] Irrelevant docs identified and skipped?
- [ ] No new docs being created?

---

## CANONICAL RULES

### Rule 1: Documentation Constrains Implementation

Docs are active constraints, not passive knowledge.

### Rule 2: Load Only What Is Needed

7 docs max. More = task too broad.

### Rule 3: Mandatory Before Optional

Core constraints before advisory guidance.

### Rule 4: No Doc Generation During Coding

Implementation time ≠ documentation time.

### Rule 5: Skip Irrelevant

Other capability docs are irrelevant.

### Rule 6: Historical Is Context

Decision logs are for understanding, not constraining.

---

**Version 1.0 — Booking Implementation Transition — 2026-05-23**
