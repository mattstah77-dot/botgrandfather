# Premature Abstraction

**Purpose:** Anti-pattern of abstracting before repetition proven  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0

---

## THE ANTI-PATTERN

Abstracting before 3+ proven repetitions.

---

## EXAMPLES

### Example 1: Universal Workflow Engine

```typescript
// ❌ PREMATURE — 1-2 templates with workflow concept
interface UniversalWorkflow<T> {
  execute(data: T): Promise<WorkflowResult>;
}

// ✅ CORRECT — Template implements own flow
class LeadFunnelService {
  async handleMessage(customer, message) {
    if (step === 'askName') await this.askName(customer);
    else if (step === 'askEmail') await this.askEmail(customer);
  }
}
```

### Example 2: Template Base Class

```typescript
// ❌ PREMATURE — No common logic beyond customer/analytics
class BaseTemplateService {
  abstract execute(params: any): Promise<any>;
}

// ✅ CORRECT — Composition over inheritance
class LeadFunnelService {
  constructor(
    private customerService: CustomerService,
    private analyticsService: AnalyticsService,
  ) {}
}
```

### Example 3: Generic Form Builder

```typescript
// ❌ PREMATURE — Only 1 template with forms
class FormBuilder {
  createForm(schema: JSONSchema): Form;
}

// ✅ CORRECT — Template implements own questions
class LeadFunnelService {
  async askName(customer) {
    await this.sendMessage(customer, 'What is your name?');
  }
}
```

---

## DETECTION

**Red flags:**
- "Let's build a universal X"
- "Let's make this generic"
- "Let's create a base class"
- "Let's design a framework"

**Before abstracting:**
- Count instances: < 3 → reject
- Check duplication: unclear → reject
- Check complexity: adds more → reject

---

**Version 1.0 — 2026-05-23**
