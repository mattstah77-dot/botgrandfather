# Operational Composition Philosophy

**Purpose:** Define how operational UI composes from metadata  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0

---

## CORE PRINCIPLE

> **Operational UI composes from metadata. It does not hardcode template specifics.**

The owner dashboard renders from `OwnerModuleRegistry`, not from template-specific conditionals.

---

## COMPOSITION RULES

### Rule 1: Generic Structure, Template-Specific Content

**Good:**
```typescript
// Dashboard renders generic structure
const module = getOwnerModule(template);
return {
  navigation: module.navigation,
  widgets: module.widgets,
  settings: module.settings,
};
```

**Bad:**
```typescript
// Dashboard hardcodes template specifics
if (template === 'lead-funnel') {
  return { widget: 'Leads Widget' };
} else if (template === 'booking') {
  return { widget: 'Bookings Widget' };
}
```

---

### Rule 2: Metadata is Context, Not Business Logic

**Good:**
```typescript
metadata: {
  template: 'booking',
  channel: 'miniapp',
  source: 'webhook'
}
```

**Bad:**
```typescript
metadata: {
  shouldSendNotification: true,  // Business logic!
  retryCount: 3,                 // Infrastructure!
  nextStep: 'confirmBooking'     // Orchestration!
}
```

---

### Rule 3: Navigation Composes from Registry

**Good:**
```typescript
// NavigationService composes from OwnerModuleRegistry
const modules = getAllOwnerModules();
return modules.flatMap(m => m.navigation);
```

**Bad:**
```typescript
// Hardcoded navigation
return [
  { label: 'Leads', route: '/leads' },
  { label: 'Bookings', route: '/bookings' },
];
```

---

### Rule 4: Metrics Are Template-Agnostic

**Good:**
```typescript
// Dashboard shows "Interactions" (universal)
return {
  totalInteractions: leadCount + bookingCount,
};
```

**Bad:**
```typescript
// Dashboard shows template-specific metrics
return {
  leadCount,     // Only for lead-funnel
  bookingCount,  // Only for booking
};
```

---

## METADATA BOUNDARIES

### Metadata SHOULD

- Define navigation items.
- Define settings schemas.
- Define widget types.
- Define capability flags.
- Be explicit and readable.

### Metadata MUST NOT

- Contain business logic.
- Drive runtime execution.
- Define workflow orchestration.
- Replace code with configuration.
- Become recursive or self-referential.

---

## INVARIANTS

> **Invariant OC.1:** Operational UI composes from metadata, not hardcoded templates.

> **Invariant OC.2:** Metadata is context only, never business logic.

> **Invariant OC.3:** Navigation is composed, not hardcoded.

> **Invariant OC.4:** Dashboard metrics are template-agnostic.

> **Invariant OC.5:** Widgets emerge from capability metadata, not from template-specific code.

---

**Version 1.0 — 2026-05-23**
