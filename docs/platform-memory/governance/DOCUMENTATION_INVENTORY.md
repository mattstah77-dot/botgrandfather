# Documentation Inventory

**Purpose:** Complete catalog of all platform-memory documentation  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23  
**Phase:** Documentation Governance Audit

---

## INVENTORY METHODOLOGY

Each document classified by:
- **Type:** philosophy | contract | audit | anti-pattern | report | checklist | architecture | invariant | glossary | index
- **Domain:** temporal | operational | booking | support | dashboard | customer | platform | execution | general
- **Tier:** 1 (Canonical Law) | 2 (Semantic Contract) | 3 (Anti-Pattern/Drift) | 4 (Audit) | 5 (Historical Report)
- **Status:** CANONICAL | ACTIVE | ADVISORY | HISTORICAL | DEPRECATED
- **Agent Consult:** YES (mandatory) | OPTIONAL | NO (historical only)
- **Drift Risk:** HIGH | MEDIUM | LOW
- **Duplication Risk:** HIGH | MEDIUM | LOW

---

## PHILOSOPHY DOCUMENTS (12 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `philosophy/platform-identity.md` | platform | 1 | CANONICAL | YES | LOW | LOW | Core platform identity |
| 2 | `philosophy/operational-platform-identity.md` | platform | 1 | CANONICAL | YES | LOW | MEDIUM | Product identity v2.0 |
| 3 | `philosophy/temporal-semantics-philosophy.md` | temporal | 1 | CANONICAL | YES | LOW | LOW | Temporal authority hierarchy |
| 4 | `philosophy/temporal-vs-operational-semantics.md` | temporal | 1 | CANONICAL | YES | LOW | LOW | Layer separation |
| 5 | `philosophy/operational-surface-philosophy.md` | operational | 1 | CANONICAL | YES | LOW | LOW | Operational surface boundaries |
| 6 | `philosophy/operational-memory-philosophy.md` | operational | 1 | CANONICAL | YES | LOW | LOW | Memory vs automation |
| 7 | `philosophy/operational-ui-philosophy.md` | operational | 2 | CANONICAL | YES | LOW | LOW | UI operational boundaries |
| 8 | `philosophy/ecosystem-boundaries.md` | platform | 2 | CANONICAL | YES | LOW | LOW | System boundaries |
| 9 | `philosophy/runtime-reliability-philosophy.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Runtime reliability |
| 10 | `philosophy/runtime-observability-philosophy.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Runtime observability |
| 11 | `philosophy/anti-overengineering.md` | platform | 3 | CANONICAL | YES | LOW | LOW | Overengineering prevention |
| 12 | `philosophy/documentation-boundaries.md` | platform | 3 | CANONICAL | YES | LOW | LOW | Documentation scope |

---

