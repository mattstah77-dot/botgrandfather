# SESSION ENTRYPOINT

**Purpose:** Mandatory bootstrap for ALL future isolated development sessions  
**Status:** CANONICAL — Tier 1 Authority  
**Version:** 1.1  
**Date:** 2026-05-23

---

## MANDATORY COMPLIANCE

**You MUST read this document before any other platform document.**

**You MUST follow the prescribed reading order.**

**You MUST understand the authority hierarchy before interpreting any document.**

Failure to comply risks:
- Architectural drift
- Violation of platform invariants
- Reintroduction of fixed issues
- Premature abstraction
- Framework-building behavior

---

## WHAT IS BOTGRANDFATHER

BotGrandFather is a **multi-tenant Telegram business operations platform**.

It is NOT:
- a funnel builder
- a CRM product
- a no-code platform
- a chatbot framework
- a template marketplace (yet)

It IS:
- a platform for deploying and managing multiple Telegram bots
- a universal runtime for business conversation templates
- an operational dashboard for bot owners
- a metadata-driven operational composition system
- a capability-neutral extensible foundation

---

## AUTHORITY HIERARCHY

### Tier 1 — Immutable Platform Law

**Files:**
- `invariants/runtime-operational-separation.md`
- `invariants/capability-neutrality.md`
- `invariants/metadata-discipline.md`
- `invariants/template-isolation.md`
- `invariants/event-semantics.md`
- `invariants/multi-tenant-integrity.md`
- `invariants/sequencing-laws.md`

**Nature:** Non-negotiable. Append-only. Never removed.

**Override Authority:** None. These are absolute.

### Tier 2 — Canonical Semantic Contracts

**Files:**
- `contracts/event-contracts.md`
- `contracts/capability-contracts.md`
- `contracts/query-service-contracts.md`
- `contracts/dashboard-aggregation-contracts.md`

**Nature:** Versioned. Evolve through RFC process.

**Override Authority:** Tier 1 invariants always prevail.

### Tier 3 — Current Platform State

**Files:**
- `CURRENT_PLATFORM_STATE.md`
- `CURRENT_DEVELOPMENT_PHASE.md`

**Nature:** Replaced by newer assessments. Current snapshot only.

**Override Authority:** Tier 1 and Tier 2 always prevail.

### Tier 4 — Architecture Descriptions

**Files:**
- `architecture/runtime-layer.md`
- `architecture/operational-layer.md`
- `architecture/customer-layer.md`
- `architecture/template-system.md`
- `architecture/dashboard-system.md`
- `architecture/event-system.md`

**Nature:** Descriptive. Reflects current implementation.

**Override Authority:** Tier 1-3 always prevail.

### Tier 5 — Historical Context

**Files:**
- `historical/decision-log.md`
- `glossary/canonical-terminology.md`

**Nature:** Reference. Understand reasoning, not current authority.

**Override Authority:** None. Historical only.

---

## MANDATORY READING ORDER

### Phase 0 — Essential Alignment (45 minutes)

**Before writing any code. No exceptions.**

| # | Document | Time | Why |
|---|----------|------|-----|
| 1 | This document (`SESSION_ENTRYPOINT.md`) | 5 min | Authority hierarchy, bootstrap rules |
| 2 | `philosophy/platform-identity.md` | 10 min | What platform IS and IS NOT |
| 3 | `invariants/runtime-operational-separation.md` | 10 min | Core architectural law |
| 4 | `invariants/event-semantics.md` | 10 min | Event naming and semantics |
| 5 | `anti-patterns/forbidden-directions.md` | 10 min | What MUST NEVER happen |
| 6 | `philosophy/ecosystem-boundaries.md` | 10 min | Multi-capability coexistence law |
| 7 | `anti-patterns/ecosystem-drift.md` | 10 min | Forbidden future directions |

### Phase 1 — Context Deepening (30 minutes)

**Before significant feature work.**

| # | Document | Time | Why |
|---|----------|------|-----|
| 6 | `CURRENT_PLATFORM_STATE.md` | 10 min | Current maturity |
| 7 | `CURRENT_DEVELOPMENT_PHASE.md` | 10 min | Active work streams |
| 8 | `invariants/sequencing-laws.md` | 10 min | Evolution order |

### Phase 2 — Task-Specific Reading (As Needed)

