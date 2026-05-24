# Contract Stabilization Report

**Purpose:** Comprehensive audit and stabilization of operational contracts  
**Status:** CANONICAL — Tier 3 State  
**Version:** 1.0  
**Date:** 2026-05-23

---

## EXECUTIVE SUMMARY

This report audits all capability-related contracts after Operational UI Completion phase. The platform has reached sufficient maturity (2 templates, generic operational shell) to stabilize contracts WITHOUT introducing framework drift.

**Key Findings:**
- ✅ Capability Provider pattern is stable and proven
- ✅ Event taxonomy is canonical and consistent
- ✅ Navigation metadata contract is stable
- ⚠️ Settings contract needs minimal stabilization
- ⚠️ Action contract needs explicit documentation
- ⚠️ Frontend capability contracts lack explicit versioning

**Drift Risk:** LOW — No framework patterns detected. All contracts remain explicit and bounded.

---

## TASK GROUP 1 — CAPABILITY CONTRACT AUDIT

### 1.1 OperationalWidget Contract

**Current State:**
```typescript
interface OperationalWidget {
  id: string;
  type: 'metric' | 'list' | 'chart' | 'custom';
  title: string;
  description?: string;
  capability?: string;
  data?: Record<string, unknown>;
  action?: { type: 'navigate'; route: string; };
}
```

**Audit Findings:**

| Field | Status | Notes |
|-------|--------|-------|
| `id` | ✅ Canonical | Unique identifier |
| `type` | ✅ Canonical | Bounded union (4 values) |
| `title` | ✅ Canonical | Display label |
| `description` | ✅ Canonical | Optional context |
| `capability` | ✅ Canonical | Provider key |
| `data` | ⚠️ Transitional | `Record<string, unknown>` is safe but untyped |
| `action` | ✅ Canonical | Bounded navigation only |

**Drift Risk:** LOW — Widget contract is flat, non-recursive, explicit.

**Stabilization Recommendation:**
- Keep `data` as `Record<string, unknown>` — typing per widget type would over-engineer.
- Do NOT add `children`, `renderers`, or `schema` fields.
- Do NOT make `action` a union of action types (keep navigation-only).

---

### 1.2 CapabilityView Contract

**Current State:**
```typescript
interface CapabilityView {
  key: string;
  title: string;
  navigation: NavigationItem[];
  widgets: OperationalWidget[];
  meta: {
    ownerId?: string;
    botId?: string;
    template?: string;
    capabilities?: string[];
  };
}
```

**Audit Findings:**

| Field | Status | Notes |
|-------|--------|-------|
| `key` | ✅ Canonical | View identifier |
| `title` | ✅ Canonical | Display title |
| `navigation` | ✅ Canonical | Composed from `NavigationItem[]` |
| `widgets` | ✅ Canonical | Composed from `OperationalWidget[]` |
| `meta` | ✅ Canonical | Context only, no logic |

**Drift Risk:** NONE — View contract is pure composition, no recursion.

**Stabilization Recommendation:**
- Contract is stable. No changes needed.
- Do NOT add `layout`, `grid`, or `position` fields (UI framework drift).

---

### 1.3 NavigationItem Contract

**Current State:**
```typescript
interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  source?: 'universal' | 'template';
  template?: string;
}
```

**Audit Findings:**

| Field | Status | Notes |
|-------|--------|-------|
| `id` | ✅ Canonical | Unique identifier |
| `label` | ✅ Canonical | Display text |
| `route` | ✅ Canonical | Route path |
| `icon` | ✅ Canonical | Optional emoji |
| `source` | ✅ Canonical | Distinguishes universal vs template |
| `template` | ✅ Canonical | Template key if source === 'template' |

**Drift Risk:** LOW — Navigation is flat, explicit.

**Stabilization Recommendation:**
- Do NOT add `children` (recursive navigation is framework drift).
- Do NOT add `permission` or `visibility` fields (authorization logic).
- Do NOT add `onClick` or `handler` fields (behavior in metadata).

