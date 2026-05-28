# Actor Semantics Contract

**Purpose:** Define canonical actors and their operational boundaries  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — CANONICAL ACTORS

### Actor List

| Actor | Role | Authority | Scope |
|-------|------|-----------|-------|
| **Customer** | End user of capabilities | Owns their data | Single customer identity |
| **Owner** | Business operator | Owns bot + data | Single bot ownership |
| **Operator** | Human agent (future) | Assists owner | Multi-bot support |
| **Platform** | Infrastructure provider | Platform-level | Cross-tenant visibility |

---

## SECTION 2 — CUSTOMER

### What Customer Owns

| Data | Authority |
|------|-----------|
| Customer profile (identity) | ✅ Full ownership |
| Customer bookings | ✅ Can create, cancel |
| Customer tickets | ✅ Can create, respond |
| Customer leads | ✅ Can convert |

### What Customer May Observe

| Data | Scope |
|------|-------|
| Own bookings | ✅ Full visibility |
| Own tickets | ✅ Full visibility |
| Own leads | ✅ Full visibility |
| Own profile | ✅ Full visibility |

### What Customer May Mutate

| Action | Boundary |
|--------|----------|
| Create booking | ✅ Within capability |
| Cancel own booking | ✅ Within capability |
| Create ticket | ✅ Within capability |
| Respond to ticket | ✅ Within capability |
| Update profile | ✅ Identity only |

### What Customer Must NEVER Control

| Action | Why Forbidden |
|--------|--------------|
| Access other customer data | Privacy violation |
| Access other owner bots | Multi-tenant violation |
| Orchestrate capabilities | Not operational authority |
| Modify operational state | Only own data |
| Trigger automation | No workflow authority |

### Operational Visibility Boundaries

```
Customer
    │
    ├── Owns → customer identity
    │
    ├── Observes → own bookings, tickets, leads
    │
    ├── Mutates → own capability interactions
    │
    └── NEVER → other customer data, other bots, orchestration
```

### Runtime Boundaries

| Boundary | Rule |
|----------|------|
| **Multi-tenant** | Cannot access other customer data |
| **Capability isolation** | Cannot cross capability boundaries |
| **No orchestration** | Cannot trigger cross-capability workflows |
| **No automation** | Cannot trigger automated processes |

---

## SECTION 3 — OWNER

### What Owner Owns

| Data | Authority |
|------|-----------|
| Bot configuration | ✅ Full ownership |
| Bot bookings | ✅ Full visibility, can mutate |
| Bot tickets | ✅ Full visibility, can mutate |
| Bot leads | ✅ Full visibility, can mutate |
| Bot customers | ✅ Read-only visibility |

### What Owner May Observe

| Data | Scope |
|------|-------|
| Own bot bookings | ✅ Full visibility |
| Own bot tickets | ✅ Full visibility |
| Own bot leads | ✅ Full visibility |
| Own bot customers | ✅ Aggregated visibility |
| Own bot metrics | ✅ Full visibility |

### What Owner May Mutate

| Action | Boundary |
|--------|----------|
| Confirm/cancel booking | ✅ Within own bot |
| Create/resolve ticket | ✅ Within own bot |
| Update bot config | ✅ Bot-level |
| Mark booking complete | ✅ Within capability |
| Assign ticket | ✅ Within capability |

### What Owner Must NEVER Control

| Action | Why Forbidden |
|--------|--------------|
| Access other owner bots | Multi-tenant violation |
| Access other owner data | Privacy violation |
| Orchestrate templates | Not workflow authority |
| Trigger automation | No platform authority |
| Modify capability runtime | Runtime is capability-owned |

### Operational Visibility Boundaries

```
Owner
    │
    ├── Owns → bot configuration + operational data
    │
    ├── Observes → own bot bookings, tickets, leads
    │
    ├── Mutates → own bot operational state
    │
    └── NEVER → other owner data, template orchestration
```

### Runtime Boundaries

| Boundary | Rule |
|----------|------|
| **Multi-tenant** | Cannot access other owner bots |
| **Capability runtime** | Cannot modify capability internals |
| **No orchestration** | Cannot trigger cross-capability workflows |
| **No automation** | Cannot trigger platform automation |

---

## SECTION 4 — OPERATOR (FUTURE)

### What Operator Owns

| Data | Authority |
|------|-----------|
| Assigned tickets | ✅ Can respond, resolve |
| Support interactions | ✅ Can assist customers |

### What Operator May Observe

| Data | Scope |
|------|-------|
| Assigned tickets | ✅ Full visibility |
| Support metrics | ✅ Aggregated visibility |
| Customer tickets | ✅ Assigned only |

### What Operator May Mutate

| Action | Boundary |
|--------|----------|
| Respond to ticket | ✅ Assigned tickets only |
| Resolve ticket | ✅ Assigned tickets only |
| Add internal notes | ✅ Assigned tickets only |
| Reassign ticket | ✅ Within support team |

