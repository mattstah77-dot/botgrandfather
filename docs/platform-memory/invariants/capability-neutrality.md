# Capability Neutrality

**Purpose:** Platform must not be template-centric  
**Status:** CANONICAL — Tier 1 Invariant  
**Version:** 1.0

---

## THE LAW

> **Platform semantics are capability-neutral.**
> **No single template defines platform identity.**

---

## CAPABILITY-NEUTRAL SEMANTICS

### Universal Terms

| Use This | NOT This |
|----------|----------|
| Interaction | Lead |
| Session | Funnel session |
| Flow | Funnel |
| Conversion | Lead conversion |
| Customer | Lead (as entity) |
| maxInteractionsPerMonth | maxLeadsPerMonth |
| maxFlows | maxFunnels |

### Why Neutrality Matters

If platform uses "lead" everywhere:
- Booking template feels like second-class citizen.
- AI assistant template doesn't fit.
- Shop template requires platform changes.
- Platform becomes "Lead Funnel Builder", not universal platform.

### Correct Usage

```typescript
// ✅ CORRECT — Generic
await analytics.trackEvent(botId, 'session.started', {
  template: 'lead-funnel',
  flowType: 'funnel',
});

// ❌ FORBIDDEN — Template-specific
await analytics.trackEvent(botId, 'funnel.started');
```

```typescript
// ✅ CORRECT — Generic metric
totalInteractions: number;

// ❌ FORBIDDEN — Template-specific metric
totalLeads: number;
```

---

## TEMPLATE-AGNOSTIC CORE

### CustomerService

CustomerService has ZERO references to templates.

```typescript
// ✅ CORRECT
class CustomerService {
  ensureCustomer(botId, telegramUserId, profile) { }
  updateStatus(botId, telegramUserId, status) { }
}

// ❌ FORBIDDEN
class CustomerService {
  ensureCustomer(botId, telegramUserId, profile, templateType) { } // NO!
  getLeads(botId) { } // NO!
}
```

### BotService

BotService has ZERO template-specific logic.

```typescript
// ✅ CORRECT
class BotService {
  getBotOverview(botId) { }
  getOwnerBots(ownerId) { }
}

// ❌ FORBIDDEN
class BotService {
  getLeadCount(botId) { } // NO! Use LeadFunnelQueryService
  getBookingCount(botId) { } // NO! Use BookingQueryService
}
```

### AnalyticsService

AnalyticsService has ZERO template-specific event names.

```typescript
// ✅ CORRECT
class AnalyticsService {
  trackEvent(botId, 'session.started', metadata);
  trackEvent(botId, 'conversion.completed', metadata);
}

// ❌ FORBIDDEN
class AnalyticsService {
  trackFunnelStart(botId); // NO!
  trackBookingCreated(botId); // NO!
}
```

---

## DASHBOARD NEUTRALITY

### Generic Metrics

Dashboard shows template-agnostic metrics:

```typescript
// ✅ CORRECT
interface DashboardStats {
  totalBots: number;
  totalCustomers: number;
  totalInteractions: number;
}

// ❌ FORBIDDEN
interface DashboardStats {
  totalBots: number;
  totalCustomers: number;
  totalLeads: number; // NO!
  totalBookings: number; // NO!
}
```

### Template-Specific Data

Template-specific data comes from capability providers, not hardcoded:

```typescript
// ✅ CORRECT
const providers = capabilityRegistry.getAll();
for (const provider of providers) {
  const metrics = await provider.getOwnerMetrics(ownerId);
  totalInteractions += metrics.total;
}

// ❌ FORBIDDEN
const leadCount = await leadFunnelQueryService.countLeadsByBotIds(botIds);
const bookingCount = await bookingQueryService.countBookingsByBotIds(botIds);
```

---

## BILLING NEUTRALITY

### Capability-Based Quotas

```typescript
// ✅ CORRECT
interface PlanLimits {
  maxBots: number;
  maxInteractionsPerMonth: number;
  maxFlows: number;
}

// ❌ FORBIDDEN
interface PlanLimits {
  maxBots: number;
  maxLeadsPerMonth: number; // NO!
  maxFunnels: number; // NO!
}
```

---

## INVARIANTS

> **Invariant CN.1:** Platform semantics use capability-neutral terminology.

> **Invariant CN.2:** No template-specific terminology in core platform code.

> **Invariant CN.3:** Dashboard metrics are template-agnostic ("Interactions", not "Leads").

> **Invariant CN.4:** Billing quotas are capability-based ("maxInteractionsPerMonth", not "maxLeadsPerMonth").

> **Invariant CN.5:** Core services (CustomerService, BotService, AnalyticsService) have ZERO template references.

> **Invariant CN.6:** Template-specific data accessed through capability providers, not hardcoded.

---

**Version 1.0 — 2026-05-23**
