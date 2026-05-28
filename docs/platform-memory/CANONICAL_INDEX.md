# CANONICAL INDEX

**Purpose:** Navigation index for platform memory layer  
**Status:** CANONICAL — Tier 3 Reference  
**Version:** 1.0

---

## BY PURPOSE

### I Need to Understand Platform Philosophy

| Document | What You'll Learn |
|----------|-------------------|
| `philosophy/platform-identity.md` | What BotGrandFather IS and IS NOT |
| `philosophy/operational-platform-identity.md` | Product identity v2.0 — Operational OS |
| `philosophy/anti-overengineering.md` | Why we reject framework-building |
| `philosophy/abstraction-emergence.md` | When abstraction is justified |
| `philosophy/operational-composition.md` | Metadata philosophy |
| `philosophy/operational-surface-philosophy.md` | What operational surface is and is not |
| `philosophy/operational-memory-philosophy.md` | Memory vs automation boundaries |
| `philosophy/temporal-semantics-philosophy.md` | Temporal authority hierarchy |
| `philosophy/temporal-vs-operational-semantics.md` | Temporal vs operational separation |
| `philosophy/operational-ui-philosophy.md` | What operational UI is and is not |
| `philosophy/settings-philosophy.md` | Settings are operational, not runtime |
| `philosophy/documentation-boundaries.md` | Why platform memory stays clean and canonical |

### I Need to Know Platform Laws

| Document | What You'll Learn |
|----------|-------------------|
| `invariants/runtime-operational-separation.md` | Core architectural boundary |
| `invariants/capability-neutrality.md` | Platform must not be template-centric |
| `invariants/metadata-discipline.md` | Metadata boundaries |
| `invariants/template-isolation.md` | Template boundaries |
| `invariants/event-semantics.md` | Event naming and semantics |
| `invariants/multi-tenant-integrity.md` | Tenant isolation |
| `invariants/sequencing-laws.md` | Evolution order |
| `contracts/runtime-isolation-reinforcement.md` | Capability runtime isolation |
| `contracts/projection-authority-boundaries.md` | Projection authority hierarchy |
| `contracts/temporal-truth-contracts.md` | Temporal source of truth |
| `contracts/slot-reality-contract.md` | Slot projection semantics |
| `contracts/occupancy-semantics-boundary.md` | Occupancy boundary definition |

### I Need to Know Current State

| Document | What You'll Learn |
|----------|-------------------|
| `CURRENT_PLATFORM_STATE.md` | Current maturity |
| `CURRENT_DEVELOPMENT_PHASE.md` | Active work streams |

### I Need to Implement Something

| Task Type | Read |
|-----------|------|
| Runtime feature | `architecture/runtime-layer.md`, `invariants/template-isolation.md` |
| Operational feature | `architecture/operational-layer.md`, `contracts/dashboard-aggregation-contracts.md` |
| Event emission | `contracts/event-contracts.md` |
| New template | `architecture/template-system.md`, `invariants/metadata-discipline.md` |
| Dashboard changes | `architecture/dashboard-system.md`, `contracts/capability-contracts.md` |
| Booking Engine | `contracts/booking-temporal-semantics.md`, `contracts/temporal-truth-contracts.md`, `contracts/slot-reality-contract.md`, `contracts/occupancy-contracts.md` |
| Support Desk | `contracts/support-desk-semantics.md`, `contracts/actor-semantics-contract.md` |
| Operational Surface | `contracts/projection-authority-boundaries.md`, `contracts/projection-ownership-semantics.md`, `contracts/projection-lifecycle-semantics.md`, `contracts/projection-composition-rules.md`, `contracts/actor-projection-semantics.md`, `contracts/dashboard-projection-semantics.md` |
| Settings | `contracts/settings-contracts.md`, `philosophy/settings-philosophy.md` |
| Actions | `contracts/action-contracts.md`, `CONTRACT_STABILIZATION_REPORT.md` |

### I Need to Avoid Mistakes

| Document | What You'll Learn |
|----------|-------------------|
| `anti-patterns/forbidden-directions.md` | What MUST NEVER happen |
| `anti-patterns/drift-detection.md` | How to detect drift |
| `anti-patterns/premature-abstraction.md` | Abstraction anti-patterns |
| `anti-patterns/metadata-creep.md` | Detecting metadata-driven logic drift |
| `anti-patterns/scheduling-engine-drift.md` | Prevent scheduling framework drift |
| `anti-patterns/temporal-automation-drift.md` | Prevent temporal automation |
| `anti-patterns/forbidden-optimization-patterns.md` | Computation anti-patterns |
| `anti-patterns/forbidden-operational-patterns.md` | Operational orchestration anti-patterns |
| `anti-patterns/projection-anti-patterns.md` | Projection-specific anti-patterns |
| `anti-patterns/read-model-anti-patterns.md` | Read model consumption anti-patterns |
| `checklists/temporal-drift-detection-checklist.md` | 34-point drift detection checklist |

### I Need Terminology Clarity

| Document | What You'll Learn |
|----------|-------------------|
| `glossary/canonical-terminology.md` | Exact meanings of all terms |

### I Need Historical Context

| Document | What You'll Learn |
|----------|-------------------|
| `historical/decision-log.md` | Why decisions were made |

---

## BY TIER

### Tier 1 — Immutable Platform Law