---

### 1.4 CapabilityAction Contract

**Current State:** Frontend uses implicit pattern:
```typescript
// BotOverviewPage.tsx
const CAPABILITY_ACTIONS: Record<string, CapabilityAction[]> = {
  booking: [
    { id: 'view-bookings', label: 'View Bookings', route: '/capabilities/bookings', icon: '📅' },
  ],
};
```

**Audit Findings:**

| Issue | Status | Notes |
|-------|--------|-------|
| Contract not formalized | ⚠️ MISSING | No TypeScript interface |
| Frontend-defined | ⚠️ TRANSITIONAL | Backend should provide actions |
| Route-based only | ✅ SAFE | No behavior metadata |

**Drift Risk:** MEDIUM — Action contract is implicit, may drift toward behavior metadata.

**Stabilization Recommendation:**
- Create explicit `CapabilityAction` interface.
- Backend provides available actions via API (not hardcoded in frontend).
- Keep actions as navigation descriptors only (no behavior metadata).

---

### 1.5 DashboardCapabilityProvider Contract

**Current State:**
```typescript
interface DashboardCapabilityProvider {
  getCapabilityKey(): string;
  getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics>;
  getBotMetrics(botId: string): Promise<CapabilityMetrics>;
}

interface CapabilityMetrics {
  capability: string;
  total: number;
  additional?: Record<string, number>;
}
```

**Audit Findings:**

| Method | Status | Notes |
|--------|--------|-------|
| `getCapabilityKey()` | ✅ Canonical | Explicit registration key |
| `getOwnerMetrics()` | ✅ Canonical | Owner-level aggregation |
| `getBotMetrics()` | ✅ Canonical | Bot-level metrics |

**Drift Risk:** NONE — Provider pattern is stable, proven with 2 templates.

**Stabilization Recommendation:**
- Contract is stable. No changes needed.
- Do NOT add `getDashboardWidgets()` (widget provision is separate concern).
- Do NOT add `getSettings()` (settings are metadata, not runtime).

---

### 1.6 OwnerModuleRegistry Metadata

**Current State:**
```typescript
interface OwnerModuleDefinition {
  template: string;
  displayName: string;
  navigation: NavigationSection[];
  settings: SettingsSection[];
  analyticsWidgets: AnalyticsWidget[];
  usesCustomerLayer: boolean;
  createsLeads: boolean;
  hasCustomerMiniApp?: boolean;
}
```

**Audit Findings:**

| Field | Status | Notes |
|-------|--------|-------|
| `template` | ✅ Canonical | Module key |
| `displayName` | ✅ Canonical | Display name |
| `navigation` | ✅ Canonical | Navigation sections |
| `settings` | ⚠️ NEEDS STABILIZATION | See Settings Contract section |
| `analyticsWidgets` | ✅ Canonical | Widget definitions |
| `usesCustomerLayer` | ⚠️ TEMPLATE-SPECIFIC | Booking/lead-funnel flag |
| `createsLeads` | ⚠️ TEMPLATE-SPECIFIC | Lead-funnel flag |
| `hasCustomerMiniApp` | ⚠️ TEMPLATE-SPECIFIC | Booking flag |

**Drift Risk:** MEDIUM — Template-specific flags may proliferate.

**Stabilization Recommendation:**
- Keep template-specific flags minimal (3 is acceptable for 2 templates).
- Do NOT add `capabilities[]` or `features[]` arrays (capability enumeration drift).
- Consider deprecating `createsLeads` at 3+ templates (replaced by capability-neutral metrics).

---

## TASK GROUP 2 — SETTINGS CONTRACT FOUNDATION

### 2.1 Current Settings Pattern

**Current State:**
```typescript
interface SettingsSection {
  id: string;
  label: string;
  description?: string;
  fields: SettingsField[];
}

interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'toggle' | 'number';
  required?: boolean;
  options?: { label: string; value: string }[];
  default?: any;
}
```

