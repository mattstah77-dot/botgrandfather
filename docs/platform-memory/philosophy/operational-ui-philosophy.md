# Operational UI Philosophy

**Purpose:** Define what operational UI is, is not, and how it evolves safely  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — OPERATIONAL UI IS

### Visibility Layer

Operational UI makes runtime state **visible** to owners. It does not create state. It does not modify state through business logic. It shows what exists.

**Examples:**
- Booking list shows bookings that runtime created.
- Customer list shows customers that runtime collected.
- Analytics dashboard shows events that runtime emitted.

### Management Layer

Operational UI allows owners to **manage** configuration, settings, and operational parameters. It does not manage business execution.

**Examples:**
- Owner changes bot configuration.
- Owner confirms a pending booking (triggers runtime endpoint).
- Owner views customer details.

**NOT:**
- Owner edits booking slot logic.
- Owner modifies customer state directly.
- Owner creates leads through UI forms.

### Capability Composition Layer

Operational UI **composes** capability-specific views from explicit metadata. It does not hardcode template pages.

**Examples:**
- Navigation composed from `OwnerModuleRegistry`.
- Capability routes use generic namespace `/capabilities/:capability`.
- Dashboard aggregates metrics from `DashboardCapabilityRegistry`.

### Metadata-Assisted Navigation Layer

Operational UI uses metadata to **navigate** and **render structure**. Metadata drives what links exist, what sections appear, what widgets are available. Metadata does NOT drive business logic.

**Correct:**
```typescript
// Metadata tells frontend: "booking capability has a bookings section"
{ id: 'bookings', label: 'Bookings', route: '/capabilities/bookings' }
```

**Forbidden:**
```typescript
// Metadata tells frontend: "how to confirm a booking"
{ action: 'confirm', conditions: [...], logic: [...] }
```

---

## SECTION 2 — OPERATIONAL UI IS NOT

### Runtime Engine

Operational UI does NOT execute runtime logic. It does NOT process webhooks. It does NOT manage Telegram conversations. It does NOT handle user state.

**Violation:** Frontend contains booking slot generation logic.  
**Violation:** Frontend processes template callbacks.  
**Violation:** Frontend updates customer status directly.

### Business Orchestration Layer

Operational UI does NOT orchestrate business workflows. It does NOT decide when to send messages. It does NOT manage confirmation flows. It does NOT handle cancellation windows.

**Violation:** Frontend implements "confirm if pending and within 24h" logic.  
**Violation:** Frontend decides whether a booking can be cancelled.  
**Violation:** Frontend computes availability before displaying slots.

### No-Code System

Operational UI is NOT a visual builder, drag-and-drop designer, or universal form generator. It renders explicit pages. It does not construct pages from JSON schemas at runtime.

**Violation:** JSON schema drives form field rendering recursively.  
**Violation:** UI components loaded dynamically from metadata descriptors.  
**Violation:** "Universal widget renderer" that interprets metadata to render any capability.

### Universal Workflow UI

Operational UI does NOT provide a generic workflow engine. There is no "workflow builder," "state machine visualizer," or "universal action framework."

**Violation:** Workflow steps defined in metadata and rendered generically.  
**Violation:** Action buttons constructed from recursive action metadata.  
**Violation:** "Universal action engine" that handles all capability actions.

### Plugin Frontend Runtime

Operational UI does NOT load external components, plugins, or third-party code. It contains only code that ships with the platform.

**Violation:** `import()` loading external widget packages.  
**Violation:** npm package scanning for UI components.  
**Violation:** Sandboxed iframe widgets from partners.

---

## SECTION 3 — WHY EXPLICITNESS IS PREFERRED

### Explicitness Is Debuggable

When a page is explicit code, developers can:
- Set breakpoints.
- Read the component.
- Trace data flow.
- Understand behavior in one file.

When a page is "rendered from metadata," developers must:
- Find the metadata.
- Find the renderer.
- Understand the renderer's interpretation rules.
- Debug indirection.

### Explicitness Is Reviewable

Code review of explicit components:
- "This button calls this API."
- "This page shows this data."

