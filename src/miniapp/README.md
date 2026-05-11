# Mini App Module

## Purpose

The Mini App is the **operational control center** for BotGrandFather platform owners.

It is NOT runtime. It is NOT a template-specific dashboard.

## What Mini App Is

- **Configuration** — manage bot settings
- **Analytics** — view business metrics
- **CRM** — manage customers
- **Management** — oversee bots
- **Billing** — subscription management (future)
- **Operations** — owner-facing tools

## What Mini App Is NOT

- ❌ Runtime engine (webhooks, funnels, flows)
- ❌ Template-specific hardcoded UI
- ❌ Monolithic dashboard
- ❌ Business logic executor

## Architecture

```
Mini App (Operational Layer)
├── Auth (Telegram initData)
├── Dashboard (universal overview)
├── Navigation (dynamic, template-driven)
├── Widgets (reusable, type-safe)
└── Views (composed, data-driven)

Runtime (Separate Layer)
├── Webhook processing
├── Template flows
├── Telegram messages
└── User state
```

## Folder Structure

```
src/miniapp/
├── auth/                           # Telegram WebApp auth
│   ├── telegram-init-data.service.ts
│   ├── miniapp-auth.guard.ts
│   └── miniapp-session.interface.ts
├── controllers/                    # API endpoints
│   ├── miniapp.controller.ts       # Owner-level endpoints
│   └── owner-dashboard.controller.ts # Bot-level endpoints
├── dto/                            # Future: request/response DTOs
├── interfaces/                     # Type definitions
│   ├── dashboard-widget.interface.ts
│   ├── navigation-item.interface.ts
│   └── owner-view.interface.ts
├── services/                       # Business logic
│   ├── dashboard.service.ts        # Data aggregation
│   ├── navigation.service.ts       # Dynamic navigation
│   └── owner-view.service.ts       # View composition
├── ui/                             # Future: frontend assets
│   └── README.md
├── miniapp.module.ts
└── README.md
```

## API Endpoints

### Authenticated (requires Telegram initData)

| Endpoint | Description |
|----------|-------------|
| `GET /miniapp/dashboard` | Universal owner dashboard |
| `GET /miniapp/navigation` | Dynamic navigation structure |
| `GET /miniapp/me` | Current owner profile |
| `GET /miniapp/bots/:id/overview` | Bot overview (any template) |
| `GET /miniapp/bots/:id/view` | Composed bot view |
| `GET /miniapp/bots/:id/customers` | Customer list |
| `GET /miniapp/bots/:id/analytics` | Analytics events |

## Auth

All Mini App endpoints require Telegram `initData` validation.

- Passed in `X-Telegram-Init-Data` header
- Validated cryptographically via HMAC-SHA256
- Creates/finds Owner automatically
- No JWT, no sessions, no refresh tokens (yet)

## Dynamic Navigation

Navigation is composed from:

1. **Universal items** — same for all owners (Dashboard, Bots, Customers, Analytics, Settings)
2. **Template items** — from OwnerModuleRegistry (lead-funnel: Questions, Leads, etc.)

The Mini App renders navigation dynamically — no hardcoding.

## Widget Architecture

Widgets are universal and type-safe:

```typescript
interface DashboardWidget {
  key: string;
  type: 'metric' | 'list' | 'chart' | 'table';
  title: string;
  data: unknown;
}
```

Template modules register widgets via OwnerModuleRegistry.
The Mini App renders them generically.

## Future Roadmap

- v1.1: Telegram WebApp UI (React/Vue)
- v1.2: Settings forms (dynamic from registry)
- v1.3: Real-time updates
- v1.4: Billing UI
- v1.5: Advanced CRM
