# Canonical Hierarchy Map

**Purpose:** Define semantic hierarchy of all documentation  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23

---

## HIERARCHY OVERVIEW

```
TIER 1 — CANONICAL LAWS (14 docs)
    │
    ├── Platform Identity
    ├── Temporal Authority
    ├── Operational Boundaries
    ├── Runtime Isolation
    └── Architectural Invariants
    │
    └── VIOLATION = ARCHITECTURAL FAILURE

TIER 2 — SEMANTIC CONTRACTS (37 docs)
    │
    ├── Temporal Contracts
    ├── Operational Contracts
    ├── Booking Contracts
    ├── Dashboard Contracts
    ├── Capability Contracts
    └── Architecture Definitions
    │
    └── CONTRADICTION = SEMANTIC FRAGMENTATION

TIER 3 — ANTI-PATTERNS & DRIFT PREVENTION (14 docs)
    │
    ├── Forbidden Directions
    ├── Drift Patterns
    ├── Optimization Anti-Patterns
    ├── Operational Anti-Patterns
    └── Detection Checklists
    │
    └── IGNORE = DRIFT RISK

TIER 4 — AUDITS (13 docs)
    │
    ├── Capability Audits
    ├── Temporal Audits
    ├── Operational Audits
    ├── Security Audits
    └── Current State
    │
    └── AUTHORITATIVE = NO (observational only)

TIER 5 — HISTORICAL REPORTS (17 docs)
    │
    ├── Execution Reports
    ├── Research Documents
    ├── Implementation Reports
    └── Decision Logs
    │
    └── NEVER CONSULT FOR SEMANTIC TRUTH
```

---

## TIER 1 — CANONICAL LAWS (14 files)

### Definition

**Non-negotiable platform truths.** Violation means architectural failure.

### Documents

| # | File | Domain | Why Tier 1 |
|---|------|--------|-----------|
| 1 | `philosophy/platform-identity.md` | platform | Core identity |
| 2 | `philosophy/operational-platform-identity.md` | platform | Product identity |
| 3 | `philosophy/temporal-semantics-philosophy.md` | temporal | Temporal authority hierarchy |
| 4 | `philosophy/temporal-vs-operational-semantics.md` | temporal | Layer separation |
| 5 | `philosophy/operational-surface-philosophy.md` | operational | Surface boundaries |
| 6 | `philosophy/operational-memory-philosophy.md` | operational | Memory boundaries |
| 7 | `contracts/temporal-truth-contracts.md` | temporal | Source of truth |
| 8 | `contracts/slot-reality-contract.md` | temporal | Slot semantics |
| 9 | `contracts/occupancy-semantics-boundary.md` | temporal | Occupancy boundaries |
| 10 | `contracts/projection-authority-boundaries.md` | operational | Projection authority |
| 11 | `contracts/runtime-isolation-reinforcement.md` | platform | Runtime isolation |
| 12 | `invariants/template-isolation.md` | platform | Template isolation |
| 13 | `invariants/capability-neutrality.md` | platform | Capability neutrality |
| 14 | `invariants/multi-tenant-integrity.md` | platform | Multi-tenant integrity |

### Authority Level

- **Source of truth:** YES
- **Can be overridden:** NEVER
- **Can be refined:** YES (clarification only)
- **Can be contradicted:** NEVER

---

## TIER 2 — SEMANTIC CONTRACTS (37 files)

### Definition

**Concrete semantic definitions.** Contradiction means semantic fragmentation.

### Documents

