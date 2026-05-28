# Governance Recommendations

**Purpose:** Practical improvements for documentation governance  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23

---

## RECOMMENDATION 1: Deprecate Superseded Documents

**Target:** `contracts/projection-semantics-preparation.md`

**Problem:**
- Created as preparation for UNIT 04
- Superseded by `projection-lifecycle-semantics.md` and `projection-ownership-semantics.md`
- Contains partial definitions that may conflict with canonical docs

**Action:**
1. Add DEPRECATED header to document
2. Add reference to replacement docs
3. Update inventory and hierarchy

**Priority:** HIGH

---

## RECOMMENDATION 2: Add Cross-References to Overlapping Docs

**Targets:**
- `contracts/booking-temporal-semantics.md` → `philosophy/temporal-semantics-philosophy.md`
- `philosophy/operational-ui-philosophy.md` → `philosophy/operational-surface-philosophy.md`
- `invariants/template-isolation.md` → `contracts/runtime-isolation-reinforcement.md`

**Problem:**
- Overlapping docs may diverge over time
- No explicit links between related documents

**Action:**
1. Add "See also" section to each overlapping doc
2. Reference canonical parent doc
3. Ensure definitions are consistent

**Priority:** MEDIUM

---

## RECOMMENDATION 3: Consolidate Runtime Isolation Docs

**Targets:**
- `invariants/template-isolation.md`
- `invariants/capability-neutrality.md`
- `contracts/runtime-isolation-reinforcement.md`

**Problem:**
- Three docs cover similar concepts
- `runtime-isolation-reinforcement.md` is most comprehensive
- Older invariants may be less detailed

**Action:**
1. Keep all three for now (not urgent)
2. In next stabilization phase, consider merging
3. Ensure invariants reference reinforcement doc

**Priority:** LOW (not urgent)

---

## RECOMMENDATION 4: Update CANONICAL_INDEX.md

**Target:** `CANONICAL_INDEX.md`

**Problem:**
- May not reflect all new documents
- May not include PRE-UNIT-04 artifacts
- Agent entrypoint should be current

**Action:**
1. Review and update index
2. Add all new canonical docs
3. Ensure hierarchy is clear

**Priority:** HIGH

---

## RECOMMENDATION 5: Add Document Headers

**Target:** All new documents

**Problem:**
- Some documents lack consistent metadata headers
- Hard to determine status, tier, authority at a glance

**Action:**
1. Standardize header format:
   ```
   # Title
   **Purpose:** ...
   **Status:** CANONICAL | ACTIVE | ADVISORY | HISTORICAL | DEPRECATED
   **Tier:** 1 | 2 | 3 | 4 | 5
   **Version:** X.Y
   **Date:** YYYY-MM-DD
   ```
2. Apply to all new documents
3. Gradually apply to older documents

**Priority:** MEDIUM

---

## RECOMMENDATION 6: Create Execution Report Template

**Target:** Future execution reports

**Problem:**
- Reports are growing rapidly
- No standardized format
- Risk of reports becoming authority

**Action:**
1. Create standardized report template with:
   - Clear HISTORICAL status
   - Explicit "NOT SEMANTIC AUTHORITY" notice
   - Reference to canonical contracts
   - Standard sections
2. Apply to all future reports

**Priority:** MEDIUM

---

## RECOMMENDATION 7: Audit CURRENT_PLATFORM_STATE.md

**Target:** `CURRENT_PLATFORM_STATE.md`

**Problem:**
- May contain outdated information
- Risk of becoming stale authority
- Should reflect current state accurately

**Action:**
1. Review for accuracy
2. Update with current implementation status
3. Ensure it references canonical docs, not contradicts

**Priority:** MEDIUM

---

## RECOMMENDATION 8: Monitor Dashboard Layer

**Target:** `architecture/dashboard-system.md`

**Problem:**
- Dashboard flagged as MEDIUM risk in cross-capability audit
- Most likely place for orchestration drift
- Documentation must prevent drift

**Action:**
1. Ensure dashboard docs explicitly forbid orchestration
2. Add dashboard-specific anti-patterns
3. Monitor for new dashboard features

**Priority:** HIGH

---

## RECOMMENDATION 9: Prevent Report Sprawl

**Target:** All execution reports

**Problem:**
- 6 execution reports already
- Risk of exponential growth
- Reports must not become authority

**Action:**
1. Limit reports to essential information
2. Always reference canonical contracts
3. Never define new semantics in reports
4. Archive reports after review

**Priority:** MEDIUM

---

## RECOMMENDATION 10: Create Domain-Specific Indexes

**Target:** Each major domain

**Problem:**
- Agent must know which docs to load
- No domain-specific entry points
- Context routing requires manual knowledge

**Action:**
1. Create `booking-index.md` for booking domain
2. Create `operational-index.md` for operational domain
3. Create `platform-index.md` for platform domain
4. Each index lists mandatory + optional docs

**Priority:** LOW (nice to have)

---

## PRIORITY MATRIX

| Recommendation | Priority | Effort | Impact |
|----------------|----------|--------|--------|
| 1. Deprecate superseded | HIGH | Low | High |
| 2. Add cross-references | MEDIUM | Medium | Medium |
| 3. Consolidate runtime isolation | LOW | High | Low |
| 4. Update canonical index | HIGH | Medium | High |
| 5. Add document headers | MEDIUM | Medium | Medium |
| 6. Report template | MEDIUM | Low | Medium |
| 7. Audit platform state | MEDIUM | Medium | Medium |
| 8. Monitor dashboard | HIGH | Low | High |
| 9. Prevent report sprawl | MEDIUM | Low | Medium |
| 10. Domain indexes | LOW | Medium | Low |

---

## IMPLEMENTATION ORDER

### Phase 1 (Immediate)
1. Deprecate superseded documents
2. Update canonical index
3. Monitor dashboard layer

### Phase 2 (Next stabilization)
4. Add cross-references
5. Add document headers
6. Create report template

### Phase 3 (Future)
7. Audit platform state
8. Prevent report sprawl
9. Consolidate runtime isolation
10. Create domain indexes

---

**Version 1.0 — 2026-05-23**
