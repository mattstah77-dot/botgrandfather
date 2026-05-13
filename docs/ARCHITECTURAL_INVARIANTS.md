# BOTGRANDFATHER — ARCHITECTURAL INVARIANTS

**Version:** 1.0  
**Date:** 2026-05-11  
**Status:** NON-NEGOTIABLE PLATFORM LAW  
**Priority:** ABOVE ALL OTHER CONSIDERATIONS

---

## PREFACE — HOW TO USE THIS DOCUMENT

This document contains **NON-NEGOTIABLE ARCHITECTURAL LAWS** for BotGrandFather.

These are NOT guidelines.  
These are NOT recommendations.  
These are **INVARIANTS** — rules that MUST NEVER be violated.

**If you are tempted to break an invariant:**
1. STOP
2. Re-read this document
3. Ask: "Am I solving a real problem or creating a framework?"
4. Consult with platform maintainers

**Violations result in:**
- Architectural drift
- Template coupling
- Premature abstraction
- Platform identity loss
- Technical debt explosion

---

## SECTION 1 — PLATFORM IDENTITY

### 1.1 BotGrandFather IS:

**Platform-First:**
- A multi-tenant SaaS platform, NOT a single-bot builder
- Runtime infrastructure that serves multiple owners
- Operational dashboard that composes multiple capabilities
- Template ecosystem foundation (future marketplace)

**Ecosystem-Oriented:**
- Designed for template extensibility (via metadata, NOT runtime plugins)
- Supports partner-created templates (future)
- White-label capable (future)
- API-first for third-party integrations (future)

**Metadata-Driven:**
- UI rendered from OwnerModuleRegistry metadata
- Navigation composed from template registrations
- Settings driven by JSON schemas
- Widgets defined by capability contracts

**Operationally Composable:**
- Universal Customer layer composable across templates
- Generic Analytics events composable across use cases
- Billing quotas based on capabilities, not templates
- Operational views agnostic to runtime execution

**Template-Extensible:**
- New templates register metadata, NOT runtime code
- Templates are isolated, cannot modify core
- Template-specific data lives in template entities
- Platform core remains template-agnostic

**Runtime/Operational Separated:**
- Runtime: webhook processing, template execution, customer lifecycle
- Operational: owner dashboard, analytics views, settings management
- Runtime NEVER depends on Operational
- Operational MAY read from Runtime data

**Universal-First:**
- Customer entity is template-agnostic
- Owner entity is template-agnostic
- Analytics events are generic (session, conversion)
- Plan limits are capability-based (interactions, flows)

### 1.2 BotGrandFather is NOT:

**A Funnel Builder:**
- Lead-funnel is ONE template, NOT the platform identity
- Platform does NOT assume funnel metaphor
- Events are NOT funnel:started/completed
- Billing is NOT maxLeadsPerMonth

**A CRM-Only Product:**
- Customer is universal, NOT CRM-centric
- Templates may have no CRM concept (e.g., AI assistant)
- CRM is ONE capability, NOT the core

**A No-Code Monster:**
- Metadata is for operational UI, NOT business logic
- No visual builder for templates
- No drag-and-drop workflow engine
- No universal form builder

**A Frontend-Driven System:**
- Frontend renders metadata, DOES NOT define business logic
- Frontend is READ-ONLY operational view
- Frontend contains NO template-specific branching
- Frontend is NOT the source of truth

**A Template-Hardcoded Dashboard:**
- Dashboard does NOT contain "Leads Widget" hardcoded
- Navigation does NOT contain "/leads" hardcoded
- Views composed from OwnerModuleRegistry, NOT hardcoded
- Metrics generic (Interactions, NOT Leads)

**A Plugin-Runtime Platform (YET):**
- Templates are code changes, NOT dynamic loading
- No npm package scanning
- No sandboxed execution
- No runtime module loading
- **Note:** This MAY change in future, but NOT NOW

**A Feature-First Architecture:**
- Platform does NOT add features because "they might be useful"
- Every feature must serve platform universality
- Features must NOT introduce template coupling
- Abstraction requires PROVEN repetition

---

## SECTION 2 — RUNTIME PHILOSOPHY

