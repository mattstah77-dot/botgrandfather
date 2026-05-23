# FOUNDATION FREEZE REVIEW

**TASK:** Final Pre-Booking Stabilization Checkpoint  
**Date:** 2026-05-19  
**Status:** ✅ COMPLETE  
**Reviewer:** Platform Architect

---

## EXECUTIVE SUMMARY

**VERDICT: OPTION B — Additional stabilization required before Booking Engine Foundation work.**

The platform foundation is **genuinely stable** in core architecture (runtime/operational separation, customer universality, event semantics, multi-tenant isolation). However, **three critical gaps** must be closed before introducing temporal/scheduling complexity:

1. **DashboardService query-service explosion** — will break with 5+ capabilities
2. **Booking temporal semantics undefined** — timezone laws, availability rules, resource allocation missing
3. **Dummy template noise** — Template1/2/3 create cognitive overhead and registry pollution

These are small, high-impact stabilizations. Booking Engine should NOT begin until they are resolved.

---

## 1. FOUNDATION INVARIANTS RE-VALIDATION

### 1.1 Runtime / Operational Separation

| Aspect | Status | Evidence |
|--------|--------|----------|
| WebhookService imports | ✅ VERIFIED | No miniapp/ownership imports |
| TemplateService imports | ✅ VERIFIED | No miniapp/ownership imports |
| CustomerService imports | ✅ VERIFIED | No miniapp/ownership imports |
| BotService imports | ✅ VERIFIED | No miniapp/ownership imports |
| MiniappModule imports runtime | ✅ VERIFIED | Only query services, no runtime |
| **BotModule imports** | ⚠️ MIXED | BotModule imports MiniAppAuthModule + OwnershipModule for BotController |

**Finding:** `BotModule` is a **mixed layer module**. `BotService` is pure runtime, but `BotController` is API layer with auth guards. The module imports operational auth dependencies.

**Severity:** LOW. BotController is legitimately API layer. But `BotModule` should ideally be split into `BotRuntimeModule` and `BotApiModule`.

### 1.2 Capability Neutrality

| Aspect | Status | Evidence |
|--------|--------|----------|
| Customer model | ✅ VERIFIED | Template-agnostic (status, tags, notes) |
| Analytics events | ✅ VERIFIED | session.*, conversion.* — capability-neutral |
| BotService | ✅ VERIFIED | No lead/booking references |
| Plan limits | ✅ VERIFIED | maxInteractionsPerMonth, NOT maxLeadsPerMonth |
| **DashboardService** | ⚠️ PARTIAL | Hardcodes LeadFunnelQueryService + BookingQueryService |

**Finding:** DashboardService is **capability-coupled**. It directly injects template-specific query services.

**Severity:** MEDIUM. Works now, but adding CRM/Referrals/Subscriptions will require DashboardService changes every time.

### 1.3 Metadata Discipline

| Aspect | Status | Evidence |
|--------|--------|----------|
| OwnerModuleRegistry | ✅ VERIFIED | Simple Map, no recursive schemas |
| TemplateRegistry | ✅ VERIFIED | Config schema + defaults only |
| **OwnerModuleDefinition flags** | ⚠️ PARTIAL | `createsLeads`, `hasCustomerMiniApp` — template-specific |

**Finding:** `createsLeads` and `hasCustomerMiniApp` are **template-specific boolean flags**. With 5+ capabilities, this becomes flag explosion.

**Severity:** LOW. Current flags work, but future capabilities may need generic capability enumeration.

### 1.4 Query-Service Discipline

| Aspect | Status | Evidence |
|--------|--------|----------|
| Query services are read-only | ✅ VERIFIED | BookingQueryService, LeadFunnelQueryService — no writes |
| No business logic in queries | ✅ VERIFIED | Pure data access |
| **Query service count** | ⚠️ RISK | 2 now, 6+ expected with future capabilities |

