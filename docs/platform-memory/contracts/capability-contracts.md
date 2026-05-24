# Capability Contracts

**Purpose:** Define how capabilities integrate with platform  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0

---

## DEFINITION

A **capability** is a business domain that a template implements.

Examples:
- Lead management (Lead Funnel template)
- Booking/scheduling (Booking template)
- Customer relationship (universal, all templates)

A **template** is a concrete implementation of one or more capabilities.

---

## CAPABILITY PROVIDER CONTRACT

### Interface

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

### Registration

```typescript
// ✅ CORRECT — Explicit registration
@Injectable()
class DashboardCapabilityRegistry {
  constructor(
    private leadFunnelProvider: LeadFunnelQueryService,
    private bookingProvider: BookingQueryService,
  ) {
    this.register(leadFunnelProvider);
    this.register(bookingProvider);
  }
}
```

### Implementation

```typescript
// ✅ CORRECT — Template implements provider
@Injectable()
class BookingQueryService implements DashboardCapabilityProvider {
  getCapabilityKey() { return 'booking'; }

  async getOwnerMetrics(ownerId: string) {
    const botIds = await this.getOwnerBotIds(ownerId);
    return { total: await this.countBookings(botIds) };
  }

  async getBotMetrics(botId: string) {
    return { total: await this.countBookings([botId]) };
  }
}
```

---

## CAPABILITY NEUTRALITY

Platform metrics are capability-neutral:

```typescript
// ✅ CORRECT
interface DashboardStats {
  totalBots: number;
  totalCustomers: number;
  totalInteractions: number; // Not totalLeads or totalBookings
}

// ❌ FORBIDDEN
interface DashboardStats {
  totalBots: number;
  totalLeads: number;
  totalBookings: number;
}
```

---

## ACTION CONTRACT REFERENCE

Actions are operational descriptors, not behavior metadata.

See: `contracts/action-contracts.md` for full action contract definition.

### Quick Reference

```typescript
interface CapabilityAction {
  id: string;
  label: string;
  type: 'navigate' | 'lifecycle';
  route?: string;
  endpoint?: { method: 'POST' | 'DELETE' | 'PATCH'; path: string; };
  icon?: string;
}
```

### Rules

1. Actions are navigation descriptors only.
2. Backend decides availability. Frontend renders.
3. No behavior, conditions, or orchestration in metadata.

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial capability provider contract |

---

**Version 1.0 — 2026-05-23**