| # | File | Domain | Why Tier 2 |
|---|------|--------|-----------|
| 1 | `contracts/occupancy-contracts.md` | booking | Occupancy transitions |
| 2 | `contracts/computation-contracts.md` | booking | Computation model |
| 3 | `contracts/actor-semantics-contract.md` | operational | Actor boundaries |
| 4 | `contracts/operational-visibility-boundaries.md` | operational | Visibility boundaries |
| 5 | `contracts/projection-ownership-semantics.md` | operational | Projection ownership |
| 6 | `contracts/projection-lifecycle-semantics.md` | operational | Projection lifecycle |
| 7 | `contracts/booking-temporal-contracts.md` | booking | Booking temporal |
| 8 | `contracts/booking-temporal-semantics.md` | booking | Booking semantics |
| 9 | `contracts/capability-contracts.md` | platform | Capability contracts |
| 10 | `contracts/dashboard-aggregation-contracts.md` | dashboard | Dashboard aggregation |
| 11 | `contracts/query-service-contracts.md` | platform | Query service |
| 12 | `contracts/event-contracts.md` | platform | Event contracts |
| 13 | `contracts/idempotency-contracts.md` | platform | Idempotency |
| 14 | `contracts/settings-contracts.md` | platform | Settings |
| 15 | `architecture/template-system.md` | platform | Template architecture |
| 16 | `architecture/runtime-layer.md` | platform | Runtime architecture |
| 17 | `architecture/operational-layer.md` | platform | Operational architecture |
| 18 | `architecture/dashboard-system.md` | dashboard | Dashboard architecture |
| 19 | `architecture/customer-layer.md` | customer | Customer architecture |
| 20 | `architecture/event-system.md` | platform | Event architecture |
| 21 | `invariants/event-semantics.md` | platform | Event semantics |
| 22 | `invariants/metadata-discipline.md` | platform | Metadata discipline |
| 23 | `invariants/sequencing-laws.md` | platform | Sequencing laws |
| 24 | `invariants/runtime-operational-separation.md` | platform | Runtime separation |
| 25 | `philosophy/operational-ui-philosophy.md` | operational | UI boundaries |
| 26 | `philosophy/ecosystem-boundaries.md` | platform | Ecosystem boundaries |
| 27 | `philosophy/runtime-reliability-philosophy.md` | platform | Runtime reliability |
| 28 | `philosophy/runtime-observability-philosophy.md` | platform | Runtime observability |
| 29 | `glossary/canonical-terminology.md` | platform | Terminology |
| 30 | `operational/multi-capability-visibility.md` | operational | Multi-capability |
| 31 | `customer/customer-operational-philosophy.md` | customer | Customer operational |
| 32 | `CANONICAL_INDEX.md` | platform | Canonical index |
| 33 | `SESSION_ENTRYPOINT.md` | platform | Session entrypoint |
| 34 | `ARCHITECTURE_AUTHORITY.md` | platform | Architecture authority |
| 35 | `README.md` | platform | Platform memory README |

### Authority Level

- **Source of truth:** YES (within domain)
- **Can be overridden:** BY TIER 1 ONLY
- **Can be refined:** YES
- **Can be contradicted:** WITHIN DOMAIN = FRAGMENTATION

---

## TIER 3 — ANTI-PATTERNS & DRIFT PREVENTION (14 files)

### Definition

**Forbidden directions and drift analysis.** Ignore = drift risk.

### Documents

| # | File | Domain | Why Tier 3 |
|---|------|--------|-----------|
| 1 | `anti-patterns/forbidden-directions.md` | platform | General forbidden |
| 2 | `anti-patterns/scheduling-engine-drift.md` | temporal | Scheduling drift |
| 3 | `anti-patterns/temporal-automation-drift.md` | temporal | Temporal automation |
| 4 | `anti-patterns/forbidden-optimization-patterns.md` | booking | Optimization anti-patterns |
| 5 | `anti-patterns/forbidden-operational-patterns.md` | operational | Operational anti-patterns |
| 6 | `anti-patterns/ecosystem-drift.md` | platform | Ecosystem drift |
| 7 | `anti-patterns/drift-detection.md` | platform | Drift detection |
| 8 | `anti-patterns/metadata-creep.md` | platform | Metadata creep |
| 9 | `anti-patterns/premature-abstraction.md` | platform | Premature abstraction |
| 10 | `checklists/temporal-drift-detection-checklist.md` | temporal | Drift checklist |
| 11 | `philosophy/anti-overengineering.md` | platform | Overengineering |
| 12 | `philosophy/documentation-boundaries.md` | platform | Documentation scope |

### Authority Level

- **Source of truth:** NO (preventive)
- **Can be overridden:** NEVER (warnings)
- **Can be refined:** YES
- **Can be contradicted:** NEVER (anti-patterns are always bad)

---

## TIER 4 — AUDITS (13 files)

### Definition

**Observational analysis.** Useful for review and risk identification. NOT authoritative.

### Documents

| # | File | Domain | Why Tier 4 |
|---|------|--------|-----------|
| 1 | `audits/capability-isolation-audit.md` | platform | Capability isolation |
| 2 | `audits/concurrency-race-analysis.md` | platform | Concurrency |
| 3 | `audits/lifecycle-integrity-audit.md` | platform | Lifecycle integrity |
| 4 | `audits/transaction-boundary-audit.md` | platform | Transaction boundaries |
| 5 | `audits/runtime-failure-matrix.md` | platform | Failure matrix |
| 6 | `audits/booking-temporal-audit.md` | temporal | Booking temporal |
| 7 | `audits/hidden-crm-drift-analysis.md` | operational | CRM drift |
| 8 | `audits/operational-gravity-analysis.md` | operational | Operational gravity |
| 9 | `audits/cross-capability-boundary-audit.md` | operational | Cross-capability |
| 10 | `audits/semantic-over-abstraction-audit.md` | platform | Over-abstraction |
| 11 | `audits/operational-security-audit.md` | platform | Security |
| 12 | `audits/production-readiness-classification.md` | platform | Production readiness |
| 13 | `CURRENT_PLATFORM_STATE.md` | platform | Current state |
| 14 | `CURRENT_DEVELOPMENT_PHASE.md` | platform | Development phase |

