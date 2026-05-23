# CANONICAL READING ORDER

**Version:** 1.0  
**Date:** 2026-05-19  
**Purpose:** Deterministic session initialization for new agents  
**Audience:** AI agents joining isolated development sessions

---

## MANDATORY READING SEQUENCE

### Phase 1: Platform Identity (30 minutes)

**1. ARCHITECTURAL_INVARIANTS.md** (45 min)  
**Why first:** Non-negotiable laws before any design  
**Learn:** Forbidden directions, anti-patterns, runtime/operational separation  
**Critical:** These are LAW, not guidelines

**2. FOUNDATION_FREEZE_REVIEW.md** (20 min)  
**Why second:** Current architectural stability assessment  
**Learn:** What's fragile, what's stable, what gaps remain  
**Critical:** Understand readiness verdict (OPTION B)

### Phase 2: Current Reality (30 minutes)

**3. PROJECT_STATE_SNAPSHOT.md** (30 min)  
**Why third:** EXACT current maturity (not aspiration)  
**Learn:** What exists, what's stable, what's experimental, what's postponed  
**Critical:** Distinguish production-ready vs hypothesis

**4. TASK_5_EVENT_STABILIZATION_REPORT.md** (15 min)  
**Why fourth:** Event semantics just stabilized  
**Learn:** Canonical event naming, lifecycle events, migration map  
**Critical:** Event drift prevented

### Phase 3: Architecture Context (60 minutes)

**5. BOTGRANDFATHER_PLATFORM_BLUEPRINT.md** (60 min)  
**Why fifth:** Full system context after understanding rules  
**Learn:** Module boundaries, flows, responsibilities  
**Critical:** Connects philosophy to implementation

**6. EVENT_TAXONOMY.md** (20 min)  
**Why sixth:** Canonical event semantics  
**Learn:** Event naming laws, ownership matrix, payload contracts  
**Critical:** Platform event language

### Phase 4: Active Development (15 minutes)

**7. docs/canonical/sequencing/CURRENT_PHASE.md** (15 min)  
**Why seventh:** What we're working on NOW  
**Learn:** Current active tasks, forbidden directions, immediate priorities  
**Critical:** Avoid working on postponed complexity

---

## READING TIME TOTALS

| Phase | Documents | Total Time |
|-------|-----------|------------|
| Phase 1: Identity | 2 docs | 65 min |
| Phase 2: Reality | 2 docs | 45 min |
| Phase 3: Context | 2 docs | 80 min |
| Phase 4: Active | 1 doc | 15 min |
| **TOTAL** | **7 docs** | **~3.5 hours** |

---

## WHAT NOT TO READ (Obsolete/Deprecated)

**Skip These Documents:**
- `HTTP Surface Stabilization & Namespace Separation.md` → Superseded by TASK_1/TASK_2 reports
- `HTTP_SURFACE_STABILIZATION_REPORT.md` → Superseded by TASK_1/TASK_2 reports
- `STABILIZATION_SPRINT_REPORT.md` → Historical, read only if curious
- `STABILIZATION_SUMMARY.md` → Historical
- `DEPLOYMENT_FIXES_REPORT.md` → Historical, specific to Render deployment
- `HYBRID_PLATFORM_EXECUTION_REPORT.md` → Historical, customer MiniApp integration
- `OPERATIONAL_LAUNCH_AUDIT_REPORT.md` → Historical, pre-booking audit
- `MINIAPP_ARCHITECTURE.md` → Superseded by blueprint
- `OWNER_ARCHITECTURE.md` → Superseded by blueprint
- `PLATFORM_HARDENING_REPORT.md` → Historical
- `PLATFORM_LIFECYCLE_AUDIT_REPORT.md` → Historical

**Historical Interest Only:**
- `ARCHITECTURE_DECISIONS_LOG.md` → Read if you need decision history context
- `BOOKING_TEMPLATE_IMPLEMENTATION_COMPLETE.md` → Historical booking validation
- `BOOKING_TEMPLATE_IMPLEMENTATION_VALIDATION.md` → Historical booking validation
- `RFC 0 — BotGrandFather Platform Vision & Architectural Context.md` → Vision doc, not current reality
- `RFC — FOUNDATION COMPLETION PHASE.md` → Historical RFC

**Do NOT Read Before Coding:**
- All historical documents above
- They create context overload
- Focus on canonical docs first

---

## 7-QUESTION GATE (Print This)

**BEFORE ANY FEATURE, ANSWER:**

```
1. Does this preserve universality?       [✅ / ❌ / ❓]
2. Does this introduce template coupling? [✅ / ❌ / ❓]
3. Is abstraction justified by repetition? [✅ / ❌ / ❓]
4. Is this solving real repetition?       [✅ / ❌ / ❓]
5. Is this too early for maturity?        [✅ / ❌ / ❓]
6. Does this create framework complexity? [✅ / ❌ / ❓]
7. Does this preserve runtime/operational? [✅ / ❌ / ❓]

If ANY ❌ or ❓: STOP, consult ARCHITECTURAL_INVARIANTS.md
```

---

## RED FLAGS (Memorize)

```
🚩 "Universal workflow engine"
🚩 "Dynamic schema runtime"
🚩 "Plugin marketplace now"
🚩 "Generic everything"
🚩 "Template-aware frontend"
🚩 "Metadata-driven runtime"
🚩 "Feature-first development"
🚩 "Abstraction-first thinking"
🚩 "SDK now"
🚩 "No-code ambitions"
```

---

## CURRENT PHASE SUMMARY

**Phase:** Booking Foundation Stabilization  
**Status:** OPTION B — Additional stabilization required before Booking Engine  
**Active Tasks:**
- B1: Dashboard Aggregation Stabilization ✅ COMPLETE
- B2: Booking Temporal Semantics (pending)
- B3: Remove Dummy Templates (pending)

**Forbidden Directions:**
- Plugin runtime system
- SDK for external developers
- Template marketplace
- External analytics DB
- Queue system
- Microservices

**Safe to Work On:**
- Booking temporal semantics
- Booking template implementation
- Dashboard capability providers
- Test coverage for critical paths
- Frontend Mini App (React)

---

## VOCABULARY CHECKLIST

**✅ Use These Terms:**
- Runtime
- Operational Layer
- Template
- Capability
- Interaction
- Session
- Flow
- Owner Module
- Operational Composition
- Generic Rendering

**❌ Never Use These Terms:**
- Funnel builder
- Leads metric
- Funnels quota
- Template-specific dashboard
- Feature flags (for capabilities)
- Plugin system now
- SDK now

---

**END OF CANONICAL READING ORDER**

**This document is the entry point for all new agent sessions.  
Read documents in order. Do not skip. Do not read obsolete docs first.**