Code review of metadata-driven systems:
- "Does the renderer handle this new metadata shape?"
- "Will this metadata break older renderers?"
- "Is the renderer's behavior correct for all cases?"

### Explicitness Prevents Framework Drift

Every generic system starts as "just a little abstraction" and grows into a framework. Explicit code cannot become a framework by accident. It must be intentionally rewritten.

**The path to framework hell:**
1. "Let's make a generic card renderer."
2. "It needs to support actions."
3. "Actions need conditions."
4. "Conditions need context."
5. "We need a condition engine."
6. **Framework achieved.**

**The explicit path:**
1. Booking card is explicit code.
2. Lead card is explicit code.
3. Third card is explicit code.
4. "These three are very similar."
5. Extract shared component with proven repetition.
6. **Abstraction justified.**

---

## SECTION 4 — WHY SWITCH/CASE IS ACCEPTABLE EARLY

### Two Instances Do Not Prove a Pattern

When only two templates exist:
- Similarities may be coincidental.
- Differences may be hidden.
- Abstraction may force one template into the other's shape.

### Switch/Case Is Honest

```typescript
switch (template) {
  case 'booking': return <BookingActions />;
  case 'lead-funnel': return <LeadActions />;
}
```

This code says: "I don't know if these are the same yet." It does not pretend to understand a universal pattern.

### Switch/Case Is Easy to Refactor

When the third template arrives:
1. Add third case.
2. Observe what is shared.
3. Extract common component.
4. Replace cases with shared component where appropriate.

This is safer than:
1. Build generic abstraction for two cases.
2. Discover third case doesn't fit.
3. Break abstraction.
4. Rebuild.

### When Switch/Case Becomes a Problem

- 5+ cases with identical bodies → extract.
- Cases differ only in data → extract with data parameter.
- Cases share 90% of logic → extract with configuration.

**Current platform:** 2 templates. Switch/case is correct.

---

## SECTION 5 — WHY METADATA IS BOUNDED

### Metadata Drives UI Structure, Not Logic

**Correct use of metadata:**
- Navigation items (what links exist).
- Widget titles (what labels show).
- Settings schemas (what fields are configurable).

**Forbidden use of metadata:**
- Business rules (when can a booking be confirmed).
- State transitions (what status follows what).
- Validation logic (is this input valid).
- Orchestration (send message after booking).

### Metadata Is Static Configuration

Metadata changes slowly. It is deployed with code. It is not user-editable at runtime.

**Why:** If metadata drives logic and is editable at runtime, the platform becomes a no-code engine. Business logic becomes opaque. Behavior becomes untraceable.

### Metadata Does Not Recurse

**Forbidden:**
```json
{
  "widget": {
    "type": "container",
    "children": [
      { "type": "widget", "children": [...] }
    ]
  }
}
```

This is a schema-driven UI runtime. It creates framework behavior by stealth.

**Correct:**
```typescript
interface OperationalWidget {
  id: string;
  type: 'metric' | 'list' | 'chart';
  title: string;
}
```

Flat. Explicit. Bounded.

---

## SECTION 6 — WHY FRONTEND GENERICITY MUST EMERGE SLOWLY

### Generic Shell, Specific Pages

The frontend has two layers:

1. **Generic shell:** routing, navigation, layout, auth.
2. **Specific pages:** capability list, detail views, dashboards.

The shell is generic because it handles universal concerns. Pages are specific because they handle capability concerns.

### The Temptation to Genericize Pages

When building the second template, the temptation is strong:
- "Bookings and leads are both lists."
- "Let's make a generic list page."
- "It just needs a data source and column config."

This is premature abstraction. Bookings have lifecycle actions. Leads have qualification stages. These are not the same.

### Safe Genericity Path

1. **Explicit pages for each capability.**
2. **Observe repetition across 3+ capabilities.**
3. **Extract ONLY the genuinely shared parts.**
4. **Keep capability-specific branches explicit.**

**Example of safe extraction:**
```typescript
// After 3+ capabilities prove they all need pagination
function usePagination() { ... }

// Pages still explicit
function BookingPage() { const p = usePagination(); ... }
function LeadPage() { const p = usePagination(); ... }
```

