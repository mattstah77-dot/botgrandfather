# Dashboard Aggregation Contracts

**Purpose:** Define dashboard aggregation patterns  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0

---

## CAPABILITY PROVIDER PATTERN

### Problem

Without pattern, DashboardService injects all query services directly:

```typescript
// ❌ FORBIDDEN — God-class
class DashboardService {
  constructor(
    private leadFunnelQuery: LeadFunnelQueryService,
    private bookingQuery: BookingQueryService,
    private crmQuery: CRMQueryService,      // Adding more...
    private shopQuery: ShopQueryService,    // ...and more
    // 5+ query services = god-class
  ) {}
}
```

### Solution

Capability Provider pattern with registry:

```typescript
// ✅ CORRECT
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

### Adding New Capability

```typescript
// ✅ CORRECT — One parameter change
@Injectable()
class DashboardCapabilityRegistry {
  constructor(
    private leadFunnelProvider: LeadFunnelQueryService,
    private bookingProvider: BookingQueryService,
    // Add new provider here:
    // private crmProvider: CRMQueryService,
  ) {
    this.register(leadFunnelProvider);
    this.register(bookingProvider);
    // this.register(crmProvider);
  }
}
```

**DashboardService requires ZERO changes.**

---

## REGISTRY CONTRACT

### Registration

```typescript
interface DashboardCapabilityRegistry {
  register(provider: DashboardCapabilityProvider): void;
  getAll(): DashboardCapabilityProvider[];
  getByKey(key: string): DashboardCapabilityProvider | undefined;
}
```

### Provider Interface

```typescript
interface DashboardCapabilityProvider {
  getCapabilityKey(): string;
  getOwnerMetrics(ownerId: string): Promise<CapabilityMetrics>;
  getBotMetrics(botId: string): Promise<CapabilityMetrics>;
}

interface CapabilityMetrics {
  total: number;
  active?: number;
  converted?: number;
  [key: string]: any;
}
```

---

## AGGREGATION RULES

### Capability-Neutral Metrics

```typescript
// ✅ CORRECT
interface DashboardStats {
  totalBots: number;
  totalCustomers: number;
  totalInteractions: number;
}

// ❌ FORBIDDEN
interface DashboardStats {
  totalBots: number;
  totalLeads: number;
  totalBookings: number;
}
```

### Explicit Aggregation

```typescript
// ✅ CORRECT
const providers = this.registry.getAll();
for (const provider of providers) {
  const metrics = await provider.getOwnerMetrics(ownerId);
  totalInteractions += metrics.total;
}

// ❌ FORBIDDEN
const leadCount = await leadFunnelQuery.countLeadsByBotIds(botIds);
const bookingCount = await bookingQuery.countBookingsByBotIds(botIds);
```

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial dashboard aggregation contract |

---

**Version 1.0 — 2026-05-23**
