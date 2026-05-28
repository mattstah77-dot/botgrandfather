# Lifecycle Classification Model

**Purpose:** Define document lifecycle statuses  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23

---

## LIFECYCLE STATUSES

### CANONICAL

**Definition:** Non-negotiable platform truth. Active and authoritative.

**Rules:**
- Agent MUST consult before related work
- Cannot be contradicted by lower tiers
- Can be refined (clarified) but not changed
- Requires explicit review to modify

**Examples:**
- `philosophy/platform-identity.md`
- `contracts/temporal-truth-contracts.md`
- `invariants/template-isolation.md`

---

### ACTIVE

**Definition:** Current and useful. May become canonical or may be superseded.

**Rules:**
- Agent SHOULD consult if relevant
- May be promoted to CANONICAL
- May be demoted to ADVISORY
- Under active use and refinement

**Examples:**
- `audits/capability-isolation-audit.md`
- `CURRENT_PLATFORM_STATE.md`
- `CURRENT_DEVELOPMENT_PHASE.md`

---

### ADVISORY

**Definition:** Useful guidance but not authoritative. May be outdated.

**Rules:**
- Agent MAY consult if needed
- Should be verified against CANONICAL docs
- May be superseded by newer docs
- Useful for context but not decision-making

**Examples:**
- `contracts/projection-semantics-preparation.md` (superseded)
- `audits/operational-security-audit.md` (may be outdated)
- `audits/production-readiness-classification.md`

---

### HISTORICAL

**Definition:** Record of past work. Never authoritative.

**Rules:**
- Agent MUST NOT consult for semantic truth
- Useful for understanding evolution
- Immutable (should not be modified)
- Reference only, never decision source

**Examples:**
- All execution reports
- All research documents
- `historical/decision-log.md`

---

### DEPRECATED

**Definition:** Superseded by newer documentation. Should not be used.

**Rules:**
- Agent MUST NOT consult
- May contain outdated or wrong information
- Kept for historical trace only
- Should reference replacement doc

**Examples:**
- `contracts/projection-semantics-preparation.md` (→ use projection-lifecycle + projection-ownership)

---

## LIFECYCLE TRANSITIONS

```
NEW DOC
    │
    ├── CANONICAL (if Tier 1 or validated Tier 2)
    ├── ACTIVE (if Tier 2-4, under review)
    └── ADVISORY (if Tier 2-4, provisional)
    │
    ▼
CANONICAL
    │
    ├── Stays CANONICAL (refined)
    └── Demoted to ADVISORY (if contradicted)
    │
    ▼
ACTIVE
    │
    ├── Promoted to CANONICAL
    ├── Stays ACTIVE
    ├── Demoted to ADVISORY
    └── Demoted to HISTORICAL
    │
    ▼
ADVISORY
    │
    ├── Promoted to ACTIVE
    ├── Stays ADVISORY
    ├── Demoted to HISTORICAL
    └── Marked DEPRECATED
    │
    ▼
HISTORICAL
    │
    └── Stays HISTORICAL (immutable)
    │
    ▼
DEPRECATED
    │
    └── Stays DEPRECATED (may be deleted later)
```

---

## DOCUMENT STATUS ASSIGNMENTS

### CANONICAL (24 docs)

All Tier 1 + selected Tier 2/3:

**Philosophy (6):**
- `platform-identity.md`
- `operational-platform-identity.md`
- `temporal-semantics-philosophy.md`
- `temporal-vs-operational-semantics.md`
- `operational-surface-philosophy.md`
- `operational-memory-philosophy.md`

**Contracts (7):**
- `temporal-truth-contracts.md`
- `slot-reality-contract.md`
- `occupancy-semantics-boundary.md`
- `occupancy-contracts.md`
- `computation-contracts.md`
- `projection-authority-boundaries.md`
- `runtime-isolation-reinforcement.md`

**Invariants (4):**
- `template-isolation.md`
- `capability-neutrality.md`
- `multi-tenant-integrity.md`
- `runtime-operational-separation.md`

**Anti-Patterns (4):**
- `forbidden-directions.md`
- `scheduling-engine-drift.md`
- `temporal-automation-drift.md`
- `forbidden-optimization-patterns.md`
- `forbidden-operational-patterns.md`

**Checklists (1):**
- `temporal-drift-detection-checklist.md`

**Indexes (2):**
- `CANONICAL_INDEX.md`
- `SESSION_ENTRYPOINT.md`

---

### ACTIVE (14 docs)

**Audits (11):**
- `capability-isolation-audit.md`
- `concurrency-race-analysis.md`
- `lifecycle-integrity-audit.md`
- `transaction-boundary-audit.md`
- `runtime-failure-matrix.md`
- `booking-temporal-audit.md`
- `hidden-crm-drift-analysis.md`
- `operational-gravity-analysis.md`
- `cross-capability-boundary-audit.md`
- `semantic-over-abstraction-audit.md`

**Current State (2):**
- `CURRENT_PLATFORM_STATE.md`
- `CURRENT_DEVELOPMENT_PHASE.md`

**Architecture (1):**
- `architecture/operational-layer.md`

---

### ADVISORY (12 docs)

**Contracts (1):**
- `projection-semantics-preparation.md` (superseded)

**Audits (2):**
- `operational-security-audit.md`
- `production-readiness-classification.md`

**Philosophy (2):**
- `operational-ui-philosophy.md`
- `ecosystem-boundaries.md`

**Architecture (5):**
- `template-system.md`
- `runtime-layer.md`
- `dashboard-system.md`
- `customer-layer.md`
- `event-system.md`

**Operational (2):**
- `multi-capability-visibility.md`
- `customer-operational-philosophy.md`

---

### HISTORICAL (33 docs)

**Execution Reports (6):**
- All UNIT/PRE-UNIT execution reports

**Research (3):**
- All research documents

**Implementation Reports (5):**
- `BOOKING_ENGINE_FOUNDATION_REPORT.md`
- `SUPPORT_DESK_IMPLEMENTATION_REPORT.md`
- `THIRD_CAPABILITY_VALIDATION_REPORT.md`
- `FRONTEND_STABILIZATION_REPORT.md`
- `RECONSTRUCTION_COMPLETION_REPORT.md`

**Historical (1):**
- `historical/decision-log.md`

**Other (3):**
- `SUPPORT_DESK_DRIFT_AUDIT.md`
- `CONTRACT_STABILIZATION_REPORT.md`
- `audits/recovery-restart-audit.md`

---

### DEPRECATED (1 doc)

**Contracts (1):**
- `contracts/projection-semantics-preparation.md`
  - **Replacement:** `projection-lifecycle-semantics.md` + `projection-ownership-semantics.md`
  - **Reason:** Superseded by PRE-UNIT-04 stabilization

---

## STATUS CHANGE PROTOCOL

### How to Change Status

1. **Propose change** in execution report or governance audit
2. **Justify** with evidence
3. **Review** against canonical hierarchy
4. **Document** in governance artifacts
5. **Update** document header with new status

### Who Can Change Status

| From → To | Authority |
|-----------|-----------|
| Any → CANONICAL | Requires explicit user approval |
| Any → DEPRECATED | Agent can propose, user approves |
| CANONICAL → Any | NEVER (without user explicit directive) |
| ACTIVE → ADVISORY | Agent can propose |
| ADVISORY → HISTORICAL | Agent can propose |

---

**Version 1.0 — 2026-05-23**
