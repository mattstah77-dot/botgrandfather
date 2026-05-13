# BOTGRANDFATHER — ARCHITECTURE DECISIONS LOG

**Version:** 1.0  
**Date:** 2026-05-11  
**Purpose:** Chronological decision history with reasoning

---

## HOW TO USE THIS DOCUMENT

This is NOT a changelog.  
This is NOT a feature list.  
This is a **DECISION HISTORY** that preserves:
- What was decided
- Why it was decided
- What risk it solved
- What future direction it protects
- What anti-pattern it prevents

**New agents should read this to understand:**
- Why the platform is structured this way
- What alternatives were rejected
- What mistakes were avoided
- What direction is protected

---

## PHASE 0: INITIAL PLATFORM CONCEPT

**Date:** Pre-2026  
**Decision:** Platform vs Single-Bot Builder

**What Was Decided:**
BotGrandFather will be a **multi-tenant platform** for managing multiple Telegram bots, NOT a single-bot builder.

**Why:**
- Businesses need multiple bots for different use cases
- Single-bot builders don't scale to multi-bot operations
- Platform enables template ecosystem
- Platform enables unified dashboard

**Risk Solved:**
- Prevented building "another Telegram bot builder"
- Prevented single-tenant architecture
- Prevented template-hardcoded dashboard

**Future Direction Protected:**
- Multi-tenant SaaS
- Template ecosystem
- Unified operational dashboard
- Marketplace potential

**Anti-Pattern Prevented:**
- Single-bot focus
- Template-specific code in core
- No owner abstraction

---

## PHASE 1: RUNTIME FOUNDATION

**Date:** Early Development  
**Decision:** Runtime/Operational Separation

**What Was Decided:**
Split platform into two layers:
- **Runtime:** Webhook processing, template execution, customer lifecycle
- **Operational:** Owner dashboard, analytics views, settings management

**Why:**
- Runtime must be stable, fast, independent
- Operational can change without affecting bot processing
- Clear separation of concerns
- Runtime NEVER depends on Operational

**Risk Solved:**
- Prevented runtime instability from operational changes
- Prevented operational features from blocking runtime
- Prevented circular dependencies

**Future Direction Protected:**
- Independent scaling of runtime and operational
- Operational UI can be rebuilt without touching runtime
- Runtime can be extracted to microservices if needed

**Anti-Pattern Prevented:**
- Runtime logic in Mini App controllers
- Operational imports in webhook processing
- Circular dependencies between layers

---

## PHASE 2: CUSTOMER ABSTRACTION

**Date:** After Lead-Funnel Template  
**Decision:** Universal Customer Entity

**What Was Decided:**
Create `Customer` entity that is **template-agnostic**, separate from template-specific entities like `Lead`.

**Why:**
- Customer exists regardless of template (funnel, booking, AI assistant)
- Lead-funnel is ONE template, NOT the platform identity
- Template-specific data belongs in template entities
- Platform must remain template-agnostic

**Risk Solved:**
- Prevented platform becoming "lead funnel builder"
- Prevented Customer entity from having template-specific fields
- Prevented funnel-centric semantics in core

**Future Direction Protected:**
- Booking template can use same Customer entity
- AI assistant template can use same Customer entity
- Shop template can use same Customer entity
- Analytics remains generic

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
class Customer {
  funnelAnswers: Record<string, string>;  // Template-specific!
}

