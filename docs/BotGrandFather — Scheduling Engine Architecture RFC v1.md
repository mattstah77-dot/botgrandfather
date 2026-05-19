📄 BotGrandFather — Scheduling Engine Architecture RFC v1
0. Document Purpose

This document defines the Scheduling Engine Core for BotGrandFather platform.

It is NOT a booking system implementation.

It is a domain-level capability specification that must be reused across multiple templates:

Booking Template
Future Appointment Systems
Staff Scheduling
Resource Allocation Systems
1. Core Philosophy
1.1 Scheduling is a computation problem

Scheduling is NOT storage of slots.

Scheduling is:

deterministic computation of availability over time under constraints

1.2 Booking is allocation, not event logging

A booking is:

a confirmed resource-time allocation that reduces future availability

1.3 Slots are derived, not stored

Slots are:

projections of availability under constraints

NOT persisted entities.

1.4 Availability is computed state

Availability is:

pure function output from scheduling context

1.5 Engine must be stateless

Scheduling engine MUST:

NOT depend on mutable state
NOT store availability results
NOT rely on runtime side effects
2. Core Domain Concepts
2.1 Service

Defines what is being booked.

Properties:

duration
buffers (before/after)
constraints
required resources
2.2 Resource

Entity that can be scheduled.

Examples:

person (staff)
room
equipment
generic capacity unit
2.3 Booking

Represents:

confirmed allocation of resource over time

Properties:

startTime (UTC)
endTime (UTC)
resourceId
serviceId
userId
status
2.4 Availability

Derived time intervals where booking is possible.

NOT stored.

2.5 Slot

Candidate booking entry derived from availability.

2.6 Constraints

Rules applied to scheduling:

working hours
time off
buffers
lead time
max bookings per slot
resource capacity
2.7 Schedule Context (CRITICAL)

Immutable snapshot used for computation.

Contains:

service definition
resource state
bookings snapshot
time window
timezone
constraints
3. Scheduling Pipeline (Core Algorithm)
STEP 1 — Load Context

Load immutable snapshot:

service
resource(s)
bookings
working hours
exceptions
STEP 2 — Normalize Time

All computation:

convert to business timezone
store output in UTC
STEP 3 — Expand Recurring Availability

Convert:

weekly rules
working hours

into concrete intervals.

STEP 4 — Apply Exceptions

Subtract:

vacations
breaks
manual blocks
STEP 5 — Apply Bookings

Subtract:

existing bookings
buffers (before/after)
STEP 6 — Build Free Intervals

Result:

clean availability intervals
STEP 7 — Generate Slots

Slice intervals into:

service duration windows
step granularity windows
STEP 8 — Apply Business Policies

Filter:

lead time
booking window
service constraints
STEP 9 — Return Result

Return:

AvailableSlot[]
4. Hybrid Model (MVP Strategy)
4.1 Pre-generated data

Can be used for:

recurring availability expansion
cached working hours windows
4.2 Dynamic computation

Must always apply:

bookings
real-time constraints
4.3 Rule

Pre-generation improves performance
Dynamic computation ensures correctness

5. Performance Strategy
5.1 Allowed caching
recurring schedule expansion (7–30 days)
working hours intervals
5.2 Not allowed caching
final slot availability
booking-aware availability
5.3 Invalidation triggers
schedule update
timezone change
service update
resource update
exception update
6. Concurrency Model (Important)

Booking confirmation MUST ensure:

no double booking
atomic allocation
idempotent creation
7. System Boundaries
7.1 MUST NOT depend on
Telegram UI
Mini app frontend
templates
business logic layers
7.2 MUST depend only on
domain models
scheduling context
persistence layer (read-only during compute)
8. Extensibility Requirements

Engine MUST support future:

multi-resource booking
group bookings
capacity-based scheduling
recurring bookings
smart assignment
AI optimization layers
9. MVP Scope

Supported:

single resource booking
fixed duration services
working hours
exceptions
buffers
simple policies

NOT supported yet:

multi-staff optimization
AI scheduling
dynamic pricing
partial bookings
10. Agent Execution Model

This section defines how AI agents MUST work.

10.1 Task Execution Rules

Each task MUST:

implement ONLY defined scope
NOT modify other modules
NOT introduce new abstractions
NOT optimize unrelated systems
10.2 Task Structure

Each task is defined as:

TASK:
Goal
Scope
Inputs
Outputs
Constraints
Acceptance criteria
10.3 Example Task Types
TASK 1 — Domain Entities
implement Service, Booking, Resource
TASK 2 — Interval Engine
implement pure interval arithmetic
TASK 3 — Availability Computation
implement pipeline stages 1–9
TASK 4 — Booking Confirmation Logic
concurrency-safe allocation
TASK 5 — Cache Layer
recurring schedule caching
11. Core Invariants (DO NOT BREAK)
availability is computed
slots are derived
engine is stateless
bookings reduce availability
timezone is normalized
context is immutable
12. Non-Goals
UI design
Telegram integration
template logic
analytics
CRM features
END OF RFC v1