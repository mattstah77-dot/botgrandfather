# Context Routing Model

**Purpose:** Define which docs are loaded for which work domains  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23

---

## ROUTING PRINCIPLE

**Agent must NOT load all docs every time.**

For each domain/work type:
- **MANDATORY:** Must consult before work
- **OPTIONAL:** May consult if needed
- **IRRELEVANT:** Do not load

---

## DOMAIN: Booking Temporal Work

**Work types:** Slot generation, availability, occupancy, booking lifecycle, rescheduling

### Mandatory Docs

| Doc | Tier | Why Mandatory |
|-----|------|--------------|
| `contracts/temporal-truth-contracts.md` | 1 | Source of temporal truth |
| `contracts/slot-reality-contract.md` | 1 | Slot semantics |
| `contracts/occupancy-semantics-boundary.md` | 1 | Occupancy boundaries |
| `contracts/occupancy-contracts.md` | 2 | Occupancy transitions |
| `contracts/computation-contracts.md` | 2 | Computation model |
| `philosophy/temporal-semantics-philosophy.md` | 1 | Temporal authority |
| `anti-patterns/scheduling-engine-drift.md` | 3 | Prevent scheduling drift |
| `anti-patterns/temporal-automation-drift.md` | 3 | Prevent automation drift |
| `checklists/temporal-drift-detection-checklist.md` | 3 | Drift detection |

### Optional Docs

| Doc | Tier | Why Optional |
|-----|------|-------------|
| `contracts/booking-temporal-contracts.md` | 2 | Booking-specific temporal |
| `contracts/booking-temporal-semantics.md` | 2 | Booking semantics |
| `audits/booking-temporal-audit.md` | 4 | Historical audit |
| `architecture/template-system.md` | 2 | Template architecture |

### Irrelevant Docs

| Doc | Why Irrelevant |
|-----|---------------|
| `contracts/actor-semantics-contract.md` | Actor work, not temporal |
| `contracts/support-desk-semantics.md` | Support domain |
| `customer/customer-operational-philosophy.md` | Customer domain |
| `dashboard/dashboard-scalability-analysis.md` | Dashboard domain |
| All support/lead-funnel docs | Different capability |

---

## DOMAIN: Operational Surface Work

**Work types:** Dashboard, Mini App, operational visibility, aggregation

### Mandatory Docs

| Doc | Tier | Why Mandatory |
|-----|------|--------------|
| `philosophy/operational-surface-philosophy.md` | 1 | Surface boundaries |
| `philosophy/operational-memory-philosophy.md` | 1 | Memory boundaries |
| `contracts/operational-visibility-boundaries.md` | 2 | Visibility vs authority |
| `contracts/projection-authority-boundaries.md` | 1 | Projection authority |
| `contracts/projection-ownership-semantics.md` | 2 | Projection ownership |
| `contracts/projection-lifecycle-semantics.md` | 2 | Projection lifecycle |
| `contracts/runtime-isolation-reinforcement.md` | 1 | Runtime isolation |
| `anti-patterns/forbidden-operational-patterns.md` | 3 | Prevent operational drift |
| `audits/operational-gravity-analysis.md` | 4 | Gravity analysis |

### Optional Docs

| Doc | Tier | Why Optional |
|-----|------|-------------|
| `contracts/dashboard-aggregation-contracts.md` | 2 | Dashboard specifics |
| `architecture/dashboard-system.md` | 2 | Dashboard architecture |
| `architecture/operational-layer.md` | 2 | Operational architecture |
| `operational/multi-capability-visibility.md` | 2 | Multi-capability visibility |

### Irrelevant Docs

| Doc | Why Irrelevant |
|-----|---------------|
| `contracts/temporal-truth-contracts.md` | Temporal domain |
| `contracts/computation-contracts.md` | Computation domain |
| `anti-patterns/scheduling-engine-drift.md` | Scheduling domain |
| All booking-specific temporal docs | Different domain |

---

## DOMAIN: Support Work

**Work types:** Tickets, support desk, customer service

### Mandatory Docs

| Doc | Tier | Why Mandatory |
|-----|------|--------------|
| `contracts/actor-semantics-contract.md` | 2 | Actor boundaries |
| `contracts/operational-visibility-boundaries.md` | 2 | Visibility boundaries |
| `philosophy/operational-surface-philosophy.md` | 1 | Surface boundaries |
| `audits/hidden-crm-drift-analysis.md` | 4 | CRM drift prevention |
| `anti-patterns/forbidden-operational-patterns.md` | 3 | Prevent orchestration |

### Optional Docs

| Doc | Tier | Why Optional |
|-----|------|-------------|
| `contracts/support-desk-semantics.md` | 2 | Support semantics |
| `customer/customer-operational-philosophy.md` | 2 | Customer philosophy |
| `architecture/customer-layer.md` | 2 | Customer architecture |

### Irrelevant Docs

| Doc | Why Irrelevant |
|-----|---------------|
| `contracts/temporal-truth-contracts.md` | Temporal domain |
| `contracts/occupancy-contracts.md` | Booking domain |
| `anti-patterns/scheduling-engine-drift.md` | Scheduling domain |

---

## DOMAIN: Platform Infrastructure Work

**Work types:** Auth, multi-tenancy, events, runtime, templates

### Mandatory Docs

