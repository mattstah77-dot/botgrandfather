# Action Contracts

**Purpose:** Define minimal operational action semantics  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Date:** 2026-05-23

---

## DEFINITION

**Actions** are operational descriptors that tell the frontend what operations are available for a resource.

Actions are:
- **Operational descriptors:** They describe what CAN be done, not HOW it is done.
- **Navigation-oriented:** They point to routes or endpoints, not behavior.
- **Backend-provided:** The backend decides which actions are available. The frontend renders them.

Actions are NOT:
- **Behavior metadata:** They do NOT contain logic, conditions, or orchestration.
- **Command definitions:** They do NOT describe how to execute an operation.
- **Workflow steps:** They are NOT part of a state machine.

---

## CAPABILITY ACTION CONTRACT

```typescript
/**
 * CapabilityAction — operational action descriptor.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Actions are NAVIGATION DESCRIPTORS ONLY.
 * They describe WHERE to go or WHAT endpoint to call.
 * They do NOT describe behavior, conditions, or orchestration.
 */
interface CapabilityAction {
  /** Unique action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Action type — determines how frontend handles it */
  type: 'navigate' | 'lifecycle';

  /** Navigation route (for navigate-type actions) */
  route?: string;

  /** API endpoint (for lifecycle-type actions) */
  endpoint?: {
    /** HTTP method */
    method: 'POST' | 'DELETE' | 'PATCH';
    /** API path */
    path: string;
  };

  /** Optional icon emoji */
  icon?: string;
}
```

### Action Type Semantics

| Type | Frontend Behavior | Backend Responsibility |
|------|------------------|----------------------|
| `navigate` | Navigate to `route` | None (navigation only) |
| `lifecycle` | Call `endpoint`, handle response | Execute business logic, validate, return result |

### Action Rules

1. **No behavior metadata:** Actions do NOT contain `onClick`, `handler`, `logic`.
2. **No condition metadata:** Actions do NOT contain `showIf`, `enableIf`, `conditions`.
3. **No workflow metadata:** Actions do NOT contain `next`, `prev`, `workflow`.
4. **No recursive actions:** Actions are flat. No `children`, `subActions`.
5. **Backend decides availability:** Frontend renders what backend provides.

---

## AVAILABLE ACTIONS CONTRACT

```typescript
/**
 * AvailableActionsResponse — backend-provided action list for a resource.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Backend decides which actions are available based on resource state.
 * Frontend renders buttons from this metadata without business logic.
 */
interface AvailableActionsResponse {
  /** Resource identifier */
  resourceId: string;

  /** Available actions */
  actions: CapabilityAction[];
}
```

### Example: Booking Actions

```typescript
// Backend returns available actions based on booking status
const pendingActions: AvailableActionsResponse = {
  resourceId: 'booking-123',
  actions: [
    { id: 'confirm', label: 'Confirm', type: 'lifecycle', endpoint: { method: 'POST', path: '/bookings/booking-123/confirm' }, icon: '✅' },
    { id: 'cancel', label: 'Cancel', type: 'lifecycle', endpoint: { method: 'POST', path: '/bookings/booking-123/cancel' }, icon: '❌' },
  ],
};

const confirmedActions: AvailableActionsResponse = {
  resourceId: 'booking-123',
  actions: [
    { id: 'cancel', label: 'Cancel', type: 'lifecycle', endpoint: { method: 'POST', path: '/bookings/booking-123/cancel' }, icon: '❌' },
    { id: 'complete', label: 'Complete', type: 'lifecycle', endpoint: { method: 'POST', path: '/bookings/booking-123/complete' }, icon: '✔️' },
    { id: 'no-show', label: 'No Show', type: 'lifecycle', endpoint: { method: 'POST', path: '/bookings/booking-123/no-show' }, icon: '🚫' },
  ],
};

const terminalActions: AvailableActionsResponse = {
  resourceId: 'booking-123',
  actions: [],
};
```

### Example: Capability Navigation Actions

```typescript
// Backend returns navigation actions for a capability
const bookingCapabilityActions: CapabilityAction[] = [
  { id: 'view-bookings', label: 'View Bookings', type: 'navigate', route: '/capabilities/bookings', icon: '📅' },
  { id: 'view-calendar', label: 'View Calendar', type: 'navigate', route: '/capabilities/calendar', icon: '🗓️' },
];
```

