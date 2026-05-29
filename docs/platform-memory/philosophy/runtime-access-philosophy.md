# Runtime Access Philosophy

**Purpose:** Define canonical runtime access semantics for BotGrandFather  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## PHILOSOPHY STATEMENT

**Chat is the runtime ACCESS layer. MiniApp is the runtime EXECUTION layer.**

This is the foundational law of BotGrandFather surface interaction.

---

## WHAT CHAT IS

### Chat Is

| Aspect | Meaning |
|--------|---------|
| **Runtime Gateway** | Entry point to business flows |
| **Friction Reduction Layer** | Quick access, notifications, shortcuts |
| **Runtime Access Layer** | Provides entry to MiniApp runtime |
| **Communication Channel** | Proactive messages to customer |
| **Lightweight Interface** | Text + inline buttons |

### Chat Code Examples

```typescript
// ✅ CORRECT: Chat is access layer
@Post('/start')
async handleStart(@Param('userId') userId: string) {
  // Entry point
  await this.telegram.sendMessage(userId, 'Welcome! Book here: [MiniApp]');
}

// ✅ CORRECT: Chat provides quick access
@Post('/quick-book')
async handleQuickBook(@Param('userId') userId: string) {
  // Quick access to MiniApp
  await this.telegram.sendMessage(userId, 'Open booking: [MiniApp]');
}

// ✅ CORRECT: Chat provides notifications
async notifyBookingConfirmed(userId: string, bookingId: string) {
  // Proactive communication
  await this.telegram.sendMessage(userId, `Booking ${bookingId} confirmed!`);
}
```

---

## WHAT CHAT IS NOT

### Chat Is NOT

| Aspect | Why Not |
|--------|---------|
| **Second Runtime** | Runtime lives in MiniApp |
| **Duplicated UI** | Single runtime surface |
| **Alternative Orchestration Layer** | No cross-capability workflows |
| **Complex Flow Handler** | Complex flows need MiniApp |
| **Business Logic Executer** | Business logic in runtime services |

### Chat Forbidden Examples

```typescript
// ❌ FORBIDDEN: Chat is second runtime
@Post('/book')
async handleBook(@Param('userId') userId: string) {
  const slots = await this.getSlots();  // Chat runtime!
  const selected = await this.promptForSlot(userId, slots);
  await this.createBooking(selected);  // Chat execution!
  // FORBIDDEN: Chat should not execute runtime
}

// ❌ FORBIDDEN: Chat is duplicated UI
@Post('/booking-menu')
async handleBookingMenu() {
  // Chat should not have full booking menu tree
  // MiniApp provides unified navigation
}

// ❌ FORBIDDEN: Chat is orchestration layer
@Post('/onboard')
async handleOnboard(@Param('userId') userId: string) {
  await this.createBooking(userId);
  await this.createTicket(userId);  // Chat orchestration!
  // FORBIDDEN: Chat should not orchestrate
}
```

---

## WHAT MINIAPP IS

### MiniApp Is

| Aspect | Meaning |
|--------|---------|
| **Runtime Execution Layer** | Full business flow execution |
| **State Management Layer** | UserState for flow progression |
| **Rich UI Layer** | Forms, calendars, slot pickers |
| **Unified Runtime Surface** | Single surface across capabilities |
| **Projection Consumer** | Observes capability projections |

### MiniApp Code Examples

```typescript
// ✅ CORRECT: MiniApp is execution layer
@Get('miniapp/bookings')
async openBookingMiniApp(@Param('botId') botId: string) {
  await this.telegram.sendWebApp(userId, `https://app.botgrandfather.com/booking/${botId}`);
}

@Get('miniapp/bookings/slots')
async getSlots(@Query('date') date: string) {
  // Display slots in rich UI
  return this.bookingQueryService.getAvailableSlots(botId, date);
}

@Post('miniapp/bookings/confirm')
async confirmBooking(@Body() data: CreateBookingDto) {
  // Execute booking flow
  return this.bookingRuntimeService.createBooking(data);
}
```

---

## WHAT MINIAPP IS NOT

### MiniApp Is NOT

| Aspect | Why Not |
|--------|---------|
| **Orchestration Layer** | Observational only |
| **Workflow System** | No cross-capability workflows |
| **Business Logic Owner** | Business logic in runtime services |
| **Projection Authority** | Projections owned by capability |
| **Duplicated Runtime** | Single runtime per capability |

### MiniApp Forbidden Examples

```typescript
// ❌ FORBIDDEN: MiniApp is orchestration layer
class BookingMiniAppService {
  async processBooking() {
    await this.bookingRuntimeService.createBooking();
    await this.supportRuntimeService.createTicket();  // Orchestration!
  }
}

// ❌ FORBIDDEN: MiniApp owns business logic
class BookingMiniAppService {
  async computeSlots() {
    // Business logic should be in BookingRuntimeService
  }
}
```

---

## ACCESS VS EXECUTION BOUNDARY

### Correct Boundary

```
Chat (Access)
    │
    ├── /start → Entry point
    ├── /help → Quick help
    ├── Inline button → MiniApp entry
    └── Notification → Proactive message
    
MiniApp (Execution)
    │
    ├── Slot picker → Runtime flow
    ├── Booking form → Runtime flow
    ├── Confirm button → Runtime execution
    └── State management → Flow progression
```

### Forbidden Boundary

```
❌ WRONG:

Chat (Access + Execution)
    │
    ├── /start → Entry point
    ├── /book → Full booking flow (FORBIDDEN!)
    ├── /cancel → Full cancellation flow (FORBIDDEN!)
    └── Notification → Proactive message
    
MiniApp (Execution only)
    │
    ├── Slots → Observational (correct)
    └── But chat also has slots (DUPLICATION!)
```

---

## CANONICAL RULES

### Rule 1: Chat Is Runtime Gateway

Chat provides entry points to runtime. Chat does NOT execute runtime.

### Rule 2: MiniApp Is Runtime Execution

MiniApp provides full runtime execution. MiniApp is the canonical runtime surface.

### Rule 3: No Duplicated Runtime

Runtime exists in ONE location only (MiniApp for complex flows).

### Rule 4: Chat Provides Friction Reduction

Chat minimizes friction through quick access, notifications, shortcuts.

### Rule 5: MiniApp Provides Rich UI

MiniApp handles complex flows with rich UI, forms, state management.

### Rule 6: Chat Does Not Orchestrate

Chat does not coordinate cross-capability actions.

### Rule 7: MiniApp Does Not Own Business Logic

Business logic lives in runtime services. MiniApp executes.

---

**Version 1.0 — UNIT 07 — 2026-05-23**
