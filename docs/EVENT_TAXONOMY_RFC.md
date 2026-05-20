# EVENT TAXONOMY & PLATFORM EVENT ARCHITECTURE RFC

**Status:** PROPOSED  
**Date:** 2026-05-19  
**Scope:** Platform Event Semantics Stabilization  
**Blocking Future Work:** YES (Analytics, Automations, Billing, Referrals)

---

## Executive Summary

**Current State:**
- 4 active event types emitted via `AnalyticsService.trackEvent()`
- 17 event types declared in `PlatformEventType` but UNUSED
- `PlatformEventBus` exists but NEVER called
- Colon separator (`session:started`) instead of dot notation
- Legacy events (`funnel:started`) still in type definitions

**Critical Finding:**
Platform has event infrastructure but NO active event architecture. Events are stored as analytics data but never processed as semantic platform contracts.

**Recommendation:**
Stabilize event taxonomy NOW before capability expansion. Current event names are acceptable but must be formalized into platform contract.

---

## 1. Current Event Surface Audit

### Active Events (Emitted in Code)

| Event | Emitter | Context | Frequency |
|-------|---------|---------|-----------|
| `session:started` | LeadFunnelService, BookingRuntimeService | Runtime | Every session start |
| `session:completed` | LeadFunnelService, BookingRuntimeService | Runtime | Every completion |
| `session:abandoned` | BookingRuntimeService | Runtime | On timeout |
| `conversion:achieved` | LeadFunnelService, BookingRuntimeService, CustomerBookingService | Runtime + Operational | Every conversion |

### Declared but UNUSED Events

| Event | Declared In | Used In Code | Status |
|-------|-------------|--------------|--------|
| `bot:connected` | PlatformEventType | ❌ No | Ghost event |
| `bot:deleted` | PlatformEventType | ❌ No | Ghost event |
| `bot:config_updated` | PlatformEventType | ❌ No | Ghost event |
| `lead:created` | PlatformEventType | ❌ No | Ghost event |
| `funnel:started` | PlatformEventType | ❌ No | Legacy (deprecated) |
| `funnel:completed` | PlatformEventType | ❌ No | Legacy (deprecated) |
| `funnel:abandoned` | PlatformEventType | ❌ No | Legacy (deprecated) |
| `owner:created` | PlatformEventType | ❌ No | Ghost event |
| `customer:created` | PlatformEventType | ❌ No | Ghost event |
| `customer:converted` | PlatformEventType | ❌ No | Ghost event |
| `subscription:activated` | PlatformEventType | ❌ No | Ghost event |
| `subscription:cancelled` | PlatformEventType | ❌ No | Ghost event |

### Infrastructure Status

| Component | Status | Usage |
|-----------|--------|-------|
| `AnalyticsService.trackEvent()` | ✅ Active | Stores events to PostgreSQL |
| `PlatformEventBus` | ❌ Dead code | Declared but NEVER emitted |
| `PlatformEventType` | ⚠️ Outdated | Contains ghost + legacy events |

---

## 2. Event Classification System

### Category Definitions

#### Runtime Events
**Definition:** Business flow events from template runtime.
**Ownership:** Template layer (WebhookService → TemplateFactory → Handlers)
**Examples:**
```
session.started
session.completed
session.abandoned
conversion.achieved
lead.created
booking.created
booking.confirmed
booking.cancelled
slot.reserved
slot.released
```

#### Operational Events
**Definition:** Dashboard/owner interactions and system operations.
**Ownership:** Operational layer (MiniappModule, AdminModule)
**Examples:**
```
owner.logged_in
dashboard.viewed
widget.refreshed
settings.updated
bot.configured
```

#### Platform Events
**Definition:** Platform lifecycle and infrastructure events.
**Ownership:** Platform layer (AppModule, ConfigModule)
**Examples:**
```
platform.booted
bot.connected
bot.deleted
subscription.activated
subscription.cancelled
quota.exceeded
```