// ✅ CORRECT
class Customer {
  status: 'new' | 'active' | 'converted';  // Universal
}
class Lead {
  answers: Record<string, string>;  // Template-specific
}
```

**Evidence:**
- `src/customer/entities/customer.entity.ts` — template-agnostic
- `src/customer/customer.service.ts` — ZERO template references
- Lead-funnel creates `Lead` entity, updates `Customer` status

---

## PHASE 3: ANALYTICS GENERIC EVENTS

**Date:** After Lead-Funnel Template  
**Decision:** Generic Event Naming

**What Was Decided:**
Use generic event names (`session:started`, `conversion:achieved`) instead of funnel-specific names (`funnel:started`, `funnel:completed`).

**Why:**
- Booking template doesn't have "funnels"
- Shop template doesn't have "leads"
- Generic names work for ALL templates
- Platform remains template-agnostic

**Risk Solved:**
- Prevented analytics from becoming funnel-centric
- Prevented booking template from feeling like second-class citizen
- Prevented need to rename events when adding new templates

**Future Direction Protected:**
- Booking template uses `session:completed` (same as funnel)
- Shop template uses `conversion:achieved` (same as funnel)
- AI assistant uses `session:started` (same as funnel)
- Queries remain generic

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
await analytics.track('funnel:started');  // Too specific!

// ✅ CORRECT
await analytics.track('session:started', {
  template: 'lead-funnel',
  flowType: 'funnel',
});  // Generic + metadata
```

**Evidence:**
- `src/infrastructure/events/platform-events.ts` — generic event types
- `src/analytics/analytics.service.ts` — no template-specific logic

---

## PHASE 4: OWNER MODULE REGISTRY

**Date:** Mini App Development  
**Decision:** Metadata-Driven Operational UI

**What Was Decided:**
Templates register metadata in `OwnerModuleRegistry` instead of hardcoding UI in controllers.

**Why:**
- New templates add UI WITHOUT platform code changes
- Owner dashboard is metadata-driven
- Navigation composed dynamically
- Settings driven by JSON schemas

**Risk Solved:**
- Prevented controllers from becoming template-specific
- Prevented hardcoded routes ("/leads", "/bookings")
- Prevented UI from breaking when adding new templates

**Future Direction Protected:**
- Marketplace-ready (templates publish metadata)
- Frontend renders from metadata, NOT hardcoded
- Settings composition from schemas
- Widget system from metadata

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
class OwnerViewService {
  composeView() {
    return { widget: 'Leads Widget' };  // Hardcoded!
  }
}

// ✅ CORRECT
class OwnerViewService {
  composeView(template: string) {
    const module = getOwnerModule(template);
    return {
      widgets: module.widgets.map(w => this.createWidget(w)),
    };
  }
}
```

**Evidence:**
- `src/owner-modules/owner-module.registry.ts` — metadata registry
- `src/miniapp/services/navigation.service.ts` — dynamic composition
- `src/miniapp/services/owner-view.service.ts` — widget composition

---

## PHASE 5: MINI APP FOUNDATION

**Date:** Mini App Development  
**Decision:** Telegram initData Authentication

**What Was Decided:**
Use Telegram WebApp `initData` for authentication with HMAC-SHA256 validation.

**Why:**
- No need for separate auth system (yet)
- Telegram already validates user identity
- Cryptographic signature prevents spoofing
- Simple, secure, no extra infrastructure

**Risk Solved:**
- Prevented fake auth / mock auth in production
- Prevented session spoofing
- Prevented unauthorized access

**Future Direction Protected:**
- Can add JWT layer later if needed
- Can add refresh tokens later if needed
- Can add session storage later if needed
- Current auth is sufficient for MVP

**Anti-Pattern Prevented:**
- Mock auth in production
- Hardcoded user IDs
- No authentication at all

**Evidence:**
- `src/miniapp/auth/telegram-init-data.service.ts` — HMAC-SHA256 validation
- `src/miniapp/auth/miniapp-auth.guard.ts` — auth guard
- `src/miniapp/auth/miniapp-session.interface.ts` — session type

---

## PHASE 6: OWNERSHIP VERIFICATION

**Date:** Stabilization Sprint  
**Decision:** BotOwnershipGuard on All Bot-Scoped Endpoints

**What Was Decided:**
Add `BotOwnershipGuard` to ALL bot-scoped endpoints to verify `bot.ownerId === session.ownerId`.

**Why:**
- Critical security gap: anyone could access any bot's data
- UUID guessing allows cross-tenant access
- No ownership verification was CRITICAL vulnerability
- Guard-based approach is reusable, DRY

**Risk Solved:**
- Prevented cross-tenant data access
- Prevented full platform data breach
- Prevented unauthorized API access

**Future Direction Protected:**
- Security foundation for scaling
- Multi-tenant isolation guaranteed
- API safe for public exposure

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
@Get(':id/overview')
async getBotOverview(@Param('id') botId) {
  return this.botService.getBotOverview(botId);  // Anyone can access!
}

// ✅ CORRECT
@Get(':id/overview')
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
async getBotOverview(@Param('id') botId) {
  // Ownership verified by guard
  return this.botService.getBotOverview(botId);
}
```

