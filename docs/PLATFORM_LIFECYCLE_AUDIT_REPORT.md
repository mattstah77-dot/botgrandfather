# Platform Lifecycle & Hybrid Flow Audit Report

**Date:** Post-Stabilization Audit  
**Scope:** Booking Template — Complete Minimal Working Vertical Slice  
**Constraint:** No rewrite, no premature abstractions, no CQRS  

---

## Executive Summary

After architectural stabilization, the platform has a **solid backend foundation** but **critical gaps** prevent a working hybrid (chat + miniapp) Booking flow.

**What Works:**
- Template registration (registry, factory, owner module)
- Chat-based booking flow (complete conversational pipeline)
- Owner MiniApp backend endpoints (dashboard, bookings, analytics)
- Auth & ownership verification
- Runtime/operational separation

**What's Broken / Missing:**
- Platform Bot does NOT show Booking in template selection UI
- No link generation (bot link, owner dashboard link, customer miniapp link)
- No customer-facing MiniApp at all
- No chat → MiniApp transition (CTA button)
- No customer auth/session model

**Verdict:** The backend is ~70% ready. The missing 30% is:
1. Platform Bot UI fix (1 line)
2. Link generation in connect flow
3. Minimal customer MiniApp backend
4. CTA button in chat flow

---

## Section 1 — Template Registration State

### 1.1 Template Registry

| Component | Status | Details |
|---|---|---|
| `TEMPLATE_REGISTRY` | ✅ Complete | `booking` entry exists with `bookingConfigSchema` + `bookingDefaultConfig` |
| `VALID_TEMPLATE_NAMES` | ✅ Complete | Includes `'booking'` |
| `isValidTemplate('booking')` | ✅ Works | Used in `BotService.connectBot()` |

### 1.2 Template Factory

| Component | Status | Details |
|---|---|---|
| Handler registration | ✅ Complete | `this.handlers.set('booking', new BookingHandler(...))` |
| `BookingRuntimeService` injection | ✅ Complete | Injected in `TemplateFactory` constructor |
| `BookingHandler` | ✅ Complete | Routes callbacks + messages to runtime service |

### 1.3 Owner Module Registry

| Component | Status | Details |
|---|---|---|
| `booking.owner-module.ts` | ✅ Complete | Defines navigation (Bookings, Calendar), settings, analytics widgets |
| `OwnerModulesModule` import | ✅ Complete | `import '../templates/booking/booking.owner-module'` — side-effect registration |
| Registry lookup | ✅ Works | `NavigationService.getTemplateNavigation('booking')` returns booking nav items |

### 1.4 Bot Creation Flow

| Component | Status | Details |
|---|---|---|
| `ConnectBotDto.template` | ✅ Complete | Validated, schema-checked, defaults applied |
| `BotService.connectBot()` | ✅ Complete | Creates bot record, sets webhook, returns bot info |
| **Platform Bot welcome keyboard** | ❌ **BROKEN** | `sendWelcome()` does NOT include Booking template button |

```typescript
// CURRENT (src/platform-bot/platform-bot.service.ts)
const keyboard = {
  inline_keyboard: [
    [
      { text: 'Template 1', callback_data: 'template:template1' },
      { text: 'Template 2', callback_data: 'template:template2' },
      { text: 'Template 3', callback_data: 'template:template3' },
    ],
    [
      { text: '🎯 Lead Funnel', callback_data: 'template:lead-funnel' },
      // ❌ MISSING: Booking template button
    ],
  ],
};
```

**Impact:** Owner CANNOT select Booking template via Platform Bot. Booking can only be created via direct API call (`POST /bots/connect` with `template: 'booking'`).

---

## Section 2 — Bot Provisioning Flow

### Expected Flow

```
Owner opens @BotGrandFather
  ↓
/start → Welcome message with template selection
  ↓
Clicks "📅 Booking" → System stores selected template
  ↓
Receives "Please send your bot token"
  ↓
Sends token → System validates + creates bot
  ↓
Receives success message with links:
  - Bot link: t.me/MyBot
  - Owner dashboard: Mini App URL
  - Customer Mini App: Mini App URL (if hybrid)
```