**Finding:** Each new capability adds a new QueryService. DashboardService injects all of them.

**Severity:** MEDIUM. Current pattern is correct, but aggregation layer needs abstraction.

### 1.5 Namespace Discipline

| Aspect | Status | Evidence |
|--------|--------|----------|
| API namespace separation | ✅ VERIFIED | `/api/customer/*`, `/miniapp/*`, `/webhook/*` |
| Static file separation | ✅ VERIFIED | `/app/*`, `/customer/*` |
| No route collisions | ✅ VERIFIED | Deterministic middleware order |

**Severity:** NONE. Namespace is clean.

### 1.6 Multi-Tenant Integrity

| Aspect | Status | Evidence |
|--------|--------|----------|
| Bot queries scoped | ✅ VERIFIED | All queries include `where: { botId }` |
| Customer queries scoped | ✅ VERIFIED | `where: { botId }` |
| Booking queries scoped | ✅ VERIFIED | `where: { botId }` |
| Lead queries scoped | ✅ VERIFIED | `where: { botId }` |
| Ownership verification | ✅ VERIFIED | BotOwnershipGuard on all owner endpoints |

**Severity:** NONE. Multi-tenant isolation is solid.

---

## 2. FOUNDATION MATURITY SCORING

| Subsystem | Maturity | Confidence | Risk |
|-----------|----------|------------|------|
| **Runtime Layer** | HIGH | HIGH | LOW |
| **Operational Layer** | MEDIUM-HIGH | MEDIUM-HIGH | MEDIUM |
| **Customer Layer** | HIGH | HIGH | LOW |
| **Owner Layer** | MEDIUM-HIGH | MEDIUM-HIGH | LOW |
| **Analytics Layer** | MEDIUM | MEDIUM | MEDIUM |
| **Event Semantics** | HIGH | HIGH | LOW |
| **Metadata Layer** | MEDIUM-HIGH | MEDIUM-HIGH | LOW |
| **Query Layer** | MEDIUM | MEDIUM | HIGH |
| **API Surface** | HIGH | HIGH | LOW |
| **Template System** | MEDIUM | MEDIUM-HIGH | MEDIUM |
| **OwnerModuleRegistry** | MEDIUM-HIGH | MEDIUM-HIGH | LOW |
| **Authentication** | HIGH | HIGH | LOW |
| **Authorization** | MEDIUM | MEDIUM | MEDIUM |
| **Multi-Tenant Isolation** | HIGH | HIGH | LOW |
| **Navigation Composition** | MEDIUM-HIGH | MEDIUM-HIGH | LOW |
| **Dashboard Aggregation** | MEDIUM | MEDIUM | HIGH |

---

## 3. HIDDEN FRAGILITY ANALYSIS

### 3.1 API Growth Fragility

**Status:** LOW RISK

API surface is clean with deterministic namespaces. Future capabilities add new endpoints under existing namespaces:
- `/api/customer/*` — customer-facing APIs
- `/miniapp/*` — owner dashboard APIs
- `/webhook/*` — runtime webhooks

**No inconsistency risk detected.**

### 3.2 Dashboard Growth Fragility

**Status:** HIGH RISK

`DashboardService` currently injects:
```typescript
constructor(
  private readonly ownerService: OwnerService,
  private readonly botService: BotService,
  private readonly customerService: CustomerService,
  private readonly analyticsService: AnalyticsService,
  private readonly bookingQueryService: BookingQueryService,
  private readonly leadFunnelQueryService: LeadFunnelQueryService,
) {}
```

With 5 future capabilities (CRM, Referrals, Subscriptions, AI Assistant, Shop):
```typescript
// FUTURE — 11 injections!
constructor(
  private readonly ownerService: OwnerService,
  private readonly botService: BotService,
  private readonly customerService: CustomerService,
  private readonly analyticsService: AnalyticsService,
  private readonly bookingQueryService: BookingQueryService,
  private readonly leadFunnelQueryService: LeadFunnelQueryService,
  private readonly crmQueryService: CrmQueryService,
  private readonly referralQueryService: ReferralQueryService,
  private readonly subscriptionQueryService: SubscriptionQueryService,
  private readonly aiAssistantQueryService: AiAssistantQueryService,
  private readonly shopQueryService: ShopQueryService,
) {}
```

