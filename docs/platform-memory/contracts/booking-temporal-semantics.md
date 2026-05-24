# Booking Temporal Semantics

**Purpose:** Define canonical temporal semantics for Booking template  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.1  
**Date:** 2026-05-23

---

## SECTION 1 — TEMPORAL PHILOSOPHY

### Why Scheduling Is Dangerous for Platform Drift

Scheduling introduces **seductive domain-specific semantics** that naturally expand to consume platform identity. This is the primary drift risk.

**Booking-centric drift patterns to avoid:**
- Platform quotas become `maxBookingsPerMonth` instead of `maxInteractionsPerMonth`.
- Dashboard shows "Bookings" as primary metric instead of aggregating to "Interactions".
- Core services gain `getBookingCount()` methods.
- Events become `booking.completed` instead of universal `conversion.completed`.

### Why Scheduling Stays Template-Contained

**Scheduling is a capability, not a platform concern.**

The platform provides:
- Customer lifecycle (universal)
- Event tracking (universal)
- Ownership verification (universal)
- Operational composition (universal)

The Booking template provides:
- Time slot management (template-specific)
- Availability rules (template-specific)
- Booking lifecycle (template-specific)
- Conflict prevention (template-specific)

**Invariant:** Platform core services (`CustomerService`, `BotService`, `AnalyticsService`) have **zero** scheduling awareness.

### Why Temporal Semantics Must Remain Minimal

Minimal semantics prevent:
- Framework-building behavior (universal scheduling engine)
- Premature abstraction (before 3+ scheduling templates)
- Metadata creep (scheduling logic in JSON configuration)
- Complexity explosion (recurrence, multi-resource optimization, distributed calendars)

**Philosophy:** Define only what is required for the first Booking template to function. Future scheduling templates will prove whether abstraction is justified.

---

## SECTION 2 — CANONICAL TIME OWNERSHIP

### Server Time Rule

**All timestamps are stored in UTC.**

```typescript
// ✅ CORRECT
createdAt: Date;           // Stored as UTC in PostgreSQL
startsAt: Date;            // Stored as UTC in PostgreSQL
```

**Why:** PostgreSQL `TIMESTAMP` columns store in UTC. Server application runs in UTC. This eliminates timezone ambiguity in persistence and comparison.

### Bot Timezone

**Each bot has exactly one canonical timezone.**

```typescript
// Bot entity
timezone: string;          // IANA timezone: 'Europe/Moscow', 'America/New_York'
```

**Ownership:** Bot configuration (owner-set, template-readable).

**Why:**
- A bot serves one business, which operates in one primary timezone.
- Slot display to customers uses bot timezone.
- Owner operational views use bot timezone.
- Eliminates per-booking timezone complexity.

### Customer Timezone

**Customer timezone is NOT stored or tracked.**

