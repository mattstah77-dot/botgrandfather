# Documentation Boundaries

**Purpose:** Define why and how platform memory stays clean, bounded, and canonical  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## WHY GIANT MEGA-DOCUMENTS ARE DANGEROUS

Large, unbounded documents create architectural risks that are subtle but severe.

### Context Soup

When a document tries to cover everything, it becomes unreadable. Developers scan instead of reading. Important invariants are buried between implementation details and historical anecdotes. The document becomes a "context soup" where authority is diluted and nothing is truly mandatory.

**Result:** Invariants are ignored because they cannot be found.

### Semantic Duplication

Mega-documents inevitably restate the same concept in multiple places with slight variations. Over time, these variations drift apart. A developer finds one version and implements it, while another finds a contradictory version elsewhere.

**Result:** Inconsistent implementation and architectural confusion.

### Invariant Drift

When invariants live in the same document as implementation plans, they become soft. "We'll update this section after the sprint" becomes "this isn't really a rule." Invariants must feel absolute. Co-location with mutable content weakens them.

**Result:** Invariants are treated as suggestions, not laws.

### Contradictory Guidance

A single large document accumulates guidance from different phases, different authors, and different contexts. Old safe directions sit next to new forbidden directions. Historical reasoning contradicts current policy.

**Result:** Developers cherry-pick the guidance that supports their preferred approach.

### Prompt-Oriented Architecture

When platform memory is shaped by conversation history rather than by explicit document design, it becomes a transcript of debates rather than a source of truth. Old arguments, rejected proposals, and transitional compromises become embedded as "architecture."

**Result:** The platform is architected by whoever spoke last, not by canonical law.

---

## DOCUMENTATION LAWS

### Law 1 — Documents MUST Have Bounded Scope

Every document covers exactly one concern.

| Document Type | Scope |
|---------------|-------|
| Invariant | One non-negotiable architectural law |
| Contract | One semantic agreement between components |
| Philosophy | One platform principle |
| State | One snapshot of current reality |
| Architecture | One layer or system description |
| Anti-pattern | One class of forbidden behavior |

**Forbidden:** A single document that covers "runtime separation, event semantics, and how to implement the booking template."

### Law 2 — Documents MUST Define One Concern Clearly

A reader should know within 30 seconds what the document is about and whether it applies to their current task.

**Good:** `invariants/runtime-operational-separation.md` — one boundary, one law.  
**Bad:** `docs/old/rfcs/combined-architecture-v3.md` — runtime, operational, events, templates, and future plans in one file.

### Law 3 — Invariants SHOULD Be Append-Only

Invariants are never removed. They may be supplemented by new invariants that clarify or narrow scope, but the original invariant remains valid.

**Why:** Removing an invariant creates ambiguity about whether the principle still applies. Append-only ensures historical continuity.

### Law 4 — Contracts SHOULD Remain Semantic

Contracts define what components agree on, not how they are implemented. They use abstract language, interfaces, and payload shapes. They do not contain file paths, library names, or framework choices.

**Good:** `interface DashboardCapabilityProvider { getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics>; }`  
**Bad:** `DashboardService calls BookingQueryService.getOwnerMetrics() using TypeORM repository pattern.`

### Law 5 — Historical Execution Context MUST NOT Pollute Canonical Laws

Execution prompts, implementation plans, task descriptions, and chat transcripts belong in historical records or temporary working documents. They MUST NOT be treated as canonical authority.

**Forbidden:** Treating an old RFC, a previous agent's task description, or a brainstorming session as architectural law.

**Correct:** Canonical documents are deliberately authored, reviewed, and placed in the hierarchy. Everything else is reference.

---

## DOCUMENT TYPE DISTINCTIONS

### Execution Prompts

**What:** Task descriptions given to developers or AI agents.  
**Authority:** None.  
**Lifecycle:** Temporary. Discarded after completion.  
**Example:** "Implement BookingQueryService with CapabilityProvider interface."

### Implementation Plans

**What:** Step-by-step technical plans for building a feature.  
**Authority:** None over canonical documents. Must comply with invariants.  
**Lifecycle:** Replaced by newer plans. Becomes historical.  
**Example:** "Booking Engine Foundation implementation plan (Week 1–2)."

### Canonical Memory

**What:** The deliberate, tiered documentation hierarchy in `docs/platform-memory/`.  
**Authority:** Tiered (1–5). Invariants absolute.  
**Lifecycle:** Append-only (invariants), versioned (contracts), replaced (state), updated (architecture), immutable (history).  
**Example:** `invariants/runtime-operational-separation.md`, `contracts/booking-temporal-semantics.md`.

### Invariant Documents

**What:** Non-negotiable architectural laws.  
**Authority:** Tier 1. Absolute.  
**Scope:** One invariant per document.  
**Example:** `invariants/capability-neutrality.md`

### Semantic Contracts

**What:** Formalized agreements between platform components.  
**Authority:** Tier 2. Prevails over state and architecture.  
**Scope:** One contract per document.  
**Example:** `contracts/event-contracts.md`

### Historical Records

**What:** Decision logs, old RFCs, reasoning documentation.  
**Authority:** Tier 5. Reference only. No override power.  
**Scope:** Explains why decisions were made.  
**Example:** `historical/decision-log.md`

---

## ANTI-PATTERN: DOCUMENT DRIFT

### Symptom 1 — Implementation Details in Contracts

Contracts should be semantic. If a contract mentions `TypeORM`, `NestJS`, or specific file paths, it has drifted from semantic to implementation-bound.

**Correction:** Remove implementation details. Keep interfaces and payload shapes.

### Symptom 2 — Invariants Hidden in Architecture Docs

If an invariant is stated only in `architecture/runtime-layer.md`, it is not a true invariant. Invariants deserve their own Tier 1 document.

**Correction:** Extract the invariant to `invariants/`. Reference it from architecture docs.

### Symptom 3 — Multiple Documents for Same Concern

If `invariants/metadata-discipline.md` and `philosophy/operational-composition.md` both define metadata boundaries with slight differences, semantic duplication exists.

**Correction:** One document owns the concern. The other references it.

### Symptom 4 — Old Plans Treated as Current Policy

If a developer references "the RFC from March" as justification for current behavior, the platform memory has failed to distinguish historical from canonical.

**Correction:** Update canonical documents. Move old plans to `historical/`. Educate that RFCs are not law.

---

## INVARIANTS

> **Invariant DB.1:** Documents have bounded scope. One concern per document.

> **Invariant DB.2:** Invariants are append-only. Never removed.

> **Invariant DB.3:** Contracts remain semantic. No implementation details.

> **Invariant DB.4:** Historical execution context must not pollute canonical laws.

> **Invariant DB.5:** Implementation plans and execution prompts have no canonical authority.

> **Invariant DB.6:** When documents conflict, the more focused and higher-tier document prevails.

---

**Version 1.0 — 2026-05-23**