**Evidence:**
- `src/ownership/bot-ownership.guard.ts` — ownership guard
- All bot-scoped endpoints have `@UseGuards(BotOwnershipGuard)`

---

## PHASE 7: WEBHOOK RELIABILITY

**Date:** Stabilization Sprint  
**Decision:** Awaited Webhook Processing

**What Was Decided:**
WebhookController MUST `await` `processUpdate()` instead of fire-and-forget.

**Why:**
- Fire-and-forget caused silent data loss
- Telegram retries ONLY on non-2xx responses
- If processing fails, must return non-2xx for retry
- Silent failures = broken funnels, lost leads

**Risk Solved:**
- Prevented silent webhook failures
- Enabled Telegram retry on errors
- Made failures observable in logs

**Future Direction Protected:**
- Reliable webhook processing
- Observable webhook lifecycle
- Failures surface to operators

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
async handleWebhook() {
  this.webhookService.processUpdate(...);  // NO await
  res.status(200).json({ ok: true });  // Always 200!
}

// ✅ CORRECT
async handleWebhook() {
  await this.webhookService.processUpdate(...);  // AWAIT
  res.status(200).json({ ok: true });
}
```

**Evidence:**
- `src/webhook/webhook.controller.ts` — awaited processing
- Structured logging for webhook lifecycle

---

## PHASE 8: DASHBOARD SCALABILITY

**Date:** Stabilization Sprint  
**Decision:** N+1 Query Fix with Batched Aggregation

**What Was Decided:**
Replace N+1 queries with single aggregated queries using `GROUP BY`.

**Why:**
- Dashboard loaded ALL bots, then queried customers/leads for EACH bot
- 10 bots = 20 queries, 100 bots = 200 queries
- Will collapse under real load
- PostgreSQL can aggregate faster than application

**Risk Solved:**
- Prevented dashboard from collapsing at 50+ bots per owner
- Reduced query count from O(n) to O(1)
- Memory usage constant regardless of bot count

**Future Direction Protected:**
- Dashboard scales to 100+ bots
- Aggregation handled by database
- No need for caching layer (yet)

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
async getOwnerStats(ownerId) {
  const bots = await this.getOwnerBots(ownerId);
  for (const bot of bots) {
    await this.countCustomers(bot.id);  // N queries
    await this.countLeads(bot.id);  // N queries
  }
}

// ✅ CORRECT
async getOwnerStats(ownerId) {
  const bots = await this.getOwnerBots(ownerId);
  const botIds = bots.map(b => b.id);
  const customerCounts = await this.countByStatusForBots(botIds);  // 1 query
  const leadCounts = await this.countLeadsByBotIds(botIds);  // 1 query
}
```

**Evidence:**
- `src/customer/customer.service.ts` — `countByStatusForBots()`
- `src/bot/bot.service.ts` — `countLeadsByBotIds()`
- `src/miniapp/services/dashboard.service.ts` — batched aggregation

---

## PHASE 9: ANALYTICS MEMORY SAFETY

**Date:** Stabilization Sprint  
**Decision:** Database Aggregation Instead of Loading All Events

**What Was Decided:**
Use QueryBuilder `GROUP BY` instead of `find()` that loads ALL events into memory.

**Why:**
- `find()` loads 100k events = 100k rows in memory
- Will OOM at moderate scale
- Database can aggregate faster
- Memory usage should be constant

**Risk Solved:**
- Prevented OOM at ~100k events
- Made analytics memory-safe for unlimited events
- Reduced memory footprint