**Audit Findings:**

| Issue | Status | Risk |
|-------|--------|------|
| Field typing | ✅ Explicit | Bounded union of 5 types |
| Options for select | ✅ Explicit | Simple label/value pairs |
| Default values | ⚠️ `any` type | Type-unsafe but acceptable for metadata |
| Validation rules | ❌ MISSING | No validation semantics defined |
| Update flow | ⚠️ IMPLICIT | No explicit contract for settings updates |

**Drift Risk:** MEDIUM — Validation semantics undefined.

### 2.2 Settings Contract Stabilization

**PROPOSED MINIMAL CONTRACT:**

```typescript
interface SettingsSection {
  id: string;
  label: string;
  description?: string;
  fields: SettingsField[];
}

interface SettingsField {
  key: string;
  label: string;
  type: SettingsFieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  default?: unknown;
  placeholder?: string;
  helpText?: string;
}

type SettingsFieldType = 
  | 'text'      // Single-line string
  | 'textarea'  // Multi-line string
  | 'select'    // Dropdown (requires options)
  | 'toggle'    // Boolean
  | 'number';   // Numeric value

/**
 * Settings Update Request
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Frontend sends raw values. Backend validates.
 * Frontend NEVER owns business validation logic.
 */
interface SettingsUpdateRequest {
  botId: string;
  sectionId: string;
  values: Record<string, unknown>;
}

/**
 * Settings Update Response
 * 
 * Returns validation errors if any.
 * Returns updated settings on success.
 */
interface SettingsUpdateResponse {
  success: boolean;
  errors?: {
    field: string;
    message: string;
  }[];
  updatedSettings?: Record<string, unknown>;
}
```

**VALIDATION OWNERSHIP RULES:**

| Validation Type | Owner | Why |
|----------------|-------|-----|
| Type validation (string, number, boolean) | Frontend (UX) | Immediate feedback |
| Required field validation | Frontend (UX) | Immediate feedback |
| Business validation (e.g., "slot duration must be 15-120 min") | Backend (runtime service) | Business logic |
| Cross-field validation (e.g., "end time > start time") | Backend (runtime service) | Business logic |
| Authorization (owner can update this bot) | Backend (guard) | Security |

**ANTI-PATTERN WARNING:**

```typescript
// ❌ FORBIDDEN — Metadata-driven validation
const validationRules = {
  'booking.slotDuration': { min: 15, max: 120, type: 'number' },
  'booking.workingHours': { type: 'array', minLength: 1 },
};
// Runtime validates from metadata

// ✅ CORRECT — Explicit validation in service
async updateSettings(botId: string, values: SettingsValues) {
  if (values.slotDuration < 15 || values.slotDuration > 120) {
    throw new BadRequestException('Slot duration must be 15-120 minutes');
  }
}
```

---

## TASK GROUP 3 — ACTION CONTRACT STABILIZATION

### 3.1 Current Action Pattern

**Current State:**
```typescript
// Frontend implicit pattern
interface CapabilityAction {
  id: string;
  label: string;
  route: string;
  icon?: string;
}
```

**Audit Findings:**

| Issue | Status | Risk |
|-------|--------|------|
| Contract implicit | ⚠️ MISSING | No TypeScript interface |
| Navigation-only | ✅ SAFE | No behavior metadata |
| Backend-provided | ⚠️ PARTIAL | `availableActions` added for booking, not generic |

### 3.2 Action Contract Stabilization

**PROPOSED MINIMAL CONTRACT:**

```typescript
/**
 * CapabilityAction — operational action descriptor.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Actions are NAVIGATION DESCRIPTORS ONLY.
 * They do NOT contain behavior, conditions, or orchestration.
 */
interface CapabilityAction {
  /** Unique action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Navigation route (for navigate-type actions) */
  route?: string;

  /** Optional icon emoji */
  icon?: string;

  /** Optional API endpoint (for lifecycle actions) */
  endpoint?: {
    method: 'POST' | 'DELETE';
    path: string;
  };

  /** Action type — determines how frontend handles it */
  type: 'navigate' | 'lifecycle';
}

/**
 * Available Actions Response
 * 
 * Backend returns available actions for a resource.
 * Frontend renders buttons from this metadata.
 */
interface AvailableActionsResponse {
  resourceId: string;
  actions: CapabilityAction[];
}
```