### Current Flow

```
Owner opens @BotGrandFather
  ↓
/start → Welcome message
  ↓
❌ NO "Booking" option in keyboard
  ↓
Owner can only select: Template 1/2/3, Lead Funnel
  ↓
If owner somehow creates booking bot (via API):
  ↓
Receives: "✅ Bot @MyBot connected successfully!"
  ↓
❌ NO bot link
  ↌ NO owner dashboard link
  ❌ NO customer miniapp link
```

### Gap Analysis

| Step | Status | Gap |
|---|---|---|
| 1. Open platform bot | ✅ Works | `@BotGrandFather` webhook active |
| 2. Template selection | ❌ Broken | Booking missing from keyboard |
| 3. Token submission | ✅ Works | `handleTokenSubmission()` validates + creates |
| 4. Bot creation | ✅ Works | `BotService.connectBot()` transactional |
| 5. Webhook setup | ✅ Works | Automatic |
| 6. **Link generation** | ❌ Missing | No links returned to owner |
| 7. **Owner dashboard access** | ❌ Missing | No Mini App URL provided |
| 8. **Customer Mini App access** | ❌ Missing | No customer-facing entry point |

---

## Section 3 — MiniApp Architecture Audit

### 3.1 Owner MiniApp — Backend

| Component | Status | Details |
|---|---|---|
| `GET /miniapp/dashboard` | ✅ Ready | Aggregates profile, bots, stats, view |
| `GET /miniapp/navigation` | ✅ Ready | Universal + template-specific nav |
| `GET /miniapp/me` | ✅ Ready | Owner profile |
| `GET /miniapp/bots/:id/overview` | ✅ Ready | Bot stats (customers, leads, bookings, events) |
| `GET /miniapp/bots/:id/view` | ✅ Ready | Composed view with widgets |
| `GET /miniapp/bots/:id/customers` | ✅ Ready | Customer list |
| `GET /miniapp/bots/:id/leads` | ✅ Ready | Lead list (lead-funnel) |
| `GET /miniapp/bots/:id/analytics` | ✅ Ready | Analytics events |
| `GET /miniapp/bots/:id/bookings` | ✅ Ready | Booking list |
| `GET /miniapp/bots/:id/bookings/calendar` | ⚠️ Partial | Returns all bookings, no date range filtering yet |
| Auth (`MiniAppAuthGuard`) | ✅ Ready | Telegram initData validation |
| Ownership (`BotOwnershipGuard`) | ✅ Ready | Cross-tenant protection |
| Navigation composition | ✅ Ready | Dynamic from `OwnerModuleRegistry` |
| Widget composition | ✅ Ready | Metric widgets for dashboard |

### 3.2 Owner MiniApp — Frontend

| Component | Status | Details |
|---|---|---|
| React/Vue/Flutter app | ❌ Missing | No frontend code exists |
| Telegram Mini App bootstrap | ❌ Missing | No `Telegram.WebApp.ready()` etc. |
| UI components | ❌ Missing | No buttons, lists, forms |
| API client | ❌ Missing | No fetch/axios layer |

**Note:** The backend is designed for a frontend that doesn't exist yet. All endpoints return JSON that a frontend would consume.

### 3.3 Customer MiniApp

| Component | Status | Details |
|---|---|---|
| Customer auth/session | ❌ Missing | No customer identity system |
| Customer-facing endpoints | ❌ Missing | No `GET /customer/...` routes |
| Booking creation via MiniApp | ❌ Missing | Only chat-based booking exists |
| Slot selection UI backend | ❌ Missing | No slot query endpoint for customers |
| Confirmation flow | ❌ Missing | No customer confirmation endpoint |

**Current State:** Customer interacts ONLY via chat. Booking is created entirely through Telegram inline keyboards. There is NO Mini App entry point for customers.

---

## Section 4 — Hybrid Flow Audit