**This is unsustainable.**

### 3.3 Query-Service Explosion Risk

**Status:** HIGH RISK

Current: 2 query services (BookingQueryService, LeadFunnelQueryService)
Future: 6+ query services

Each capability adds:
1. New QueryService class
2. New entity
3. New injection in DashboardService
4. New controller endpoint
5. New owner module metadata

**When does it become architectural debt?** At 4+ capabilities. DashboardService becomes a god class.

### 3.4 Metadata Drift Risk

**Status:** LOW RISK

OwnerModuleRegistry is a simple Map. No recursive schemas. No complexity.

But `OwnerModuleDefinition.createsLeads` is a template-specific flag. Future capabilities may need:
- `createsBookings`
- `createsReferrals`
- `createsSubscriptions`
- `createsTickets`

**Mitigation:** Replace boolean flags with capability enumeration:
```typescript
export type Capability = 'leads' | 'bookings' | 'referrals' | 'subscriptions' | 'crm';
interface OwnerModuleDefinition {
  capabilities: Capability[];
}
```

### 3.5 Event Drift Risk

**Status:** LOW RISK

Event taxonomy is now stable (dot notation, past tense, domain-first). Events are emitted as fire-and-forget side effects.

**No orchestration risk detected.**

### 3.6 Capability Drift Risk

**Status:** MEDIUM RISK

Booking template already has:
- Customer Mini App
- QueryService
- DashboardController
- Owner module metadata

**Risk:** Adding scheduling complexity (slots, availability, resources) may accidentally make platform booking-centric.

**Mitigation:** Booking scheduling should be template-internal, NOT platform-exposed.

---

## 4. OVERENGINEERING DETECTION

### 4.1 Metadata

**Status:** NO OVERENGINEERING

OwnerModuleRegistry and TemplateRegistry are simple, explicit, non-recursive.

### 4.2 Capability System

**Status:** APPROPRIATELY LIGHTWEIGHT

Capability system uses simple booleans and arrays. No framework abstraction.

### 4.3 Event System

**Status:** APPROPRIATELY SEMANTIC

Events are typed strings with metadata. No distributed architecture.

### 4.4 Navigation

**Status:** APPROPRIATE

Navigation composed from OwnerModuleRegistry metadata. No over-abstraction.

### 4.5 Template System

**Status:** ⚠️ NOISE FROM DUMMY TEMPLATES

Template1, Template2, Template3 are dummy templates. They add:
- Registry pollution
- Factory injection overhead
- Cognitive noise for new engineers

**Recommendation:** Remove dummy templates.

---

## 5. UNDERENGINEERING DETECTION

### 5.1 Scheduling Semantics

**Status:** UNDERENGINEERED

Missing BEFORE Booking Engine:
- **Timezone laws** — How are timezones handled? Who owns timezone? Bot config? Customer? Server?
- **Availability rules** — Blackout dates? Holidays? Vacation days? Recurring unavailability?
- **Resource allocation** — Single resource (business) or multiple (staff, rooms)?
- **Booking window** — How far in advance? Minimum notice?
- **Cancellation policy** — Deadline? Refund rules?
- **Overlap prevention** — Current: unique (botId, date, timeSlot). Future: resource-scoped?

### 5.2 Analytics Scalability

**Status:** UNDERENGINEERED

Current: `GROUP BY eventType` on PostgreSQL.

Breaks when:
- Event volume > 1M per bot
- Dashboard needs time-series (daily/weekly trends)
- Cross-bot analytics (owner-level aggregation)