**Future Direction Protected:**
- Analytics scales to 1M+ events
- No need for external analytics DB (yet)
- Aggregation handled by database

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
async getBotStats(botId) {
  const events = await this.eventRepository.find({ where: { botId } });  // All events!
  const counts = events.reduce(...);  // In memory
}

// ✅ CORRECT
async getBotStats(botId) {
  const results = await this.eventRepository
    .createQueryBuilder('e')
    .select('e.eventType', 'eventType')
    .addSelect('COUNT(*)', 'count')
    .where('e.botId = :botId', { botId })
    .groupBy('e.eventType')
    .getRawMany();  // Database aggregation
}
```

**Evidence:**
- `src/analytics/analytics.service.ts` — `getBotStats()` uses GROUP BY

---

## PHASE 10: DATA LIFECYCLE

**Date:** Stabilization Sprint  
**Decision:** Automatic Cleanup Jobs

**What Was Decided:**
Add scheduled cleanup jobs for `ProcessedUpdate` (7 days) and `AnalyticsEvent` (90 days).

**Why:**
- Tables grow forever without cleanup
- Unbounded growth = database bloat
- Manual cleanup = operational burden
- Automatic cleanup = no intervention needed

**Risk Solved:**
- Prevented database from degrading over time
- Prevented manual cleanup burden
- Made growth sustainable

**Future Direction Protected:**
- Database stays performant
- No need for archival system (yet)
- Cleanup configurable via ENV

**Evidence:**
- `src/lifecycle/data-lifecycle.service.ts` — cleanup jobs
- Cron-based scheduling (daily at 3:00 AM)
- ENV variables for retention periods

---

## PHASE 11: USERSTATE RACE CONDITION

**Date:** Stabilization Sprint  
**Decision:** Unique Violation Handling + Retry

**What Was Decided:**
Apply same race condition handling pattern as CustomerService to UserState.

**Why:**
- Concurrent webhooks try to create same UserState
- Unique constraint violation throws unhandled exception
- CustomerService already has proven pattern
- Same fix, same reliability

**Risk Solved:**
- Prevented unhandled DB exceptions
- Made concurrent webhook handling safe
- Prevented duplicate UserState records

**Future Direction Protected:**
- Race condition handling is consistent
- Pattern can be applied elsewhere if needed
- No unhandled exceptions in webhook processing

**Evidence:**
- `src/templates/lead-funnel/lead-funnel.service.ts` — `getUserState()` with retry
- Catches `QueryFailedError` code 23505

---

## PHASE 12: INPUT VALIDATION

**Date:** Stabilization Sprint  
**Decision:** Full DTO Validation with class-validator

**What Was Decided:**
Add `@IsString()`, `@MinLength()`, `@MaxLength()` decorators to all DTOs.

**Why:**
- Invalid input was reaching service layer
- Controllers should validate, not services
- class-validator is already in project
- Validation centralized, not scattered

**Risk Solved:**
- Prevented invalid data from reaching services
- Made validation explicit and centralized
- Early rejection of bad input

**Future Direction Protected:**
- Validation is explicit
- Controllers remain thin
- Services trust validated input

**Evidence:**
- `src/bot/dto/bot.dto.ts` — full validation decorators
- Global validation pipe in `src/main.ts`

---

## PHASE 13: TRANSACTION SAFETY

**Date:** Stabilization Sprint  
**Decision:** Transactions for Multi-Step Operations

**What Was Decided:**
Wrap `connectBot()` and `handleContact()` in database transactions.

**Why:**
- `connectBot`: bot creation + webhook setup
- If webhook setup fails, bot record is orphaned
- `handleContact`: lead creation + customer status update
- Either both succeed or both fail

**Risk Solved:**
- Prevented orphaned bot records
- Prevented inconsistent state on failure
- Made multi-step operations atomic

**Future Direction Protected:**
- Transaction safety is standard
- Pattern can be applied elsewhere
- Data integrity guaranteed

**Evidence:**
- `src/bot/bot.service.ts` — `connectBot()` with transaction
- `src/templates/lead-funnel/lead-funnel.service.ts` — `handleContact()` with transaction

---

## PHASE 14: GENERIC OPERATIONAL TRANSITION

**Date:** Stabilization Sprint  
**Decision:** Dashboard Shows "Interactions" Instead of "Leads"

**What Was Decided:**
Change dashboard widget labels from "Total Leads" to "Total Interactions".

**Why:**
- "Leads" is funnel-specific
- Booking template doesn't have "leads"
- Platform must remain template-agnostic
- Generic term works for all templates

**Risk Solved:**
- Prevented platform from becoming "lead funnel builder"
- Made dashboard generic
- Booking template feels like first-class citizen

**Future Direction Protected:**
- Dashboard is template-agnostic
- New templates don't require dashboard changes
- Platform identity preserved

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
composeDashboardView() {
  return { widget: 'Total Leads' };  // Funnel-specific!
}

// ✅ CORRECT
composeDashboardView() {
  return { widget: 'Total Interactions' };  // Generic
}
```

