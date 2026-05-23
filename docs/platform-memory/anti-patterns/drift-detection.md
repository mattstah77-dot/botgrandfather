# Drift Detection

**Purpose:** How to detect architectural drift  
**Status:** CANONICAL — Tier 1 Anti-Pattern  
**Version:** 1.0

---

## DRIFT INDICATORS

### Indicator 1: Template-Specific Language in Core

```typescript
// ❌ DRIFT
class BotService {
  getLeadCount(botId: string) { } // Template-specific!
}

// ✅ CORRECT
class BotService {
  getBotOverview(botId: string) { }
}
// Lead count comes from LeadFunnelQueryService
```

### Indicator 2: Runtime Imports Operational

```typescript
// ❌ DRIFT
import { DashboardService } from '../miniapp/services/dashboard.service';
```

### Indicator 3: Event Naming Colon Notation

```typescript
// ❌ DRIFT
await analytics.trackEvent(botId, 'session:started');

// ✅ CORRECT
await analytics.trackEvent(botId, 'session.started');
```

### Indicator 4: Dashboard God-Class

```typescript
// ❌ DRIFT
class DashboardService {
  constructor(
    private leadFunnelQuery: LeadFunnelQueryService,
    private bookingQuery: BookingQueryService,
    private crmQuery: CRMQueryService,      // Adding more...
    // 5+ query services
  ) {}
}
```

### Indicator 5: Metadata Replaces Code

```typescript
// ❌ DRIFT
const logic = metadataService.getBusinessLogic();
```

### Indicator 6: Global Queries

```typescript
// ❌ DRIFT
async getAllCustomers() {
  return this.customerRepo.find();
}
```

### Indicator 7: Cross-Template Imports

```typescript
// ❌ DRIFT
import { BookingService } from '../booking/booking-runtime.service';
```

---

## DRIFT RESPONSE

When drift detected:

1. **Stop** — Do not continue implementation.
2. **Identify** — Which invariant is violated?
3. **Correct** — Fix the drift.
4. **Document** — Log in decision log.
5. **Prevent** — Add guardrails if needed.

---

**Version 1.0 — 2026-05-23**
