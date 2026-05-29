# Runtime Duplication Anti-Patterns

**Purpose:** Document forbidden runtime duplication patterns  
**Status:** CANONICAL — Tier 3 Anti-Pattern  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## ANTI-PATTERN 1: Duplicated Runtime Flows

### What It Is

Same business flow implemented in multiple surfaces.

```typescript
// ❌ FORBIDDEN: Chat has booking flow
@Post('/book')
async handleBookCommand(@Param('userId') userId: string) {
  const slots = await this.getSlots();
  const selected = await this.promptForSlot(userId, slots);
  await this.createBooking(selected);
}

// ❌ FORBIDDEN: MiniApp also has booking flow
@Post('miniapp/bookings/confirm')
async confirmBooking(@Body() data: CreateBookingDto) {
  await this.createBooking(data);
}

// SAME FLOW IN TWO PLACES
```

### Why It Appears Attractive
- "Convenience" for chat users
- "Flexibility" for different channels
- "Fallback" if MiniApp fails

### Why It Corrupts Architecture
- Two places to maintain
- Divergent behavior over time
- Confusing for customers
- Double the bugs

### Prevention
- Single runtime surface (MiniApp)
- Chat provides entry only
- No flow execution in chat

---

## ANTI-PATTERN 2: Duplicated Booking Lifecycle

### What It Is

Booking lifecycle handled in both chat and MiniApp.

```typescript
// ❌ FORBIDDEN: Chat handles booking lifecycle
@Post('/book')
async handleBook(@Param('userId') userId: string) {
  // Full booking lifecycle in chat
}

@Post('/cancel')
async handleCancel(@Param('userId') userId: string) {
  // Full cancellation in chat
}

// ❌ FORBIDDEN: MiniApp also handles booking lifecycle
@Post('miniapp/bookings/confirm')
async confirmBooking() {
  // Full booking lifecycle in MiniApp
}

@Post('miniapp/bookings/cancel')
async cancelBooking() {
  // Full cancellation in MiniApp
}
```

### Why It Appears Attractive
- "Complete" chat experience
- "All channels supported"
- "User choice"

### Why It Corrupts Architecture
- Lifecycle logic duplicated
- State synchronization needed
- Customer confusion
- Maintenance nightmare

### Prevention
- Booking lifecycle in MiniApp only
- Chat provides shortcuts to MiniApp
- No lifecycle handling in chat

---

## ANTI-PATTERN 3: Duplicated Navigation Trees

### What It Is

Navigation tree exists in both chat and MiniApp.

```typescript
// ❌ FORBIDDEN: Chat has navigation tree
@Post('/menu')
async handleMenu() {
  return {
    text: 'Menu:',
    options: [
      { text: 'Book', callback: '/book' },
      { text: 'Cancel', callback: '/cancel' },
      { text: 'Status', callback: '/status' },
    ]
  };
}

// ❌ FORBIDDEN: MiniApp also has navigation tree
class MiniAppNavigation {
  routes = [
    { path: '/booking', component: BookingPage },
    { path: '/cancellation', component: CancellationPage },
    { path: '/status', component: StatusPage },
  ];
}
```

### Why It Appears Attractive
- "Consistent" navigation
- "Familiar" interface
- "Complete" chat experience

### Why It Corrupts Architecture
- Navigation logic duplicated
- Routes diverge over time
- Customer confused about which to use
- Maintenance burden

### Prevention
- Navigation in MiniApp only
- Chat provides single entry point
- No chat navigation tree

---

## ANTI-PATTERN 4: Duplicated Operational Semantics

### What It Is

Operational data exposed in multiple ways.

```typescript
// ❌ FORBIDDEN: Chat shows operational data
@Post('/status')
async handleStatus(@Param('userId') userId: string) {
  const bookings = await this.getBookings(userId);
  return { text: `You have ${bookings.length} bookings` };
}

// ❌ FORBIDDEN: MiniApp also shows operational data
@Get('miniapp/bookings')
async getBookings(@Param('userId') userId: string) {
  return this.bookingQueryService.getCustomerBookings(userId);
}

// SAME DATA IN TWO PLACES
```

