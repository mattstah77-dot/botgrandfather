# Drift Risk Analysis

**Purpose:** Identify future documentation drift risks  
**Status:** CANONICAL — Governance Artifact  
**Version:** 1.0  
**Date:** 2026-05-23

---

## RISK 1: Semantic Fragmentation

**Description:**
Overlapping documents diverge over time, creating contradictory definitions.

**Impact:** HIGH  
**Likelihood:** MEDIUM  
**Current Evidence:**
- `projection-semantics-preparation.md` vs newer projection docs
- `booking-temporal-semantics.md` vs `temporal-semantics-philosophy.md`

**Mitigation:**
1. Cross-reference all overlapping docs
2. Regular overlap audits
3. Deprecate superseded docs immediately

**Monitoring:**
- Check for definition divergence quarterly
- Audit new docs against existing canon

---

## RISK 2: Duplicated Philosophy

**Description:**
Same philosophical concepts repeated in multiple documents with slight variations.

**Impact:** MEDIUM  
**Likelihood:** MEDIUM  
**Current Evidence:**
- `platform-identity.md` vs `operational-platform-identity.md`
- `operational-surface-philosophy.md` vs `operational-ui-philosophy.md`

**Mitigation:**
1. Maintain single source of truth per concept
2. Reference, don't repeat
3. Consolidate when possible

**Monitoring:**
- Check for repeated invariants
- Audit philosophy docs for duplication

---

## RISK 3: Report Sprawl

**Description:**
Execution reports grow exponentially, becoming de facto authority.

**Impact:** HIGH  
**Likelihood:** HIGH  
**Current Evidence:**
- 6 execution reports already
- Each unit creates 2-3 reports
- Reports contain implementation details that look like specs

**Mitigation:**
1. Strict "HISTORICAL only" classification
2. Standardized report template with authority disclaimer
3. Never define new semantics in reports
4. Archive reports after review

**Monitoring:**
- Count reports per unit
- Check if reports are being consulted
- Ensure reports reference contracts

---

## RISK 4: Canonical Confusion

**Description:**
Agents or developers confuse Tier 4 audits with Tier 2 contracts.

**Impact:** MEDIUM  
**Likelihood:** MEDIUM  
**Current Evidence:**
- `CURRENT_PLATFORM_STATE.md` (Tier 4) may be treated as authority
- Audits contain analysis that looks like rules

**Mitigation:**
1. Clear status headers on all docs
2. Tier system enforced in agent routing
3. Regular canonical hierarchy reviews

**Monitoring:**
- Check if audits are being cited as rules
- Ensure agent consults Tier 1-2 first

---

## RISK 5: Context Overload

**Description:**
Agent loads too many docs, causing semantic fatigue and contradictions.

**Impact:** MEDIUM  
**Likelihood:** MEDIUM  
**Current Evidence:**
- 95 total documents
- Some domains have 15+ relevant docs
- No enforced loading limits

**Mitigation:**
1. Context routing model (max 15 docs)
2. Mandatory vs optional classification
3. Domain-specific indexes

**Monitoring:**
- Track docs loaded per task
- Check for irrelevant doc loading

---

## RISK 6: Hidden Contradictions

**Description:**
Subtle contradictions between documents that are not obvious.

**Impact:** HIGH  
**Likelihood:** LOW  
**Current Evidence:**
- None currently detected
- Risk increases with document growth

**Mitigation:**
1. Regular contradiction audits
2. Cross-reference validation
3. Single source of truth per concept

**Monitoring:**
- Automated contradiction detection (if possible)
- Manual review of new docs against canon

---

## RISK 7: Stale Documents

**Description:**
Documents become outdated as platform evolves.

**Impact:** MEDIUM  
**Likelihood:** HIGH  
**Current Evidence:**
- `CURRENT_PLATFORM_STATE.md` may be stale
- `audits/operational-security-audit.md` may be outdated
- Architecture docs may not reflect current code

**Mitigation:**
1. Regular document audits
2. Stale doc detection
3. Version dates on all docs
4. Deprecate outdated docs

**Monitoring:**
- Check last updated dates
- Review docs after major changes
- Archive stale docs

---

## RISK 8: Uncontrolled Growth

**Description:**
Documentation grows faster than it can be governed.

**Impact:** MEDIUM  
**Likelihood:** HIGH  
**Current Evidence:**
- 95 documents already
- Each unit adds 5-10 docs
- No growth limits

**Mitigation:**
1. Documentation governance checkpoints
2. Require justification for new docs
3. Prefer updating existing docs over creating new
4. Archive historical docs

**Monitoring:**
- Track document count per phase
- Review growth rate quarterly

---

## RISK 9: Anti-Pattern Duplication

**Description:**
Same anti-patterns documented in multiple places.

**Impact:** LOW  
**Likelihood:** MEDIUM  
**Current Evidence:**
- `forbidden-directions.md` vs `drift-detection.md`
- `forbidden-operational-patterns.md` vs `operational-gravity-analysis.md`

**Mitigation:**
1. Single anti-pattern per concept
2. Reference, don't repeat
3. Consolidate anti-pattern docs

**Monitoring:**
- Check for repeated anti-patterns
- Audit anti-pattern docs for overlap

---

## RISK 10: Tier Inflation

**Description:**
Documents promoted to higher tiers than warranted.

**Impact:** HIGH  
**Likelihood:** LOW  
**Current Evidence:**
- `projection-semantics-preparation.md` was treated as Tier 2 but should be ADVISORY
- Some reports may be treated as authority

**Mitigation:**
1. Strict tier assignment rules
2. User approval for Tier 1 promotion
3. Regular tier audits

**Monitoring:**
- Check if Tier 4 docs are being treated as Tier 2
- Ensure reports are never Tier 1-2

---

## RISK MATRIX

| Risk | Impact | Likelihood | Score | Priority |
|------|--------|------------|-------|----------|
| Semantic fragmentation | HIGH | MEDIUM | 6 | HIGH |
| Duplicated philosophy | MEDIUM | MEDIUM | 4 | MEDIUM |
| Report sprawl | HIGH | HIGH | 9 | CRITICAL |
| Canonical confusion | MEDIUM | MEDIUM | 4 | MEDIUM |
| Context overload | MEDIUM | MEDIUM | 4 | MEDIUM |
| Hidden contradictions | HIGH | LOW | 3 | MEDIUM |
| Stale documents | MEDIUM | HIGH | 6 | HIGH |
| Uncontrolled growth | MEDIUM | HIGH | 6 | HIGH |
| Anti-pattern duplication | LOW | MEDIUM | 2 | LOW |
| Tier inflation | HIGH | LOW | 3 | MEDIUM |

---

## MITIGATION PRIORITIES

### CRITICAL (Score 9)
1. **Report sprawl** — Implement strict report governance

### HIGH (Score 6)
2. **Semantic fragmentation** — Cross-reference + deprecate
3. **Stale documents** — Regular audits + archive
4. **Uncontrolled growth** — Growth checkpoints

### MEDIUM (Score 3-4)
5. **Duplicated philosophy** — Consolidate
6. **Canonical confusion** — Clear headers
7. **Context overload** — Routing model
8. **Hidden contradictions** — Regular audits
9. **Tier inflation** — Strict rules

### LOW (Score 2)
10. **Anti-pattern duplication** — Consolidate when convenient

---

**Version 1.0 — 2026-05-23**
