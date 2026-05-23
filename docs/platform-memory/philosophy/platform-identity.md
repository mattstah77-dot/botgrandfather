# Platform Identity

**Purpose:** Define what BotGrandFather IS and IS NOT  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0

---

## WHAT BOTGRANDFATHER IS

### Platform-First

BotGrandFather is a **multi-tenant SaaS platform**, not a single-bot builder.

- Serves multiple owners simultaneously.
- Runtime infrastructure processes webhooks for all bots.
- Operational dashboard composes views across all owner bots.
- Templates are ecosystem components, not the platform identity.

### Ecosystem-Oriented

Designed for template extensibility via metadata and contracts, not runtime plugins.

- Templates register metadata in `OwnerModuleRegistry`.
- Operational UI composes from metadata.
- Future marketplace support requires SDK contracts first.
- No dynamic template loading yet.

### Metadata-Driven

Operational UI rendered from metadata, not hardcoded.

- Navigation composed from `OwnerModuleRegistry`.
- Settings driven by JSON schemas.
- Widgets defined by capability contracts.
- Business logic remains in code, not metadata.

### Operationally Composable

Universal layers compose across templates.

- Universal `Customer` entity works for all templates.
- Generic analytics events (`session.*`, `conversion.*`) work for all templates.
- Billing quotas based on capabilities, not templates.
- Operational views are template-agnostic.

### Template-Extensible

New templates register metadata, not runtime code modifications.

- Template business logic lives in `src/templates/xxx/`.
- Template registration is manual (code change).
- Template-specific data lives in template entities.
- Platform core remains template-agnostic.

### Runtime/Operational Separated

Runtime and operational layers are strictly separated.

- **Runtime:** webhook processing, template execution, customer lifecycle.
- **Operational:** owner dashboard, analytics views, settings management.
- Runtime NEVER depends on operational.
- Operational MAY read from runtime data.

### Universal-First

Core abstractions are template-agnostic.

- `Customer` entity is template-agnostic.
- `Owner` entity is template-agnostic.
- Analytics events are generic (`session.started`, `conversion.completed`).
- Plan limits are capability-based (`maxInteractionsPerMonth`).

---

## WHAT BOTGRANDFATHER IS NOT

### NOT a Funnel Builder

Lead-funnel is ONE template, not the platform identity.

- Platform does NOT assume funnel metaphor.
- Events are NOT `funnel.started`.
- Billing is NOT `maxLeadsPerMonth`.
- Dashboard does NOT show "Leads" as primary metric.

**Correct:** Dashboard shows "Interactions" (template-agnostic).

### NOT a CRM-Only Product

Customer is universal, not CRM-centric.

- Templates may have no CRM concept (e.g., AI assistant).
- CRM is ONE capability, not the core.
- Customer status (`new`, `active`, `converted`) is universal.

### NOT a No-Code Platform

Metadata is for operational UI, not business logic.

- No visual builder for templates.
- No drag-and-drop workflow engine.
- No universal form builder.
- Templates are code modules.

### NOT a Frontend-Driven System

Frontend renders metadata, does not define business logic.

- Frontend is READ-ONLY operational view.
- Frontend contains NO template-specific branching.
- Frontend is NOT the source of truth.
- Database is the source of truth.

### NOT a Plugin-Runtime Platform (Yet)

Templates are code changes, not dynamic loading.

- No npm package scanning.
- No sandboxed execution.
- No runtime module loading.
- Manual registration in `TemplateFactory`.

**Note:** This MAY change in future, but NOT NOW.

### NOT a Feature-First Architecture

Platform does NOT add features because "they might be useful."

- Every feature must serve platform universality.
- Features must NOT introduce template coupling.
- Abstraction requires PROVEN repetition.

---

## PLATFORM BOUNDARIES

### Inside Platform

- Multi-tenant bot management.
- Template runtime execution.
- Universal customer lifecycle.
- Generic analytics tracking.
- Operational dashboard composition.
- Capability-based billing quotas.

### Outside Platform (For Now)

- Dynamic template loading.
- External developer SDK.
- Template marketplace.
- Visual workflow builders.
- No-code form designers.
- Third-party plugin runtime.

### Future Possibilities (Postponed)

- Plugin runtime (after 10+ templates).
- SDK for external developers (after 3-5 internal templates).
- Template marketplace (after SDK stable).
- External analytics DB (after 1M+ events/day).

---

## IDENTITY INVARIANTS

> **Invariant 1.1:** BotGrandFather is a universal platform. No single template defines platform identity.

> **Invariant 1.2:** Platform semantics are capability-neutral. No template-specific terminology in core.

> **Invariant 1.3:** Metadata drives operational UI only. Business logic remains in code.

> **Invariant 1.4:** Runtime and operational layers are strictly separated. Runtime NEVER imports operational.

> **Invariant 1.5:** Templates are isolated. No cross-template imports. No template modifies core platform.

> **Invariant 1.6:** Abstraction requires proven repetition. One instance = implement. Two = watch. Three = abstract.

---

**Version 1.0 — 2026-05-23**
