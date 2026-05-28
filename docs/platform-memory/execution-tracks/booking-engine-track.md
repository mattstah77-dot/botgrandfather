# BOOKING ENGINE EXECUTION TRACK

Status: ACTIVE
Priority: CRITICAL
Execution Mode: Sequential Controlled Evolution
Authority Level: CANONICAL

---

# PURPOSE

This execution track exists to evolve Booking capability through:

* controlled temporal domain excavation,
* operational semantics validation,
* projection architecture stabilization,
* scalability-safe implementation,
* anti-framework containment.

The purpose is NOT:

* rapid feature shipping,
* scheduling framework creation,
* workflow orchestration,
* calendar engine development.

Booking MUST remain:

# a capability inside BotGrandFather.

NOT:

* the center of the platform,
* a reusable scheduling framework,
* temporal infrastructure.

---

# EXECUTION MODEL

Every unit MUST follow:

```text id="73s7yh"
research
→ implementation
→ documentation
→ report
→ STOP
→ review
→ next unit
```

The agent MUST NEVER:

* skip units,
* anticipate future abstractions,
* parallelize temporal layers,
* implement future infrastructure early.

---

# GLOBAL INVARIANTS

The following MUST remain true during ALL units:

1. Slots are projections, not truth.
2. Database is final temporal authority.
3. Booking logic remains template-owned.
4. Operational UI remains observational.
5. No scheduling engine emerges.
6. No workflow engine emerges.
7. No recurrence framework emerges.
8. No temporal orchestration appears.
9. No queue infrastructure appears.
10. No distributed coordination appears.

---

# GLOBAL FORBIDDEN DIRECTIONS

STRICTLY FORBIDDEN:

* Universal scheduling engine
* Workflow orchestration framework
* RRULE recurrence engine
* Metadata scheduling DSL
* Slot persistence engine
* Distributed locking
* Reservation queues
* Scheduling microservices
* Generic state machine
* Temporal framework abstractions
* Capability orchestration
* Calendar infrastructure platform

---

# RESEARCH TRACK LOCATION

All research MUST be stored in:

```text id="1w4m9h"
docs/platform-memory/booking-research/
```

Recommended structure:

```text id="5puh85"
booking-research/
  unit-01-temporal-truth/
  unit-02-occupancy/
  unit-03-computation/
  unit-04-projections/
  unit-05-timezones/
  unit-06-concurrency/
  unit-07-operational-ux/
  unit-08-scalability/
```

---

# UNIT 01 — TEMPORAL SOURCE OF TRUTH

Status: READY

---

## PURPOSE

Formally stabilize:

* what temporal truth means,
* what availability means,
* what slot means,
* what occupancy means,
* what is authoritative,
* what is derived.

This unit prevents:

* slot engine drift,
* projection confusion,
* persistent slot systems,
* scheduling framework emergence.

---

## REQUIRED RESEARCH

Research and document:

1. What constitutes canonical booking truth
2. Difference between:

   * availability,
   * occupancy,
   * booking,
   * slot,
   * projection
3. What invalidates availability
4. What must NEVER become persisted
5. Projection vs truth boundaries

---

## REQUIRED IMPLEMENTATION

Create:

```text id="v2fyzs"
docs/platform-memory/contracts/temporal-truth-contracts.md
```

Must define:

### Canonical Truth

Truth IS:

* ProviderAvailability
* Existing bookings
* Exclusions
* Policies

Truth IS NOT:

* slots
* projections
* cache
* frontend state

---

## REQUIRED VALIDATIONS

Verify:

* no Slot entity exists
* no scheduling engine exists
* no recurrence engine exists
* no RRULE exists
* no universal availability abstraction exists

---

## FORBIDDEN DIRECTIONS

DO NOT:

* create Slot entity
* persist generated slots
* create slot cache infrastructure
* introduce recurrence DSL

---

## REQUIRED REPORT

Provide:

* temporal truth map
* projection map
* invalidation map
* drift risks
* forbidden directions validated
* files changed
* build status

STOP after report.

---

# UNIT 02 — OCCUPANCY SEMANTICS

Status: BLOCKED BY UNIT 01

---

## PURPOSE

Define:

* what occupies time,
* when occupancy starts,
* when occupancy ends,
* what frees time,
* how lifecycle affects occupancy.