**ACTION SEMANTICS:**

| Action Type | Frontend Behavior | Backend Responsibility |
|-------------|------------------|----------------------|
| `navigate` | Navigate to `route` | None (navigation only) |
| `lifecycle` | Call `endpoint`, refresh | Execute business logic, return result |

**ANTI-PATTERN WARNING:**

```typescript
// ❌ FORBIDDEN — Behavior metadata
interface CapabilityAction {
  id: string;
  label: string;
  onClick: () => void;           // NO! Behavior in metadata
  conditions: Condition[];       // NO! Logic in metadata
  workflow: WorkflowStep[];      // NO! Orchestration in metadata
}

// ✅ CORRECT — Navigation descriptor only
interface CapabilityAction {
  id: string;
  label: string;
  route?: string;
  endpoint?: { method: 'POST'; path: string; };
  type: 'navigate' | 'lifecycle';
}
```

---

## TASK GROUP 4 — EVENT TAXONOMY HARDENING

### 4.1 Current Event Taxonomy

**Canonical Events (Verified):**

| Event | Category | Status |
|-------|----------|--------|
| `session.started` | Runtime | ✅ Canonical |
| `session.completed` | Runtime | ✅ Canonical |
| `session.abandoned` | Runtime | ✅ Canonical |
| `conversion.completed` | Conversion | ✅ Canonical |
| `customer.created` | Customer Lifecycle | ✅ Canonical |
| `customer.updated` | Customer Lifecycle | ✅ Canonical |
| `customer.converted` | Customer Lifecycle | ✅ Canonical |
| `booking.created` | Booking Capability | ✅ Canonical |
| `booking.confirmed` | Booking Capability | ✅ Canonical |
| `booking.cancelled` | Booking Capability | ✅ Canonical |
| `booking.completed` | Booking Capability | ✅ Canonical |

**Audit Findings:**

| Issue | Status | Notes |
|-------|--------|-------|
| Dot notation | ✅ Consistent | All events use `domain.subject.verb` |
| Past tense | ✅ Consistent | All events are facts |
| Capability-neutral | ✅ Mostly | `booking.*` events are template-specific (acceptable) |
| Metadata usage | ✅ Consistent | `template: 'booking'` in metadata |

### 4.2 Event Taxonomy Rules

**CANONICAL NAMING RULES:**

1. **Dot notation only:** `booking.created` ✅, NOT `booking:created` ❌
2. **Past tense:** `created` ✅, NOT `create` ❌
3. **Singular nouns:** `customer` ✅, NOT `customers` ❌
4. **Capability-neutral where possible:** `conversion.completed` ✅, NOT `booking.completed` for conversion ❌
5. **Domain-first:** `customer.tag.added` ✅, NOT `tag.added.to.customer` ❌

**EVENT CATEGORIES:**

| Category | Purpose | Examples |
|----------|---------|----------|
| Runtime | Template flow events | `session.started`, `session.completed` |
| Conversion | Universal conversion tracking | `conversion.completed` |
| Customer Lifecycle | Customer entity events | `customer.created`, `customer.converted` |
| Capability | Template-specific business events | `booking.created`, `booking.confirmed` |
| Platform | Infrastructure events | `bot.connected`, `subscription.activated` |

**ANTI-PATTERN WARNING:**

```typescript
// ❌ FORBIDDEN — Template-specific core events
await analytics.trackEvent(botId, 'leadfunnel.completed');
await analytics.trackEvent(botId, 'booking:created');

// ✅ CORRECT — Capability-neutral + metadata
await analytics.trackEvent(botId, 'conversion.completed', {
  template: 'lead-funnel',
});
await analytics.trackEvent(botId, 'booking.created', {
  template: 'booking',
});
```

