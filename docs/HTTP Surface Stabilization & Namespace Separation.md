# RFC — HTTP Surface Stabilization & Namespace Separation

## BotGrandFather Platform Foundation Correction Phase

Status: PROPOSED
Priority: HIGH
Blocking Future Work: YES
Required Before:

* Booking Engine expansion
* Advanced Mini App APIs
* Shared CRM APIs
* Analytics expansion
* Real-time scheduling APIs

---

# PURPOSE OF THIS RFC

This RFC introduces a controlled stabilization of the platform HTTP surface.

The goal is NOT:

* rewrite architecture
* redesign backend
* introduce gateways
* introduce API abstraction frameworks
* add microservices

The goal IS:

# establish clean and deterministic HTTP boundaries

before platform API complexity increases significantly.

---

# WHY THIS RFC EXISTS

Current architecture evolved organically during Mini App implementation.

As a result:

* SPA routes and API routes partially overlap
* SPA fallback middleware contains exclusions/hacks
* routing logic became fragile
* API namespaces are inconsistent

Examples:

BAD:

```text
/customer/bot/:id/slots
```

because:

* `/customer/*` is both SPA and API namespace
* fallback middleware must manually exclude API routes
* future booking APIs will increase collision risk

Current workaround:

```typescript
if (/^\/bot\//.test(req.path)) return next();
```

This is acceptable as temporary stabilization,
BUT must NOT become platform foundation.

---

# PRIMARY GOALS

After this RFC:

1. SPA routes and API routes fully separated
2. Middleware order deterministic
3. SPA fallback simplified
4. No API exclusions inside SPA middleware
5. API namespaces standardized
6. Future booking APIs become safe to scale

---

# CORE PRINCIPLE

# SPA ROUTES MUST NEVER CONTAIN API ROUTES

---

# TARGET HTTP ARCHITECTURE

## SPA Surfaces

```text
/app/*              -> Owner Mini App SPA
/customer/*         -> Customer Mini App SPA
```

These routes serve:

* HTML
* JS
* CSS
* React Router fallback

ONLY.

---

## API Surfaces

```text
/api/owner/*
/api/customer/*
/api/runtime/*
/api/booking/*
/api/analytics/*
```

These routes return:

* JSON
* API responses
* mutations
* queries

ONLY.

---

# HARD RULES

## Rule 1 — Never mix SPA and API namespaces

BAD:

```text
/customer/bot/:id/slots
```

GOOD:

```text
/api/customer/bot/:id/slots
```

---

## Rule 2 — SPA fallback serves HTML only

Fallback routes:

```text
/app/*
/customer/*
```

must NEVER:

* execute business logic
* return JSON
* proxy API calls

They ONLY:

* return index.html

---

## Rule 3 — API routes always take precedence

Required order:

```text
1. NestJS API routes
2. Static assets
3. SPA fallback
```

NEVER:

```text
Static -> Fallback -> API
```

---

## Rule 4 — No exclusion hacks inside fallback middleware

REMOVE patterns like:

```typescript
if (/^\/bot\//.test(req.path))
```

Architecture should eliminate need for them.

---

## Rule 5 — Future APIs must use /api/*

ALL future APIs:

* booking
* analytics
* dashboard
* CRM
* billing

must live under:

```text
/api/*
```

ONLY.

---

# EXPECTED FINAL ROUTING MAP

## Owner Mini App

### SPA

```text
/app
/app/*
```

### API

```text
/api/owner/dashboard
/api/owner/bots
/api/owner/customers
/api/owner/analytics
```

---

## Customer Mini App

### SPA

```text
/customer
/customer/*
```

### API

```text
/api/customer/bot/:id/slots
/api/customer/bot/:id/bookings
/api/customer/bot/:id/services
```

---

## Runtime

```text
/api/runtime/webhooks/*
```

---

## Booking Engine

```text
/api/booking/availability
/api/booking/slots
/api/booking/resources
/api/booking/services
/api/booking/bookings
```

---

# WHY THIS MATTERS FOR BOOKING ENGINE

Booking engine will dramatically increase API complexity.

Future requests:

* slot generation
* availability computation
* booking creation
* booking validation
* calendar queries
* service availability
* resource allocation

will heavily stress HTTP routing surface.

Without clean separation:

* routing collisions increase
* fallback bugs increase
* debugging complexity increases
* auth surface becomes harder to reason about