This unit prevents:

* implicit temporal assumptions,
* hidden overlap logic,
* lifecycle inconsistency.

---

## REQUIRED RESEARCH

Clarify:

1. Does pending occupy?
2. Does confirmed occupy?
3. Does cancelled free occupancy?
4. Does no-show free occupancy?
5. Does rescheduled booking release previous occupancy?
6. What about buffers?
7. What about overlapping services?

---

## REQUIRED IMPLEMENTATION

Create:

```text id="xod6cf"
docs/platform-memory/contracts/occupancy-contracts.md
```

Must define:

* occupancy matrix
* lifecycle occupancy semantics
* conflict semantics
* release semantics

---

## REQUIRED VALIDATIONS

Verify:

* occupancy rules remain explicit
* no generic lifecycle engine emerges
* no shared temporal abstractions emerge

---

## FORBIDDEN DIRECTIONS

DO NOT:

* create OccupancyEngine
* create generic conflict resolver
* create universal lifecycle abstraction

---

## REQUIRED REPORT

Provide:

* occupancy matrix
* lifecycle interaction map
* temporal conflict matrix
* overlap semantics
* drift risks
* files changed
* build status

STOP after report.

---

# UNIT 03 — COMPUTATION MODEL

Status: BLOCKED BY UNIT 02

---

## PURPOSE

Define:

* how availability computation works,
* where computation happens,
* recomputation boundaries,
* cost boundaries.

This unit prevents:

* premature materialization,
* queue systems,
* temporal infrastructure drift.

---

## REQUIRED RESEARCH

Research:

1. Compute-on-demand viability
2. Projection recomputation scope
3. Cost growth patterns
4. Temporal invalidation boundaries
5. Read/write pressure

---

## REQUIRED IMPLEMENTATION

Create:

```text id="9h7xeh"
docs/platform-memory/contracts/computation-contracts.md
```

Must define:

* computation pipeline
* recomputation rules
* invalidation triggers
* compute boundaries

---

## REQUIRED VALIDATIONS

Verify:

* slots remain computed
* no background slot generators exist
* no scheduling queues exist
* no cron slot systems exist

---

## FORBIDDEN DIRECTIONS

DO NOT:

* pre-generate future slots
* create background schedulers
* create slot materialization workers
* create queue-driven availability

---

## REQUIRED REPORT

Provide:

* computation pipeline
* recomputation strategy
* invalidation matrix
* scalability pressure map
* drift risks
* files changed
* build status

STOP after report.

---

# UNIT 04 — PROJECTION ARCHITECTURE

Status: BLOCKED BY UNIT 03

---

## PURPOSE

Define:

* projection lifecycle,
* cache boundaries,
* freshness semantics,
* disposable operational state.

This unit prevents:

* cache-as-truth,
* materialized temporal systems,
* distributed cache drift.

---

## REQUIRED RESEARCH

Research:

* ephemeral projections
* cache invalidation
* freshness requirements
* operational tolerances

---

## REQUIRED IMPLEMENTATION

Create:

```text id="ls4c9h"
docs/platform-memory/contracts/projection-contracts.md
```

Must define:

* projection lifecycle
* cache boundaries
* invalidation rules
* freshness semantics

---

## REQUIRED VALIDATIONS

Verify:

* projections remain disposable
* cache is never authoritative
* no distributed cache assumptions exist

---

## FORBIDDEN DIRECTIONS

DO NOT:

* create Redis dependency
* create persistent projections
* create distributed invalidation
* create projection infrastructure framework

---

## REQUIRED REPORT

Provide:

* projection lifecycle
* cache boundaries
* invalidation strategy
* drift risks
* files changed
* build status

STOP after report.

---

# UNIT 05 — TIMEZONE SEMANTICS

Status: BLOCKED BY UNIT 04

---

## PURPOSE

Stabilize:

* timezone ownership,
* conversion boundaries,
* DST handling,
* temporal authority.

This unit prevents:

* hidden timezone corruption,
* implicit conversion logic,
* frontend/backend temporal divergence.

---

## REQUIRED RESEARCH

Research:

* provider timezone authority
* customer timezone visibility
* UTC storage boundaries
* DST semantics

---

## REQUIRED IMPLEMENTATION

Create:

```text id="xg0g1s"
docs/platform-memory/contracts/timezone-contracts.md
```