### Authority Level

- **Source of truth:** NO
- **Can be overridden:** YES (by Tiers 1-2)
- **Can be refined:** YES
- **Can be contradicted:** YES (observational)

---

## TIER 5 — HISTORICAL REPORTS (17 files)

### Definition

**Historical trace only.** NEVER consult for semantic truth.

### Documents

| # | File | Domain | Why Tier 5 |
|---|------|--------|-----------|
| 1 | `booking-research/unit-01-temporal-truth/UNIT-01-EXECUTION-REPORT.md` | temporal | UNIT 01 report |
| 2 | `booking-research/unit-02-occupancy/PRE-UNIT-02-EXECUTION-REPORT.md` | temporal | PRE-UNIT-02 |
| 3 | `booking-research/unit-02-occupancy/UNIT-02-EXECUTION-REPORT.md` | temporal | UNIT 02 |
| 4 | `booking-research/unit-03-computation/UNIT-03-EXECUTION-REPORT.md` | booking | UNIT 03 |
| 5 | `booking-research/unit-03-computation/INTERMEDIATE-STABILIZATION-EXECUTION-REPORT.md` | operational | Intermediate |
| 6 | `booking-research/pre-unit-04-stabilization/PRE-UNIT-04-EXECUTION-REPORT.md` | operational | PRE-UNIT-04 |
| 7 | `booking-research/unit-02-occupancy/PRE-UNIT-02-RESEARCH.md` | temporal | PRE-UNIT-02 research |
| 8 | `BOOKING_ENGINE_FOUNDATION_REPORT.md` | booking | Foundation |
| 9 | `SUPPORT_DESK_IMPLEMENTATION_REPORT.md` | support | Support desk |
| 10 | `SUPPORT_DESK_DRIFT_AUDIT.md` | support | Support drift |
| 11 | `THIRD_CAPABILITY_VALIDATION_REPORT.md` | platform | Third capability |
| 12 | `FRONTEND_STABILIZATION_REPORT.md` | platform | Frontend |
| 13 | `RECONSTRUCTION_COMPLETION_REPORT.md` | platform | Reconstruction |
| 14 | `CONTRACT_STABILIZATION_REPORT.md` | platform | Contract stabilization |
| 15 | `historical/decision-log.md` | platform | Decision log |
| 16 | `audits/recovery-restart-audit.md` | platform | Recovery audit |
| 17 | `contracts/projection-semantics-preparation.md` | operational | Prep (superseded) |

### Authority Level

- **Source of truth:** NO (NEVER)
- **Can be overridden:** ALWAYS (by all tiers)
- **Can be refined:** NO (historical)
- **Can be contradicted:** ALWAYS (by current truth)

---

## TIER AUTHORITY MATRIX

| Action | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|--------|--------|--------|--------|--------|--------|
| **Override lower tiers** | ✅ | ✅ (except T1) | ❌ | ❌ | ❌ |
| **Be overridden** | ❌ | By T1 only | ❌ | By T1-T3 | By all |
| **Refined** | ✅ (clarify) | ✅ | ✅ | ✅ | ❌ |
| **Contradicted** | ❌ | Within domain = fragmentation | ❌ | ✅ (observational) | ✅ (always) |
| **Agent consult** | ✅ Mandatory | ✅ Mandatory | ✅ Mandatory | ⚠️ Optional | ❌ Never |
| **Semantic authority** | ✅ YES | ✅ YES (domain) | ❌ NO | ❌ NO | ❌ NO |

---

## TIER VIOLATION CONSEQUENCES

| Violation | Consequence |
|-----------|-------------|
| **Tier 1 violated** | Architectural failure. Immediate STOP. |
| **Tier 2 contradicted** | Semantic fragmentation. Review required. |
| **Tier 3 ignored** | Drift risk. Monitor closely. |
| **Tier 4 treated as authority** | False authority. Demote immediately. |
| **Tier 5 treated as authority** | Historical fallacy. Never allow. |

---

**Version 1.0 — 2026-05-23**