**Evidence:**
- `src/miniapp/services/owner-view.service.ts` — "Interactions" widget
- `src/miniapp/services/dashboard.service.ts` — `totalInteractions` metric

---

## PHASE 15: CAPABILITY PHILOSOPHY

**Date:** Stabilization Sprint  
**Decision:** Capability-Based Plan Limits

**What Was Decided:**
Change plan limits from funnel-specific to capability-based:
- `maxLeadsPerMonth` → `maxInteractionsPerMonth`
- `maxFunnels` → `maxFlows`

**Why:**
- Funnel-specific limits don't work for booking
- Capability-based limits work for ALL templates
- Platform remains template-agnostic
- Future templates don't feel like second-class citizens

**Risk Solved:**
- Prevented billing from becoming funnel-centric
- Made plan limits generic
- Booking template compatible with billing

**Future Direction Protected:**
- Billing is capability-based
- New templates work with existing plans
- Platform identity preserved

**Evidence:**
- `src/billing/plan-limits.ts` — capability-based limits
- `src/billing/billing.service.ts` — `canAddInteraction()`, `canAddFlow()`

---

## PHASE 16: INITDATA SECURITY

**Date:** Stabilization Sprint  
**Decision:** auth_date Timestamp Validation

**What Was Decided:**
Validate `auth_date` in Telegram initData, reject if older than 1 hour.

**Why:**
- initData can be captured and replayed
- No timestamp validation = replay attacks possible
- 1 hour max age is reasonable
- Prevents stale session abuse

**Risk Solved:**
- Prevented replay attacks with captured initData
- Made auth time-bound
- Session freshness guaranteed

**Future Direction Protected:**
- Auth is secure
- Replay attacks prevented
- Can adjust max age via ENV

**Evidence:**
- `src/miniapp/auth/telegram-init-data.service.ts` — `auth_date` validation
- ENV variable `INIT_DATA_MAX_AGE_SECONDS`

---

## PHASE 17: CIRCULAR DEPENDENCY FIX

**Date:** Post-Stabilization  
**Decision:** OwnershipVerificationService Uses TypeOrm Directly

**What Was Decided:**
`OwnershipVerificationService` uses `Repository<Bot>` directly instead of `BotService`.

**Why:**
- `OwnershipModule` importing `BotModule` created circular dependency
- `BotModule` imports `OwnershipModule`
- `OwnershipModule` importing `BotModule` = cycle
- TypeOrm injection avoids cycle

**Risk Solved:**
- Prevented NestJS DI failure
- Broke circular dependency
- Made OwnershipModule self-contained

**Future Direction Protected:**
- No circular dependencies
- OwnershipModule is independent
- DI graph is clean

**Anti-Pattern Prevented:**
```typescript
// ❌ FORBIDDEN
// OwnershipModule imports BotModule
// BotModule imports OwnershipModule
// → Circular dependency!

// ✅ CORRECT
// OwnershipModule uses TypeOrm directly
// No BotModule import needed
```