---

## TASK GROUP 5 — DASHBOARD COMPOSITION HARDENING

### 5.1 Current Dashboard Composition

**Pattern:**
```typescript
// DashboardService uses Capability Provider pattern
const providers = this.capabilityRegistry.getAll();
let totalInteractions = 0;
for (const provider of providers) {
  const metrics = await provider.getOwnerMetrics(ownerId);
  totalInteractions += metrics.total;
}
```

**Audit Findings:**

| Component | Status | Notes |
|-----------|--------|-------|
| `DashboardCapabilityRegistry` | ✅ Stable | Explicit registration, no dynamic discovery |
| `DashboardService` | ✅ Stable | Uses registry, no direct template injection |
| `getOwnerMetrics()` | ✅ Stable | Aggregates capability-neutral interactions |
| `getBotMetrics()` | ✅ Stable | Per-bot capability metrics |

### 5.2 Dashboard Composition Rules

**UNIVERSAL DASHBOARD METRICS:**

```typescript
interface DashboardStats {
  totalBots: number;           // Universal
  totalCustomers: number;      // Universal
  totalInteractions: number;   // Capability-neutral aggregation
}
```

**CAPABILITY WIDGETS:**

| Widget | Provider | Status |
|--------|----------|--------|
| Total Bookings | `BookingQueryService` | ✅ Template-specific |
| Upcoming Bookings | `BookingQueryService` | ✅ Template-specific |
| Total Leads | `LeadFunnelQueryService` | ✅ Template-specific |
| Conversion Rate | Any capability provider | ✅ Universal pattern |

**COMPOSITION RULES:**

1. **Universal metrics first:** Dashboard shows `totalInteractions`, not `totalBookings`.
2. **Capability widgets secondary:** Template-specific widgets appear below universal metrics.
3. **No hardcoded template logic:** DashboardService uses registry, not direct injection.
4. **No booking-centric drift:** Dashboard does NOT show "Bookings" as primary metric.

**ANTI-PATTERN WARNING:**

```typescript
// ❌ FORBIDDEN — Hardcoded template metrics
class DashboardService {
  async getOwnerStats() {
    const bookings = await this.bookingQuery.countBookings();
    const leads = await this.leadQuery.countLeads();
    return { totalBookings: bookings, totalLeads: leads };
  }
}

// ✅ CORRECT — Capability-neutral aggregation
class DashboardService {
  async getOwnerStats() {
    const providers = this.registry.getAll();
    let totalInteractions = 0;
    for (const provider of providers) {
      const metrics = await provider.getOwnerMetrics(ownerId);
      totalInteractions += metrics.total;
    }
    return { totalBots, totalCustomers, totalInteractions };
  }
}
```

---

## TASK GROUP 6 — SETTINGS & CAPABILITY EVOLUTION SAFETY

### 6.1 Safe Evolution Paths

**When 3+ Templates Exist:**

| Evolution | Safe? | Justification |
|-----------|-------|---------------|
| Extract common settings fields | ✅ Yes | Proven repetition |
| Generic settings validation helper | ✅ Yes | Proven repetition |
| Shared settings UI components | ✅ Yes | Frontend utility |
| Universal settings service | ❌ No | Settings are template-specific |

**When 5+ Templates Exist:**

| Evolution | Safe? | Justification |
|-----------|-------|---------------|
| Settings schema versioning | ✅ Yes | Backward compatibility |
| Settings migration helpers | ✅ Yes | Operational utility |
| Dynamic settings forms | ❌ No | Schema-driven UI drift |

### 6.2 Unsafe Evolution Paths (NEVER)

| Evolution | Why Forbidden |
|-----------|---------------|
| Universal settings engine | Settings are template-specific business logic |
| Metadata-driven validation | Validation is business logic, must be in code |
| Dynamic settings schema loading | Schema-driven behavior is framework drift |
| Cross-template settings inheritance | Templates are isolated (Invariant TI.1) |

