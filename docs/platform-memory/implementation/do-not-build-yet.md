# Do Not Build Yet Registry

**Purpose:** Explicitly forbid premature systems  
**Status:** CANONICAL — Tier 1 Implementation Governance  
**Version:** 1.0  
**Unit:** Booking Implementation Transition  
**Date:** 2026-05-23

---

## CORE PRINCIPLE

> **Build only what current pressure justifies. Everything else waits.**

---

## FORBIDDEN PREMATURE SYSTEMS

### 1. Recurrence Engines

**Forbidden:**
```typescript
class RecurrenceEngine {
  generateRRULE(config: RecurrenceConfig): string;
  generateOccurrences(rrule: string, start: Date, end: Date): Date[];
}
```

**WHY Forbidden:**
- No proven repetition (only 1 booking template)
- RRULE complexity unnecessary for explicit weekly config
- Adds massive complexity for hypothetical use case

**WHEN Justified:**
- 3+ templates need recurrence
- Manual recurrence configuration is painful in all 3
- Explicit config pattern is stable

**WHY Current Scale Does Not Justify:**
- Only 1 capability needs scheduling
- Explicit weekly config sufficient
- No customer demand for complex recurrence

---

### 2. Optimization Engines

**Forbidden:**
```typescript
class SlotOptimizer {
  optimizeSlots(slots: Slot[]): Slot[];
  suggestBestTimes(bookingHistory: Booking[]): Slot[];
}
```

**WHY Forbidden:**
- No performance pressure yet
- Optimization is speculative
- Adds complexity without proven need

**WHEN Justified:**
- Performance benchmarks show optimization needed
- Slot generation takes > 100ms consistently
- 1000+ concurrent bookings per hour

**WHY Current Scale Does Not Justify:**
- Current scale: minimal traffic
- Slot generation is fast enough
- No customer complaints about performance

---

### 3. Distributed Scheduling

**Forbidden:**
```typescript
class DistributedScheduler {
  scheduleJob(job: Job): Promise<JobId>;
  distributeJob(job: Job): Promise<NodeId>;
}
```

**WHY Forbidden:**
- Single-instance deployment sufficient
- No scaling pressure
- Adds distributed complexity

**WHEN Justified:**
- 10+ application instances
- High-concurrency scheduling needed
- Single instance cannot handle load

**WHY Current Scale Does Not Justify:**
- Single instance deployment
- Low traffic volume
- No scaling requirements

---

### 4. Event-Driven Runtime Orchestration

**Forbidden:**
```typescript
@Injectable()
class BookingEventOrchestrator {
  @OnEvent('booking.created')
  async onBookingCreated(event: BookingCreated) {
    await this.supportService.createTicket(event);
    await this.analyticsService.trackConversion(event);
    await this.notificationService.sendConfirmation(event);
  }
}
```

**WHY Forbidden:**
- Creates hidden automation
- Cross-capability coupling via events
- Becomes reactive workflow engine

**WHEN Justified:**
- 5+ capabilities need cross-capability coordination
- Manual coordination is painful in all 5
- Event semantics are stable

**WHY Current Scale Does Not Justify:**
- Only 2-3 capabilities exist
- Manual coordination is acceptable
- Event semantics still evolving

---

### 5. Shared Temporal Abstractions

**Forbidden:**
```typescript
class SharedTemporalService {
  getUniversalAvailability(): Promise<Availability[]>;
  scheduleAllTemplatedTemps(): Promise<void>;
}
```

**WHY Forbidden:**
- Cross-capability coupling
- Centralizes temporal logic
- Becomes scheduling coordinator

**WHEN Justified:**
- 3+ templates share same temporal pattern
- Pattern is stable across all 3
- Abstraction reduces duplication

**WHY Current Scale Does Not Justify:**
- Only 1 scheduling template (booking)
- Other templates don't need scheduling
- No pattern to abstract

---

### 6. Plugin Runtime

**Forbidden:**
```typescript
class PluginRuntime {
  loadTemplate(packageName: string): Promise<Template>;
  sandboxExecution(template: Template): ExecutionContext;
  hotReloadTemplate(packageName: string): Promise<void>;
}
```

**WHY Forbidden:**
- Premature for 2-3 templates
- Manual registration is sufficient
- Adds sandbox complexity

**WHEN Justified:**
- 10+ templates exist
- Manual registration is painful
- External developers need SDK

**WHY Current Scale Does Not Justify:**
- Only 3 templates (lead-funnel, booking, support)
- Manual registration is trivial
- No external developers

---

### 7. Visual Workflow Systems

**Forbidden:**
```typescript
class VisualWorkflowBuilder {
  createWorkflow(): WorkflowBuilder;
  saveWorkflow(workflow: Workflow): Promise<WorkflowId>;
  executeWorkflow(workflowId: string, data: any): Promise<any>;
}
```

**WHY Forbidden:**
- No-code drift
- Wrong target audience (developers, not business users)
- Massive complexity for hypothetical use case

**WHEN Justified:**
- Business users need to create workflows WITHOUT developers
- 5+ templates need workflow customization
- Code-based workflow is painful for developers

**WHY Current Scale Does Not Justify:**
- Target audience is developers
- Only 2-3 workflows exist
- Code is more maintainable than visual

---

### 8. Automation Engines

**Forbidden:**
```typescript
class AutomationEngine {
  createAutomation(config: AutomationConfig): Promise<AutomationId>;
  triggerAutomation(event: Event): Promise<void>;
  executeAutomation(automationId: string): Promise<any>;
}
```

**WHY Forbidden:**
- Becomes workflow engine
- Hidden automation
- Cross-capability coordination