### 2.1 Runtime Responsibilities

**Core Platform Owns:**
- Webhook reception and validation (WebhookController, WebhookService)
- Bot entity lifecycle (BotService)
- Customer entity lifecycle (CustomerService)
- Analytics event tracking (AnalyticsService)
- Idempotency enforcement (ProcessedUpdate)
- Transaction safety (connectBot, handleContact)

**Templates Own:**
- Business logic execution (LeadFunnelService, BookingService, etc.)
- Template-specific entity management (Lead, Booking, etc.)
- Template-specific user flows (questions, booking slots, etc.)
- Template-specific notifications (owner alerts, user confirmations)

**Clear Boundary:**
```
Runtime (webhook/, bot/, customer/, analytics/)
  ↓ calls
Templates (templates/lead-funnel/, templates/booking/)
  ↓ uses
Runtime (customer/, analytics/)
```

### 2.2 Runtime Invariants

**Invariant 2.1: Core Platform Must Remain Template-Neutral**
- CustomerService has ZERO references to "lead-funnel", "booking", "shop"
- AnalyticsService has ZERO template-specific event names
- BotService has ZERO template-specific logic
- Violation: Platform becomes funnel-centric

**Invariant 2.2: Runtime Orchestration Must Not Leak into Mini App**
- Mini App endpoints are READ-ONLY
- Mini App does NOT trigger business logic
- Mini App does NOT process webhooks
- Mini App does NOT modify customer state directly
- Violation: Runtime/Operational separation broken

**Invariant 2.3: Templates Own Business Execution**
- TemplateService contains all business logic
- TemplateHandler is THIN dispatcher
- Platform does NOT contain business logic
- Violation: Platform becomes template-specific

### 2.3 Explicitly Forbidden

**Runtime Layer Must NOT:**
- Import miniapp/ or ownership/ modules
- Contain template-specific event names
- Assume funnel metaphor
- Hardcode template UI in controllers
- Access OwnerModuleRegistry
- Know about template metadata

**Templates Must NOT:**
- Import miniapp/ or ownership/ modules
- Access other templates
- Modify core platform code
- Assume other templates exist
- Hardcode ownerChatId in service (use botConfig)
- Bypass CustomerService for customer creation

**Platform Must NOT:**
- Contain business logic in controllers
- Access repositories directly from controllers
- Skip transaction safety for multi-step operations
- Fire-and-forget webhook processing
- Allow public endpoints without ownership verification

---

## SECTION 3 — OPERATIONAL PHILOSOPHY

### 3.1 Mini App Philosophy

**Mini App IS:**
- Operational visibility layer (dashboards, analytics, lists)
- Operational management layer (settings, configurations)
- Compositional UI layer (widgets, navigation from metadata)
- READ-ONLY view of runtime data

**Mini App is NOT:**
- Runtime orchestrator (webhook processing)
- Funnel engine (business logic execution)
- Business execution engine (lead creation, booking confirmation)
- Template-specific frontend (hardcoded "/leads" routes)
- Source of truth (database is source of truth)

### 3.2 Operational UI Invariants

**Invariant 3.1: Operational UI Must Remain Generic**
- Dashboard shows "Interactions", NOT "Leads"
- Metrics are template-agnostic (customers, events)
- Template-specific widgets from OwnerModuleRegistry
- No hardcoded widget types
- Violation: Platform becomes lead-funnel builder

**Invariant 3.2: Metadata Drives Rendering**
```typescript
// ✅ CORRECT — metadata-driven
const module = getOwnerModule(template);
widgets = module.widgets.map(w => this.renderWidget(w));

// ❌ WRONG — hardcoded
if (template === 'lead-funnel') {
  widgets = [this.renderLeadsWidget()];
}
```

**Invariant 3.3: Frontend Must Not Branch on Templates**
- Frontend does NOT contain `if (template === 'lead-funnel')`
- Frontend does NOT contain template-specific routes
- Frontend renders generic structure, metadata fills details
- Violation: Frontend becomes template-specific