**Missing:**
- Materialized views
- Pre-aggregated daily stats
- Event archiving strategy
- Batch inserts

### 5.3 Operational Complexity

**Status:** APPROPRIATE FOR NOW

Current operational layer is lightweight. Future may need:
- Widget composition contracts
- Capability-driven UI rendering
- Operational permission model

But NOT needed for Booking Engine MVP.

### 5.4 Permission Model

**Status:** UNDERENGINEERED

Current: ownership verification only (`ownerId` on bot).

Future may need:
- Team members (multiple users per owner)
- Role-based access (admin, viewer)
- Permission scopes (read-only, manage bookings, manage settings)

But NOT needed for Booking Engine MVP.

---

## 6. BOOKING ENGINE PRECONDITIONS

### 6.1 Temporal Semantics

| Requirement | Status | Risk |
|-------------|--------|------|
| Timezone laws defined | ❌ NOT DEFINED | HIGH |
| Booking invariants defined | ⚠️ PARTIAL (status enum) | MEDIUM |
| Slot ownership semantics | ❌ NOT DEFINED | HIGH |
| Schedule consistency laws | ❌ NOT DEFINED | HIGH |

**Verdict:** Temporal semantics are NOT ready. Booking Engine MUST define these BEFORE implementation.

### 6.2 Availability Semantics

| Requirement | Status | Risk |
|-------------|--------|------|
| Availability philosophy | ❌ NOT DEFINED | HIGH |
| Resource allocation philosophy | ❌ NOT DEFINED | HIGH |
| Scheduling ownership | ❌ NOT DEFINED | MEDIUM |

**Verdict:** Availability semantics undefined. Who owns schedules? Bot config? Template? Owner?

### 6.3 Booking Lifecycle

| Status | Defined | State Machine |
|--------|---------|---------------|
| `pending` | ✅ Yes | Implicit |
| `confirmed` | ✅ Yes | Implicit |
| `cancelled` | ✅ Yes | Implicit |
| `completed` | ✅ Yes | Implicit |
| **Transitions** | ❌ No | No formal rules |

**Verdict:** Lifecycle states exist but transitions are NOT formalized. Can `completed` → `cancelled`? Can `pending` → `completed` (skip confirmed)?

### 6.4 Scheduling Ownership

**Question:** Who owns schedules, resources, availability, slot rules?

| Option | Assessment |
|--------|------------|
| Bot config | Current approach. Simple but limited. |
| Template | Template-specific. Harder to share across bots. |
| Owner | Platform-level. Requires new entity. |
| **Recommendation** | Bot config for MVP. Owner-level resources for future. |

---

## 7. ARCHITECTURAL DRIFT DETECTION

### 7.1 Booking-Centric Drift

**Risk Level: HIGH**

Booking template already has the most infrastructure:
- Customer Mini App
- QueryService
- DashboardController
- Owner module metadata
- Booking entity with lifecycle

**Danger:** Adding scheduling (slots, availability, resources) may:
1. Make booking logic leak into platform core
2. Make platform semantics booking-centric
3. Make other capabilities feel second-class

**Mitigation:** Scheduling logic MUST stay inside booking template. Platform provides generic primitives (customer, events, queries) but NOT booking-specific abstractions.

### 7.2 Dashboard-Centric Drift

**Risk Level: MEDIUM**

DashboardService aggregates everything. As capabilities grow, operational layer may become dominant.

**Mitigation:** DashboardService should use registry pattern for query aggregation, not direct injection.

### 7.3 Metadata-Centric Drift

**Risk Level: LOW**

OwnerModuleRegistry is simple. No risk of "metadata-driven everything".

### 7.4 Ecosystem Drift

**Risk Level: LOW**

TemplateFactory uses explicit registration. No dynamic loading. No plugin runtime.

---

## 8. COGNITIVE COMPLEXITY AUDIT

### 8.1 Module Sprawl

