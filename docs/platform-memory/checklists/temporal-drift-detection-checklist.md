# Temporal Drift Detection Checklist

**Purpose:** Permanent guardrail for detecting temporal drift toward scheduling/orchestration  
**Status:** CANONICAL — Tier 2 Checklist  
**Version:** 1.0  
**Date:** 2026-05-23

---

## HOW TO USE THIS CHECKLIST

Before any booking-related change, answer ALL questions. If ANY answer is YES → STOP and document drift risk.

---

## CHECKLIST

### Section 1: Slot Persistence

| # | Question | YES → Drift Risk |
|---|----------|-----------------|
| 1 | Does this introduce a Slot entity? | Slot materialization |
| 2 | Does this persist generated slots? | Cache-as-truth |
| 3 | Does this create a slot repository? | Slot persistence |
| 4 | Does this cache slot availability? | Stale data risk |
| 5 | Does this pre-compute future slots? | Materialization |

**Current Status:**
- [x] Q1: No Slot entity ✅
- [x] Q2: No slot persistence ✅
- [x] Q3: No slot repository ✅
- [x] Q4: No slot cache ✅
- [x] Q5: No pre-computation ✅

---

### Section 2: Temporal Automation

| # | Question | YES → Drift Risk |
|---|----------|-----------------|
| 6 | Does this introduce automatic temporal mutation? | Time-as-authority |
| 7 | Does this create a cron job for booking state? | Background worker |
| 8 | Does this auto-expire pending bookings? | Cleanup infrastructure |
| 9 | Does this auto-complete past bookings? | Temporal orchestration |
| 10 | Does this auto-cancel stale bookings? | Hidden lifecycle |
| 11 | Does this use time to trigger state transitions? | Automation drift |
| 12 | Does this create a temporal daemon? | Infrastructure creep |

**Current Status:**
- [x] Q6: No auto temporal mutation ✅
- [x] Q7: No cron jobs ✅
- [x] Q8: No auto-expiration ✅
- [x] Q9: No auto-completion ✅
- [x] Q10: No auto-cancellation ✅
- [x] Q11: No time-triggered transitions ✅
- [x] Q12: No temporal daemons ✅

---

### Section 3: Scheduling Infrastructure

| # | Question | YES → Drift Risk |
|---|----------|-----------------|
| 13 | Does this introduce a scheduling engine? | Framework drift |
| 14 | Does this create a workflow engine? | Orchestration |
| 15 | Does this use RRULE or recurrence? | Recurrence framework |
| 16 | Does this create a reservation system? | Reservation abstraction |
| 17 | Does this introduce distributed locking? | Distributed complexity |
| 18 | Does this create a queue for bookings? | Queue infrastructure |
| 19 | Does this use a state machine for bookings? | Workflow engine |

**Current Status:**
- [x] Q13: No scheduling engine ✅
- [x] Q14: No workflow engine ✅
- [x] Q15: No RRULE ✅
- [x] Q16: No reservation system ✅
- [x] Q17: No distributed locking ✅
- [x] Q18: No booking queues ✅
- [x] Q19: No state machine ✅

---

### Section 4: Abstraction Drift

| # | Question | YES → Drift Risk |
|---|----------|-----------------|
| 20 | Does this extract universal availability logic? | Cross-template coupling |
| 21 | Does this create a generic temporal service? | Universal abstraction |
| 22 | Does this share scheduling logic across templates? | Framework emergence |
| 23 | Does this create a temporal DSL? | Metadata-driven logic |
| 24 | Does this abstract booking into generic entity? | Capability confusion |

**Current Status:**
- [x] Q20: No universal availability ✅
- [x] Q21: No generic temporal service ✅
- [x] Q22: No cross-template scheduling ✅
- [x] Q23: No temporal DSL ✅
- [x] Q24: No generic booking entity ✅

---

### Section 5: Operational Corruption

| # | Question | YES → Drift Risk |
|---|----------|-----------------|
| 25 | Does business logic affect occupancy? | Leakage |
| 26 | Does payment status affect availability? | Business→temporal leak |
| 27 | Does operational state affect temporal queries? | Query corruption |
| 28 | Does this create temporal event handlers? | Automation |
| 29 | Does time trigger business notifications? | Temporal→operational leak |

**Current Status:**
- [x] Q25: No business logic in occupancy ✅
- [x] Q26: No payment in availability ✅
- [x] Q27: No operational state in queries ✅
- [x] Q28: No temporal event handlers ✅
- [x] Q29: No time-triggered notifications ✅

---

### Section 6: Infrastructure Drift

| # | Question | YES → Drift Risk |
|---|----------|-----------------|
| 30 | Does this require Redis? | Cache infrastructure |
| 31 | Does this require Kafka? | Event bus |
| 32 | Does this require a message queue? | Queue infrastructure |
| 33 | Does this require background workers? | Worker infrastructure |
| 34 | Does this require distributed coordination? | Distributed system |

**Current Status:**
- [x] Q30: No Redis ✅
- [x] Q31: No Kafka ✅
- [x] Q32: No message queue ✅
- [x] Q33: No background workers ✅
- [x] Q34: No distributed coordination ✅

---

## SCORING

### Current Platform Score

| Section | Checks | Passes | Status |
|---------|--------|--------|--------|
| Slot Persistence | 5 | 5 | ✅ PASS |
| Temporal Automation | 7 | 7 | ✅ PASS |
| Scheduling Infrastructure | 7 | 7 | ✅ PASS |
| Abstraction Drift | 5 | 5 | ✅ PASS |
| Operational Corruption | 5 | 5 | ✅ PASS |
| Infrastructure Drift | 5 | 5 | ✅ PASS |
| **TOTAL** | **34** | **34** | **✅ PASS** |

### Interpretation

| Score | Status | Action |
|-------|--------|--------|
| 34/34 | ✅ CLEAN | No drift detected |
| 30-33 | ⚠️ MONITOR | Minor drift risk, investigate |
| 25-29 | 🔶 WARNING | Significant drift, STOP and review |
| < 25 | 🔴 CRITICAL | Severe drift, halt development |

**Current Status:** ✅ CLEAN (34/34)

---

## DRIFT RESPONSE PROTOCOL

### If ANY check fails:

1. **STOP** — Do not proceed with change
2. **Document** — Record drift risk in `docs/platform-memory/booking-research/`
3. **Evaluate** — Is this drift necessary?
4. **Mitigate** — Find safe alternative
5. **Escalate** — If necessary, request architectural review

### Template for Drisk Risk Documentation

```markdown
## Drift Risk Detected

**Date:** YYYY-MM-DD
**Check Failed:** #[number] — [description]
**Change:** [what was being added]
**Risk:** [what could go wrong]
**Alternative:** [safe alternative]
**Decision:** [proceed / stop / modify]
```

---

## PERIODIC REVIEW

### When to Re-run Checklist

- [ ] Before any booking-related feature
- [ ] Before any temporal logic change
- [ ] Before any new template creation
- [ ] Monthly (automated if possible)
- [ ] After any architectural discussion

### Review Responsibility

| Role | Responsibility |
|------|---------------|
| **Developer** | Run checklist before PR |
| **Reviewer** | Verify checklist in PR review |
| **Architect** | Review drift risks monthly |

---

## HISTORY

| Date | Score | Notes |
|------|-------|-------|
| 2026-05-23 | 34/34 | Initial baseline, all PASS |

---

**Version 1.0 — 2026-05-23**
