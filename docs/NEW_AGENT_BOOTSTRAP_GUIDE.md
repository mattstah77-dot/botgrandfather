# BOTGRANDFATHER — NEW AGENT BOOTSTRAP GUIDE

**Version:** 1.0  
**Date:** 2026-05-11  
**Purpose:** Complete onboarding for AI agent with ZERO prior context  
**Audience:** New AI agent joining BotGrandFather development

---

## PREFACE — WELCOME TO BOTGRANDFATHER

You are about to join development of **BotGrandFather**, a universal Telegram bot operations platform.

**This guide assumes:**
- You have NEVER seen this project before
- You have ZERO historical context
- You need to understand what exists, what's stable, what's dangerous

**This guide will help you:**
- Understand architectural philosophy
- Avoid dangerous assumptions
- Prevent architectural drift
- Understand development sequencing
- Understand current maturity
- Know what must NEVER happen

**Warning:** This platform has specific architectural principles. Violating them causes drift. Read carefully.

---

## SECTION 1 — MANDATORY READING ORDER

### 1.1 EXACT Reading Sequence

**READ IN THIS ORDER — DO NOT SKIP:**

**Step 1: PROJECT_STATE_SNAPSHOT.md** (30 minutes)
- **Why FIRST:** Understand CURRENT REALITY, not aspiration
- **What you'll learn:** What exists, what's stable, what's postponed, what risks remain
- **Critical:** Distinguish between production-ready vs experimental systems

**Step 2: ARCHITECTURAL_INVARIANTS.md** (45 minutes)
- **Why SECOND:** Learn NON-NEGOTIABLE laws before writing code
- **What you'll learn:** What must NEVER happen, forbidden directions, anti-patterns
- **Critical:** These are LAW, not guidelines

**Step 3: ARCHITECTURE_DECISIONS_LOG.md** (30 minutes)
- **Why THIRD:** Understand WHY decisions were made
- **What you'll learn:** Decision history, rejected approaches, reasoning
- **Critical:** Prevents repeating historical mistakes

**Step 4: BOTGRANDFATHER_PLATFORM_BLUEPRINT.md** (60 minutes)
- **Why FOURTH:** Full system context after understanding rules and reality
- **What you'll learn:** Complete architecture, module responsibilities, flows
- **Critical:** Connects philosophy to implementation

**Step 5: STABILIZATION_SPRINT_REPORT.md** (20 minutes)
- **Why FIFTH:** Understand what was fixed in stabilization
- **What you'll learn:** Critical issues identified, fixes applied, audit results
- **Critical:** Know what nearly broke the platform

**Total Time:** ~3 hours of reading before writing code

### 1.2 Why Order Matters

**Reading PROJECT_STATE_SNAPSHOT.md FIRST because:**
- You need to know current reality before philosophy
- You need to know what's stable vs experimental
- You need to know what's postponed vs required
- Prevents you from building postponed complexity

**Reading ARCHITECTURAL_INVARIANTS.md SECOND because:**
- You need to know non-negotiable rules before design
- You need to know forbidden directions
- You need to know anti-patterns
- Prevents you from violating architectural law

**Reading ARCHITECTURE_DECISIONS_LOG.md THIRD because:**
- You need to understand reasoning behind decisions
- You need to know rejected approaches
- You need to know historical mistakes
- Prevents you from repeating past errors

**Reading PLATFORM_BLUEPRINT.md FOURTH because:**
- You need full context after understanding rules
- You need to see how philosophy maps to code
- You need to understand module boundaries
- Prevents you from breaking module boundaries

**Reading STABILIZATION_REPORT.md FIFTH because:**
- You need to know what was nearly broken
- You need to know what was fixed
- You need to know what risks remain
- Prevents you from reintroducing fixed issues

### 1.3 What Happens If You Skip

**Skip PROJECT_STATE_SNAPSHOT.md:**
- You'll build postponed complexity (plugin system, external analytics)
- You'll misunderstand current maturity
- You'll think ecosystem is ready when it's not
- **Result:** Wasted effort on premature features

**Skip ARCHITECTURAL_INVARIANTS.md:**
- You'll violate non-negotiable laws
- You'll introduce template coupling
- You'll build forbidden abstractions
- **Result:** Architectural drift, platform identity loss

**Skip ARCHITECTURE_DECISIONS_LOG.md:**
- You'll repeat historical mistakes
- You'll question decisions that were already resolved
- You'll propose rejected approaches
- **Result:** Wasted time, frustration

