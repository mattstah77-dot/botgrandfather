# CANONICAL READING ORDER

**Purpose:** Definitive reading sequence for new agents and developers  
**Version:** 1.0  
**Date:** 2026-05-19  
**Total Time:** ~2.5 hours (before coding)

---

## PHASE 0 — ESSENTIALS (60 MINUTES)

**READ BEFORE ANY CODE. NO EXCEPTIONS.**

### 0.1 Navigation (5 minutes)

**Document:** `docs/canonical/CANONICAL_READING_ORDER.md` (this document)

**Purpose:** Understand what to read and why.

**Key Takeaway:** Reading order prevents architectural drift.

---

### 0.2 Architectural Law (25 minutes)

**Document:** `docs/ARCHITECTURAL_INVARIANTS.md`

**Read Sections:**
- Section 1: Platform Identity (1.1, 1.2)
- Section 2: Runtime Philosophy (2.1, 2.2, 2.3)
- Section 8: Forbidden Directions (8.1)
- Section 10: Invariant Enforcement (10.1, 10.2)
- Appendix A: Event Philosophy Invariants (ALL)

**Skip On First Pass:**
- Sections 3-7 (operational details, read as needed)
- Section 9 (long-term vision, optional)

**Key Takeaways:**
- Runtime NEVER imports Mini App
- Templates are ISOLATED
- Metadata is TOOL, not GOAL
- Events are FACTS, not orchestration
- Abstract only PROVEN REPETITION

**Test Yourself:**
- Can you name 3 forbidden directions?
- Can you explain runtime/operational separation?
- Do you understand "abstract only proven repetition"?

---

### 0.3 Current Foundation State (15 minutes)

**Document:** `docs/FOUNDATION_FREEZE_REVIEW.md`

**Read Sections:**
- Executive Summary
- Section 1: Foundation Invariants Re-Validation (summary table)
- Section 9: Foundation Freeze Verdict
- Section 10: Final Recommendation

**Skip On First Pass:**
- Sections 2-8 (detailed analysis, read as needed)

**Key Takeaways:**
- Foundation is STABLE (runtime/operational, events, customer)
- 3 gaps identified (Dashboard aggregation, temporal semantics, dummy templates)
- B1 completed (Dashboard aggregation stabilized)
- B2 pending (Booking temporal semantics)
- Booking Engine can proceed AFTER B2

**Test Yourself:**
- What are the 3 identified gaps?
- What is the current verdict (Option A or B)?
- What must happen before Booking Engine?

---

### 0.4 Event Taxonomy (15 minutes)

**Document:** `docs/EVENT_TAXONOMY.md`

**Read Sections:**
- Canonical Event Naming Laws (ALL 5 laws)
- Canonical Event List (Runtime, Conversion, Customer, Booking)
- Event Payload Contract (Standard Structure, Rules)

**Skip On First Pass:**
- Legacy Events table (historical)
- Future Capability Events (reference only)

**Key Takeaways:**
- Dot notation ONLY (`booking.created`, NOT `booking:created`)
- Past tense for facts (`created`, NOT `create`)
- Domain-first naming (`customer.tag.added`)
- Events are FACTS, not commands
- Metadata is CONTEXT, not business logic

**Test Yourself:**
- What is the correct format: `booking.created` or `booking:created`?
- Is `createBooking` a valid event name?
- What belongs in metadata vs payload?

---

## PHASE 1 — CONTEXT DEEPENING (60 MINUTES)

**READ AFTER PHASE 0. REQUIRED BEFORE SIGNIFICANT WORK.**

### 1.1 Platform Reality (20 minutes)

**Document:** `docs/PROJECT_STATE_SNAPSHOT.md`

**Read Sections:**
- Section 1: Current Platform Stage
- Section 2: What Exists Right Now (2.1 summary)
- Section 5: Current Biggest Risks
- Section 7: Current Development Priorities

**Skip On First Pass:**
- Section 2.2 (detailed inventory, reference only)
- Section 6 (postponed systems, read as needed)
- Section 8 (anti-patterns, already in invariants)
- Section 9 (confidence matrix, reference only)