### What Operator Must NEVER Control

| Action | Why Forbidden |
|--------|--------------|
| Access booking runtime | Not booking authority |
| Access customer identity | Privacy boundary |
| Access other operator data | Role boundary |
| Modify bot config | Owner authority |
| Create bookings | Capability authority |

### Operational Visibility Boundaries

```
Operator
    │
    ├── Owns → assigned support tickets
    │
    ├── Observes → assigned tickets, support metrics
    │
    ├── Mutates → assigned ticket state
    │
    └── NEVER → other capabilities, customer identity, bot config
```

### Runtime Boundaries

| Boundary | Rule |
|----------|------|
| **Role-based** | Can only access assigned tickets |
| **Capability isolation** | Cannot access booking/lead runtime |
| **Privacy** | Cannot access customer identity |
| **No orchestration** | Cannot trigger workflows |

---

## SECTION 5 — PLATFORM

### What Platform Owns

| Data | Authority |
|------|-----------|
| Tenant isolation | ✅ Multi-tenant enforcement |
| Authentication | ✅ Identity verification |
| Authorization | ✅ Permission enforcement |
| Infrastructure | ✅ Runtime + database |

### What Platform May Observe

| Data | Scope |
|------|-------|
| Tenant metrics | ✅ Aggregated, anonymized |
| System health | ✅ Infrastructure level |
| Usage patterns | ✅ Aggregated only |

### What Platform May Mutate

| Action | Boundary |
|--------|----------|
| Enforce auth | ✅ Security layer |
| Enforce authorization | ✅ Permission layer |
| Manage tenants | ✅ Multi-tenant layer |
| Handle failures | ✅ Infrastructure |

### What Platform Must NEVER Control

| Action | Why Forbidden |
|--------|--------------|
| Business logic | Capability authority |
| Operational state | Owner authority |
| Customer data | Customer authority |
| Template orchestration | Template isolation |
| Automation triggers | No workflow authority |

### Operational Visibility Boundaries

```
Platform
    │
    ├── Owns → multi-tenant infrastructure
    │
    ├── Observes → aggregated metrics, health
    │
    ├── Mutates → auth, authorization, infrastructure
    │
    └── NEVER → business logic, operational state, orchestration
```

### Runtime Boundaries

| Boundary | Rule |
|----------|------|
| **Business logic** | Cannot modify capability behavior |
| **Operational state** | Cannot mutate owner data |
| **Customer data** | Cannot access customer identity |
| **Template isolation** | Cannot orchestrate templates |

---

## SECTION 6 — ACTOR INTERACTION MATRIX

### Customer ↔ Owner

| Interaction | Allowed | Reason |
|-------------|---------|--------|
| Customer books with owner | ✅ | Capability interaction |
| Customer creates ticket for owner | ✅ | Capability interaction |
| Owner sees customer bookings | ✅ | Operational visibility |
| Owner sees customer tickets | ✅ | Operational visibility |
| Owner modifies customer identity | ❌ | Privacy boundary |
| Customer modifies owner config | ❌ | Owner authority |

---

### Customer ↔ Customer

| Interaction | Allowed | Reason |
|-------------|---------|--------|
| See other customer bookings | ❌ | Privacy violation |
| See other customer tickets | ❌ | Privacy violation |
| Share booking links | ✅ | Explicit sharing |
| Collaborative booking | ❌ | Single-customer authority |

---

### Owner ↔ Platform

| Interaction | Allowed | Reason |
|-------------|---------|--------|
| Owner authenticates | ✅ | Platform authority |
| Platform enforces auth | ✅ | Security layer |
| Platform sees business data | ❌ | Tenant isolation |
| Platform modifies operational state | ❌ | Owner authority |

---

### Operator ↔ Owner

| Interaction | Allowed | Reason |
|-------------|---------|--------|
| Operator assists owner customers | ✅ | Support role |
| Operator sees owner tickets | ✅ | Assigned tickets |
| Operator modifies owner config | ❌ | Owner authority |
| Operator accesses other owner data | ❌ | Tenant isolation |

---

## SECTION 7 — CANONICAL RULES

### Rule 1: Customer Owns Identity

Customer has full authority over their identity and data.

### Rule 2: Customer Cannot Orchestrate

Customer cannot trigger cross-capability workflows.

### Rule 3: Owner Owns Bot

Owner has full authority over their bot and operational data.

### Rule 4: Owner Cannot Orchestrate

Owner cannot trigger cross-capability workflows.

### Rule 5: Operator Role-Based

Operator has limited access based on assignment.

### Rule 6: Platform Infrastructure

Platform enforces multi-tenant isolation, not business logic.

### Rule 7: No Cross-Tenant Access

No actor can access data outside their tenant boundary.

### Rule 8: Capability Runtime Independence

No actor can modify capability runtime behavior.

---

**Version 1.0 — 2026-05-23**
