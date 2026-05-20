# CAPABILITY ARCHITECTURE PREPARATION AUDIT REPORT

**TASK:** 4 — Capability Architecture Preparation Audit  
**Date:** 2026-05-19  
**Status:** ✅ COMPLETE

---

## Executive Summary

**Verdict: PLATFORM IS READY FOR CAPABILITY EXPANSION**

The platform architecture is **capability-ready**. Current foundation supports:
- Booking as reusable capability
- Future CRM capability
- Future AI Assistant capability
- Future Referrals capability
- Future Subscriptions capability
- Analytics as platform capability

**Key Strengths:**
- Universal Customer entity with tags/notes for CRM
- Metadata-driven OwnerModuleRegistry
- Query-service pattern for operational data
- Clean runtime/operational separation
- Template-agnostic BotService and CustomerService

**Risks Identified:**
- 2 Medium risks (non-blocking)
- 0 Critical risks

---

## 1. Universal Core Assessment

### What Exists as Universal Core

| Component | Location | Capability-Ready |
|-----------|----------|------------------|
| **Bot** | `src/bot/entities/bot.entity.ts` | ✅ Universal — template field is parameter |
| **Customer** | `src/customer/entities/customer.entity.ts` | ✅ Universal — tags, notes, status |
| **Owner** | `src/owner/entities/owner.entity.ts` | ✅ Universal |
| **AnalyticsEvent** | `src/analytics/entities/analytics-event.entity.ts` | ✅ Universal |
| **UserState** | `src/bot/entities/user-state.entity.ts` | ✅ Universal (runtime state) |
| **BotService** | `src/bot/bot.service.ts` | ✅ Template-agnostic |
| **CustomerService** | `src/customer/customer.service.ts` | ✅ Universal queries |
| **OwnerModuleRegistry** | `src/owner-modules/owner-module.registry.ts` | ✅ Metadata-driven |

### What Exists as Template-Specific

| Component | Location | Notes |
|-----------|----------|-------|
| **Lead** | `src/bot/entities/lead.entity.ts` | Lead-funnel specific |
| **Booking** | `src/templates/booking/entities/booking.entity.ts` | Booking template specific |
| **BookingRuntimeService** | `src/templates/booking/booking-runtime.service.ts` | Runtime only |
| **LeadFunnelService** | `src/templates/lead-funnel/lead-funnel.service.ts` | Runtime only |
| **BookingQueryService** | `src/templates/booking/booking-query.service.ts` | Read-only queries |

### Universal Core ✅ ASSESSMENT

**Finding:** Universal core is properly isolated from template-specific code.

Evidence:
- Bot entity has `template` field but core fields are universal
- Customer entity designed for multi-capability (tags, notes, status)
- No template imports in core services (BotService, CustomerService)
- OwnerModuleRegistry drives UI from metadata

---

## 2. Capability Readiness Assessment

### Current Capability Pattern

```
Universal Core (Bot, Customer, Owner, Analytics)
    ↓
Query Services (BookingQueryService, LeadFunnelQueryService)
    ↓
Operational Layer (DashboardService, NavigationService)
    ↓
OwnerModuleRegistry (Metadata-driven UI)
```

### Query Service Architecture ✅ WORKING

Current query services:
- `BookingQueryService` — read-only booking data
- `LeadFunnelQueryService` — read-only lead data

Pattern verified:
- ✅ Operational layer ONLY reads through query services
- ✅ Query services do NOT mutate runtime state
- ✅ Runtime services remain isolated (BookingRuntimeService not exported)
- ✅ New capability query services can follow same pattern

### Future Query Service Scalability

| Capability | Query Service Location | Can Follow Pattern? |
|------------|------------------------|---------------------|
| CRM | New `CrmQueryService` | ✅ Yes |
| Referrals | New `ReferralQueryService` | ✅ Yes |
| Subscriptions | New `SubscriptionQueryService` | ✅ Yes |
| AI Assistant | New `AiConversationQueryService` | ✅ Yes |

---