## CONTRACTS (20 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `contracts/temporal-truth-contracts.md` | temporal | 1 | CANONICAL | YES | LOW | LOW | Temporal source of truth |
| 2 | `contracts/slot-reality-contract.md` | temporal | 1 | CANONICAL | YES | LOW | LOW | Slot projection semantics |
| 3 | `contracts/occupancy-semantics-boundary.md` | temporal | 1 | CANONICAL | YES | LOW | LOW | Occupancy boundary |
| 4 | `contracts/occupancy-contracts.md` | booking | 2 | CANONICAL | YES | LOW | LOW | Occupancy transitions |
| 5 | `contracts/computation-contracts.md` | booking | 2 | CANONICAL | YES | LOW | LOW | Computation model |
| 6 | `contracts/actor-semantics-contract.md` | operational | 2 | CANONICAL | YES | LOW | LOW | Actor boundaries |
| 7 | `contracts/operational-visibility-boundaries.md` | operational | 2 | CANONICAL | YES | LOW | LOW | Visibility vs authority |
| 8 | `contracts/projection-authority-boundaries.md` | operational | 1 | CANONICAL | YES | LOW | LOW | Projection authority |
| 9 | `contracts/projection-ownership-semantics.md` | operational | 2 | CANONICAL | YES | LOW | LOW | Projection ownership |
| 10 | `contracts/projection-lifecycle-semantics.md` | operational | 2 | CANONICAL | YES | LOW | LOW | Projection lifecycle |
| 11 | `contracts/projection-semantics-preparation.md` | operational | 2 | ADVISORY | OPTIONAL | MEDIUM | HIGH | Preparation for UNIT 04 |
| 12 | `contracts/runtime-isolation-reinforcement.md` | platform | 1 | CANONICAL | YES | LOW | LOW | Runtime isolation |
| 13 | `contracts/booking-temporal-contracts.md` | booking | 2 | CANONICAL | YES | LOW | LOW | Booking temporal |
| 14 | `contracts/booking-temporal-semantics.md` | booking | 2 | CANONICAL | YES | LOW | MEDIUM | Booking temporal semantics |
| 15 | `contracts/capability-contracts.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Capability contracts |
| 16 | `contracts/dashboard-aggregation-contracts.md` | dashboard | 2 | CANONICAL | OPTIONAL | LOW | LOW | Dashboard aggregation |
| 17 | `contracts/query-service-contracts.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Query service |
| 18 | `contracts/event-contracts.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Event contracts |
| 19 | `contracts/idempotency-contracts.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Idempotency |
| 20 | `contracts/settings-contracts.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Settings |

---

## ANTI-PATTERNS (10 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `anti-patterns/forbidden-directions.md` | platform | 3 | CANONICAL | YES | LOW | LOW | General forbidden directions |
| 2 | `anti-patterns/scheduling-engine-drift.md` | temporal | 3 | CANONICAL | YES | LOW | LOW | Scheduling drift |
| 3 | `anti-patterns/temporal-automation-drift.md` | temporal | 3 | CANONICAL | YES | LOW | LOW | Temporal automation |
| 4 | `anti-patterns/forbidden-optimization-patterns.md` | booking | 3 | CANONICAL | YES | LOW | LOW | Optimization anti-patterns |
| 5 | `anti-patterns/forbidden-operational-patterns.md` | operational | 3 | CANONICAL | YES | LOW | MEDIUM | Operational anti-patterns |
| 6 | `anti-patterns/ecosystem-drift.md` | platform | 3 | CANONICAL | YES | LOW | LOW | Ecosystem drift |
| 7 | `anti-patterns/drift-detection.md` | platform | 3 | CANONICAL | YES | LOW | LOW | Drift detection |
| 8 | `anti-patterns/metadata-creep.md` | platform | 3 | CANONICAL | OPTIONAL | LOW | LOW | Metadata creep |
| 9 | `anti-patterns/premature-abstraction.md` | platform | 3 | CANONICAL | OPTIONAL | LOW | LOW | Premature abstraction |
| 10 | `anti-patterns/ecosystem-drift.md` | platform | 3 | CANONICAL | YES | LOW | LOW | Ecosystem drift |

---

## AUDITS (12 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `audits/capability-isolation-audit.md` | platform | 4 | ACTIVE | OPTIONAL | LOW | LOW | Capability isolation |
| 2 | `audits/concurrency-race-analysis.md` | platform | 4 | ACTIVE | OPTIONAL | LOW | LOW | Concurrency analysis |
| 3 | `audits/lifecycle-integrity-audit.md` | platform | 4 | ACTIVE | OPTIONAL | LOW | LOW | Lifecycle integrity |
| 4 | `audits/transaction-boundary-audit.md` | platform | 4 | ACTIVE | OPTIONAL | LOW | LOW | Transaction boundaries |
| 5 | `audits/runtime-failure-matrix.md` | platform | 4 | ACTIVE | OPTIONAL | LOW | LOW | Failure matrix |
| 6 | `audits/booking-temporal-audit.md` | temporal | 4 | ACTIVE | OPTIONAL | LOW | LOW | Booking temporal audit |
| 7 | `audits/hidden-crm-drift-analysis.md` | operational | 4 | ACTIVE | YES | LOW | LOW | CRM drift analysis |
| 8 | `audits/operational-gravity-analysis.md` | operational | 4 | ACTIVE | YES | LOW | LOW | Operational gravity |
| 9 | `audits/cross-capability-boundary-audit.md` | operational | 4 | ACTIVE | OPTIONAL | LOW | LOW | Cross-capability audit |
| 10 | `audits/semantic-over-abstraction-audit.md` | platform | 4 | ACTIVE | YES | LOW | LOW | Over-abstraction audit |
| 11 | `audits/operational-security-audit.md` | platform | 4 | ADVISORY | OPTIONAL | MEDIUM | LOW | Security audit |
| 12 | `audits/production-readiness-classification.md` | platform | 4 | ADVISORY | OPTIONAL | MEDIUM | LOW | Production readiness |
| 13 | `audits/recovery-restart-audit.md` | platform | 4 | HISTORICAL | NO | LOW | LOW | Recovery audit |

---

## EXECUTION REPORTS (6 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `booking-research/unit-01-temporal-truth/UNIT-01-EXECUTION-REPORT.md` | temporal | 5 | HISTORICAL | NO | LOW | LOW | UNIT 01 report |
| 2 | `booking-research/unit-02-occupancy/PRE-UNIT-02-EXECUTION-REPORT.md` | temporal | 5 | HISTORICAL | NO | LOW | LOW | PRE-UNIT-02 report |
| 3 | `booking-research/unit-02-occupancy/UNIT-02-EXECUTION-REPORT.md` | temporal | 5 | HISTORICAL | NO | LOW | LOW | UNIT 02 report |
| 4 | `booking-research/unit-03-computation/UNIT-03-EXECUTION-REPORT.md` | booking | 5 | HISTORICAL | NO | LOW | LOW | UNIT 03 report |
| 5 | `booking-research/unit-03-computation/INTERMEDIATE-STABILIZATION-EXECUTION-REPORT.md` | operational | 5 | HISTORICAL | NO | LOW | LOW | Intermediate report |
| 6 | `booking-research/pre-unit-04-stabilization/PRE-UNIT-04-EXECUTION-REPORT.md` | operational | 5 | HISTORICAL | NO | LOW | LOW | PRE-UNIT-04 report |

---

## RESEARCH DOCUMENTS (3 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `booking-research/unit-02-occupancy/PRE-UNIT-02-RESEARCH.md` | temporal | 5 | HISTORICAL | NO | LOW | LOW | PRE-UNIT-02 research |
| 2 | `booking-research/unit-02-occupancy/PRE-UNIT-02B-RESEARCH.md` | temporal | 5 | HISTORICAL | NO | LOW | LOW | PRE-UNIT-02B research |
| 3 | `booking-research/unit-02-occupancy/scenarios/` | temporal | 5 | HISTORICAL | NO | LOW | LOW | Scenario files |

---

## CHECKLISTS (1 file)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `checklists/temporal-drift-detection-checklist.md` | temporal | 3 | CANONICAL | YES | LOW | LOW | Drift detection checklist |

---

## ARCHITECTURE (6 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `architecture/template-system.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Template architecture |
| 2 | `architecture/runtime-layer.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Runtime architecture |
| 3 | `architecture/operational-layer.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Operational architecture |
| 4 | `architecture/dashboard-system.md` | dashboard | 2 | CANONICAL | OPTIONAL | LOW | LOW | Dashboard architecture |
| 5 | `architecture/customer-layer.md` | customer | 2 | CANONICAL | OPTIONAL | LOW | LOW | Customer architecture |
| 6 | `architecture/event-system.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Event architecture |

---

## INVARIANTS (6 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `invariants/template-isolation.md` | platform | 1 | CANONICAL | YES | LOW | LOW | Template isolation |
| 2 | `invariants/capability-neutrality.md` | platform | 1 | CANONICAL | YES | LOW | LOW | Capability neutrality |
| 3 | `invariants/multi-tenant-integrity.md` | platform | 1 | CANONICAL | YES | LOW | LOW | Multi-tenant integrity |
| 4 | `invariants/runtime-operational-separation.md` | platform | 1 | CANONICAL | YES | LOW | LOW | Runtime separation |
| 5 | `invariants/event-semantics.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Event semantics |
| 6 | `invariants/metadata-discipline.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Metadata discipline |
| 7 | `invariants/sequencing-laws.md` | platform | 2 | CANONICAL | OPTIONAL | LOW | LOW | Sequencing laws |

---

## GLOSSARY (1 file)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `glossary/canonical-terminology.md` | platform | 2 | CANONICAL | YES | LOW | LOW | Canonical terminology |

---

## INDEXES & PROTOCOLS (5 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `CANONICAL_INDEX.md` | platform | 2 | CANONICAL | YES | MEDIUM | LOW | Canonical index |
| 2 | `SESSION_ENTRYPOINT.md` | platform | 2 | CANONICAL | YES | MEDIUM | LOW | Session entrypoint |
| 3 | `ARCHITECTURE_AUTHORITY.md` | platform | 2 | CANONICAL | YES | LOW | LOW | Architecture authority |
| 4 | `README.md` | platform | 2 | CANONICAL | YES | LOW | LOW | Platform memory README |
| 5 | `CONTRACT_STABILIZATION_REPORT.md` | platform | 4 | HISTORICAL | NO | LOW | LOW | Contract stabilization |

---

## OPERATIONAL DOCUMENTS (2 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `operational/multi-capability-visibility.md` | operational | 2 | CANONICAL | OPTIONAL | LOW | LOW | Multi-capability visibility |
| 2 | `customer/customer-operational-philosophy.md` | customer | 2 | CANONICAL | OPTIONAL | LOW | LOW | Customer operational |

---

## HISTORICAL REPORTS (7 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `BOOKING_ENGINE_FOUNDATION_REPORT.md` | booking | 5 | HISTORICAL | NO | LOW | LOW | Foundation report |
| 2 | `SUPPORT_DESK_IMPLEMENTATION_REPORT.md` | support | 5 | HISTORICAL | NO | LOW | LOW | Support desk report |
| 3 | `SUPPORT_DESK_DRIFT_AUDIT.md` | support | 5 | HISTORICAL | NO | LOW | LOW | Support drift audit |
| 4 | `THIRD_CAPABILITY_VALIDATION_REPORT.md` | platform | 5 | HISTORICAL | NO | LOW | LOW | Third capability |
| 5 | `FRONTEND_STABILIZATION_REPORT.md` | platform | 5 | HISTORICAL | NO | LOW | LOW | Frontend stabilization |
| 6 | `RECONSTRUCTION_COMPLETION_REPORT.md` | platform | 5 | HISTORICAL | NO | LOW | LOW | Reconstruction |
| 7 | `historical/decision-log.md` | platform | 5 | HISTORICAL | NO | LOW | LOW | Decision log |

---

## CURRENT STATE DOCUMENTS (2 files)

| # | File | Domain | Tier | Status | Agent | Drift | Dup | Purpose |
|---|------|--------|------|--------|-------|-------|-----|---------|
| 1 | `CURRENT_PLATFORM_STATE.md` | platform | 4 | ACTIVE | YES | MEDIUM | LOW | Current state |
| 2 | `CURRENT_DEVELOPMENT_PHASE.md` | platform | 4 | ACTIVE | YES | MEDIUM | LOW | Development phase |

---

## SUMMARY STATISTICS

| Category | Count | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 |
|----------|-------|--------|--------|--------|--------|--------|
| Philosophy | 12 | 6 | 3 | 3 | 0 | 0 |
| Contracts | 20 | 4 | 15 | 0 | 0 | 1 |
| Anti-Patterns | 10 | 0 | 0 | 10 | 0 | 0 |
| Audits | 13 | 0 | 0 | 0 | 11 | 2 |
| Reports | 6 | 0 | 0 | 0 | 0 | 6 |
| Research | 3 | 0 | 0 | 0 | 0 | 3 |
| Checklists | 1 | 0 | 0 | 1 | 0 | 0 |
| Architecture | 6 | 0 | 6 | 0 | 0 | 0 |
| Invariants | 7 | 4 | 3 | 0 | 0 | 0 |
| Glossary | 1 | 0 | 1 | 0 | 0 | 0 |
| Indexes | 5 | 0 | 4 | 0 | 0 | 1 |
| Operational | 2 | 0 | 2 | 0 | 0 | 0 |
| Historical | 7 | 0 | 0 | 0 | 0 | 7 |
| Current State | 2 | 0 | 0 | 0 | 2 | 0 |
| **TOTAL** | **95** | **14** | **37** | **14** | **13** | **17** |

---

## AGENT CONSULT PRIORITY

### Mandatory (YES) — 24 files

All Tier 1 + selected Tier 2/3:
- All philosophy Tier 1 (6 files)
- All invariant Tier 1 (4 files)
- All contract Tier 1 (4 files)
- Selected anti-patterns (4 files)
- Checklist (1 file)
- Current state (2 files)
- Indexes (3 files)

### Optional — 38 files

- Architecture (6 files)
- Contract Tier 2 (11 files)
- Philosophy Tier 2 (3 files)
- Invariant Tier 2 (3 files)
- Audits (9 files)
- Operational (2 files)
- Glossary (1 file)
- Indexes (3 files)

### Historical Only (NO) — 33 files

- All execution reports (6 files)
- All research (3 files)
- All historical reports (7 files)
- Some audits (2 files)
- Some indexes (1 file)
- Some contracts (1 file)

---

**Version 1.0 — 2026-05-23**