**Invariant 3.4: Frontend Must Not Contain Business Logic**
- Frontend does NOT create leads
- Frontend does NOT update customer status
- Frontend does NOT process webhooks
- Frontend is READ-ONLY operational view
- Violation: Runtime/Operational separation broken

### 3.3 Operational Layer Boundaries

**Operational Layer MAY:**
- Read from Customer entity
- Read from AnalyticsEvent entity
- Read from Bot entity
- Read from Owner entity
- Compose views from metadata
- Verify ownership

**Operational Layer Must NOT:**
- Write to Customer entity (use runtime services)
- Process webhooks
- Execute template business logic
- Access template-specific repositories directly
- Modify bot state without going through runtime

---

## SECTION 4 — METADATA PHILOSOPHY

### 4.1 Metadata Purpose

**Metadata IS:**
- OwnerModuleRegistry = template capability registry
- Navigation items = template operational sections
- Settings schemas = template configuration contracts
- Widget definitions = template operational views

**Metadata is NOT:**
- A goal by itself
- Universal no-code engine
- Recursive schema system
- Framework-building tool
- "Metadata-driven everything"

### 4.2 Core Rule: Abstract Only Proven Repetition

**THE GOLDEN RULE:**
> "Do NOT abstract until you have PROVEN repetition.  
>  Abstraction before repetition is framework-building, NOT platform development."

**Application:**
- ✅ Abstract Customer after seeing multiple templates need universal customer
- ✅ Abstract Analytics after seeing multiple templates need event tracking
- ❌ Abstract "Universal Workflow Engine" because "it might be useful"
- ❌ Abstract "Generic Form Builder" before building 3+ form templates
- ❌ Abstract "Plugin System" before having 5+ real templates

**Proof of Repetition Requires:**
- At least 3 real templates with same pattern
- Manual implementation in all 3 templates
- Clear duplication that abstraction would eliminate
- Abstraction that does NOT introduce complexity

### 4.3 Explicitly Forbidden

**Never Implement:**
- Premature generic systems ("Universal Builder")
- Recursive schema engines ("Schema-of-schema")
- Universal no-code abstractions ("Drag-and-drop everything")
- Framework-building behavior ("Let's build a platform for platforms")
- "Metadata-driven everything" (metadata is tool, NOT goal)
- Abstract before repetition (see Golden Rule above)

**Dangerous Patterns:**
```typescript
// ❌ FORBIDDEN — premature abstraction
interface UniversalTemplate<T> {
  execute(context: T): Promise<void>;
  getConfigSchema(): JSONSchema;
  getCapabilities(): Capability[];
}

// ✅ CORRECT — simple, proven
interface TemplateService {
  handleStart(context: TemplateContext): Promise<void>;
  handleCallback?(context: TemplateContext, data: string): Promise<void>;
}
```

```typescript
// ❌ FORBIDDEN — recursive schema engine
class SchemaEngine {
  generateSchema<T>(): JSONSchema { /* recursive magic */ }
}

// ✅ CORRECT — explicit JSON schema
export const leadFunnelConfigSchema = {
  type: 'object',
  properties: {
    businessName: { type: 'string' },
    questions: { type: 'array' },
  },
};
```

### 4.4 Metadata Boundaries

**Metadata SHOULD:**
- Be explicit and readable
- Serve operational UI composition
- Define clear contracts
- Evolve gradually

**Metadata Must NOT:**
- Become complex recursive structures
- Require schema-of-schema validation
- Drive business logic execution
- Replace code with configuration for everything

---

## SECTION 5 — EXTENSIBILITY PHILOSOPHY

### 5.1 Current State: Modular Monolith

**Platform IS:**
- Single codebase, single deployment
- Templates are code modules (src/templates/xxx/)
- Registration is manual (TemplateFactory constructor)
- No runtime plugin loading
- No npm package scanning

**Platform is NOT:**
- Plugin runtime system
- Dynamic module loader
- Sandboxed execution environment
- npm ecosystem platform
- Multi-process architecture

### 5.2 Current SDK Meaning

**SDK Currently Means:**
- Contracts (TemplateService interface)
- Interfaces (TemplateContext, TemplateHandler)
- Metadata conventions (OwnerModuleDefinition)
- Lifecycle contracts (handleStart, handleCallback)