**Example of unsafe extraction:**
```typescript
// After 2 capabilities
function GenericCapabilityPage({ config }) {
  return <DataTable source={config.source} columns={config.columns} />;
}
```

This forces all capabilities into table shape. It prevents future capabilities from having non-table views.

---

## SECTION 7 — ANTI-DRIFT PROTECTIONS

### Protection 1: No Dynamic Component Loading

**Forbidden:**
```typescript
const Component = await import(`./widgets/${widget.type}`);
```

**Enforcement:** All imports are static and explicit.

### Protection 2: No Recursive Metadata Renderers

**Forbidden:**
```typescript
function renderMetadata(node: MetadataNode) {
  if (node.children) node.children.forEach(renderMetadata);
}
```

**Enforcement:** Metadata interfaces are flat. No `children` arrays.

### Protection 3: No Universal Action Engines

**Forbidden:**
```typescript
function executeAction(action: ActionMetadata) {
  if (action.type === 'navigate') navigate(action.route);
  if (action.type === 'api') callApi(action.endpoint);
  if (action.type === 'conditional') evaluate(action.condition);
}
```

**Enforcement:** Actions are explicit button onClick handlers.

### Protection 4: No Schema-Driven Forms

**Forbidden:**
```typescript
function renderForm(schema: JSONSchema) {
  return schema.properties.map(p => <Field type={p.type} />);
}
```

**Enforcement:** Forms are explicit JSX. Settings use explicit fields.

### Protection 5: No Frontend Business Logic

**Forbidden:**
```typescript
function canCancelBooking(booking: Booking) {
  return booking.status === 'pending' &&
         new Date(booking.date) > new Date();
}
```

**Enforcement:** Frontend calls API. Backend decides. Frontend displays result.

---

## SECTION 8 — EVOLUTION RULES

### Rule 1: Three Before Universal

Do not create generic page components until 3+ capabilities prove the pattern.

### Rule 2: Explicit Before Implicit

Prefer explicit code over metadata-driven rendering. Metadata is for structure, not behavior.

### Rule 3: Capability Pages Stay Explicit

Each capability has its own explicit pages. Shared utilities (hooks, helpers) may be extracted. Pages remain specific.

### Rule 4: Shell Is Generic, Pages Are Specific

The operational shell (routing, navigation, layout) is generic. Capability pages are specific. This boundary is intentional.

### Rule 5: Frontend Genericity Is Proven, Not Assumed

Generic frontend patterns emerge from observing real capability pages. They are not designed upfront.

---

## SECTION 9 — CURRENT PLATFORM STATE

### What Is Explicit (Correct)

- `CapabilityPage` — explicit transforms for each capability.
- `BookingDetailPage` — explicit booking detail view.
- `BotOverviewPage` — explicit capability widgets and actions.
- `DashboardPage` — explicit bot list and stats.
- Action buttons — explicit onClick handlers.
- API calls — explicit method invocations.

### What Is Generic (Correct)

- App routing — generic capability namespace.
- Navigation — composed from `OwnerModuleRegistry`.
- Layout — universal shell.
- Auth — universal `TelegramProvider`.

### What Is Transitional (Acceptable)

- `renderCapabilityWidgets` switch/case — will abstract at 3+ templates.
- `CAPABILITY_MAP` in API client — will remove when backend provides generic endpoint.
- `transformToCapabilityItem` — will expand when lead-funnel proves different pattern.

### What Is Forbidden (Not Present)

- ❌ Dynamic component loading
- ❌ Recursive metadata rendering
- ❌ Universal action engine
- ❌ Schema-driven forms
- ❌ Frontend business logic
- ❌ Plugin runtime

---

## SECTION 10 — SUMMARY

> **Operational UI is a visibility and management layer.**
> **It is NOT a runtime engine, no-code system, or universal workflow UI.**
>
> **Explicitness is preferred because it is debuggable, reviewable, and drift-resistant.**
> **Switch/case is acceptable early because two instances do not prove a pattern.**
>
> **Metadata is bounded because it drives structure, not logic.**
> **Frontend genericity must emerge slowly because premature abstraction creates frameworks.**
>
> **The shell is generic. Pages are specific. This boundary protects the platform.**

---

**Version 1.0 — 2026-05-23**
