# Runtime Modality Contracts

**Purpose:** Define canonical runtime modalities for BotGrandFather  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## RUNTIME MODALITY DEFINITION

**Runtime Modality** is the primary interaction channel for a capability's business flow.

---

## MODALITY 1: CHAT-FIRST

### Definition

**Chat-First** modality uses Telegram chat as the primary interaction surface.

### Characteristics

| Property | Value |
|----------|-------|
| **Primary Channel** | Telegram chat (text + inline buttons) |
| **Complexity** | Low to Medium |
| **Statefulness** | Minimal state (commands, buttons) |
| **Use Cases** | Simple queries, quick actions, notifications |
| **Examples** | `/start`, `/help`, status checks, simple menus |

### Chat Responsibilities

| Responsibility | Implementation |
|----------------|----------------|
| **Entry Point** | `/start`, `/help` commands |
| **Quick Actions** | Inline buttons for common tasks |
| **Notifications** | Proactive messages to customer |
| **Reminders** | Time-based notifications |
| **Minimal Navigation** | Inline button tree |

### Chat MUST NEVER

| Forbidden | Why |
|-----------|-----|
| **Duplicate runtime flows** | Runtime lives in MiniApp |
| **Replicate complex flows** | Complex flows need MiniApp |
| **Become second runtime tree** | Single runtime per capability |
| **Own business orchestration** | Business logic in runtime services |
| **Contain complex navigation** | Chat is access layer, not UI |

### Example: Chat-First Capability

```typescript
// ✅ CORRECT: Chat-first (simple capability)
@Post('/start')
async handleStart(@Param('userId') userId: string) {
  // Simple chat-first interaction
  await this.telegram.sendMessage(userId, 'Welcome! Use /help for options.');
}

@Post('/help')
async handleHelp(@Param('userId') userId: string) {
  // Simple menu
  await this.telegram.sendMessage(userId, 'Options: /book /cancel /status');
}
```

---

## MODALITY 2: MINIAPP-FIRST

### Definition

**MiniApp-First** modality uses Telegram MiniApp as the primary interaction surface.

### Characteristics

| Property | Value |
|----------|-------|
| **Primary Channel** | Telegram MiniApp (web UI) |
| **Complexity** | Medium to High |
| **Statefulness** | Full state management |
| **Use Cases** | Complex forms, visual selection, rich UI |
| **Examples** | Slot picker, booking form, dashboard |

### MiniApp Responsibilities

| Responsibility | Implementation |
|----------------|----------------|
| **Complex Flows** | Multi-step forms, visual selection |
| **State Management** | UserState for flow progression |
| **Rich UI** | Forms, calendars, charts |
| **Full Runtime** | Complete business flow |
| **Navigation** | Client-side routing within MiniApp |

### MiniApp MUST NEVER

| Forbidden | Why |
|-----------|-----|
| **Execute business logic** | Business logic in runtime services |
| **Own projections** | Projections owned by capability |
| **Become orchestration layer** | Observational only |
| **Duplicate runtime** | Single runtime per capability |

### Example: MiniApp-First Capability

```typescript
// ✅ CORRECT: MiniApp-first (complex capability)
@Get('miniapp/bookings')
async openBookingMiniApp(@Param('botId') botId: string) {
  // Open MiniApp with booking flow
  await this.telegram.sendWebApp(userId, `https://app.botgrandfather.com/booking/${botId}`);
}

// MiniApp endpoints
@Get('miniapp/bookings/slots')
async getSlots(@Query('date') date: string) {
  // Full slot picker UI
  return this.bookingQueryService.getAvailableSlots(botId, date);
}

