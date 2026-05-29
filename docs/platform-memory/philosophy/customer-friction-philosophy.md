# Customer Friction Philosophy

**Purpose:** Define canonical UX laws for minimizing customer friction  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## FRICTION MINIMIZATION LAWS

### LAW 1: Minimize Clicks

**Principle:** Customer achieves goal with minimum clicks.

```
✅ CORRECT: Booking in 3 clicks
Chat → Open MiniApp → Select Date → Select Time → Confirm (3 clicks)

❌ FORBIDDEN: Booking in 10 clicks
Chat → /book → Select Service → Select Date → Select Time → Enter Name → Enter Phone → Enter Email → Confirm → Success
```

### LAW 2: Minimize Transitions

**Principle:** Customer stays in unified runtime surface.

```
✅ CORRECT: Single MiniApp surface
Chat → MiniApp → Complete flow → Done

❌ FORBIDDEN: Multiple transitions
Chat → MiniApp → External site → Back to Chat → MiniApp again
```

### LAW 3: Minimize Cognitive Load

**Principle:** Customer sees only what is needed for current step.

```
✅ CORRECT: Progressive disclosure
Step 1: Select date (shows only dates)
Step 2: Select time (shows only times)
Step 3: Confirm (shows summary)

❌ FORBIDDEN: All at once
Shows all dates, all times, all services, all options simultaneously
```

### LAW 4: Minimize Runtime Fragmentation

**Principle:** Customer experiences single unified runtime.

```
✅ CORRECT: Unified runtime
Single MiniApp for all capabilities

❌ FORBIDDEN: Fragmented runtime
Chat for booking, separate MiniApp for support, separate MiniApp for lead funnel
```

### LAW 5: Minimize Context Loss

**Principle:** Customer never loses context during flow.

```
✅ CORRECT: Context preserved
Customer selects date → time → confirm → all in one MiniApp

❌ FORBIDDEN: Context lost
Customer selects date → goes to chat → comes back → date lost
```

---

## PROGRESSIVE DISCLOSURE

### Definition

Show customer only what they need for current step.

### Implementation

```typescript
// ✅ CORRECT: Progressive disclosure
class BookingFlowService {
  async handleDateSelection(context: TemplateContext) {
    // Show only dates
    return { dates: this.getAvailableDates(botId) };
  }
  
  async handleTimeSelection(context: TemplateContext, date: string) {
    // Show only times for selected date
    return { times: this.getAvailableTimes(botId, date) };
  }
  
  async handleConfirmation(context: TemplateContext, date: string, time: string) {
    // Show only summary
    return { summary: { date, time } };
  }
}

// ❌ FORBIDDEN: Everything at once
class BookingFlowService {
  async showEverything() {
    return {
      dates: this.getAvailableDates(botId),
      times: this.getAllTimes(botId),
      services: this.getAllServices(botId),
      providers: this.getAllProviders(botId),
      options: this.getAllOptions(botId),
      // OVERWHELMING
    };
  }
}
```

---

## MINIMAL RUNTIME PATH

### Definition

Shortest path from entry to goal.

### Example: Booking Flow

```
✅ CORRECT: Minimal path
1. Open MiniApp
2. Select date
3. Select time
4. Confirm

❌ FORBIDDEN: Long path
1. Open chat
2. Type /book
3. Select service category
4. Select service type
5. Select provider
6. Select date
7. Select time
8. Enter personal info
9. Enter contact info
10. Review
11. Confirm
```

---

## SEAMLESS RUNTIME CONTINUATION

### Definition

Customer can resume interrupted flow without loss.

### Implementation

```typescript
// ✅ CORRECT: Quick recovery
async handleReopenMiniApp(userId: string) {
  const userState = await this.userStateService.getState(userId);
  
  if (userState.flow === 'booking') {
    // Resume from last step
    return this.bookingFlowService.resume(userId, userState.step);
  }
  
  // Fresh start
  return this.bookingFlowService.start(userId);
}

// ❌ FORBIDDEN: Restart from beginning
async handleReopenMiniApp(userId: string) {
  // Always restart
  return this.bookingFlowService.start(userId);
}
```

---

## QUICK RECOVERY SEMANTICS

### Definition

Customer can recover from error with minimal effort.

### Implementation

```typescript
// ✅ CORRECT: Quick recovery
async handleSlotUnavailable(userId: string) {
  await this.telegram.sendMessage(userId, 
    'That slot was just booked. Here are similar slots: [09:30] [10:00] [10:30]'
  );
}

// ❌ FORBIDDEN: Full restart
async handleSlotUnavailable(userId: string) {
  await this.telegram.sendMessage(userId, 
    'Slot unavailable. Please start over.'  // HIGH FRICTION
  );
}
```

---

## WITHOUT FRICTION MINIMIZATION

### What NOT To Do

```typescript
// ❌ FORBIDDEN: Giant scrolling interfaces
class BookingMiniApp {
  // Shows all dates, times, services in one scroll
  // Overwhelming cognitive load
}

// ❌ FORBIDDEN: Orchestration UX
class BookingMiniApp {
  // Shows booking + support + lead funnel in one view
  // Cross-capability complexity
}

// ❌ FORBIDDEN: Duplicated lifecycle handling
class BookingMiniApp {
  // Booking flow handled in both chat and MiniApp
  // Customer confused about which to use
}

// ❌ FORBIDDEN: Runtime fragmentation
class BookingMiniApp {
  // Multiple MiniApps for single capability
  // Customer must switch between them
}
```

---

## CANONICAL RULES

### Rule 1: Minimize Clicks

Customer achieves goal in minimum clicks.

### Rule 2: Minimize Transitions

Customer stays in unified runtime surface.

### Rule 3: Minimize Cognitive Load

Show only what is needed for current step.

### Rule 4: Minimize Runtime Fragmentation

Single unified runtime per capability.

### Rule 5: Minimize Context Loss

Preserve customer context throughout flow.

### Rule 6: Progressive Disclosure

Show only current step, not all steps.

### Rule 7: Quick Recovery

Customer recovers from error with minimal effort.

### Rule 8: Seamless Continuation

Customer resumes interrupted flow without loss.

---

**Version 1.0 — UNIT 07 — 2026-05-23**