**WHEN Justified:**
- 5+ automations needed
- Manual coordination is painful in all 5
- Automation patterns are stable

**WHY Current Scale Does Not Justify:**
- Few automations needed
- Manual coordination acceptable
- Patterns still evolving

---

### 9. Predictive Systems

**Forbidden:**
```typescript
class PredictiveBookingSystem {
  predictNoShow(booking: Booking): Promise<number>;
  suggestBestSlot(customer: Customer): Promise<Slot>;
  optimizePricing(booking: Booking): Promise<number>;
}
```

**WHY Forbidden:**
- ML complexity without data
- No customer demand
- Speculative "smart" features

**WHEN Justified:**
- 1000+ bookings per week (data available)
- Clear predictive use case with ROI
- Customer demand for "smart" features

**WHY Current Scale Does Not Justify:**
- Minimal bookings
- No historical data
- No customer demand

---

### 10. AI Runtime Coordination

**Forbidden:**
```typescript
class AIRuntimeCoordinator {
  optimizeRouting(booking: Booking): Promise<Provider>;
  predictCapacity(botId: string, date: Date): Promise<number>;
  suggestPricing(booking: Booking): Promise<number>;
}
```

**WHY Forbidden:**
- AI complexity without need
- No customer demand
- Speculative "smart" features

**WHEN Justified:**
- Clear AI use case with ROI
- 1000+ bookings per week (data available)
- Customer demand for AI features

**WHY Current Scale Does Not Justify:**
- Minimal bookings
- No historical data
- No customer demand
- AI is marketing, not value

---

### 11. Smart Scheduling

**Forbidden:**
```typescript
class SmartScheduler {
  suggestBestTimes(customer: Customer): Promise<Slot[]>;
  optimizeProviderAssignment(booking: Booking): Promise<Provider>;
  predictAvailability(botId: string, date: Date): Promise<Slot[]>;
}
```

**WHY Forbidden:**
- "Smart" = speculation
- No customer demand
- Adds complexity without value

**WHEN Justified:**
- 1000+ bookings per week (data available)
- Clear "smart" use case with ROI
- Customer demand for optimization

**WHY Current Scale Does Not Justify:**
- Minimal bookings
- No historical data
- No customer demand
- Simple scheduling is sufficient

---

### 12. Universal Lifecycle

**Forbidden:**
```typescript
class UniversalLifecycleManager {
  processLifecycle(customerId: string): Promise<void>;
  advanceStage(customerId: string, stage: string): Promise<void>;
  getLifecycleStage(customerId: string): Promise<string>;
}
```

**WHY Forbidden:**
- Becomes CRM engine
- Cross-capability lifecycle
- Orchestrates all capabilities

**WHEN Justified:**
- 5+ capabilities share lifecycle
- Lifecycle pattern is stable
- Manual lifecycle is painful in all 5

**WHY Current Scale Does Not Justify:**
- Capabilities have different lifecycles
- No shared pattern
- Manual lifecycle is acceptable

---

## DECISION FRAMEWORK

### Is This System Justified?

Answer these questions:

1. **How many templates need this?**
   - 1-2 → NOT justified
   - 3+ → MAYBE justified

2. **Is manual implementation painful?**
   - No → NOT justified
   - Yes → MAYBE justified

3. **Is the pattern stable?**
   - No → NOT justified
   - Yes → MAYBE justified

4. **Does abstraction reduce complexity?**
   - No → NOT justified
   - Yes → MAYBE justified

5. **Is there customer demand?**
   - No → NOT justified
   - Yes → MAYBE justified

**If ANY answer is "NOT justified" → DO NOT BUILD**

---

## WHEN THINGS BECOME JUSTIFIED

### Recurrence Engines

- 3+ templates need recurrence
- Manual recurrence is painful in all 3
- Explicit weekly config pattern is stable

### Optimization Engines

- Performance benchmarks show bottleneck
- 1000+ concurrent bookings per hour
- Customer complaints about performance

### Distributed Scheduling

- 10+ application instances
- Single instance cannot handle load
- Scaling pressure is real

### Event-Driven Orchestration

- 5+ capabilities need coordination
- Manual coordination is painful
- Event semantics are stable

### Plugin Runtime

- 10+ templates exist
- Manual registration is painful
- External developers need SDK

### Visual Workflow Systems

- Business users need no-code workflows
- 5+ templates need workflow customization
- ROI is clear

### Automation Engines

- 5+ automations needed
- Manual coordination is painful
- Automation patterns are stable

### Predictive Systems

- 1000+ bookings per week
- Clear predictive use case with ROI
- Customer demand for "smart" features

### AI Runtime Coordination

- Clear AI use case with ROI
- 1000+ bookings per week
- Customer demand for AI features

### Smart Scheduling

- 1000+ bookings per week
- Clear optimization use case with ROI
- Customer demand for optimization

### Universal Lifecycle

- 5+ capabilities share lifecycle
- Lifecycle pattern is stable
- Manual lifecycle is painful in all 5

---

## CANONICAL RULES

### Rule 1: Pressure Justifies Complexity

No pressure = no complexity.

### Rule 2: Repetition Justifies Abstraction

No repetition = no abstraction.

### Rule 3: Customer Demand Justifies Features

No demand = no features.

### Rule 4: Data Justifies Prediction

No data = no prediction.

### Rule 5: Scale Justifies Distribution

No scale = no distribution.

### Rule 6: When in Doubt, Wait

Building prematurely is more expensive than waiting.

---

**Version 1.0 — Booking Implementation Transition — 2026-05-23**
