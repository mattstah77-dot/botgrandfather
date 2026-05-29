# Surface Taxonomy Contracts

**Purpose:** Define canonical surface taxonomy for BotGrandFather  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## SURFACE DEFINITION

**Surface** is a human-facing interaction layer that provides access to runtime or operational capabilities.

### Surface IS

| Aspect | Meaning |
|--------|---------|
| **Human Interaction Layer** | Provides UI for humans to interact with system |
| **Access Point** | Gateway to runtime or operational capabilities |
| **Projection Consumer** | Consumes projections from capabilities |
| **Navigation Layer** | Provides routing between business flows |

### Surface is NOT

| Aspect | Why Not |
|--------|---------|
| **Execution Layer** | Does not mutate business state directly |
| **Orchestration Layer** | Does not coordinate cross-capability actions |
| **Business Logic Layer** | Does not implement business rules |
| **Authority Layer** | Does not own truth |

---

## SURFACE 1 — CUSTOMER RUNTIME SURFACE

### Definition

**Customer Runtime Surface** is the friction-minimized interface for customers to interact with business capabilities.

### Characteristics

| Property | Value |
|----------|-------|
| **Ownership** | Capability-specific (Booking, Support, LeadFunnel) |
| **Purpose** | Business interaction runtime (booking flow, service selection) |
| **Actor** | Customer |
| **Authority** | Advisory (runtime validates at write time) |
| **Runtime Semantics** | Stateful progression through business flows |
| **Operational Semantics** | None (purely customer-facing) |
| **Access Layer** | Chat + MiniApp (hybrid) |

### Components

- **Chat Interface**: Inline buttons, text commands, quick actions
- **MiniApp Runtime**: Slot picker, booking form, service selection
- **State Tracking**: UserState for flow progression
- **Navigation**: Inline button navigation between runtime steps

### Forbidden Responsibilities

| Forbidden | Why |
|-----------|-----|
| **Orchestrate capabilities** | Capabilities are isolated |
| **Coordinate cross-capability flows** | No cross-capability workflows |
| **Own business logic** | Business logic in runtime services |
| **Duplicate runtime** | Single runtime per capability |
| **Become operational dashboard** | Observational only in MiniApp |

### Example: Booking Runtime

```typescript
// ✅ CORRECT: Customer runtime surface
// Chat entry
@Post('/start')
async handleStart(@Param('botId') botId: string, @Param('userId') userId: string) {
  // Greet customer, show inline button to open MiniApp
  await this.telegram.sendMessage(userId, 'Welcome! Book an appointment: [Open MiniApp]');
}

// MiniApp runtime
@Get('miniapp/bookings/slots')
async getSlots(@Param('botId') botId: string, @Query('date') date: string) {
  // Query capability, return slots
  return this.bookingQueryService.getAvailableSlots(botId, date);
}

@Post('miniapp/bookings/confirm')
async confirmBooking(@Body() data: CreateBookingDto) {
  // Validate at write time, create booking
  return this.bookingRuntimeService.createBooking(data);
}
```

---

## SURFACE 2 — OWNER OPERATIONAL SURFACE

### Definition

**Owner Operational Surface** is the unified interface for owners to observe and manage their bots.

### Characteristics

| Property | Value |
|----------|-------|
| **Ownership** | Platform (unified across all bots/templates) |
| **Purpose** | Operational visibility, management, analytics |
| **Actor** | Owner |
| **Authority** | Observational only (read-only projections) |
| **Runtime Semantics** | None (purely observational) |
| **Operational Semantics** | Multi-template, multi-bot aggregation |
| **Access Layer** | MiniApp only (unified dashboard) |

### Components

- **Unified Dashboard**: Single entry point for all owner bots
- **Bot Switcher**: Switch between owner's bots
- **Template Switcher**: Switch between capability views
- **Operational Projections**: Booking metrics, ticket lists, lead analytics
- **Capability-Specific Controllers**: POST to capability endpoints

### Forbidden Responsibilities