**Evidence:**
- `src/ownership/ownership-verification.service.ts` — `@InjectRepository(Bot)`
- `src/ownership/ownership.module.ts` — no BotModule import

---

## SUMMARY OF DECISIONS

| Phase | Decision | Status |
|-------|----------|--------|
| 0 | Multi-tenant platform | ✅ Complete |
| 1 | Runtime/Operational separation | ✅ Complete |
| 2 | Universal Customer entity | ✅ Complete |
| 3 | Generic analytics events | ✅ Complete |
| 4 | Metadata-driven UI | ✅ Complete |
| 5 | Telegram initData auth | ✅ Complete |
| 6 | Ownership verification | ✅ Complete |
| 7 | Awaited webhooks | ✅ Complete |
| 8 | Dashboard N+1 fix | ✅ Complete |
| 9 | Analytics memory safety | ✅ Complete |
| 10 | Data lifecycle management | ✅ Complete |
| 11 | UserState race handling | ✅ Complete |
| 12 | Input validation | ✅ Complete |
| 13 | Transaction safety | ✅ Complete |
| 14 | Generic operational UI | ✅ Complete |
| 15 | Capability-based billing | ✅ Complete |
| 16 | InitData replay protection | ✅ Complete |
| 17 | Circular dependency fix | ✅ Complete |

---

## REJECTED APPROACHES

**Rejected: Plugin Runtime System**
- **When:** Early planning
- **Why Rejected:** Premature complexity
- **Current:** Templates are code modules
- **Future:** MAY add if 10+ real templates

**Rejected: External Analytics DB**
- **When:** Stabilization sprint
- **Why Rejected:** PostgreSQL sufficient for current scale
- **Current:** PostgreSQL with cleanup jobs
- **Future:** MAY extract to ClickHouse if > 1M events/day

**Rejected: Queue System (BullMQ)**
- **When:** Stabilization sprint
- **Why Rejected:** Direct processing sufficient
- **Current:** Awaited webhook processing
- **Future:** MAY add if webhooks > 100/sec

**Rejected: Funnel-Centric Semantics**
- **When:** After lead-funnel template
- **Why Rejected:** Platform must remain template-agnostic
- **Current:** Generic events (session, conversion)
- **Anti-Pattern:** `funnel:started`, `funnel:completed`

**Rejected: Public Bot Enumeration**
- **When:** Stabilization sprint
- **Why Rejected:** Security vulnerability
- **Current:** Authenticated endpoint only
- **Anti-Pattern:** `GET /bots` without auth

---

## FUTURE DECISIONS TO MONITOR

**Decision: Plugin Runtime System**
- **Trigger:** 10+ real templates, manual registration painful
- **Options:** npm package scanning, SDK for external devs
- **Risk:** Adds complexity, security review needed
- **Current:** Not needed, code changes acceptable

**Decision: External Analytics DB**
- **Trigger:** > 1M events/day, PostgreSQL slowing
- **Options:** ClickHouse, TimescaleDB, BigQuery
- **Risk:** Migration complexity, new infrastructure
- **Current:** PostgreSQL with cleanup sufficient

**Decision: Queue System**
- **Trigger:** > 100 webhooks/sec, latency issues
- **Options:** BullMQ, RabbitMQ, AWS SQS
- **Risk:** Operational complexity, failure modes
- **Current:** Direct processing sufficient

**Decision: Microservices Extraction**
- **Trigger:** Monolith scaling limits, team size grows
- **Options:** Extract runtime, extract analytics, extract billing
- **Risk:** Distributed system complexity
- **Current:** Modular monolith is fine

**Decision: Third-Party Template Marketplace**
- **Trigger:** Partner interest, revenue opportunity
- **Options:** Manual review, automated vetting, sandboxed runtime
- **Risk:** Security, quality control, support burden
- **Current:** Manual template development only

---

**END OF ARCHITECTURE DECISIONS LOG**

**This document preserves decision history.  
Reasoning is as important as the decision itself.  
Future agents should understand WHY, not just WHAT.**
