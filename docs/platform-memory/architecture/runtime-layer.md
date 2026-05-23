# Runtime Layer

**Purpose:** Describe runtime layer architecture  
**Status:** CANONICAL — Tier 4 Description  
**Version:** 1.0

---

## DEFINITION

Runtime layer processes Telegram webhooks, executes template business logic, and manages customer lifecycle.

**Never imports operational layer.**

---

## COMPONENTS

### Webhook Module

- Receives Telegram webhooks.
- Validates payload signature.
- Dispatches to template handler.
- Ensures idempotency.

### Template Module

- `TemplateFactory`: Dispatches to template services.
- `LeadFunnelService`: Lead funnel business logic.
- `BookingRuntimeService`: Booking business logic.
- Template-specific entities.

### Customer Module

- `CustomerService`: Universal customer lifecycle.
- `Customer` entity: Template-agnostic.
- Status management: `new`, `active`, `converted`.

### Analytics Module

- `AnalyticsService`: Event tracking.
- `AnalyticsEvent` entity: Universal.
- Synchronous event emission.

### Bot Module

- `BotService`: Bot entity management.
- Bot configuration and status.

---

## DATA FLOW

```
Telegram Webhook
  → WebhookService
    → Validate signature
    → Ensure idempotency
    → Find bot by token
    → Dispatch to TemplateFactory
      → TemplateService (LeadFunnel / Booking)
        → CustomerService.ensureCustomer()
        → Template business logic
        → AnalyticsService.trackEvent()
```

---

## INVARIANTS ENFORCED

- Runtime NEVER imports operational.
- Template services have ZERO imports from miniapp/.
- All queries scoped by botId.
- Events emitted synchronously.

---

**Version 1.0 — 2026-05-23**
