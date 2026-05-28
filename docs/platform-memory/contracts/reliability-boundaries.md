# Reliability Boundaries

**Purpose:** Define what reliability guarantees the platform provides and what it intentionally does not  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 06 — Concurrency & Reliability Validation  
**Date:** 2026-05-23

---

## PLATFORM GUARANTEES

### Guarantee 1: No Double-Booking

**What:** Two bookings cannot occupy the same slot with occupying status.

**How:** Database unique constraint on `(botId, date, timeSlot, status)`.

**Scope:** Per-bot, per-date, per-time-slot.

**Limitations:**
- Does not prevent booking + cancellation race (handled by status validation)
- Does not prevent booking at same time on different bots (by design)

---

### Guarantee 2: Valid Status Transitions

**What:** Bookings can only transition through valid states.

**How:** Status validation in runtime methods.

**Valid Transitions:**
```
pending → confirmed (owner action)
pending → cancelled (owner or customer action)
confirmed → cancelled (owner action)
confirmed → completed (owner action)
confirmed → no-show (owner action)
```

**Invalid Transitions (Blocked):**
```
cancelled → any (final state)
completed → any (final state)
no-show → any (final state)
pending → completed (must confirm first)
```

---

### Guarantee 3: Owner Controls Availability

**What:** Only owner can modify ProviderAvailability.

**How:** Authorization checks on availability endpoints.

**Scope:** Owner can add/remove working hours, exclusions.

---

### Guarantee 4: Booking Data Integrity

**What:** Booking records are ACID-compliant.

**How:** PostgreSQL transactions.

**Scope:** All booking mutations are transactional.

---

### Guarantee 5: Idempotent Webhook Processing

**What:** Duplicate Telegram updates do not cause duplicate actions.

**How:** update_id deduplication + idempotent handlers.

**Scope:** Within instance memory (last 10,000 updates).

---

## PLATFORM INTENTIONALLY DOES NOT GUARANTEE

### Non-Guarantee 1: Real-Time Consistency

**What:** Projections may be seconds stale.

**Why:** Recomputation per request, no real-time sync.

**Acceptable:**
- Dashboard shows slightly outdated counts
- Slot list may be slightly stale
- Calendar view may lag

**Not Acceptable:**
- Double-booking (blocked by DB)
- Invalid status transitions (blocked by validation)

---

### Non-Guarantee 2: Exactly-Once Delivery

**What:** Telegram updates may be processed more than once.

**Why:** At-least-once delivery from Telegram.

**Mitigation:** Deduplication reduces duplicates. Idempotency makes duplicates safe.

**Acceptable:**
- Duplicate message sends (user sees message twice)
- Duplicate analytics events (minor counting error)

**Not Acceptable:**
- Duplicate bookings (blocked by DB constraint)
- Duplicate status changes (blocked by idempotency)

---

### Non-Guarantee 3: Ordered Processing

**What:** Updates may be processed out of order.

**Why:** Network delays, retries, concurrent processing.

**Mitigation:** State machine validation handles out-of-order gracefully.

**Acceptable:**
- "Cancel" arrives before "Book" → "Nothing to cancel"
- "Confirm" arrives after "Cancel" → "Already cancelled"

**Not Acceptable:**
- State corruption from out-of-order processing

---

### Non-Guarantee 4: Instant Propagation

**What:** Changes do not instantly propagate to all views.

**Why:** No real-time sync, no cache invalidation, no WebSockets.

**Acceptable:**
- Owner refreshes dashboard to see new booking
- Customer refreshes slot list to see updated availability

**Not Acceptable:**
- Permanent stale data (refresh always shows current state)

---

### Non-Guarantee 5: Cross-Bot Isolation (Temporal)

**What:** Bookings on different bots for same time are allowed.

**Why:** Each bot is independent. No shared provider concept.

**Acceptable:**
- Bot A has booking at 09:00
- Bot B has booking at 09:00
- Same customer can book both

---

## ACCEPTABLE INCONSISTENCY

| Inconsistency | Duration | Impact | Handling |
|---------------|----------|--------|----------|
| **Dashboard count stale** | Seconds | Observational | Refresh |
| **Slot list stale** | Seconds | UX | Select different slot |
| **Calendar view stale** | Seconds | Observational | Refresh |
| **Analytics snapshot stale** | Minutes | Advisory | Expected |
| **Duplicate message** | Once | UX | Ignore |
| **Out-of-order update** | Once | UX | State machine handles |

---

## UNACCEPTABLE TEMPORAL CORRUPTION

| Corruption | Prevention |
|------------|------------|
| **Double-booking** | DB unique constraint |
| **Invalid status** | Status validation |
| **Booking on excluded date** | Write-time availability check |
| **Booking in past** | Write-time date validation |
| **Lost update** | DB transaction isolation |
| **Ghost booking** | No reservation system |

---

## CANONICAL RULES

### Rule 1: Database Guarantees Data Integrity

ACID + constraints = no corruption.

### Rule 2: Projections Are Eventually Consistent

Stale projections are acceptable. Data integrity is not.

### Rule 3: Telegram Delivery Is At-Least-Once

Deduplication + idempotency = safe processing.

### Rule 4: No Real-Time Infrastructure

Manual refresh is acceptable. No WebSockets, no SSE, no polling.

### Rule 5: Simple Runtime Is Preserved

No queues, no locks, no distributed coordination.

---

**Version 1.0 — UNIT 06 — 2026-05-23**