### Expected Hybrid Flow

```
CHAT PHASE (Entry)
  Customer opens bot → /start
  ↓
  Greeting + "Book an appointment"
  ↓
  [Optional: Quick questions in chat]
  ↓
  CTA: "📅 Open Booking App" (WebApp button)

MINIAPP PHASE (Core)
  Customer clicks CTA → MiniApp opens
  ↓
  Service selection UI
  ↓
  Calendar + slot selection
  ↓
  Confirmation + personal details
  ↓
  Booking created

CHAT PHASE (Confirmation)
  MiniApp closes → Back to chat
  ↓
  "✅ Your booking is confirmed!"
  ↓
  Reminder messages (future)
```

### Current Flow (Chat-Only)

```
CHAT PHASE (Complete flow in chat)
  Customer opens bot → /start
  ↓
  "Welcome to My Business! Please select a service:"
  ↓
  [Inline keyboard: Service 1, Service 2]
  ↓
  "Please select a date:"
  ↓
  [Inline keyboard: Mon, Tue, Wed...]
  ↓
  "Available slots for 2024-01-15:"
  ↓
  [Inline keyboard: 09:00, 10:00, 11:00...]
  ↓
  "📅 Booking Summary... Please confirm"
  ↓
  [Inline keyboard: ✅ Confirm, ❌ Cancel]
  ↓
  "Your booking is confirmed! See you soon."

MINIAPP PHASE
  ❌ DOES NOT EXIST
```

### Transition Points Analysis

| Transition | Status | Details |
|---|---|---|
| Chat → MiniApp | ❌ Missing | No `reply_markup` with `web_app` button |
| MiniApp → Chat | ❌ Missing | No MiniApp exists to close |
| Chat → Deep Link | ❌ Missing | No `startapp` parameter generation |
| MiniApp → Backend | ❌ Missing | No customer endpoints |

---

## Section 5 — Template Capability Model

### Current `OwnerModuleDefinition`

```typescript
interface OwnerModuleDefinition {
  template: string;
  displayName: string;
  navigation: NavigationSection[];
  settings: SettingsSection[];
  analyticsWidgets: AnalyticsWidget[];
  usesCustomerLayer: boolean;
  createsLeads: boolean;
}
```

### Capability Gaps

| Capability | Current | Needed For Hybrid | Risk |
|---|---|---|---|
| `usesCustomerLayer` | ✅ | ✅ | Low |
| `createsLeads` | ✅ | Not for booking | Low |
| **`hasCustomerMiniApp`** | ❌ **Missing** | ✅ **Required** | **Medium** |
| **`hybridFlow`** | ❌ **Missing** | ✅ **Required** | **Medium** |

### Recommendation

**DO NOT** create a complex capability system. Add only what's needed:

```typescript
// Minimal addition to OwnerModuleDefinition
interface OwnerModuleDefinition {
  // ... existing fields ...
  hasCustomerMiniApp?: boolean;  // Optional, defaults to false
}
```

This is a single optional boolean. No enums, no complex types, no capability engine.

---

## Section 6 — MiniApp Link Generation

### Current State

| Link Type | Status | Current Behavior |
|---|---|---|
| Bot link (`t.me/{username}`) | ❌ Missing | `connectBot()` returns `botUsername` but not formatted link |
| Owner dashboard MiniApp | ❌ Missing | No Mini App URL generation |
| Customer MiniApp | ❌ Missing | No URL, no `startapp` param |
| Webhook URL | ✅ Works | Returned in `connectBot()` response |

### What's Needed

```typescript
// After bot creation, return:
{
  id: bot.id,
  template: bot.template,
  botUsername: botInfo.username,
  botLink: `https://t.me/${botInfo.username}`,           // NEW
  ownerDashboardUrl: `https://t.me/BotGrandFather/app`,   // NEW (or custom MiniApp URL)
  customerMiniAppUrl: `https://t.me/${botInfo.username}?startapp=booking`, // NEW
  webhookUrl,
}
```

**Note:** Telegram Mini App URLs depend on deployment setup:
- If using Telegram's built-in Mini App: `https://t.me/{bot_username}/{app_name}`
- If using external URL: configured in `@BotFather`

