# Chat ↔ MiniApp Boundary Contracts

**Purpose:** Define canonical boundary between Chat and MiniApp runtime layers  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## BOUNDARY DEFINITION

**Chat** is the runtime ACCESS layer.
**MiniApp** is the runtime EXECUTION layer.

```
Chat (Access Layer)
    │
    ├── Provides entry points
    ├── Provides notifications
    ├── Provides inline button navigation
    └── Provides quick actions
    │
    ▼ (Inline Button / Web App URL)
    
MiniApp (Execution Layer)
    │
    ├── Executes business flows
    ├── Manages runtime state
    ├── Provides rich UI
    └── Consumes capability projections
```

---

## CHAT RESPONSIBILITIES

### Chat MAY

| Responsibility | Example | Why Allowed |
|----------------|---------|-------------|
| **Notify** | "Your booking is confirmed" | Proactive communication |
| **Provide quick access** | Inline button to MiniApp | Friction reduction |
| **Provide entry points** | `/start`, `/help` commands | Initial access |
| **Reopen runtime surface** | Inline button reopens MiniApp | Runtime continuation |
| **Expose low-friction actions** | `/cancel` command | Quick access |
| **Provide reminders** | "Your booking is tomorrow" | Proactive notifications |

### Chat Code Examples

```typescript
// ✅ CORRECT: Chat provides entry
@Post('/start')
async handleStart(@Param('userId') userId: string) {
  await this.telegram.sendMessage(userId, 'Welcome! Book here: [Open MiniApp]');
}

// ✅ CORRECT: Chat provides notification
async notifyBookingConfirmed(bookingId: string, userId: string) {
  await this.telegram.sendMessage(userId, `Booking ${bookingId} confirmed!`);
}

// ✅ CORRECT: Chat provides inline button
@Post('/book')
async handleBook(@Param('userId') userId: string) {
  await this.telegram.sendMessage(userId, 'Open booking:', {
    reply_markup: { web_app: { url: '...' } }
  });
}

// ✅ CORRECT: Chat provides quick action
@Post('/cancel')
async handleCancel(@Param('userId') userId: string) {
  // Quick cancel command (if simple)
  await this.telegram.sendMessage(userId, 'Recent bookings: [Cancel]');
}
```

---

## CHAT MUST NEVER

### Chat MUST NEVER

| Forbidden | Why |
|-----------|-----|
| **Duplicate runtime** | Runtime lives in MiniApp |
| **Replicate flows** | Flows execute in MiniApp |
| **Become second runtime tree** | Single runtime per capability |
| **Own business orchestration** | Business logic in runtime services |
| **Contain complex runtime navigation** | Navigation is MiniApp responsibility |
| **Execute complex business logic** | Business logic in runtime services |

### Chat Forbidden Code Examples

```typescript
// ❌ FORBIDDEN: Chat duplicates runtime
@Post('/book')
async handleBook(@Param('userId') userId: string) {
  const slots = await this.getSlots();  // Chat runtime!
  const selected = await this.promptForSlot(userId, slots);
  await this.createBooking(selected);  // Chat execution!
  // FORBIDDEN: Chat should not execute runtime
}

// ❌ FORBIDDEN: Chat replicates flow
@Post('/confirm-booking')
async handleConfirm(@Body() data: CreateBookingDto) {
  // Chat should not handle booking confirmation
  // MiniApp should handle this
}

// ❌ FORBIDDEN: Chat becomes second runtime tree
@Post('/booking-menu')
async handleBookingMenu() {
  // Chat should not have booking menu tree
  // MiniApp provides full navigation
}
```

---

## MINIAPP RESPONSIBILITIES

### MiniApp MAY

| Responsibility | Example | Why Allowed |
|----------------|---------|-------------|
| **Execute business flows** | Full booking flow | Runtime execution |
| **Manage runtime state** | UserState for flow progression | Stateful flows |
| **Provide rich UI** | Slot picker, forms, calendars | Complex interaction |
| **Consume projections** | Display slots, bookings, tickets | Observational |
| **Navigate runtime** | Client-side routing | Full navigation |
| **Handle multi-step flows** | Select date → select time → confirm | Complex UX |