@Post('miniapp/bookings/confirm')
async confirmBooking(@Body() data: CreateBookingDto) {
  // Complete booking flow
  return this.bookingRuntimeService.createBooking(data);
}
```

---

## MODALITY 3: HYBRID (CHAT + MINIAPP)

### Definition

**Hybrid** modality uses Chat as access layer + MiniApp as runtime surface.

### Characteristics

| Property | Value |
|----------|-------|
| **Chat Role** | Access layer (entry, notifications, quick actions) |
| **MiniApp Role** | Runtime surface (complex flows, rich UI) |
| **Complexity** | High (two modalities, unified runtime) |
| **Use Cases** | Booking, Support, Lead Funnel |
| **Examples** | Chat → Inline button → MiniApp → Runtime |

### Hybrid Responsibilities

| Channel | Responsibility |
|---------|----------------|
| **Chat** | Entry point, notifications, inline button entry |
| **MiniApp** | Full runtime, complex forms, state management |

### Hybrid MUST NEVER

| Forbidden | Why |
|-----------|-----|
| **Duplicate runtime in chat** | Runtime lives in MiniApp only |
| **Chat becomes second runtime** | Chat is access layer only |
| **Split runtime across channels** | Single unified runtime |
| **Chat replicates MiniApp flows** | Chat provides entry, not execution |

### Canonical Hybrid: Booking

```typescript
// ✅ CORRECT: Hybrid (Booking capability)
// Chat entry
@Post('/start')
async handleStart(@Param('userId') userId: string) {
  // Chat provides entry point
  await this.telegram.sendMessage(userId, 'Book an appointment:', {
    reply_markup: {
      inline_keyboard: [[{ text: 'Open Booking', web_app: { url: '...' } }]]
    }
  });
}

// Chat notification
async notifyBookingConfirmed(bookingId: string, userId: string) {
  // Chat provides notifications
  await this.telegram.sendMessage(userId, `Booking ${bookingId} confirmed!`);
}

// MiniApp runtime
@Get('miniapp/bookings/slots')
async getSlots(@Query('date') date: string) {
  // MiniApp provides full runtime
  return this.bookingQueryService.getAvailableSlots(botId, date);
}

@Post('miniapp/bookings/confirm')
async confirmBooking(@Body() data: CreateBookingDto) {
  // MiniApp executes runtime
  return this.bookingRuntimeService.createBooking(data);
}
```

---

## MODALITY MATRIX

| Capability | Modality | Chat Role | MiniApp Role | Runtime Location |
|------------|----------|-----------|--------------|------------------|
| **Booking** | HYBRID | Entry, notifications | Full runtime flow | MiniApp |
| **Support** | HYBRID | Entry, quick actions | Full ticket flow | MiniApp |
| **Lead Funnel** | MINIAPP-FIRST | Entry only | Full funnel flow | MiniApp |
| **Simple Menu** | CHAT-FIRST | Full interaction | Not used | Chat |

---

## FORBIDDEN DUPLICATION

### ❌ DUPLICATED RUNTIME (FORBIDDEN)

```typescript
// ❌ FORBIDDEN: Chat duplicates MiniApp runtime
@Post('/book')
async handleBookCommand(@Param('userId') userId: string) {
  // Chat has full booking logic
  const slots = await this.getSlots();  // Chat runtime!
  const selected = await this.promptForSlot(userId, slots);
  await this.createBooking(selected);  // Chat execution!
}

@Get('miniapp/bookings/slots')
async getSlotsMiniApp() {
  // MiniApp ALSO has booking logic
  // DUPLICATION!
}
```

### ✅ SINGLE RUNTIME (CORRECT)

```typescript
// ✅ CORRECT: Single runtime in MiniApp
@Post('/start')
async handleStart(@Param('userId') userId: string) {
  // Chat ONLY provides entry
  await this.telegram.sendMessage(userId, 'Book here:', {
    reply_markup: { web_app: { url: '...' } }
  });
}

@Get('miniapp/bookings/slots')
async getSlotsMiniApp() {
  // Runtime lives in MiniApp ONLY
  return this.bookingQueryService.getAvailableSlots(botId, date);
}

@Post('miniapp/bookings/confirm')
async confirmBooking() {
  // Execution in MiniApp
  return this.bookingRuntimeService.createBooking(data);
}
```

---

## CANONICAL RULES

### Rule 1: Chat Is Access Layer

Chat provides entry points, notifications, quick actions. Chat does NOT execute runtime.

### Rule 2: MiniApp Is Runtime Surface

MiniApp provides full runtime, state management, complex flows.

### Rule 3: No Runtime Duplication

Runtime exists in ONE location only (MiniApp for hybrid capabilities).

### Rule 4: Hybrid Is Canonical for Complex Capabilities

Booking, Support, Lead Funnel use Chat + MiniApp hybrid.

### Rule 5: Simple Capabilities Can Be Chat-First

Simple menus, quick actions can be chat-only.

### Rule 6: Chat Does Not Replicate Flows

Chat provides entry, not execution.

### Rule 7: MiniApp Is Unified Runtime

Single runtime surface across all complex capabilities.

---

**Version 1.0 — UNIT 07 — 2026-05-23**
