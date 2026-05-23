# Forbidden Directions

**Purpose:** Define what MUST NEVER happen  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0

---

## ABSOLUTELY FORBIDDEN

### 1. Runtime Imports Operational

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
import { DashboardService } from '../miniapp/services/dashboard.service';
import { NavigationService } from '../miniapp/services/navigation.service';
```

**Why:** Breaks foundational separation. Runtime must be independent.

---

### 2. Template-Specific Platform Semantics

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
await analytics.trackEvent(botId, 'funnel.started');
await analytics.trackEvent(botId, 'leadfunnel.converted');
```

**Correct:** `session.started`, `conversion.completed`

---

### 3. Plugin Runtime (Premature)

```typescript
// ❌ FORBIDDEN — NOT YET
class PluginRuntime {
  loadTemplate(packageName: string): Promise<Template>;
  sandboxExecution(template: Template): ExecutionContext;
}
```

**When:** After 10+ templates.

---

### 4. Universal Workflow Engine

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
interface UniversalWorkflow<T> {
  execute(data: T): Promise<WorkflowResult>;
  getConfigSchema(): JSONSchema;
}
```

**Why:** Framework-building, not platform-building.

---

### 5. Metadata-Driven Business Logic

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
const workflowConfig = {
  steps: [
    { type: 'askName', next: 'askEmail' },
    { type: 'askEmail', next: 'submit' },
  ],
};
// Template executes from config
```

**Why:** Metadata is for UI, not business logic.

---

### 6. Cross-Template Imports

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
import { BookingService } from '../booking/booking-runtime.service';
```

**Why:** Breaks template isolation.

---

### 7. Global Queries (No Owner Scope)

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
async getAllCustomers() {
  return this.customerRepo.find(); // No owner filter!
}
```

**Correct:** `async getOwnerCustomers(ownerId: string)`

---

### 8. Dashboard Hardcodes Template Metrics

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
const leadCount = await leadFunnelQuery.countLeadsByBotIds(botIds);
const bookingCount = await bookingQuery.countBookingsByBotIds(botIds);
```

**Correct:** Use `DashboardCapabilityRegistry`.

---

### 9. Booking-Centric Drift

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
interface PlanLimits {
  maxBookingsPerMonth: number;
}
```

**Correct:** `maxInteractionsPerMonth`

---

### 10. Framework-Like Abstractions

```typescript
// ❌ FORBIDDEN — NEVER DO THIS
class BaseTemplateService {
  abstract execute(params: any): Promise<any>;
}

class UniversalBuilder {
  createForm(): FormBuilder;
  createWorkflow(): WorkflowBuilder;
}
```

**Why:** Framework-building, not platform-building.

---

**Version 1.0 — 2026-05-23**