**Skip PLATFORM_BLUEPRINT.md:**
- You'll break module boundaries
- You'll misunderstand responsibilities
- You'll write code in wrong layer
- **Result:** Architecture degradation

**Skip STABILIZATION_REPORT.md:**
- You'll reintroduce fixed issues
- You'll forget what nearly broke the platform
- You'll underestimate risks
- **Result:** Regression, security gaps

---

## SECTION 2 — WHAT NEW AGENTS USUALLY MISUNDERSTAND

### 2.1 Dangerous Misunderstandings (Common AI Mistakes)

**Misunderstanding 1: Platform is a Funnel Builder**
```
❌ WRONG: "BotGrandFather is a lead funnel builder with Mini App support"
✅ CORRECT: "BotGrandFather is a universal platform; lead-funnel is ONE template"
```
**Why Dangerous:** Platform becomes funnel-centric, booking feels like second-class citizen

**Misunderstanding 2: Metadata Should Drive Everything**
```
❌ WRONG: "Let's make all business logic configurable via metadata"
✅ CORRECT: "Metadata drives operational UI only; business logic stays in code"
```
**Why Dangerous:** Business logic hidden in JSON, debugging nightmare, complexity explosion

**Misunderstanding 3: Plugin Architecture Should Happen Now**
```
❌ WRONG: "We should build plugin runtime for dynamic template loading"
✅ CORRECT: "Manual registration is fine until 10+ templates"
```
**Why Dangerous:** Premature complexity, 6+ months of overengineering

**Misunderstanding 4: Capabilities Are Feature Flags**
```
❌ WRONG: "Capabilities are on/off toggles for features"
✅ CORRECT: "Capabilities expose operational behavior and quotas"
```
**Why Dangerous:** Capability system becomes feature-flag mess, not designed for toggles

**Misunderstanding 5: Frontend Should Contain Business Logic**
```
❌ WRONG: "Frontend should handle lead creation, booking confirmation"
✅ CORRECT: "Frontend is READ-ONLY operational view; mutations via runtime"
```
**Why Dangerous:** Runtime/Operational separation broken, frontend becomes spaghetti

**Misunderstanding 6: Abstraction Is Always Good**
```
❌ WRONG: "Let's abstract this pattern to be generic"
✅ CORRECT: "Abstract only after 3+ proven repetitions"
```
**Why Dangerous:** Framework-building behavior, complexity without benefit

**Misunderstanding 7: Generic Solutions Are Better**
```
❌ WRONG: "Let's build a universal workflow engine"
✅ CORRECT: "Let's solve the specific problem we have now"
```
**Why Dangerous:** Generic code is harder to maintain, specific code is clearer

**Misunderstanding 8: More Features = Better Platform**
```
❌ WRONG: "Let's add team management, webhooks, API keys"
✅ CORRECT: "Let's add features only when real need exists"
```
**Why Dangerous:** Feature bloat, platform loses focus, complexity explosion

**Misunderstanding 9: Template-Specific UI Is Acceptable**
```
❌ WRONG: "Dashboard can have 'Leads Widget' hardcoded"
✅ CORRECT: "Dashboard must be generic; template widgets from metadata"
```
**Why Dangerous:** Platform becomes "Lead Funnel Builder", not universal

**Misunderstanding 10: SDK Should Be Built Now**
```
❌ WRONG: "Let's create SDK for external developers"
✅ CORRECT: "SDK contracts not stable yet; wait until 3-5 templates"
```
**Why Dangerous:** Breaking changes, lost trust, maintenance nightmare

### 2.2 Why AI Agents Make These Mistakes

**AI Training Bias:**
- AI trained on "best practices" that favor abstraction
- AI trained on "scalable architecture" that favors microservices
- AI trained on "flexible systems" that favor metadata-driven everything
- **Result:** AI defaults to overengineering

**Lack of Context:**
- AI doesn't know "this was already decided"
- AI doesn't know "this nearly broke the platform"
- AI doesn't know "this is premature"
- **Result:** AI proposes rejected approaches

**Optimization for Complexity:**
- AI optimizes for "complete solution"
- AI doesn't understand "simplify, don't abstract"
- AI doesn't understand "wait for repetition"
- **Result:** AI builds framework, not platform

### 2.3 How to Avoid These Mistakes

