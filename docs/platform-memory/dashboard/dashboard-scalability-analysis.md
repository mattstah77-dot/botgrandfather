# Dashboard Scalability Analysis

**Purpose:** Validate dashboard scalability across multiple capabilities  
**Status:** CANONICAL — Tier 3 Analysis  
**Version:** 1.0  
**Date:** 2026-05-23

---

## CURRENT STATE

### Existing Capabilities

| Capability | Provider | Metrics |
|------------|----------|---------|
| lead-funnel | `LeadFunnelQueryService` | total leads |
| booking | `BookingQueryService` | total bookings |
| support | `SupportQueryService` | total tickets |

### Dashboard Architecture

```
DashboardService
    ↓
DashboardCapabilityRegistry (explicit registration)
    ↓
[LeadFunnelQueryService, BookingQueryService, SupportQueryService]
    ↓
Individual queries per capability
```

**Key property:** DashboardService does NOT know individual capabilities. It iterates over registered providers.

---

## SCALABILITY QUESTIONS

### Question 1: Can Dashboard Survive 5 Capabilities?

**Analysis:**
- Current: 3 providers registered explicitly
- DashboardService iterates: `for (const provider of registry.getAll())`
- Adding 2 more providers requires:
  1. Create QueryService implementing DashboardCapabilityProvider
  2. Add parameter to DashboardCapabilityRegistry constructor
  3. Add to DashboardModule providers

**DashboardService changes required:** ZERO.

**Verdict:** ✅ YES — DashboardService is capability-agnostic.

### Question 2: Can Dashboard Survive 10 Capabilities?

**Analysis:**
- Same pattern as 5 capabilities
- Explicit registration means:
  - TypeScript validates all providers at compile time
  - No runtime discovery overhead
  - No reflection or decorators

**Concern:** Constructor parameter list grows.

**Mitigation:** At 10+ capabilities, explicit registration becomes verbose. But still correct.

**Verdict:** ✅ YES — Verbose but functional. No architectural changes needed.

### Question 3: Can Dashboard Survive Mixed Operational Semantics?

**Analysis:**
- Lead-funnel: count of leads
- Booking: count of bookings + time-based data
- Support: count of tickets + status-based data

**Dashboard aggregation:**
```typescript
let totalInteractions = 0;
for (const provider of registry.getAll()) {
  const metrics = await provider.getOwnerMetrics(ownerId);
  totalInteractions += metrics.total;  // Just a number
}
```

**Key insight:** Dashboard aggregates NUMBERS, not SEMANTICS.
- It does not care what "total" means
- It does not care about booking dates or ticket priorities
- It sums integers

**Verdict:** ✅ YES — Summation is semantics-agnostic.

---

## WHAT SCALES SAFELY

### Safe Pattern 1: Capability-Neutral Aggregation

```typescript
// DashboardService aggregates totals
async getOwnerStats(ownerId: string) {
  let totalInteractions = 0;
  for (const provider of registry.getAll()) {
    totalInteractions += (await provider.getOwnerMetrics(ownerId)).total;
  }
  return { totalInteractions };
}
```

**Scales because:** Summation is O(n) where n = number of capabilities. Independent of capability complexity.

### Safe Pattern 2: Explicit Provider Registration

```typescript
constructor(
  p1: Provider1,
  p2: Provider2,
  p3: Provider3,
  // ... p10: Provider10
) {
  this.register(p1);
  this.register(p2);
  this.register(p3);
}
```

**Scales because:** Compile-time validation. No runtime magic.

### Safe Pattern 3: Per-Capability Widgets

```typescript
// Each capability provides its own widgets
const widgets = await Promise.all(
  registry.getAll().map(async (provider) => ({
    capability: provider.getCapabilityKey(),
    metrics: await provider.getBotMetrics(botId),
  }))
);
```

**Scales because:** Parallel execution. No cross-capability dependencies.

---

## WHAT BECOMES DANGEROUS

### Danger 1: Widget Type Explosion

**Current widget types:** `metric`, `list`, `chart`

**Risk:** 10 capabilities might need 10 different widget types.

**Why dangerous:**
- Frontend needs to render all widget types
- Widget contract becomes complex
- New capability requires new widget type

**Mitigation:** Keep widget types generic:
- `metric`: number + label
- `list`: array of items
- `chart`: data points + labels

**Verdict:** ⚠️ MANAGEABLE — Keep widget types minimal.

### Danger 2: Dashboard Query Performance

**Current:** Each provider executes one count query.

**With 10 capabilities:**
- 10 count queries per dashboard load
- If each query takes 50ms: 500ms total
- If queries are sequential

**Mitigation:**
```typescript
// Parallel execution
const metrics = await Promise.all(
  registry.getAll().map(p => p.getOwnerMetrics(ownerId))
);
```

**Verdict:** ⚠️ MANAGEABLE — Parallel queries solve this.

### Danger 3: Navigation Explosion

**Current navigation per capability:**
- lead-funnel: Questions, Leads
- booking: Bookings, Calendar
- support: Tickets

**With 10 capabilities:** 20+ navigation items.

**Why dangerous:**
- Mini App sidebar becomes unwieldy
- Owner overwhelmed by options

