# Overlap & Fragmentation Report

**Purpose:** Identify semantic duplication and fragmentation risks  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23

---

## OVERLAP DETECTION METHODOLOGY

For each potential overlap:
1. **Identify shared concepts**
2. **Compare definitions**
3. **Assess contradiction risk**
4. **Determine severity**

Severity levels:
- **CRITICAL:** Contradictory definitions
- **HIGH:** Partial overlap with divergence risk
- **MEDIUM:** Harmless duplication
- **LOW:** Superficial similarity

---

## CRITICAL OVERLAPS (0 found)

No contradictory definitions detected.

---

## HIGH OVERLAPS (3 found)

### Overlap 1: Projection Semantics (3 documents)

**Documents:**
1. `contracts/projection-semantics-preparation.md` (Tier 2, ADVISORY)
2. `contracts/projection-lifecycle-semantics.md` (Tier 2, CANONICAL)
3. `contracts/projection-ownership-semantics.md` (Tier 2, CANONICAL)

**Shared Concepts:**
- Projection ownership
- Projection isolation
- Projection non-authority

**Analysis:**
- `projection-semantics-preparation.md` was created as preparation for UNIT 04
- `projection-lifecycle-semantics.md` and `projection-ownership-semantics.md` were created in PRE-UNIT-04 and supersede the preparation doc
- **Risk:** Preparation doc may contain outdated or partial definitions

**Resolution:**
- `projection-semantics-preparation.md` → DEPRECATED
- Reference `projection-lifecycle-semantics.md` and `projection-ownership-semantics.md` instead

---

### Overlap 2: Operational Surface (2 documents)

**Documents:**
1. `philosophy/operational-surface-philosophy.md` (Tier 1, CANONICAL)
2. `philosophy/operational-ui-philosophy.md` (Tier 2, CANONICAL)

**Shared Concepts:**
- Operational boundaries
- UI operational constraints
- Surface vs runtime separation

**Analysis:**
- `operational-surface-philosophy.md` defines the broad operational surface concept
- `operational-ui-philosophy.md` focuses specifically on UI operational boundaries
- **Risk:** Definitions could diverge over time

**Resolution:**
- Keep both (different scopes)
- Ensure `operational-ui-philosophy.md` references `operational-surface-philosophy.md`
- No action needed currently

---

### Overlap 3: Temporal Semantics (2 documents)

**Documents:**
1. `philosophy/temporal-semantics-philosophy.md` (Tier 1, CANONICAL)
2. `contracts/booking-temporal-semantics.md` (Tier 2, CANONICAL)

**Shared Concepts:**
- Temporal authority
- Time hierarchy
- UTC storage
- Timezone conversion

**Analysis:**
- `temporal-semantics-philosophy.md` defines universal temporal philosophy
- `booking-temporal-semantics.md` applies philosophy to booking specifically
- **Risk:** Booking-specific doc could diverge from universal philosophy

**Resolution:**
- Keep both (philosophy vs application)
- Ensure `booking-temporal-semantics.md` references `temporal-semantics-philosophy.md`
- Monitor for divergence

---

## MEDIUM OVERLAPS (5 found)

### Overlap 4: Slot Reality (2 documents)

**Documents:**
1. `contracts/slot-reality-contract.md` (Tier 1, CANONICAL)
2. `contracts/temporal-truth-contracts.md` (Tier 1, CANONICAL)

**Shared Concepts:**
- Slot is projection
- Slot is not entity
- Slot = availability - occupancy

**Analysis:**
- `slot-reality-contract.md` focuses specifically on slot semantics
- `temporal-truth-contracts.md` covers broader temporal truth including slots
- **Risk:** Low — both agree, just different scope

**Resolution:**
- Keep both (specific vs general)
- No action needed

---

### Overlap 5: Occupancy Semantics (3 documents)

**Documents:**
1. `contracts/occupancy-semantics-boundary.md` (Tier 1, CANONICAL)
2. `contracts/occupancy-contracts.md` (Tier 2, CANONICAL)
3. `philosophy/temporal-semantics-philosophy.md` (Tier 1, CANONICAL)

**Shared Concepts:**
- Pending occupies
- Occupancy is temporal-only
- Status-based occupancy

**Analysis:**
- `occupancy-semantics-boundary.md` defines boundary between temporal and business
- `occupancy-contracts.md` defines transition matrix
- `temporal-semantics-philosophy.md` includes occupancy in time authority hierarchy
- **Risk:** Low — complementary, not contradictory

**Resolution:**
- Keep all three (boundary, matrix, philosophy)
- Ensure cross-references exist

---

### Overlap 6: Runtime Isolation (3 documents)

