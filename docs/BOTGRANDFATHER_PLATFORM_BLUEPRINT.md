# BOTGRANDFATHER — COMPLETE PLATFORM BLUEPRINT

**Version:** 1.0 (Post-Stabilization Sprint)  
**Date:** 2026-05-11  
**Status:** Production-Ready Modular Monolith  
**Target Audience:** NEW AI AGENT with ZERO prior context

---

## 1. PROJECT IDENTITY

### 1.0 CURRENT MOST IMPORTANT RISK: PREMATURE PLATFORM ABSTRACTION

**WARNING:** The single biggest risk to BotGrandFather is **accidental framework-building** — creating overly generic systems before proven repetition.

**Specific Dangers:**

**1. Over-Generalization**
- Creating "Universal Workflow Engine" before building 3+ workflow templates
- Abstracting "Generic Form Builder" before building 3+ form templates
- Designing "Plugin System" before having 10+ real templates
- **Result:** Complexity explosion, platform becomes unmaintainable

**2. Abstraction-Before-Repetition**
- Abstracting Customer after 1 template ❌
- Abstracting Analytics after 1 template ❌
- Abstracting after 3+ templates ✅
- **Rule:** "Abstract only proven repetition"

**3. Premature SDK Complexity**
- Designing SDK for external developers before contracts are stable
- Adding npm package scanning before manual registration is painful
- Creating sandboxed runtime before security review
- **Result:** Breaking changes, lost trust, maintenance nightmare

**4. Metadata Obsession**
- Making metadata the GOAL instead of the TOOL
- Creating recursive schema engines
- Building "schema-of-schema" validation
- **Result:** Frontend becomes complex, business logic hidden in JSON

**5. Accidental Framework Construction**
- "Let's build a platform for building platforms"
- "Let's make it configurable for ANY use case"
- "Let's create universal no-code abstractions"
- **Result:** Framework complexity, platform loses focus

**Mitigation:**
- Read `ARCHITECTURAL_INVARIANTS.md` before ANY new feature
- Ask: "Is abstraction justified by proven repetition?"
- Ask: "Does this strengthen platform universality?"
- Ask: "Is this too early for current architecture maturity?"

---

### 1.1 What BotGrandFather Is

**BotGrandFather** is a **universal Telegram bot operations platform** that enables businesses to deploy, manage, and operate multiple Telegram bots from a single operational dashboard.

It is NOT:
- A simple bot builder (like many no-code platforms)
- A funnel builder (though it supports funnel templates)
- A CRM system (though it has universal CRM capabilities)
- A Mini App platform (though it has Mini App operational support)

BotGrandFather is a **multi-tenant SaaS platform** that abstracts Telegram bot operations into reusable business systems.

### 1.2 Problems It Solves

**For Businesses:**
- Deploy multiple Telegram bots without managing separate infrastructure
- Unified operational dashboard across all bots
- Template-based rapid deployment (lead funnel, booking, AI assistant, etc.)
- Analytics and customer management across all bots
- Scalable billing and quota management

**For Platform Operators:**
- Template ecosystem (future marketplace)
- White-label capabilities
- Partner ecosystem support
- Multi-tenant isolation and security

**For Developers:**
- Reusable bot templates
- Clean separation of runtime vs operational logic
- Template-agnostic core architecture
- Extensible without modifying core

### 1.3 Why This Platform Exists

Traditional Telegram bot development has several problems:

1. **Every bot is a separate project** → No unified management
2. **Business logic tightly coupled to runtime** → Hard to maintain
3. **No multi-tenant architecture** → Can't serve multiple owners
4. **No template reuse** → Every bot built from scratch
5. **No operational dashboard** → Owners can't manage bots

BotGrandFather solves these by:
- Separating **runtime layer** (webhook processing) from **operational layer** (owner dashboard)
- Providing **universal abstractions** (Customer, Owner, Analytics)
- Supporting **multiple templates** with isolated business logic
- Offering **Mini App** for owner operations

### 1.4 How It Differs From Alternatives

| Platform Type | BotGrandFather Difference |
|---------------|--------------------------|
| **Telegram Bot Builders** | Multi-tenant SaaS, not single-bot builder; template ecosystem; operational dashboard |
| **Funnel Builders** | Template-agnostic; supports booking, AI assistant, shop; not funnel-centric |
| **CRM Systems** | Universal customer layer; template-specific data isolated; not CRM-first |
| **Mini App Platforms** | Mini App is operational-only, NOT business logic; runtime separated |

### 1.5 Long-Term Platform Vision

**Phase 1 (Current):** Universal Owner System + Mini App Foundation ✅  
**Phase 2:** Booking Template + AI Assistant Template  
**Phase 3:** Template Marketplace (partners publish templates)  
**Phase 4:** White-Label Platform (B2B deployment)  
**Phase 5:** Partner Ecosystem (integrations, plugins)

**Core Philosophy:** Platform MUST remain template-agnostic. Templates are PLUGINS, not core.

### 1.6 Current Maturity Stage

**Production-Ready Modular Monolith**

- ✅ Security hardened (ownership verification everywhere)
- ✅ Scalability fixes applied (N+1 queries resolved)
- ✅ Reliability guarantees (awaited webhooks, transactions)
- ✅ Data lifecycle managed (automatic cleanup)
- ✅ Architectural drift corrected (generic events, template-agnostic)
- ⚠️ No rate limiting yet (non-critical)
- ⚠️ No external analytics DB (PostgreSQL sufficient for current scale)
- ⚠️ No queue system (direct processing sufficient for current scale)

**Expected Scale:** 100+ owners, 1000+ bots, 1M+ events/month

---

## 2. CORE PLATFORM PHILOSOPHY

### 2.1 Architectural Principles (NON-NEGOTIABLE)

#### Principle 1: Runtime vs Operational Separation

**Definition:** Runtime layer (webhook processing) NEVER depends on Mini App (operational layer).

**Why:** Runtime must be stable, fast, and independent of owner-facing features. Owner dashboard can change without affecting bot processing.

**Implementation:**
```
src/
├── webhook/          ← Runtime (processes Telegram updates)
├── templates/        ← Runtime (business logic per template)
├── customer/         ← Runtime (universal CRM layer)
├── analytics/        ← Runtime (event tracking)
├── miniapp/          ← Operational (owner dashboard)
├── ownership/        ← Operational (ownership verification)
└── lifecycle/        ← Operational (cleanup jobs)
```

**Invariant:** Runtime imports NEVER include `miniapp/` or `ownership/`.

#### Principle 2: Universal-First Architecture

**Definition:** Core entities (Customer, Owner) are template-agnostic. Template-specific data lives in template modules.

**Why:** A customer exists regardless of whether they interacted with a lead-funnel bot, booking bot, or AI assistant bot.

**Implementation:**
```typescript
// Customer entity — template-agnostic
@Entity('customers')
export class Customer {
  botId: string;
  telegramUserId: bigint;
  status: 'new' | 'active' | 'converted';
  tags: string[];
  // NO template-specific fields
}

// Lead entity — lead-funnel specific
@Entity('leads')
export class Lead {
  botId: string;
  userId: bigint;
  answers: Record<string, string>;
  contact: string;
  // Template-specific data
}
```

**Invariant:** CustomerService has ZERO references to `lead-funnel`, `booking`, etc.

#### Principle 3: Template-Agnostic Philosophy

**Definition:** Platform core does NOT assume any specific template. All templates are equal citizens.

**Why:** If platform becomes funnel-centric, future templates (booking, shop, AI assistant) will feel like second-class citizens.

**Anti-Pattern (funnel-centric):**
```typescript
// ❌ WRONG — platform assumes funnel
class AnalyticsService {
  trackFunnelStart() {}
  trackFunnelComplete() {}
}
```

**Correct (template-agnostic):**
```typescript
// ✅ CORRECT — generic events
class AnalyticsService {
  trackSessionStart() {}
  trackConversion() {}
}

// Lead-funnel uses generic events with metadata
await analyticsService.trackEvent(botId, 'session:started', {
  template: 'lead-funnel',
  flowType: 'funnel',
});
```

**Invariant:** Event names are generic (`session:*`, `conversion:*`), not template-specific (`funnel:*`, `booking:*`).

#### Principle 4: Metadata-Driven UI

**Definition:** Mini App UI is driven by OwnerModuleRegistry metadata, NOT hardcoded routes.

**Why:** New templates can add navigation items, widgets, and settings WITHOUT platform code changes.

**Implementation:**
```typescript
// OwnerModuleRegistry — templates register metadata
export const OWNER_MODULE_REGISTRY = {
  'lead-funnel': {
    template: 'lead-funnel',
    navigation: [
      { id: 'leads', label: 'Leads', route: '/leads', icon: '🎯' },
    ],
    settings: { /* schema */ },
    widgets: { /* widget definitions */ },
  },
};

// NavigationService composes from registry
composeNavigation(templates: string[]) {
  return [
    ...universalNavigation,
    ...templates.map(t => getTemplateNavigation(t)),
  ];
}
```