---

## Section 7 — Security & Session Flow

### 7.1 Owner Auth

| Component | Status | Details |
|---|---|---|
| Telegram initData validation | ✅ Works | HMAC-SHA256, auth_date replay protection |
| Auto-owner creation | ✅ Works | `findOrCreateOwner()` on first interaction |
| Session model | ✅ Works | `MiniAppSession` with `ownerId`, `telegramUserId` |
| Session attachment | ✅ Works | Attached to `Request` by `MiniAppAuthGuard` |

### 7.2 Customer Auth

| Component | Status | Details |
|---|---|---|
| Customer identity | ⚠️ Implicit | Identified by `telegramUserId` from webhook update |
| Customer session | ❌ Missing | No session model for customer MiniApp |
| Customer auth guard | ❌ Missing | No `CustomerAuthGuard` |
| Customer initData validation | ❌ Missing | Would need separate validation for customer MiniApp |

### 7.3 Isolation

| Layer | Status | Details |
|---|---|---|
| Owner isolation | ✅ Works | `BotOwnershipGuard` enforces `bot.ownerId === session.ownerId` |
| Customer multi-tenancy | ✅ Works | All customer queries filtered by `botId` |
| Cross-template data access | ✅ Safe | Templates cannot access each other's entities |

---

## Section 8 — Architectural Risks

### Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| **Platform Bot missing Booking** | **High** | **Certain** | Add button to `sendWelcome()` — 1 line fix |
| **No customer MiniApp** | **High** | **Certain** | Create minimal customer endpoints |
| **No link generation** | **Medium** | **Certain** | Add URL formatting to `connectBot()` |
| **Chat-only booking** | **Medium** | **Certain** | Add CTA button with `web_app` reply_markup |
| Customer auth complexity | Medium | Likely | Reuse `TelegramInitDataService` with bot-specific token |
| Runtime/operational leak | Low | Unlikely | Stabilization enforced boundaries |
| New circular dependency | Low | Unlikely | Current graph is acyclic |

### Boundary Verification (Post-Stabilization)

```
✅ BotService — no template repositories
✅ BotModule — no template entities
✅ TemplateModule.exports — only query services
✅ MiniappModule — no runtime service imports
✅ OwnerModule — no BotModule import
✅ No forwardRef() in OwnerModule, MiniAppAuthModule
```

---

## Section 9 — Implementation Plan

### Phase 1: Fix Provisioning (Deployment-Safe)

**Goal:** Owner can create Booking bot via Platform Bot and receive links.

1. **Add Booking to Platform Bot keyboard**
   - File: `src/platform-bot/platform-bot.service.ts`
   - Change: Add `{ text: '📅 Booking', callback_data: 'template:booking' }` to `sendWelcome()`
   - Effort: 1 line

2. **Add link generation to `connectBot()`**
   - File: `src/bot/bot.service.ts`
   - Change: Return `botLink`, `ownerDashboardUrl`, `customerMiniAppUrl`
   - Effort: ~10 lines

3. **Update success message in Platform Bot**
   - File: `src/platform-bot/platform-bot.service.ts`
   - Change: `replySuccess()` includes links
   - Effort: ~5 lines

### Phase 2: Customer MiniApp Backend (Minimal)

**Goal:** Customer can open MiniApp and view/create bookings.

1. **Create `CustomerMiniappModule`**
   - File: `src/customer-miniapp/customer-miniapp.module.ts`
   - Purpose: Isolated from owner MiniApp
   - Imports: `TypeOrmModule.forFeature([Booking, Bot])`, `CustomerModule`

2. **Create `CustomerAuthGuard`**
   - File: `src/customer-miniapp/auth/customer-auth.guard.ts`
   - Validates `initData` using BOT's token (not platform bot token)
   - Extracts `telegramUserId` from initData
   - No owner session — customer is anonymous except for Telegram ID

