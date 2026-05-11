# BotGrandFather Mini App Architecture

## Purpose

The Mini App is the **universal operational control center** for BotGrandFather platform owners.

It is designed as a **reusable, template-agnostic, dynamically-driven** operational layer that serves ALL bot types: lead-funnel, booking, AI assistant, shop, and future templates.

## Core Principle: Runtime vs Operational Separation

```
┌─────────────────────────────────────────┐
│           MINI APP (Operational)        │
│  Dashboard • CRM • Analytics • Settings │
│  Billing • Management • Configuration   │
└─────────────────────────────────────────┘
              │ uses Owner APIs
┌─────────────────────────────────────────┐
│      UNIVERSAL BUSINESS PLATFORM        │
│  Owners • Bots • Customers • Analytics  │
│  Events • Billing • Messaging           │
└─────────────────────────────────────────┘
              │ uses Runtime APIs
┌─────────────────────────────────────────┐
│         RUNTIME (Template Flows)        │
│  Lead Funnel • Booking • AI • Shop      │
│  Webhooks • Telegram Messages           │
└─────────────────────────────────────────┘
```

**Golden Rule:** Mini App NEVER processes webhooks, runs funnels, or sends Telegram messages.

## Universal-First Philosophy

### Correct Architecture

```
Dashboard
├── Universal: Total Bots, Total Customers
├── Universal: Recent Activity
├── Template: Conversion Rate (lead-funnel)
└── Template: Appointments Today (booking)
```

### Wrong Architecture

```
Lead Funnel Dashboard
├── Lead Funnel Questions
├── Lead Funnel Leads
└── Lead Funnel Settings

Booking Dashboard (separate)
├── Booking Calendar
├── Booking Slots
└── Booking Settings
```

**One universal dashboard. Template modules add sections dynamically.**

## Dynamic Module Philosophy

### Backend Drives UI

The backend `OwnerModuleRegistry` is the **single source of truth** for Mini App UI.

```typescript
// Backend: OwnerModuleRegistry
registerOwnerModule({
  template: 'lead-funnel',
  navigation: [
    { id: 'questions', label: 'Questions', route: '/questions' },
    { id: 'leads', label: 'Leads', route: '/leads' },
  ],
  analyticsWidgets: [
    { id: 'conversion-rate', label: 'Conversion Rate', type: 'chart', dataSource: 'events' },
  ],
});

// Mini App: dynamically renders from registry
GET /owner-modules/lead-funnel
→ renders navigation, widgets, settings
```

### No Template Hardcoding

**Wrong:**
```typescript
if (template === 'lead-funnel') {
  return { questions, leads, conversionRate };
}
if (template === 'booking') {
  return { calendar, slots, occupancy };
}
```

**Correct:**
```typescript
const module = getOwnerModule(template);
const widgets = module.analyticsWidgets.map(w => fetchWidgetData(w));
return { widgets };
```

## Auth Architecture

### Current: Telegram initData

```
Telegram WebApp
     │
     │ opens Mini App with initData
     ▼
Mini App Frontend
     │
     │ sends X-Telegram-Init-Data header
     ▼
MiniAppAuthGuard
     │
     │ validates HMAC-SHA256 signature
     ▼
TelegramInitDataService
     │
     │ parses user, finds/creates Owner
     ▼
MiniAppSession attached to request
```

### Future: Session Management

- JWT tokens (optional)
- Session caching (Redis)
- Refresh mechanism
- Expiry handling

## Navigation Composition

Navigation is dynamically composed from two sources:

### 1. Universal Navigation

Same for all owners:
- Dashboard
- My Bots
- Customers
- Analytics
- Settings

### 2. Template Navigation

From OwnerModuleRegistry, based on owner's bots:
- Lead Funnel → Questions, Leads
- Booking → Calendar, Slots
- AI Assistant → Conversations, Prompts

### Composition Logic

```typescript
composeNavigation(templates: string[]): NavigationItem[] {
  const nav = [...universalNavigation];

  for (const template of unique(templates)) {
    const module = getOwnerModule(template);
    nav.push(...module.navigation);
  }

  return nav;
}
```

## Widget Architecture

### Universal Widget Types

```typescript
interface DashboardWidget {
  key: string;
  type: 'metric' | 'list' | 'chart' | 'table';
  title: string;
  data: unknown;
}
```