| Module | Purpose | Clarity |
|--------|---------|---------|
| AppModule | Root | ✅ Clear |
| RuntimeModule | Webhook processing | ✅ Clear |
| MiniappModule | Owner dashboard | ✅ Clear |
| CustomerMiniappModule | Customer Mini App | ✅ Clear |
| BotModule | Bot lifecycle + API | ⚠️ Mixed |
| CustomerModule | Universal customer | ✅ Clear |
| OwnerModule | Owner management | ✅ Clear |
| AnalyticsModule | Event tracking | ✅ Clear |
| BillingModule | Billing (future) | ✅ Clear |
| TemplateModule | Template registry | ✅ Clear |
| BookingModule | Booking template | ✅ Clear |
| LeadFunnelModule | Lead funnel template | ✅ Clear |
| PlatformBotModule | Provisioning bot | ✅ Clear |
| LifecycleModule | Cleanup jobs | ✅ Clear |
| OwnerModulesModule | Metadata registry | ✅ Clear |
| **Total: 15 modules** | | **Manageable** |

### 8.2 Service Sprawl

| Service | Layer | Clarity |
|---------|-------|---------|
| WebhookService | Runtime | ✅ Clear |
| BotService | Runtime | ✅ Clear |
| CustomerService | Universal | ✅ Clear |
| OwnerService | Platform | ✅ Clear |
| AnalyticsService | Universal | ✅ Clear |
| TelegramService | Infrastructure | ✅ Clear |
| TemplateFactory | Runtime | ✅ Clear |
| LeadFunnelService | Template runtime | ✅ Clear |
| BookingRuntimeService | Template runtime | ✅ Clear |
| LeadFunnelQueryService | Template query | ✅ Clear |
| BookingQueryService | Template query | ✅ Clear |
| DashboardService | Operational | ✅ Clear |
| NavigationService | Operational | ✅ Clear |
| OwnerViewService | Operational | ✅ Clear |
| CustomerBookingService | Customer API | ✅ Clear |
| PlatformBotService | Provisioning | ✅ Clear |
| **Total: 16+ services** | | **Approaching limit** |

### 8.3 New Engineer Onboarding

| Concept | Understandable? |
|---------|----------------|
| Runtime / Operational separation | ✅ Yes |
| Template pattern (handler → service) | ✅ Yes |
| Customer universality | ✅ Yes |
| Query-service pattern | ✅ Yes |
| Metadata-driven UI | ✅ Yes |
| Booking scheduling semantics | ❌ No (undefined) |

---

## 9. FOUNDATION FREEZE VERDICT

### VERIFIED STABLE FOUNDATIONS

| Foundation | Evidence |
|------------|----------|
| Runtime/Operational separation | WebhookService, TemplateFactory have no miniapp imports |
| Customer model universality | Template-agnostic, no template references |
| Event semantics | Canonical naming (dot notation, past tense) |
| Multi-tenant isolation | botId scoping everywhere |
| Namespace discipline | Deterministic API surface |
| Authentication | Telegram init data, bot token isolation |
| Template isolation | No cross-template imports |

### PARTIALLY STABLE FOUNDATIONS

| Foundation | Current State | Future Risk |
|------------|---------------|-------------|
| Query-service pattern | 2 services, works now | Breaks at 5+ capabilities |
| OwnerModuleRegistry | Simple flags work | Flag explosion at 5+ capabilities |
| Analytics aggregation | GROUP BY works | Slow at 1M+ events |
| TemplateFactory | Explicit registration | Manual changes at 10+ templates |
| Booking lifecycle | Status enum exists | No formal state machine |

### FRAGILE FOUNDATIONS

| Foundation | Risk | Trigger |
|------------|------|---------|
| DashboardService aggregation | God class | Adding CRM/Referrals/Subscriptions |
| Booking config schema | Inflexible workingHours | Complex scheduling requirements |
| Analytics writes | Synchronous per-event | High event volume |