## 3. Booking Capability Assessment

### Current Booking Architecture

| Layer | Component | Status |
|-------|-----------|--------|
| **Runtime** | BookingRuntimeService | ✅ Internal to template |
| **Query** | BookingQueryService | ✅ Exported for operational |
| **Customer API** | CustomerBookingService | ✅ Separate from runtime |
| **Entity** | Booking | ✅ Template-specific entity |
| **Owner Module** | booking.owner-module.ts | ✅ Metadata-driven |

### Is Booking Template or Capability?

**Current State: MIXED (Acceptable)**

| Aspect | Template-Oriented | Capability-Oriented |
|--------|-------------------|---------------------|
| Entity | Booking entity in templates/ | ✅ But referenceable |
| Query Service | BookingQueryService | ✅ Exported, reusable |
| Customer API | CustomerBookingService | ✅ Separate |
| Owner UI | Metadata in booking.owner-module.ts | ✅ Dynamic |
| Runtime | BookingRuntimeService | ⚠️ Internal, not exported |

### What Would Block Reusable Booking Engine?

**Nothing blocks it.** Current architecture allows:
1. BookingQueryService provides read-only access to operational
2. CustomerBookingService provides customer-facing API
3. Booking entity is template-specific but can be extended
4. OwnerModuleRegistry provides metadata for owner UI

### Booking Capability Readiness: ✅ READY

---

## 4. Customer Layer Assessment

### Customer Entity Analysis

```typescript
// src/customer/entities/customer.entity.ts
@Entity('customers')
export class Customer {
  botId: string;           // Multi-tenant
  telegramUserId: bigint;  // Universal identifier
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  
  // Universal lifecycle (NOT booking-specific)
  status: 'new' | 'active' | 'converted';
  
  // CRM-ready
  tags: string[];          // Lightweight segmentation
  notes: string | null;    // Owner notes
  
  createdAt: Date;
  updatedAt: Date;
}
```

### Future Capability Compatibility

| Future Capability | Customer Layer Support | Risk |
|-------------------|------------------------|------|
| **Bookings** | ✅ Uses telegramUserId | None |
| **CRM Notes** | ✅ Has `notes` field | None |
| **CRM Tags** | ✅ Has `tags` field | None |
| **AI Conversations** | ✅ Universal status | None |
| **Referrals** | ✅ Uses telegramUserId | None |
| **Purchases** | ✅ Uses telegramUserId | None |
| **Subscriptions** | ✅ Uses telegramUserId | None |

### Customer Layer Assessment: ✅ FUTURE-READY

---

## 5. Operational Layer Assessment

### Navigation Architecture

```typescript
// OwnerModuleRegistry drives ALL navigation
registerOwnerModule({
  template: 'booking',
  navigation: [
    { id: 'bookings', label: 'Bookings', route: '/bookings' },
    { id: 'calendar', label: 'Calendar', route: '/calendar' },
  ],
  analyticsWidgets: [...],
  settings: [...],
});
```

### Dashboard Aggregation

```typescript
// DashboardService aggregates across templates
async getOwnerStats(ownerId: string) {
  const bots = await this.botService.getOwnerBots(ownerId);
  
  // Booking stats from BookingQueryService
  const bookingCounts = await this.bookingQueryService.countBookingsByBotIds(botIds);
  
  // Lead stats from LeadFunnelQueryService  
  const leadCounts = await this.leadFunnelQueryService.countLeadsByBotIds(botIds);
  
  // Both query services are template-specific but accessed uniformly
}
```

### Future Dashboard Coexistence

| Future Dashboard | Can Coexist? | Evidence |
|-----------------|--------------|----------|
| **Booking** | ✅ Yes | OwnerModuleRegistry already has booking |
| **CRM** | ✅ Yes | Customer layer universal |
| **Analytics** | ✅ Yes | AnalyticsModule already exists |
| **AI Assistant** | ✅ Yes | Metadata-driven, extensible |
| **Referrals** | ✅ Yes | Can register in OwnerModuleRegistry |