**Before Writing Code:**
1. Ask: "Is this solving a REAL problem or hypothetical one?"
2. Ask: "Do I have PROVEN repetition or just one instance?"
3. Ask: "Am I building platform capability or framework complexity?"
4. Ask: "Does this strengthen universality or introduce coupling?"
5. Ask: "Is this too early for current maturity?"

**When Unsure:**
- STOP
- Re-read ARCHITECTURAL_INVARIANTS.md
- Check PROJECT_STATE_SNAPSHOT.md for current maturity
- Ask for architectural clarification

---

## SECTION 3 — MANDATORY SELF-CHECK BEFORE ANY FEATURE

### 3.1 The 7-Question Gate

**BEFORE implementing ANY new feature, answer ALL 7 questions:**

**Question 1: Does this preserve universality?**
- ✅ Yes: Adding "Interactions" metric (works for all templates)
- ❌ No: Adding "Leads" metric (only for lead-funnel)
- ❓ Unclear: Reconsider, consult maintainers

**Question 2: Does this introduce template coupling?**
- ✅ No: CustomerService has ZERO references to templates
- ❌ Yes: CustomerService imports LeadFunnelService
- ❓ Unclear: Refactor to remove coupling

**Question 3: Is abstraction justified by proven repetition?**
- ✅ Yes: 3+ templates need same pattern → abstract
- ❌ No: 1-2 templates need pattern → implement manually
- ❓ Unclear: Build manually, watch for repetition

**Question 4: Is this solving real repetition or hypothetical?**
- ✅ Real: Building booking template, see same pattern as lead-funnel
- ❌ Hypothetical: "What if we need 10 templates?" (we have 1)
- ❓ Unclear: Build for current need, not future fantasy

**Question 5: Is this too early for current architecture maturity?**
- ✅ No: Solves immediate need (booking template)
- ❌ Yes: "Let's build plugin system" (10+ templates needed)
- ❓ Unclear: Wait, build simpler solution first

**Question 6: Does this create accidental framework complexity?**
- ✅ No: Simple, explicit contracts
- ❌ Yes: Recursive schema engines, universal builders
- ❓ Unclear: Simplify, remove abstraction

**Question 7: Does this preserve runtime/operational separation?**
- ✅ Yes: Runtime does NOT import Mini App
- ❌ No: WebhookService imports DashboardService
- ❓ Unclear: Refactor to break dependency

### 3.2 If ANY Answer is ❌ or ❓

**STOP immediately.**

**Do NOT proceed with implementation.**

**Instead:**
1. Document your reasoning
2. Re-read ARCHITECTURAL_INVARIANTS.md
3. Check PROJECT_STATE_SNAPSHOT.md for maturity
4. Request architectural clarification
5. Reconsider approach

### 3.3 Example: Good vs Bad Feature Requests

**Example 1: Adding Booking Template**
- Q1 (Universality): ✅ Yes, booking uses generic Customer, Analytics
- Q2 (Template Coupling): ✅ No, BookingService isolated
- Q3 (Abstraction): ✅ N/A, not abstracting, just implementing
- Q4 (Real Repetition): ✅ Yes, validating generic patterns
- Q5 (Too Early): ✅ No, this is immediate priority
- Q6 (Framework Complexity): ✅ No, simple template implementation
- Q7 (Runtime/Operational): ✅ Yes, follows same pattern as lead-funnel
- **Verdict:** ✅ SAFE TO PROCEED

**Example 2: Building Plugin Runtime**
- Q1 (Universality): ❓ Unclear, doesn't strengthen universality
- Q2 (Template Coupling): ❓ Unclear, may introduce coupling
- Q3 (Abstraction): ❌ No, we have 1 template, not 10+
- Q4 (Real Repetition): ❌ No, manual registration fine
- Q5 (Too Early): ❌ YES, premature complexity
- Q6 (Framework Complexity): ❌ YES, adds massive complexity
- Q7 (Runtime/Operational): ❓ Unclear, may blur boundaries
- **Verdict:** ❌ DO NOT PROCEED

**Example 3: Adding "Leads Widget" to Dashboard**
- Q1 (Universality): ❌ NO, leads is funnel-specific
- Q2 (Template Coupling): ❌ YES, dashboard becomes lead-funnel aware
- Q3 (Abstraction): ❌ NO, not abstracting, hardcoding
- Q4 (Real Repetition): ❌ NO, one template doesn't justify hardcoding
- Q5 (Too Early): ❌ YES, should use generic "Interactions"
- Q6 (Framework Complexity): ⚠️ MEDIUM, adds template-specific code
- Q7 (Runtime/Operational): ✅ Yes, still operational
- **Verdict:** ❌ DO NOT PROCEED (use generic widgets + metadata)

