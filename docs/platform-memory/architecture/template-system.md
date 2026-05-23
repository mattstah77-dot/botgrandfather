# Template System

**Purpose:** Describe template architecture  
**Status:** CANONICAL — Tier 4 Description  
**Version:** 1.0

---

## DEFINITION

Templates are isolated business logic modules for specific use cases.

Each template is a self-contained unit.

---

## STRUCTURE

```
src/templates/
├── template.factory.ts          ← Manual registration
├── template.interface.ts        ← Common interface
├── lead-funnel/
│   ├── lead-funnel.service.ts       ← Runtime service
│   ├── lead-funnel-query.service.ts ← Query service
│   └── entities/
│       └── lead.entity.ts
└── booking/
    ├── booking-runtime.service.ts   ← Runtime service
    ├── booking-query.service.ts     ← Query service
    └── entities/
        └── booking.entity.ts
```

---

## REGISTRATION

### Manual

```typescript
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

### Metadata

```typescript
interface OwnerModule {
  key: string;
  name: string;
  icon: string;
  route: string;
  settingsSchema: any;
  dashboardWidgets: any;
}
```

---

## ISOLATION

- Templates do NOT import each other.
- Templates do NOT modify core platform.
- Templates register metadata, not runtime code.
- Template-specific data in template entities.

---

**Version 1.0 — 2026-05-23**
