# Dashboard System

**Purpose:** Describe dashboard architecture  
**Status:** CANONICAL — Tier 4 Description  
**Version:** 1.0

---

## DEFINITION

Dashboard aggregates metrics across all owner bots using Capability Provider pattern.

It is template-agnostic and capability-neutral.

---

## COMPONENTS

### Dashboard Service

```typescript
@Injectable()
class DashboardService {
  constructor(private registry: DashboardCapabilityRegistry) {}

  async getOwnerStats(ownerId: string) {
    const providers = this.registry.getAll();
    let totalInteractions = 0;
    for (const provider of providers) {
      const metrics = await provider.getOwnerMetrics(ownerId);
      totalInteractions += metrics.total;
    }
    return { totalInteractions };
  }
}
```

### Capability Registry

```typescript
@Injectable()
class DashboardCapabilityRegistry {
  private providers = new Map<string, DashboardCapabilityProvider>();

  constructor(
    private leadFunnelProvider: LeadFunnelQueryService,
    private bookingProvider: BookingQueryService,
  ) {
    this.register(leadFunnelProvider);
    this.register(bookingProvider);
  }

  register(provider: DashboardCapabilityProvider) {
    this.providers.set(provider.getCapabilityKey(), provider);
  }

  getAll(): DashboardCapabilityProvider[] {
    return Array.from(this.providers.values());
  }
}
```

### Capability Provider Interface

```typescript
interface DashboardCapabilityProvider {
  getCapabilityKey(): string;
  getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics>;
  getBotMetrics(botId: string): Promise<CapabilityMetrics>;
}
```

---

## EXTENSIBILITY

Adding new capability requires:
1. Implement `DashboardCapabilityProvider` in query service.
2. Add provider to registry constructor.
3. **Zero changes to DashboardService.**

---

**Version 1.0 — 2026-05-23**