3. **Create `CustomerBookingController`**
   - Endpoints:
     - `GET /customer/bot/:botId/bookings` — available slots
     - `POST /customer/bot/:botId/bookings` — create booking
     - `GET /customer/bot/:botId/bookings/:bookingId` — view booking
   - Auth: `CustomerAuthGuard` (validates initData)
   - No ownership check — anyone with bot link can access

4. **Create slot availability endpoint**
   - File: Extend `BookingQueryService`
   - Method: `getAvailableSlots(botId, date)` — returns free slots
   - Used by: Customer MiniApp frontend

### Phase 3: Chat → MiniApp Transition

**Goal:** Customer can transition from chat to MiniApp.

1. **Add CTA button in `BookingRuntimeService.handleStart()`**
   - After greeting, send message with `reply_markup` containing `web_app` button
   - URL: `customerMiniAppUrl` from bot config
   - Effort: ~10 lines

2. **Add `startapp` parameter support**
   - When customer opens bot via `t.me/MyBot?startapp=booking`, capture parameter
   - Use in webhook handler to trigger MiniApp open
   - Effort: ~15 lines

### Phase 4: Capability Flag (Optional)

**Goal:** Mark Booking as hybrid template.

1. **Add `hasCustomerMiniApp` to `OwnerModuleDefinition`**
   - Optional boolean, defaults to `false`
   - Set `true` for Booking owner module
   - NavigationService can conditionally show "Customer MiniApp" link in owner dashboard
   - Effort: ~5 lines

---

## Section 10 — Target End State

### Owner Flow

```
1. Owner opens @BotGrandFather
2. /start → sees keyboard: [Template 1] [Template 2] [Template 3] [Lead Funnel] [📅 Booking]
3. Clicks "📅 Booking"
4. Sends bot token
5. Receives:
   ✅ Bot @MyBot connected!
   🤖 Bot: t.me/MyBot
   📊 Dashboard: [Open Dashboard]
   👥 Customer App: t.me/MyBot?startapp=booking
6. Opens Dashboard → sees Bookings, Calendar, Customers
```

### Customer Flow

```
1. Customer opens t.me/MyBot
2. /start → sees greeting + "📅 Book Appointment" button
3. Clicks button → MiniApp opens
4. Selects service → Selects date → Selects time → Confirms
5. MiniApp closes → Chat shows "✅ Booking confirmed!"
6. Owner receives notification
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  PLATFORM BOT (@BotGrandFather)                             │
│  - Template selection (including Booking)                   │
│  - Token collection                                         │
│  - Link generation (bot, dashboard, customer app)           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   Owner MiniApp        Customer MiniApp       Chat Runtime
   (operational)        (customer-facing)      (template)
        │                     │                     │
        ▼                     ▼                     ▼
   GET /miniapp/...     GET /customer/...     Webhook → TemplateFactory
   - dashboard           - bot/:id/slots       → BookingRuntimeService
   - bots/:id/bookings   - bot/:id/bookings    → Telegram messages
   - analytics           - POST booking
```

---

## Conclusion

The platform has a **strong backend foundation** after stabilization. The runtime/operational separation is clean, the Booking template chat flow works end-to-end, and the owner dashboard backend is complete.

**The critical gaps are:**
1. **Provisioning:** Booking not shown in Platform Bot UI
2. **Links:** No URL generation for bot, dashboard, or customer app
3. **Customer MiniApp:** No customer-facing backend or frontend
4. **Hybrid transition:** No chat → MiniApp CTA

**These are NOT architectural problems.** They are **missing features** that can be added incrementally without touching the stabilized core.

**Recommended priority:**
1. Fix Platform Bot keyboard (1 line, immediate impact)
2. Add link generation (small change, unblocks owner workflow)
3. Create minimal customer MiniApp backend (new module, no core changes)
4. Add CTA button in chat flow (small runtime change)

**Total effort estimate:** ~200 lines of new code, zero changes to stabilized architecture.