### MiniApp Code Examples

```typescript
// ✅ CORRECT: MiniApp executes runtime
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

## MINIAPP MUST NEVER

### MiniApp MUST NEVER

| Forbidden | Why |
|-----------|-----|
| **Execute business logic** | Business logic in runtime services |
| **Own projections** | Projections owned by capability |
| **Become orchestration layer** | Observational only |
| **Duplicate runtime** | Single runtime per capability |

### MiniApp Forbidden Code Examples

```typescript
// ❌ FORBIDDEN: MiniApp owns business logic
class BookingMiniAppService {
  async computeSlots() {
    // Business logic should be in BookingRuntimeService
  }
}

// ❌ FORBIDDEN: MiniApp owns projections
class BookingMiniAppService {
  async getSlots() {
    // Projections owned by BookingQueryService
  }
}

// ❌ FORBIDDEN: MiniApp orchestrates
class BookingMiniAppService {
  async processBooking() {
    await this.bookingRuntimeService.createBooking();
    await this.supportRuntimeService.createTicket();  // Orchestration!
  }
}
```

---

## INLINE BUTTON NAVIGATION SEMANTICS

### Canonical Architecture

BotGrandFather uses **inline-button runtime entry architecture**, NOT deep-link-driven runtime systems.

```
Chat Message
    │
    ├── Inline Button
    │   └── text: "Book Appointment"
    │   └── web_app: { url: "https://app.botgrandfather.com/booking/{botId}" }
    │
    ▼
MiniApp Opens
    │
    ├── Full runtime surface
    ├── Client-side routing
    └── State management
```

### Why Inline Buttons, Not Deep Links

| Inline Buttons | Deep Links |
|----------------|------------|
| Unified entry point | Fragmented entry points |
| Single MiniApp URL | Multiple URLs per flow |
| Capability-agnostic | Capability-specific URLs |
| Friction-minimized | Multiple context switches |

### Inline Button Code Example

```typescript
// ✅ CORRECT: Inline button entry
async sendBookingButton(userId: string, botId: string) {
  await this.telegram.sendMessage(userId, 'Book an appointment:', {
    reply_markup: {
      inline_keyboard: [[{
        text: 'Open Booking',
        web_app: { url: `https://app.botgrandfather.com/booking/${botId}` }
      }]]
    }
  });
}

// ❌ FORBIDDEN: Deep link fragmentation
async sendBookingLink(userId: string, botId: string) {
  await this.telegram.sendMessage(userId, 'Book here: https://t.me/share/url?...');
  // Deep links fragment runtime entry
}
```

---

## NAVIGATION FLOW

### Canonical Flow

```
1. User opens chat
2. Chat shows inline button → "Book Appointment"
3. User clicks button
4. MiniApp opens at booking entry point
5. User navigates within MiniApp (client-side routing)
6. User completes flow
7. Chat shows confirmation notification
```

### Forbidden Flow

```
❌ FORBIDDEN:

1. User opens chat
2. Chat shows multiple commands → /book /cancel /reschedule
3. Each command opens different flow
4. User must navigate chat command tree
5. Chat executes business logic
6. Fragmented runtime experience
```

---

## CANONICAL RULES

### Rule 1: Chat Is Access Layer

Chat provides entry, notifications, quick actions. Chat does NOT execute runtime.

### Rule 2: MiniApp Is Execution Layer

MiniApp provides full runtime, state management, complex flows.

### Rule 3: Inline Button Entry Is Canonical

Runtime entry via inline buttons, NOT deep links.

### Rule 4: No Runtime Duplication

Runtime exists in MiniApp only. Chat provides access.

### Rule 5: Chat Does Not Replicate Flows

Chat commands provide shortcuts, not full flows.

### Rule 6: MiniApp Is Unified Runtime Surface

Single runtime surface across all capabilities.

### Rule 7: Navigation Is MiniApp Responsibility

Client-side routing within MiniApp, not chat command tree.

---

**Version 1.0 — UNIT 07 — 2026-05-23**
