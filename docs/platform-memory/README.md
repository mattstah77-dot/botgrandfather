# Platform Memory Layer

**Purpose:** Canonical architectural memory of BotGrandFather  
**Status:** SINGLE SOURCE OF TRUTH  
**Version:** 1.0  
**Date:** 2026-05-23

---

## WHAT THIS DIRECTORY IS

This directory contains the **canonical architectural memory** of BotGrandFather.

It is NOT:
- a documentation framework
- a knowledge graph
- a recursive documentation system
- a corporate documentation theater

It IS:
- the architectural constitution of the platform
- the semantic source of truth
- the invariant system
- the anti-drift protection layer
- the deterministic entry point for all future development

---

## STRUCTURE

```
docs/platform-memory/
├── README.md                          ← This file
├── SESSION_ENTRYPOINT.md              ← MANDATORY first read
├── CANONICAL_INDEX.md                 ← Navigation index
├── ARCHITECTURE_AUTHORITY.md          ← Source-of-truth hierarchy
├── CURRENT_PLATFORM_STATE.md          ← Current maturity
├── CURRENT_DEVELOPMENT_PHASE.md       ← Active phase
│
├── philosophy/                        ← Platform philosophy
│   ├── platform-identity.md           ← What platform IS and IS NOT
│   ├── anti-overengineering.md        ← Anti-framework philosophy
│   ├── abstraction-emergence.md       ← When to abstract
│   └── operational-composition.md     ← Metadata philosophy
│
├── invariants/                        ← Immutable platform law
│   ├── runtime-operational-separation.md
│   ├── capability-neutrality.md
│   ├── metadata-discipline.md
│   ├── template-isolation.md
│   ├── event-semantics.md
│   ├── multi-tenant-integrity.md
│   └── sequencing-laws.md
│
├── contracts/                         ← Canonical semantic contracts
│   ├── event-contracts.md
│   ├── capability-contracts.md
│   ├── query-service-contracts.md
│   └── dashboard-aggregation-contracts.md
│
├── architecture/                      ← Architecture descriptions
│   ├── runtime-layer.md
│   ├── operational-layer.md
│   ├── customer-layer.md
│   ├── template-system.md
│   ├── dashboard-system.md
│   └── event-system.md
│
├── sequencing/                        ← Evolution sequencing
│   ├── evolution-order.md
│   └── capability-emergence.md
│
├── evolution/                         ← Ecosystem direction
│   ├── ecosystem-direction.md
│   └── postponed-complexity.md
│
├── anti-patterns/                     ← Forbidden directions
│   ├── forbidden-directions.md
│   ├── drift-detection.md
│   └── premature-abstraction.md
│
├── glossary/                          ← Canonical terminology
│   └── canonical-terminology.md
│
└── historical/                        ← Decision history
    └── decision-log.md
```

---

## HOW TO USE THIS DIRECTORY

### New Session Bootstrap

1. Start with `SESSION_ENTRYPOINT.md`
2. Follow prescribed reading order
3. Validate understanding with self-checklist
4. Proceed to task-specific reading

### During Development

1. Reference relevant invariant before implementation
2. Check `CURRENT_DEVELOPMENT_PHASE.md` for active streams
3. Consult `anti-patterns/` when drift suspected
4. Use `glossary/` for terminology clarity

### When Conflicts Arise

1. Consult `ARCHITECTURE_AUTHORITY.md` for hierarchy
2. Tier 1 invariants always prevail
3. Document conflict in `historical/decision-log.md`

---

## DOCUMENT LIFECYCLE

| Tier | Type | Can Evolve? | How |
|------|------|-------------|-----|
| 1 | Invariants | Append-only | Add new invariants |
| 2 | Contracts | Versioned | RFC process |
| 3 | State | Replaced | New assessment |
| 4 | Architecture | Updated | Reflects implementation |
| 5 | Historical | Immutable | Write once |

---

## ENFORCEMENT

**This directory is the ONLY trusted entry point.**

**Old documents outside this directory are NOT canonical.**

**Documents in `docs/archive/` are historical only.**

**When in doubt: consult `SESSION_ENTRYPOINT.md`.**

---

**Version 1.0 — 2026-05-23**