**Invariant:** Controllers contain NO template-specific UI logic. UI is composed from metadata.

#### Principle 5: Capability-Driven Architecture

**Definition:** Billing and quotas are based on CAPABILITIES (interactions, flows), not template-specific metrics (leads, funnels).

**Why:** Platform must support booking templates (bookings, not leads), shop templates (orders, not leads), etc.

**Anti-Pattern:**
```typescript
// ❌ WRONG — funnel-centric
interface PlanLimits {
  maxLeadsPerMonth: number;
  maxFunnels: number;
}
```

**Correct:**
```typescript
// ✅ CORRECT — capability-based
interface PlanLimits {
  maxInteractionsPerMonth: number;  // Leads, bookings, orders, etc.
  maxFlows: number;                 // Funnels, booking flows, etc.
}
```

### 2.2 Forbidden Architectural Directions

**NEVER allow:**
1. Runtime imports Mini App code
2. Customer entity has template-specific fields
3. Platform assumes funnel metaphor
4. Templates modify core platform code
5. Hardcoded template UI in controllers
6. Public endpoints without ownership verification
7. Fire-and-forget webhook processing
8. Unbounded database growth without cleanup

### 2.3 Common Mistakes to Avoid

**Mistake 1:** Adding template-specific fields to Customer
```typescript
// ❌ WRONG
class Customer {
  funnelAnswers: Record<string, string>;  // Template-specific!
}
```

**Correct:**
```typescript
// ✅ CORRECT
class Customer {
  status: 'new' | 'active' | 'converted';  // Universal
}
// Template-specific data in Lead entity
```

**Mistake 2:** Funnel-centric event names
```typescript
// ❌ WRONG
await analytics.track('funnel:completed');
```

**Correct:**
```typescript
// ✅ CORRECT
await analytics.track('session:completed', {
  template: 'lead-funnel',
  flowType: 'funnel',
});
```

**Mistake 3:** Hardcoding template UI
```typescript
// ❌ WRONG
class OwnerViewService {
  composeView() {
    return { widget: 'Leads Widget' };  // Only for lead-funnel!
  }
}
```

**Correct:**
```typescript
// ✅ CORRECT
class OwnerViewService {
  composeView(botId: string, template: string) {
    const module = getOwnerModule(template);
    return {
      widgets: module.widgets.map(w => this.createWidget(w)),
    };
  }
}
```

### 2.4 Future Risks

**Risk 1:** Template ecosystem becomes burden
- **Mitigation:** OwnerModuleRegistry metadata-driven design
- **Mitigation:** Templates are isolated, don't modify core

**Risk 2:** Analytics grows too large for PostgreSQL
- **Mitigation:** Current scale < 1M events/day is safe
- **Future:** Extract to ClickHouse/TimescaleDB when needed

**Risk 3:** Runtime becomes bloated with template logic
- **Mitigation:** Strict separation — runtime only orchestrates, templates contain logic
- **Mitigation:** TemplateFactory is thin dispatcher

**Risk 4:** Mini App becomes business logic layer
- **Mitigation:** Mini App is READ-ONLY operational view
- **Mitigation:** Business logic stays in templates

---

## 3. FULL PROJECT STRUCTURE

### 3.1 Module Overview

```
src/
├── app.module.ts                    # Root module, imports all
├── main.ts                          # Bootstrap, validation pipe
│
├── bot/                             # Bot entity and management
│   ├── bot.module.ts
│   ├── bot.controller.ts            # Bot CRUD + data endpoints
│   ├── bot.service.ts               # Bot lifecycle (connect, delete)
│   └── dto/
│       └── bot.dto.ts               # ConnectBotDto, UpdateBotConfigDto
│
├── customer/                        # Universal CRM layer
│   ├── customer.module.ts
│   ├── customer.controller.ts       # Customer list endpoints
│   ├── customer.service.ts          # ensureCustomer, updateStatus
│   └── entities/
│       └── customer.entity.ts       # Template-agnostic customer
│
├── analytics/                       # Event tracking
│   ├── analytics.module.ts
│   ├── analytics.service.ts         # trackEvent, getBotStats
│   └── entities/
│       └── analytics-event.entity.ts
│
├── miniapp/                         # Operational dashboard (Mini App)
│   ├── miniapp.module.ts
│   ├── controllers/
│   │   ├── miniapp.controller.ts    # /miniapp/dashboard, /navigation, /me
│   │   └── owner-dashboard.controller.ts  # /miniapp/bots/:id/*
│   ├── services/
│   │   ├── dashboard.service.ts     # Data aggregation
│   │   ├── navigation.service.ts    # Dynamic navigation composition
│   │   └── owner-view.service.ts    # View composition
│   ├── auth/
│   │   ├── miniapp-auth.guard.ts    # Telegram initData validation
│   │   ├── telegram-init-data.service.ts  # HMAC-SHA256 verification
│   │   └── miniapp-session.interface.ts
│   └── interfaces/
│       ├── dashboard-widget.interface.ts
│       ├── navigation-item.interface.ts
│       └── owner-view.interface.ts
│
├── templates/                       # Template business logic
│   ├── template.module.ts
│   ├── template.factory.ts          # Template handler dispatch
│   ├── template.interface.ts        # TemplateContext, TemplateService
│   ├── common/
│   │   ├── template.registry.ts     # TEMPLATE_REGISTRY
│   │   └── config-schema.interface.ts
│   ├── lead-funnel/                 # Lead funnel template
│   │   ├── lead-funnel.service.ts   # Business logic
│   │   ├── lead-funnel.handler.ts   # Thin handler
│   │   ├── lead-funnel.types.ts
│   │   └── lead-funnel.config.schema.ts
│   └── template1/                   # Generic template examples
│       └── ...
│
├── webhook/                         # Telegram webhook processing
│   ├── webhook.module.ts
│   ├── webhook.controller.ts        # POST /webhook/:botId/:secret
│   └── webhook.service.ts           # processUpdate, idempotency
│
├── owner/                           # Owner entity and management
│   ├── owner.module.ts
│   ├── owner.controller.ts
│   ├── owner.service.ts             # findOrCreateOwner
│   └── entities/
│       └── owner.entity.ts
│
├── owner-modules/                   # Template metadata registry
│   └── owner-module.registry.ts     # OWNER_MODULE_REGISTRY
│   └── owner-module.interface.ts
│
├── ownership/                       # Ownership verification
│   ├── ownership.module.ts
│   ├── bot-ownership.guard.ts       # Guard for bot-scoped endpoints
│   └── ownership-verification.service.ts  # Manual checks (placeholder)
│
├── billing/                         # Billing and quotas
│   ├── billing.module.ts
│   ├── billing.service.ts           # Plan limits, quota checks
│   └── plan-limits.ts               # PLAN_DEFINITIONS
│
├── lifecycle/                       # Data retention and cleanup
│   ├── lifecycle.module.ts
│   └── data-lifecycle.service.ts    # Scheduled cleanup jobs
│
├── telegram/                        # Telegram API wrapper
│   ├── telegram.module.ts
│   └── telegram.service.ts          # sendMessage, setWebhook, validateToken
│
├── bot/                             # Bot entity and runtime helpers
│   ├── entities/
│   │   ├── bot.entity.ts
│   │   ├── user-state.entity.ts
│   │   ├── processed-update.entity.ts
│   │   └── lead.entity.ts
│
├── platform-bot/                    # Platform-level bot operations
│   └── platform-bot.module.ts
│   └── platform-bot.service.ts
│
├── runtime/                         # Runtime orchestration
│   └── runtime.module.ts
│
├── infrastructure/                  # Internal utilities
│   └── events/
│       └── platform-events.ts       # PlatformEventBus (internal)
│
└── config/
    └── env.config.ts                # Environment variables
```

### 3.2 Module Responsibilities

#### `src/bot/` — Bot Entity and Management

**Purpose:** Bot records, CRUD operations, bot lifecycle.

**Responsibilities:**
- Create/update/delete bot records
- Connect bot via Telegram token
- Set webhook on Telegram
- Sanitize sensitive config for API responses
- Get bot stats (overview)

**Dependencies:**
- `telegram/` — Telegram API calls
- `customer/` — Customer counts
- `analytics/` — Event counts

