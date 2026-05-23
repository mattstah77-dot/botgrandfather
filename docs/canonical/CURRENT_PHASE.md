# CURRENT PLATFORM PHASE

**Purpose:** Single source of truth for current development phase  
**Version:** 1.0  
**Date:** 2026-05-19  
**Replaces:** PROJECT_STATE_SNAPSHOT.md (partially obsolete)

---

## 1. ACTIVE PHASE

### Capability Stabilization

**Started:** 2026-05-19 (after Foundation Freeze Review)

**Preceded by:** Foundation Stabilization Phase (COMPLETE)

---

## 2. WHAT IS COMPLETE

### Foundation Stabilization ✅

| Area | Status | Evidence |
|------|--------|----------|
| Runtime/Operational Separation | ✅ STABLE | No cross-imports, clean boundaries |
| Customer Universality | ✅ STABLE | Template-agnostic, lifecycle events |
| Event Taxonomy | ✅ STABLE | Canonical naming (dot notation), lifecycle events |
| HTTP Surface | ✅ STABLE | Namespace separation (`/api/customer/*`, `/miniapp/*`) |
| Multi-Tenant Isolation | ✅ STABLE | Ownership verification, botId scoping |
| Dashboard Aggregation | ✅ STABLE | Capability Provider pattern (B1 complete) |
| Booking Template | ✅ IMPLEMENTED | Runtime, Query Service, Customer Mini App, Dashboard |

### Completed Tasks

| Task | Date | Outcome |
|------|------|---------|
| TASK 1: HTTP Surface Audit | 2026-05-17 | Namespace documented |
| TASK 2: API Namespace Migration | 2026-05-17 | `/api/customer/*` established |
| TASK 3: Runtime/Operational Audit | 2026-05-17 | Separation verified |
| TASK 4: Capability Architecture Audit | 2026-05-17 | Capability readiness confirmed |
| EVENT TAXONOMY RFC | 2026-05-19 | Canonical event naming |
| TASK 5: Event Semantics Stabilization | 2026-05-19 | Lifecycle events added |
| FOUNDATION FREEZE REVIEW | 2026-05-19 | 3 gaps identified |
| TASK B1: Dashboard Aggregation | 2026-05-19 | Capability Provider pattern |

---

## 3. ACTIVE WORK STREAMS

### High Priority

| Stream | Status | Blockers |
|--------|--------|----------|
| **B2: Booking Temporal Semantics** | ⏳ PENDING | None — can start now |
| **Frontend Mini App** | ⏳ READY | Backend APIs stable |
| **Booking Engine Foundation** | ⏳ BLOCKED | Requires B2 completion |

### Medium Priority

| Stream | Status | Notes |
|--------|--------|-------|
| Test Coverage | ⏳ READY | Critical paths first |
| CRM Capability Exploration | ⏳ READY | After Booking Engine stable |
| Dashboard Widget Improvements | ⏳ READY | As needed |

### Postponed (Explicit)

| Stream | When Reconsidered | Why Postponed |
|--------|-------------------|---------------|
| Plugin Runtime | After 10+ templates | Premature complexity |
| SDK for External Developers | After 3-5 internal templates | Contracts not stable |
| Template Marketplace | After SDK stable | No templates to sell |
| External Analytics DB | After 1M+ events/day | PostgreSQL sufficient |
| Queue System | After > 100 webhooks/sec | Direct processing fine |
| Microservices | After team growth | Monolith scales well |

---

## 4. KNOWN GAPS

### Critical Gaps (Must Close)

| Gap | Impact | Priority | Owner |
|-----|--------|----------|-------|
| **Booking temporal semantics undefined** | Blocks Booking Engine | HIGH | Platform Architect |
| **No frontend Mini App** | Limits operational UX | HIGH | Frontend |
| **No test coverage** | Regression risk | MEDIUM | Platform |

### Medium Gaps (Monitor)

| Gap | Impact | Priority |
|-----|--------|----------|
| No rate limiting | API abuse possible | LOW |
| No soft deletes | Compliance may require | LOW |
| Analytics at scale untested | 1M+ events/day unknown | LOW |

---

## 5. PLATFORM MATURITY

### Production-Ready For

| Capability | Scale | Confidence |
|------------|-------|------------|
| Bot Management | 1000+ bots | HIGH |
| Webhook Processing | High load | HIGH |
| Customer System | 1M+ customers | HIGH |
| Analytics | < 1M events/day | MEDIUM-HIGH |
| Mini App Auth | 100k+ users | HIGH |
| Ownership Verification | Multi-tenant | HIGH |
| Template System | Code-level (manual) | HIGH |
| Dashboard | < 100 bots/owner | MEDIUM-HIGH |

