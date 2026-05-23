# SESSION BOOTSTRAP REQUIREMENTS

**Purpose:** Deterministic initialization for new isolated development sessions  
**Version:** 1.0  
**Date:** 2026-05-19  
**Applies to:** All new agent sessions, human developers, architectural reviews

---

## 1. MANDATORY READING ORDER (FIRST 60 MINUTES)

### 1.1 Session Phase 0 — Context Loading (Required Before Any Code)

**Read in EXACT order:**

| # | Document | Time | Why First |
|---|----------|------|-----------|
| 1 | `docs/canonical/CANONICAL_READING_ORDER.md` | 5 min | Navigation for navigation |
| 2 | `docs/ARCHITECTURAL_INVARIANTS.md` (Sections 1-2, 8-10) | 20 min | Non-negotiable laws |
| 3 | `docs/FOUNDATION_FREEZE_REVIEW.md` (Sections 1, 9-10) | 10 min | Current foundation state |
| 4 | `docs/EVENT_TAXONOMY.md` (Sections 1-3) | 10 min | Canonical event naming |
| 5 | `docs/canonical/CURRENT_PHASE.md` | 5 min | Current development phase |

**Total:** ~50 minutes

**DO NOT skip Phase 0.** Violations cause architectural drift.

### 1.2 Session Phase 1 — Context Deepening (Optional, As Needed)

**Read selectively based on task:**

| Task Type | Additional Reading |
|-----------|-------------------|
| Runtime development | `ARCHITECTURAL_INVARIANTS.md` Section 2 |
| Operational development | `ARCHITECTURAL_INVARIANTS.md` Section 3 |
| Event emission | `EVENT_TAXONOMY.md` Sections 4-6 |
| Booking Engine work | `BOOKING_TEMPORAL_SEMANTICS.md` (when created) |
| Dashboard changes | `docs/canonical/DASHBOARD_AGGREGATION.md` (when created) |
| Template development | `ARCHITECTURAL_INVARIANTS.md` Section 5 |

---

## 2. CURRENT PLATFORM PHASE

### 2.1 Active Phase: Capability Stabilization

**Phase Start:** 2026-05-19 (after Foundation Freeze Review)

**Characteristics:**
- ✅ Foundation stabilized (runtime/operational separation, events, customer layer)
- ✅ 2 templates implemented (lead-funnel, booking)
- ✅ Dashboard aggregation pattern stabilized (Capability Provider pattern)
- ⚠️ Booking temporal semantics NOT YET DEFINED (gap identified)
- ⚠️ Frontend not yet built (backend APIs ready)

**Current Focus:**
1. Booking temporal semantics definition
2. Frontend Mini App development
3. Capability emergence through repetition

**NOT Current Focus:**
- ❌ Plugin runtime (premature)
- ❌ SDK for external developers (contracts not stable)
- ❌ Marketplace infrastructure (no templates to sell)

### 2.2 Platform Maturity

| Area | Maturity | Scale |
|------|----------|-------|
| Core Architecture | ✅ Stable | Production-ready |
| Runtime Layer | ✅ Stable | 1000+ bots |
| Operational Layer | ✅ Stable | 100+ owners |
| Event Semantics | ✅ Stable | Canonical naming |
| Customer Layer | ✅ Stable | Template-agnostic |
| Booking Template | ✅ Implemented | Validating patterns |
| Dashboard Aggregation | ✅ Stabilized | Capability Provider pattern |
| Frontend | ❌ Not Built | Backend APIs ready |
| Plugin System | ❌ Postponed | After 10+ templates |
| SDK | ❌ Not Started | After 3-5 templates |

---

## 3. CURRENT ARCHITECTURAL RISKS

### 3.1 Active Risks (Must Monitor)

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Premature abstraction** | HIGH | "Abstract only proven repetition" discipline |
| **Ecosystem overengineering** | HIGH | Manual registration acceptable until 10+ templates |
| **Booking-centric drift** | MEDIUM | Keep scheduling logic template-internal |
| **Dashboard god-class growth** | LOW | Capability Provider pattern prevents |
| **Event naming drift** | LOW | Canonical taxonomy enforced |
| **Documentation drift** | MEDIUM | Lifecycle rules defined |

### 3.2 Known Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| Booking temporal semantics undefined | Blocks Booking Engine Foundation | HIGH |
| No frontend Mini App | Limits operational UX | HIGH |
| No test coverage | Regression risk | MEDIUM |
| No rate limiting | API abuse possible | LOW |

---

## 4. FORBIDDEN DIRECTIONS (Current Phase)

### 4.1 DO NOT Work On

| Topic | Why Forbidden | When Reconsidered |
|-------|---------------|-------------------|
| Plugin runtime system | Premature (2 templates, not 10+) | After 10+ templates |
| SDK for external developers | Contracts not stable | After 3-5 internal templates |
| Template marketplace | No templates to sell | After SDK stable |
| External analytics DB | PostgreSQL sufficient (< 1M events/day) | After 1M+ events/day |
| Queue system | Direct processing sufficient | After > 100 webhooks/sec |
| Microservices | Modular monolith scales well | After team growth |
| Visual workflow builder | No proven need | After 5+ workflow templates |
| No-code form builder | Wrong target audience | Never (platform is for developers) |