**What It MUST NOT Do:**
- Process webhooks (that's `webhook/`)
- Contain business logic (that's `templates/`)
- Serve Mini App data (that's `miniapp/`)

**Architectural Layer:** Runtime (data access layer)

---

#### `src/customer/` — Universal CRM Layer

**Purpose:** Template-agnostic customer management.

**Responsibilities:**
- `ensureCustomer()` — Find or create customer (race-safe)
- `updateStatus()` — Update customer status
- `getBotCustomers()` — Paginated customer list
- `countByStatus()` — Status breakdown

**Dependencies:** NONE (pure runtime layer)

**What It MUST NOT Do:**
- Reference any template (lead-funnel, booking, etc.)
- Contain template-specific logic

**Architectural Layer:** Runtime (universal abstraction)

**Key Implementation Detail:**
```typescript
async ensureCustomer(botId: string, telegramUserId: number, profile?: {...}) {
  let customer = await this.customerRepository.findOne({ where: { botId, telegramUserId } });
  
  if (!customer) {
    customer = this.customerRepository.create({ botId, telegramUserId, status: 'new', ...profile });
    try {
      await this.customerRepository.save(customer);
    } catch (error) {
      // Race condition handling — unique constraint violation
      if (error.driverError?.code === '23505') {
        customer = await this.customerRepository.findOne({ where: { botId, telegramUserId } });
      } else {
        throw error;
      }
    }
  }
  return customer;
}
```

---

#### `src/analytics/` — Event Tracking

**Purpose:** Generic event tracking with database aggregation.

**Responsibilities:**
- `trackEvent()` — Record analytics event
- `getBotStats()` — Aggregated event counts (GROUP BY)

**Dependencies:** NONE (pure runtime layer)

**What It MUST NOT Do:**
- Assume funnel metaphor
- Load all events into memory

**Key Implementation Detail:**
```typescript
// ✅ CORRECT — database aggregation
async getBotStats(botId: string) {
  const results = await this.eventRepository
    .createQueryBuilder('e')
    .select('e.eventType', 'eventType')
    .addSelect('COUNT(*)', 'count')
    .where('e.botId = :botId', { botId })
    .groupBy('e.eventType')
    .getRawMany();
  // Returns counts, not all events
}
```

---

#### `src/miniapp/` — Operational Dashboard

**Purpose:** Owner-facing operational view (Telegram Mini App).

**Responsibilities:**
- Authenticate via Telegram initData
- Compose dashboard data
- Compose dynamic navigation
- Compose owner views from widgets

**Dependencies:**
- `owner/` — Owner profile
- `bot/` — Bot list
- `customer/` — Customer counts
- `analytics/` — Event stats
- `ownership/` — Ownership verification

**What It MUST NOT Do:**
- Contain runtime/business logic
- Process webhooks
- Modify bot state (READ-ONLY)

**Architectural Layer:** Operational (owner-facing)

**Key Principle:** Mini App is READ-ONLY operational view. All mutations happen via runtime layer.

---

#### `src/templates/` — Template Business Logic

**Purpose:** Template-specific business logic (lead-funnel, booking, etc.).

**Responsibilities:**
- `TemplateFactory` — Dispatch updates to correct template
- Template handlers — Route updates (text, callback)
- Template services — Business logic

**Dependencies:**
- `customer/` — Universal customer layer
- `analytics/` — Event tracking
- `telegram/` — Send messages

**What It MUST NOT Do:**
- Modify Mini App code
- Access owner dashboard
- Depend on other templates

**Architectural Layer:** Runtime (business logic isolated per template)

**Key Implementation Detail:**
```typescript
// TemplateFactory — thin dispatcher
class TemplateFactory {
  private handlers = new Map<string, TemplateHandler>();
  
  async handleUpdate(template: string, context: TemplateContext) {
    const handler = this.handlers.get(template);
    await handler.handle(context);
  }
}

// LeadFunnelHandler — thin handler
class LeadFunnelHandler implements TemplateHandler {
  async handle(context: TemplateContext) {
    // Route to service
    await this.service.handleCallback(context, context.callbackData);
  }
}

// LeadFunnelService — business logic
class LeadFunnelService implements TemplateService {
  async handleCallback(context: TemplateContext, callbackData: string) {
    // All business logic here
  }
}
```

---

#### `src/webhook/` — Telegram Webhook Processing

**Purpose:** Receive and process Telegram updates.

**Responsibilities:**
- Verify webhook credentials (botId + secret)
- Idempotency check (ProcessedUpdate)
- Dispatch to template handler
- Await processing (no fire-and-forget)
- Log structured events

**Dependencies:**
- `bot/` — Verify bot + get token
- `templates/` — Dispatch to template

**What It MUST NOT Do:**
- Contain business logic
- Depend on Mini App

**Architectural Layer:** Runtime (entry point)

**Key Implementation Detail:**
```typescript
// ✅ CORRECT — awaited processing
async handleWebhook(@Body() update, @Param('botId') botId, @Param('secret') secret) {
  await this.webhookService.processUpdate(botId, secret, update);  // AWAIT
  res.status(200).json({ ok: true });
}

// ❌ WRONG — fire-and-forget
async handleWebhook() {
  this.webhookService.processUpdate(...);  // NO await — silent failures!
  res.status(200).json({ ok: true });
}
```

---

#### `src/owner/` — Owner Entity

**Purpose:** Owner records and lifecycle.

**Responsibilities:**
- `findOrCreateOwner()` — Find or create owner from Telegram user
- `getOwnerById()` — Owner profile

**Dependencies:** NONE

**Architectural Layer:** Operational (data layer)

---

#### `src/owner-modules/` — Template Metadata Registry

**Purpose:** Templates register metadata (navigation, settings, widgets).

**Responsibilities:**
- `OWNER_MODULE_REGISTRY` — Central registry
- Metadata definitions (navigation items, settings schemas)

**Dependencies:** NONE (pure data)

**What It MUST NOT Do:**
- Contain runtime logic
- Modify core platform

**Key Implementation Detail:**
```typescript
export const OWNER_MODULE_REGISTRY = {
  'lead-funnel': {
    template: 'lead-funnel',
    navigation: [
      { id: 'leads', label: 'Leads', route: '/leads', icon: '🎯' },
    ],
    settings: { /* JSON schema */ },
  },
};

export function getOwnerModule(template: string) {
  return OWNER_MODULE_REGISTRY[template];
}
```

---

#### `src/ownership/` — Ownership Verification

**Purpose:** Verify bot ownership (multi-tenant safety).

**Responsibilities:**
- `BotOwnershipGuard` — Guard for bot-scoped endpoints
- `OwnershipVerificationService` — Manual checks (placeholder)

**Dependencies:**
- `bot/` — Bot entity (via TypeOrm)

**What It MUST NOT Do:**
- Depend on `miniapp/` (would create circular dependency)
- Contain business logic

**Architectural Layer:** Operational (security)

**Key Implementation Detail:**
```typescript
class BotOwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const session = (req as MiniAppRequest).miniAppSession;
    
    const botId = req.params.id;
    const bot = await this.botRepository.findOne({ where: { id: botId } });
    
    if (bot.ownerId !== session.ownerId) {
      throw new ForbiddenException('Access denied');
    }
    return true;
  }
}
```

---

#### `src/billing/` — Billing and Quotas

**Purpose:** Plan limits and capability quotas.

**Responsibilities:**
- `getPlanLimits()` — Plan configuration
- `canAddBot()` — Bot quota check
- `canAddInteraction()` — Interaction quota check
- `canAddFlow()` — Flow quota check

**Dependencies:** NONE

**Architectural Layer:** Operational (business rules)

**Key Implementation Detail:**
```typescript
// ✅ CORRECT — capability-based
interface PlanLimits {
  maxInteractionsPerMonth: number;  // Generic
  maxFlows: number;                 // Generic
}

// ❌ WRONG — funnel-centric
interface PlanLimits {
  maxLeadsPerMonth: number;  // Too specific!
  maxFunnels: number;
}
```

---

#### `src/lifecycle/` — Data Retention

**Purpose:** Automatic cleanup of operational data.

**Responsibilities:**
- Cleanup `ProcessedUpdate` (7-day retention)
- Cleanup `AnalyticsEvent` (90-day retention)
- Scheduled jobs (daily at 3:00 AM)

**Dependencies:**
- `bot/` — ProcessedUpdate entity
- `analytics/` — AnalyticsEvent entity

**Architectural Layer:** Operational (maintenance)

**Key Implementation Detail:**
```typescript
class DataLifecycleService {
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupProcessedUpdates() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    await this.processedUpdateRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();
  }
}
```

---

#### `src/telegram/` — Telegram API Wrapper

**Purpose:** Telegram Bot API calls.

**Responsibilities:**
- `sendMessage()` — Send message to chat
- `setWebhook()` — Set webhook URL
- `validateToken()` — Verify bot token
- `answerCallbackQuery()` — Answer callback query

**Dependencies:** NONE

**Architectural Layer:** Runtime (infrastructure)

---

## 4. RUNTIME ARCHITECTURE

### 4.1 Complete Webhook Processing Flow

```
Telegram Webhook
  ↓
POST /webhook/:botId/:secret
  ↓
WebhookController.handleWebhook()
  ↓
WebhookService.processUpdate(botId, secret, update)
  ↓
1. Verify credentials (bot exists + secret matches)
2. Check idempotency (ProcessedUpdate)
   - If already processed → return { skipped: true }
3. Build TemplateContext (normalize update data)
4. Dispatch to TemplateFactory.handleUpdate(template, context)
5. TemplateFactory → TemplateHandler.handle(context)
6. TemplateHandler → TemplateService (business logic)
7. TemplateService → CustomerService (universal CRM)
8. TemplateService → AnalyticsService.trackEvent()
9. Mark update as processed
10. Return { skipped: false }
  ↓
WebhookController returns 200 OK
```

### 4.2 Idempotency

**Problem:** Telegram may retry webhooks on timeout (even on 200 OK).

**Solution:** `ProcessedUpdate` entity tracks (botId, updateId) pairs.

```typescript
@Entity('processed_updates')
@Unique(['botId', 'updateId'])
export class ProcessedUpdate {
  updateId: bigint;
  botId: string;
  createdAt: Date;
}
```

**Flow:**
```typescript
async processUpdate(botId: string, secret: string, update: any) {
  const isAlreadyProcessed = await this.botService.isUpdateProcessed(
    botId,
    BigInt(update.update_id),
  );
  
  if (isAlreadyProcessed) {
    return { skipped: true };  // Duplicate detected
  }
  
  // Process update
  await this.templateFactory.handleUpdate(...);
  
  // Mark as processed
  await this.botService.markUpdateAsProcessed(botId, BigInt(update.update_id));
  
  return { skipped: false };
}
```

**Cleanup:** ProcessedUpdate cleaned up after 7 days (lifecycle service).

### 4.3 Race Condition Handling

**Problem:** Two concurrent webhooks may try to create the same customer/UserState.

**Solution:** Unique constraint + retry pattern.

```typescript
async ensureCustomer(botId: string, telegramUserId: number, profile?: {...}) {
  let customer = await this.customerRepository.findOne({ where: { botId, telegramUserId } });
  
  if (!customer) {
    customer = this.customerRepository.create({ botId, telegramUserId, ...profile });
    try {
      await this.customerRepository.save(customer);
    } catch (error) {
      // Unique constraint violation (code 23505)
      if (error.driverError?.code === '23505') {
        // Race condition — another webhook created it first
        customer = await this.customerRepository.findOne({ where: { botId, telegramUserId } });
      } else {
        throw error;
      }
    }
  }
  return customer;
}
```

**Same pattern applies to:**
- `Customer` (botId, telegramUserId) unique constraint
- `UserState` (botId, userId) unique constraint

### 4.4 Transactions

**Where Used:**
1. `BotService.connectBot()` — Bot creation + webhook setup
2. `LeadFunnelService.handleContact()` — Lead creation + customer status update

```typescript
// connectBot transaction
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  bot = this.botRepository.create({...});
  bot = await queryRunner.manager.save(bot);
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}

// Set webhook AFTER transaction commits
await this.telegramService.setWebhook(bot.token, webhookUrl);
```

**Why:** If webhook setup fails, bot record is rolled back (no orphaned bots).

### 4.5 Analytics Flow

**Event Tracking:**
```typescript
// Generic events (template-agnostic)
await analyticsService.trackEvent(botId, 'session:started', {
  template: 'lead-funnel',
  userId: context.userId,
  flowType: 'funnel',
});

await analyticsService.trackEvent(botId, 'conversion:achieved', {
  template: 'lead-funnel',
  userId: context.userId,
  conversionType: 'lead',
});
```

**Event Schema:**
```typescript
@Entity('analytics_events')
@Index(['botId', 'eventType'])
@Index(['createdAt'])
export class AnalyticsEvent {
  botId: string;
  ownerId: string | null;
  eventType: string;  // session:started, conversion:achieved, etc.
  metadata: Record<string, any>;
  createdAt: Date;
}
```

**Aggregation:**
```typescript
// ✅ CORRECT — database aggregation
async getBotStats(botId: string) {
  const results = await this.eventRepository
    .createQueryBuilder('e')
    .select('e.eventType', 'eventType')
    .addSelect('COUNT(*)', 'count')
    .where('e.botId = :botId', { botId })
    .groupBy('e.eventType')
    .getRawMany();
  // Memory-safe, scales to unlimited events
}
```

### 4.6 Customer Lifecycle

**Creation:**
1. User sends `/start` to bot
2. LeadFunnelService.handleStart() → CustomerService.ensureCustomer()
3. Customer created with status `new`

**Status Progression:**
```
new → active → converted
```

**Update:**
```typescript
await customerService.updateStatus(botId, userId, 'converted');
```

**Analytics:**
- `session:started` — Funnel/session begins
- `session:completed` — Funnel/session ends
- `conversion:achieved` — Lead/booking/order created

### 4.7 Template Execution Lifecycle

**Template Registration:**
```typescript
// TEMPLATE_REGISTRY
export const TEMPLATE_REGISTRY = {
  'lead-funnel': {
    name: 'lead-funnel',
    configSchema: leadFunnelConfigSchema,
    defaultConfig: { ... },
  },
};
```

**Handler Initialization:**
```typescript
// TemplateFactory constructor
this.handlers.set('lead-funnel', new LeadFunnelHandler(leadFunnelService));
```

**Update Routing:**
```typescript
// TemplateContext
interface TemplateContext {
  botId: string;
  botToken: string;
  botConfig: Record<string, any>;
  userId: number;
  chatId: number;
  messageText?: string;
  callbackData?: string;
  isCallback: boolean;
  // ...
}

// LeadFunnelHandler
async handle(context: TemplateContext) {
  if (context.isCallback && context.callbackData) {
    await this.service.handleCallback(context, context.callbackData);
  } else if (context.messageText === '/start') {
    await this.service.handleStart(context);
  } else {
    await this.service.handleDefault(context);
  }
}
```

---

## 5. MINI APP ARCHITECTURE

### 5.1 Purpose and Scope

**Mini App = Operational Dashboard for Bot Owners**

**What It Does:**
- View bot statistics
- View customer lists
- View analytics
- Navigate template-specific views
- Manage bot settings

**What It Does NOT Do:**
- Process webhooks
- Execute business logic
- Modify bot state (READ-ONLY)

**Architectural Principle:** Mini App is operational layer, NOT runtime layer.

### 5.2 Auth Flow

**Step 1: Frontend sends initData**
```
GET /miniapp/dashboard?initData=...
or
GET /miniapp/dashboard
X-Telegram-Init-Data: ...
```

**Step 2: MiniAppAuthGuard validates**
```typescript
class MiniAppAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const initData = request.headers['x-telegram-init-data'] || request.query.initData;
    const session = await this.initDataService.validateAndCreateSession(initData);
    request.miniAppSession = session;
    return true;
  }
}
```

**Step 3: TelegramInitDataService verifies**
```typescript
async validateAndCreateSession(initData: string) {
  // 1. Parse initData
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  
  // 2. Validate HMAC-SHA256 signature
  const isValid = this.validateSignature(params, hash, PLATFORM_BOT_TOKEN);
  if (!isValid) throw new UnauthorizedException();
  
  // 3. Validate auth_date (replay protection)
  const authDate = parseInt(params.get('auth_date'), 10);
  const maxAge = parseInt(process.env.INIT_DATA_MAX_AGE_SECONDS || '3600', 10);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAge) throw new UnauthorizedException('Expired');
  
  // 4. Extract user data
  const userJson = params.get('user');
  const user = JSON.parse(userJson);
  
  // 5. Find or create Owner
  const owner = await this.ownerService.findOrCreateOwner(user.id, user);
  
  // 6. Return session
  return {
    ownerId: owner.id,
    telegramUserId: String(user.id),
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    authenticatedAt: new Date().toISOString(),
  };
}
```

**Step 4: BotOwnershipGuard verifies ownership**
```typescript
@Get(':id/overview')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
async getBotOverview(@Param('id') botId: string) {
  // Ownership verified by guard
}
```

### 5.3 Dashboard Composition

**Flow:**
```
GET /miniapp/dashboard
  ↓
MiniappController.getDashboard()
  ↓
1. DashboardService.getOwnerProfile(ownerId)
2. DashboardService.getOwnerBots(ownerId)
3. DashboardService.getOwnerStats(ownerId)
   - Batched queries (N+1 fix)
   - countByStatusForBots()
   - countLeadsByBotIds()
4. OwnerViewService.composeDashboardView()
   - Compose widgets
   - Compose navigation
  ↓
Return { owner, stats, bots, view }
```

**N+1 Fix:**
```typescript
// ❌ WRONG — N+1 queries
async getOwnerStats(ownerId: string) {
  const bots = await this.botService.getOwnerBots(ownerId);
  for (const bot of bots) {
    const customerCount = await this.customerService.countByStatus(bot.id);  // N queries
    const leadCount = await this.getBotLeadCount(bot.id);  // N queries
  }
}

// ✅ CORRECT — O(1) queries
async getOwnerStats(ownerId: string) {
  const bots = await this.botService.getOwnerBots(ownerId);
  const botIds = bots.map(b => b.id);
  
  const customerCountsByBot = await this.customerService.countByStatusForBots(botIds);
  const leadCountsByBot = await this.botService.countLeadsByBotIds(botIds);
  
  // Aggregate in memory
}
```

### 5.4 Dynamic Navigation

**Composition:**
```typescript
class NavigationService {
  private readonly universalNavigation = [
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: '📊', source: 'universal' },
    { key: 'bots', label: 'My Bots', route: '/bots', icon: '🤖', source: 'universal' },
    { key: 'customers', label: 'Customers', route: '/customers', icon: '👥', source: 'universal' },
    { key: 'analytics', label: 'Analytics', route: '/analytics', icon: '📈', source: 'universal' },
    { key: 'settings', label: 'Settings', route: '/settings', icon: '⚙️', source: 'universal' },
  ];
  
  getTemplateNavigation(template: string): NavigationItem[] {
    const module = getOwnerModule(template);
    if (!module) return [];
    
    return module.navigation.map(section => ({
      key: section.id,
      label: section.label,
      route: `/bots/:botId${section.route}`,
      icon: section.icon,
      source: 'template',
      template: module.template,
    }));
  }
  
  composeNavigation(templates: string[]): NavigationItem[] {
    const nav = [...this.universalNavigation];
    for (const template of templates) {
      nav.push(...this.getTemplateNavigation(template));
    }
    return nav;
  }
}
```

### 5.5 Widget System

**Widget Types:**
```typescript
interface MetricWidgetData {
  value: number;
  label: string;
}

interface ChartWidgetData {
  data: Array<{ label: string; value: number }>;
}

interface TableWidgetData {
  columns: string[];
  rows: Record<string, any>[];
}

interface DashboardWidget {
  key: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  data: MetricWidgetData | ChartWidgetData | TableWidgetData;
}
```

**Composition:**
```typescript
class OwnerViewService {
  composeDashboardView(ownerId, botCount, customerCount, interactionCount, bots) {
    const widgets: DashboardWidget[] = [
      this.createMetricWidget('total-bots', 'Total Bots', botCount),
      this.createMetricWidget('total-customers', 'Total Customers', customerCount),
      this.createMetricWidget('total-interactions', 'Interactions', interactionCount),
    ];
    
    return {
      key: 'dashboard',
      title: 'Dashboard',
      navigation: this.navigationService.composeNavigation(templates),
      widgets,
      meta: { ownerId, botTemplates: [...new Set(templates)] },
    };
  }
}
```

### 5.6 Frontend Responsibilities

**Frontend SHOULD:**
- Render widgets from metadata
- Render navigation from metadata
- Send initData with requests
- Handle auth errors (401)
- Handle forbidden errors (403)

**Frontend MUST NOT:**
- Implement business logic
- Process webhooks
- Hardcode template-specific routes
- Bypass ownership verification

**Frontend Architecture:**
```
Frontend (React/Vue/etc.)
  ↓
Fetch /miniapp/dashboard
  ↓
Render widgets from response
  ↓
Render navigation from response
  ↓
User clicks navigation → Fetch /miniapp/bots/:id/view
  ↓
Render template-specific view
```

---

## 6. TEMPLATE SYSTEM

### 6.1 TemplateFactory

**Purpose:** Dispatch updates to correct template handler.

**Implementation:**
```typescript
@Injectable()
export class TemplateFactory {
  private readonly handlers = new Map<string, TemplateHandler>();
  
  constructor(
    private readonly leadFunnelService: LeadFunnelService,
    // ... other template services
  ) {
    this.initializeHandlers();
  }
  
  private initializeHandlers(): void {
    this.handlers.set('lead-funnel', new LeadFunnelHandler(leadFunnelService, telegramService));
    this.handlers.set('template1', new Template1Handler(template1Service));
    // ...
  }
  
  async handleUpdate(template: string, context: TemplateContext): Promise<void> {
    const handler = this.handlers.get(template);
    if (!handler) throw new Error(`No handler for template: ${template}`);
    await handler.handle(context);
  }
}
```

**Current Limitation:** Adding new template requires code change + rebuild.

**Future Direction:** Dynamic discovery (scan `src/templates/*/` directories) or plugin system (separate npm packages).

### 6.2 Template Contracts

**TemplateService Interface:**
```typescript
interface TemplateService {
  handleStart(context: TemplateContext): Promise<void>;
  handleCallback?(context: TemplateContext, callbackData: string): Promise<void>;
  handleDefault?(context: TemplateContext): Promise<void>;
}
```

**TemplateHandler Interface:**
```typescript
interface TemplateHandler {
  handle(context: TemplateContext): Promise<void>;
}
```

**TemplateContext:**
```typescript
interface TemplateContext {
  botId: string;
  botToken: string;
  botConfig: Record<string, any>;
  userId: number;
  chatId: number;
  messageId?: number;
  messageText?: string;
  callbackData?: string;
  callbackQueryId?: string;
  isCallback: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
}
```

### 6.3 Template Runtime Isolation

**Each Template Is Independent:**
- Cannot access other templates
- Cannot modify core platform
- Can use universal services (Customer, Analytics)
- Has own entities (Lead for lead-funnel)

**Example:**
```typescript
// LeadFunnelService — can use CustomerService
await this.customerService.ensureCustomer(botId, userId, profile);
await this.customerService.updateStatus(botId, userId, 'converted');

// LeadFunnelService — has own Lead entity
const lead = this.leadRepository.create({ botId, userId, answers, contact });
await this.leadRepository.save(lead);
```

### 6.4 Config Schemas

**Registration:**
```typescript
// TEMPLATE_REGISTRY
export const TEMPLATE_REGISTRY = {
  'lead-funnel': {
    name: 'lead-funnel',
    configSchema: leadFunnelConfigSchema,  // JSON schema
    defaultConfig: {
      businessName: 'My Business',
      welcomeMessage: 'Welcome!',
      questions: [...],
    },
  },
};
```

**Validation:**
```typescript
function validateConfigAgainstSchema(config: any, schema: ConfigSchema) {
  // Use JSON schema validation
  const valid = Ajv.validate(schema, config);
  if (!valid) throw new BadRequestException('Invalid config');
}
```

### 6.5 Future Plugin Direction

**Goal:** Templates are separate npm packages, not code changes.

**Architecture:**
```
botgrandfather-core/          # Platform core
  ├── src/
  └── package.json

botgrandfather-template-lead-funnel/  # Template package
  ├── src/
  │   ├── lead-funnel.service.ts
  │   └── lead-funnel.handler.ts
  └── package.json

botgrandfather-template-booking/  # Another template
  ├── src/
  │   └── booking.service.ts
  └── package.json
```

**Dynamic Loading:**
```typescript
// Scan node_modules for template packages
const templates = fs.readdirSync('node_modules')
  .filter(name => name.startsWith('botgrandfather-template-'))
  .map(name => require(name));

// Auto-register
for (const template of templates) {
  this.handlers.set(template.name, new template.Handler(template.service));
}
```

---

## 7. OWNER MODULE SYSTEM

### 7.1 Philosophy

**OwnerModuleRegistry = Template Metadata Registry**

Templates register:
- Navigation items
- Settings schemas
- Widget definitions
- Capability exposure

**Why Important:**
- New templates add UI WITHOUT platform code changes
- Owner dashboard is metadata-driven
- Marketplace-ready (templates publish metadata)

### 7.2 Registration

```typescript
// owner-modules/owner-module.registry.ts
export interface OwnerModuleDefinition {
  template: string;
  navigation: {
    id: string;
    label: string;
    route: string;
    icon: string;
  }[];
  settings: {
    schema: Record<string, any>;  // JSON schema
    sections: { id: string; label: string; fields: string[] }[];
  };
  widgets: {
    key: string;
    type: 'metric' | 'chart' | 'table';
    title: string;
    fetch: (botId: string) => Promise<any>;
  }[];
}

export const OWNER_MODULE_REGISTRY: Readonly<Record<string, OwnerModuleDefinition>> = {
  'lead-funnel': {
    template: 'lead-funnel',
    navigation: [
      { id: 'leads', label: 'Leads', route: '/leads', icon: '🎯' },
    ],
    settings: {
      schema: { /* JSON schema */ },
      sections: [...],
    },
    widgets: [...],
  },
};

export function getOwnerModule(template: string): OwnerModuleDefinition | undefined {
  return OWNER_MODULE_REGISTRY[template];
}
```

### 7.3 Navigation Composition

```typescript
class NavigationService {
  composeNavigation(templates: string[]): NavigationItem[] {
    const nav = [...this.universalNavigation];
    
    for (const template of templates) {
      const module = getOwnerModule(template);
      if (module) {
        nav.push(...module.navigation.map(section => ({
          key: section.id,
          label: section.label,
          route: `/bots/:botId${section.route}`,
          icon: section.icon,
          source: 'template',
          template: module.template,
        })));
      }
    }
    
    return nav;
  }
}
```

### 7.4 Future Marketplace Implications

**Partner Publishes Template:**
1. Publish `botgrandfather-template-booking` npm package
2. Package includes `OwnerModuleDefinition` metadata
3. Platform scans node_modules, auto-registers
4. Owner can create bot with booking template
5. Navigation, settings, widgets appear automatically

**No Platform Code Changes Required.**

---

## 8. ANALYTICS ARCHITECTURE

### 8.1 Generic Events

**Event Taxonomy:**
```typescript
// Session events
'session:started'
'session:completed'
'session:abandoned'

// Conversion events
'conversion:achieved'

// Bot events
'bot:connected'
'bot:deleted'
'bot:config_updated'

// Template-specific (via metadata)
'lead:created'  // lead-funnel only
'booking:created'  // booking template
'order:created'  // shop template
```

**Why Generic:**
- Platform remains template-agnostic
- Future templates don't feel like second-class citizens
- Analytics queries remain generic

### 8.2 Event Schema

```typescript
@Entity('analytics_events')
@Index(['botId', 'eventType'])
@Index(['createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  botId: string;

  @Column({ nullable: true })
  ownerId: string | null;

  @Column()
  eventType: string;  // session:started, conversion:achieved, etc.

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;  // template, userId, flowType, etc.

  @CreateDateColumn()
  createdAt: Date;
}
```

### 8.3 Retention Policy

**ProcessedUpdate:** 7 days (idempotency window)  
**AnalyticsEvent:** 90 days (analytics retention)

**Cleanup Job:**
```typescript
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async cleanupAnalyticsEvents() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);
  
  const result = await this.analyticsEventRepository
    .createQueryBuilder()
    .delete()
    .where('createdAt < :cutoffDate', { cutoffDate })
    .execute();
  
  this.logger.log(`Deleted ${result.affected} analytics events`);
}
```

### 8.4 Scalability Direction

**Current Scale (< 1M events/day):**
- PostgreSQL sufficient
- GROUP BY aggregation memory-safe
- Cleanup jobs prevent bloat

**Future Scale (> 1M events/day):**
- Extract to ClickHouse or TimescaleDB
- Keep PostgreSQL for recent data (7 days)
- Archive older data to external analytics

---

## 9. BILLING ARCHITECTURE

### 9.1 Capability-Based Quotas

**Plan Definitions:**
```typescript
interface PlanLimits {
  maxBots: number;
  maxInteractionsPerMonth: number;  // Generic (leads, bookings, orders)
  maxFlows: number;                 // Generic (funnels, booking flows)
  allowedTemplates: string[];       // ['lead-funnel', 'booking', '*']
  analyticsEnabled: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}

export const PLAN_DEFINITIONS: Record<string, PlanLimits> = {
  free: {
    maxBots: 1,
    maxInteractionsPerMonth: 50,
    maxFlows: 1,
    allowedTemplates: ['lead-funnel'],
    analyticsEnabled: false,
    customBranding: false,
    prioritySupport: false,
  },
  starter: {
    maxBots: 3,
    maxInteractionsPerMonth: 500,
    maxFlows: 5,
    allowedTemplates: ['lead-funnel', 'booking'],
    analyticsEnabled: true,
    customBranding: false,
    prioritySupport: false,
  },
  pro: {
    maxBots: 10,
    maxInteractionsPerMonth: 5000,
    maxFlows: 20,
    allowedTemplates: ['*'],
    analyticsEnabled: true,
    customBranding: true,
    prioritySupport: true,
  },
};
```

### 9.2 Why Funnel-Centric Limits Removed

**Before:**
```typescript
maxLeadsPerMonth: 500
maxFunnels: 5
```

**After:**
```typescript
maxInteractionsPerMonth: 500
maxFlows: 5
```

**Why:**
- Booking template doesn't have "leads"
- Shop template doesn't have "funnels"
- Generic terms work for all templates

---

## 10. SECURITY ARCHITECTURE

### 10.1 Ownership Verification

**Guard-Based:**
```typescript
@Get(':id/overview')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
async getBotOverview(@Param('id') botId: string) {
  // Ownership verified by guard
}
```

**Logic:**
```typescript
const bot = await this.botRepository.findOne({ where: { id: botId } });
if (bot.ownerId !== session.ownerId) {
  throw new ForbiddenException('Access denied');
}
```

### 10.2 Mini App Auth

**Telegram initData validation:**
- HMAC-SHA256 signature verification
- auth_date timestamp validation (1h max age)
- Prevents replay attacks

### 10.3 Replay Protection

**initData max age:** 1 hour (configurable via `INIT_DATA_MAX_AGE_SECONDS`)

```typescript
const authTimestamp = parseInt(params.get('auth_date'), 10);
const maxAgeSeconds = parseInt(process.env.INIT_DATA_MAX_AGE_SECONDS || '3600', 10);
const now = Math.floor(Date.now() / 1000);

if (now - authTimestamp > maxAgeSeconds) {
  throw new UnauthorizedException('initData expired');
}
```

### 10.4 Sensitive Config Protection

**Sanitization:**
```typescript
private sanitizeConfig(config: Record<string, any>): Record<string, any> {
  const sanitized = { ...config };
  delete sanitized.ownerChatId;
  delete sanitized.webhookSecret;
  delete sanitized.token;
  return sanitized;
}
```

**Entity-level:**
```typescript
@Column({ select: false })  // Never selected by default
token: string;

@Column({ select: false })
webhookSecret: string;
```

### 10.5 DTO Validation

**class-validator decorators:**
```typescript
class ConnectBotDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(200)
  token: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  template: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
```

### 10.6 Rate Limiting Status

**Current:** No rate limiting implemented  
**Risk:** Medium (non-critical for current scale)  
**Future:** Add @nestjs/throttler if abuse detected

### 10.7 Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| No rate limiting | MEDIUM | Monitor for abuse, add throttler if needed |
| No soft deletes | MEDIUM | Add @DeleteDateColumn when needed |
| No external analytics | LOW | PostgreSQL sufficient until 1M+/day |
| No queue system | LOW | Direct processing sufficient until high load |

---

## 11. DATABASE ARCHITECTURE

### 11.1 Entities

**Bot:**
```typescript
@Entity('bots')
@Index(['template'])
export class Bot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ select: false })
  token: string;

  @Column()
  template: string;

  @Column({ type: 'jsonb' })
  config: Record<string, any>;

  @Column({ unique: true })
  webhookSecret: string;

  @Column({ nullable: true })
  ownerId: string | null;

  @ManyToOne(() => Owner)
  owner: Owner | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Customer:**
```typescript
@Entity('customers')
@Unique(['botId', 'telegramUserId'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  telegramUserId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ default: 'new' })
  status: 'new' | 'active' | 'converted';

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**AnalyticsEvent:**
```typescript
@Entity('analytics_events')
@Index(['botId', 'eventType'])
@Index(['createdAt'])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ nullable: true })
  ownerId: string | null;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

**ProcessedUpdate:**
```typescript
@Entity('processed_updates')
@Unique(['botId', 'updateId'])
export class ProcessedUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bigint' })
  updateId: bigint;

  @Column()
  botId: string;

  @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
  bot: Bot;

  @CreateDateColumn()
  createdAt: Date;
}
```

**UserState:**
```typescript
@Entity('user_states')
@Unique(['botId', 'userId'])
export class UserState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  userId: bigint;

  @Column({ default: 'idle' })
  currentStep: string;

  @Column({ type: 'jsonb', default: {} })
  payload: Record<string, any>;

  @ManyToOne(() => Bot, { onDelete: 'CASCADE' })
  bot: Bot;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Lead (Template-Specific):**
```typescript
@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  userId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'jsonb', default: {} })
  answers: Record<string, string>;

  @Column({ type: 'varchar', nullable: true })
  contact: string | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
```

### 11.2 Unique Constraints

| Entity | Constraint | Purpose |
|--------|------------|---------|
| Bot | webhookSecret (unique) | One bot per webhook secret |
| Customer | (botId, telegramUserId) | One customer per bot per user |
| ProcessedUpdate | (botId, updateId) | Idempotency |
| UserState | (botId, userId) | One state per bot per user |

### 11.3 Indexing Strategy

| Entity | Index | Purpose |
|--------|-------|---------|
| Bot | template | Filter by template |
| Customer | botId, telegramUserId | Fast lookups |
| AnalyticsEvent | botId, eventType | Aggregation queries |
| AnalyticsEvent | createdAt | Time-based queries |
| Lead | botId, userId, createdAt | Multi-tenant filtering |

### 11.4 Cascade Risks

**Bot Deletion:**
- Cascades to: UserState, ProcessedUpdate
- Does NOT cascade to: Customer (universal entity), Lead (template-specific)

**Why:** Customer is universal — may be used by multiple bots. Lead is template-specific data that should be deleted with bot.

---

## 12. SCALABILITY STATUS

### 12.1 What Scales Well

| Component | Scalability | Reason |
|-----------|-------------|--------|
| BotService | 10,000+ bots | Simple CRUD, indexed queries |
| CustomerService | 1M+ customers | Indexed, paginated, race-safe |
| WebhookService | High load | Stateless, idempotent, awaited |
| OwnerService | 100k+ owners | Simple lookups |
| Dashboard | 100+ bots/owner | O(1) queries (N+1 fixed) |
| Analytics | 1M+ events/month | Database aggregation, cleanup |

### 12.2 What Does Not Scale

| Component | Limit | Reason |
|-----------|-------|--------|
| PostgreSQL analytics | ~1M events/day | Need ClickHouse/TimescaleDB |
| Direct webhook processing | High load | Need queue system (BullMQ) |
| Monolith | Multiple regions | Need microservices extraction |

### 12.3 Future Bottlenecks

**1. Analytics table growth**
- **Break point:** ~10M rows
- **Fix:** ClickHouse/TimescaleDB extraction
- **Timeline:** When events > 1M/day

**2. Webhook processing latency**
- **Break point:** High concurrent webhooks
- **Fix:** BullMQ queue system
- **Timeline:** When webhooks > 100/sec

**3. Dashboard aggregation**
- **Break point:** 500+ bots per owner
- **Fix:** Materialized views
- **Timeline:** Rare (most owners have < 50 bots)

### 12.4 Intentionally Postponed

**Not Implemented (Non-Critical):**
- Rate limiting (@nestjs/throttler)
- Soft deletes (@DeleteDateColumn)
- External analytics DB (ClickHouse)
- Queue system (BullMQ)
- Redis caching
- WebSocket layer
- Plugin system (dynamic template loading)

**Reason:** Adds complexity without immediate benefit. Platform remains simple modular monolith.

---

## 13. FULL AUDIT HISTORY

### 13.1 Major Architectural Mistakes Fixed

**Mistake 1: Public Bot Enumeration**
```typescript
// ❌ BEFORE
@Get()
async getAllBots() {
  return this.botService.getAllBots();  // Anyone can see all bots!
}
```

**Fix:**
```typescript
// ✅ AFTER
@Get()
@UseGuards(MiniAppAuthGuard)
async getAllBots(@Req() req: MiniAppRequest) {
  return this.botService.getOwnerBots(req.miniAppSession.ownerId);
}
```

**Impact:** Prevented full platform bot enumeration.

---

**Mistake 2: Fire-and-Forget Webhooks**
```typescript
// ❌ BEFORE
async handleWebhook() {
  this.webhookService.processUpdate(...);  // NO await
  res.status(200).json({ ok: true });
}
```

**Fix:**
```typescript
// ✅ AFTER
async handleWebhook() {
  await this.webhookService.processUpdate(...);  // AWAIT
  res.status(200).json({ ok: true });
}
```

**Impact:** No silent webhook failures. Telegram retries on error.

---

**Mistake 3: N+1 Dashboard Queries**
```typescript
// ❌ BEFORE
async getOwnerStats(ownerId) {
  const bots = await this.getOwnerBots(ownerId);
  for (const bot of bots) {
    await this.countCustomers(bot.id);  // N queries
    await this.countLeads(bot.id);  // N queries
  }
}
```

**Fix:**
```typescript
// ✅ AFTER
async getOwnerStats(ownerId) {
  const bots = await this.getOwnerBots(ownerId);
  const botIds = bots.map(b => b.id);
  const customerCounts = await this.countByStatusForBots(botIds);  // 1 query
  const leadCounts = await this.countLeadsByBotIds(botIds);  // 1 query
}
```

**Impact:** Dashboard scales to 100+ bots (was 10).

---

**Mistake 4: Funnel-Centric Analytics**
```typescript
// ❌ BEFORE
await analytics.track('funnel:started');
await analytics.track('funnel:completed');
```

**Fix:**
```typescript
// ✅ AFTER
await analytics.track('session:started', { template: 'lead-funnel', flowType: 'funnel' });
await analytics.track('session:completed', { template: 'lead-funnel', flowType: 'funnel' });
await analytics.track('conversion:achieved', { template: 'lead-funnel', conversionType: 'lead' });
```

**Impact:** Platform template-agnostic. Future templates (booking, shop) semantically compatible.

---

**Mistake 5: No Ownership Verification**
```typescript
// ❌ BEFORE
@Get(':id/overview')
async getBotOverview(@Param('id') botId) {
  return this.botService.getBotOverview(botId);  // Anyone can access any bot!
}
```

**Fix:**
```typescript
// ✅ AFTER
@Get(':id/overview')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
async getBotOverview(@Param('id') botId) {
  // Ownership verified by guard
  return this.botService.getBotOverview(botId);
}
```

**Impact:** Cross-tenant data access impossible (Critical security fix).

---

### 13.2 Architectural Drift Prevented

**Drift 1: Template-Specific UI in Controllers**
- **Detected:** `OwnerViewService` hardcoded "Total Leads" widget
- **Fixed:** Generic "Interactions" widget, template-specific widgets from metadata
- **Prevented:** Platform becoming "Lead Funnel Builder"

**Drift 2: Funnel-Centric Plan Limits**
- **Detected:** `maxLeadsPerMonth`, `maxFunnels`
- **Fixed:** `maxInteractionsPerMonth`, `maxFlows`
- **Prevented:** Booking/shop templates feeling like second-class citizens

**Drift 3: Runtime Coupling to Mini App**
- **Detected:** Potential imports of miniapp/ in runtime/
- **Fixed:** Strict module boundaries, no circular dependencies
- **Prevented:** Runtime instability from operational changes

---

### 13.3 Dangerous Directions Avoided

**Direction 1: Microservices Prematurely**
- **Risk:** Extracted runtime, analytics, billing into separate services
- **Avoided:** Platform remains modular monolith
- **Reason:** No immediate need, adds complexity

**Direction 2: External Analytics DB**
- **Risk:** Moved to ClickHouse/TimescaleDB too early
- **Avoided:** PostgreSQL sufficient for current scale
- **Reason:** Extract when needed, not before

**Direction 3: Queue System Overengineering**
- **Risk:** BullMQ for webhook processing
- **Avoided:** Direct processing sufficient
- **Reason:** Add queue when webhooks > 100/sec

---

## 14. CURRENT PLATFORM STATUS

### 14.1 Production Readiness

**Ready For:**
- ✅ 100+ owners
- ✅ 1000+ bots
- ✅ 1M+ events/month
- ✅ Booking template deployment
- ✅ AI assistant template deployment
- ✅ Frontend Mini App development

**Not Ready For:**
- ⚠️ 10,000+ owners (need rate limiting)
- ⚠️ 10M+ events/month (need ClickHouse)
- ⚠️ High-traffic webhooks (need queue system)

### 14.2 Current Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| No rate limiting | MEDIUM | Monitor abuse, add throttler |
| No soft deletes | MEDIUM | Add when needed |
| PostgreSQL analytics growth | LOW | Cleanup jobs active |
| Direct webhook processing | LOW | Monitor latency |

### 14.3 Technical Debt

**Low Priority:**
- Add rate limiting (@nestjs/throttler)
- Add soft deletes (@DeleteDateColumn)
- Add comprehensive test suite

**Medium Priority:**
- Dynamic template loading (plugin system)
- Materialized views for dashboards
- Redis caching for frequent queries

**High Priority:**
- None (all critical issues fixed)

### 14.4 Safe Next Steps

**Safe To Do:**
- Add booking template
- Add AI assistant template
- Develop frontend Mini App
- Deploy to production
- Onboard first 100 owners

**Unsafe To Do:**
- Add microservices (overengineering)
- Extract analytics to ClickHouse (premature)
- Add complex plugin system (not needed yet)

---

## 15. FUTURE ROADMAP

### 15.1 Booking Template Direction

**Template Architecture:**
```typescript
class BookingService implements TemplateService {
  async handleStart(context) {
    // Show available dates/times
  }
  
  async handleCallback(context, callbackData) {
    // Book slot, send confirmation
  }
}

// Booking-specific entity
@Entity('bookings')
class Booking {
  botId: string;
  userId: bigint;
  date: Date;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// OwnerModuleRegistry metadata
{
  template: 'booking',
  navigation: [
    { id: 'bookings', label: 'Bookings', route: '/bookings', icon: '📅' },
  ],
}
```

**Generic Events Used:**
- `session:started` — Booking flow begins
- `session:completed` — Booking flow ends
- `conversion:achieved` — Booking confirmed

### 15.2 AI Assistant Template Direction

**Template Architecture:**
```typescript
class AIAssistantService implements TemplateService {
  async handleDefault(context) {
    // Send message to LLM, stream response
  }
}

// AI-specific entity
@Entity('conversations')
class Conversation {
  botId: string;
  userId: bigint;
  messages: { role: 'user' | 'assistant'; content: string }[];
  createdAt: Date;
}

// OwnerModuleRegistry metadata
{
  template: 'ai-assistant',
  navigation: [
    { id: 'conversations', label: 'Conversations', route: '/conversations', icon: '🤖' },
    { id: 'prompts', label: 'System Prompts', route: '/prompts', icon: '⚙️' },
  ],
}
```

### 15.3 Marketplace Direction

**Partner Publishes Template:**
1. Create `botgrandfather-template-booking` npm package
2. Include `OwnerModuleDefinition` metadata
3. Publish to npm registry
4. Platform scans node_modules, auto-registers
5. Owners can select template from dashboard

**Platform Changes Required:**
- Dynamic template discovery (scan node_modules)
- Template versioning support
- Template validation (config schema)

### 15.4 Plugin System Direction

**Architecture:**
```
botgrandfather-core/
  ├── src/
  │   ├── runtime/
  │   ├── miniapp/
  │   └── core.js
  └── package.json

@botgrandfather/template-lead-funnel/
  ├── src/
  │   ├── lead-funnel.service.ts
  │   └── lead-funnel.handler.ts
  ├── owner-module.ts  // OwnerModuleDefinition
  └── package.json
```

**Dynamic Loading:**
```typescript
// Scan node_modules for templates
const templatePackages = fs.readdirSync('node_modules')
  .filter(name => name.startsWith('@botgrandfather/template-'))
  .map(name => require(name));

// Auto-register
for (const pkg of templatePackages) {
  this.handlers.set(pkg.template, new pkg.Handler(pkg.service));
  OWNER_MODULE_REGISTRY[pkg.template] = pkg.ownerModule;
}
```

### 15.5 Frontend Direction

**Frontend Stack:** React + TypeScript + Telegram WebApp SDK

**Architecture:**
```
src/
├── components/
│   ├── Dashboard/
│   ├── BotList/
│   ├── CustomerList/
│   └── Analytics/
├── services/
│   ├── miniapp-api.ts  // API calls to backend
│   └── auth.ts  // initData handling
├── hooks/
│   └── useNavigation.ts
└── pages/
    ├── dashboard.tsx
    ├── bots/[id].tsx
    └── settings.tsx
```

**Key Principle:** Frontend renders metadata from backend, NO hardcoded routes.

### 15.6 Operational Ecosystem Direction

**Future Capabilities:**
- Notification center (email, SMS, push)
- Team management (multiple owners per bot)
- Webhook events (send events to external URLs)
- API keys (third-party integrations)
- Audit logs (who changed what)
- Billing integration (Stripe)

---

## 16. ABSOLUTE ARCHITECTURAL INVARIANTS

### 16.0 DEVELOPMENT ALIGNMENT — MANDATORY SELF-CHECK

**BEFORE IMPLEMENTING ANY NEW FEATURE:**

Every agent MUST evaluate the following questions before writing code:

**1. Does this strengthen platform universality?**
- ✅ Yes: Adding generic "Interactions" metric (works for all templates)
- ❌ No: Adding "Leads" metric (only works for lead-funnel)
- ❓ Unclear: Reconsider, consult maintainers

**2. Does this introduce template coupling?**
- ✅ No: CustomerService has ZERO references to templates
- ❌ Yes: CustomerService imports LeadFunnelService
- ❓ Unclear: Refactor to remove coupling

**3. Is abstraction justified by proven repetition?**
- ✅ Yes: 3+ templates need same pattern → abstract
- ❌ No: 1-2 templates need pattern → implement manually
- ❓ Unclear: Build manually, watch for repetition

**4. Does this preserve runtime/operational separation?**
- ✅ Yes: Runtime does NOT import Mini App
- ❌ No: WebhookService imports DashboardService
- ❓ Unclear: Refactor to break dependency

**5. Does this improve ecosystem extensibility?**
- ✅ Yes: Adding OwnerModuleRegistry metadata
- ❌ No: Hardcoding template UI in controllers
- ❓ Unclear: Prefer metadata-driven approach

**6. Does this introduce accidental framework complexity?**
- ✅ No: Simple, explicit contracts
- ❌ Yes: Recursive schema engines, universal builders
- ❓ Unclear: Simplify, remove abstraction

**7. Is this too early for current architecture maturity?**
- ✅ No: Solves immediate need (booking template)
- ❌ Yes: "Let's build plugin system" (10+ templates needed first)
- ❓ Unclear: Wait, build simpler solution first

**If ANY answer is ❌:**
1. STOP
2. Re-read `ARCHITECTURAL_INVARIANTS.md`
3. Consult with platform maintainers
4. Reconsider approach

---

### 16.1 NON-NEGOTIABLE Rules

**Invariant 1: Runtime and Mini App MUST remain separated**
- Runtime NEVER imports Mini App
- Mini App is READ-ONLY operational view
- Violation: Runtime becomes unstable from operational changes

**Invariant 2: Frontend MUST remain metadata-driven**
- No hardcoded template-specific routes
- Navigation composed from OwnerModuleRegistry
- Violation: Platform becomes "Lead Funnel Builder"

**Invariant 3: Platform MUST remain template-agnostic**
- Generic event names (`session:*`, `conversion:*`)
- Generic plan limits (`maxInteractionsPerMonth`)
- Violation: Future templates feel like second-class citizens

**Invariant 4: Core entities MUST remain universal**
- Customer has NO template-specific fields
- Owner has NO template-specific fields
- Violation: Customer becomes lead-funnel-specific

**Invariant 5: Analytics MUST remain generic**
- Event types not template-specific
- Metadata carries template context
- Violation: Analytics queries become template-specific

**Invariant 6: Billing MUST remain capability-based**
- Quotas based on capabilities (interactions, flows)
- NOT template-specific metrics (leads, bookings)
- Violation: Billing incompatible with future templates

**Invariant 7: Ownership verification MUST exist everywhere required**
- All bot-scoped endpoints guarded
- No client-side trust
- Violation: Cross-tenant data access possible

**Invariant 8: Webhook processing MUST be awaited**
- No fire-and-forget
- Telegram retry semantics preserved
- Violation: Silent webhook failures

**Invariant 9: Database growth MUST be managed**
- Cleanup jobs active
- Retention policies enforced
- Violation: Database bloat, performance degradation

**Invariant 10: No circular dependencies**
- OwnershipModule does NOT import BotModule
- Runtime does NOT import Operational
- Violation: NestJS DI fails

### 16.2 Architectural Principles (Reiteration)

1. **Universal-first:** Core abstractions (Customer, Owner) are template-agnostic
2. **Template isolation:** Templates cannot modify core platform
3. **Metadata-driven UI:** Owner dashboard driven by OwnerModuleRegistry
4. **Capability-based:** Quotas and limits are generic, not template-specific
5. **Event genericism:** Analytics events use generic names with template metadata
6. **Read-only Mini App:** Mini App is operational view, NOT business logic
7. **Ownership everywhere:** All bot-scoped endpoints verify ownership
8. **Awaited webhooks:** No fire-and-forget processing
9. **Automatic cleanup:** Data lifecycle managed, no manual intervention
10. **Modular monolith:** No premature microservices extraction

---

## APPENDIX: KEY FILES FOR NEW AGENT

**Core Runtime:**
- `src/webhook/webhook.controller.ts` — Webhook entry point
- `src/webhook/webhook.service.ts` — Webhook processing
- `src/templates/template.factory.ts` — Template dispatch
- `src/customer/customer.service.ts` — Universal CRM

**Operational Layer:**
- `src/miniapp/controllers/miniapp.controller.ts` — Mini App endpoints
- `src/miniapp/services/dashboard.service.ts` — Data aggregation
- `src/miniapp/auth/telegram-init-data.service.ts` — Auth validation
- `src/ownership/bot-ownership.guard.ts` — Ownership verification

**Template System:**
- `src/templates/lead-funnel/lead-funnel.service.ts` — Example template
- `src/owner-modules/owner-module.registry.ts` — Template metadata

**Infrastructure:**
- `src/bot/bot.service.ts` — Bot lifecycle
- `src/analytics/analytics.service.ts` — Event tracking
- `src/lifecycle/data-lifecycle.service.ts` — Cleanup jobs

**Configuration:**
- `src/config/env.config.ts` — Environment variables
- `src/app.module.ts` — Root module imports
- `src/main.ts` — Bootstrap

---

**END OF BOTGRANDFATHER PLATFORM BLUEPRINT**

**Document Version:** 1.0  
**Last Updated:** 2026-05-11  
**Maintainer:** Platform Team