**SDK Does NOT Mean:**
- Dynamic runtime loading
- Sandboxed plugins
- npm runtime ecosystems
- External execution systems
- Third-party runtime deployment

### 5.3 Future Direction (Postponed)

**Intentionally Postponed:**
- Plugin runtime (dynamic template loading)
- Sandboxed execution (isolated template processes)
- npm package scanning (auto-discovery)
- Third-party template marketplace (runtime deployment)
- SDK for external developers

**Why Postponed:**
- Adds complexity without immediate benefit
- Current scale: 3-5 templates (code changes acceptable)
- Plugin system requires mature contracts (not yet)
- Sandboxing requires security review (not ready)
- Marketplace requires billing integration (not yet)

**When to Revisit:**
- When we have 10+ real templates
- When templates are from different teams/companies
- When manual registration becomes painful
- When contracts are stable (no breaking changes)

### 5.4 Explicitly Forbidden

**Never Implement Prematurely:**
- Dynamic template loading (require restart for new templates)
- Sandboxed execution (no VM isolation)
- npm package scanning (no auto-discovery)
- Third-party plugin runtime (no external deployment)
- SDK for external developers (no public API yet)

---

## SECTION 6 — CAPABILITY PHILOSOPHY

### 6.1 Capability Definition

**Capabilities ARE:**
- Operational behavior exposure (what owner can do)
- Metadata contracts (what template exposes)
- Quota boundaries (what plan allows)
- Settings composition points (what can be configured)

**Capabilities are NOT:**
- Feature flags (on/off toggles)
- Arbitrary permissions (admin/user roles)
- Business logic triggers (execute action)
- Universal capability system (yet)

### 6.2 Current Capability System

**Billing Quotas:**
```typescript
interface PlanLimits {
  maxBots: number;                    // Bot quota
  maxInteractionsPerMonth: number;    // Generic interaction quota
  maxFlows: number;                   // Generic flow quota
  allowedTemplates: string[];         // Template access
  analyticsEnabled: boolean;          // Feature flag
  customBranding: boolean;            // Feature flag
  prioritySupport: boolean;           // Feature flag
}
```

**Capabilities Exposed:**
- Bot management (create, delete, configure)
- Customer viewing (list, search, filter)
- Analytics viewing (events, trends, breakdowns)
- Settings management (template-specific configs)

**Capabilities NOT Exposed (Yet):**
- Template creation (admin-only)
- Webhook configuration (platform-managed)
- Billing management (Stripe integration future)
- Team management (multi-user future)

### 6.3 Capability Invariants

**Invariant 6.1: Capabilities Must Not Become Feature Flags**
- Capabilities expose operational behavior
- Capabilities do NOT toggle business logic
- Capabilities do NOT enable/disable runtime features
- Violation: Platform becomes feature-flag mess

**Invariant 6.2: Capabilities Must Not Become Arbitrary Permissions**
- Capabilities are about QUOTAS and EXPOSURE
- Capabilities are NOT about ROLES (admin/user)
- Capabilities are NOT about ACCESS CONTROL (yet)
- Violation: Capability system becomes RBAC mess

**Invariant 6.3: Capabilities Must Remain Template-Agnostic**
- maxInteractionsPerMonth (NOT maxLeadsPerMonth)
- maxFlows (NOT maxFunnels)
- allowedTemplates (NOT allowedFunnels)
- Violation: Platform becomes funnel-centric

---

## SECTION 7 — SEQUENCING LAWS

### 7.1 Evolution Order (MANDATORY)

**Current Sequence:**

**Phase 1: Contract Stabilization** ✅ COMPLETE
- Universal Customer entity
- Generic Analytics events
- OwnerModuleRegistry metadata
- Ownership verification
- Webhook reliability
- Scalability fixes

**Phase 2: Generic Operational Rendering** ✅ IN PROGRESS
- Dashboard shows "Interactions" (not "Leads")
- Navigation composed from metadata
- Widgets defined by capability contracts
- Settings driven by JSON schemas