### Operational Layer: ✅ CAPABILITY-READY

---

## 6. Metadata Architecture Assessment

### OwnerModuleRegistry Structure

```typescript
interface OwnerModuleDefinition {
  template: string;
  displayName: string;
  navigation: NavigationSection[];
  settings: SettingsSection[];
  analyticsWidgets: AnalyticsWidget[];
  usesCustomerLayer: boolean;
  createsLeads: boolean;
  hasCustomerMiniApp?: boolean;
}
```

### Metadata Sufficiency

| Metadata | Current | Future Need | Status |
|----------|---------|-------------|--------|
| Navigation | ✅ sections + route | ✅ Sufficient | OK |
| Settings | ✅ fields + types | ✅ Sufficient | OK |
| Widgets | ✅ count/chart/list/funnel | ✅ Sufficient | OK |
| Permissions | ❌ Missing | Needed for marketplace | ⚠️ Future |
| Feature Flags | ❌ Missing | Needed for white-label | ⚠️ Future |
| Capability Discovery | ❌ Missing | Needed for marketplace | ⚠️ Future |

### Missing Critical Metadata

| Metadata | Priority | Impact |
|----------|----------|--------|
| **Permissions** | Medium | Cannot implement role-based access yet |
| **Feature Flags** | Medium | Cannot A/B test owner features |
| **Capability Discovery** | Low | Can hardcode for MVP |

### Metadata Architecture: ✅ ADEQUATE (with future extensions needed)

---

## 7. Architectural Drift Detection

### Drift Analysis: ✅ NO DRIFT DETECTED

| Check | Status | Evidence |
|-------|--------|----------|
| Funnel-centric assumptions | ✅ None | Customer entity is universal |
| Booking-specific in core | ✅ None | Booking entity in templates/ |
| Analytics assumes leads only | ✅ None | AnalyticsEvent is generic |
| Dashboard hardcoded | ✅ None | OwnerModuleRegistry drives UI |
| Runtime in operational | ✅ None | Verified in TASK 3 |
| Template in core | ✅ None | No imports |

### Capability Confusion: ✅ NONE

Each capability is clearly separated:
- **Runtime**: TemplateFactory → handlers → services (conversation)
- **Query**: BookingQueryService, LeadFunnelQueryService (read)
- **Operational**: DashboardService (aggregate)
- **Metadata**: OwnerModuleRegistry (UI definition)

---

## 8. Future Capability Simulation

### CRM Capability

**What Already Supports:**
- Customer entity with `tags`, `notes`, `status`
- CustomerService provides CRUD
- OwnerModuleRegistry can register CRM navigation

**What Would Work:**
```typescript
registerOwnerModule({
  template: 'crm',
  navigation: [
    { id: 'contacts', label: 'Contacts', route: '/contacts' },
    { id: 'segments', label: 'Segments', route: '/segments' },
  ],
  // Uses existing Customer entity
});
```

**Risks:** None identified.

---

### AI Assistant Capability

**What Already Supports:**
- UserState entity for conversation state
- TemplateFactory pattern for handlers
- TelegramService for responses

**What Would Work:**
```typescript
// New template: ai-assistant
class AiAssistantHandler implements TemplateHandler {
  async handle(context) {
    // Process AI conversation
    // Store in UserState
  }
}
```

**Risks:** None identified.

---

### Referrals Capability

**What Already Supports:**
- Customer entity with `telegramUserId`
- AnalyticsEvent for tracking

**What Would Require:**
- New entity: `Referral` (referrer → referred)
- New query service: `ReferralQueryService`
- New owner module metadata

**Risks:** None identified — clean extension path.

---

### Subscriptions Capability

**What Already Supports:**
- Customer entity with `status` (can track subscription)
- Bot entity with `config` (subscription settings)

**What Would Require:**
- New entity: `Subscription` (customer → plan → status)
- New query service: `SubscriptionQueryService`
- New owner module metadata

**Risks:** None identified.

---

## 9. Critical Risks

### None Identified