---

## SECTION 4 — CURRENT DEVELOPMENT STAGE

### 4.1 What Stage Platform Is In

**Current Stage: Operational Foundation Stabilization**

**What This Means:**
- Core architecture is stable (runtime/operational separation, Customer, Ownership)
- Stabilization fixes applied (N+1, memory safety, webhooks, transactions)
- 1 template implemented (lead-funnel)
- Generic patterns proven (events, analytics, billing)
- **NOT** ecosystem-ready (no plugin system, no SDK)
- **NOT** marketplace-ready (no third-party support)

**Current Focus:**
- ✅ Validating generic patterns with booking template
- ✅ Refining operational rendering (dashboard, navigation)
- ✅ Letting capabilities emerge from repetition
- ✅ Preparing for frontend development

**NOT Current Focus:**
- ❌ Plugin runtime system
- ❌ SDK for external developers
- ❌ Template marketplace
- ❌ External analytics DB
- ❌ Queue system
- ❌ Microservices

### 4.2 Current Maturity Level

**Production-Ready For:**
- ✅ 100+ owners
- ✅ 1000+ bots
- ✅ 1M+ events/month (PostgreSQL)
- ✅ Booking template deployment
- ✅ AI assistant template deployment
- ✅ Frontend Mini App development
- ✅ Production deployment (security hardened)

**NOT Production-Ready For:**
- ❌ 10,000+ owners (need rate limiting)
- ❌ 10M+ events/month (need ClickHouse)
- ❌ High-traffic webhooks (> 100/sec, need queue)
- ❌ External developers (SDK not stable)
- ❌ Third-party templates (plugin runtime not ready)
- ❌ Template marketplace (infrastructure not ready)

### 4.3 What "Stabilization" Means

**Stabilization Completed:**
- ✅ Security: Ownership verification everywhere
- ✅ Scalability: N+1 queries fixed, memory safety
- ✅ Reliability: Awaited webhooks, transactions
- ✅ Data Lifecycle: Automatic cleanup jobs
- ✅ Architecture: Generic events, capability-based billing

**Stabilization Ongoing:**
- ⚠️ Generic operational rendering (dashboard widgets)
- ⚠️ Booking template (validating patterns)
- ⚠️ Capability system (emerging from repetition)

**Post-Stabilization (Future):**
- ❌ Plugin system (after 10+ templates)
- ❌ SDK formalization (after contracts stable)
- ❌ Ecosystem expansion (after SDK)

---

## SECTION 5 — HOW TO EVALUATE NEW IDEAS

### 5.1 Good Ideas (Encouraged)

**Characteristics of GOOD ideas:**
1. **Emerge from repetition** — 3+ templates need same pattern
2. **Reduce proven duplication** — Actually eliminates code duplication
3. **Strengthen universality** — Makes platform more template-agnostic
4. **Preserve operational composition** — Doesn't break runtime/operational separation
5. **Solve immediate problems** — Addresses current need, not hypothetical future

**Examples of GOOD ideas:**
- ✅ "Booking template uses same Customer pattern as lead-funnel" → Confirms universality
- ✅ "Dashboard shows 'Interactions' not 'Leads'" → Generic operational UI
- ✅ "Template registers metadata for navigation" → Metadata-driven composition
- ✅ "Capability system emerges from 2+ templates" → Natural abstraction
- ✅ "Frontend renders from metadata" → Operational composition

**Why These Are Good:**
- Solve real problems
- Strengthen platform
- Preserve architecture
- Emergent, not imposed

### 5.2 Bad Ideas (Discouraged)

**Characteristics of BAD ideas:**
1. **Invent abstractions early** — Abstract before 3+ repetitions
2. **Create DSLs prematurely** — Domain-specific languages before need
3. **Introduce universal builders** — "Build anything" systems
4. **Over-generalize workflows** — Generic workflow engine too early
5. **Introduce recursive metadata systems** — Schema-of-schema complexity

**Examples of BAD ideas:**
- ❌ "Let's build plugin runtime now" (we have 1 template)
- ❌ "Let's create universal workflow engine" (no proven repetition)
- ❌ "Let's make all business logic configurable" (metadata obsession)
- ❌ "Let's build visual form builder" (no 3+ form templates)
- ❌ "Let's create SDK for external developers" (contracts not stable)

