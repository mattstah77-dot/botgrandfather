# Settings Philosophy

**Purpose:** Define what settings are, are not, and how they evolve safely  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — SETTINGS ARE

### Operational Configuration

Settings configure how a template behaves. They are operational parameters that owners manage through the dashboard.

**Examples:**
- Booking template: business name, timezone, working hours, services.
- Lead Funnel template: welcome message, questions, completion action.

### Template-Owned

Each template defines its own settings. The platform does NOT enforce a universal settings schema.

**Why:** Different templates have fundamentally different configuration needs. A "booking" template needs "working hours." A "lead funnel" template needs "funnel questions." These are not compatible.

### Explicitly Rendered

Frontend renders settings forms explicitly, not from dynamic schemas.

**Why:** Explicit forms are debuggable, reviewable, and type-safe. Dynamic schema rendering is a framework.

---

## SECTION 2 — SETTINGS ARE NOT

### Business Logic

Settings do NOT contain business logic. They are configuration values, not executable code.

**Violation:** Settings schema contains validation rules.
**Violation:** Settings drive workflow transitions.
**Violation:** Settings define conditional behavior.

### Metadata-Driven Behavior

Settings schemas describe UI structure, not behavior.

**Violation:** JSON schema drives form validation.
**Violation:** Settings metadata defines what happens when a value changes.
**Violation:** Settings define orchestration rules.

### Universal

Settings are NOT universal across templates. Each template has its own settings.

**Violation:** Platform enforces a universal settings schema.
**Violation:** Settings service is generic across all templates.
**Violation:** Cross-template settings inheritance.

---

## SECTION 3 — SETTINGS VALIDATION PHILOSOPHY

### Frontend Validates UX

Frontend validates for immediate user feedback:
- Required fields.
- Type matching (string, number, boolean).

### Backend Validates Business Logic

Backend validates in template service code:
- Business rules (e.g., "slot duration must be 15-120 minutes").
- Cross-field validation (e.g., "end time must be after start time").
- Authorization (owner can update this bot).

### No Metadata-Driven Validation

Validation rules do NOT live in settings metadata.

**Why:** Validation is business logic. Business logic must be in code, not metadata.

---

## SECTION 4 — SETTINGS UPDATE PHILOSOPHY

### Partial Updates

Settings updates are partial. Only provided fields are updated.

### Ownership Verification

All settings updates verify owner owns the bot.

### Template Service Validates

Business logic validation happens in template service code, not in a generic settings service.

### No Generic Settings Endpoint

Each template may have its own settings update endpoint. There is no universal `/settings` endpoint.

---

## SECTION 5 — ANTI-DRIFT PROTECTIONS

### Protection 1: No Schema-Driven Forms

**Forbidden:**
```typescript
function renderForm(schema: JSONSchema) {
  return schema.properties.map(p => <Field type={p.type} />);
}
```

**Enforcement:** Forms are explicit JSX.

### Protection 2: No Metadata-Driven Validation

**Forbidden:**
```typescript
interface SettingsField {
  validation: { min: number; max: number; };
}
```

**Enforcement:** Validation is in code.

### Protection 3: No Universal Settings Engine

**Forbidden:**
```typescript
class UniversalSettingsService {
  async updateSettings(schema: JSONSchema, values: any) { ... }
}
```

**Enforcement:** Template-specific settings services.

### Protection 4: No Conditional Field Metadata

**Forbidden:**
```typescript
interface SettingsField {
  showIf: { field: string; equals: string };
}
```

**Enforcement:** Explicit conditional rendering in frontend.

---

## SECTION 6 — EVOLUTION RULES

### Rule 1: Three Before Universal

Do not create universal settings abstractions until 3+ templates prove identical settings patterns.

### Rule 2: Explicit Before Dynamic

Prefer explicit form rendering over schema-driven forms.

### Rule 3: Code Before Metadata

Prefer validation in code over validation in metadata.

### Rule 4: Template Before Platform

Template defines settings. Platform does NOT enforce settings structure.

---

**Version 1.0 — 2026-05-23**