**Phase 3: Booking Validation** NEXT
- Build booking template
- Validate generic events work (session, conversion)
- Validate capability system works (interactions, flows)
- Validate metadata-driven UI works

**Phase 4: Capability System** AFTER Booking
- Formalize capability contracts
- Expose operational behaviors via metadata
- Integrate with billing quotas
- Settings composition

**Phase 5: SDK Contracts** AFTER Capability System
- Formalize TemplateService interface
- Document metadata conventions
- Define lifecycle contracts
- Prepare for future plugin system

**Phase 6: Ecosystem Expansion** AFTER SDK Contracts
- Third-party templates (manual review)
- Template marketplace (future)
- Plugin runtime (future, if needed)
- External integrations

### 7.2 Why Sequence Matters

**If Phase 3 (Booking) happens BEFORE Phase 2 (Generic Rendering):**
- Booking template uses funnel-specific events
- Dashboard shows "Leads" for booking bot
- Platform becomes funnel-centric
- Architectural drift begins

**If Phase 5 (SDK) happens BEFORE Phase 4 (Capability System):**
- SDK exposes unstable contracts
- Breaking changes required
- Third-party templates break
- Trust lost

**If Phase 6 (Ecosystem) happens BEFORE Phase 5 (SDK):**
- Third-party developers have no contracts
- Templates break with every platform change
- Maintenance nightmare
- Platform reputation damaged

### 7.3 Explicitly Forbidden Sequence

**Never Do:**
- Add features before contract stabilization
- Build plugin system before SDK contracts
- Add third-party templates before formal SDK
- Create abstractions before proven repetition
- Add microservices before monolith scaling limits
- Add external analytics before PostgreSQL limits

---

## SECTION 8 — FORBIDDEN DIRECTIONS

### 8.1 Explicit Anti-Patterns

**Template-Aware Frontend Branching:**
```typescript
// ❌ FORBIDDEN
if (template === 'lead-funnel') {
  renderLeadsWidget();
} else if (template === 'booking') {
  renderBookingsWidget();
}

// ✅ CORRECT
const module = getOwnerModule(template);
renderWidgets(module.widgets);
```

**Funnel-Centric Semantics:**
```typescript
// ❌ FORBIDDEN
await analytics.track('funnel:started');
await analytics.track('funnel:completed');
interface PlanLimits { maxLeadsPerMonth: number; }

// ✅ CORRECT
await analytics.track('session:started', { flowType: 'funnel' });
await analytics.track('conversion:achieved', { conversionType: 'lead' });
interface PlanLimits { maxInteractionsPerMonth: number; }
```

**Feature-First Development:**
```typescript
// ❌ FORBIDDEN
// "Let's add team management because it might be useful"
// "Let's add webhooks because other platforms have them"
// "Let's add AI because AI is hot"

// ✅ CORRECT
// "Booking template requires slot management"
// "Three templates need customer viewing"
// "Five templates need analytics"
```

**Plugin Runtime Overengineering:**
```typescript
// ❌ FORBIDDEN
class PluginRuntime {
  loadTemplate(packageName: string): Promise<Template>;
  sandboxExecution(template: Template): ExecutionContext;
  validateSecurity(template: Template): boolean;
}

// ✅ CORRECT (for now)
class TemplateFactory {
  private handlers = new Map<string, TemplateHandler>();
  // Manual registration in constructor
}
```

**Runtime Leakage into Operations:**
```typescript
// ❌ FORBIDDEN
// In MiniApp controller
@Get('process-webhook')
async processWebhook(@Body() update) {
  await this.webhookService.processUpdate(...);  // Runtime logic!
}

// ✅ CORRECT
// MiniApp is READ-ONLY
@Get('analytics')
async getAnalytics(@Param('botId') botId) {
  return this.analyticsService.getBotStats(botId);  // Read-only
}
```

**Operational Leakage into Runtime:**
```typescript
// ❌ FORBIDDEN
// In WebhookService
async processUpdate() {
  const dashboard = this.dashboardService.composeView();  // Operational!
}

// ✅ CORRECT
// Runtime and Operational separated
// WebhookService NEVER imports MiniApp services
```

