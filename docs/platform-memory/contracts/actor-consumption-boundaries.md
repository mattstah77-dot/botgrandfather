# Actor Consumption Boundaries

**Purpose:** Define what each actor MAY see, aggregate, and MUST NEVER mutate  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 05 — Projection Consumption & Operational Read Models  
**Date:** 2026-05-23

---

## CUSTOMER

### What Customer MAY See

| Data | Source | Scope |
|------|--------|-------|
| Own bookings | Booking capability | Own customerId |
| Own tickets | Support capability | Own customerId |
| Own leads | Lead Funnel capability | Own customerId |
| Available slots | Booking capability | Bot-scoped |
| Bot configuration | Bot entity | Public bot info |

### What Customer MAY Aggregate

| Aggregation | Example |
|-------------|---------|
| Own booking count | "I have 3 bookings" |
| Own ticket count | "I have 1 open ticket" |
| Own activity timeline | "Booked, then ticketed" |

### What Customer MUST NEVER See

| Data | Why Forbidden |
|------|--------------|
| Other customers' bookings | Privacy |
| Owner dashboard | Owner authority |
| Bot metrics | Owner authority |
| Ticket assignments | Operator authority |
| Platform analytics | Platform authority |

### What Customer MUST NEVER Mutate

| Action | Why Forbidden |
|--------|--------------|
| Other customer data | Privacy violation |
| Bot configuration | Owner authority |
| Ticket assignments | Operator authority |
| Owner state | Owner authority |

---

## OWNER

### What Owner MAY See

| Data | Source | Scope |
|------|--------|-------|
| Bot bookings | Booking capability | Own botId |
| Bot tickets | Support capability | Own botId |
| Bot leads | Lead Funnel capability | Own botId |
| Bot customers | Customer entity | Own botId |
| Bot metrics | All capabilities | Own botId |
| Bot configuration | Bot entity | Own botId |

### What Owner MAY Aggregate

| Aggregation | Example |
|-------------|---------|
| Bot booking counts | "10 bookings this week" |
| Status distributions | "5 confirmed, 3 pending" |
| Cross-capability totals | "15 total interactions" |
| Customer activity | "Customer X booked twice" |

### What Owner MUST NEVER See

| Data | Why Forbidden |
|------|--------------|
| Other owners' bots | Multi-tenant isolation |
| Other owners' customers | Privacy |
| Platform-level metrics | Platform authority |
| Customer identities beyond bot | Privacy |

### What Owner MUST NEVER Mutate

| Action | Why Forbidden |
|--------|--------------|
| Other owner data | Multi-tenant violation |
| Customer identity | Privacy |
| Platform state | Platform authority |
| Capability runtime | Runtime isolation |

---

## OPERATOR (Future)

### What Operator MAY See

| Data | Source | Scope |
|------|--------|-------|
| Assigned tickets | Support capability | Assigned only |
| Ticket history | Support capability | Assigned only |
| Customer identity | Customer entity | Ticket context |

### What Operator MAY Aggregate

| Aggregation | Example |
|-------------|---------|
| Personal workload | "I have 5 open tickets" |
| Response metrics | "Average 2h response" |

### What Operator MUST NEVER See

| Data | Why Forbidden |
|------|--------------|
| Booking runtime state | Capability isolation |
| Lead funnel data | Capability isolation |
| Other operators' tickets | Role boundary |
| Bot configuration | Owner authority |

### What Operator MUST NEVER Mutate

| Action | Why Forbidden |
|--------|--------------|
| Bot configuration | Owner authority |
| Booking state | Capability isolation |
| Lead state | Capability isolation |
| Other operator assignments | Role boundary |

---

## PLATFORM

### What Platform MAY See

| Data | Source | Scope |
|------|--------|-------|
| Aggregated metrics | All capabilities | Anonymized |
| System health | Infrastructure | Platform-level |
| Tenant counts | Bot/Customer entities | Aggregated |

### What Platform MAY Aggregate

| Aggregation | Example |
|-------------|---------|
| Total bot count | "1000 active bots" |
| Total interactions | "50000 bookings" |
| System usage | "CPU at 50%" |

### What Platform MUST NEVER See

| Data | Why Forbidden |
|------|--------------|
| Individual customer data | Privacy |
| Individual owner data | Privacy |
| Business operational state | Owner authority |

### What Platform MUST NEVER Mutate

| Action | Why Forbidden |
|--------|--------------|
| Business state | Owner authority |
| Customer data | Privacy |
| Operational state | Owner authority |
| Capability behavior | Capability isolation |

---

## MUTATION BOUNDARY SUMMARY

| Actor | May Mutate Own | May Mutate Bot | May Mutate Platform | May Mutate Others |
|-------|---------------|----------------|---------------------|-------------------|
| **Customer** | ✅ Own bookings/tickets | ❌ | ❌ | ❌ |
| **Owner** | ✅ Bot config | ✅ Bot operational state | ❌ | ❌ |
| **Operator** | ✅ Assigned tickets | ❌ | ❌ | ❌ |
| **Platform** | ❌ | ❌ | ✅ Infrastructure only | ❌ |

---

## NO ACTOR GAINS ORCHESTRATION AUTHORITY

### Universal Forbidden Actions (All Actors)

| Action | Why Forbidden |
|--------|--------------|
| Cross-capability mutation | Orchestration |
| Automated trigger | Automation |
| Workflow execution | Workflow engine |
| State synchronization | Sync system |
| Business logic decision | Decision engine |

---

## CANONICAL RULES

### Rule 1: Actors Consume Within Scope

Each actor consumes only data within their authority boundary.

### Rule 2: Actors Do Not Cross Mutate

No actor mutates state outside their scope.

### Rule 3: No Actor Orchestrates

No actor triggers cross-capability workflows.

### Rule 4: No Actor Automates

No actor triggers automated actions.

### Rule 5: Aggregation Is Observational

Actors aggregate data for visibility, not for action.

---

**Version 1.0 — UNIT 05 — 2026-05-23**
