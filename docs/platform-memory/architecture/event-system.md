# Event System

**Purpose:** Describe event system architecture  
**Status:** CANONICAL — Tier 4 Description  
**Version:** 1.0

---

## DEFINITION

Event system tracks business facts for analytics.

Events are synchronous side effects, not asynchronous orchestration.

---

## COMPONENTS

### Analytics Service

```typescript
@Injectable()
class AnalyticsService {
  async trackEvent(
    botId: string,
    eventType: string,
    metadata?: Record<string, any>,
  ): Promise<AnalyticsEvent>;

  async getEvents(botId: string): Promise<AnalyticsEvent[]>;
}
```

### Analytics Event Entity

```typescript
@Entity()
class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  botId: string;

  @Column()
  eventType: string;  // Canonical name

  @Column('simple-json', { default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## EMISSION PATTERN

```typescript
// ✅ CORRECT — Synchronous side effect
const customer = await customerService.ensureCustomer(botId, userId, profile);
await analytics.trackEvent(botId, 'customer.created', {
  customerId: customer.id,
  source: 'webhook',
});

// ❌ FORBIDDEN — Event-driven orchestration
await eventBus.emit('customer.created', { customerId: customer.id });
// Handler sends email, updates CRM, triggers automation
```

---

## EVENT CATEGORIES

| Category | Examples | Purpose |
|----------|----------|---------|
| Runtime | `session.started`, `session.completed` | Business flow tracking |
| Conversion | `conversion.completed` | Goal achievement |
| Customer | `customer.created`, `customer.converted` | Lifecycle tracking |
| Capability | `booking.created`, `booking.confirmed` | Template-specific |
| Platform | `bot.connected`, `quota.exceeded` | Infrastructure |

---

**Version 1.0 — 2026-05-23**
