# Template Isolation

**Purpose:** Templates are strictly isolated  
**Status:** CANONICAL — Tier 1 Invariant  
**Version:** 1.0

---

## THE LAW

> **Templates are isolated. No cross-template imports. No template modifies core platform.**

---

## ISOLATION BOUNDARIES

### File System Isolation

```
src/templates/
├── lead-funnel/
│   ├── lead-funnel.service.ts
│   ├── lead-funnel-query.service.ts
│   └── entities/
│       └── lead.entity.ts
├── booking/
│   ├── booking-runtime.service.ts
│   ├── booking-query.service.ts
│   └── entities/
│       └── booking.entity.ts
```

Each template lives in its own directory.

### Import Isolation

**FORBIDDEN:**
```typescript
// lead-funnel.service.ts importing booking
import { BookingService } from '../booking/booking-runtime.service';

// booking.service.ts importing lead-funnel
import { LeadFunnelService } from '../lead-funnel/lead-funnel.service';
```

**ALLOWED:**
```typescript
// Template importing universal services
import { CustomerService } from '../../customer/customer.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { BotService } from '../../bot/bot.service';
```

### Entity Isolation

Template-specific entities are NOT universal.

```typescript
// ✅ CORRECT — Booking template has Booking entity
@Entity()
class Booking { }

// ❌ FORBIDDEN — Booking entity imported by Lead Funnel
import { Booking } from '../booking/entities/booking.entity';
```

### Service Isolation

Template services are NOT shared.

```typescript
// ✅ CORRECT — Each template has own service
class LeadFunnelService { }
class BookingRuntimeService { }

// ❌ FORBIDDEN — Shared template service
class UniversalTemplateService { } // NO!
```

---

## REGISTRATION

### Manual Registration

Templates are registered manually in `TemplateFactory`.

```typescript
// ✅ CORRECT
@Injectable()
class TemplateFactory {
  constructor(
    private leadFunnelService: LeadFunnelService,
    private bookingService: BookingRuntimeService,
  ) {}

  getTemplate(type: string) {
    switch (type) {
      case 'lead-funnel': return this.leadFunnelService;
      case 'booking': return this.bookingService;
      default: throw new Error('Unknown template');
    }
  }
}
```

**No auto-discovery. No reflection. No dynamic loading.**

### Metadata Registration

Templates register metadata in `OwnerModuleRegistry`.

```typescript
// ✅ CORRECT
interface OwnerModule {
  key: string;           // 'lead-funnel', 'booking'
  name: string;          // Display name
  icon: string;          // UI icon
  settingsSchema: any;   // JSON schema
  dashboardWidgets: any; // Widget config
}
```

---

## TEMPLATE DATA OWNERSHIP

### Template-Specific Data

Template-specific data belongs to template.

| Data | Owner |
|------|-------|
| Booking slots | Booking template |
| Lead responses | Lead Funnel template |
| Customer tags | Universal (Customer entity) |
| Customer status | Universal (Customer entity) |
| Analytics events | Universal (AnalyticsEvent entity) |

### Universal Data

Universal data belongs to platform.

| Data | Owner |
|------|-------|
| Customer entity | Platform |
| Bot entity | Platform |
| AnalyticsEvent entity | Platform |
| Owner entity | Platform |
| Plan limits | Platform |

---

## INVARIANTS

> **Invariant TI.1:** Templates do NOT import each other.

> **Invariant TI.2:** Templates do NOT modify core platform services.

> **Invariant TI.3:** Template registration is manual (code change), not dynamic.

> **Invariant TI.4:** Template-specific data belongs to template. Universal data belongs to platform.

> **Invariant TI.5:** Template services are isolated. No shared template base class.

> **Invariant TI.6:** Templates register metadata, not runtime code modifications.

---

**Version 1.0 — 2026-05-23**