### OVERENGINEERED AREAS

| Area | Problem | Action |
|------|---------|--------|
| Dummy templates (Template1/2/3) | Registry pollution | Remove |

### UNDERENGINEERED AREAS

| Area | Missing | Impact |
|------|---------|--------|
| Scheduling semantics | Timezone laws, availability rules | Blocks Booking Engine |
| Analytics scalability | Materialized views, batching | Blocks analytics growth |
| Permission model | RBAC, team access | Blocks multi-user features |

### REMAINING FOUNDATION GAPS (MUST CLOSE BEFORE BOOKING ENGINE)

1. **DashboardService query aggregation pattern** — Extract capability-agnostic aggregation
2. **Booking temporal semantics definition** — Timezone, availability, resource ownership
3. **Remove dummy templates** — Reduce cognitive noise

---

## 10. FINAL RECOMMENDATION

### OPTION B: Perform Additional Stabilization Tasks First

**Required tasks (in order):**

#### Task B1: DashboardService Aggregation Pattern
**Priority:** HIGH  
**Effort:** Small  
**Action:** Replace direct query service injection with registry/composition pattern.

```typescript
// CURRENT — god class
class DashboardService {
  constructor(
    private readonly bookingQueryService: BookingQueryService,
    private readonly leadFunnelQueryService: LeadFunnelQueryService,
    // ... 6 more in future
  ) {}
}

// TARGET — registry pattern
class DashboardService {
  constructor(
    private readonly queryRegistry: QueryServiceRegistry,
  ) {}
  
  async getOwnerStats(ownerId: string) {
    const queryServices = this.queryRegistry.getAll();
    // Aggregate from all registered query services
  }
}
```

#### Task B2: Booking Temporal Semantics Definition
**Priority:** HIGH  
**Effort:** Medium  
**Action:** Create `docs/BOOKING_TEMPORAL_SEMANTICS.md` defining:
- Timezone ownership (bot config? customer? server?)
- Availability rules (working hours + exceptions)
- Resource model (single vs. multiple)
- Booking window constraints
- Cancellation policy
- State machine transitions

#### Task B3: Remove Dummy Templates
**Priority:** LOW  
**Effort:** Small  
**Action:** Delete Template1, Template2, Template3 from:
- `src/templates/template1/`, `template2/`, `template3/`
- `src/templates/template.factory.ts`
- `src/templates/common/template.registry.ts`

#### Task B4: Analytics Pre-Aggregation
**Priority:** MEDIUM  
**Effort:** Medium  
**Action:** Add daily pre-aggregated stats table:
```typescript
@Entity('analytics_daily_stats')
class AnalyticsDailyStats {
  botId: string;
  date: string;
  eventType: string;
  count: number;
}
```

---

## 11. CONFIDENCE ASSESSMENT

| Area | Confidence |
|------|------------|
| Core architecture stability | HIGH |
| Event semantics stability | HIGH |
| Multi-tenant integrity | HIGH |
| Booking Engine readiness | LOW-MEDIUM |
| CRM capability readiness | MEDIUM |
| Analytics scalability | MEDIUM |
| Dashboard scalability | LOW-MEDIUM |

---

## 12. CONCLUSION

**The platform foundation is genuinely stable in core architecture.** Runtime/operational separation, customer universality, event semantics, and multi-tenant isolation are all solid.

**However, Booking Engine introduces temporal/scheduling complexity that the platform is not yet prepared for.** The three gaps (DashboardService aggregation, temporal semantics, dummy template noise) are small but critical.

**Recommendation: Close gaps B1-B3 before Booking Engine Foundation work.**

After these stabilizations:
- ✅ Booking Engine can proceed with confidence
- ✅ Future capabilities (CRM, Referrals) will not break DashboardService
- ✅ Platform remains capability-neutral

---

**Foundation Freeze Review Complete.**

**Next Action:** Implement stabilization tasks B1-B3.