### Why It Appears Attractive
- "Convenience" for quick checks
- "Accessibility" for chat users
- "Redundancy"

### Why It Corrupts Architecture
- Data exposure duplicated
- Staleness in two places
- Customer confusion
- Maintenance burden

### Prevention
- Operational data in MiniApp only
- Chat provides notifications only
- No operational queries in chat

---

## ANTI-PATTERN 5: Chat-Side Runtime Recreation

### What It Is

Chat recreates runtime that should be in MiniApp.

```typescript
// ❌ FORBIDDEN: Chat recreates MiniApp runtime
@Post('/book')
async handleBook(@Param('userId') userId: string) {
  // Chat implements full booking flow
  // This should be in MiniApp
  
  const dates = await this.getAvailableDates();
  await this.sendDatePicker(userId, dates);
  
  const selectedDate = await this.waitForResponse(userId);
  const times = await this.getAvailableTimes(selectedDate);
  await this.sendTimePicker(userId, times);
  
  const selectedTime = await this.waitForResponse(userId);
  await this.createBooking({ date: selectedDate, time: selectedTime });
}
```

### Why It Appears Attractive
- "No MiniApp needed"
- "Simpler" for some users
- "Backward compatibility"

### Why It Corrupts Architecture
- Runtime duplicated in chat
- Complex state management in chat
- Divergent UX
- Maintenance nightmare

### Prevention
- Runtime in MiniApp only
- Chat provides entry to MiniApp
- No runtime recreation in chat

---

## ANTI-PATTERN 6: Operational/Runtime Coupling

### What It Is

Operational surface depends on runtime implementation.

```typescript
// ❌ FORBIDDEN: Operational surface imports runtime
@Controller('miniapp/owner')
class OwnerDashboardController {
  constructor(
    private readonly bookingRuntimeService: BookingRuntimeService,  // ❌ WRONG
    private readonly supportRuntimeService: SupportRuntimeService,  // ❌ WRONG
  ) {}
  
  @Get('bookings')
  async getBookings() {
    // Operational surface should NOT import runtime
    return this.bookingRuntimeService.getBookings();  // ❌ WRONG
  }
}

// ✅ CORRECT: Operational surface imports query services
@Controller('miniapp/owner')
class OwnerDashboardController {
  constructor(
    private readonly bookingQueryService: BookingQueryService,  // ✅ CORRECT
    private readonly supportQueryService: SupportQueryService,  // ✅ CORRECT
  ) {}
  
  @Get('bookings')
  async getBookings() {
    return this.bookingQueryService.getBotBookings(botId);
  }
}
```

### Why It Appears Attractive
- "Convenience" of reusing runtime methods
- "Efficiency" of single service
- "Simplicity"

### Why It Corrupts Architecture
- Operational surface coupled to runtime
- Runtime changes break operational surface
- Violates runtime/operational separation
- Architecture degradation

### Prevention
- Operational surface imports query services only
- Runtime services isolated from operational surface
- Clear separation of concerns

---

## SUMMARY TABLE

| Anti-Pattern | Risk | Prevention |
|--------------|------|------------|
| Duplicated runtime flows | HIGH | Single runtime surface |
| Duplicated booking lifecycle | HIGH | Lifecycle in MiniApp only |
| Duplicated navigation trees | MEDIUM | Navigation in MiniApp only |
| Duplicated operational semantics | MEDIUM | Operational data in MiniApp only |
| Chat-side runtime recreation | VERY HIGH | Runtime in MiniApp only |
| Operational/runtime coupling | HIGH | Query services only |

---

**Version 1.0 — UNIT 07 — 2026-05-23**