| Doc | Tier | Why Mandatory |
|-----|------|--------------|
| `philosophy/platform-identity.md` | 1 | Platform identity |
| `invariants/template-isolation.md` | 1 | Template isolation |
| `invariants/capability-neutrality.md` | 1 | Capability neutrality |
| `invariants/multi-tenant-integrity.md` | 1 | Multi-tenant integrity |
| `invariants/runtime-operational-separation.md` | 1 | Runtime separation |
| `contracts/capability-contracts.md` | 2 | Capability contracts |
| `contracts/runtime-isolation-reinforcement.md` | 1 | Runtime isolation |
| `architecture/template-system.md` | 2 | Template architecture |
| `architecture/runtime-layer.md` | 2 | Runtime architecture |
| `architecture/event-system.md` | 2 | Event architecture |

### Optional Docs

| Doc | Tier | Why Optional |
|-----|------|-------------|
| `contracts/event-contracts.md` | 2 | Event contracts |
| `contracts/idempotency-contracts.md` | 2 | Idempotency |
| `contracts/query-service-contracts.md` | 2 | Query service |
| `philosophy/ecosystem-boundaries.md` | 2 | Ecosystem boundaries |
| `anti-patterns/ecosystem-drift.md` | 3 | Ecosystem drift |
| `anti-patterns/metadata-creep.md` | 3 | Metadata creep |

### Irrelevant Docs

| Doc | Why Irrelevant |
|-----|---------------|
| `contracts/occupancy-contracts.md` | Booking domain |
| `contracts/support-desk-semantics.md` | Support domain |
| `audits/booking-temporal-audit.md` | Booking audit |

---

## DOMAIN: Dashboard Work

**Work types:** Dashboard UI, metrics, aggregation, owner views

### Mandatory Docs

| Doc | Tier | Why Mandatory |
|-----|------|--------------|
| `contracts/dashboard-aggregation-contracts.md` | 2 | Dashboard aggregation |
| `contracts/projection-authority-boundaries.md` | 1 | Projection authority |
| `contracts/projection-ownership-semantics.md` | 2 | Projection ownership |
| `philosophy/operational-surface-philosophy.md` | 1 | Surface boundaries |
| `philosophy/operational-ui-philosophy.md` | 2 | UI boundaries |
| `architecture/dashboard-system.md` | 2 | Dashboard architecture |

### Optional Docs

| Doc | Tier | Why Optional |
|-----|------|-------------|
| `operational/multi-capability-visibility.md` | 2 | Multi-capability visibility |
| `audits/cross-capability-boundary-audit.md` | 4 | Cross-capability audit |

### Irrelevant Docs

| Doc | Why Irrelevant |
|-----|---------------|
| `contracts/temporal-truth-contracts.md` | Temporal domain |
| `contracts/computation-contracts.md` | Computation domain |
| `anti-patterns/scheduling-engine-drift.md` | Scheduling domain |

---

## DOMAIN: Documentation Governance

**Work types:** Doc maintenance, audits, stabilization

### Mandatory Docs

| Doc | Tier | Why Mandatory |
|-----|------|--------------|
| `CANONICAL_INDEX.md` | 2 | Canonical index |
| `SESSION_ENTRYPOINT.md` | 2 | Session entrypoint |
| `ARCHITECTURE_AUTHORITY.md` | 2 | Architecture authority |
| `README.md` | 2 | Platform memory README |
| `glossary/canonical-terminology.md` | 2 | Terminology |

### Optional Docs

| Doc | Tier | Why Optional |
|-----|------|-------------|
| All philosophy docs | 1-2 | Reference |
| All contract docs | 2 | Reference |
| All invariant docs | 1-2 | Reference |

### Irrelevant Docs

| Doc | Why Irrelevant |
|-----|---------------|
| All execution reports | Historical |
| All research docs | Historical |
| `CURRENT_PLATFORM_STATE.md` | State (not governance) |

---

## CONTEXT OVERLOAD PREVENTION

### Maximum Docs Per Domain

| Domain | Mandatory | Optional | Total Recommended |
|--------|-----------|----------|-------------------|
| Booking Temporal | 9 | 4 | **9-13** |
| Operational Surface | 9 | 4 | **9-13** |
| Support | 5 | 3 | **5-8** |
| Platform Infrastructure | 10 | 6 | **10-16** |
| Dashboard | 6 | 2 | **6-8** |
| Documentation Governance | 5 | All | **5-10** |

### Rule

**Agent must not load more than 15 docs for any single task.**

If more than 15 docs seem relevant:
1. Re-evaluate scope
2. Focus on mandatory docs
3. Load optional docs only when needed

---

## ROUTING DECISION TREE

```
What work are you doing?
    │
    ├── Booking/Temporal?
    │   └── Load: temporal contracts + occupancy + computation + anti-patterns
    │
    ├── Operational/Surface?
    │   └── Load: surface philosophy + projection contracts + operational anti-patterns
    │
    ├── Support/Customer?
    │   └── Load: actor semantics + visibility boundaries + CRM drift
    │
    ├── Platform/Infrastructure?
    │   └── Load: invariants + capability contracts + architecture
    │
    ├── Dashboard/UI?
    │   └── Load: dashboard contracts + projection authority + UI philosophy
    │
    └── Documentation/Governance?
        └── Load: indexes + glossary + canonical hierarchy
```

---

**Version 1.0 — 2026-05-23**
