# Abstraction Emergence Philosophy

**Purpose:** Define when abstraction is justified  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0

---

## CORE PRINCIPLE

> **Repetition justifies abstraction.**

Abstraction before repetition is framework-building.
Abstraction after repetition is platform development.

---

## THE REPETITION LADDER

### One Instance

**Action:** Implement directly. No abstraction.

**Example:**
- Lead-funnel template implemented.
- `LeadFunnelService` created.
- `LeadFunnelQueryService` created.

**Why:** No pattern yet. Premature abstraction.

### Two Instances

**Action:** Watch for pattern. Do not abstract yet.

**Example:**
- Booking template implemented.
- `BookingRuntimeService` created.
- `BookingQueryService` created.
- Pattern emerging: runtime service + query service.

**Why:** Pattern visible but not proven. May be coincidence.

### Three Instances

**Action:** Abstract if clear duplication exists.

**Example:**
- CRM capability needed.
- Third template pattern confirmed.
- Common interface extracted: `DashboardCapabilityProvider`.
- Registry pattern: `DashboardCapabilityRegistry`.

**Why:** Proven repetition. Abstraction reduces duplication.

---

## ABSTRACTION JUSTIFICATION CRITERIA

### Criterion 1: Proven Repetition

**Justified:**
- 3+ templates with same pattern.
- Manual implementation in all 3.
- Clear duplication visible.

**Not Justified:**
- 1-2 templates.
- Hypothetical future templates.
- "This might be useful for 10 templates."

### Criterion 2: Duplication Elimination

**Justified:**
- Abstraction eliminates actual duplicated code.
- DRY violation is clear.
- Maintenance burden reduced.

**Not Justified:**
- Abstraction adds more code than it saves.
- Duplication is not clear.
- Maintenance burden increased.

### Criterion 3: Complexity Reduction

**Justified:**
- Abstraction is simpler than manual implementation.
- New template developers understand pattern quickly.
- Debugging is easier.

**Not Justified:**
- Abstraction is more complex.
- New template developers need explanation.
- Debugging is harder.

### Criterion 4: Universality Strength

**Justified:**
- Abstraction strengthens platform universality.
- Template-agnostic contracts.
- Capability-neutral semantics.

**Not Justified:**
- Abstraction introduces template coupling.
- Template-specific semantics.
- Capability-biased contracts.

### Criterion 5: Future-Proof

**Justified:**
- Abstraction will be used by 5+ future capabilities.
- Pattern is stable.
- Contracts are clear.

**Not Justified:**
- Abstraction may change with next template.
- Pattern is still evolving.
- Contracts are unclear.

---

## CURRENT JUSTIFIED ABSTRACTIONS

### Customer Entity

**Instances:** All templates use Customer.

**Abstraction:**
- `Customer` entity in `src/customer/entities/customer.entity.ts`.
- `CustomerService` in `src/customer/customer.service.ts`.
- Template-agnostic status, tags, profile.

**Justification:** Universal across all templates. No template-specific fields.

### Analytics Events

**Instances:** All templates emit events.

**Abstraction:**
- `AnalyticsEvent` entity.
- `AnalyticsService.trackEvent()`.
- Canonical event taxonomy (dot notation, past tense).

**Justification:** Universal across all templates. Generic event names.

### Ownership Verification

**Instances:** All owner endpoints verify ownership.

**Abstraction:**
- `BotOwnershipGuard`.
- `OwnershipVerificationService`.
- Applied to all `/miniapp/bots/:id/*` endpoints.

**Justification:** Universal security pattern. No endpoint-specific logic.

### Query-Service Pattern

**Instances:** `LeadFunnelQueryService`, `BookingQueryService`.

**Abstraction:**
- `DashboardCapabilityProvider` interface.
- `DashboardCapabilityRegistry`.
- Capability aggregation pattern.

**Justification:** 2+ query services with same read-only pattern.

### Template Interface

**Instances:** `LeadFunnelService`, `BookingRuntimeService`.

**Abstraction:**
- `TemplateService` interface.
- `TemplateHandler` interface.
- `TemplateFactory` dispatcher.

**Justification:** 2+ templates with same runtime pattern.

---

## NOT YET JUSTIFIED ABSTRACTIONS

### Universal Workflow Engine

**Instances:** 1-2 templates with conversation flows.

**Why Not Justified:**
- Pattern not stable.
- Templates have different flow semantics.
- Abstraction would be more complex.

### Plugin Runtime

**Instances:** 2 templates, manual registration.

**Why Not Justified:**
- 10+ templates needed for manual registration to be painful.
- SDK contracts not stable.
- Premature complexity.

### Generic Form Builder

**Instances:** 1 template (lead-funnel) with questions.

**Why Not Justified:**
- No repetition (1 instance).
- Templates have different question semantics.
- Premature no-code drift.

### Visual Workflow Designer

**Instances:** 0 templates need this.

**Why Not Justified:**
- No proven need.
- Wrong target audience.
- Massive complexity.

---

## INVARIANTS

> **Invariant E.1:** One instance = implement. No abstraction.

> **Invariant E.2:** Two instances = watch. Do not abstract yet.

> **Invariant E.3:** Three instances = abstract if criteria met.

> **Invariant E.4:** Abstraction must reduce complexity, not add it.

> **Invariant E.5:** Abstraction must strengthen universality, not weaken it.

> **Invariant E.6:** Abstraction must eliminate proven duplication, not hypothetical.

---

**Version 1.0 — 2026-05-23**