**Before specific work types.**

| Task Type | Read |
|-----------|------|
| Runtime development | `architecture/runtime-layer.md`, `invariants/template-isolation.md` |
| Operational development | `architecture/operational-layer.md`, `contracts/dashboard-aggregation-contracts.md` |
| Event emission | `contracts/event-contracts.md` |
| Template development | `architecture/template-system.md`, `invariants/metadata-discipline.md` |
| Dashboard changes | `architecture/dashboard-system.md`, `contracts/capability-contracts.md`, `dashboard/dashboard-scalability-analysis.md` |
| Booking Engine | `CURRENT_DEVELOPMENT_PHASE.md` (Booking section), wait for temporal semantics doc |
| Multi-capability features | `philosophy/ecosystem-boundaries.md`, `operational/multi-capability-visibility.md` |
| Customer layer changes | `customer/customer-operational-philosophy.md` |
| Event system changes | `contracts/event-contracts.md`, `philosophy/operational-feed-philosophy.md` |
| Runtime reliability | `philosophy/runtime-reliability-philosophy.md`, `audits/runtime-failure-matrix.md` |
| Idempotency changes | `contracts/idempotency-contracts.md`, `audits/transaction-boundary-audit.md` |
| Concurrency concerns | `audits/concurrency-race-analysis.md` |
| Security review | `audits/operational-security-audit.md` |
| Production readiness | `audits/production-readiness-classification.md` |

### Phase 3 — Reference (As Needed)

| Document | When |
|----------|------|
| `glossary/canonical-terminology.md` | When terminology unclear |
| `historical/decision-log.md` | When reasoning behind decision needed |
| `evolution/ecosystem-direction.md` | When future direction unclear |
| `anti-patterns/drift-detection.md` | When drift suspected |

---

## SELF-VALIDATION CHECKLIST

### Before First Code Commit

- [ ] Phase 0 complete (all 5 documents read)
- [ ] Can explain runtime/operational separation in one sentence
- [ ] Can name 3 forbidden directions
- [ ] Can write canonical event names correctly
- [ ] Understand "abstract only proven repetition"
- [ ] Know current development phase
- [ ] Know what is safe vs unsafe to work on

### Before Significant Feature Work

- [ ] Phase 1 complete (all 3 documents read)
- [ ] Task is on safe direction list
- [ ] Relevant invariants reviewed
- [ ] Relevant contracts reviewed
- [ ] No forbidden directions violated

### When Uncertain

- [ ] Stop implementation
- [ ] Re-read relevant invariant
- [ ] Check `CURRENT_DEVELOPMENT_PHASE.md`
- [ ] Consult `anti-patterns/drift-detection.md`
- [ ] Ask for clarification if still uncertain

---

## CURRENT PLATFORM PHASE

**Phase:** Multi-Capability Operational Cohesion

**Preceded by:** Support Desk Implementation (COMPLETE)

**Foundation Status:**
- ✅ Runtime/Operational separation stable
- ✅ Customer universality stable
- ✅ Event taxonomy canonicalized
- ✅ Dashboard aggregation stabilized (Capability Provider pattern)
- ✅ 3 templates implemented (lead-funnel, booking, support)
- ✅ Capability isolation validated (6/6 boundaries PASS)
- ✅ Ecosystem boundaries defined (canonical law)
- ✅ Multi-capability visibility validated

**Active Work Streams:**
- ⏳ Booking temporal semantics definition (B2)
- ⏳ Frontend Mini App development
- ⏳ Booking Engine Foundation (BLOCKED until B2)

**Forbidden:**
- ❌ Plugin runtime
- ❌ SDK for external developers
- ❌ Template marketplace
- ❌ External analytics DB
- ❌ Queue system
- ❌ Microservices
- ❌ Cross-capability orchestration
- ❌ Workflow engines
- ❌ Event-driven automation
- ❌ Universal state machines
- ❌ Distributed locking systems
- ❌ Generic retry frameworks
- ❌ Circuit breakers
- ❌ Saga patterns
- ❌ CQRS
- ❌ Orchestration engines
- ❌ Complex monitoring infrastructure

**Safe:**
- ✅ Booking temporal semantics
- ✅ Frontend Mini App
- ✅ Test coverage
- ✅ Booking Engine (after B2)
- ✅ CRM capability exploration
- ✅ Operational composition (read-only)
- ✅ Customer profile views (parallel queries)