### Metric Widget

```json
{
  "key": "total-customers",
  "type": "metric",
  "title": "Total Customers",
  "data": { "value": 120, "label": "Customers", "trend": "up" }
}
```

### List Widget

```json
{
  "key": "recent-leads",
  "type": "list",
  "title": "Recent Leads",
  "data": {
    "items": [...],
    "columns": [{"key": "contact", "label": "Contact"}],
    "total": 18
  }
}
```

### Chart Widget

```json
{
  "key": "conversion-rate",
  "type": "chart",
  "title": "Conversion Rate",
  "data": {
    "chartType": "line",
    "labels": ["Mon", "Tue", "Wed"],
    "datasets": [{"label": "Rate", "data": [5, 8, 12]}]
  }
}
```

## View Composition

### DashboardView

```typescript
interface DashboardView {
  key: 'dashboard';
  title: 'Dashboard';
  navigation: NavigationItem[];
  widgets: DashboardWidget[];
  meta: { ownerId, botTemplates };
}
```

### BotDetailView

```typescript
interface BotDetailView {
  key: 'bot-detail';
  title: 'Bot Overview';
  navigation: NavigationItem[]; // template-specific
  widgets: DashboardWidget[];
  meta: { botId, template };
}
```

## API Design

### Owner-Level Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /miniapp/dashboard` | initData | Universal owner dashboard |
| `GET /miniapp/navigation` | initData | Dynamic navigation |
| `GET /miniapp/me` | initData | Current owner profile |

### Bot-Level Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /miniapp/bots/:id/overview` | initData | Bot stats (any template) |
| `GET /miniapp/bots/:id/view` | initData | Composed bot view |
| `GET /miniapp/bots/:id/customers` | initData | Customer list |
| `GET /miniapp/bots/:id/analytics` | initData | Analytics events |

### Registry Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /owner-modules` | - | All registered modules |
| `GET /owner-modules/:template` | - | Specific module metadata |

## Clean API Boundaries

### Mini App Controllers CAN:
- Use OwnerService, CustomerService, AnalyticsService
- Read from OwnerModuleRegistry
- Compose views from services
- Return structured responses

### Mini App Controllers CANNOT:
- Access repositories directly
- Contain business logic
- Contain template-specific logic
- Send Telegram messages
- Process webhooks

## What Mini App Should NEVER Become

1. **Runtime Engine**
   - ❌ Process webhooks
   - ❌ Run funnels
   - ❌ Send Telegram messages

2. **Monolithic Hardcoded Dashboard**
   - ❌ Template-specific controllers
   - ❌ Hardcoded lead-funnel UI
   - ❌ Giant switch statements

3. **Template-Coupled**
   - ❌ `if (template === 'lead-funnel')`
   - ❌ Separate dashboards per template
   - ❌ Duplicated UX patterns

## Future Roadmap

### v1.1 — WebApp UI
- React/Vue SPA
- Telegram WebApp SDK integration
- Static file serving

### v1.2 — Settings Forms
- Dynamic forms from OwnerModuleRegistry
- Config validation
- Real-time preview

### v1.3 — Real-Time Updates
- WebSocket or SSE
- Live customer activity
- Live lead notifications

### v1.4 — Billing UI
- Subscription management
- Plan comparison
- Usage metrics

### v1.5 — Advanced CRM
- Customer search & filtering
- Tags & notes management
- Customer timeline

## File Structure

```
src/miniapp/
├── auth/
│   ├── telegram-init-data.service.ts   # initData validation
│   ├── miniapp-auth.guard.ts           # Auth guard
│   └── miniapp-session.interface.ts    # Session type
├── controllers/
│   ├── miniapp.controller.ts           # Owner-level endpoints
│   └── owner-dashboard.controller.ts   # Bot-level endpoints
├── dto/
│   └── README.md                       # Future DTOs
├── interfaces/
│   ├── dashboard-widget.interface.ts   # Widget model
│   ├── navigation-item.interface.ts    # Navigation model
│   └── owner-view.interface.ts         # View model
├── services/
│   ├── dashboard.service.ts            # Data aggregation
│   ├── navigation.service.ts           # Dynamic navigation
│   └── owner-view.service.ts           # View composition
├── ui/
│   └── README.md                       # Future frontend
├── miniapp.module.ts
└── README.md
```
