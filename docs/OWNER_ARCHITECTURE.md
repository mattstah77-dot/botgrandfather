# BotGrandFather — Universal Owner Architecture

## Core Architectural Vision

The platform evolves from **template-centric** to **platform-centric**:

```
BEFORE (template-centric):
  Lead Funnel → Leads → Lead Admin Panel
  Booking     → Bookings → Booking Admin Panel
  Shop        → Orders → Shop Admin Panel

AFTER (platform-centric):
  ┌─────────────────────────────────────────┐
  │           OWNER DASHBOARD               │
  │  (universal UI, reusable components)    │
  └─────────────────────────────────────────┘
                    │
  ┌─────────────────────────────────────────┐
  │         UNIVERSAL BUSINESS LAYER        │
  │  Owners • Bots • Customers • Analytics  │
  │  Events • Messaging • Billing           │
  └─────────────────────────────────────────┘
                    │
  ┌─────────────────────────────────────────┐
  │         TEMPLATE RUNTIME LAYER          │
  │  Lead Funnel • Booking • AI • VPN       │
  │  (runtime flows, template-specific)     │
  └─────────────────────────────────────────┘
```

## Key Principles

### 1. Universal Customer Layer

Every bot user is a **Customer**.

- **Customer** = universal identity across all templates
- **Lead** = template-specific data (answers from lead-funnel)
- **Booking** = template-specific data (time slot from booking)
- **Order** = template-specific data (items from shop)

**Migration path:**
- Phase 1: Customer created alongside Lead (current)
- Phase 2: All templates use Customer layer
- Phase 3: Lead/Booking/Order become views on Customer

### 2. Runtime vs Owner System Separation

| Runtime Layer | Owner Layer |
|--------------|-------------|
| Webhook processing | Dashboard API |
| User conversations | Bot management |
| Funnel flows | Customer CRM |
| Template logic | Analytics overview |
| Telegram messages | Settings configuration |

**Never mix:**
- Runtime handlers should NOT query owner APIs
- Owner APIs should NOT trigger runtime flows

### 3. Template Owner Modules

Every template registers owner-facing capabilities:

```typescript
registerOwnerModule({
  template: 'lead-funnel',
  navigation: [...],      // sidebar sections
  settings: [...],        // config forms
  analyticsWidgets: [...], // dashboard widgets
});
```

The mini app renders UI dynamically from this registry.
No template-specific conditionals in the owner layer.

### 4. Reusable Analytics

All templates emit the same event types:
- `customer:created`
- `customer:converted`
- `funnel:started`
- `funnel:completed`

Analytics service aggregates across all templates.

### 5. Multi-Tenant Safety

Every query MUST filter by:
- `botId` for bot-scoped data
- `ownerId` for owner-scoped data

**Golden rule:** No query without a tenant filter.

## Future Roadmap

### v1.1 — Customer Layer Maturity
- [ ] All templates create Customers
- [ ] Customer tags & notes management API
- [ ] Customer search & filtering

### v1.2 — Mini App Foundation
- [ ] Telegram WebApp auth (initData verification)
- [ ] Owner dashboard skeleton
- [ ] Dynamic navigation from OwnerModule registry

### v1.3 — Template Ecosystem
- [ ] Booking template
- [ ] AI Assistant template
- [ ] Each template registers OwnerModule

### v1.4 — Advanced Analytics
- [ ] Conversion funnels
- [ ] Time-series charts
- [ ] Customer segmentation

### v1.5 — Automation
- [ ] Trigger-based automations
- [ ] Message sequences
- [ ] Webhook integrations

## Anti-Patterns (NEVER do)

1. **Separate admin panels per template**
   - Bad: `/admin/lead-funnel`, `/admin/booking`
   - Good: Universal dashboard with dynamic modules

2. **Template-specific customer tables**
   - Bad: `lead_customers`, `booking_customers`
   - Good: Universal `customers` table

3. **Runtime logic in owner APIs**
   - Bad: Owner API sends Telegram messages
   - Good: Owner API only reads/configures

4. **Giant template conditionals**
   - Bad: `if (template === 'lead-funnel') { ... }`
   - Good: Registry pattern, dynamic resolution