| Forbidden | Why |
|-----------|-----|
| **Execute cross-capability actions** | No orchestration |
| **Coordinate workflows** | No workflow systems |
| **Synchronize capabilities** | No sync infrastructure |
| **Trigger automation** | No automation triggers |
| **Become orchestration engine** | Observational only |

### Example: Owner Operational Surface

```typescript
// ✅ CORRECT: Owner operational surface
// Unified dashboard
@Get('miniapp/owner/dashboard')
async getDashboard(@Param('ownerId') ownerId: string) {
  const bots = await this.botService.getOwnerBots(ownerId);
  const metrics = await Promise.all(bots.map(bot => this.getBotMetrics(bot.id)));
  
  return { bots, totalMetrics: this.aggregateMetrics(metrics) };
  // Observational only — no mutations
}

// Capability-specific mutation (separate controller)
@Post('miniapp/bots/:id/bookings/:bookingId/confirm')
async confirmBooking(
  @Param('id') botId: string,
  @Param('bookingId') bookingId: string,
) {
  return this.bookingRuntimeService.confirmBooking(bookingId);
  // Mutation goes to capability runtime, not dashboard
}
```

---

## SURFACE 3 — PLATFORM SURFACE

### Definition

**Platform Surface** is the infrastructure management interface for platform administrators.

### Characteristics

| Property | Value |
|----------|-------|
| **Ownership** | Platform (admin only) |
| **Purpose** | Ecosystem management, analytics, monetization |
| **Actor** | Platform Admin |
| **Authority** | Infrastructure only (not business state) |
| **Runtime Semantics** | None |
| **Operational Semantics** | Platform-level analytics, tenant management |
| **Access Layer** | Separate admin panel (isolated from owner/customer) |

### Components

- **Platform Analytics**: System-wide metrics, usage patterns
- **Tenant Management**: Owner/bot management
- **Monetization**: Plan limits, billing, subscriptions
- **Platform Health**: System monitoring, error tracking

### Forbidden Responsibilities

| Forbidden | Why |
|-----------|-----|
| **Access customer business data** | Privacy |
| **Modify owner operational state** | Owner authority |
| **Coordinate business flows** | Platform is infrastructure |
| **Become operational dashboard** | Separate concerns |

### Example: Platform Surface

```typescript
// ✅ CORRECT: Platform surface (isolated)
@Controller('admin/platform')
@UseGuards(PlatformAdminGuard)
class PlatformAdminController {
  @Get('analytics')
  async getPlatformAnalytics() {
    // Aggregated, anonymized metrics only
    return this.analyticsService.getPlatformMetrics();
  }
  
  @Get('tenants')
  async getTenants() {
    // List owners/bots (metadata only)
    return this.botService.getAllBots();
  }
}
```

---

## SURFACE MATRIX

| Surface | Actor | Purpose | Authority | Access | Multi-Template |
|---------|-------|---------|-----------|--------|----------------|
| **Customer Runtime** | Customer | Business interaction | Advisory | Chat + MiniApp | No (capability-specific) |
| **Owner Operational** | Owner | Operational visibility | Observational | MiniApp only | Yes (unified) |
| **Platform** | Platform Admin | Infrastructure | Infrastructure | Admin panel | Yes (ecosystem) |

---

## CANONICAL RULES

### Rule 1: Customer Runtime Is Capability-Specific

Each capability has its own runtime surface. No universal runtime.

### Rule 2: Owner Surface Is Unified

Single operational surface for all owner bots/templates.

### Rule 3: Platform Surface Is Isolated

Platform surface is separate from owner/customer surfaces.

### Rule 4: Surfaces Do Not Execute

Surfaces consume projections. Mutations go to runtime services.

### Rule 5: Surfaces Do Not Orchestrate

No cross-capability workflows in any surface.

### Rule 6: Chat Is Runtime Access Layer

Chat provides entry points, not full runtime.

### Rule 7: MiniApp Is Unified Operational Surface

Owner dashboard is accessible ONLY through unified MiniApp.

### Rule 8: No Fragmented Admin Panels

No separate admin panels per template. Single unified operational surface.

---

**Version 1.0 — UNIT 07 — 2026-05-23**
