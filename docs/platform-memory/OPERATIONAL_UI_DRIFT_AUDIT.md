# Operational UI Drift Audit

**Purpose:** Frontend architectural audit after operational UX completion  
**Status:** CANONICAL — Tier 3 State  
**Version:** 1.0  
**Date:** 2026-05-23

---

## AUDIT SCOPE

**Files audited:**
- `frontend/owner-miniapp/src/App.tsx`
- `frontend/owner-miniapp/src/api/client.ts`
- `frontend/owner-miniapp/src/pages/CapabilityPage.tsx`
- `frontend/owner-miniapp/src/pages/BookingDetailPage.tsx`
- `frontend/owner-miniapp/src/pages/BotOverviewPage.tsx`
- `frontend/owner-miniapp/src/pages/DashboardPage.tsx`
- `frontend/owner-miniapp/src/types/operational-contracts.ts`

**Backend files affecting frontend:**
- `src/templates/booking/controllers/booking-lifecycle.controller.ts`
- `src/miniapp/controllers/booking-dashboard.controller.ts`
- `src/templates/booking/booking-query.service.ts`

---

## DRIFT RISKS DETECTED

### Risk 1: Frontend Business Logic (DETECTED & FIXED)

**Location:** `BookingDetailPage.tsx` (before fix)

**Issue:**
```typescript
const canConfirm = booking.status === 'pending';
const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
```

**Why dangerous:** Frontend encoded booking lifecycle rules. If backend changes transitions, frontend becomes stale and misleading.

**Fix:** Backend now returns `availableActions` array. Frontend renders buttons based on backend-provided metadata.

**Status:** ✅ RESOLVED

---

### Risk 2: Capability Map in API Client (ACCEPTABLE)

**Location:** `client.ts`

**Issue:**
```typescript
const capabilityMap: Record<string, string> = {
  bookings: 'booking',
  calendar: 'booking',
  leads: 'lead-funnel',
};
```

**Why transitional:** Navigation IDs differ from backend capability keys. Bridge required until backend provides generic capability endpoint.

**Mitigation:** Explicit, flat, no recursion. Easy to remove when backend evolves.

**Status:** ⚠️ ACCEPTABLE — Remove when backend provides generic `/capabilities/:id` endpoint.

---

### Risk 3: Switch/Case in BotOverviewPage (ACCEPTABLE)

**Location:** `BotOverviewPage.tsx`

**Issue:**
```typescript
function renderCapabilityWidgets(template: string, _botId: string) {
  switch (template) { ... }
}
```

**Why transitional:** Only 2 templates. Widget patterns not proven.

**Mitigation:** Capability action descriptors extracted (`CAPABILITY_ACTIONS`). Widget rendering still explicit.

**Status:** ⚠️ ACCEPTABLE — Abstract at 3+ templates.

---

### Risk 4: Booking-Specific Detail Route (ACCEPTABLE)

**Location:** `App.tsx`

**Issue:**
```typescript
<Route path="/bots/:botId/bookings/:bookingId" element={<BookingDetailPage />} />
```

**Why transitional:** Detail view routes are capability-specific. No generic detail renderer exists.

**Mitigation:** Route is explicit, not dynamic. No `import()` or component registry.

**Status:** ⚠️ ACCEPTABLE — If 3+ templates need detail views, extract pattern.

---

## ANTI-DRIFT PROTECTIONS ADDED

### Protection 1: Backend-Driven Action Availability

**File:** `booking-query.service.ts`

```typescript
getBookingAvailableActions(status: string): string[] {
  switch (status) {
    case 'pending': return ['confirm', 'cancel'];
    case 'confirmed': return ['cancel', 'complete', 'no-show'];
    default: return [];
  }
}
```

**Why:** Booking lifecycle rules live in backend. Frontend is pure rendering.

### Protection 2: Capability Action Descriptors

**File:** `BotOverviewPage.tsx`

```typescript
const CAPABILITY_ACTIONS: Record<string, CapabilityAction[]> = {
  booking: [
    { id: 'view-bookings', label: 'View Bookings', route: '/capabilities/bookings', icon: '📅' },
  ],
};
```

