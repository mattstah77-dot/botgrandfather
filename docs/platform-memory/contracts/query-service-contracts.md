# Query Service Contracts

**Purpose:** Define query service pattern for operational layer  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0

---

## PATTERN DEFINITION

Query services are READ-ONLY operational services.

They provide dashboard and analytics data.

They do NOT modify state.

---

## CONTRACT RULES

### Read-Only

```typescript
// ✅ CORRECT
@Injectable()
class BookingQueryService {
  async countBookings(botIds: string[]): Promise<number> { }
  async getRecentBookings(botId: string): Promise<Booking[]> { }
}

// ❌ FORBIDDEN
@Injectable()
class BookingQueryService {
  async createBooking(params): Promise<Booking> { } // NO! Use runtime service
}
```

### Ownership-Scoped

```typescript
// ✅ CORRECT
async getOwnerMetrics(ownerId: string) {
  const botIds = await this.getOwnerBotIds(ownerId);
  return { total: await this.countBookings(botIds) };
}

// ❌ FORBIDDEN
async getAllMetrics() {
  return { total: await this.countAllBookings() }; // No owner scope!
}
```

### Capability Provider Interface

```typescript
// ✅ CORRECT
class BookingQueryService implements DashboardCapabilityProvider {
  getCapabilityKey() { return 'booking'; }
  async getOwnerMetrics(ownerId: string) { }
  async getBotMetrics(botId: string) { }
}
```

---

## SEPARATION FROM RUNTIME

| Aspect | Runtime Service | Query Service |
|--------|----------------|---------------|
| Writes | ✅ Yes | ❌ No |
| Reads | ✅ Yes | ✅ Yes |
| Webhook handling | ✅ Yes | ❌ No |
| Dashboard data | ❌ No | ✅ Yes |
| Analytics | ✅ Emits | ✅ Queries |
| State changes | ✅ Yes | ❌ No |

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-23 | Initial query service contract |

---

**Version 1.0 — 2026-05-23**