**Warning:** This document is PARTIALLY OBSOLETE (dated 2026-05-11).
- Booking template NOW IMPLEMENTED (document says "in progress")
- Event taxonomy NOW STABILIZED (document uses old naming)
- Dashboard aggregation NOW STABILIZED (document doesn't mention)

**Use For:** General platform maturity understanding, NOT current feature state.

---

### 1.2 Architectural Decisions History (20 minutes)

**Document:** `docs/ARCHITECTURE_DECISIONS_LOG.md`

**Read Sections:**
- Early decisions (runtime/operational separation)
- Customer universality decision
- Event generic naming decision
- Metadata discipline decision
- Template isolation decision

**Skip On First Pass:**
- Specific implementation decisions (reference only)
- Old debates already resolved

**Key Takeaways:**
- Why runtime/operational separation exists
- Why Customer is template-agnostic
- Why events are generic
- Why metadata is limited
- Why templates are isolated

**Test Yourself:**
- Why did we choose runtime/operational separation?
- Why is Customer template-agnostic?
- What problem did separation solve?

---

### 1.3 Current Phase (10 minutes)

**Document:** `docs/canonical/SESSION_BOOTSTRAP_REQUIREMENTS.md`

**Read Sections:**
- Section 2: Current Platform Phase
- Section 3: Current Architectural Risks
- Section 4: Forbidden Directions
- Section 7: Current Safe Directions

**Skip On First Pass:**
- Section 5 (methodology, read as needed)
- Section 6 (vocabulary, reference only)
- Section 8 (checklist, use at session start)

**Key Takeaways:**
- Current phase: Capability Stabilization
- 2 templates implemented
- Booking temporal semantics NOT YET DEFINED
- Frontend NOT YET BUILT
- Plugin system POSTPONED

---

### 1.4 Event Taxonomy Deep Dive (10 minutes)

**Document:** `docs/EVENT_TAXONOMY.md`

**Read Sections:**
- Event Ownership Matrix
- Analytics Event Semantics
- Anti-Pattern Detection
- Future Capability Simulation

**Skip On First Pass:**
- Already read in Phase 0

**Key Takeaways:**
- Who owns which events
- How events are used for analytics
- What anti-patterns to avoid
- How taxonomy scales

---

## PHASE 2 — TASK-SPECIFIC READING (AS NEEDED)

**READ BASED ON YOUR TASK TYPE.**

### 2.1 Runtime Development

**Additional Reading:**
- `ARCHITECTURAL_INVARIANTS.md` Section 2 (Runtime Philosophy)
- `docs/canonical/RUNTIME_PHILOSOPHY.md` (when created)
- `src/webhook/webhook.service.ts` (code)
- `src/templates/template.factory.ts` (code)

**Key Concepts:**
- Webhook processing pipeline
- Template dispatch
- Idempotency
- Customer lifecycle

---

### 2.2 Operational Development

**Additional Reading:**
- `ARCHITECTURAL_INVARIANTS.md` Section 3 (Operational Philosophy)
- `src/miniapp/services/dashboard.service.ts` (code)
- `src/dashboard/dashboard-capability.registry.ts` (code)

**Key Concepts:**
- Read-only aggregation
- Capability Provider pattern
- Metadata-driven UI
- No business logic in operational layer

---

### 2.3 Event Emission

**Additional Reading:**
- `EVENT_TAXONOMY.md` Sections 4-6 (Payload, Ownership, Analytics)
- `ARCHITECTURAL_INVARIANTS.md` Appendix A (Event Philosophy)

**Key Concepts:**
- Events as facts
- Synchronous-first
- No orchestration
- Metadata as context

---

### 2.4 Booking Engine Work

**Additional Reading:**
- `docs/canonical/BOOKING_TEMPORAL_SEMANTICS.md` (WHEN CREATED — REQUIRED)
- `FOUNDATION_FREEZE_REVIEW.md` Section 6 (Preconditions)
- `src/templates/booking/` (code structure)

**Key Concepts:**
- Timezone ownership
- Availability rules
- Resource allocation
- Booking lifecycle state machine

**WARNING:** Do NOT start Booking Engine work until `BOOKING_TEMPORAL_SEMANTICS.md` exists.

---

### 2.5 Dashboard Development

**Additional Reading:**
- `docs/canonical/DASHBOARD_AGGREGATION.md` (when created)
- `src/dashboard/interfaces/dashboard-capability-provider.interface.ts`
- `src/dashboard/dashboard-capability.registry.ts`

**Key Concepts:**
- Capability Provider pattern
- Explicit registration
- No god-class growth
- Read-only aggregation

---

### 2.6 Template Development

**Additional Reading:**
- `ARCHITECTURAL_INVARIANTS.md` Section 5 (Extensibility Philosophy)
- `src/templates/template.interface.ts` (code)
- `src/templates/lead-funnel/` (reference implementation)

**Key Concepts:**
- Template isolation
- Manual registration
- Metadata registration
- No cross-template imports

---

## PHASE 3 — HISTORICAL CONTEXT (OPTIONAL)

**READ FOR DEEPER UNDERSTANDING. NOT REQUIRED FOR CODING.**

### 3.1 Audit Reports

**Historical Context:**
- `TASK_1_HTTP_SURFACE_AUDIT_REPORT.md` — Namespace migration
- `TASK_3_RUNTIME_OPERATIONAL_SEPARATION_AUDIT_REPORT.md` — Separation verification
- `TASK_4_CAPABILITY_ARCHITECTURE_AUDIT_REPORT.md` — Capability readiness
- `TASK_5_EVENT_STABILIZATION_REPORT.md` — Event migration

**Why Read:** Understand reasoning behind current architecture.

**When:** After comfortable with current architecture.

---

### 3.2 Blueprint (Historical Reference)

**Document:** `docs/BOTGRANDFATHER_PLATFORM_BLUEPRINT.md`

**Status:** PARTIALLY OBSOLETE

**Read For:**
- Full system context (still valuable)
- Module responsibility explanations
- Flow diagrams

**Ignore:**
- Event naming (uses old colon notation)
- Module boundaries (some changed)
- Pre-stabilization assumptions

---

## READING ORDER SUMMARY

```
PHASE 0 — ESSENTIALS (60 min) — REQUIRED BEFORE ANY CODE
├── 0.1 CANONICAL_READING_ORDER.md (5 min)
├── 0.2 ARCHITECTURAL_INVARIANTS.md — Sections 1-2, 8-10, Appendix A (25 min)
├── 0.3 FOUNDATION_FREEZE_REVIEW.md — Executive, 1, 9-10 (15 min)
└── 0.4 EVENT_TAXONOMY.md — Naming Laws, Event List, Payload (15 min)

PHASE 1 — CONTEXT DEEPENING (60 min) — REQUIRED BEFORE SIGNIFICANT WORK
├── 1.1 PROJECT_STATE_SNAPSHOT.md — Sections 1, 2.1, 5, 7 (20 min)
├── 1.2 ARCHITECTURE_DECISIONS_LOG.md — Key decisions (20 min)
├── 1.3 SESSION_BOOTSTRAP_REQUIREMENTS.md — Sections 2-4, 7 (10 min)
└── 1.4 EVENT_TAXONOMY.md — Ownership, Analytics, Anti-Patterns (10 min)

PHASE 2 — TASK-SPECIFIC (AS NEEDED) — REQUIRED BASED ON TASK
├── 2.1 Runtime Development
├── 2.2 Operational Development
├── 2.3 Event Emission
├── 2.4 Booking Engine Work (requires BOOKING_TEMPORAL_SEMANTICS.md)
├── 2.5 Dashboard Development
└── 2.6 Template Development

PHASE 3 — HISTORICAL (OPTIONAL) — FOR DEEPER UNDERSTANDING
├── 3.1 Audit Reports
└── 3.2 Blueprint (ignore outdated parts)
```

---

## COMPLIANCE CHECKLIST

### Before First Code Commit

- [ ] Phase 0 complete (all 4 documents read)
- [ ] Can explain runtime/operational separation
- [ ] Can name 3 forbidden directions
- [ ] Can write canonical event names
- [ ] Understand "abstract only proven repetition"

### Before Significant Feature Work

- [ ] Phase 1 complete (all 4 documents read)
- [ ] Understand current platform phase
- [ ] Know current risks
- [ ] Task is on SAFE list
- [ ] Read task-specific Phase 2 documents

### Before Booking Engine Work

- [ ] ALL of Phase 0 and Phase 1 complete
- [ ] `BOOKING_TEMPORAL_SEMANTICS.md` read (when created)
- [ ] Foundation Freeze Review Section 6 understood
- [ ] Temporal semantics clear (timezone, availability, resources)

---

## ENFORCEMENT

**Skipping Phase 0 = Architectural drift risk.**

**Skipping Phase 1 = Context gaps likely.**

**Skipping Phase 2 (task-specific) = Implementation errors probable.**

**If unsure what to read:**
1. Check this document
2. Ask for clarification
3. Re-read ARCHITECTURAL_INVARIANTS.md

---

**Version 1.0 — 2026-05-19**