**Documents:**
1. `contracts/runtime-isolation-reinforcement.md` (Tier 1, CANONICAL)
2. `invariants/template-isolation.md` (Tier 1, CANONICAL)
3. `invariants/capability-neutrality.md` (Tier 1, CANONICAL)

**Shared Concepts:**
- Capability isolation
- No cross-capability execution
- Template independence

**Analysis:**
- `runtime-isolation-reinforcement.md` is the most recent and comprehensive
- `template-isolation.md` and `capability-neutrality.md` are older invariants
- **Risk:** Medium — older invariants may be less detailed

**Resolution:**
- Keep all three
- Ensure invariants reference reinforcement doc
- Consider consolidating in future (not now)

---

### Overlap 7: Anti-Pattern Duplication (2 documents)

**Documents:**
1. `anti-patterns/forbidden-directions.md` (Tier 3, CANONICAL)
2. `anti-patterns/drift-detection.md` (Tier 3, CANONICAL)

**Shared Concepts:**
- Forbidden patterns
- Drift detection
- Prevention strategies

**Analysis:**
- `forbidden-directions.md` is general
- `drift-detection.md` focuses on detection mechanisms
- **Risk:** Low — complementary

**Resolution:**
- Keep both
- No action needed

---

### Overlap 8: Operational Gravity (2 documents)

**Documents:**
1. `anti-patterns/forbidden-operational-patterns.md` (Tier 3, CANONICAL)
2. `audits/operational-gravity-analysis.md` (Tier 4, ACTIVE)

**Shared Concepts:**
- Operational orchestration
- Cross-capability workflows
- Automation prevention

**Analysis:**
- `forbidden-operational-patterns.md` defines what is forbidden
- `operational-gravity-analysis.md` analyzes why drift happens
- **Risk:** Low — complementary (anti-pattern vs analysis)

**Resolution:**
- Keep both
- No action needed

---

## LOW OVERLAPS (4 found)

### Overlap 9: Platform Identity

**Documents:**
1. `philosophy/platform-identity.md`
2. `philosophy/operational-platform-identity.md`

**Analysis:**
- `operational-platform-identity.md` supersedes `platform-identity.md`
- v2.0 is more comprehensive
- **Risk:** Low — v1.0 may become stale

**Resolution:**
- Keep both for historical trace
- Agent should consult v2.0

---

### Overlap 10: Customer Philosophy

**Documents:**
1. `contracts/actor-semantics-contract.md`
2. `customer/customer-operational-philosophy.md`

**Analysis:**
- `actor-semantics-contract.md` defines all actors
- `customer-operational-philosophy.md` focuses on customer specifically
- **Risk:** Low — different scopes

**Resolution:**
- Keep both
- No action needed

---

### Overlap 11: Support Desk

**Documents:**
1. `contracts/support-desk-semantics.md`
2. `SUPPORT_DESK_IMPLEMENTATION_REPORT.md`

**Analysis:**
- Contract is canonical
- Report is historical
- **Risk:** Low — report should not be authority

**Resolution:**
- Report is already Tier 5
- No action needed

---

### Overlap 12: Decision Log

**Documents:**
1. `historical/decision-log.md`
2. Multiple execution reports

**Analysis:**
- Decision log captures historical decisions
- Execution reports capture implementation trace
- **Risk:** Low — both are historical

**Resolution:**
- Both are Tier 5
- No action needed

---

## FRAGMENTATION RISK ASSESSMENT

| Risk Area | Severity | Likelihood | Mitigation |
|-----------|----------|------------|------------|
| Projection semantics | HIGH | MEDIUM | Deprecate preparation doc |
| Operational surface | MEDIUM | LOW | Cross-reference docs |
| Temporal semantics | MEDIUM | LOW | Cross-reference docs |
| Runtime isolation | MEDIUM | LOW | Consolidate in future |
| Anti-pattern duplication | LOW | LOW | No action |

---

## RECOMMENDED ACTIONS

### Immediate (Now)

1. **DEPRECATE** `contracts/projection-semantics-preparation.md`
   - Replace with `projection-lifecycle-semantics.md` + `projection-ownership-semantics.md`
   - Add deprecation notice

### Short-term (Next review)

2. **CROSS-REFERENCE** overlapping docs
   - Add "See also" sections
   - Ensure consistency

3. **MONITOR** high-risk overlaps
   - Projection semantics
   - Operational surface
   - Temporal semantics

### Long-term (Future stabilization)

4. **CONSOLIDATE** runtime isolation docs
   - Merge invariants into reinforcement doc
   - Or create unified runtime isolation contract

---

**Version 1.0 — 2026-05-23**