#### Customer Events
**Definition:** Customer lifecycle events (universal across templates).
**Ownership:** CustomerModule
**Examples:**
```
customer.created
customer.updated
customer.converted
customer.tag_added
customer.note_added
```

---

## 3. Event Naming Laws

### Law 1 — Dot Notation
```
✅ GOOD:  booking.created
✅ GOOD:  customer.converted
❌ BAD:   booking_created
❌ BAD:   bookingCreated
❌ BAD:   create_booking
```

### Law 2 — Past Tense for Facts
```
✅ GOOD:  booking.created    (fact: booking was created)
✅ GOOD:  session.started    (fact: session was started)
❌ BAD:   booking.create     (command, not fact)
❌ BAD:   createBooking      (function name, not event)
```

### Law 3 — Domain.Subject.Verb Pattern
```
✅ GOOD:  booking.slot.reserved
✅ GOOD:  customer.tag.added
✅ GOOD:  session.started
❌ BAD:   leadDone           (ambiguous)
❌ BAD:   userDidThing       (meaningless)
```

### Law 4 — Singular Nouns
```
✅ GOOD:  customer.created
✅ GOOD:  booking.confirmed
❌ BAD:   customers.created  (plural)
❌ BAD:   bookings.confirmed (plural)
```

### Law 5 — Capability-Neutral Where Possible
```
✅ GOOD:  conversion.achieved    (universal)
✅ GOOD:  customer.converted     (universal)
❌ BAD:   leadfunnel.lead.completed  (template-specific)
❌ BAD:   booking.booking.confirmed  (redundant)
```

### Law 6 — No Handler Names in Events
```
✅ GOOD:  booking.created
❌ BAD:   bookingCreatedHandler
❌ BAD:   processBooking
```

---

## 4. Event Payload Contracts

### Standard Payload Structure

```typescript
interface PlatformEvent {
  // REQUIRED — Event identity
  event: string;           // 'booking.created'
  timestamp: string;       // ISO 8601
  
  // REQUIRED — Tenant context
  botId: string;           // Multi-tenant scope
  
  // OPTIONAL — Actor context
  ownerId?: string;        // If owner-triggered
  customerId?: string;     // If customer-triggered
  userId?: number;         // Telegram user ID
  
  // OPTIONAL — Event-specific data
  payload: {
    // Event-specific fields here
    // NEVER include secrets, tokens, passwords
  };
  
  // OPTIONAL — Metadata
  metadata: {
    template?: string;     // 'booking', 'lead-funnel'
    channel?: string;      // 'chat', 'miniapp', 'api'
    source?: string;       // 'webhook', 'manual', 'automation'
  };
}
```

### Payload Rules

| Rule | Required | Forbidden |
|------|----------|-----------|
| **Root fields** | event, timestamp, botId | — |
| **Payload** | Event-specific business data | Secrets, tokens, PII |
| **Metadata** | Context (template, channel) | Business logic |
| **Actor** | userId, customerId, ownerId | Passwords, auth tokens |

### Example: booking.created

```typescript
{
  event: 'booking.created',
  timestamp: '2026-05-19T14:30:00Z',
  botId: '8d44c2d7-7cfb-4a54-b6d3-900c92178aa1',
  customerId: 'customer-uuid',
  userId: 123456789,
  payload: {
    bookingId: 'booking-uuid',
    serviceId: 'consultation',
    serviceName: 'Consultation',
    date: '2026-05-20',
    timeSlot: '10:00',
    durationMinutes: 30,
    price: 50
  },
  metadata: {
    template: 'booking',
    channel: 'miniapp'
  }
}
```

---

## 5. Event Ownership Matrix

