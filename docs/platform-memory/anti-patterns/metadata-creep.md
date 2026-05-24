# Metadata Creep

**Purpose:** Detect and prevent metadata-driven behavior drift  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0  
**Date:** 2026-05-23

---

## DEFINITION

**Metadata creep** is the gradual expansion of metadata from "UI structure description" to "business logic definition."

It is the #1 vector for accidental no-code engine construction.

---

## THE CREEP PATTERN

### Stage 1: UI Structure

```typescript
// ✅ CORRECT — Metadata describes UI
interface NavigationItem {
  id: string;
  label: string;
  route: string;
}
```

### Stage 2: Conditional Display

```typescript
// ⚠️ WARNING — Metadata starts describing behavior
interface NavigationItem {
  id: string;
  label: string;
  route: string;
  showIf: { field: string; equals: string };  // Creep begins
}
```

### Stage 3: Validation Rules

```typescript
// ⚠️ WARNING — Metadata describes validation
interface SettingsField {
  key: string;
  label: string;
  type: string;
  validation: { min: number; max: number; pattern: string };  // Creep continues
}
```

### Stage 4: Orchestration

```typescript
// ❌ FORBIDDEN — Metadata describes business logic
interface WorkflowConfig {
  steps: [
    { type: 'askName', next: 'askEmail' },
    { type: 'askEmail', next: 'submit' },
  ];
}
```

### Stage 5: Framework

```typescript
// ❌ FORBIDDEN — Metadata becomes a programming language
const config = {
  rules: [
    { condition: 'booking.status === "pending"', action: 'sendReminder' },
    { condition: 'booking.date < now + 24h', action: 'notifyOwner' },
  ],
};
```

---

## DETECTION CHECKLIST

### Red Flags

| Pattern | Risk Level | Why Dangerous |
|---------|-----------|---------------|
| `conditions` array in metadata | HIGH | Business logic in metadata |
| `transitions` array in metadata | HIGH | State machine in metadata |
| `validation` object in metadata | MEDIUM | Validation logic in metadata |
| `showIf`/`hideIf` in metadata | MEDIUM | Conditional logic in metadata |
| `children` arrays in metadata | MEDIUM | Recursive metadata renderer |
| `onClick`/`handler` in metadata | HIGH | Behavior in metadata |
| `workflow`/`steps` in metadata | HIGH | Orchestration in metadata |
| `rules` array in metadata | HIGH | Rule engine in metadata |
| `computedFrom` in metadata | MEDIUM | Derived logic in metadata |
| `dependsOn` in metadata | LOW | Dependency logic in metadata |

### Safe Patterns

| Pattern | Why Safe |
|---------|----------|
| `id`, `label`, `route` | Pure UI structure |
| `type: 'text' \| 'textarea' \| 'select'` | Bounded UI type |
| `icon?: string` | Optional display hint |
| `description?: string` | Optional display text |
| `default?: unknown` | Static default value |

---

## PREVENTION RULES

### Rule 1: Metadata Is Structure, Not Logic

**Safe:** Metadata describes what UI elements exist.
**Unsafe:** Metadata describes when elements appear, what they validate, or what they do.

### Rule 2: Business Logic Is Code

**Safe:** Validation in TypeScript service code.
**Unsafe:** Validation in JSON schema or metadata.

### Rule 3: No Recursive Metadata

**Safe:** Flat metadata objects.
**Unsafe:** Metadata with `children`, `nodes`, `tree` structures.

### Rule 4: No Metadata Interpreters

**Safe:** Explicit code handles each case.
**Unsafe:** Generic interpreter processes metadata.

---

## EXAMPLES

### Example 1: Navigation

```typescript
// ✅ SAFE — Pure structure
interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
}

// ❌ CREEP — Conditional display
interface NavigationItem {
  id: string;
  label: string;
  route: string;
  showIf: { field: string; equals: string };
}
```

### Example 2: Settings Fields

```typescript
// ✅ SAFE — Pure structure
interface SettingsField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  required?: boolean;
  options?: { label: string; value: string }[];
}

// ❌ CREEP — Validation in metadata
interface SettingsField {
  key: string;
  label: string;
  type: string;
  validation: {
    min: number;
    max: number;
    pattern: string;
    message: string;
  };
}
```

### Example 3: Actions

```typescript
// ✅ SAFE — Navigation descriptor
interface CapabilityAction {
  id: string;
  label: string;
  route?: string;
  endpoint?: { method: 'POST'; path: string; };
  type: 'navigate' | 'lifecycle';
}

// ❌ CREEP — Behavior in metadata
interface CapabilityAction {
  id: string;
  label: string;
  onClick: () => void;
  conditions: Condition[];
  workflow: WorkflowStep[];
}
```

### Example 4: Widgets

```typescript
// ✅ SAFE — Flat widget descriptor
interface OperationalWidget {
  id: string;
  type: 'metric' | 'list' | 'chart';
  title: string;
  data?: Record<string, unknown>;
}

// ❌ CREEP — Recursive widget tree
interface OperationalWidget {
  id: string;
  type: 'container' | 'widget';
  children?: OperationalWidget[];  // Recursive!
  layout?: { grid: string; position: number; };
}
```

---

## ENFORCEMENT

### Code Review Checklist

When reviewing code that introduces metadata:

- [ ] Does metadata contain `conditions`?
- [ ] Does metadata contain `transitions`?
- [ ] Does metadata contain `validation` rules?
- [ ] Does metadata contain `onClick` or `handler`?
- [ ] Does metadata contain `workflow` or `steps`?
- [ ] Does metadata contain `children` or `nodes`?
- [ ] Does metadata reference other metadata dynamically?
- [ ] Does metadata drive business logic execution?

If ANY answer is YES: **STOP and redesign.**

---

**Version 1.0 — 2026-05-23**
