# Metadata Discipline

**Purpose:** Metadata is a tool, not a goal  
**Status:** CANONICAL — Tier 1 Invariant  
**Version:** 1.0

---

## THE LAW

> **Metadata is a TOOL for operational UI composition, not a GOAL.**
> **Metadata drives rendering, NOT business logic.**

---

## METADATA BOUNDARIES

### What Metadata DOES

- Compose navigation from module registry.
- Render settings forms from JSON schemas.
- Display dashboard widgets from capability contracts.
- Configure operational views.
- Define UI labels and structure.

### What Metadata DOES NOT Do

- Execute business logic.
- Orchestrate template flows.
- Define validation rules beyond form structure.
- Store customer data.
- Replace code.

---

## METADATA TYPES

### Navigation Metadata

```typescript
// ✅ CORRECT
interface OwnerModule {
  key: string;
  name: string;
  icon: string;
  route: string;
  settingsSchema: JSONSchema;
}
```

**Used for:** Composing sidebar navigation.

### Settings Schema

```typescript
// ✅ CORRECT
const bookingSettingsSchema = {
  type: 'object',
  properties: {
    timezone: { type: 'string', enum: ['UTC', 'Europe/Moscow'] },
    slotDuration: { type: 'number', default: 60 },
  },
};
```

**Used for:** Rendering settings form.

**NOT used for:** Business logic execution.

### Dashboard Widget Metadata

```typescript
// ✅ CORRECT
interface DashboardWidget {
  id: string;
  type: 'metric' | 'list' | 'chart';
  title: string;
  dataSource: string; // Capability provider key
}
```

**Used for:** Composing dashboard layout.

**NOT used for:** Data processing.

---

## FORBIDDEN METADATA PATTERNS

### Metadata-Driven Business Logic

```typescript
// ❌ FORBIDDEN
const workflowConfig = {
  steps: [
    { type: 'askName', next: 'askEmail' },
    { type: 'askEmail', next: 'submit' },
  ],
};
// Template executes workflow from config
```

**Why Forbidden:** Metadata replaces code. Code is debuggable. Metadata is opaque.

### Metadata-Driven Validation

```typescript
// ❌ FORBIDDEN
const validationRules = {
  'booking.date': 'required|date|after:today',
  'booking.time': 'required|in:slots',
};
// Runtime validates from metadata
```

**Why Forbidden:** Validation logic belongs in code. Metadata schemas are for UI rendering.

### Metadata-Driven Events

```typescript
// ❌ FORBIDDEN
const eventMap = {
  'booking.created': ['sendNotification', 'updateCalendar'],
};
// Events trigger actions from metadata
```

**Why Forbidden:** Events are facts. Actions are code. Metadata must not bridge them.

---

## METADATA PHILOSOPHY

### Tool, Not Goal

```typescript
// ✅ CORRECT — Metadata is tool for UI
const nav = navigationService.composeFromMetadata();
// Frontend renders navigation

// ❌ FORBIDDEN — Metadata is goal
const logic = metadataService.getBusinessLogic();
// Runtime executes from metadata
```

### Explicit Over Declarative

```typescript
// ✅ CORRECT — Explicit code
if (step === 'askName') {
  await this.askName(customer);
} else if (step === 'askEmail') {
  await this.askEmail(customer);
}

// ❌ FORBIDDEN — Declarative metadata
for (const step of config.steps) {
  await this.executeStep(step);
}
```

### Frontend Renders, Backend Computes

```typescript
// ✅ CORRECT
// Backend: computes data
const metrics = await queryService.getMetrics();
// Frontend: renders from metadata
<DashboardWidget config={widgetConfig} data={metrics} />

// ❌ FORBIDDEN
// Backend: renders from metadata
const html = templateService.renderFromMetadata(data);
```

---

## INVARIANTS

> **Invariant MD.1:** Metadata drives operational UI rendering, NOT business logic execution.

> **Invariant MD.2:** Metadata is tool, not goal.

> **Invariant MD.3:** Business logic remains in code, not metadata.

> **Invariant MD.4:** Validation logic belongs in code, not metadata schemas.

> **Invariant MD.5:** Events are facts. Actions are code. Metadata must not bridge them.

> **Invariant MD.6:** Frontend renders metadata. Backend computes data.

---

**Version 1.0 — 2026-05-23**
