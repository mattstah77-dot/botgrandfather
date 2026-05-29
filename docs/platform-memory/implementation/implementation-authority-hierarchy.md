# Implementation Authority Hierarchy

**Purpose:** Define which documents are authoritative during coding  
**Status:** CANONICAL — Tier 1 Implementation Governance  
**Version:** 1.0  
**Unit:** Booking Implementation Transition  
**Date:** 2026-05-23

---

## CORE PRINCIPLE

> **During implementation, documentation is not advice. It is constraint.**

When code conflicts with documentation, code is wrong.
When documentation conflicts with documentation, Tier wins.

---

## TIER A — ABSOLUTE CONSTRAINTS

### Documents in This Tier

| Document | Constraint Type |
|----------|-----------------|
| `invariants/runtime-operational-separation.md` | Architecture boundary |
| `invariants/capability-neutrality.md` | Platform identity |
| `invariants/template-isolation.md` | Template boundary |
| `invariants/metadata-discipline.md` | Metadata boundary |
| `invariants/event-semantics.md` | Event naming |
| `invariants/multi-tenant-integrity.md` | Security boundary |
| `philosophy/platform-identity.md` | What platform IS/IS NOT |
| `philosophy/anti-overengineering.md` | Anti-framework law |
| `philosophy/abstraction-emergence.md` | Repetition ladder |
| `contracts/runtime-isolation-reinforcement.md` | Runtime isolation |
| `contracts/projection-authority-boundaries.md` | Projection hierarchy |

### Authority Level

**VIOLATION = ARCHITECTURAL FAILURE**

If implementation violates Tier A:
- Implementation must be rewritten.
- No exceptions.
- No "but it works."
- No "it's just this one case."

### Examples

```typescript
// ❌ TIER A VIOLATION: Runtime imports operational
import { DashboardService } from '../miniapp/services/dashboard.service';
// This breaks runtime-operational separation.
// MUST be rewritten.

// ❌ TIER A VIOLATION: Cross-template import
import { LeadFunnelService } from '../lead-funnel/lead-funnel.service';
// This breaks template isolation.
// MUST be rewritten.
```

---

## TIER B — SEMANTIC CONTRACTS

### Documents in This Tier

| Document | Constraint Type |
|----------|-----------------|
| `contracts/temporal-truth-contracts.md` | Temporal semantics |
| `contracts/occupancy-contracts.md` | Occupancy semantics |
| `contracts/computation-contracts.md` | Computation semantics |
| `contracts/write-time-validation-contracts.md` | Validation timing |
| `contracts/stale-projection-semantics.md` | Projection staleness |
| `contracts/actor-semantics-contract.md` | Actor boundaries |
| `contracts/slot-reality-contract.md` | Slot semantics |
| `contracts/booking-temporal-semantics.md` | Booking temporal |
| `contracts/projection-ownership-semantics.md` | Projection ownership |
| `contracts/projection-isolation-rules.md` | Projection isolation |
| `contracts/dashboard-consumption-contract.md` | Dashboard semantics |
| `contracts/surface-taxonomy-contracts.md` | Surface taxonomy |
| `contracts/runtime-modality-contracts.md` | Runtime modality |
| `contracts/chat-miniapp-boundaries.md` | Surface boundaries |

### Authority Level

**VIOLATION = SEMANTIC CORRUPTION**

If implementation violates Tier B:
- Implementation must be corrected.
- Semantic drift is worse than bugs.
- Bugs can be fixed. Semantic drift becomes architecture.

### Examples

```typescript
// ❌ TIER B VIOLATION: Projection used for validation
async canBookSlot(botId: string, slot: string): Promise<boolean> {
  const projection = await this.slotProjection.get(botId, slot);
  return projection.available;  // VIOLATION: Projection is not authority
}

// ✅ CORRECT: Validate against truth
async canBookSlot(botId: string, slot: string): Promise<boolean> {
  const existing = await this.bookingRepository.findOne({
    where: { botId, timeSlot: slot, status: In(['pending', 'confirmed']) }
  });
  return !existing;  // Truth is authority
}
```

---

## TIER C — IMPLEMENTATION GUIDANCE

### Documents in This Tier

| Document | Guidance Type |
|----------|---------------|
| `audits/booking-concurrency-audit.md` | Concurrency scenarios |
| `audits/aggregation-pressure-validation.md` | Aggregation safety |
| `audits/operational-gravity-revalidation.md` | Drift containment |
| `audits/infrastructure-drift-containment.md` | Infrastructure safety |
| `audits/runtime-reality-audit.md` | Runtime validation |
| `audits/surface-interaction-audit.md` | Surface safety |
| `audits/booking-temporal-audit.md` | Temporal audit |
| `CURRENT_PLATFORM_STATE.md` | Current maturity |
| `CURRENT_DEVELOPMENT_PHASE.md` | Active work streams |

### Authority Level

**USEFUL FOR DECISIONS. NOT ABSOLUTE LAW.**

Audits inform implementation choices.
Audits do not override Tier A or Tier B.

If audit suggests one approach and Tier B contract requires another:
- **Tier B wins.**
- Audit is advisory.

### Examples

```typescript
// Audit says: "Consider cache for slot queries"
// Tier B says: "Projections are ephemeral, no caching"
// 
// ✅ CORRECT: Tier B wins
async getSlots(botId: string, date: string) {
  return this.computeSlots(botId, date);  // No cache
}
```

---

## TIER D — HISTORICAL RESEARCH

### Documents in This Tier

| Document | Type |
|----------|------|
| `historical/decision-log.md` | Decision history |
| `glossary/canonical-terminology.md` | Terminology |
| `governance/*` | Governance docs |

### Authority Level

**NEVER AUTHORITATIVE.**

Historical docs explain why decisions were made.
They do not constrain current implementation.

If historical doc conflicts with Tier A:
- **Tier A wins.**
- History is context, not law.

---

## CONFLICT RESOLUTION

### Hierarchy

```
TIER A > TIER B > TIER C > TIER D
```

### When Implementation Conflicts With...

| Conflicts With | Resolution |
|----------------|------------|
| **Audit** | Contract wins. Audit is advisory. |
| **Report** | Invariant wins. Report is informational. |
| **Assumption** | Philosophy wins. Assumptions are not canonical. |
| **Historical doc** | Current contract wins. History is not law. |
| **Another contract** | Higher tier wins. Same tier: more specific wins. |

### Specificity Rule

When two documents at same tier conflict:
- More specific document wins.
- `booking-temporal-semantics.md` > `temporal-truth-contracts.md` for booking code.
- `slot-reality-contract.md` > `computation-contracts.md` for slot code.

---

## IMPLEMENTATION CHECKLIST

Before committing code:

- [ ] No Tier A violations?
- [ ] No Tier B violations?
- [ ] Tier C guidance considered (not blindly followed)?
- [ ] Tier D used for context only?
- [ ] Conflicts resolved by hierarchy?

---

## CANONICAL RULES

### Rule 1: Tier A Is Absolute

No exceptions. No justification. Violation = rewrite.

### Rule 2: Tier B Is Semantic Law

Semantic corruption is worse than bugs. Violation = correction.

### Rule 3: Tier C Is Advisory

Useful for decisions. Overridden by Tier A/B.

### Rule 4: Tier D Is Context

Never authoritative. Historical reference only.

### Rule 5: Specificity Wins at Same Tier

More specific contract overrides general contract.

### Rule 6: When in Doubt, Stop

If authority is unclear, stop implementation. Resolve before continuing.

---

**Version 1.0 — Booking Implementation Transition — 2026-05-23**