This RFC prevents future architectural instability.

---

# TASK EXECUTION PROTOCOL

IMPORTANT:
Tasks MUST be executed sequentially.

Agent MUST:

1. complete ONE task
2. generate detailed report
3. STOP
4. wait for approval

Agent MUST NOT continue automatically.

---

# TASK 1 — HTTP Surface Audit

Goal:
fully map current HTTP architecture.

Requirements:

Document:

* all SPA routes
* all API routes
* middleware order
* static middleware
* fallback middleware
* route collisions
* exclusion hacks
* legacy routes

Required output:

```text
HTTP SURFACE AUDIT REPORT
```

Must include:

* route table
* middleware execution order
* current risks
* namespace conflicts
* proposed migration map

IMPORTANT:
No refactoring yet.

ONLY audit.

---

# TASK 2 — API Namespace Migration Plan

Goal:
prepare safe migration plan.

Requirements:

Map:
OLD:

```text
/customer/bot/:id/*
```

NEW:

```text
/api/customer/bot/:id/*
```

Document:

* affected controllers
* affected frontend calls
* auth guards affected
* middleware affected
* backward compatibility concerns

Required output:

```text
API NAMESPACE MIGRATION REPORT
```

IMPORTANT:
No implementation yet.

ONLY migration planning.

---

# TASK 3 — Refactor Customer API Namespace

Goal:
move customer APIs outside SPA namespace.

Required changes:

FROM:

```text
/customer/bot/:id/*
```

TO:

```text
/api/customer/bot/:id/*
```

Requirements:

* frontend updated
* guards updated
* controllers updated
* no fallback exclusions needed anymore

After completion:
customer SPA and customer APIs fully separated.

Required verification:

* booking flow works
* slot loading works
* booking creation works
* JSON responses correct

Required output:

```text
CUSTOMER API REFACTOR REPORT
```

Then STOP.

---

# TASK 4 — Refactor Owner API Namespace

Goal:
standardize owner APIs.

Requirements:

Move owner APIs under:

```text
/api/owner/*
```

Eliminate:

* mixed legacy namespaces
* inconsistent dashboard endpoints

Required output:

```text
OWNER API STANDARDIZATION REPORT
```

Then STOP.

---

# TASK 5 — Simplify SPA Middleware

Goal:
remove exclusion hacks.

Requirements:

Remove:

```typescript
if (/^\/bot\//.test(req.path))
```

and similar logic.

Final middleware must become simple:

```typescript
API
↓
STATIC
↓
FALLBACK
```

ONLY.

Required output:

```text
SPA MIDDLEWARE SIMPLIFICATION REPORT
```

Then STOP.

---

# TASK 6 — HTTP Surface Verification

Goal:
verify final architecture integrity.

Verify:

* no namespace overlap
* no HTML returned from APIs
* no JSON returned from fallback
* refresh-safe SPA behavior
* React Router compatibility
* API routing consistency
* auth guards still working
* tenant isolation preserved

Required tests:

* owner dashboard
* customer booking flow
* direct API calls
* invalid routes
* SPA refresh
* Telegram launch flow

Required output:

```text
FINAL HTTP SURFACE VERIFICATION REPORT
```

Then STOP.

---

# IMPORTANT NON-GOALS

DO NOT:

* redesign backend
* introduce API gateway
* introduce BFF layer
* add Redis
* add reverse proxies
* add server-side rendering
* introduce Next.js
* rebuild Mini Apps

This RFC is:

# targeted architectural stabilization only.

---

# SUCCESS CRITERIA

After completion:

✅ SPA namespaces isolated
✅ API namespaces isolated
✅ middleware deterministic
✅ no fallback exclusions
✅ clean future booking expansion path
✅ simpler debugging
✅ cleaner auth surface
✅ future-safe API scaling

WITHOUT:

* rewrite
* overengineering
* architecture explosion

---

# EXPECTED STRATEGIC RESULT

This RFC establishes:

# a clean HTTP foundation

for future platform growth.

It enables:

* booking engine expansion
* analytics growth
* dashboard scaling
* future billing APIs
* shared CRM APIs
* additional Mini Apps

WITHOUT routing instability.

---

# FINAL IMPORTANT PRINCIPLE

This RFC exists because:

# complexity must be absorbed intentionally before scale arrives.

Not after.