---

## DOCUMENT LIFECYCLE RULES

1. **Invariants** are append-only. Never removed.
2. **Contracts** evolve through explicit RFC process.
3. **State documents** are replaced, not updated in-place.
4. **Architecture descriptions** reflect current implementation.
5. **Historical documents** are immutable once written.

### When to Create New Document

- ✅ New invariant discovered
- ✅ New semantic contract formalized
- ✅ New development phase begins
- ❌ Temporary exploration
- ❌ Speculative future architecture
- ❌ Duplicate of existing document

---

## ESCALATION PATH

### When Architecture Unclear

1. Re-read relevant invariant
2. Check `CURRENT_DEVELOPMENT_PHASE.md`
3. Consult `anti-patterns/drift-detection.md`
4. Ask for clarification

### When Drift Detected

1. Flag the drift
2. Reference specific invariant
3. Propose correction
4. Document in decision log

### When Conflict Between Documents

1. Tier 1 invariants always prevail
2. Tier 2 contracts prevail over Tier 3-5
3. Current state prevails over historical
4. If still unclear: ask for clarification

---

## MOST DANGEROUS PLATFORM RISKS

The following are now considered **PRIMARY architectural threats**. Any proposal, code, or document that moves the platform in these directions MUST be rejected immediately.

### 1. Framework-Building Behavior

Building generic engines, universal builders, or pluggable runtimes before 3+ proven repetitions exist. This is the #1 drift vector.

**Red flags:** "universal workflow engine," "generic form builder," "pluggable calendar provider," "shared scheduling kernel."

### 2. Premature Abstraction

Abstracting at 1–2 instances instead of waiting for 3+ proven repetitions. Creates unmaintainable straitjackets and solves hypothetical problems.

**Red flags:** "Let's make this generic," "Let's create a base class," "Let's design a framework component."

### 3. Metadata-Driven Orchestration

Allowing metadata (JSON, YAML, DSL) to drive runtime business logic, scheduling decisions, workflow transitions, or state orchestration.

**Red flags:** `"conditions": [...], "transitions": [...]` in JSON, metadata-driven slot generation, declarative availability rules.

**Why dangerous:** Metadata-driven orchestration is accidental no-code engine construction. It makes business logic opaque, untestable, and creates framework behavior by stealth.

### 4. Scheduling Drift

Letting scheduling semantics (slots, availability, calendars, appointments) leak into platform core, quotas, events, or dashboard metrics.

**Red flags:** `maxBookingsPerMonth` in plan limits, `booking.completed` replacing `conversion.completed`, `getBookingCount()` in `BotService`, platform-wide calendar sync.

### 5. Capability Leakage

Any single template's terminology or semantics becoming platform-wide. The platform must remain capability-neutral.

**Red flags:** "Leads" as primary dashboard metric, funnel-specific event names, template-specific fields in universal entities.

### 6. Runtime/Operational Coupling

Runtime importing operational modules, or operational endpoints executing runtime business logic.

**Red flags:** `import { DashboardService } from '../miniapp/...'` in template services, dashboard endpoints calling `bookingRuntimeService.confirmBooking()`.

### 7. Template-Centric Platform Identity

Allowing one template to define what the platform IS. The platform is universal; no template is the platform.

**Red flags:** Platform marketed as "booking app," "lead funnel builder," or "CRM tool."

---

## MOST IMPORTANT REMINDERS

**BotGrandFather is a PLATFORM, not a FRAMEWORK.**

**Simplicity beats cleverness.**

**Repetition justifies abstraction. One = implement. Two = watch. Three = abstract.**

**Runtime and Operational are SEPARATE.**

**Templates are ISOLATED.**

**Metadata is a TOOL, not a GOAL.**

**Events are FACTS, not orchestration.**

**Abstract only PROVEN REPETITION.**

**Scheduling is a TEMPLATE CAPABILITY, not a PLATFORM CONCERN.**

**Slots are TEMPLATE PRIMITIVES, not PLATFORM PRIMITIVES.**

---

**This document is the SINGLE MANDATORY ENTRY POINT.**

**All future sessions MUST start here.**

**Version 1.0 — 2026-05-23**
