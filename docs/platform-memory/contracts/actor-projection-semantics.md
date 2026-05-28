# Actor Projection Semantics

**Purpose:** Define what each actor may observe, aggregate, and infer  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## ACTOR PROJECTION MATRIX

### Customer

| Action | Allowed | Forbidden |
|--------|---------|-----------|
| **Observe** | Own bookings, tickets, leads | Other customers' data |
| **Aggregate** | Own activity counts | Cross-customer metrics |
| **Infer** | "I have 2 bookings" | "I am VIP customer" |
| | "My last booking was X" | "Other customers book more" |

**Projection Boundaries:**
- Customer sees ONLY own data
- Customer sees ONLY capabilities they use
- Customer NEVER sees owner-level data
- Customer NEVER sees platform-level data

---

### Owner

| Action | Allowed | Forbidden |
|--------|---------|-----------|
| **Observe** | Bot bookings, tickets, leads | Other owners' data |
| **Aggregate** | Bot metrics, status distributions | Cross-owner metrics |
| **Infer** | "My bot has 10 bookings" | "My bot is top performer" |
| | "Customer X booked twice" | "Customer X is VIP" |

**Projection Boundaries:**
- Owner sees ONLY own bot data
- Owner sees ALL capabilities for their bot
- Owner NEVER sees other owners' data
- Owner NEVER sees customer identity beyond bot context

---

### Operator (Future)

| Action | Allowed | Forbidden |
|--------|---------|-----------|
| **Observe** | Assigned tickets | Other operators' tickets |
| **Aggregate** | Personal workload metrics | Cross-operator metrics |
| **Infer** | "I have 5 open tickets" | "I resolve faster than others" |

**Projection Boundaries:**
- Operator sees ONLY assigned tickets
- Operator NEVER sees booking runtime state
- Operator NEVER sees lead funnel data
- Operator NEVER modifies bot configuration

---

### Platform

| Action | Allowed | Forbidden |
|--------|---------|-----------|
| **Observe** | Aggregated anonymized metrics | Individual customer data |
| **Aggregate** | System health, usage patterns | Business logic |
| **Infer** | "System has 1000 bots" | "Bot X underperforms" |

**Projection Boundaries:**
- Platform sees ONLY aggregated data
- Platform NEVER sees individual customer/owner data
- Platform NEVER modifies operational state
- Platform enforces isolation, not business logic

---

## FORBIDDEN INFERENCES

### Customer Must NEVER Infer

| Forbidden Inference | Why |
|---------------------|-----|
| "I am a VIP customer" | Business logic, not data |
| "Other customers prefer X" | Cross-customer data |
| "Owner is busy" | Owner operational state |
| "Platform recommends Y" | Recommendation engine |

### Owner Must NEVER Infer

| Forbidden Inference | Why |
|---------------------|-----|
| "Customer is VIP" | Business logic, not data |
| "Customer will churn" | Prediction engine |
| "Bot is underperforming" | Benchmarking logic |
| "Auto-assign to agent" | Automation logic |

### Operator Must NEVER Infer

| Forbidden Inference | Why |
|---------------------|-----|
| "Customer is high-value" | Cross-capability data |
| "Ticket should be escalated" | Business logic |
| "Create follow-up booking" | Cross-capability action |

---

## CANONICAL RULES

### Rule 1: Actors Observe Their Own Data

Each actor observes data within their authority boundary.

### Rule 2: Actors Do Not Infer Business Logic

Projections show data, not business interpretations.

### Rule 3: Actors Do Not Cross Boundaries

No actor observes data outside their scope.

### Rule 4: Platform Is Infrastructure Only

Platform enforces boundaries, does not observe business data.

---

**Version 1.0 — UNIT 04 — 2026-05-23**