**Why These Are Bad:**
- Solve hypothetical problems
- Add complexity without benefit
- Risk architectural drift
- Framework-building behavior

### 5.3 Evaluation Framework

**For any new idea, ask:**

**1. What problem does this solve?**
- Real problem (current pain) → ✅ Good
- Hypothetical problem (might be useful) → ❌ Bad

**2. How many templates need this?**
- 3+ templates with same pattern → ✅ Good (abstract)
- 1-2 templates → ❌ Bad (implement manually)

**3. Does this strengthen or weaken universality?**
- Strengthens (more template-agnostic) → ✅ Good
- Weakens (more template-specific) → ❌ Bad

**4. Does this add complexity?**
- Reduces complexity (DRY) → ✅ Good
- Adds complexity (framework) → ❌ Bad

**5. Is this too early?**
- Solves immediate need → ✅ Good
- Solves future fantasy → ❌ Bad

**6. Does this preserve boundaries?**
- Preserves runtime/operational → ✅ Good
- Breaks boundaries → ❌ Bad

---

## SECTION 6 — CRITICAL VOCABULARY

### 6.1 Mandatory Terminology (Use Precisely)

**Runtime:**
- **Definition:** Layer that processes Telegram webhooks, executes templates, manages customer lifecycle
- **Components:** webhook/, templates/, customer/, analytics/, bot/
- **Key Property:** Runtime NEVER imports Mini App (operational layer)
- **Example:** "WebhookService is runtime; it dispatches to TemplateService"

**Operational Layer:**
- **Definition:** Layer that provides owner-facing dashboards, analytics views, settings management
- **Components:** miniapp/, owner-modules/, ownership/, lifecycle/
- **Key Property:** READ-ONLY view of runtime data; no business logic
- **Example:** "DashboardService is operational; it reads from CustomerService"

**Template:**
- **Definition:** Isolated business logic module (lead-funnel, booking, AI assistant)
- **Components:** src/templates/xxx/
- **Key Property:** Templates cannot access other templates; templates register metadata
- **Example:** "LeadFunnelService is a template; it implements TemplateService"

**Capability:**
- **Definition:** Operational behavior exposure (what owner can do, what quotas exist)
- **Components:** billing/plan-limits.ts, owner-modules/
- **Key Property:** Capabilities are NOT feature flags; they expose behavior
- **Example:** "maxInteractionsPerMonth is a capability; it exposes quota"

**Interaction:**
- **Definition:** Generic user engagement (lead submission, booking creation, order placement)
- **Usage:** "Interactions" metric in dashboard (not "Leads")
- **Key Property:** Template-agnostic term
- **Example:** "Customer submitted contact → interaction counted"

**Session:**
- **Definition:** Generic user flow (funnel completion, booking flow, AI conversation)
- **Events:** session:started, session:completed, session:abandoned
- **Key Property:** Generic term (not "funnel")
- **Example:** "User started booking flow → session:started"

**Flow:**
- **Definition:** Generic user journey (funnel, booking flow, AI assistant conversation)
- **Usage:** "maxFlows" quota in billing
- **Key Property:** Template-agnostic term (not "funnels")
- **Example:** "Booking template has booking flow"

**Owner Module:**
- **Definition:** Metadata registration for template operational capabilities
- **Components:** owner-modules/owner-module.registry.ts
- **Key Property:** Navigation, settings, widgets defined here
- **Example:** "Lead-funnel registers navigation item in OwnerModuleRegistry"

**Operational Composition:**
- **Definition:** Dynamic assembly of dashboard, navigation, widgets from metadata
- **Components:** NavigationService, OwnerViewService, DashboardService
- **Key Property:** No hardcoded routes or widgets
- **Example:** "NavigationService composes from OwnerModuleRegistry"

**Generic Rendering:**
- **Definition:** UI rendered from metadata, not hardcoded for specific templates
- **Components:** OwnerViewService, frontend (future)
- **Key Property:** Dashboard shows "Interactions" not "Leads"
- **Example:** "Dashboard renders widgets from metadata"

### 6.2 Vocabulary Violations (Forbidden Usage)

**❌ NEVER Say:**
- "Funnel builder" → ✅ Say "Universal platform with funnel template"
- "Leads metric" → ✅ Say "Interactions metric"
- "Funnels quota" → ✅ Say "Flows quota"
- "Template-specific dashboard" → ✅ Say "Generic dashboard with template widgets"
- "Feature flags" → ✅ Say "Capabilities"
- "Plugin system now" → ✅ Say "Manual registration until 10+ templates"
- "SDK for external developers now" → ✅ Say "SDK contracts not stable yet"