### 4.2 DO NOT Violate

| Invariant | Section | Consequence |
|-----------|---------|-------------|
| Runtime/Operational separation | ARCHITECTURAL_INVARIANTS.md Section 2 | Architecture degradation |
| Event naming laws | EVENT_TAXONOMY.md Section 3 | Analytics corruption |
| Template isolation | ARCHITECTURAL_INVARIANTS.md Section 2 | Template coupling |
| Metadata discipline | ARCHITECTURAL_INVARIANTS.md Section 4 | Framework complexity |
| Capability-neutral semantics | ARCHITECTURAL_INVARIANTS.md Section 1 | Platform identity loss |

---

## 5. DEVELOPMENT METHODOLOGY

### 5.1 Discussion-First Development

**BEFORE implementing:**
1. State the problem clearly
2. Identify if it's real or hypothetical
3. Check ARCHITECTURAL_INVARIANTS.md for relevant laws
4. Check FOUNDATION_FREEZE_REVIEW.md for known gaps
5. Propose approach
6. Wait for approval

**NOT allowed:**
- Implementing before discussion
- Assuming requirements
- Building speculative infrastructure

### 5.2 RFC-Before-Implementation

**Required for:**
- New architectural patterns
- Event taxonomy changes
- Module boundary changes
- Capability additions

**NOT required for:**
- Bug fixes
- Test additions
- Documentation improvements
- Refactoring within same module

### 5.3 Bounded Stabilization Tasks

**Task structure:**
1. Clear scope (single concern)
2. Defined completion criteria
3. Audit report on completion
4. Documentation update

**Examples:**
- TASK B1: Dashboard Aggregation Stabilization ✅
- TASK B2: Booking Temporal Semantics Definition ⏳
- TASK B3: Remove Dummy Templates ⏳

### 5.4 Freeze Reviews

**When required:**
- Before major capability work (Booking Engine)
- After significant stabilization
- When architectural drift suspected

**Output:**
- Foundation assessment
- Risk identification
- Recommended next steps

---

## 6. VOCABULARY ENFORCEMENT

### 6.1 Mandatory Terms

| Use This | NOT This |
|----------|----------|
| Runtime | Backend (ambiguous) |
| Operational Layer | Frontend (ambiguous) |
| Template | Plugin (implies runtime loading) |
| Capability | Feature (implies flags) |
| Interaction | Lead (template-specific) |
| Session | Funnel session (funnel-centric) |
| Flow | Funnel (funnel-centric) |
| Owner Module | Plugin module (wrong metaphor) |

### 6.2 Event Naming

| Canonical | Forbidden |
|-----------|-----------|
| `session.started` | `session:started` |
| `conversion.completed` | `conversion:achieved` |
| `customer.created` | `customer:created` |
| `booking.confirmed` | `booking:confirmed` |

---

## 7. CURRENT SAFE DIRECTIONS

### 7.1 SAFE to Work On

| Task | Risk | Priority |
|------|------|----------|
| Booking temporal semantics definition | LOW | HIGH |
| Frontend Mini App (React) | LOW | HIGH |
| Test coverage (critical paths) | LOW | MEDIUM |
| Booking Engine Foundation (after B2) | LOW | HIGH |
| CRM capability exploration | LOW | MEDIUM |
| Dashboard widget improvements | LOW | MEDIUM |

### 7.2 Why These Are Safe

- ✅ Follow established patterns
- ✅ Solve real problems
- ✅ Preserve invariants
- ✅ Within current maturity
- ✅ No premature abstraction

---

## 8. SESSION CHECKLIST

### 8.1 Start of Session

- [ ] Read CANONICAL_READING_ORDER.md
- [ ] Read ARCHITECTURAL_INVARIANTS.md Sections 1-2, 8-10
- [ ] Read FOUNDATION_FREEZE_REVIEW.md Sections 1, 9-10
- [ ] Read EVENT_TAXONOMY.md Sections 1-3
- [ ] Read CURRENT_PHASE.md
- [ ] Verify task is on SAFE list
- [ ] Check for relevant invariants
- [ ] Confirm no forbidden directions

### 8.2 Before Implementation

- [ ] Problem clearly stated
- [ ] Real vs hypothetical identified
- [ ] Invariants checked
- [ ] Approach discussed
- [ ] RFC created (if required)
- [ ] Approval received

### 8.3 After Implementation

- [ ] Tests added (if applicable)
- [ ] Documentation updated
- [ ] Audit report created (if significant)
- [ ] Commit message follows convention

---

## 9. ESCALATION PATH

### 9.1 When Unsure

1. **Stop** implementation
2. **Re-read** ARCHITECTURAL_INVARIANTS.md
3. **Check** FOUNDATION_FREEZE_REVIEW.md for gaps
4. **Ask** for architectural clarification
5. **Document** uncertainty

### 9.2 When Drift Detected

1. **Flag** the drift
2. **Reference** specific invariant
3. **Propose** correction
4. **Escalate** if needed
5. **Document** in ARCHITECTURE_DECISIONS_LOG.md

---

**These requirements are MANDATORY for all sessions.**

**Skipping Phase 0 reading = Architectural drift risk.**

---

**Version 1.0 — 2026-05-19**
