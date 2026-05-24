# Settings Contracts

**Purpose:** Define minimal settings semantics for template operational configuration  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## DEFINITION

**Settings** are operational configuration parameters that owners manage through the dashboard.

Settings are:
- **Operational:** They configure runtime behavior, but do not execute it.
- **Template-owned:** Each template defines its own settings structure.
- **Explicit:** Frontend renders explicit fields, not dynamic schemas.

Settings are NOT:
- **Business logic:** Validation rules live in backend code.
- **Metadata-driven behavior:** Settings schemas describe UI, not logic.
- **Universal:** Each template has different settings.

---

## SETTINGS SECTION CONTRACT

```typescript
/**
 * SettingsSection — a grouped set of configuration fields.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Sections group related fields visually. They do NOT imply
 * storage structure, API structure, or update behavior.
 * Frontend uses sections for layout. Backend validates per-field.
 */
interface SettingsSection {
  /** Unique section identifier */
  id: string;

  /** Display label */
  label: string;

  /** Optional description */
  description?: string;

  /** Fields in this section */
  fields: SettingsField[];
}
```

### Section Semantics

| Field | Required | Notes |
|-------|----------|-------|
| `id` | ✅ Yes | Used for section identification |
| `label` | ✅ Yes | Displayed as section header |
| `description` | Optional | Subtitle or help text |
| `fields` | ✅ Yes | At least one field per section |

### Section Rules

1. **No nesting:** Sections are flat. No sub-sections.
2. **No ordering metadata:** Section order in array defines display order.
3. **No conditional display:** All sections are shown. If conditional, frontend handles explicitly.
4. **No section-level validation:** Validation is per-field.

---

## SETTINGS FIELD CONTRACT

```typescript
/**
 * SettingsField — a single configuration parameter.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Field metadata describes UI rendering. It does NOT describe
 * business validation, storage format, or update behavior.
 * Frontend renders from metadata. Backend validates in code.
 */
interface SettingsField {
  /** Unique field key (used as JSON key in values) */
  key: string;

  /** Display label */
  label: string;

  /** UI field type */
  type: SettingsFieldType;

  /** Whether the field is required */
  required?: boolean;

  /** Options for select-type fields */
  options?: { label: string; value: string }[];

  /** Default value */
  default?: unknown;

  /** Placeholder text */
  placeholder?: string;

  /** Help text below the field */
  helpText?: string;
}

type SettingsFieldType = 
  | 'text'      // Single-line text input
  | 'textarea'  // Multi-line text input
  | 'select'    // Dropdown selection
  | 'toggle'    // Boolean toggle (checkbox/switch)
  | 'number';   // Numeric input
```

### Field Type Semantics

| Type | UI Rendering | Value Type | Options Required |
|------|-------------|------------|-----------------|
| `text` | Single-line input | `string` | No |
| `textarea` | Multi-line input | `string` | No |
| `select` | Dropdown | `string` | Yes |
| `toggle` | Checkbox/Switch | `boolean` | No |
| `number` | Numeric input | `number` | No |

### Field Rules

1. **No custom field types:** Only the 5 canonical types. No `date`, `time`, `color`, `file`.
2. **No conditional fields:** All fields are shown. Frontend handles conditional display explicitly.
3. **No field dependencies:** No `showIf`, `hideIf`, `dependsOn` metadata.
4. **No computed fields:** No `defaultFrom`, `computedFrom` metadata.
5. **No validation rules in metadata:** No `min`, `max`, `pattern`, `format` in field metadata.

---

## VALIDATION OWNERSHIP RULES

### Rule 1: Frontend Validates UX Only

Frontend validates for immediate user feedback:

```typescript
// ✅ CORRECT — Frontend UX validation
function validateField(field: SettingsField, value: unknown): string | null {
  if (field.required && (value === undefined || value === '')) {
    return `${field.label} is required`;
  }
  return null;
}
```

### Rule 2: Backend Validates Business Logic

Backend validates in template service code:

```typescript
// ✅ CORRECT — Backend business validation
async updateBookingSettings(botId: string, values: SettingsValues) {
  if (values.slotDuration !== undefined) {
    if (values.slotDuration < 15 || values.slotDuration > 120) {
      throw new BadRequestException('Slot duration must be 15-120 minutes');
    }
  }
  
  if (values.advanceBookingDays !== undefined) {
    if (values.advanceBookingDays < 1 || values.advanceBookingDays > 365) {
      throw new BadRequestException('Advance booking must be 1-365 days');
    }
  }
}
```

### Rule 3: No Metadata-Driven Validation

```typescript
// ❌ FORBIDDEN — Validation in metadata
interface SettingsField {
  key: string;
  label: string;
  type: 'number';
  validation: {
    min: 15,
    max: 120,
    message: 'Must be 15-120 minutes',
  };
}

// ✅ CORRECT — Validation in code
async updateSettings(values: SettingsValues) {
  if (values.slotDuration < 15 || values.slotDuration > 120) {
    throw new BadRequestException('Slot duration must be 15-120 minutes');
  }
}
```

---

## SETTINGS UPDATE CONTRACT

### Request

```typescript
interface SettingsUpdateRequest {
  /** Bot ID being updated */
  botId: string;

  /** Section ID being updated (optional — update all sections) */
  sectionId?: string;

  /** Field values as key-value pairs */
  values: Record<string, unknown>;
}
```

### Response

```typescript
interface SettingsUpdateResponse {
  /** Whether update succeeded */
  success: boolean;

  /** Validation errors if any */
  errors?: SettingsValidationError[];

  /** Updated settings values */
  updatedValues?: Record<string, unknown>;
}

interface SettingsValidationError {
  /** Field key that failed validation */
  field: string;

  /** Human-readable error message */
  message: string;
}
```

### Update Rules

1. **Partial updates allowed:** Only provided fields are updated.
2. **Ownership verification required:** Owner must own the bot.
3. **Template service validates:** Business logic validation in template code.
4. **No generic settings endpoint:** Each template may have its own update endpoint.

---

## ANTI-PATTERNS

### Anti-Pattern 1: Schema-Driven Forms

```typescript
// ❌ FORBIDDEN — Recursive schema rendering
function renderForm(schema: JSONSchema) {
  return schema.properties.map(p => <Field type={p.type} />);
}

// ✅ CORRECT — Explicit form rendering
function BookingSettingsForm() {
  return (
    <Form>
      <TextField key="businessName" label="Business Name" />
      <TextareaField key="services" label="Services" />
    </Form>
  );
}
```

### Anti-Pattern 2: Conditional Field Metadata

```typescript
// ❌ FORBIDDEN — Conditional display in metadata
interface SettingsField {
  showIf: { field: string; equals: string };
}

// ✅ CORRECT — Explicit conditional in frontend
function SettingsForm() {
  return (
    <Form>
      {template === 'booking' && <BookingFields />}
      {template === 'lead-funnel' && <LeadFunnelFields />}
    </Form>
  );
}
```

### Anti-Pattern 3: Universal Settings Engine

```typescript
// ❌ FORBIDDEN — Universal settings service
class UniversalSettingsService {
  async updateSettings(botId: string, schema: JSONSchema, values: any) {
    // Validates from schema, updates generically
  }
}

// ✅ CORRECT — Template-specific settings service
class BookingSettingsService {
  async updateSettings(botId: string, values: BookingSettingsValues) {
    // Explicit validation for booking settings
  }
}
```

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial settings contract stabilization |

---

**Version 1.0 — 2026-05-23**
