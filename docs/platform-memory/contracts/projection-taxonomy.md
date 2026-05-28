# Projection Taxonomy

**Purpose:** Define all projection categories with authority, lifetime, ownership, freshness  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## PROJECTION CATEGORIES

### CATEGORY 1 — Customer Projections

**Definition:** Projections visible to the end customer.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Booking/Support/Lead capability |
| **Freshness** | Eventual (seconds) |
| **Recomputation** | Per request |

**Examples:**
- Customer's own bookings list
- Customer's own tickets list
- Customer's own leads list
- Available slots for booking
- Customer profile data

**Boundaries:**
- Customer sees ONLY own data
- Customer sees ONLY data from capabilities they interacted with
- Customer NEVER sees other customers' data
- Customer NEVER sees owner-level aggregates

---

### CATEGORY 2 — Owner Projections

**Definition:** Projections visible to the bot owner.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Booking/Support/Lead capability |
| **Freshness** | Eventual (seconds) |
| **Recomputation** | Per request |

**Examples:**
- Bot bookings list
- Bot tickets list
- Bot leads list
- Bot metrics (counts, distributions)
- Customer list (aggregated)

**Boundaries:**
- Owner sees ONLY own bot data
- Owner sees ONLY data from their bot's capabilities
- Owner NEVER sees other owners' data
- Owner NEVER sees platform-level aggregates

---

### CATEGORY 3 — Operator Projections (Future)

**Definition:** Projections visible to human support operators.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Support capability |
| **Freshness** | Eventual (seconds) |
| **Recomputation** | Per request |

**Examples:**
- Assigned tickets list
- Support metrics
- Customer support history

**Boundaries:**
- Operator sees ONLY assigned tickets
- Operator NEVER sees booking runtime state
- Operator NEVER sees lead funnel conversion logic
- Operator NEVER modifies bot configuration

---

### CATEGORY 4 — Dashboard Projections

**Definition:** Aggregated projections for dashboard display.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Each capability provides its own metrics |
| **Freshness** | Eventual (seconds to minutes) |
| **Recomputation** | Per request |

**Examples:**
- Total interactions count
- Status distributions
- Recent activity lists
- Capability-neutral metrics

**Boundaries:**
- Dashboard aggregates ONLY capability-provided metrics
- Dashboard NEVER computes business logic
- Dashboard NEVER triggers actions
- Dashboard NEVER orchestrates capabilities

---

### CATEGORY 5 — Analytics Projections

**Definition:** Observational projections for trend analysis.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Analytics capability (if exists) or capability itself |
| **Freshness** | Eventual (minutes) |
| **Recomputation** | Per request |

**Examples:**
- Booking frequency over time
- Ticket resolution trends
- Customer activity patterns
- Capability usage statistics

**Boundaries:**
- Analytics shows ONLY historical patterns
- Analytics NEVER predicts future behavior
- Analytics NEVER triggers actions
- Analytics NEVER scores customers

---

### CATEGORY 6 — Booking Projections

**Definition:** Projections specific to booking capability.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Booking capability |
| **Freshness** | Eventual (seconds) for display; Strict (immediate) for creation |
| **Recomputation** | Per request |

**Examples:**
- Available slots for date
- Booking list with status
- Booking detail view
- Calendar view
- Status distribution

**Boundaries:**
- Booking projections show ONLY booking data
- Booking projections NEVER include support ticket data
- Booking projections NEVER include lead funnel data

---

### CATEGORY 7 — Support Projections

**Definition:** Projections specific to support capability.

| Property | Value |
|----------|-------|
| **Authority** | Advisory only |
| **Lifetime** | Request-scoped |
| **Ownership** | Support capability |
| **Freshness** | Eventual (seconds) |
| **Recomputation** | Per request |

**Examples:**
- Ticket list with status
- Ticket detail view
- Message history
- Status distribution
- Assignment metrics

**Boundaries:**
- Support projections show ONLY support data
- Support projections NEVER include booking data
- Support projections NEVER include lead funnel data

---

## TAXONOMY MATRIX

| Category | Actor | Scope | Freshness | Recompute | Isolation |
|----------|-------|-------|-----------|-----------|-----------|
| Customer | Customer | Own data | Eventual | Per request | Capability |
| Owner | Owner | Bot data | Eventual | Per request | Capability |
| Operator | Operator | Assigned | Eventual | Per request | Support only |
| Dashboard | Owner | Aggregated | Eventual | Per request | Cross-read only |
| Analytics | Owner | Historical | Minutes | Per request | Read-only |
| Booking | Any | Booking data | Eventual/Strict | Per request | Booking only |
| Support | Any | Support data | Eventual | Per request | Support only |

---

## CANONICAL RULES

### Rule 1: All Projections Are Advisory

No projection category is authoritative. Database is always truth.

### Rule 2: All Projections Are Request-Scoped

No projection persists beyond request. Recomputed per request.

### Rule 3: Capabilities Own Their Projections

Each capability defines and owns its projection semantics.

### Rule 4: Actor Boundaries Are Enforced

Projections are filtered by actor's visibility boundary.

### Rule 5: Freshness Is Tolerated

Read projections tolerate eventual freshness. Write operations require strict freshness.

### Rule 6: No Cross-Capability Projection Logic

Projection logic stays within capability boundary.

### Rule 7: Dashboard Aggregates, Does Not Compute

Dashboard combines capability-provided metrics, does not compute business logic.

---

**Version 1.0 — UNIT 04 — 2026-05-23**