**❌ NEVER Write:**
```typescript
// Funnel-specific
await analytics.track('funnel:started');  // WRONG
```
**✅ DO Write:**
```typescript
// Generic
await analytics.track('session:started', { template: 'lead-funnel' });  // CORRECT
```

**❌ NEVER Write:**
```typescript
// Hardcoded widget
composeDashboard() {
  return { widget: 'Leads Widget' };  // WRONG
}
```
**✅ DO Write:**
```typescript
// Generic composition
composeDashboard(template: string) {
  const module = getOwnerModule(template);
  return { widgets: module.widgets.map(w => this.renderWidget(w)) };  // CORRECT
}
```

### 6.3 Why Vocabulary Matters

**Consistent vocabulary:**
- Prevents misunderstandings
- Enforces architectural principles
- Signals correct thinking
- Prevents drift

**Inconsistent vocabulary:**
- Signals wrong mental model
- Leads to wrong decisions
- Introduces drift
- Breaks architecture

**If you catch yourself using forbidden terms:**
- STOP
- Re-read ARCHITECTURAL_INVARIANTS.md
- Correct your mental model
- Continue with correct terminology

---

## SECTION 7 — ARCHITECTURAL RED FLAGS

### 7.1 Signs of Dangerous Drift

**Red Flag 1: "Universal Workflow Engine"**
```
🚩 "Let's build a universal workflow engine for all templates"
```
**Why Dangerous:**
- Premature abstraction (no 3+ workflow templates)
- Adds massive complexity
- Platform becomes workflow framework, not bot platform
- **Action:** STOP, propose manual implementation

**Red Flag 2: "Dynamic Schema Runtime"**
```
🚩 "Let's create a runtime that executes dynamic JSON schemas"
```
**Why Dangerous:**
- Metadata obsession
- Business logic hidden in JSON
- Debugging nightmare
- **Action:** STOP, keep logic in code

**Red Flag 3: "Plugin Marketplace Now"**
```
🚩 "Let's build a marketplace for third-party templates"
```
**Why Dangerous:**
- We have 1 template, not 10+
- SDK contracts not stable
- Premature ecosystem complexity
- **Action:** STOP, manual registration fine

**Red Flag 4: "Generic Everything"**
```
🚩 "Let's make everything generic for any use case"
```
**Why Dangerous:**
- Framework-building behavior
- Generic code is harder to maintain
- Solves hypothetical problems
- **Action:** STOP, solve current problem

**Red Flag 5: "Template-Aware Frontend"**
```
🚩 "Frontend should have different views for different templates"
```
**Why Dangerous:**
- Frontend becomes template-specific
- Platform loses universality
- Hardcoded routes, widgets
- **Action:** STOP, frontend renders metadata

**Red Flag 6: "Metadata-Driven Runtime Orchestration"**
```
🚩 "Let's orchestrate template execution via metadata"
```
**Why Dangerous:**
- Runtime logic in metadata
- Business logic hidden in JSON
- Runtime becomes complex
- **Action:** STOP, runtime in code, metadata for UI only

**Red Flag 7: "Feature-First Development"**
```
🚩 "Let's add team management because it might be useful"
```
**Why Dangerous:**
- Solves hypothetical problem
- Feature bloat
- Platform loses focus
- **Action:** STOP, wait for real need

**Red Flag 8: "Abstraction-First Thinking"**
```
🚩 "Let's abstract this pattern before building more templates"
```
**Why Dangerous:**
- Abstraction before repetition
- Premature complexity
- Framework-building
- **Action:** STOP, wait for 3+ repetitions

**Red Flag 9: "SDK Now"**
```
🚩 "Let's create SDK for external developers"
```
**Why Dangerous:**
- Contracts not stable
- Breaking changes likely
- Maintenance nightmare
- **Action:** STOP, wait until 3-5 internal templates

**Red Flag 10: "No-Code Ambitions"**
```
🚩 "Let's build a no-code builder for citizen developers"
```
**Why Dangerous:**
- Wrong target audience
- Massive complexity
- Framework territory
- **Action:** STOP, platform is for developers

### 7.2 What To Do When You See Red Flags

**If you notice any red flag:**
1. **STOP** immediately
2. **Document** the red flag
3. **Ask:** "Am I solving a real problem or hypothetical?"
4. **Ask:** "Do I have proven repetition?"
5. **Ask:** "Is this too early?"
6. **Consult** ARCHITECTURAL_INVARIANTS.md
7. **Request** architectural clarification