- `invariants/runtime-operational-separation.md`
- `invariants/capability-neutrality.md`
- `invariants/metadata-discipline.md`
- `invariants/template-isolation.md`
- `invariants/event-semantics.md`
- `invariants/multi-tenant-integrity.md`
- `invariants/sequencing-laws.md`

### Tier 2 — Canonical Semantic Contracts

- `contracts/event-contracts.md`
- `contracts/capability-contracts.md`
- `contracts/query-service-contracts.md`
- `contracts/dashboard-aggregation-contracts.md`
- `contracts/booking-temporal-semantics.md`
- `contracts/support-desk-semantics.md`
- `contracts/settings-contracts.md`
- `contracts/action-contracts.md`
- `contracts/temporal-truth-contracts.md`
- `contracts/slot-reality-contract.md`
- `contracts/occupancy-semantics-boundary.md`
- `contracts/occupancy-contracts.md`
- `contracts/computation-contracts.md`
- `contracts/projection-authority-boundaries.md`
- `contracts/projection-ownership-semantics.md`
- `contracts/projection-lifecycle-semantics.md`
- `contracts/runtime-isolation-reinforcement.md`
- `contracts/actor-semantics-contract.md`
- `contracts/operational-visibility-boundaries.md`
- `contracts/idempotency-contracts.md`
- `contracts/projection-taxonomy.md`
- `contracts/projection-composition-rules.md`
- `contracts/actor-projection-semantics.md`
- `contracts/projection-freshness-model.md`
- `contracts/projection-isolation-rules.md`
- `contracts/dashboard-projection-semantics.md`
- `contracts/projection-evolution-boundaries.md`
- `contracts/operational-read-model-taxonomy.md`
- `contracts/actor-consumption-boundaries.md`
- `contracts/dashboard-consumption-contract.md`
- `contracts/projection-rendering-contract.md`
- `contracts/operational-freshness-contract.md`
- `contracts/temporal-truth-pressure-contract.md`
- `contracts/write-time-validation-contracts.md`
- `contracts/stale-projection-semantics.md`
- `contracts/telegram-runtime-reliability.md`
- `contracts/reliability-boundaries.md`

### Tier 3 — Current Platform State

- `CURRENT_PLATFORM_STATE.md`
- `CURRENT_DEVELOPMENT_PHASE.md`
- `OPERATIONAL_UI_DRIFT_AUDIT.md`
- `CONTRACT_STABILIZATION_REPORT.md`
- `THIRD_CAPABILITY_VALIDATION_REPORT.md`
- `audits/aggregation-pressure-validation.md`
- `audits/operational-gravity-revalidation.md`
- `audits/booking-concurrency-audit.md`
- `audits/infrastructure-drift-containment.md`
- `audits/runtime-reality-audit.md`

### Tier 4 — Architecture Descriptions

- `architecture/runtime-layer.md`
- `architecture/operational-layer.md`
- `architecture/customer-layer.md`
- `architecture/template-system.md`
- `architecture/dashboard-system.md`
- `architecture/event-system.md`

### Tier 5 — Historical Context

- `historical/decision-log.md`
- `glossary/canonical-terminology.md`

---

## QUICK REFERENCE

| Question | Document |
|----------|----------|
| What is BotGrandFather? | `philosophy/platform-identity.md` |
| What MUST NEVER happen? | `anti-patterns/forbidden-directions.md` |
| How do events work? | `contracts/event-contracts.md` |
| What phase are we in? | `CURRENT_DEVELOPMENT_PHASE.md` |
| Can I build X? | `CURRENT_DEVELOPMENT_PHASE.md` (safe/unsafe list) |
| What does "capability" mean? | `glossary/canonical-terminology.md` |
| Why was Y decided? | `historical/decision-log.md` |
| Is Z safe to work on? | `CURRENT_DEVELOPMENT_PHASE.md` + `anti-patterns/` |
| How do settings work? | `contracts/settings-contracts.md` + `philosophy/settings-philosophy.md` |
| How do actions work? | `contracts/action-contracts.md` |
| Is the platform universal? | `THIRD_CAPABILITY_VALIDATION_REPORT.md` |
| What contracts exist? | `CONTRACT_STABILIZATION_REPORT.md` |
| How to detect metadata creep? | `anti-patterns/metadata-creep.md` |

## DOCUMENTATION GOVERNANCE

| Need | Document |
|------|----------|
| Complete doc inventory | `governance/DOCUMENTATION_INVENTORY.md` |
| Canonical hierarchy | `governance/CANONICAL_HIERARCHY_MAP.md` |
| Semantic overlaps | `governance/OVERLAP_FRAGMENTATION_REPORT.md` |
| Context routing | `governance/CONTEXT_ROUTING_MODEL.md` |
| Lifecycle classification | `governance/LIFECYCLE_CLASSIFICATION.md` |
| Governance recommendations | `governance/GOVERNANCE_RECOMMENDATIONS.md` |
| Drift risk analysis | `governance/DRIFT_RISK_ANALYSIS.md` |
| Full governance report | `governance/DOCUMENTATION_GOVERNANCE_REPORT.md` |

---

**Version 2.2 — 2026-05-23**

---

## UNIT HISTORY

| Unit | Date | Status |
|------|------|--------|
| PRE-UNIT-04 | 2026-05-23 | ✅ Complete |
| UNIT-04 | 2026-05-23 | ✅ Complete |
| UNIT-05 | 2026-05-23 | ✅ Complete |
| UNIT-06 | 2026-05-23 | ✅ Complete |
