# Operational Read Model Taxonomy

**Purpose:** Define canonical read-model categories for operational consumption  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 05 — Projection Consumption & Operational Read Models  
**Date:** 2026-05-23

---

## READ MODEL DEFINITION

**Read Model** is an operational projection consumed by an actor for observational purposes.

**Read Model IS:**
- Derived from runtime truth
- Actor-scoped
- Request-scoped
- Advisory only

**Read Model IS NOT:**
- Authoritative state
- Orchestration trigger
- Business logic container
- Persistent entity

---

## READ MODEL CATEGORIES

### CATEGORY 1 — Owner Operational Overview

**Purpose:** High-level operational status for bot owner.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (seconds) |
| **Actor** | Owner |
| **Scope** | Single bot |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Bot-scoped |

**Contains:**
- Total bookings (pending/confirmed/completed)
- Open tickets
- Recent leads
- Today's activity summary
- Quick status indicators

**Example:**
```typescript
async getOwnerOverview(ownerId: string, botId: string) {
  const [bookings, tickets, leads] = await Promise.all([
    this.bookingQueryService.getBotMetrics(botId),
    this.supportQueryService.getBotMetrics(botId),
    this.leadFunnelQueryService.getBotMetrics(botId),
  ]);
  
  return {
    botId,
    bookings: { total: bookings.total, pending: bookings.pending },
    tickets: { open: tickets.open },
    leads: { total: leads.total },
    todayActivity: bookings.todayCount,
  };
}
```

---

### CATEGORY 2 — Customer Booking History

**Purpose:** Customer's own booking visibility.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (seconds) |
| **Actor** | Customer |
| **Scope** | Own data only |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Customer-scoped |

**Contains:**
- Past bookings with status
- Upcoming bookings
- Cancellation options (if capability allows)
- Booking details

**Example:**
```typescript
async getCustomerBookingHistory(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  
  return {
    upcoming: bookings.filter(b => new Date(b.date) >= new Date()),
    past: bookings.filter(b => new Date(b.date) < new Date()),
  };
}
```

---

### CATEGORY 3 — Operator Ticket Queue

**Purpose:** Operator's assigned ticket visibility.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (seconds) |
| **Actor** | Operator |
| **Scope** | Assigned tickets only |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Operator-scoped |

**Contains:**
- Assigned open tickets
- Ticket priority/status
- Customer context (identity only)
- Response deadlines

---

### CATEGORY 4 — Daily Occupancy Summary

**Purpose:** Owner's daily booking capacity visibility.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (seconds) |
| **Actor** | Owner |
| **Scope** | Single bot, single date |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Bot-scoped |

**Contains:**
- Total slots for date
- Occupied slots
- Available slots
- Booking status breakdown

**Example:**
```typescript
async getDailyOccupancy(botId: string, date: string) {
  const slots = await this.bookingQueryService.getAvailableSlots(botId, date);
  const bookings = await this.bookingQueryService.getBookingsForDate(botId, date);
  
  return {
    date,
    totalSlots: slots.length + bookings.length,
    occupied: bookings.length,
    available: slots.length,
    bookings: bookings.map(b => ({ time: b.timeSlot, status: b.status })),
  };
}
```

---

### CATEGORY 5 — Upcoming Bookings

**Purpose:** Owner's near-future booking visibility.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (seconds) |
| **Actor** | Owner |
| **Scope** | Single bot |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Bot-scoped |

**Contains:**
- Next N bookings
- Customer identity
- Date/time
- Status
- Service type

---

### CATEGORY 6 — Support Activity Summary

**Purpose:** Owner's support ticket visibility.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (seconds) |
| **Actor** | Owner |
| **Scope** | Single bot |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Bot-scoped |

**Contains:**
- Open tickets count
- Average response time
- Ticket status distribution
- Recent ticket activity

---

### CATEGORY 7 — Revenue Snapshot

**Purpose:** Owner's revenue observational metrics.

| Property | Value |
|----------|-------|
| **Authority** | Advisory |
| **Freshness** | Eventual (minutes) |
| **Actor** | Owner |
| **Scope** | Single bot |
| **Recomputation** | Per request |
| **Persistence** | None |
| **Isolation** | Bot-scoped |

**Contains:**
- Total revenue (from completed bookings)
- Revenue by period
- Booking value aggregation
- Observational only — NOT financial authority

**WARNING:** Revenue snapshot is OBSERVATIONAL ONLY. Not accounting. Not financial truth.

---

## READ MODEL BOUNDARIES

### What Read Models MAY Do

| Action | Example | Why Safe |
|--------|---------|----------|
| **Filter** | Show only pending bookings | Actor scope |
| **Sort** | Order by date | UX |
| **Paginate** | Page 1 of 5 | UX |
| **Count** | Total bookings | Aggregation |
| **Group** | Status distribution | Aggregation |
| **Format** | "June 1, 2026" | Rendering |

### What Read Models MUST NOT Do

| Action | Example | Why Forbidden |
|--------|---------|---------------|
| **Mutate** | Cancel booking from overview | Cross-capability |
| **Orchestrate** | Create ticket from booking | Orchestration |
| **Automate** | Auto-assign tickets | Automation |
| **Score** | Customer value ranking | Business logic |
| **Predict** | "Likely to churn" | Prediction |
| **Decide** | "Accept this booking" | Business authority |

---

## READ MODEL MATRIX

| Category | Actor | Scope | Freshness | Recompute | Persist |
|----------|-------|-------|-----------|-----------|---------|
| Owner Overview | Owner | Bot | Eventual | Per request | No |
| Customer History | Customer | Own | Eventual | Per request | No |
| Operator Queue | Operator | Assigned | Eventual | Per request | No |
| Daily Occupancy | Owner | Bot+Date | Eventual | Per request | No |
| Upcoming Bookings | Owner | Bot | Eventual | Per request | No |
| Support Activity | Owner | Bot | Eventual | Per request | No |
| Revenue Snapshot | Owner | Bot | Minutes | Per request | No |

---

## CANONICAL RULES

### Rule 1: Read Models Are Advisory

Read models show data. They do not enforce rules.

### Rule 2: Read Models Are Request-Scoped

Each request computes fresh read models. No persistence.

### Rule 3: Read Models Are Actor-Scoped

Each actor sees only data within their authority boundary.

### Rule 4: Read Models Do Not Orchestrate

Read models never trigger cross-capability actions.

### Rule 5: Read Models Do Not Mutate

Read models are read-only. Mutations go to runtime services.

### Rule 6: Read Models Do Not Encode Business Logic

Read models aggregate, not decide.

---

**Version 1.0 — UNIT 05 — 2026-05-23**