Must define:

* timezone ownership
* conversion boundaries
* storage semantics
* DST rules

---

## REQUIRED VALIDATIONS

Verify:

* timezone conversion remains explicit
* no hidden conversion helpers emerge
* no frontend-owned temporal truth exists

---

## FORBIDDEN DIRECTIONS

DO NOT:

* auto-convert silently
* create global timezone manager
* create timezone orchestration layer

---

## REQUIRED REPORT

Provide:

* timezone authority map
* conversion map
* DST handling strategy
* drift risks
* files changed
* build status

STOP after report.

---

# UNIT 06 — CONCURRENCY & RELIABILITY

Status: BLOCKED BY UNIT 05

---

## PURPOSE

Validate:

* temporal durability,
* concurrent booking safety,
* stale projection safety,
* transaction boundaries.

---

## REQUIRED RESEARCH

Research:

* double booking
* concurrent reschedule
* stale projections
* race conditions
* transactional guarantees

---

## REQUIRED IMPLEMENTATION

Create:

```text id="l0opoq"
docs/platform-memory/audits/booking-concurrency-audit.md
```

Must define:

* concurrency matrix
* reliability guarantees
* acceptable inconsistency
* final authority rules

---

## REQUIRED VALIDATIONS

Verify:

* database remains final authority
* no distributed locking appears
* no reservation queue appears

---

## FORBIDDEN DIRECTIONS

DO NOT:

* add distributed locks
* add queues
* add saga patterns
* add reservation workers

---

## REQUIRED REPORT

Provide:

* concurrency matrix
* race condition analysis
* reliability assessment
* drift risks
* files changed
* build status

STOP after report.

---

# UNIT 07 — OPERATIONAL UX PHILOSOPHY

Status: BLOCKED BY UNIT 06

---

## PURPOSE

Define:

* observational calendar UX,
* operational visibility,
* management semantics.

Prevent:

* orchestration UI,
* workflow UX,
* drag-and-drop scheduling systems.

---

## REQUIRED RESEARCH

Research:

* operational visibility
* management interactions
* safe calendar UX
* forbidden orchestration UX

---

## REQUIRED IMPLEMENTATION

Create:

```text id="k30txz"
docs/platform-memory/philosophy/calendar-operational-philosophy.md
```

Must define:

* operational UI rules
* observational UX boundaries
* forbidden UX directions

---

## REQUIRED VALIDATIONS

Verify:

* frontend remains operational-only
* runtime orchestration stays backend-owned

---

## FORBIDDEN DIRECTIONS

DO NOT:

* create drag-drop orchestration
* create workflow boards
* create visual scheduling systems

---

## REQUIRED REPORT

Provide:

* UX philosophy
* operational interaction model
* forbidden UX patterns
* drift risks
* files changed
* build status

STOP after report.

---

# UNIT 08 — SCALABILITY BOUNDARIES

Status: BLOCKED BY UNIT 07

---

## PURPOSE

Define:

* safe scaling path,
* computational limits,
* future bottlenecks,
* safe optimization boundaries.

Prevent:

* premature infrastructure,
* distributed systems drift,
* queue-first scaling.

---

## REQUIRED RESEARCH

Research:

* projection scaling
* recomputation scaling
* invalidation scaling
* query pressure

---

## REQUIRED IMPLEMENTATION

Create:

```text id="3yr2mv"
docs/platform-memory/audits/booking-scalability-analysis.md
```

Must define:

* bottleneck map
* safe optimization paths
* forbidden infrastructure paths

---

## REQUIRED VALIDATIONS

Verify:

* monolith remains sufficient
* no microservice pressure exists
* no queue pressure exists

---

## FORBIDDEN DIRECTIONS

DO NOT:

* introduce Redis
* introduce Kafka
* introduce queues
* introduce distributed scheduling

---

## REQUIRED REPORT

Provide:

* scalability analysis
* bottleneck map
* optimization paths
* forbidden infrastructure map
* drift risks
* files changed
* build status

STOP after report.

---

# FINAL SUCCESS CONDITION

Booking Engine succeeds IF:

BotGrandFather supports:

* sophisticated temporal operational systems

WITHOUT becoming:

* scheduling framework,
* orchestration platform,
* temporal infrastructure engine.

That boundary MUST remain intact permanently.
