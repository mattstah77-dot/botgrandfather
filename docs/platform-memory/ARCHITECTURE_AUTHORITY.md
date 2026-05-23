# ARCHITECTURE AUTHORITY

**Purpose:** Explicit source-of-truth hierarchy for platform memory  
**Status:** CANONICAL — Tier 1 Reference  
**Version:** 1.0

---

## AUTHORITY TIERS

### Tier 1 — Immutable Platform Law

**Nature:** Non-negotiable architectural invariants.

**Characteristics:**
- Append-only. Never removed.
- Override all other tiers.
- Written in declarative, timeless language.
- Implementation-neutral.

**Documents:**
- `invariants/runtime-operational-separation.md`
- `invariants/capability-neutrality.md`
- `invariants/metadata-discipline.md`
- `invariants/template-isolation.md`
- `invariants/event-semantics.md`
- `invariants/multi-tenant-integrity.md`
- `invariants/sequencing-laws.md`

**When in conflict:** Tier 1 always prevails.

**Evolution:** New invariants may be added. Existing invariants are never removed.

---

### Tier 2 — Canonical Semantic Contracts

**Nature:** Formalized semantic agreements.

**Characteristics:**
- Versioned (e.g., v1.0, v1.1).
- Evolve through explicit RFC process.
- Define naming, payload, boundary contracts.
- Implementation reflects contract, contract does not reflect implementation.

**Documents:**
- `contracts/event-contracts.md`
- `contracts/capability-contracts.md`
- `contracts/query-service-contracts.md`
- `contracts/dashboard-aggregation-contracts.md`

**When in conflict:** Tier 1 prevails. Tier 2 prevails over Tier 3-5.

**Evolution:** RFC → Approval → Version bump → Documentation update.

---

### Tier 3 — Current Platform State

**Nature:** Snapshot of current reality.

**Characteristics:**
- Replaced by newer assessments, not updated in-place.
- Describes current maturity, active work, known gaps.
- May reference implementation details.
- Becomes historical when replaced.

**Documents:**
- `CURRENT_PLATFORM_STATE.md`
- `CURRENT_DEVELOPMENT_PHASE.md`

**When in conflict:** Tier 1-2 always prevail. Current state describes reality, not law.

**Evolution:** New assessment replaces old. Old becomes historical.

---

### Tier 4 — Architecture Descriptions

**Nature:** Descriptive documentation of current implementation.

**Characteristics:**
- Reflects current code structure.
- Describes how invariants are implemented.
- May change as implementation evolves.
- Does not define new invariants.

**Documents:**
- `architecture/runtime-layer.md`
- `architecture/operational-layer.md`
- `architecture/customer-layer.md`
- `architecture/template-system.md`
- `architecture/dashboard-system.md`
- `architecture/event-system.md`

**When in conflict:** Tier 1-3 always prevail. Architecture describes, does not prescribe.

**Evolution:** Updated as implementation changes.

---

### Tier 5 — Historical Context

**Nature:** Reference material for reasoning and terminology.

**Characteristics:**
- Immutable once written.
- Explains why decisions were made.
- Provides terminology definitions.
- Not authoritative for current development.

**Documents:**
- `historical/decision-log.md`
- `glossary/canonical-terminology.md`

**When in conflict:** No authority. Reference only.

**Evolution:** Append-only. New decisions added.

---

## CONFLICT RESOLUTION

### Rule 1: Tier Precedence

Lower tier number always prevails over higher tier number.

```
Tier 1 > Tier 2 > Tier 3 > Tier 4 > Tier 5
```

### Rule 2: Within-Tier Precedence

If documents within same tier conflict:

1. More recent document prevails over older (for Tier 3-4).
2. More specific document prevails over general (for Tier 2).
3. If still unclear: escalate to platform maintainers.

### Rule 3: Explicit Override

If a document explicitly states it overrides another:

1. Check if override is within same tier.
2. If cross-tier: override is invalid (lower tier always prevails).
3. Document invalid override in decision log.

---

## DOCUMENT LIFECYCLE

### Creation

| Tier | How Created | Approval Required |
|------|-------------|-------------------|
| 1 | Invariant discovered during development | Platform maintainer |
| 2 | RFC process | Platform maintainer |
| 3 | Assessment completed | Any senior developer |
| 4 | Implementation stabilized | Any developer |
| 5 | Decision made | Any developer |

### Evolution

| Tier | How Evolves | Old Version |
|------|-------------|-------------|
| 1 | New invariant appended | Remains valid |
| 2 | New version approved | Becomes historical |
| 3 | New assessment replaces | Becomes historical |
| 4 | Updated to reflect code | Previous version discarded |
| 5 | New entry appended | All entries preserved |

### Obsolescence

| Tier | Can Become Obsolete? | Action |
|------|----------------------|--------|
| 1 | Never | N/A |
| 2 | Yes (replaced by new version) | Mark version obsolete |
| 3 | Yes (replaced by new assessment) | Move to historical |
| 4 | Yes (implementation changes) | Update document |
| 5 | Never | N/A |

---

## VALIDATION

### For New Documents

Before adding document to platform memory:

1. Determine correct tier.
2. Verify no existing document covers same content.
3. Ensure authority hierarchy respected.
4. Update CANONICAL_INDEX.md.

### For Document Changes

Before modifying existing document:

1. Check tier. Tier 1-2 require explicit approval.
2. Verify change does not violate higher tier.
3. Update version if Tier 2.
4. Document rationale in decision log.

---

**Version 1.0 — 2026-05-23**