**If someone else proposes red-flag idea:**
1. **Flag it** politely
2. **Explain** why it's dangerous
3. **Reference** ARCHITECTURAL_INVARIANTS.md
4. **Propose** simpler alternative
5. **Escalate** if needed

### 7.3 Self-Monitoring

**Monitor your own thinking:**
- Catch yourself before writing "universal"
- Catch yourself before writing "plugin system"
- Catch yourself before writing "metadata-driven"
- Catch yourself before writing "generic workflow"

**If you catch yourself:**
- STOP
- Re-read ARCHITECTURAL_INVARIANTS.md Section 8 (Forbidden Directions)
- Re-evaluate approach
- Propose simpler solution

---

## SECTION 8 — CURRENT SAFE DIRECTION

### 8.1 What IS Safe to Work On Now

**✅ SAFE: Booking Template Validation**
- **Why:** Validates generic patterns (Customer, Analytics, events)
- **Goal:** Confirm booking fits universal model
- **Risk:** Low (follows established patterns)
- **Priority:** HIGH (immediate need)

**✅ SAFE: Operational Rendering Refinement**
- **Why:** Improves generic dashboard widgets
- **Goal:** Dashboard works for all templates
- **Risk:** Low (metadata-driven already proven)
- **Priority:** HIGH (current focus)

**✅ SAFE: Capability Emergence**
- **Why:** Let capabilities emerge from 2+ templates
- **Goal:** Natural abstraction from repetition
- **Risk:** Low (emergent, not imposed)
- **Priority:** MEDIUM (follows booking)

**✅ SAFE: Operational UI Refinement**
- **Why:** Improves navigation, settings, widgets
- **Goal:** Better owner experience
- **Risk:** Low (operational layer, no runtime impact)
- **Priority:** MEDIUM (frontend development)

**✅ SAFE: Dashboard Evolution**
- **Why:** Adds generic metrics, template-specific widgets via metadata
- **Goal:** More useful operational views
- **Risk:** Low (generic structure, metadata content)
- **Priority:** MEDIUM (continuous)

**✅ SAFE: Metadata Refinement Through Repetition**
- **Why:** OwnerModuleRegistry evolves as templates added
- **Goal:** Stable metadata contracts
- **Risk:** Low (iterative improvement)
- **Priority:** MEDIUM (continuous)

**✅ SAFE: Frontend API Development**
- **Why:** Backend APIs for React frontend
- **Goal:** Production-ready Mini App
- **Risk:** Low (operational layer)
- **Priority:** HIGH (enables frontend)

**✅ SAFE: Test Coverage Addition**
- **Why:** Critical paths need tests
- **Goal:** Regression safety
- **Risk:** Low (quality improvement)
- **Priority:** HIGH (technical debt)

### 8.2 What is NOT Safe to Work On Now

**❌ UNSAFE: Plugin Runtime System**
- **Why:** Premature (1 template, not 10+)
- **Risk:** HIGH (complexity explosion)
- **When:** After 10+ templates, SDK stable

**❌ UNSAFE: SDK for External Developers**
- **Why:** Contracts not stable
- **Risk:** HIGH (breaking changes)
- **When:** After 3-5 internal templates

**❌ UNSAFE: Template Marketplace**
- **Why:** No templates to sell, no SDK
- **Risk:** HIGH (infrastructure for nothing)
- **When:** After SDK, partner interest

**❌ UNSAFE: External Analytics DB**
- **Why:** PostgreSQL sufficient (< 1M events/day)
- **Risk:** MEDIUM (unnecessary complexity)
- **When:** After 1M+ events/day

**❌ UNSAFE: Queue System**
- **Why:** Direct processing sufficient
- **Risk:** MEDIUM (operational complexity)
- **When:** After > 100 webhooks/sec

**❌ UNSAFE: Microservices Extraction**
- **Why:** Modular monolith scales well
- **Risk:** HIGH (distributed system complexity)
- **When:** After team size grows, scaling limits

**❌ UNSAFE: Visual Workflow Builder**
- **Why:** No proven need
- **Risk:** HIGH (massive complexity)
- **When:** After 5+ templates with workflow patterns

**❌ UNSAFE: No-Code Form Builder**
- **Why:** Wrong target audience
- **Risk:** HIGH (framework territory)
- **When:** Never (platform is for developers)

### 8.3 Safe Development Checklist