**Why:** Explicit, flat metadata. Composable without framework. No recursion.

### Protection 3: Explicit Route Registration

**File:** `App.tsx`

```typescript
{/* Capability-specific detail routes — EXPLICIT, not dynamic */}
<Route path="/bots/:botId/bookings/:bookingId" element={<BookingDetailPage />} />
```

**Why:** No dynamic route generation. No component registries.

### Protection 4: Operational UI Philosophy Document

**File:** `docs/platform-memory/philosophy/operational-ui-philosophy.md`

**Why:** Canonical reference for future sessions. Defines boundaries explicitly.

---

## WHAT REMAINS INTENTIONALLY EXPLICIT

| Area | Why Explicit | When to Abstract |
|------|-------------|------------------|
| `BookingDetailPage` | Only booking has complex lifecycle | 3+ capabilities need detail views |
| `CapabilityPage` transforms | Each capability has different data shape | Backend provides generic endpoint |
| `CAPABILITY_MAP` in client | Navigation ID → capability key bridge | Backend unifies IDs |
| `renderCapabilityWidgets` | Only 2 templates, patterns unproven | 3+ templates prove widget patterns |
| Route registration | Explicit prevents dynamic loading | Never — explicit routes are fine |
| Action button handlers | Explicit onClick is debuggable | Never — handlers should stay explicit |

---

## REPETITION EMERGING

### Pattern 1: Pagination

**Observed in:**
- `CapabilityPage` (page, limit, total, pages)
- `CustomersPage` (assumed same pattern)

**Status:** 2 instances. Watch. Abstract at 3+.

### Pattern 2: Status Badge

**Observed in:**
- `CapabilityPage`
- `BookingDetailPage`
- `BotOverviewPage` (upcoming bookings)

**Status:** 3 instances. Candidate for extraction.

**Safe extraction:**
```typescript
function StatusBadge({ status }: { status: string }) { ... }
```

### Pattern 3: Telegram BackButton Handling

**Observed in:**
- `CapabilityPage`
- `BookingDetailPage`
- `BotOverviewPage`

**Status:** 3+ instances. Candidate for custom hook.

**Safe extraction:**
```typescript
function useTelegramBackButton(onBack: () => void) { ... }
```

### Pattern 4: Loading/Error States

**Observed in:** All pages.

**Status:** Universal pattern. Safe to extract shared component.

---

## WHAT SHOULD STILL NOT BE ABSTRACTED

### ❌ Universal Detail Renderer

**Why not:** Detail views for booking, leads, customers have incompatible schemas. Forcing them into one renderer creates framework behavior.

### ❌ Generic Action Engine

**Why not:** Actions are capability-specific. Booking has lifecycle actions. Leads have qualification actions. No common denominator.

### ❌ Dynamic Component Loading

**Why not:** No plugins exist. Static imports are debuggable. Dynamic loading is framework-building.

### ❌ Recursive Widget Renderer

**Why not:** Widgets are flat. No nesting needed. Recursive renderers become schema engines.

### ❌ Schema-Driven Forms

**Why not:** Only booking has settings forms. No proven repetition. JSON schema rendering is no-code engine construction.

### ❌ Capability Registry on Frontend

**Why not:** Only 2 capabilities. Frontend does not need runtime capability discovery. Explicit imports are correct.

---

## VERDICT

### Framework Drift Level: NONE

| Check | Status |
|-------|--------|
| Dynamic component loading | ❌ Not present |
| Recursive metadata rendering | ❌ Not present |
| Universal action engine | ❌ Not present |
| Schema-driven forms | ❌ Not present |
| Frontend business logic | ✅ Removed (availableActions) |
| Metadata-driven orchestration | ❌ Not present |
| Plugin runtime | ❌ Not present |

### Architecture Health: STABLE

The frontend successfully completed operational UX maturation WITHOUT mutating into a framework. Explicitness is preserved. Capability composition is validated. Anti-drift protections are in place.

---

**Version 1.0 — 2026-05-23**