---

## TASK GROUP 7 — OPERATIONAL COMPOSITION AUDIT

### 7.1 Frontend Composition Audit

**Files Audited:**
- `frontend/owner-miniapp/src/pages/CapabilityPage.tsx`
- `frontend/owner-miniapp/src/pages/BookingDetailPage.tsx`
- `frontend/owner-miniapp/src/pages/BotOverviewPage.tsx`
- `frontend/owner-miniapp/src/api/client.ts`
- `frontend/owner-miniapp/src/types/operational-contracts.ts`

**Findings:**

| Pattern | Status | Notes |
|---------|--------|-------|
| Generic `CapabilityPage` | ✅ Safe | Transforms capability-specific data, no universal renderer |
| Explicit `BookingDetailPage` | ✅ Safe | Capability-specific page, no dynamic loading |
| `CAPABILITY_ACTIONS` descriptors | ✅ Safe | Flat metadata, no recursion |
| `availableActions` from backend | ✅ Safe | Backend-driven action availability |
| Filtering (status, search, sort) | ✅ Safe | Explicit query params, no DSL |

**Drift Detection:** NONE — No framework patterns found.

### 7.2 Backend Composition Audit

**Files Audited:**
- `src/owner-modules/owner-module.registry.ts`
- `src/dashboard/dashboard-capability.registry.ts`
- `src/miniapp/services/dashboard.service.ts`
- `src/templates/booking/booking-query.service.ts`

**Findings:**

| Pattern | Status | Notes |
|---------|--------|-------|
| `OWNER_MODULE_REGISTRY` | ✅ Safe | Simple Map, no recursive schemas |
| `DashboardCapabilityRegistry` | ✅ Safe | Explicit constructor registration |
| `DashboardService` | ✅ Safe | Uses registry, no direct injection |
| `getBookingAvailableActions()` | ✅ Safe | Operational metadata, not business logic |

**Drift Detection:** NONE — No framework patterns found.

---

## TASK GROUP 8 — CANONICAL DOCUMENTATION HARDENING

### 8.1 New Documents Created

| Document | Tier | Purpose |
|----------|------|---------|
| `contracts/settings-contracts.md` | Tier 2 | Settings field semantics, validation ownership |
| `contracts/action-contracts.md` | Tier 2 | Action descriptor semantics, lifecycle actions |
| `philosophy/settings-philosophy.md` | Tier 1 | Settings are operational, not runtime |
| `anti-patterns/metadata-creep.md` | Tier 1 | Detecting and preventing metadata-driven logic |

### 8.2 Updated Documents

| Document | Changes |
|----------|---------|
| `contracts/event-contracts.md` | Added explicit naming rules, anti-patterns |
| `contracts/capability-contracts.md` | Added action contract reference |
| `invariants/metadata-discipline.md` | Strengthened anti-metadata-orchestration language |

---

## ARCHITECTURAL RISK FINDINGS

### High Risk (None Detected)

No high-risk patterns found.

### Medium Risk

| Risk | Location | Mitigation |
|------|----------|------------|
| Template-specific flags in `OwnerModuleDefinition` | `usesCustomerLayer`, `createsLeads`, `hasCustomerMiniApp` | Monitor for flag proliferation. Deprecate at 5+ templates. |
| Implicit action contract in frontend | `BotOverviewPage.tsx` | Formalize `CapabilityAction` interface. |
| `Record<string, unknown>` for widget data | `OperationalWidget.data` | Acceptable — explicit typing would over-engineer. |

### Low Risk

| Risk | Location | Mitigation |
|------|----------|------------|
| `SettingsField.default` is `any` | `owner-module.interface.ts` | Acceptable — metadata is type-unsafe by nature. |
| Frontend `CAPABILITY_MAP` bridge | `client.ts` | Transitional — remove when backend provides generic endpoint. |

---