| Event Category | Owner Module | Emitter | Consumer |
|---------------|--------------|---------|----------|
| `session.*` | Templates | TemplateService | Analytics, Automations |
| `conversion.*` | Templates | TemplateService | Analytics, Billing |
| `booking.*` | Booking | BookingRuntimeService | Analytics, Owner Dashboard |
| `lead.*` | Lead Funnel | LeadFunnelService | Analytics, Owner Dashboard |
| `customer.*` | Customer | CustomerService | Analytics, CRM, Automations |
| `owner.*` | Owner | OwnerService | Analytics, Admin |
| `bot.*` | Bot | BotService | Analytics, Platform |
| `subscription.*` | Billing | BillingService | Analytics, Notifications |
| `platform.*` | Platform | AppService | Monitoring, Logging |

---

## 6. Analytics Event Semantics

### Current Analytics Events Assessment

| Current Event | Semantic Quality | Issue | Recommendation |
|--------------|-------------------|-------|----------------|
| `session:started` | ✅ Good | Colon separator | Migrate to `session.started` |
| `session:completed` | ✅ Good | Colon separator | Migrate to `session.completed` |
| `session:abandoned` | ✅ Good | Colon separator | Migrate to `session.abandoned` |
| `conversion:achieved` | ⚠️ Ambiguous | "achieved" is vague | Keep or refine to `conversion.completed` |

### Analytics Aggregation Semantics

Current aggregation:
```sql
SELECT eventType, COUNT(*) FROM analytics_events GROUP BY eventType;
```

This works for:
- ✅ Session counts
- ✅ Conversion rates
- ✅ Funnel analysis

Future needs:
- ⚠️ Time-series (requires `createdAt` grouping)
- ⚠️ Multi-bot aggregation (requires `ownerId` grouping)
- ⚠️ Customer journey (requires `userId` correlation)

**Status:** Current aggregation is SUFFICIENT for MVP but will need extension for advanced analytics.

---

## 7. Future Capability Simulation

### Booking Engine Events

| Future Event | Taxonomy Fit | Conflict? |
|-------------|--------------|-----------|
| `slot.generated` | ✅ Clean | None |
| `slot.reserved` | ✅ Clean | None |
| `booking.confirmed` | ✅ Clean | None |
| `booking.cancelled` | ✅ Clean | None |
| `booking.rescheduled` | ✅ Clean | None |

### CRM Events

| Future Event | Taxonomy Fit | Conflict? |
|-------------|--------------|-----------|
| `customer.tag.added` | ✅ Clean | None |
| `customer.note.added` | ✅ Clean | None |
| `segment.created` | ✅ Clean | None |

### AI Assistant Events

| Future Event | Taxonomy Fit | Conflict? |
|-------------|--------------|-----------|
| `conversation.started` | ✅ Clean | None |
| `conversation.escalated` | ✅ Clean | None |
| `ai.response.generated` | ✅ Clean | None |

### Referrals Events

| Future Event | Taxonomy Fit | Conflict? |
|-------------|--------------|-----------|
| `referral.created` | ✅ Clean | None |
| `referral.converted` | ⚠️ Overlap | `customer.converted` is similar |
| `referral.reward.issued` | ✅ Clean | None |

**Note:** `referral.converted` vs `customer.converted` — both valid, different domains.

### Subscriptions Events

| Future Event | Taxonomy Fit | Conflict? |
|-------------|--------------|-----------|
| `subscription.activated` | ✅ Already in PlatformEventType | None |
| `subscription.renewed` | ✅ Clean | None |
| `quota.exceeded` | ✅ Clean | None |

---

## 8. Anti-Pattern Detection

### Anti-Pattern 1: Colon Separator
```
❌ BAD:  session:started
✅ GOOD: session.started
```
**Severity:** Medium  
**Risk:** Inconsistent with platform naming conventions

### Anti-Pattern 2: Ghost Events
```
❌ BAD:  'customer:created' declared but NEVER emitted
```
**Severity:** Low  
**Risk:** Confusing for developers, dead code

### Anti-Pattern 3: Legacy Events in Types
```
❌ BAD:  'funnel:started' still in PlatformEventType
```
**Severity:** Low  
**Risk:** Type pollution, misleading