**Mitigation:**
- Group by capability
- Collapsible sections
- Search/filter

**Verdict:** ⚠️ MANAGEABLE — UI/UX problem, not architectural.

### Danger 4: Metrics Semantic Overload

**Current metric:** `total` (a number)

**Temptation:** Add more metrics per capability.

```typescript
interface CapabilityMetrics {
  capability: string;
  total: number;
  additional: {
    pending: number;
    confirmed: number;
    // ... 10 more fields
  };
}
```

**Why dangerous:**
- Dashboard needs to understand additional metrics
- Frontend needs to render them
- Capability-specific metrics leak into dashboard

**Mitigation:** Keep metrics minimal. `total` only for aggregation.
Capability-specific details in capability widgets.

**Verdict:** ⚠️ MANAGEABLE — Resist metric expansion.

---

## SAFE EXTRACTION POINTS

### Extraction 1: Widget Renderer Components (After 5+ Capabilities)

**When:** 5+ capabilities share identical widget rendering patterns.

**What to extract:**
```typescript
// Not a universal renderer, just shared JSX components
function MetricWidget({ label, value, trend }) { ... }
function ListWidget({ items, onItemClick }) { ... }
```

**What NOT to extract:**
```typescript
// ❌ FORBIDDEN: Universal widget renderer
function UniversalWidget({ widget }) {
  switch (widget.type) {
    case 'metric': return <MetricWidget {...widget} />;
    case 'list': return <ListWidget {...widget} />;
    // ... 20 more cases
  }
}
```

### Extraction 2: Status Badge Colors (After 3+ Capabilities)

**When:** 3+ capabilities need status badges.

**What to extract:**
```typescript
// Simple color map
const STATUS_COLORS: Record<string, string> = {
  pending: '#f39c12',
  confirmed: '#27ae60',
  open: '#e74c3c',
  resolved: '#27ae60',
  // ...
};
```

### Extraction 3: Pagination Logic (Already Shared)

**Current state:** Pagination is already generic in CapabilityPage.

**Safe because:** Pagination is pure UI logic, no capability semantics.

---

## FORBIDDEN ABSTRACTIONS

### Forbidden 1: Dynamic Frontend Plugin Runtime

```typescript
// ❌ FORBIDDEN
class WidgetPluginRuntime {
  async loadWidget(capability: string) {
    const module = await import(`./widgets/${capability}`);
    return module.default;
  }
}
```

**Why forbidden:** Dynamic loading is framework behavior.

### Forbidden 2: Universal Widget Renderer

```typescript
// ❌ FORBIDDEN
function renderWidget(widget: OperationalWidget) {
  switch (widget.type) {
    case 'metric': return <MetricWidget {...widget.data} />;
    case 'chart': return <ChartWidget {...widget.data} />;
    case 'funnel': return <FunnelWidget {...widget.data} />;
    case 'calendar': return <CalendarWidget {...widget.data} />;
    // ... infinite expansion
  }
}
```

**Why forbidden:** Universal renderer becomes unmaintainable. Each new widget type requires renderer changes.

### Forbidden 3: Recursive Component System

```typescript
// ❌ FORBIDDEN
interface Widget {
  type: string;
  children?: Widget[];  // Recursion!
}

function RecursiveWidget({ widget }: { widget: Widget }) {
  return (
    <div>
      <WidgetRenderer type={widget.type} />
      {widget.children?.map(child => <RecursiveWidget widget={child} />)}
    </div>
  );
}
```

**Why forbidden:** Recursion creates unbounded complexity.

### Forbidden 4: Capability Discovery System

```typescript
// ❌ FORBIDDEN
class CapabilityDiscovery {
  async discoverCapabilities(): Promise<Capability[]> {
    // Scan modules, find capabilities dynamically
  }
}
```

**Why forbidden:** Discovery is framework behavior. Explicit registration is correct.

---

## FUTURE DASHBOARD CONSTRAINTS

### Constraint 1: Max 5 Widget Types

Dashboard widgets must use at most 5 generic types:
1. `metric` — number + label
2. `list` — array of items
3. `chart` — data visualization
4. `table` — structured data
5. `text` — informational text

### Constraint 2: No Capability-Specific Dashboard Logic

DashboardService must never have `if (capability === 'booking')` branches.

### Constraint 3: Explicit Registration Only

New capabilities register explicitly. No auto-discovery.

### Constraint 4: Parallel Query Execution

All capability queries execute in parallel.

### Constraint 5: Total-Only Aggregation

Dashboard aggregates `total` only. No additional metrics in aggregation.

---

## SCALABILITY VERDICT

| Scenario | Scalable? | Notes |
|----------|-----------|-------|
| 5 capabilities | ✅ YES | No changes needed |
| 10 capabilities | ✅ YES | Verbose but functional |
| 20 capabilities | ⚠️ VERBOSE | Consider extraction after 10+ |
| Mixed semantics | ✅ YES | Summation is agnostic |
| Complex widgets | ⚠️ MANAGEABLE | Keep widget types minimal |
| Navigation explosion | ⚠️ UI/UX | Grouping solves this |

**Overall Verdict:** Dashboard architecture scales safely. Explicit registration and capability-neutral aggregation are the right patterns.

---

**Version 1.0 — 2026-05-23**