### NOT Production-Ready For

| Capability | Gap | When Ready |
|------------|-----|------------|
| 10,000+ owners | Rate limiting needed | After implementation |
| 10M+ events/month | External analytics DB | After 1M+ events/day |
| High-traffic webhooks | Queue system needed | After > 100/sec |
| External developers | SDK not stable | After 3-5 templates |
| Third-party templates | Plugin runtime not ready | After 10+ templates |
| Template marketplace | Infrastructure not ready | After SDK stable |

---

## 6. NEXT MILESTONES

### Immediate (This Week)

- [ ] B2: Booking Temporal Semantics defined
- [ ] Frontend Mini App started
- [ ] Test coverage plan created

### Short-Term (This Month)

- [ ] Booking Engine Foundation work begins
- [ ] Frontend Mini App MVP deployed
- [ ] Critical path tests implemented

### Medium-Term (Next Quarter)

- [ ] Booking Engine complete
- [ ] CRM capability explored
- [ ] Rate limiting implemented (if needed)

---

## 7. CURRENT RISKS

### Active Risks (Monitor)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Premature abstraction | HIGH | "Abstract only proven repetition" |
| Ecosystem overengineering | HIGH | Manual registration acceptable |
| Booking-centric drift | MEDIUM | Keep scheduling template-internal |
| Documentation drift | MEDIUM | Lifecycle rules enforced |

### Mitigated Risks (Resolved)

| Risk | Resolution |
|------|------------|
| Dashboard god-class growth | Capability Provider pattern (B1) |
| Event naming drift | Canonical taxonomy (TASK 5) |
| Runtime/Operational leakage | Separation verified (TASK 3) |
| Namespace collisions | Separation complete (TASK 2) |

---

## 8. SAFE DIRECTIONS

### SAFE to Work On

| Task | Why Safe |
|------|----------|
| Booking temporal semantics | Solves real gap, no abstraction |
| Frontend Mini App | Backend APIs stable |
| Test coverage | Quality improvement |
| Booking Engine (after B2) | Follows established patterns |
| CRM capability | Follows Booking pattern |
| Dashboard widgets | Capability Provider pattern |

### UNSAFE to Work On

| Task | Why Unsafe |
|------|------------|
| Plugin runtime | Premature (2 templates) |
| SDK for external developers | Contracts not stable |
| Template marketplace | No templates to sell |
| External analytics DB | PostgreSQL sufficient |
| Queue system | Direct processing fine |
| Microservices | Monolith scales well |

---

## 9. DOCUMENTATION STATUS

### Canonical (Authoritative)

- ✅ `ARCHITECTURAL_INVARIANTS.md` — Platform law
- ✅ `EVENT_TAXONOMY.md` — Event naming and contracts
- ✅ `FOUNDATION_FREEZE_REVIEW.md` — Foundation assessment
- ✅ `docs/canonical/SESSION_BOOTSTRAP_REQUIREMENTS.md` — Session initialization
- ✅ `docs/canonical/CANONICAL_READING_ORDER.md` — Reading sequence
- ✅ `docs/canonical/CURRENT_PHASE.md` — This document

### Partially Obsolete (Use with Caution)

- ⚠️ `PROJECT_STATE_SNAPSHOT.md` — Missing Booking, Event Taxonomy, Dashboard aggregation
- ⚠️ `BOTGRANDFATHER_PLATFORM_BLUEPRINT.md` — Pre-stabilization assumptions
- ⚠️ `NEW_AGENT_BOOTSTRAP_GUIDE.md` — Outdated reading order

### Historical (Reference Only)

- 📜 All `TASK_*_REPORT.md` files — Completed audit reports
- 📜 All `STABILIZATION_*_REPORT.md` files — Historical context
- 📜 `ARCHITECTURE_DECISIONS_LOG.md` — Decision history

### To Archive

- 🗑️ Speculative RFCs (Scheduling Engine without semantics)
- 🗑️ Duplicate reports (HTTP Surface duplicates)
- 🗑️ Obsolete validation protocols

---

## 10. VOCABULARY ENFORCEMENT

### Use These Terms

| Correct | Incorrect |
|---------|-----------|
| Runtime | Backend (ambiguous) |
| Operational Layer | Frontend (ambiguous) |
| Template | Plugin (implies runtime) |
| Capability | Feature (implies flags) |
| Interaction | Lead (template-specific) |
| `session.started` | `session:started` |
| `conversion.completed` | `conversion:achieved` |

---

**This document is the SINGLE SOURCE OF TRUTH for current platform phase.**

**Update when phase changes or major milestones completed.**

---

**Version 1.0 — 2026-05-19**
