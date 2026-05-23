# Anti-Overengineering Philosophy

**Purpose:** Define why and how BotGrandFather rejects framework-building  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0

---

## CORE PRINCIPLE

> **Simplicity beats cleverness.**

BotGrandFather is a platform, not a framework.

Frameworks are built to be generic.
Platforms are built to solve real problems.

Framework-building behavior is the primary architectural risk.

---

## THE GOLDEN RULE

> **Abstract only after PROVEN repetition.**

| Instances | Action |
|-----------|--------|
| One | Implement directly. No abstraction. |
| Two | Watch for pattern. Do not abstract yet. |
| Three+ | Abstract if clear duplication exists. |

**Proof of repetition requires:**
- At least 3 real templates with same pattern.
- Manual implementation in all 3 templates.
- Clear duplication that abstraction eliminates.
- Abstraction that does NOT introduce complexity.

---

## ANTI-FRAMEWORK PRINCIPLES

### Principle 1: Solve Real Problems

**Good:**
- "Booking template needs slot management."
- "Three templates need customer viewing."
- "Five templates need analytics."

**Bad:**
- "Let's build a universal workflow engine."
- "Let's create a generic form builder."
- "Let's make everything configurable."

**Why:** Frameworks solve hypothetical problems. Platforms solve real ones.

### Principle 2: Explicit Over Implicit

**Good:**
- Explicit template registration in `TemplateFactory`.
- Explicit capability provider registration in registry.
- Explicit JSON schemas for config.

**Bad:**
- Dynamic template discovery via reflection.
- Auto-registration via decorators.
- Recursive schema engines.

**Why:** Explicit is debuggable. Implicit is magical.

### Principle 3: Code Over Configuration

**Good:**
- Business logic in TypeScript.
- Template flows in service classes.
- Operational UI composed from metadata.

**Bad:**
- Business logic in JSON metadata.
- Template execution via configuration.
- Runtime orchestration via metadata.

**Why:** Code is debuggable. Configuration is opaque.

### Principle 4: Specific Over Generic

**Good:**
- `LeadFunnelService` with explicit questions.
- `BookingRuntimeService` with explicit slot logic.
- `CustomerService` with explicit status logic.

**Bad:**
- `UniversalWorkflow<T>` with generic execution.
- `GenericTemplate<T>` with abstract methods.
- `UniversalBuilder` for all templates.

**Why:** Specific code is maintainable. Generic code is framework code.

### Principle 5: Monolith Over Distributed

**Good:**
- Single NestJS application.
- Direct service calls.
- Shared PostgreSQL database.

**Bad:**
- Microservices for 2 templates.
- Message queues for current scale.
- Distributed transactions.

**Why:** Monoliths are simple. Distributed systems are complex.

---

## FORBIDDEN ARCHITECTURES

### Universal Workflow Engine

```typescript
// FORBIDDEN
interface UniversalWorkflow<T> {
  execute(data: T): Promise<WorkflowResult>;
  getConfigSchema(): JSONSchema;
}
```

**Why Forbidden:** No proven repetition. Adds massive complexity.

### Recursive Schema Engine

```typescript
// FORBIDDEN
class SchemaEngine {
  generateSchema<T>(): JSONSchema;
  validate(data: any, schema: JSONSchema): boolean;
}
```

**Why Forbidden:** Schema-of-schema complexity. Explicit JSON schemas are readable.

### Plugin Runtime

```typescript
// FORBIDDEN (for now)
class PluginRuntime {
  loadTemplate(packageName: string): Promise<Template>;
  sandboxExecution(template: Template): ExecutionContext;
}
```

**Why Forbidden:** Premature for 2 templates. Manual registration sufficient.

### No-Code Builder

```typescript
// FORBIDDEN
class NoCodeBuilder {
  createForm(): FormBuilder;
  createWorkflow(): WorkflowBuilder;
}
```

**Why Forbidden:** Wrong target audience. Platform is for developers.

### Universal Dashboard DSL

```typescript
// FORBIDDEN
class DashboardDSL {
  defineWidget(): WidgetBuilder;
  defineLayout(): LayoutBuilder;
}
```

**Why Forbidden:** Over-abstraction. Simple metadata sufficient.

---

## ANTI-PATTERN DETECTION

### Red Flag 1: "Universal"

When someone says "Let's build a universal X":
- STOP.
- Ask: "How many templates need this?"
- If answer is < 3: reject.

### Red Flag 2: "Configurable"

When someone says "Let's make this configurable":
- STOP.
- Ask: "What problem does configuration solve?"
- If answer is hypothetical: reject.

### Red Flag 3: "Generic"

When someone says "Let's make this generic":
- STOP.
- Ask: "What specific duplication does this eliminate?"
- If no clear duplication: reject.

### Red Flag 4: "Engine"

When someone proposes an "Engine":
- STOP.
- Ask: "Is this a framework component?"
- If yes: reject.

### Red Flag 5: "Builder"

When someone proposes a "Builder" for everything:
- STOP.
- Ask: "Is this no-code drift?"
- If yes: reject.

---

## WHEN COMPLEXITY IS JUSTIFIED

Complexity is justified ONLY when:

1. **Proven repetition exists.** 3+ instances of same pattern.
2. **Duplication is clear.** Manual implementation is painful.
3. **Abstraction reduces complexity.** Not adds it.
4. **Platform universality strengthens.** Not weakens.
5. **Maintenance burden decreases.** Not increases.

**Current justified abstractions:**
- ✅ Customer entity (used by all templates).
- ✅ Analytics events (used by all templates).
- ✅ Ownership verification (used by all endpoints).
- ✅ Query-service pattern (used by operational layer).

**Not yet justified:**
- ❌ Universal workflow engine (1-2 templates).
- ❌ Plugin runtime (2 templates).
- ❌ Generic form builder (1 template with forms).
- ❌ Visual workflow designer (no proven need).

---

## INVARIANTS

> **Invariant A.1:** Platform solves real problems, not hypothetical ones.

> **Invariant A.2:** Abstraction requires 3+ proven repetitions.

> **Invariant A.3:** Explicit is better than implicit.

> **Invariant A.4:** Code is better than configuration for business logic.

> **Invariant A.5:** Specific is better than generic until repetition proven.

> **Invariant A.6:** Monolith is better than distributed until scale requires otherwise.

> **Invariant A.7:** Metadata is tool, not goal.

---

**Version 1.0 — 2026-05-23**
