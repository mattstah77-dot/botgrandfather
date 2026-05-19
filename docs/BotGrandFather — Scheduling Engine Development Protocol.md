# BotGrandFather — Scheduling Engine Development Protocol

## Iterative Architecture & Controlled Execution Rules

IMPORTANT:
This document defines HOW scheduling/booking engine tasks must be executed.

This is NOT a feature task itself.

This is the operational development protocol for all future scheduling-related RFCs and tasks.

The goal:
build a scalable booking/scheduling foundation WITHOUT architectural collapse, regressions, or uncontrolled feature creep.

---

# CORE PRINCIPLE

We are NOT "adding booking features".

We are building:

# reusable scheduling infrastructure

that later can power:

* booking bots
* appointment systems
* consultation systems
* reservation systems
* event scheduling
* staff scheduling
* lead qualification with time booking
* hybrid flows
* future AI scheduling agents

Booking template is ONLY:

* one runtime template
* one UX layer
* one business surface

The scheduling engine itself must remain:

* reusable
* template-agnostic
* business-agnostic
* extensible
* isolated

---

# IMPORTANT DEVELOPMENT PHILOSOPHY

We do NOT build everything at once.

We build:

* stable layers
* clear boundaries
* extensible foundations

MVP support is intentionally limited.

BUT:
architecture must NEVER block future scaling.

Meaning:
we may NOT support a feature today,
but architecture must allow it tomorrow WITHOUT rewrites.

---

# ABSOLUTE RULES

## Rule 1 — Controlled Iteration

Scheduling engine development MUST happen incrementally.

NEVER implement:

* entire scheduling engine in one task
* giant "all-in-one" PRs
* uncontrolled parallel feature development

Each task must:

* solve one architectural layer
* stabilize foundation
* prepare next layer

---

## Rule 2 — Every Task Must Be Self-Contained

Each task MUST:

* define exact scope
* define exact architectural goal
* define exact boundaries
* define what is intentionally NOT implemented

No vague implementation.

---

## Rule 3 — Every Task Must Preserve Future Extensibility

Even if MVP is simple:
architecture MUST support future:

* multi-resource scheduling
* staff assignment
* dynamic availability
* recurring rules
* calendar sync
* timezone logic
* capacity-based booking
* resource pools
* booking policies
* analytics

WITHOUT rewrites.

---

## Rule 4 — No Premature Complexity

DO NOT introduce:

* microservices
* queues
* Kafka
* Redis
* distributed locks
* CQRS
* workflow engines
* rule engines
* complex DSLs

We remain:

# PostgreSQL-first monolith

until real scaling pressure exists.

---

# DEVELOPMENT EXECUTION MODEL

All scheduling development must follow:

# RFC → TASK → REPORT → REVIEW → NEXT TASK

Flow:

```text
RFC discussion
↓
Task implementation
↓
Detailed report generation
↓
Human review
↓
Architecture validation
↓
Fixes if needed
↓
Only then next task
```

---

# IMPORTANT STOP RULE

After EVERY task:

Agent MUST:

1. generate full implementation report
2. STOP execution
3. WAIT for human approval

Agent MUST NEVER automatically continue to next task.

---

# WHY THIS RULE EXISTS

Because:

* scheduling systems are architecture-sensitive
* one incorrect abstraction can damage future scalability
* later tasks depend on previous foundations
* incorrect assumptions compound over time

Human review is mandatory between layers.

---

# REVIEW PROCESS

After task completion:

Human reviewer:

* inspects architecture
* validates boundaries
* validates future extensibility
* validates simplicity
* validates domain correctness

Possible outcomes:

## Outcome A — Approved

Next task may begin.

## Outcome B — Requires Corrections

A correction task is issued.

Next task is BLOCKED until corrections are completed.

---

# IMPORTANT

Future tasks MUST NEVER continue on unstable foundations.

If previous layer is incorrect:
STOP.
Fix architecture first.

---

# CORRECTION TASK RULES

Correction tasks are FIRST-CLASS tasks.

They must:

* explicitly identify architectural problem
* define correction scope
* explain why previous implementation was problematic
* stabilize foundation before continuation

Correction tasks are NOT failures.

They are part of controlled architecture evolution.

---

# TASK DESIGN PRINCIPLES

Every task MUST include:

## 1. Goal

Exact purpose of task.

## 2. Why

Business and architectural reasoning.

## 3. Scope

Exactly what is implemented.

## 4. Non-Goals

Exactly what is intentionally excluded.

## 5. Architecture Constraints

Rules that MUST NOT be violated.

## 6. Expected Result

Concrete final state.

## 7. Required Report

What agent must explain after completion.

---

# REQUIRED REPORT FORMAT

After EACH task agent MUST generate:

# Scheduling Engine Task Report

Sections:

## 1. Executive Summary

What was implemented.

## 2. Architectural Goal

Why this task existed.

## 3. Files Created

List all new files.

## 4. Files Modified

List all modified files.

## 5. Database Changes

Entities, migrations, indexes.

## 6. Domain Model Changes

New domain concepts introduced.

## 7. API Changes

Endpoints/contracts added or modified.

## 8. Scheduling Logic Added

Exact algorithmic behavior introduced.

## 9. Multi-Tenant Verification

How isolation is enforced.

## 10. Extensibility Verification

How future scaling remains possible.

## 11. Limitations

What is intentionally NOT implemented yet.

## 12. Build Verification

* npm run build
* tests
* tsc
* lint

## 13. Risks & Observations

Potential future architectural concerns.

## 14. Recommended Next Task

What should happen next.

---

# SCHEDULING ENGINE DEVELOPMENT STRATEGY

The engine must evolve in layers.

Example evolution:

```text
Layer 1:
Static availability model

Layer 2:
Slot generation

Layer 3:
Booking conflict prevention

Layer 4:
Availability computation

Layer 5:
Working hours & recurrence

Layer 6:
Timezone normalization

Layer 7:
Multi-resource scheduling

Layer 8:
Capacity scheduling

Layer 9:
Calendar integrations

Layer 10:
Optimization & caching
```

IMPORTANT:
Do NOT skip layers.

---

# IMPORTANT ARCHITECTURAL PRINCIPLE

Booking flow UI
≠
Scheduling engine

Mini app
≠
Availability computation

Template
≠
Scheduling domain

Telegram UX
≠
Core scheduling logic

The engine must remain independently evolvable.

---

# FUTURE DOMAIN CAPABILITIES (NOT ALL MVP)

Architecture must preserve ability to support:

## Resources

* rooms
* specialists
* equipment
* virtual sessions

## Policies

* buffers
* cancellation windows
* lead time
* max bookings/day

## Availability

* recurring schedules
* exceptions
* vacations
* holidays
* blackout dates

## Assignment

* auto-assignment
* preferred specialist
* load balancing

## Booking Types

* individual
* group
* capacity-based

## Integrations

* Google Calendar
* Outlook
* Apple Calendar

## Analytics

* conversion
* occupancy
* utilization
* no-show rates

Even if not implemented now,
future support MUST remain possible.

---

# MVP PHILOSOPHY

MVP means:

* reduced functionality
* NOT reduced architecture quality

We intentionally simplify:

* features
* UX
* edge cases

But we DO NOT:

* destroy extensibility
* hardcode assumptions
* create dead-end abstractions

---

# FINAL PRINCIPLE

We are not building:
"a Telegram booking bot"

We are building:

# a reusable scheduling capability layer

inside a multi-tenant business operations platform.

Everything must reflect that.