### Anti-Pattern 4: Dead Event Bus
```
❌ BAD:  PlatformEventBus declared but NEVER used
```
**Severity:** Medium  
**Risk:** Architectural confusion, wasted abstraction

### Anti-Pattern 5: Mixed Metadata Schema
```
// Lead funnel:
{ template: 'lead-funnel', userId: 123, flowType: 'funnel' }

// Booking:
{ template: 'booking', userId: 123 }

// Customer MiniApp:
{ template: 'booking', channel: 'miniapp', serviceId: 'x' }
```
**Severity:** Low  
**Risk:** Inconsistent metadata makes aggregation harder

### Anti-Pattern 6: No Customer Lifecycle Events
```
❌ BAD:  Customer created but no 'customer.created' event emitted
```
**Severity:** Medium  
**Risk:** CRM, automations cannot react to customer lifecycle

---

## 9. Architectural Risks

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| **Event bus unused** | Medium | PlatformEventBus is dead code | Remove or activate |
| **Colon separator** | Medium | Inconsistent with dot notation RFC | Migrate event names |
| **Ghost events** | Low | Declared but unused events | Clean up PlatformEventType |
| **Missing lifecycle events** | Medium | No customer.created, bot.connected | Add emitters |
| **Metadata inconsistency** | Low | Different fields per template | Standardize metadata schema |

---

## 10. Recommended Stabilization Changes

### Immediate (Before Booking Engine)

1. **Standardize event naming**
   - Migrate `session:started` → `session.started`
   - Migrate `conversion:achieved` → `conversion.completed`

2. **Clean up PlatformEventType**
   - Remove legacy: `funnel:started`, `funnel:completed`, `funnel:abandoned`
   - Remove ghost events or implement them

3. **Activate or remove PlatformEventBus**
   - Option A: Wire AnalyticsService to emit PlatformEvents
   - Option B: Remove PlatformEventBus (simpler)

### Short-term (With Booking Engine)

4. **Add lifecycle events**
   - Emit `customer.created` in CustomerService.ensureCustomer()
   - Emit `customer.converted` in CustomerService.updateStatus()

5. **Standardize metadata schema**
   - Define required metadata fields
   - Enforce consistency across templates

### Long-term (Future Capabilities)

6. **Event-driven automation**
   - React to `booking.created` for notifications
   - React to `customer.converted` for CRM updates
   - React to `subscription.activated` for billing

---

## 11. Final Readiness Verdict

### Event Architecture: ⚠️ PARTIALLY READY

| Criterion | Status |
|-----------|--------|
| Event taxonomy defined | ✅ Yes |
| Event naming consistent | ⚠️ Colon separator |
| Event bus functional | ❌ Dead code |
| Lifecycle events complete | ❌ Missing |
| Metadata standardized | ⚠️ Inconsistent |
| Future capability compatible | ✅ Yes |

### Recommendation

**Proceed with Booking Engine BUT stabilize events first.**

The current 4 event types (`session:started`, `session:completed`, `session:abandoned`, `conversion:achieved`) are semantically correct and sufficient for Booking Engine MVP.

However, before adding more capabilities:
1. Standardize separator (colon → dot)
2. Clean up ghost events
3. Add customer lifecycle events
4. Standardize metadata

These are small changes with high future payoff.

---

## Appendix: Event Migration Map

| Current | Proposed | Priority |
|---------|----------|----------|
| `session:started` | `session.started` | High |
| `session:completed` | `session.completed` | High |
| `session:abandoned` | `session.abandoned` | High |
| `conversion:achieved` | `conversion.completed` | Medium |
| `funnel:started` | REMOVE | Low |
| `funnel:completed` | REMOVE | Low |
| `funnel:abandoned` | REMOVE | Low |
| `customer:created` | IMPLEMENT or REMOVE | Medium |
| `customer:converted` | IMPLEMENT or REMOVE | Medium |
| `bot:connected` | IMPLEMENT or REMOVE | Low |

---

**RFC Complete.** Awaiting approval.