**Cross-Template Coupling:**
```typescript
// ❌ FORBIDDEN
// In LeadFunnelService
import { BookingService } from '../booking/booking.service';
async handleContact() {
  await this.bookingService.createBooking(...);  // Cross-template!
}

// ✅ CORRECT
// Templates are isolated
// LeadFunnelService has NO knowledge of BookingService
```

**Controller Business Logic:**
```typescript
// ❌ FORBIDDEN
@Post('convert')
async convertCustomer(@Body() dto) {
  const customer = await this.customerRepository.findOne(...);
  customer.status = 'converted';
  await this.customerRepository.save(customer);
  await this.analyticsService.trackEvent(...);
  await this.telegramService.sendMessage(...);
}

// ✅ CORRECT
@Post('convert')
async convertCustomer(@Body() dto) {
  await this.customerService.updateStatus(dto.botId, dto.userId, 'converted');
}
```

**Direct Repository Access from Controllers:**
```typescript
// ❌ FORBIDDEN
@Get('customers')
async getCustomers(@Param('botId') botId) {
  return this.customerRepository.find({ where: { botId } });
}

// ✅ CORRECT
@Get('customers')
async getCustomers(@Param('botId') botId) {
  return this.customerService.getBotCustomers(botId, 1, 20);
}
```

**Generic Abstraction Without Proven Repetition:**
```typescript
// ❌ FORBIDDEN
// Before building 3+ templates
interface UniversalWorkflow<T> {
  execute(data: T): Promise<WorkflowResult>;
}

// ✅ CORRECT
// After building 3+ templates with same pattern
// THEN abstract
```

**Universal No-Code Ambitions:**
```typescript
// ❌ FORBIDDEN
class NoCodeBuilder {
  createWorkflow(): WorkflowBuilder;
  createForm(): FormBuilder;
  createAutomation(): AutomationBuilder;
}

// ✅ CORRECT
// Templates are code modules
// Metadata drives operational UI only
// Business logic is code
```

**Accidental Framework Creation:**
```typescript
// ❌ FORBIDDEN
// "Let's build a platform for building platforms"
// "Let's create a universal system for all chatbot use cases"
// "Let's make it configurable for ANY use case"

// ✅ CORRECT
// "Let's solve Telegram bot operations for businesses"
// "Let's support lead-funnel, booking, AI assistant"
// "Let's make it extensible for future templates"
```

### 8.2 Forbidden Questions

**Never Ask:**
- "What if we need X in the future?" (solve for NOW)
- "How do we make this configurable for everything?" (too early)
- "Can we support ANY template?" (support REAL templates)
- "What's the most generic solution?" (simplest working solution)
- "How do we build a framework?" (build a PLATFORM)

**Always Ask:**
- "What problem are we solving NOW?"
- "Do we have PROVEN repetition?"
- "Is this template-agnostic?"
- "Does this preserve runtime/operational separation?"
- "Does this strengthen platform universality?"

---

## SECTION 9 — LONG-TERM VISION

### 9.1 Intended Future State

**BotGrandFather Should Eventually Become:**

**Operational Platform for Telegram Business Systems:**
- Deploy and manage multiple Telegram bots
- Unified dashboard across all bots
- Analytics and customer management
- Settings and configuration management

**Extensible Template Ecosystem:**
- Lead-funnel template ✅
- Booking template (planned)
- AI assistant template (planned)
- Shop/e-commerce template (future)
- Support/ticketing template (future)
- Partner-created templates (future)

**Capability-Composed Operational Layer:**
- Customer viewing (universal)
- Analytics viewing (universal)
- Template-specific operational views (metadata-driven)
- Settings composition (JSON schemas)
- Quota management (capability-based)

**Reusable Runtime Infrastructure:**
- Webhook processing (idempotent, reliable)
- Customer lifecycle (universal)
- Analytics tracking (generic events)
- Transaction safety (multi-step operations)
- Data lifecycle (automatic cleanup)

**Operational Marketplace Foundation:**
- Template registry (metadata)
- Partner submissions (manual review)
- Template ratings/reviews (future)
- Billing integration (Stripe)
- Revenue sharing (future)

### 9.2 Never Become

**BotGrandFather Must NOT Become:**