No critical risks that would block capability expansion.

---

## 10. Medium Risks

| Risk | Description | Impact | Mitigation |
|------|-------------|--------|------------|
| **Permissions metadata missing** | Cannot implement role-based access for marketplace | Medium | Add to OwnerModuleDefinition when needed |
| **Feature flags missing** | Cannot A/B test owner features | Medium | Add to Bot.config when needed |

---

## 11. Architectural Strengths

| Strength | Description |
|----------|-------------|
| **Universal Customer** | Entity designed for multi-capability (tags, notes, status) |
| **Metadata-driven UI** | OwnerModuleRegistry enables dynamic capability registration |
| **Query-service pattern** | Clean read-layer for operational |
| **Runtime isolation** | Verified in TASK 3 |
| **Template-agnostic core** | BotService, CustomerService are universal |
| **No circular dependencies** | Clean module boundaries |
| **Capability-ready entities** | Customer, Bot, AnalyticsEvent are extensible |

---

## 12. Required Stabilization Before Booking Engine

**NONE REQUIRED**

The platform is ready for Booking Engine implementation without additional stabilization.

Current architecture already supports:
- BookingQueryService for operational queries
- CustomerBookingService for customer API
- Booking entity for data
- OwnerModuleRegistry for owner UI
- Clean separation from runtime

---

## 13. Final Foundation Readiness Verdict

### ✅ FOUNDATION IS COMPLETE

| Foundation Invariant | Status |
|---------------------|--------|
| Deterministic HTTP Surface | ✅ Complete (TASK 1-2) |
| Runtime / Operational Separation | ✅ Verified (TASK 3) |
| Capability Architecture | ✅ Ready (This TASK) |
| Universal Customer Layer | ✅ Ready |
| Metadata-Driven UI | ✅ Ready |
| Query-Service Pattern | ✅ Ready |
| No Architectural Drift | ✅ Verified |

### Recommendation

**Proceed to Booking Engine implementation.**

The platform foundation is stable and capability-ready. No additional architectural work is required before implementing the scheduling core.

---

**Audit Complete.** Awaiting approval.

---

## Appendix: Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL CORE                               │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────────┐ │
│  │   Bot   │  │ Customer │  │  Owner  │  │ AnalyticsEvent   │ │
│  │ Entity  │  │ Entity   │  │ Entity  │  │    Entity        │ │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └────────┬─────────┘ │
│       │            │              │                  │           │
│       └────────────┴──────────────┴──────────────────┘           │
│                           │                                      │
│  ┌────────────────────────┴───────────────────────────────┐    │
│  │              BotService, CustomerService                 │    │
│  │              (Template-agnostic core services)           │    │
│  └────────────────────────┬───────────────────────────────┘    │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   QUERY       │  │    RUNTIME    │  │   METADATA    │
│   SERVICES    │  │   (Template)  │  │   DRIVEN      │
│               │  │               │  │               │
│ BookingQuery  │  │ BookingRuntime│  │ OwnerModule   │
│ Service       │  │ Service       │  │ Registry      │
│               │  │               │  │               │
│ LeadFunnel   │  │ LeadFunnel    │  │ Navigation    │
│ QueryService │  │ Service       │  │ from metadata │
│               │  │               │  │               │
│ (Read-only)   │  │ (Conversation)│ │ (UI-driven)   │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │    OPERATIONAL      │
                 │      LAYER          │
                 │                     │
                 │ DashboardService    │
                 │ NavigationService  │
                 │ Owner Dashboard    │
                 │                     │
                 └─────────────────────┘
```

---

## Appendix: Future Capability Extension Paths

| Capability | Extend From | New Files Needed |
|------------|-------------|-----------------|
| CRM | Customer entity | CRMQueryService, crm.owner-module.ts |
| AI Assistant | TemplateFactory | AiAssistantHandler, AiAssistantService |
| Referrals | Customer entity | Referral entity, ReferralQueryService |
| Subscriptions | Customer entity | Subscription entity, SubscriptionQueryService |