---

## ACTION AVAILABILITY RULES

### Rule 1: Backend Owns Availability

The backend decides which actions are available based on resource state:

```typescript
// ✅ CORRECT — Backend decides availability
function getBookingAvailableActions(status: string): string[] {
  switch (status) {
    case 'pending': return ['confirm', 'cancel'];
    case 'confirmed': return ['cancel', 'complete', 'no-show'];
    case 'cancelled':
    case 'completed':
    case 'no-show':
      return [];
    default: return [];
  }
}
```

### Rule 2: Frontend Renders Without Logic

Frontend renders buttons from backend-provided metadata:

```typescript
// ✅ CORRECT — Frontend renders from metadata
function BookingActions({ availableActions }: { availableActions: CapabilityAction[] }) {
  return (
    <div>
      {availableActions.map(action => (
        <button key={action.id} onClick={() => handleAction(action)}>
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );
}
```

### Rule 3: No Frontend Business Logic

```typescript
// ❌ FORBIDDEN — Frontend encodes business logic
function BookingActions({ booking }: { booking: Booking }) {
  const canConfirm = booking.status === 'pending';  // NO!
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';  // NO!
  
  return (
    <div>
      {canConfirm && <button>Confirm</button>}
      {canCancel && <button>Cancel</button>}
    </div>
  );
}
```

---

## LIFECYCLE ACTION CONTRACT

### Definition

**Lifecycle actions** are owner-triggered state transitions that execute runtime business logic.

Despite being owner-triggered, lifecycle actions are RUNTIME BEHAVIOR, not operational management.

### Lifecycle Endpoint Contract

```typescript
/**
 * Lifecycle endpoint for owner-triggered state transitions.
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Owner-triggered transitions are still runtime business logic.
 * They live in runtime module (templates/), NOT operational module (miniapp/).
 * They use ownership verification (BotOwnershipGuard) for security.
 */
@Controller('miniapp/bots')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
class BookingLifecycleController {
  @Post(':id/bookings/:bookingId/confirm')
  async confirmBooking(...) { ... }

  @Post(':id/bookings/:bookingId/cancel')
  async cancelBooking(...) { ... }

  @Post(':id/bookings/:bookingId/complete')
  async completeBooking(...) { ... }

  @Post(':id/bookings/:bookingId/no-show')
  async markNoShow(...) { ... }
}
```

### Lifecycle Rules

1. **Runtime module:** Lifecycle controllers live in `templates/`, NOT `miniapp/`.
2. **Ownership verification:** All lifecycle endpoints verify owner owns bot.
3. **Business logic in service:** State transitions execute in template runtime service.
4. **Events emitted:** Lifecycle actions emit canonical events.
5. **No operational layer execution:** Operational layer (miniapp/) does NOT execute business logic.

---

## ANTI-PATTERNS

### Anti-Pattern 1: Behavior Metadata

```typescript
// ❌ FORBIDDEN — Behavior in action metadata
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

### Anti-Pattern 2: Universal Action Engine

```typescript
// ❌ FORBIDDEN — Universal action executor
class UniversalActionEngine {
  async execute(action: ActionMetadata) {
    if (action.type === 'navigate') navigate(action.route);
    if (action.type === 'api') callApi(action.endpoint);
    if (action.type === 'conditional') evaluate(action.condition);
  }
}

// ✅ CORRECT — Explicit action handling
function handleAction(action: CapabilityAction) {
  if (action.type === 'navigate') {
    navigate(action.route!);
  } else if (action.type === 'lifecycle') {
    callApi(action.endpoint!);
  }
}
```

### Anti-Pattern 3: Action Registry Runtime

```typescript
// ❌ FORBIDDEN — Dynamic action registration
class ActionRegistry {
  register(action: ActionDefinition) { ... }
  execute(id: string) { ... }
}

// ✅ CORRECT — Explicit action list from backend
const actions = await api.getAvailableActions(bookingId);
```

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial action contract stabilization |

---

**Version 1.0 — 2026-05-23**