**Why:**
- Adds complexity without proven need for MVP.
- Customer sees slots in bot timezone (the business's timezone).
- If a customer in Moscow books a bot in New York, slots show in New York time.
- This is acceptable for MVP (explicit timezone label in UI).

**Future extension:** If 3+ templates require customer-local display, extract customer timezone as a capability. Not now.

### Timezone Handling Rules

| Context | Timezone Used |
|---------|---------------|
| Database storage | UTC |
| Slot display to customer | Bot timezone |
| Owner dashboard | Bot timezone |
| Internal comparison/computation | UTC |
| Event timestamps | UTC |

---

## SECTION 3 — BOOKING WINDOW SEMANTICS

### Advance Booking Limit

**Definition:** Maximum days into the future a customer can book.

```typescript
// Booking template configuration
advanceBookingDays: number;  // e.g., 30, 60, 90
```

**Rule:** Customer cannot book a slot more than `advanceBookingDays` days from the current date (bot timezone).

**Why:** Prevents indefinite future bookings that become stale. Business-defined limit.

### Minimum Notice Period

**Definition:** Minimum time before a slot starts that a customer can book.

```typescript
// Booking template configuration
minimumNoticeHours: number;  // e.g., 2, 24, 48
```

**Rule:** Customer cannot book a slot that starts within `minimumNoticeHours` hours from now (bot timezone).

**Why:** Gives owner time to prepare. Prevents last-minute bookings that cannot be fulfilled.

### Past-Time Protection

**Rule:** Slots with `startsAt` in the past (UTC comparison) **cannot** be booked.

**Enforcement:** Database constraint + runtime validation.

```typescript
// ❌ FORBIDDEN
startsAt: '2026-05-20T10:00:00Z'  // If current time is later
```

### Slot Validity Rules

| Condition | Bookable? |
|-----------|-----------|
| `startsAt` < now (UTC) | ❌ No (past) |
| `startsAt` > now + advanceBookingDays | ❌ No (too far future) |
| now < `startsAt` < now + minimumNoticeHours | ❌ No (insufficient notice) |
| Otherwise | ✅ Yes (if available) |

---

## SECTION 4 — AVAILABILITY SEMANTICS

### Working Hours

**Definition:** Recurring weekly schedule when the business accepts bookings.

```typescript
// Booking template configuration
workingHours: {
  monday:    { enabled: true,  slots: ['09:00', '10:00', ...] },
  tuesday:   { enabled: true,  slots: [...] },
  wednesday: { enabled: true,  slots: [...] },
  thursday:  { enabled: true,  slots: [...] },
  friday:    { enabled: true,  slots: [...] },
  saturday:  { enabled: false, slots: [] },
  sunday:    { enabled: false, slots: [] },
};
```

**Ownership:** Booking template configuration (owner-set).

**Why template config, not platform:**
- Working hours are business-specific, not platform-wide.
- Different templates may have different availability models.
- Platform does not need to understand "working hours" semantics.

### Unavailable Periods

**Definition:** Specific dates/times when the business is unavailable (vacation, holiday, closed).

```typescript
// Booking template runtime data
unavailablePeriods: {
  startDate: Date;   // UTC
  endDate: Date;     // UTC
  reason?: string;   // Optional label for owner
}[];
```

**Rule:** No slots can be booked during unavailable periods.

### Blocked Dates

**Definition:** Specific individual dates that are completely unavailable.

```typescript
// Booking template runtime data
blockedDates: string[];  // ISO date strings: ['2026-12-25', '2026-01-01']
```

**Rule:** No slots can be booked on blocked dates.

### Override Behavior

**Priority order (highest to lowest):**
1. Blocked dates (absolute block)
2. Unavailable periods (absolute block)
3. Working hours (defines available slots)
4. Individual slot availability (booked/unbooked)

**Why:** Simpler than conflict resolution. Higher-priority rules completely disable lower-priority rules.

---

## SECTION 5 — RESOURCE SEMANTICS

### MVP Decision: Single Resource

**The MVP Booking template supports exactly ONE resource.**

**Definition:** A "resource" is the bookable entity (e.g., one consultant, one room, one service provider).

**What MVP supports:**
- One bot = one bookable resource.
- All slots belong to that single resource.
- No resource selection UI.
- No cross-resource conflict detection.

### Why Single Resource for MVP

**Sequencing law SL.4:** Specific before generic.

**Sequencing law SL.2:** Three instances before universal abstraction.

**Current state:**
- Zero scheduling templates exist beyond Booking.
- No proven pattern for multi-resource semantics.
- Multi-resource introduces massive complexity:
  - Resource selection UI
  - Per-resource availability
  - Cross-resource conflict detection
  - Resource grouping/typing

**Anti-overengineering:**
- Multi-resource is a hypothetical future need, not a current problem.
- Single resource solves the actual MVP use case (one consultant booking).
- If 3+ templates need multi-resource, extract pattern then.

### Future Multi-Resource Path

If multi-resource becomes necessary:

1. **Template-internal first:** Booking template adds `resourceId` to its own entities.
2. **Prove repetition:** 3+ templates implement similar multi-resource patterns.
3. **Abstract if justified:** Extract capability-neutral resource management.

**NOT:** Build universal resource infrastructure now.

---

## SECTION 6 — BOOKING LIFECYCLE SEMANTICS

### Canonical Booking States

```typescript
type BookingStatus =
  | 'pending'      // Created, awaiting confirmation (if confirmation enabled)
  | 'confirmed'    // Confirmed and active
  | 'cancelled'    // Cancelled by customer or owner
  | 'completed'    // Appointment occurred (past end time)
  | 'no-show';     // Customer did not attend (owner-marked)
```

### Allowed State Transitions

```
pending → confirmed    (owner confirms, or auto-confirm if enabled)
pending → cancelled    (customer or owner cancels)

confirmed → cancelled  (customer or owner cancels)
confirmed → completed  (appointment time passed)
confirmed → no-show    (owner marks after appointment time)

cancelled → [no transitions allowed]
completed → [no transitions allowed]
no-show → [no transitions allowed]
```

### Forbidden Transitions

| From | To | Why Forbidden |
|------|-----|---------------|
| cancelled | confirmed | Cannot resurrect cancelled booking |
| completed | cancelled | Cannot cancel after completion |
| no-show | confirmed | Cannot undo no-show |
| any | pending | Cannot revert to pending |

### Ownership Rules

**Who can transition:**
- `pending → cancelled`: Customer (own booking) OR Owner
- `pending → confirmed`: Owner (or auto-confirm)
- `confirmed → cancelled`: Customer (own booking, within cancellation window) OR Owner
- `confirmed → no-show`: Owner only (after appointment time)

**Invariant:** Customer can only modify their own bookings (verified by `telegramUserId`).

### Cancellation Semantics

**Cancellation window:**
```typescript
// Booking template configuration
cancellationWindowHours: number;  // e.g., 24, 48
```

**Rule:** Customer can cancel without penalty only if cancellation occurs more than `cancellationWindowHours` before `startsAt`.

**After cancellation window:**
- Customer cannot cancel via self-service.
- Owner can still cancel.
- Cancellation is recorded (analytics: `booking.cancelled`).

### Rollback States

**No rollback states exist.**

Once a booking is `cancelled`, `completed`, or `no-show`, it cannot transition back.

**Why:**
- Simplicity: No complex undo logic.
- Audit trail: History is immutable.
- Real-world semantics: You cannot "un-cancel" or "un-complete" an appointment.

---

## SECTION 7 — CONFLICT PREVENTION SEMANTIPCS

### Overlap Prevention

**Rule:** No two bookings can have overlapping time slots for the same resource.

**Definition of overlap:**
```typescript
// Two bookings A and B overlap if:
A.startsAt < B.endsAt AND B.startsAt < A.endsAt
```

### Uniqueness Constraints

**Database-level constraint:**
```sql
-- Conceptual (actual implementation may vary)
EXCLUDE USING gist (
  resource_id WITH =,
  tsrange(startsAt, endsAt) WITH &&
) WHERE (status NOT IN ('cancelled'));
```

**Why DB-level:** Application-level checks have race conditions. Database constraint is the source of truth.

### Concurrency Expectations

**Expected load:** MVP assumes moderate concurrency (< 100 booking attempts per minute per bot).

**If higher concurrency needed:**
- Add explicit row-level locking during booking creation.
- Use database transactions with proper isolation.
- **NOT:** Build distributed locking infrastructure.

### Duplicate Booking Protection

**Rule:** Same customer cannot have two overlapping `confirmed` bookings.

**Enforcement:**
- Query for existing confirmed bookings in the requested time range.
- If found, reject new booking.
- Database constraint as final guard.

---

## SECTION 8 — OPERATIONAL VISIBILITY RULES

### What Operational Layer MAY See

Operational layer (owner dashboard) MAY read:
- Booking count (aggregated via Capability Provider).
- Recent bookings list (via `BookingQueryService`).
- Booking status distribution (pending, confirmed, cancelled counts).
- Upcoming bookings (next 7 days).

**Pattern:** All reads go through `BookingQueryService` implementing `DashboardCapabilityProvider`.

### What Dashboard Aggregates

Dashboard aggregates via Capability Provider:
```typescript
// DashboardService calls
const metrics = await bookingProvider.getOwnerMetrics(ownerId);
// Returns: { total: number, active?: number, converted?: number }
```

**Dashboard does NOT know:**
- Booking-specific fields (startsAt, customer details).
- Time slot semantics.
- Availability rules.

**Dashboard shows:**
- "Interactions" count (includes bookings, summed with leads from other templates).
- Template-specific widget (provided by Booking capability).

### What MUST Remain Runtime-Only

Runtime-only (operational layer MUST NOT access directly):
- Slot generation logic.
- Availability computation.
- Booking state transitions.
- Conflict detection algorithms.

**Why:** These are business logic, not read-only views. Operational layer is read-only.

### Operational Orchestration Prevention

**Forbidden in operational layer:**
```typescript
// ❌ FORBIDDEN
@Post('bookings/:id/confirm')
async confirmBooking(@Param('id') id: string) {
  // Operational endpoint triggering runtime logic
  await this.bookingRuntimeService.confirmBooking(id);
}
```

**Correct pattern:**
```typescript
// ✅ CORRECT
// Customer triggers via Telegram chat (runtime)
// OR owner triggers via runtime endpoint with ownership verification
@Post('bots/:id/bookings/:bookingId/confirm')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
async confirmBooking(...) {
  // This is still runtime logic, just with ownership verification
  // Lives in runtime module, not miniapp module
}
```

**Invariant:** Operational layer reads data. It does not execute booking business logic.

---

## SECTION 9 — FORBIDDEN DIRECTIONS

### Explicitly Forbidden

The following are **ABSOLUTELY FORBIDDEN** for current platform phase:

| Forbidden Direction | Why Forbidden |
|---------------------|---------------|
| **Universal scheduling engine** | No proven repetition (1 template). Violates SL.2, A.2. |
| **Shared calendar infrastructure** | Platform core must not be scheduling-aware. Violates CN.1–CN.6. |
| **Cross-template scheduling abstraction** | Templates must not import each other. Violates TI.1–TI.6. |
| **AI scheduling orchestration** | Hypothetical problem. Violates A.1. |
| **Resource optimization engines** | Multi-resource not yet justified. Violates SL.4. |
| **Recurrence frameworks** | No proven need. Violates A.2. |
| **Calendar DSLs** | Metadata-driven business logic. Violates MD.1, MD.3. |
| **Metadata-driven scheduling logic** | Business logic must be in code. Violates MD.1, MD.3, OC.2. |
| **Platform-wide schedule engine** | Platform core must not be scheduling-aware. Violates CN.2. |
| **Platform-level slot abstractions** | Scheduling is template capability, not platform concern. Violates CN.5. |
| **Global scheduler services** | No proven repetition. Violates SL.1, SL.2. |
| **Scheduling logic in CustomerService** | CustomerService must have zero template references. Violates CN.5. |
| **Scheduling logic in BotService** | BotService must have zero template references. Violates CN.5. |

### Enforcement

If any of the above appear in code reviews or proposals:
1. **Stop** implementation immediately.
2. **Reference** this document and violated invariant.
3. **Correct** to template-contained approach.
4. **Document** the drift in decision log.

---

## SECTION 10 — NO UNIVERSAL SLOT MODEL

### Platform MUST NOT Define Universal Slot Abstractions

**Scheduling primitives are NOT platform primitives.**

The platform core MUST NOT contain:
- `Slot` entities in universal schema.
- `SlotService` in platform core.
- `SlotGenerator` utilities shared across templates.
- `AvailabilityEngine` as a platform service.
- `OverlapDetector` as a universal module.

All of the above belong exclusively to scheduling templates.

### Slot Semantics Belong Exclusively to Scheduling Templates

| Concern | Owner |
|---------|-------|
| Slot generation logic | Booking template runtime |
| Slot duration semantics | Booking template configuration |
| Slot overlap rules | Booking template runtime |
| Availability computation | Booking template runtime |
| Working hour expansion | Booking template runtime |
| Blocked date filtering | Booking template runtime |

**Platform knows nothing about slots.** Platform knows `Customer`, `Bot`, `AnalyticsEvent`, `Owner`. Slots are template implementation details.

### Why Different Templates May Require Radically Different Temporal Semantics

A booking template uses discrete fixed-duration slots (09:00, 10:00, 11:00).
A restaurant reservation template may use variable-duration tables (lunch: 90 min, dinner: 120 min).
An event template may use single-day tickets with no time granularity.
A coaching template may use open-ended sessions with flexible start times.
A webinar template may use one-to-many broadcasts with capacity limits, not slot conflicts.

**These semantics are incompatible.** A universal slot model would force all templates into a single temporal shape, creating either:
- **Over-engineering:** The universal model must support all edge cases, becoming a framework.
- **Under-serving:** Templates fight the abstraction, working around its limitations.

### Premature Slot Abstraction Creates Hidden Framework Behavior

If the platform extracts `Slot` as a universal concept:
1. New templates MUST use platform slot semantics, even when inappropriate.
2. Slot changes require platform-wide migration.
3. The platform becomes implicitly scheduling-centric.
4. Dashboard metrics drift toward "slots" instead of "interactions."

**This is framework-building, not platform-building.**

### Slot Reuse Pressure Is a Major Future Drift Vector

Once a `SlotService` exists in platform core, every future template faces pressure to reuse it:
- "Why don't you use the platform SlotService?"
- "The slot engine already handles overlap."
- "Just configure the slot model in metadata."

This pressure transforms the platform into a scheduling framework by default. **Preventing the existence of a universal slot model prevents the pressure to use it.**

### Explicitly Forbidden Slot Infrastructure

| Forbidden | Why |
|-----------|-----|
| `src/slot/slot.service.ts` | Platform must not own slots. |
| `src/availability/availability.engine.ts` | Platform must not own availability. |
| `src/scheduling/overlap-detector.ts` | Platform must not own scheduling logic. |
| `SlotEntity` in universal schema | Slots are template-specific. |
| `SlotConfig` metadata schema | Metadata must not drive slot behavior. |
| `SlotManager` shared utility | Shared utilities create coupling. |

---

## SECTION 11 — NO PLATFORM CALENDAR

### Platform Core MUST NEVER Own Calendars

**Calendar synchronization is template-contained.**
**Scheduling integrations are template-contained.**
**Shared availability is NOT a platform concern.**

The platform MUST NOT provide:
- Google Calendar sync as a platform service.
- Outlook/Exchange integration as a platform module.
- iCal feed generation as a universal endpoint.
- Team scheduling as a platform feature.
- Shared staff calendars as a core entity.
- Centralized scheduling state accessible across templates.

### Why Calendar Semantics Create Severe Capability Drift

Calendar integrations introduce external state synchronization, recurrence semantics, attendee management, and resource federation. These are massive domains that would consume platform identity if allowed into core.

**Examples of what MUST remain template-contained:**

**Google Calendar sync:** If a Booking template wants to sync with Google Calendar, the sync logic lives in `src/templates/booking/integrations/google-calendar/`. It does NOT live in `src/integrations/google-calendar/` as a platform-wide service.

**Outlook sync:** Same rule. Template-contained. Capability-contained.

**Team scheduling:** Multiple staff members with individual availability. This is multi-resource scheduling, which requires justification per Section 5. Even then, it remains template-internal.

**Shared staff calendars:** A "staff" concept does not exist in platform core. If a template needs staff entities, it defines them internally.

### Calendar Abstractions Are Framework Traps

A "universal calendar provider" abstraction would require:
- Pluggable calendar adapters.
- Normalized event schemas.
- Bidirectional sync state machines.
- Conflict resolution between external and internal calendars.

This is a calendar platform, not BotGrandFather.

### Operational Isolation of Calendar Data

Operational layer MAY read:
- "This bot has 5 bookings today" (via Capability Provider).

Operational layer MUST NOT read:
- Google Calendar event IDs.
- External calendar sync status.
- iCal feed URLs.
- Team calendar overlays.

These are runtime implementation details, not operational views.

---

## SECTION 12 — ANTI-METADATA PROTECTION

### Scheduling Computation MUST Remain Executable Code

**Scheduling logic is code, not configuration.**

The following MUST be implemented in TypeScript within the Booking template:
- Slot generation algorithms.
- Availability intersection logic.
- Conflict detection.
- Working hour expansion.
- Blocked date filtering.
- Booking window validation.

The following MUST NOT be moved to JSON, YAML, or any declarative format:
- Slot generation algorithms.
- Availability intersection logic.
- Conflict detection.
- Working hour expansion.
- Blocked date filtering.
- Booking window validation.

### Availability Logic MUST NOT Become Declarative Orchestration

**Forbidden pattern:**
```typescript
// ❌ FORBIDDEN — Declarative orchestration in metadata
const availabilityRules = {
  conditions: [
    { type: 'workingHours', days: ['monday', 'tuesday'] },
    { type: 'blockedDates', dates: ['2026-12-25'] },
    { type: 'unavailablePeriods', periods: [...] },
  ],
  transitions: [
    { from: 'pending', to: 'confirmed', trigger: 'ownerApproval' },
    { from: 'confirmed', to: 'cancelled', trigger: 'customerCancellation' },
  ],
  rules: [
    { type: 'overlapCheck', enabled: true },
    { type: 'advanceBooking', days: 30 },
    { type: 'minimumNotice', hours: 24 },
  ],
};
```

**Why this is dangerous:**
This pattern is **accidental workflow-engine construction**. It replaces explicit, debuggable TypeScript with opaque, recursive metadata that:
1. Requires a metadata interpreter (framework component).
2. Makes business logic untestable in isolation.
3. Creates pressure to make the interpreter increasingly generic.
4. Violates Invariant MD.1 (metadata drives UI, not logic).
5. Violates Invariant MD.3 (business logic remains in code).
6. Violates Invariant OC.2 (metadata is context, not business logic).
7. Violates Invariant A.4 (code is better than configuration for business logic).

### Scheduling Rules MUST NOT Become Recursive Metadata Systems

**Forbidden:**
- Metadata that references other metadata.
- JSON schemas that define scheduling DSLs.
- Configuration files that import other configuration files.
- Recursive rule engines where rules produce rules.

**Why:** Recursive metadata systems are frameworks in disguise. They create complexity that exceeds the duplication they eliminate.

### Runtime Scheduling Behavior MUST NOT Be JSON-Driven

**Correct:**
```typescript
// ✅ CORRECT — Explicit code in template service
async generateSlots(date: Date): Promise<Slot[]> {
  const workingHours = this.config.workingHours;
  const blockedDates = this.config.blockedDates;
  const unavailablePeriods = this.config.unavailablePeriods;

  if (blockedDates.includes(dateStr)) return [];
  if (this.isUnavailable(date, unavailablePeriods)) return [];

  return workingHours[dayOfWeek].slots.map(time => ({
    startsAt: this.combineDateTime(date, time),
    durationMinutes: this.config.slotDuration,
  }));
}
```

**Forbidden:**
```typescript
// ❌ FORBIDDEN — JSON-driven behavior
async generateSlots(date: Date): Promise<Slot[]> {
  return this.ruleEngine.execute(this.config.slotRules, { date });
}
```

### Metadata Discipline Invariants Applied to Scheduling

> **Invariant MD.1:** Metadata drives operational UI rendering, NOT business logic execution.  
> **→ Scheduling logic is business logic. Therefore, it MUST NOT be metadata-driven.**

> **Invariant MD.3:** Business logic remains in code, not metadata.  
> **→ Slot generation, availability, conflict detection are business logic. Therefore, they MUST remain in code.**

> **Invariant A.2:** Abstraction requires 3+ proven repetitions.  
> **→ A generic rule engine for scheduling would be abstraction before repetition. Forbidden.**

> **Invariant A.4:** Code is better than configuration for business logic.  
> **→ TypeScript is better than JSON for scheduling logic.**

---

## SECTION 13 — NO GENERIC APPOINTMENT ENGINE

### The Pressure Will Be Strong

As new templates emerge, there will be strong commercial and architectural pressure to build "universal appointment infrastructure."

**Future templates that may need temporal semantics:**
- Consultations (1-on-1 expert calls)
- Reservations (tables, rooms, equipment)
- Events (ticketing with capacity)
- Coaching (recurring sessions, packages)
- Support calls (queue-based scheduling)
- Webinars (broadcast with registration)

**The seductive proposal:**
> "All of these are appointments. Let's build a generic appointment engine so future templates don't reimplement scheduling."

**This is FORBIDDEN.**

### Why Universal Appointment Infrastructure Is Forbidden Now

**Sequencing law SL.2:** Three instances before universal abstraction.

Currently:
- **One** scheduling template exists (Booking).
- **Zero** additional scheduling templates are implemented.
- No proven common semantics across temporal templates.

Building a generic appointment engine now would be:
- **Abstraction before repetition.** Violates Invariant A.2.
- **Framework-building.** Violates Invariant A.1.
- **Hypothetical problem solving.** Violates anti-overengineering philosophy.

### Different Temporal Businesses Have Incompatible Semantics

| Template | Duration | Conflict Type | Confirmation | Cancellation |
|----------|----------|---------------|--------------|--------------|
| Booking | Fixed (60 min) | Slot overlap | Owner confirms | 24h window |
| Restaurant | Variable (90-120 min) | Table capacity | Auto-confirm | No penalty |
| Event | All-day | Capacity limit | Auto-confirm | Non-refundable |
| Coaching | Open-ended | None (agreed) | Manual | Flexible |
| Webinar | Fixed (60 min) | Capacity limit | Auto-confirm | Anytime |

A universal engine would need to support ALL of these variations, becoming a framework. Alternatively, it would force templates into an ill-fitting model, creating workaround code.

### What Is Required Before Generic Abstraction

Before ANY generic appointment abstraction is considered:
1. **3+ scheduling templates implemented.** Proven repetition.
2. **Common semantics identified.** What is genuinely shared?
3. **Duplication measured.** How much code is actually duplicated?
4. **Abstraction complexity assessed.** Does abstraction reduce or increase complexity?
5. **RFC process completed.** Tier 2 contract evolution.

**Current state:** 0 of 5 requirements met.

### Explicitly Forbidden Appointment Infrastructure

| Forbidden | Why |
|-----------|-----|
| `AppointmentService` in platform core | Platform must not own appointment semantics. |
| `AppointmentEngine` as shared module | Framework-building. |
| `IAppointment` interface in core | Core must be capability-neutral. |
| `AppointmentConfig` metadata schema | Metadata must not drive appointment behavior. |
| `AppointmentManager` base class | Inheritance coupling across templates. |
| `UniversalAppointmentAPI` endpoints | Platform API must not be template-centric. |

---

## WHY THIS DOES NOT CREATE A SCHEDULING FRAMEWORK

### Bounded Semantics

This document defines semantics for **one template** (Booking), not a universal scheduling infrastructure. Key boundaries:

| Boundary | How Enforced |
|----------|--------------|
| **Template-contained** | All scheduling logic lives in `src/templates/booking/`. Platform core has zero scheduling awareness. |
| **Single resource** | MVP explicitly supports one resource per bot. Multi-resource requires future justification. |
| **Minimal operations** | Only create, confirm, cancel, complete, no-show. No recurrence, no smart rescheduling. |
| **Simple availability** | Working hours + blocked dates + unavailable periods. No complex rules engine. |

### Constrained Abstraction

**No abstraction is introduced at the platform level.** The Booking template implements its own:
- Slot management
- Availability computation
- Conflict detection
- State transitions

If a future template needs scheduling:
1. It implements its own scheduling logic (may copy patterns from Booking).
2. At 3+ scheduling templates, the pattern is reviewed.
3. Only then is abstraction considered.

This obeys **Invariant SL.2** (three before universal) and **Invariant A.2** (abstraction requires proven repetition).

### Capability-Neutral Platform

The platform remains capability-neutral because:

- **Core services unchanged:** `CustomerService`, `BotService`, `AnalyticsService` have zero scheduling code.
- **Events remain universal:** `conversion.completed`, not `booking.completed` for conversion tracking.
- **Dashboard remains neutral:** Shows "Interactions", not "Bookings". Booking-specific data comes through Capability Provider.
- **Quotas remain neutral:** `maxInteractionsPerMonth`, not `maxBookingsPerMonth`.

### Intentionally Postponed Complexity

The following are explicitly postponed (not rejected forever, but not now):

| Postponed | Reconsidered When |
|-----------|-------------------|
| Multi-resource support | 3+ templates prove multi-resource pattern |
| Recurrence rules | Proven need from real templates |
| Customer timezone handling | 3+ templates require customer-local display |
| Resource grouping/typing | Multi-resource justified first |
| Smart conflict resolution | Single-resource conflict prevention proven stable |
| Distributed scheduling | >100 booking attempts/minute per bot |
| Calendar integrations | After core scheduling stable |

**Why postponement matters:** Postponement acknowledges these may be valid future needs while refusing to build them prematurely. This is the essence of "abstract only proven repetition."

### Framework vs. Platform

| Framework Behavior | Platform Behavior (This Document) |
|--------------------|-----------------------------------|
| Universal scheduling API | Template-internal slot management |
| Configurable recurrence rules | No recurrence (MVP) |
| Multi-resource optimization | Single resource only |
| Metadata-driven availability | Code-based availability logic |
| Pluggable calendar providers | No calendar abstraction |
| Distributed time handling | Bot timezone + UTC storage |

**This document defines platform behavior, not framework behavior.** It solves the real problem (one consultant booking) without inventing infrastructure for hypothetical problems (enterprise scheduling, multi-resource optimization, distributed calendars).

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial canonical temporal semantics |
| 1.1 | 2026-05-23 | Added NO UNIVERSAL SLOT MODEL, NO PLATFORM CALENDAR, ANTI-METADATA PROTECTION, NO GENERIC APPOINTMENT ENGINE sections. Strengthened anti-drift boundaries. |

---

**This document is the CANONICAL AUTHORITY for all Booking temporal semantics.**

**All future Booking Engine work MUST comply with these semantics.**

**Violations of these semantics are architectural drift.**

**Version 1.0 — 2026-05-23**
