# Decision Log

**Purpose:** Historical reasoning behind architectural decisions  
**Status:** CANONICAL — Tier 5 Historical  
**Version:** 1.0

---

## DECISIONS

### D1: Runtime/Operational Separation

**Date:** Early development  
**Decision:** Strict separation between runtime and operational layers.

**Rationale:**
- Runtime must be stable and independent.
- Operational changes must not affect webhook processing.
- Enables independent scaling and testing.

**Status:** ✅ Validated. No violations detected.

---

### D2: Customer Universality

**Date:** Early development  
**Decision:** Customer entity is template-agnostic.

**Rationale:**
- All templates need customer tracking.
- Template-specific customer data goes in tags.
- Prevents template coupling in core.

**Status:** ✅ Validated. Works for lead-funnel and booking.

---

### D3: Event Generic Naming

**Date:** 2026-05-19  
**Decision:** Events use capability-neutral names (`session.started`, not `funnel.started`).

**Rationale:**
- Prevents template-centric platform identity.
- Enables universal analytics.
- Supports future templates without event changes.

**Status:** ✅ Validated. Migrated from colon to dot notation.

---

### D4: Metadata Discipline

**Date:** Early development  
**Decision:** Metadata drives UI only, not business logic.

**Rationale:**
- Prevents no-code drift.
- Keeps business logic in debuggable code.
- Metadata is tool, not goal.

**Status:** ✅ Validated. No metadata-driven logic exists.

---

### D5: Template Isolation

**Date:** Early development  
**Decision:** Templates are isolated, no cross-imports.

**Rationale:**
- Prevents template coupling.
- Enables independent template development.
- Supports future marketplace.

**Status:** ✅ Validated. No cross-template imports.

---

### D6: Manual Template Registration

**Date:** Early development  
**Decision:** Templates registered manually in TemplateFactory.

**Rationale:**
- Only 2 templates exist.
- Dynamic loading is premature complexity.
- Manual registration is explicit and debuggable.

**Status:** ✅ Validated. Will reconsider after 10+ templates.

---

### D7: Capability Provider Pattern

**Date:** 2026-05-19  
**Decision:** Dashboard aggregation uses Capability Provider pattern with registry.

**Rationale:**
- Prevents DashboardService god-class growth.
- Adding new capability requires zero DashboardService changes.
- Scales to any number of templates.

**Status:** ✅ Validated. Implemented for lead-funnel and booking.

---

### D8: Synchronous-First Events

**Date:** Early development  
**Decision:** Events are synchronous side effects, not async orchestration.

**Rationale:**
- Simpler mental model.
- No distributed system complexity.
- Events are facts, not commands.

**Status:** ✅ Validated. No async event handlers.

---

### D9: Monolith Over Distributed

**Date:** Early development  
**Decision:** Single NestJS application, no microservices.

**Rationale:**
- Current scale does not require distribution.
- Monolith is simpler to develop and deploy.
- Will reconsider when scale requires.

**Status:** ✅ Validated. No distribution needed.

---

### D10: Booking Temporal Semantics Postponed

**Date:** 2026-05-19  
**Decision:** Booking temporal semantics defined separately before Booking Engine work.

**Rationale:**
- Timezone laws, availability rules, resource allocation are complex.
- Must be documented before implementation.
- Prevents booking-centric drift.

**Status:** ⏳ Pending. B2 task.

---

**Version 1.0 — 2026-05-23**
