# Canonical Terminology

**Purpose:** Exact meanings of platform terms  
**Status:** CANONICAL — Tier 5 Reference  
**Version:** 1.0

---

## CORE TERMS

### Runtime

The layer that processes Telegram webhooks, executes template business logic, and manages customer lifecycle.

**Synonyms:** Backend (ambiguous, avoid)

### Operational Layer

The layer that provides owner-facing dashboards, analytics views, and settings management.

**Synonyms:** Frontend (ambiguous, avoid), Mini App (specific component)

### Capability

A business domain that a template implements.

Examples: lead management, booking/scheduling, customer relationship.

### Template

A concrete implementation of one or more capabilities.

Examples: Lead Funnel template, Booking template.

### Module

A NestJS module grouping related services, controllers, and entities.

### Provider

A NestJS injectable service.

### Metadata

Configuration data used for operational UI composition.

NOT business logic.

### Orchestration

Explicit service calls in code.

NOT event-driven workflows.

### Customer

Universal entity representing a person interacting with a bot.

NOT lead, NOT user, NOT contact.

### Owner

Person who owns bots on the platform.

NOT admin, NOT user.

### Conversion

Achievement of a template's primary goal.

NOT sale, NOT booking, NOT signup.

### Platform Event

Business fact tracked for analytics.

NOT command, NOT message, NOT signal.

### Semantic Contract

Formalized agreement on naming, payload, or boundary.

### Architectural Invariant

Non-negotiable platform law.

### Platform Memory Layer

This documentation system — canonical architectural memory.

---

## EVENT NAMING

| Correct | Incorrect |
|---------|-----------|
| `session.started` | `session:started` |
| `conversion.completed` | `conversion:achieved` |
| `customer.created` | `customer:created` |
| `booking.created` | `booking:created` |

## METRICS

| Correct | Incorrect |
|---------|-----------|
| Interactions | Leads |
| Flows | Funnels |
| maxInteractionsPerMonth | maxLeadsPerMonth |

---

**Version 1.0 — 2026-05-23**