**Before starting any task, verify:**
- ✅ Task is on "SAFE" list above
- ✅ Task solves real problem (not hypothetical)
- ✅ Task preserves universality
- ✅ Task doesn't introduce template coupling
- ✅ Task doesn't require premature abstraction
- ✅ Task fits current maturity stage
- ✅ Task doesn't violate invariants

**If task fails ANY check:**
- STOP
- Re-evaluate
- Consult maintainers
- Propose alternative

---

## SECTION 9 — QUICK REFERENCE

### 9.1 Document Hierarchy

```
ARCHITECTURAL_INVARIANTS.md       ← LAW (never violate)
ARCHITECTURE_DECISIONS_LOG.md     ← HISTORY (understand why)
BOTGRANDFATHER_PLATFORM_BLUEPRINT.md ← CONTEXT (full system)
PROJECT_STATE_SNAPSHOT.md         ← REALITY (current state)
NEW_AGENT_BOOTSTRAP_GUIDE.md      ← ONBOARDING (this document)
```

### 9.2 Reading Time Estimates

| Document | Time | Purpose |
|----------|------|---------|
| PROJECT_STATE_SNAPSHOT.md | 30 min | Current reality |
| ARCHITECTURAL_INVARIANTS.md | 45 min | Non-negotiable laws |
| ARCHITECTURE_DECISIONS_LOG.md | 30 min | Decision history |
| PLATFORM_BLUEPRINT.md | 60 min | Full context |
| STABILIZATION_REPORT.md | 20 min | Audit results |
| **TOTAL** | **~3 hours** | **Before coding** |

### 9.3 7-Question Gate (Print This)

```
BEFORE ANY FEATURE, ANSWER:

1. Does this preserve universality?       [✅ / ❌ / ❓]
2. Does this introduce template coupling? [✅ / ❌ / ❓]
3. Is abstraction justified by repetition? [✅ / ❌ / ❓]
4. Is this solving real repetition?       [✅ / ❌ / ❓]
5. Is this too early for maturity?        [✅ / ❌ / ❓]
6. Does this create framework complexity? [✅ / ❌ / ❓]
7. Does this preserve runtime/operational? [✅ / ❌ / ❓]

If ANY ❌ or ❓: STOP, consult maintainers.
```

### 9.4 Red Flags (Memorize These)

```
🚩 "Universal workflow engine"
🚩 "Dynamic schema runtime"
🚩 "Plugin marketplace now"
🚩 "Generic everything"
🚩 "Template-aware frontend"
🚩 "Metadata-driven runtime"
🚩 "Feature-first development"
🚩 "Abstraction-first thinking"
🚩 "SDK now"
🚩 "No-code ambitions"
```

### 9.5 Safe vs Unsafe

**✅ SAFE NOW:**
- Booking template
- Operational rendering
- Capability emergence
- Dashboard evolution
- Metadata refinement
- Frontend APIs
- Test coverage

**❌ UNSAFE NOW:**
- Plugin runtime
- External SDK
- Marketplace
- External analytics
- Queue system
- Microservices
- Visual builders
- No-code systems

### 9.6 Vocabulary Checklist

**✅ Use These Terms:**
- Runtime
- Operational Layer
- Template
- Capability
- Interaction
- Session
- Flow
- Owner Module
- Operational Composition
- Generic Rendering

**❌ Never Use These Terms:**
- Funnel builder
- Leads metric
- Funnels quota
- Template-specific dashboard
- Feature flags (for capabilities)
- Plugin system now
- SDK now

---

## SECTION 10 — FINAL REMINDERS

### 10.1 Core Truths

**BotGrandFather is a PLATFORM, NOT a FRAMEWORK.**
- Platform serves many use cases
- Framework is generic tool for building
- Don't build framework, build platform

**Simplicity beats cleverness.**
- Simple code is maintainable
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

### 10.2 When in Doubt

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
- Re-read ARCHITECTURAL_INVARIANTS.md

### 10.3 Welcome Aboard

**You are now ready to contribute to BotGrandFather.**

**Remember:**
- Read documents in order
- Use 7-question gate before features
- Watch for red flags
- Stick to safe directions
- Preserve architectural invariants
- Ask questions when unsure

**Good luck, and welcome to the team!**

---

**END OF NEW AGENT BOOTSTRAP GUIDE**

**This document is your onboarding system.  
Refer to it when unsure.  
Update when platform state materially changes.  
Help future agents by keeping it current.**