## FUTURE-SAFE EVOLUTION GUIDANCE

### When to Abstract

| Pattern | Abstract When | How |
|---------|---------------|-----|
| Settings field types | 3+ templates prove identical fields | Extract shared `SettingsField` helpers |
| Action descriptors | 3+ templates use lifecycle actions | Generic `CapabilityAction` interface |
| Widget rendering | 3+ templates need same widget type | Shared widget component |
| Pagination | Already 3+ instances | Extract `usePagination()` hook |
| Status badge | Already 3+ instances | Extract `StatusBadge` component |

### When NOT to Abstract

| Pattern | Why Not |
|---------|---------|
| Universal settings engine | Settings are template-specific business logic |
| Universal action executor | Actions are capability-specific |
| Dynamic component loading | No plugins exist |
| Recursive widget renderer | Widgets are flat |
| Schema-driven forms | Forms are explicit JSX |

---

## EXPLICIT ANTI-PATTERN WARNINGS

### Anti-Pattern 1: Metadata-Driven Validation

```typescript
// ❌ FORBIDDEN
const validationRules = {
  'booking.slotDuration': { min: 15, max: 120, type: 'number' },
};
// Runtime validates from metadata

// ✅ CORRECT
async updateSettings(values: SettingsValues) {
  if (values.slotDuration < 15 || values.slotDuration > 120) {
    throw new BadRequestException('Slot duration must be 15-120 minutes');
  }
}
```

### Anti-Pattern 2: Behavior in Action Metadata

```typescript
// ❌ FORBIDDEN
interface CapabilityAction {
  onClick: () => void;
  conditions: Condition[];
}

// ✅ CORRECT
interface CapabilityAction {
  route?: string;
  endpoint?: { method: 'POST'; path: string; };
  type: 'navigate' | 'lifecycle';
}
```

### Anti-Pattern 3: Recursive Navigation

```typescript
// ❌ FORBIDDEN
interface NavigationItem {
  children?: NavigationItem[];  // Recursive!
}

// ✅ CORRECT
interface NavigationItem {
  id: string;
  label: string;
  route: string;
  // No children — flat navigation
}
```

### Anti-Pattern 4: Template-Specific Dashboard Metrics

```typescript
// ❌ FORBIDDEN
interface DashboardStats {
  totalBookings: number;
  totalLeads: number;
}

// ✅ CORRECT
interface DashboardStats {
  totalBots: number;
  totalCustomers: number;
  totalInteractions: number;  // Aggregated from all capabilities
}
```

---

## CONCLUSION

### Contract Stability Assessment

| Contract | Stability | Notes |
|----------|-----------|-------|
| Capability Provider | ✅ STABLE | Proven with 2 templates |
| Event Taxonomy | ✅ STABLE | Canonical naming enforced |
| Navigation Metadata | ✅ STABLE | Flat, explicit, bounded |
| Widget Contract | ✅ STABLE | Non-recursive, type-safe |
| Settings Contract | ⚠️ STABILIZING | Minimal contract proposed |
| Action Contract | ⚠️ STABILIZING | Explicit interface needed |
| Dashboard Aggregation | ✅ STABLE | Registry pattern proven |

### Drift Risk Assessment

**Overall Risk:** LOW

No framework patterns detected. All contracts remain explicit and bounded. Metadata is used for UI structure only, not business logic. Frontend renders, backend computes.

### Readiness for Template Expansion

**Platform is READY for 3rd template.**

Contracts are stabilized. Anti-drift protections are in place. Capability Provider pattern is proven. Operational shell is generic.

### What Must NOT Be Built

| Forbidden | Why |
|-----------|-----|
| Universal settings engine | Settings are template-specific |
| Plugin runtime | Premature (2 templates) |
| Dynamic component loading | No plugins exist |
| Schema-driven UI | Metadata is for structure, not behavior |
| Universal action executor | Actions are capability-specific |
| Recursive widget renderer | Widgets are flat |

---

**Version 1.0 — 2026-05-23**
