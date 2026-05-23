# CANONICAL INDEX

**Purpose:** Navigation index for platform memory layer  
**Status:** CANONICAL — Tier 3 Reference  
**Version:** 1.0

---

## BY PURPOSE

### I Need to Understand Platform Philosophy

| Document | What You'll Learn |
|----------|-------------------|
| `philosophy/platform-identity.md` | What BotGrandFather IS and IS NOT |
| `philosophy/anti-overengineering.md` | Why we reject framework-building |
| `philosophy/abstraction-emergence.md` | When abstraction is justified |
| `philosophy/operational-composition.md` | Metadata philosophy |

### I Need to Know Platform Laws

| Document | What You'll Learn |
|----------|-------------------|
| `invariants/runtime-operational-separation.md` | Core architectural boundary |
| `invariants/capability-neutrality.md` | Platform must not be template-centric |
| `invariants/metadata-discipline.md` | Metadata boundaries |
| `invariants/template-isolation.md` | Template boundaries |
| `invariants/event-semantics.md` | Event naming and semantics |
| `invariants/multi-tenant-integrity.md` | Tenant isolation |
| `invariants/sequencing-laws.md` | Evolution order |

### I Need to Know Current State

| Document | What You'll Learn |
|----------|-------------------|
| `CURRENT_PLATFORM_STATE.md` | Current maturity |
| `CURRENT_DEVELOPMENT_PHASE.md` | Active work streams |

### I Need to Implement Something

| Task Type | Read |
|-----------|------|
| Runtime feature | `architecture/runtime-layer.md`, `invariants/template-isolation.md` |
| Operational feature | `architecture/operational-layer.md`, `contracts/dashboard-aggregation-contracts.md` |
| Event emission | `contracts/event-contracts.md` |
| New template | `architecture/template-system.md`, `invariants/metadata-discipline.md` |
| Dashboard changes | `architecture/dashboard-system.md`, `contracts/capability-contracts.md` |
| Booking Engine | `CURRENT_DEVELOPMENT_PHASE.md`, wait for temporal semantics |

### I Need to Avoid Mistakes

| Document | What You'll Learn |
|----------|-------------------|
| `anti-patterns/forbidden-directions.md` | What MUST NEVER happen |
| `anti-patterns/drift-detection.md` | How to detect drift |
| `anti-patterns/premature-abstraction.md` | Abstraction anti-patterns |

### I Need Terminology Clarity

| Document | What You'll Learn |
|----------|-------------------|
| `glossary/canonical-terminology.md` | Exact meanings of all terms |

### I Need Historical Context

| Document | What You'll Learn |
|----------|-------------------|
| `historical/decision-log.md` | Why decisions were made |

---

## BY TIER

### Tier 1 — Immutable Platform Law

- `invariants/runtime-operational-separation.md`
- `invariants/capability-neutrality.md`
- `invariants/metadata-discipline.md`
- `invariants/template-isolation.md`
- `invariants/event-semantics.md`
- `invariants/multi-tenant-integrity.md`
- `invariants/sequencing-laws.md`

### Tier 2 — Canonical Semantic Contracts

- `contracts/event-contracts.md`
- `contracts/capability-contracts.md`
- `contracts/query-service-contracts.md`
- `contracts/dashboard-aggregation-contracts.md`

### Tier 3 — Current Platform State

- `CURRENT_PLATFORM_STATE.md`
- `CURRENT_DEVELOPMENT_PHASE.md`

### Tier 4 — Architecture Descriptions

- `architecture/runtime-layer.md`
- `architecture/operational-layer.md`
- `architecture/customer-layer.md`
- `architecture/template-system.md`
- `architecture/dashboard-system.md`
- `architecture/event-system.md`

### Tier 5 — Historical Context

- `historical/decision-log.md`
- `glossary/canonical-terminology.md`

---

## QUICK REFERENCE

| Question | Document |
|----------|----------|
| What is BotGrandFather? | `philosophy/platform-identity.md` |
| What MUST NEVER happen? | `anti-patterns/forbidden-directions.md` |
| How do events work? | `contracts/event-contracts.md` |
| What phase are we in? | `CURRENT_DEVELOPMENT_PHASE.md` |
| Can I build X? | `CURRENT_DEVELOPMENT_PHASE.md` (safe/unsafe list) |
| What does "capability" mean? | `glossary/canonical-terminology.md` |
| Why was Y decided? | `historical/decision-log.md` |
| Is Z safe to work on? | `CURRENT_DEVELOPMENT_PHASE.md` + `anti-patterns/` |

---

**Version 1.0 — 2026-05-23**