**Bloated No-Code Framework:**
- Visual workflow builder
- Drag-and-drop form designer
- Universal automation engine
- "Build anything" platform
- Framework for frameworks

**Chaotic Plugin Platform:**
- Unvetted third-party plugins
- Security vulnerabilities
- Breaking changes from plugins
- No contract stability
- Runtime instability

**Frontend Spaghetti Architecture:**
- Template-specific routes hardcoded
- Business logic in frontend
- Frontend branches on templates
- No metadata-driven rendering
- UI tightly coupled to templates

**Feature-First Mess:**
- Features added because "they might be useful"
- No prioritization by real need
- Abstraction before repetition
- Complexity for complexity's sake
- Framework-building behavior

**Template-Centric Monolith:**
- Platform assumes funnel metaphor
- "Leads" hardcoded everywhere
- Booking feels like second-class citizen
- AI assistant requires platform changes
- New templates break contracts

---

## SECTION 10 — INVARIANT ENFORCEMENT

### 10.1 How Invariants Are Enforced

**Code Review:**
- All PRs reviewed against invariants
- Violations flagged immediately
- Architecture questions escalated

**Automated Checks:**
- TypeScript compilation (type safety)
- Linting (code style)
- Tests (behavior verification)
- TODO: Dependency graph validation (no circular imports)

**Documentation:**
- ARCHITECTURAL_INVARIANTS.md (this document)
- ARCHITECTURE_DECISIONS_LOG.md (decision history)
- BOTGRANDFATHER_PLATFORM_BLUEPRINT.md (full context)
- README.md (getting started)

**Culture:**
- "Abstract only proven repetition" mindset
- "Platform-first, not feature-first" thinking
- "Runtime/operational separation" discipline
- "Template-agnostic" commitment

### 10.2 Violation Response

**If Invariant Violated:**
1. STOP development
2. Document the violation
3. Assess impact (critical, high, medium, low)
4. Create fix plan
5. Implement fix
6. Add test/check to prevent recurrence
7. Update invariants if needed

**Critical Violations (Immediate Fix):**
- Runtime imports Mini App
- Frontend contains business logic
- Funnel-centric event names in core
- Public endpoints without ownership verification

**High Violations (Fix Within Sprint):**
- Template-specific UI in controllers
- Cross-template dependencies
- Controller business logic
- Direct repository access from controllers

**Medium Violations (Fix Within Month):**
- Abstraction before proven repetition
- Feature-first development
- Metadata complexity creep

**Low Violations (Monitor):**
- Code style inconsistencies
- Missing documentation
- Test coverage gaps

---

## SECTION 11 — FINAL REMINDERS

### 11.1 Core Truths

**BotGrandFather is a PLATFORM, NOT a FEATURE.**
- Platform serves many use cases
- Feature serves one use case
- Don't build features, build platform capabilities

**Simplicity beats cleverness.**
- Simple code is maintainable code
- Clever code is framework code
- We are building a platform, NOT a framework

**Repetition justifies abstraction.**
- One instance = implement
- Two instances = watch
- Three instances = abstract

**Runtime and Operational are SEPARATE.**
- Runtime: webhook processing, business logic
- Operational: dashboards, analytics, settings
- Runtime NEVER depends on Operational

**Templates are ISOLATED.**
- Templates cannot access other templates
- Templates cannot modify core platform
- Templates register metadata, NOT runtime code

### 11.2 When in Doubt

**Ask Yourself:**
1. "Does this strengthen platform universality?"
2. "Does this introduce template coupling?"
3. "Is abstraction justified by proven repetition?"
4. "Does this preserve runtime/operational separation?"
5. "Does this improve ecosystem extensibility?"
6. "Does this introduce accidental framework complexity?"
7. "Is this too early for current architecture maturity?"

**If Any Answer is NO:**
- STOP
- Reconsider approach
- Consult with platform maintainers
- Re-read this document

---

**END OF ARCHITECTURAL INVARIANTS**

**This document is LAW.  
Violations are NOT allowed.  
Questions are encouraged.  
Clarifications are welcome.  
Changes require platform maintainer approval.**
