# Unified Operational Surface Philosophy

**Purpose:** Define canonical owner operational surface semantics  
**Status:** CANONICAL — Tier 1 Philosophy  
**Version:** 1.0  
**Unit:** 07 — Surface Interaction & Runtime UX Philosophy  
**Date:** 2026-05-23

---

## PLATFORM REALITY

BotGrandFather does NOT create:
- Separate admin panels per template
- Separate owner apps per capability
- Isolated template dashboards

Instead:
**ONE unified Owner Operational Surface exists.**

Accessible ONLY through:
- BotGrandFather platform
- Inline button entry

---

## UNIFIED OWNER OPERATIONAL SURFACE

### Definition

**Unified Owner Operational Surface** is the single, unified interface for owner to observe and manage all bots and capabilities.

### Characteristics

| Property | Value |
|----------|-------|
| **Unified** | Single surface for all capabilities |
| **Multi-Template** | All templates visible in one place |
| **Multi-Bot** | Owner switches between bots |
| **Operationally Composable** | Aggregates operational data |
| **Observational** | Shows data, does not orchestrate |

---

## WHAT UNIFIED SURFACE IS

### Unified Surface IS

| Aspect | Meaning |
|--------|---------|
| **Single Entry Point** | One MiniApp for all owner operations |
| **Multi-Bot Navigation** | Owner switches between bots |
| **Multi-Template Visibility** | All templates visible in unified view |
| **Operational Aggregation** | Aggregates metrics across capabilities |
| **Capability-Neutral Navigation** | Navigation composed from metadata |
| **Observational** | Shows operational reality |

### Unified Surface Code Examples

```typescript
// ✅ CORRECT: Unified owner surface
@Controller('miniapp/owner')
class OwnerDashboardController {
  @Get('overview')
  async getOwnerOverview(@Req() req: OwnerRequest) {
    const bots = await this.botService.getOwnerBots(req.ownerId);
    const metrics = await Promise.all(
      bots.map(bot => this.getBotMetrics(bot.id))
    );
    
    return {
      bots: bots.map((bot, i) => ({
        id: bot.id,
        name: bot.name,
        metrics: metrics[i],
      })),
    };
  }
  
  @Get('bots/:botId')
  async getBotDetails(@Param('botId') botId: string) {
    const bot = await this.botService.getBot(botId);
    const capabilities = await this.registry.getCapabilities(botId);
    
    return {
      bot,
      capabilities: capabilities.map(cap => ({
        key: cap.key,
        name: cap.name,
        metrics: cap.getMetrics(botId),
      })),
    };
  }
}
```

---

## WHAT UNIFIED SURFACE IS NOT

### Unified Surface IS NOT

| Aspect | Why Not |
|--------|---------|
| **Isolated Template Admin Panels** | Single unified surface |
| **Fragmented Dashboards** | All data in one place |
| **Separate Backoffice Systems** | One operational surface |
| **Orchestration Engine** | Observational only |
| **Workflow System** | No automated workflows |
| **Runtime Coordinator** | No runtime control |

### Unified Surface Forbidden Examples

```typescript
// ❌ FORBIDDEN: Isolated template admin panel
@Controller('miniapp/booking')
class BookingAdminController {
  // Separate admin panel for booking
  // FORBIDDEN: Should be in unified surface
}

// ❌ FORBIDDEN: Fragmented dashboards
@Controller('miniapp/support')
class SupportDashboardController {
  // Separate dashboard for support
  // FORBIDDEN: Should be in unified surface
}

// ❌ FORBIDDEN: Orchestration UX
@Controller('miniapp/owner')
class OwnerOrchestrationController {
  @Post('onboard-customer')
  async onboardCustomer(@Body() data: OnboardDto) {
    await this.bookingRuntimeService.createWelcomeBooking(data);
    await this.supportRuntimeService.createTicket(data);
    await this.leadFunnelService.createLead(data);
    // FORBIDDEN: Orchestration in operational surface
  }
}
```

---

## TEMPLATE SWITCHING

### Definition

Owner switches between templates within unified surface.

### Implementation

```typescript
// ✅ CORRECT: Template switching in unified surface
@Controller('miniapp/owner')
class OwnerDashboardController {
  @Get('bots/:botId/capabilities')
  async getBotCapabilities(@Param('botId') botId: string) {
    const capabilities = await this.registry.getCapabilities(botId);
    
    return capabilities.map(cap => ({
      key: cap.key,
      name: cap.name,
      icon: cap.icon,
      // Navigation metadata
    }));
  }
  
  @Get('bots/:botId/capabilities/:capKey')
  async getCapabilityView(
    @Param('botId') botId: string,
    @Param('capKey') capKey: string,
  ) {
    const capability = await this.registry.getCapability(capKey);
    return capability.getOperationalView(botId);
  }
}
```

---

## OPERATIONAL AGGREGATION

### Definition

Aggregate operational data across capabilities.

### Implementation

```typescript
// ✅ CORRECT: Operational aggregation
@Injectable()
class OwnerDashboardService {
  async getOwnerMetrics(ownerId: string) {
    const providers = this.registry.getAll();
    
    let totalInteractions = 0;
    for (const provider of providers) {
      const metrics = await provider.getOwnerMetrics(ownerId);
      totalInteractions += metrics.total;
    }
    
    return { totalInteractions };  // Capability-neutral
  }
}
```

---

## OPERATIONAL ISOLATION

### Definition

Each capability's operational data is isolated within unified surface.

### Implementation

```typescript
// ✅ CORRECT: Operational isolation
@Controller('miniapp/owner')
class OwnerDashboardController {
  @Get('bots/:botId/bookings')
  async getBotBookings(@Param('botId') botId: string) {
    // Booking data only
    return this.bookingQueryService.getBotBookings(botId);
  }
  
  @Get('bots/:botId/tickets')
  async getBotTickets(@Param('botId') botId: string) {
    // Support data only
    return this.supportQueryService.getBotTickets(botId);
  }
  
  // No cross-capability queries
  // No cross-capability mutations
}
```

---

## CAPABILITY-NEUTRAL NAVIGATION

### Definition

Navigation composed from metadata, not hardcoded.

### Implementation

```typescript
// ✅ CORRECT: Capability-neutral navigation
interface OwnerModule {
  key: string;           // 'booking', 'support', 'lead-funnel'
  name: string;          // Display name
  icon: string;          // UI icon
  settingsSchema: any;   // JSON schema
  dashboardWidgets: any; // Widget config
}

// Navigation composed from registry
const navigation = registry.getAll().map(module => ({
  key: module.key,
  name: module.name,
  icon: module.icon,
  path: `/owner/bots/:botId/${module.key}`,
}));
```

---

## CANONICAL RULES

### Rule 1: One Unified Surface

Single Owner Operational Surface for all capabilities.

### Rule 2: No Isolated Admin Panels

No separate admin panels per template.

### Rule 3: No Fragmented Dashboards

All operational data in unified view.

### Rule 4: Template Switching Within Surface

Owner switches templates within unified surface.

### Rule 5: Operational Aggregation Is Neutral

Aggregated metrics are capability-neutral.

### Rule 6: Operational Isolation Preserved

Each capability's data isolated within unified view.

### Rule 7: Navigation Is Metadata-Driven

Navigation composed from OwnerModuleRegistry metadata.

### Rule 8: Observational Only

Unified surface observes, does not orchestrate.

---

**Version 1.0 — UNIT 07 — 2026-05-23**
