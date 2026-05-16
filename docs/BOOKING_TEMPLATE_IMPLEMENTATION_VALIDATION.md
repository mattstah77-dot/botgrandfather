# BOTGRANDFATHER — BOOKING TEMPLATE IMPLEMENTATION VALIDATION

**Role:** Principal Backend Architect & Runtime Integrity Reviewer  
**Date:** 2026-05-11  
**Scope:** Validate Booking Template integration without architectural drift  
**Constraint:** NO framework-building, NO premature abstraction, NO ecosystem invention

---

## SECTION 1 — MODULE DEPENDENCY VALIDATION

### 1.1 Allowed Dependencies (Booking Template)

```
src/templates/booking/
├── booking.service.ts
│   ├── CustomerService (ensureCustomer, updateStatus)
│   ├── AnalyticsService (trackEvent)
│   ├── TelegramService (sendMessage, answerCallbackQuery)
│   ├── BotService (getBotConfig, getBotById)
│   └── DataSource (transaction management)
│
├── booking.handler.ts
│   └── BookingService (business logic dispatch)
│
├── entities/
│   ├── booking.entity.ts
│   └── booking-slot.entity.ts
│
└── dto/
    ├── create-booking.dto.ts
    └── update-booking.dto.ts
```

**Explicit Allowed Import List:**

| Import | Source | Purpose |
|--------|--------|---------|
| `CustomerService` | `src/customer/customer.service.ts` | Universal customer lifecycle |
| `AnalyticsService` | `src/analytics/analytics.service.ts` | Generic event tracking |
| `TelegramService` | `src/telegram/telegram.service.ts` | Bot API communication |
| `BotService` | `src/bot/bot.service.ts` | Bot config retrieval (ownerChatId) |
| `DataSource` | `typeorm` | Transaction management |
| `TemplateContext` | `src/templates/template.interface.ts` | Runtime contract |
| `TemplateHandler` | `src/templates/template.interface.ts` | Handler contract |
| `TemplateService` | `src/templates/template.interface.ts` | Service contract |

### 1.2 Forbidden Dependencies (Will Create Drift)

| Import | Source | Why Forbidden |
|--------|--------|---------------|
| `DashboardService` | `src/miniapp/services/dashboard.service.ts` | Runtime imports Operational |
| `NavigationService` | `src/miniapp/services/navigation.service.ts` | Runtime imports Operational |
| `OwnerViewService` | `src/miniapp/services/owner-view.service.ts` | Runtime imports Operational |
| `LeadFunnelService` | `src/templates/lead-funnel/lead-funnel.service.ts` | Cross-template coupling |
| `LeadFunnelHandler` | `src/templates/lead-funnel/lead-funnel.handler.ts` | Cross-template coupling |
| `MiniAppAuthGuard` | `src/miniapp/auth/miniapp-auth.guard.ts` | Runtime imports Operational auth |
| `BotOwnershipGuard` | `src/ownership/bot-ownership.guard.ts` | Runtime imports Operational security |

### 1.3 Safe Dependency Graph

```
src/templates/booking/
├── BookingService
│   ├── src/customer/CustomerService ✅
│   ├── src/analytics/AnalyticsService ✅
│   ├── src/telegram/TelegramService ✅
│   ├── src/bot/BotService ✅
│   └── typeorm/DataSource ✅
│
├── BookingHandler
│   └── BookingService ✅
│
└── BookingController (Mini App)
    ├── BookingService ✅
    ├── BotOwnershipGuard ✅
    └── MiniAppAuthGuard ✅
```

### 1.4 Dangerous Dependency Graph (Drift)

```
src/templates/booking/
├── BookingService
│   ├── src/miniapp/DashboardService ❌ (Runtime → Operational)
│   ├── src/templates/lead-funnel/LeadFunnelService ❌ (Cross-template)
│   └── src/ownership/BotOwnershipGuard ❌ (Runtime → Operational)
│
├── BookingHandler
│   └── src/miniapp/NavigationService ❌ (Runtime → Operational)
```

### 1.5 Hidden Coupling Detection

**Hidden Coupling Risk 1: BotService.getBotConfig()**
- **Risk:** BotService returns `config` field. Booking template may expect `config.services` array.
- **Check:** Does BotService config schema allow arbitrary keys?
- **Current State:** `config` is `Record<string, any>` — safe.
- **Verdict:** ✅ No hidden coupling. Config is generic JSON.

**Hidden Coupling Risk 2: CustomerService.updateStatus()**
- **Risk:** Customer status enum may not include booking-relevant states.
- **Current States:** `'new' | 'active' | 'converted'`
- **Booking Need:** Customer becomes `'active'` after booking.
- **Check:** Is `'active'` sufficient for booking?
- **Verdict:** ✅ `'active'` is universal. No hidden coupling.

**Hidden Coupling Risk 3: AnalyticsService.trackEvent()**
- **Risk:** Event metadata may have size limits or validation.
- **Current State:** Metadata is `Record<string, any>` (JSONB in DB).
- **Verdict:** ✅ No hidden coupling. Metadata is flexible.

**Hidden Coupling Risk 4: UserState Entity**
- **Risk:** UserState.payload may not be large enough for booking interim data.
- **Current State:** Payload is `jsonb` — unlimited size.
- **Verdict:** ✅ No hidden coupling. Payload is flexible.

### 1.6 Architectural Consequences

**If allowed dependencies preserved:**
- ✅ Runtime remains independent of Operational
- ✅ Templates remain isolated
- ✅ Core platform unchanged
- ✅ New templates follow same pattern

**If forbidden dependencies introduced:**
- ❌ Runtime depends on Operational (circular risk)
- ❌ Templates depend on each other (maintenance hell)
- ❌ Core platform becomes template-aware (drift)
- ❌ Future templates require core changes (scalability loss)

---

## SECTION 2 — ENTITY BOUNDARY REVIEW

### 2.1 Universal Entities (MUST NOT Be Template-Aware)

**Customer Entity — Current State:**
```typescript
@Entity('customers')
@Unique(['botId', 'telegramUserId'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  telegramUserId: bigint;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ default: 'new' })
  status: 'new' | 'active' | 'converted';

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Customer — Fields That Are Acceptable:**
- `status: 'new' | 'active' | 'converted'` — Universal lifecycle states
- `tags: string[]` — Universal tagging system
- `profile: Record<string, any>` — Universal profile (minimal)

**Customer — Fields That Are FORBIDDEN:**
```typescript
// ❌ FORBIDDEN — Template pollution
@Column({ type: 'jsonb', default: {} })
funnelAnswers: Record<string, string>;  // Lead-funnel specific

@Column({ type: 'jsonb', default: {} })
bookingData: {                          // Booking specific
  serviceId: string;
  date: Date;
  timeSlot: string;
};

@Column({ type: 'jsonb', default: {} })
orderData: {                            // Shop specific
  orderId: string;
  items: any[];
};

@Column({ type: 'jsonb', default: {} })
conversationData: {                     // AI assistant specific
  messages: any[];
  model: string;
};
```

### 2.2 Template Entities (Booking-Specific)

**Booking Entity — Template-Specific:**
```typescript
@Entity('bookings')
@Index(['botId', 'userId'])
@Index(['botId', 'date', 'timeSlot'])
@Index(['createdAt'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  botId: string;

  @Column({ type: 'bigint' })
  @Index()
  userId: bigint;

  @Column()
  serviceId: string;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column()
  timeSlot: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  notes: string | null;

  @Column({ default: 'confirmed' })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**BookingSlot Entity — Optional Template-Specific:**
```typescript
@Entity('booking_slots')
@Unique(['botId', 'date', 'timeSlot'])
export class BookingSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  botId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  timeSlot: string;

  @Column({ default: true })
  available: boolean;

  @Column({ nullable: true })
  bookingId: string | null;
}
```

### 2.3 Boundary Between Universal Identity and Template Business Data

**Universal Identity (WHO):**
- Customer — who the user is
- Owner — who operates the bot
- Bot — what bot is running

**Template Business Data (WHAT):**
- Lead — what the user answered in funnel
- Booking — what the user reserved
- Order — what the user purchased (future)
- Conversation — what the user discussed (future)

**Boundary Rule:**
```
Universal entity = Identity + Minimal universal state
Template entity = Business action + Template-specific data

Customer: botId + telegramUserId + status + tags
Booking:  botId + userId + serviceId + date + timeSlot + status
Lead:     botId + userId + answers + contact + status
```

### 2.4 Template Pollution Detection

**Signs of Template Pollution in Customer:**
1. JSON fields with template-specific keys (`funnelAnswers`, `bookingData`)
2. Foreign keys to template entities (`leadId`, `bookingId`)
3. Template-specific enums (`funnelStage`, `bookingStatus`)
4. Template-specific arrays (`questionsAnswered`, `slotsBooked`)

**Current Customer State:**
- ✅ No template-specific fields
- ✅ No foreign keys to template entities
- ✅ No template-specific enums
- ✅ Status is universal (`new` | `active` | `converted`)

**Verdict:** ✅ Customer is clean. No template pollution.

### 2.5 Hidden Funnel-Centric Assumptions

**Assumption Check 1: Customer Status**
- Lead-funnel uses: `'new'` → `'active'` → `'converted'`
- Booking uses: `'new'` → `'active'` (after booking)
- **Check:** Is `'converted'` funnel-specific?
- **Analysis:** `'converted'` means "user completed desired action" — universal concept.
- **Verdict:** ✅ `'converted'` is universal. Booking customer can be `'converted'` after booking.

**Assumption Check 2: UserState.currentStep**
- Lead-funnel uses: `'idle'`, `'question_1'`, `'question_2'`, `'contact'`
- Booking uses: `'booking:idle'`, `'booking:selecting_service'`
- **Check:** Does UserState assume funnel step naming?
- **Analysis:** `currentStep` is `string` — any template can use its own namespace.
- **Verdict:** ✅ No funnel assumption. String is universal.

**Assumption Check 3: Bot Config Schema**
- Lead-funnel config: `{ businessName, questions, ownerChatId }`
- Booking config: `{ businessName, services, workingHours, ownerChatId }`
- **Check:** Does BotService validate config schema?
- **Analysis:** Config is `Record<string, any>` — no schema validation in core.
- **Verdict:** ✅ No funnel assumption. Config is generic JSON.

---

## SECTION 3 — ANALYTICS UNIVERSALITY TEST

### 3.1 Generic Analytics Taxonomy

**Core Events (Template-Agnostic):**
```typescript
'session:started'      // User begins any flow
'session:completed'    // User finishes any flow
'session:abandoned'    // User leaves mid-flow
'conversion:achieved'  // User completes desired action
'bot:connected'        // Bot registered
'bot:deleted'          // Bot removed
```

### 3.2 Booking Event Mapping

| Booking Action | Generic Event | Metadata |
|----------------|---------------|----------|
| User starts booking | `session:started` | `{ template: 'booking', flowType: 'booking' }` |
| User selects service | (no event — intermediate step) | — |
| User selects date | (no event — intermediate step) | — |
| User selects time | (no event — intermediate step) | — |
| User enters contact | (no event — intermediate step) | — |
| Booking confirmed | `conversion:achieved` | `{ template: 'booking', conversionType: 'booking', serviceId, date, timeSlot }` |
| User abandons flow | `session:abandoned` | `{ template: 'booking', flowType: 'booking', lastStep }` |

### 3.3 Events That MUST Remain Metadata

**Template-specific details belong in metadata, NOT event names:**
```typescript
// ✅ CORRECT — Generic event + metadata
await analytics.trackEvent(botId, 'conversion:achieved', {
  template: 'booking',
  conversionType: 'booking',
  serviceId: 'haircut',
  date: '2026-05-15',
  timeSlot: '14:00',
});

// ❌ FORBIDDEN — Template-specific core event
await analytics.trackEvent(botId, 'booking:created', {
  serviceId: 'haircut',
  date: '2026-05-15',
});
```

### 3.4 Events That Are Dangerous to Add to Core Taxonomy

**Forbidden Core Events:**
```typescript
'booking:created'       // ❌ Template-specific
'booking:confirmed'     // ❌ Template-specific
'booking:cancelled'     // ❌ Template-specific
'lead:submitted'        // ❌ Template-specific (already removed)
'order:placed'          // ❌ Template-specific (future)
'conversation:started'  // ❌ Template-specific (future)
```

**Why These Are Dangerous:**
1. Core analytics becomes template-aware
2. Dashboard queries must be updated for every template
3. Generic aggregation impossible
4. Platform loses universality

### 3.5 Dashboard Queries That Remain Universal

**Universal Query (works for ALL templates):**
```sql
SELECT eventType, COUNT(*) as count
FROM analytics_events
WHERE botId = :botId
  AND createdAt >= :startDate
GROUP BY eventType;
```

**Result for lead-funnel:**
```
session:started    | 150
session:completed  | 120
session:abandoned  | 30
conversion:achieved | 100
```

**Result for booking:**
```
session:started    | 200
session:completed  | 180
session:abandoned  | 20
conversion:achieved | 150
```

**Same query. Same events. Different counts. Universal.**

### 3.6 Analytics Smells That Indicate Architectural Drift

**Smell 1: Template-Specific Event Names in Core Queries**
```typescript
// ❌ SMELL
const events = ['funnel:completed', 'booking:created', 'order:placed'];
```

**Smell 2: Conditional Event Tracking by Template**
```typescript
// ❌ SMELL
if (template === 'booking') {
  await analytics.track('booking:created');
} else if (template === 'lead-funnel') {
  await analytics.track('funnel:completed');
}
```

**Smell 3: Template-Specific Dashboard Metrics**
```typescript
// ❌ SMELL
if (template === 'booking') {
  return { totalBookings: count };
} else if (template === 'lead-funnel') {
  return { totalLeads: count };
}
```

### 3.7 Explicit Verdict

**BOOKING FITS GENERIC ANALYTICS**

**Evidence:**
- ✅ `session:started` — booking flow begins
- ✅ `conversion:achieved` — booking confirmed
- ✅ `session:abandoned` — user leaves mid-booking
- ✅ Metadata carries template context
- ✅ No template-specific core events needed
- ✅ Dashboard queries remain universal

**Conclusion:** Generic analytics taxonomy is sufficient. No core changes required.

---

## SECTION 4 — BILLING & CAPABILITY VALIDATION

### 4.1 Current Capability-Based Quotas

```typescript
interface PlanLimits {
  maxBots: number;
  maxInteractionsPerMonth: number;  // Generic
  maxFlows: number;                 // Generic
  allowedTemplates: string[];       // Template access
  analyticsEnabled: boolean;
  customBranding: boolean;
  prioritySupport: boolean;
}
```

### 4.2 Booking Quota Mapping

| Booking Action | Counts As | Quota Checked |
|----------------|-----------|---------------|
| User starts booking flow | 1 flow | `maxFlows` |
| Booking confirmed | 1 interaction | `maxInteractionsPerMonth` |

**Implementation:**
```typescript
async handleStart(context: TemplateContext) {
  // Check flow quota
  const canAddFlow = await this.billingService.canAddFlow(context.botId);
  if (!canAddFlow) {
    await this.telegramService.sendMessage(
      context.chatId,
      'Flow quota exceeded. Upgrade your plan.'
    );
    return;
  }
  
  await this.billingService.recordFlow(context.botId);
  // ... continue flow
}

async createBooking(context: TemplateContext, data: CreateBookingDto) {
  // Check interaction quota
  const canAddInteraction = await this.billingService.canAddInteraction(context.botId);
  if (!canAddInteraction) {
    await this.telegramService.sendMessage(
      context.chatId,
      'Interaction quota exceeded. Upgrade your plan.'
    );
    return;
  }
  
  // Create booking...
  await this.billingService.recordInteraction(context.botId);
}
```

### 4.3 Why Booking Should Count as Interaction

**Interaction Definition:** "A user action that creates business value"
- Lead submission = interaction (business value: lead captured)
- Booking confirmation = interaction (business value: appointment scheduled)
- Order placement = interaction (business value: sale made)
- Conversation completion = interaction (business value: query resolved)

**Why This Works:**
- Universal concept across all templates
- No template-specific logic in billing
- New templates automatically fit existing quotas

### 4.4 Where Capability Abstraction Could Break

**Break Point 1: Template-Specific Quotas**
```typescript
// ❌ BREAK
interface PlanLimits {
  maxInteractionsPerMonth: number;
  maxBookingsPerMonth: number;  // Template-specific!
}
```

**Break Point 2: Template-Specific Billing Logic**
```typescript
// ❌ BREAK
async canAddInteraction(botId: string, template: string) {
  if (template === 'booking') {
    return this.checkBookingQuota(botId);
  } else if (template === 'lead-funnel') {
    return this.checkLeadQuota(botId);
  }
}
```

**Break Point 3: Template-Specific Plan Definitions**
```typescript
// ❌ BREAK
const PLAN_DEFINITIONS = {
  starter: {
    maxLeadsPerMonth: 500,      // Funnel-specific
    maxBookingsPerMonth: 300,   // Booking-specific
    maxOrdersPerMonth: 200,     // Shop-specific (future)
  }
};
```

### 4.5 Signs That Billing Is Template-Centric

1. Plan limits include template-specific fields (`maxLeadsPerMonth`)
2. Billing service branches on template name
3. Quota logic differs by template
4. New templates require billing code changes

**Current Billing State:**
- ✅ No template-specific quotas
- ✅ No template branching in billing
- ✅ Universal quota logic
- ✅ New templates fit automatically

### 4.6 Future Templates That Will Validate Capability System

| Template | Interaction Type | Flow Type | Validation |
|----------|-----------------|-----------|------------|
| Lead-funnel | Lead submission | Funnel | ✅ Current |
| Booking | Booking confirmation | Booking flow | ⏳ This sprint |
| Shop | Order placement | Checkout flow | Future |
| AI Assistant | Conversation completion | Chat flow | Future |
| Support | Ticket resolution | Ticket flow | Future |

**If ALL these fit `maxInteractionsPerMonth` and `maxFlows`:**
- ✅ Capability system is truly template-agnostic
- ✅ Billing scales without code changes

**If ANY needs template-specific quota:**
- ❌ Capability system is broken
- ❌ Must refactor before adding more templates

### 4.7 Explicit Conclusion

**CAPABILITY SYSTEM IS TEMPLATE-AGNOSTIC**

**Evidence:**
- ✅ `maxInteractionsPerMonth` works for leads AND bookings
- ✅ `maxFlows` works for funnels AND booking flows
- ✅ No template-specific quotas needed
- ✅ No billing code changes for booking
- ✅ Future templates (shop, AI) will fit same quotas

**Conclusion:** Booking validates that capability-based billing is universal. No core changes required.

---

## SECTION 5 — OPERATIONAL COMPOSITION REVIEW

### 5.1 Navigation Composition

**Booking Navigation Registration:**
```typescript
// src/templates/booking/booking.owner-module.ts
export const bookingOwnerModule: OwnerModuleDefinition = {
  template: 'booking',
  navigation: [
    {
      id: 'bookings',
      label: 'Bookings',
      route: '/bookings',
      icon: '📅',
    },
    {
      id: 'booking-settings',
      label: 'Settings',
      route: '/settings',
      icon: '⚙️',
    },
  ],
  // ...
};
```

**NavigationService Composition:**
```typescript
// src/miniapp/services/navigation.service.ts
composeNavigation(templates: string[]) {
  const nav = [
    { key: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: '📊' },
    { key: 'customers', label: 'Customers', route: '/customers', icon: '👥' },
    { key: 'analytics', label: 'Analytics', route: '/analytics', icon: '📈' },
  ];

  for (const template of templates) {
    const module = getOwnerModule(template);
    if (module?.navigation) {
      nav.push(...module.navigation.map(section => ({
        key: section.id,
        label: section.label,
        route: `/bots/:botId${section.route}`,
        icon: section.icon,
        source: 'template',
        template: module.template,
      })));
    }
  }

  return nav;
}
```

**Result:**
- Lead-funnel bot: Dashboard, Customers, Analytics, **Leads**
- Booking bot: Dashboard, Customers, Analytics, **Bookings**
- No code changes in NavigationService

### 5.2 Widget Composition

**Booking Widget Registration:**
```typescript
widgets: [
  {
    id: 'recent-bookings',
    type: 'list',
    label: 'Recent Bookings',
    dataSource: '/api/miniapp/bots/:botId/bookings/recent',
  },
  {
    id: 'upcoming-slots',
    type: 'calendar',
    label: 'Availability',
    dataSource: '/api/miniapp/bots/:botId/bookings/slots',
  },
  {
    id: 'booking-stats',
    type: 'metrics',
    label: 'Booking Metrics',
    dataSource: '/api/miniapp/bots/:botId/bookings/stats',
  },
]
```

**OwnerViewService Composition:**
```typescript
composeDashboardView(botId: string, template: string) {
  const module = getOwnerModule(template);
  return {
    widgets: module?.widgets?.map(w => ({
      id: w.id,
      type: w.type,
      label: w.label,
      dataSource: w.dataSource.replace(':botId', botId),
    })) || [],
  };
}
```

### 5.3 Settings Schema

**Booking Settings Schema:**
```typescript
settings: {
  type: 'object',
  properties: {
    businessName: {
      type: 'string',
      title: 'Business Name',
      minLength: 1,
      maxLength: 100,
    },
    services: {
      type: 'array',
      title: 'Services',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', title: 'Service Name' },
          duration: { type: 'number', title: 'Duration (minutes)' },
          price: { type: 'number', title: 'Price' },
        },
        required: ['id', 'name', 'duration'],
      },
    },
    workingHours: {
      type: 'object',
      title: 'Working Hours',
      properties: {
        startTime: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
        endTime: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
      },
    },
  },
  required: ['businessName', 'services'],
}
```

### 5.4 Dashboard Rendering

**Generic Dashboard Widgets:**
```typescript
// Universal widgets (all templates)
{
  id: 'total-customers',
  type: 'metrics',
  label: 'Total Customers',
  value: customerCounts.total,
},
{
  id: 'total-interactions',
  type: 'metrics',
  label: 'Total Interactions',
  value: eventCounts['conversion:achieved'] || 0,
},
```

**Template-Specific Widgets (from metadata):**
```typescript
// Lead-funnel
{
  id: 'recent-leads',
  type: 'list',
  label: 'Recent Leads',
  dataSource: '/api/miniapp/bots/:botId/leads/recent',
}

// Booking
{
  id: 'recent-bookings',
  type: 'list',
  label: 'Recent Bookings',
  dataSource: '/api/miniapp/bots/:botId/bookings/recent',
}
```

### 5.5 Widget Types That Are Sufficient

**Current Widget Types:**
1. `metrics` — Single number display (total customers, total interactions)
2. `list` — Table/list view (recent leads, recent bookings)
3. `calendar` — Date/time view (availability slots)

**Are These Sufficient for Booking?**
- ✅ `metrics` — Total bookings, confirmed bookings, completion rate
- ✅ `list` — Recent bookings list
- ✅ `calendar` — Available slots view

**No new widget types needed.**

### 5.6 Where Frontend Can Accidentally Become Template-Aware

**Danger Zone 1: Hardcoded Routes**
```typescript
// ❌ DANGEROUS — Frontend
<Route path="/bookings" component={BookingsPage} />
<Route path="/leads" component={LeadsPage} />
```

**Danger Zone 2: Template-Specific Components**
```typescript
// ❌ DANGEROUS — Frontend
function renderWidget(widget) {
  if (widget.id === 'recent-bookings') {
    return <BookingsList data={widget.data} />;
  } else if (widget.id === 'recent-leads') {
    return <LeadsList data={widget.data} />;
  }
}
```

**Danger Zone 3: Template Branching**
```typescript
// ❌ DANGEROUS — Frontend
if (template === 'booking') {
  showCalendar = true;
  showBookings = true;
} else if (template === 'lead-funnel') {
  showQuestions = true;
  showLeads = true;
}
```

### 5.7 Safe Frontend Architecture

```typescript
// ✅ SAFE — Frontend renders from metadata
function App() {
  const { navigation, template } = useNavigation();
  
  return (
    <Router>
      {navigation.map(item => (
        <Route
          key={item.key}
          path={item.route}
          element={<GenericPage type={item.key} />}
        />
      ))}
    </Router>
  );
}

function GenericPage({ type }) {
  const { widgets } = useWidgets(type);
  
  return (
    <div>
      {widgets.map(widget => (
        <WidgetRenderer
          key={widget.id}
          type={widget.type}
          dataSource={widget.dataSource}
        />
      ))}
    </div>
  );
}

function WidgetRenderer({ type, dataSource }) {
  const { data } = useFetch(dataSource);
  
  switch (type) {
    case 'metrics': return <MetricsWidget data={data} />;
    case 'list': return <ListWidget data={data} />;
    case 'calendar': return <CalendarWidget data={data} />;
    default: return <UnknownWidget type={type} />;
  }
}
```

### 5.8 Verdict

**Operational composition works for booking via metadata-only.**

- ✅ Navigation composed from metadata
- ✅ Widgets composed from metadata
- ✅ Settings driven by JSON schema
- ✅ No hardcoded routes
- ✅ No template-specific components
- ✅ Frontend remains template-agnostic

---

## SECTION 6 — TRANSACTION & CONCURRENCY REVIEW

### 6.1 Race Condition Analysis

**Race Condition 1: Concurrent Slot Booking**

**Scenario:**
```
T+0ms: User A clicks "14:00"
T+1ms: User B clicks "14:00"
T+2ms: Webhook A arrives
T+3ms: Webhook B arrives
T+4ms: BookingService A checks slot availability → available
T+5ms: BookingService B checks slot availability → available
T+6ms: BookingService A creates booking
T+7ms: BookingService B creates booking
T+8ms: Double booking for same slot
```

**Mitigation:**
```typescript
// Unique constraint on (botId, date, timeSlot)
@Entity('bookings')
@Unique(['botId', 'date', 'timeSlot'])
export class Booking {
  // ...
}

// OR separate slot entity
@Entity('booking_slots')
@Unique(['botId', 'date', 'timeSlot'])
export class BookingSlot {
  // ...
}
```

**Retry Strategy:**
```typescript
async createBookingWithRetry(botId, userId, data, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await this.createBooking(botId, userId, data);
    } catch (error) {
      if (error.driverError?.code === '23505' && attempt < maxRetries - 1) {
        // Slot taken, suggest alternative
        const alternativeSlots = await this.getAlternativeSlots(botId, data.date);
        throw new ConflictException({
          message: 'Slot no longer available',
          alternatives: alternativeSlots,
        });
      }
      throw error;
    }
  }
}
```

**Race Condition 2: Concurrent Customer Creation**

**Scenario:**
```
T+0ms: User sends /start
T+1ms: User sends /start again (double-tap)
T+2ms: Webhook 1 arrives
T+3ms: Webhook 2 arrives
T+4ms: CustomerService.ensureCustomer() for webhook 1 → not found
T+5ms: CustomerService.ensureCustomer() for webhook 2 → not found
T+6ms: Both try to create customer
```

**Mitigation:**
- Already handled by `CustomerService.ensureCustomer()`
- Unique constraint on `(botId, telegramUserId)`
- Catch `23505`, retry fetch

### 6.2 Transaction Boundaries

**Transaction Required: Booking Creation**

**Operations in transaction:**
1. Create `Booking` entity
2. Update `Customer.status` to `'active'`
3. Mark `BookingSlot` as unavailable (if using slot entity)

```typescript
async createBooking(botId, userId, data) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Create booking
    const booking = queryRunner.manager.create(Booking, {
      botId,
      userId,
      ...data,
      status: 'confirmed',
    });
    await queryRunner.manager.save(booking);

    // 2. Update customer status
    await queryRunner.manager.update(
      Customer,
      { botId, telegramUserId: userId },
      { status: 'active' }
    );

    // 3. Mark slot unavailable (optional)
    if (data.date && data.timeSlot) {
      await queryRunner.manager.update(
        BookingSlot,
        { botId, date: data.date, timeSlot: data.timeSlot },
        { available: false, bookingId: booking.id }
      );
    }

    await queryRunner.commitTransaction();
    return booking;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

**Why transaction is required:**
- If booking creation fails → customer should not be updated
- If customer update fails → booking should not exist
- If slot update fails → booking should not exist
- **All or nothing**

### 6.3 Idempotency Checkpoints

**Checkpoint 1: Webhook Level**
```typescript
// WebhookService.processUpdate()
const isProcessed = await this.botService.isUpdateProcessed(botId, updateId);
if (isProcessed) return { skipped: true };

// Process...
await this.botService.markUpdateAsProcessed(botId, updateId);
```

**Checkpoint 2: Booking Creation Level**
```typescript
// Check if booking already exists for this user + slot
const existingBooking = await this.bookingRepository.findOne({
  where: {
    botId,
    userId,
    date: data.date,
    timeSlot: data.timeSlot,
    status: Not('cancelled'),
  },
});

if (existingBooking) {
  return existingBooking; // Return existing, don't create duplicate
}
```

### 6.4 Dangerous Async Behavior

**Danger 1: Fire-and-Forget Confirmation**
```typescript
// ❌ DANGEROUS
async createBooking() {
  await this.saveBooking();
  this.telegramService.sendMessage(userId, 'Confirmed!'); // NO await
}
```
**Risk:** If sendMessage fails, user doesn't get confirmation but booking exists.

**Fix:**
```typescript
// ✅ SAFE
async createBooking() {
  const booking = await this.saveBooking();
  try {
    await this.telegramService.sendMessage(userId, 'Confirmed!');
  } catch (error) {
    // Log error, but booking is still valid
    this.logger.error('Failed to send confirmation', error);
  }
  return booking;
}
```

**Danger 2: Parallel Slot Checks**
```typescript
// ❌ DANGEROUS
const [slot1, slot2, slot3] = await Promise.all([
  this.checkSlot(botId, date, '10:00'),
  this.checkSlot(botId, date, '11:00'),
  this.checkSlot(botId, date, '12:00'),
]);
```
**Risk:** Race condition between check and book.

**Fix:**
```typescript
// ✅ SAFE — Use database-level locking or unique constraints
// Slot availability is checked AT BOOKING TIME with transaction
```

### 6.5 Safe Transactional Flow

```
Webhook arrives
  ↓
Idempotency check (ProcessedUpdate)
  ↓
UserState check (current step)
  ↓
Validate input
  ↓
BEGIN TRANSACTION
  ↓
Create Booking entity
  ↓
Update Customer status
  ↓
Update BookingSlot (if applicable)
  ↓
COMMIT TRANSACTION
  ↓
Track analytics (conversion:achieved)
  ↓
Send Telegram confirmation
  ↓
Update UserState (reset to idle)
  ↓
Return success
```

### 6.6 Dangerous Inconsistent Flow

```
Webhook arrives
  ↓
Idempotency check (missing!) ← DANGER: Duplicate bookings
  ↓
Create Booking entity (no transaction) ← DANGER: Partial state
  ↓
Update Customer status (no transaction) ← DANGER: Inconsistent
  ↓
Send Telegram confirmation (fire-and-forget) ← DANGER: Silent failure
  ↓
Track analytics (before transaction commits) ← DANGER: False positive
```

### 6.7 Failure Scenarios

| Failure Point | Impact | Recovery |
|---------------|--------|----------|
| Transaction rollback | No booking created | User retries |
| Telegram API failure | Booking exists, no confirmation | Admin manual notify |
| Analytics failure | Booking exists, no event | Acceptable (non-critical) |
| Slot collision | Booking fails | Suggest alternative slots |
| Duplicate webhook | Skipped by idempotency | No action needed |

---

## SECTION 7 — TEMPLATE ISOLATION TEST

### 7.1 Isolation Success Conditions

**Can booking be deleted without affecting:**

| Component | Impact | Verdict |
|-----------|--------|---------|
| CustomerService | No impact — Customer entity unchanged | ✅ Isolated |
| AnalyticsService | No impact — Generic events remain | ✅ Isolated |
| BillingService | No impact — Generic quotas remain | ✅ Isolated |
| BotService | No impact — Bot entity unchanged | ✅ Isolated |
| Mini App | No impact — Metadata removed from registry | ✅ Isolated |
| Lead-funnel | No impact — No cross-imports | ✅ Isolated |
| Webhook processing | No impact — Template removed from factory | ✅ Isolated |

### 7.2 Deletion Procedure

```typescript
// Step 1: Remove from TemplateFactory
// src/templates/template.factory.ts
this.handlers.delete('booking');

// Step 2: Remove from OwnerModuleRegistry
// src/owner-modules/owner-module.registry.ts
delete OWNER_MODULE_REGISTRY['booking'];

// Step 3: Delete template files
// rm -rf src/templates/booking/

// Step 4: Drop booking tables (optional)
// DROP TABLE bookings;
// DROP TABLE booking_slots;
```

**Result:** Platform continues operating. Lead-funnel unaffected. Mini App unaffected (no booking bots shown).

### 7.3 Isolation Failure Conditions

**Failure 1: Cross-Template Import**
```typescript
// ❌ FAILURE
// src/templates/booking/booking.service.ts
import { LeadFunnelService } from '../lead-funnel/lead-funnel.service';

class BookingService {
  constructor(private leadFunnelService: LeadFunnelService) {}
}
```

**Failure 2: Template-Specific Core Changes**
```typescript
// ❌ FAILURE
// src/customer/customer.service.ts
async ensureCustomer(botId, userId, profile) {
  const customer = await this.findOrCreate(botId, userId, profile);
  
  // Template-specific logic in core!
  if (profile?.bookingData) {
    customer.bookingData = profile.bookingData;
  }
  
  return customer;
}
```

**Failure 3: Template-Specific Database Schema**
```typescript
// ❌ FAILURE
// src/bot/entities/bot.entity.ts
@Entity('bots')
export class Bot {
  // ...
  
  @Column({ type: 'jsonb', default: {} })
  bookingConfig: {  // Template-specific field in core entity!
    services: any[];
    workingHours: any;
  };
}
```

### 7.4 Shared Abstractions That Are Acceptable

| Shared Abstraction | Why Acceptable | Risk Level |
|-------------------|----------------|------------|
| CustomerService | Universal customer lifecycle | Low |
| AnalyticsService | Generic event tracking | Low |
| TelegramService | Bot API wrapper | Low |
| BotService | Bot config retrieval | Low |
| UserState | Universal state machine | Low |
| ProcessedUpdate | Universal idempotency | Low |
| TemplateContext | Universal runtime context | Low |

### 7.5 Shared Abstractions That Are Premature

| Premature Abstraction | Why Premature | Risk Level |
|----------------------|---------------|------------|
| GenericBookingService | Only 1 booking template | High |
| UniversalWorkflowEngine | 2 templates, different patterns | High |
| TemplateConfigValidator | Only 2 config schemas | Medium |
| UniversalSlotSystem | Only booking uses slots | Medium |

### 7.6 Verdict

**Template isolation is achievable.**

- ✅ Booking can be implemented without core changes
- ✅ Booking can be deleted without platform impact
- ✅ No cross-template dependencies required
- ✅ Universal abstractions are sufficient

---

## SECTION 8 — PREMATURE ABSTRACTION DETECTION

### 8.1 Workflow Engine

**What it would look like:**
```typescript
class WorkflowEngine {
  createWorkflow(steps: WorkflowStep[]): Workflow;
  executeWorkflow<T>(workflow: Workflow, context: T): Promise<Result>;
}
```

**Why premature:**
- Only 2 templates with workflows (lead-funnel, booking)
- Lead-funnel: question-based linear flow
- Booking: calendar-based selection flow
- Patterns may differ significantly
- Abstracting 2 patterns is premature

**Maturity threshold:** 3+ templates with similar multi-step flow patterns

**When justified:** After AI assistant, shop, and support templates exist. If 3+ use similar flow logic, THEN abstract.

**Why explicit TypeScript is better now:**
```typescript
// Explicit, readable, debuggable
class BookingService {
  async handleStart(context) { /* explicit */ }
  async handleServiceSelection(context, serviceId) { /* explicit */ }
  async handleDateSelection(context, date) { /* explicit */ }
}
```

### 8.2 Plugin Runtime

**What it would look like:**
```typescript
class PluginRuntime {
  loadTemplate(packageName: string): Promise<Template>;
  sandboxExecution(template: Template): ExecutionContext;
}
```

**Why premature:**
- Manual registration takes 5 minutes
- No external developers yet
- Plugin system adds: sandboxing, security, versioning, dependency resolution
- 6+ months of complexity for zero benefit

**Maturity threshold:** 10+ templates, manual registration painful

**When justified:** When adding a template requires code review, security audit, and deployment cycle.

### 8.3 Visual Builder

**What it would look like:**
```typescript
class VisualBuilder {
  dragAndDropWorkflow(): Workflow;
  visualFormDesigner(): Form;
}
```

**Why premature:**
- Wrong target audience (developers, not citizen developers)
- Visual builder is framework territory
- No proven need (templates are code)
- Massive complexity (React DnD, form designer, automation engine)

**Maturity threshold:** Never (unless market shifts to no-code)

### 8.4 Booking DSL

**What it would look like:**
```typescript
const bookingFlow = dsl
  .service('haircut')
  .date()
  .time()
  .contact()
  .confirm();
```

**Why premature:**
- DSL adds abstraction without benefit
- Explicit TypeScript is clearer
- Only 1 booking template exists
- Framework-building behavior

**Maturity threshold:** 5+ booking templates with identical patterns

**When justified:** If multiple booking templates (restaurant, salon, clinic) share identical flow structure.

### 8.5 Schema Execution Engine

**What it would look like:**
```typescript
class SchemaEngine {
  execute(config: Record<string, any>): Promise<Result>;
  validate(config: any): boolean;
}
```

**Why premature:**
- Business logic in JSON is debugging nightmare
- Runtime execution via metadata is unpredictable
- Metadata is for UI, not execution
- Framework-building behavior

**Maturity threshold:** Never (business logic stays in code)

### 8.6 Generic Form System

**What it would look like:**
```typescript
class FormBuilder {
  createForm(schema: FormSchema): Form;
  renderForm(form: Form): FormComponent;
}
```

**Why premature:**
- Lead-funnel has questions → answers
- Booking has service → date → time → contact
- Patterns differ (text input vs calendar selection)
- Only 2 templates with forms

**Maturity threshold:** 5+ templates with similar form patterns

### 8.7 SDK Contracts

**What it would look like:**
```typescript
import { TemplateSDK } from '@botgrandfather/sdk';

const template = new TemplateSDK({
  template: 'booking',
  service: BookingService,
});
```

**Why premature:**
- SDK contracts not stable (only 2 templates)
- Breaking changes guaranteed
- No external developers yet
- Maintenance nightmare

**Maturity threshold:** 3-5 internal templates, contracts stable for 6+ months

### 8.8 Summary Table

| Abstraction | Status | Maturity Threshold | Risk |
|-------------|--------|-------------------|------|
| Workflow Engine | ❌ Premature | 3+ similar workflows | High |
| Plugin Runtime | ❌ Premature | 10+ templates | High |
| Visual Builder | ❌ Premature | Never (wrong audience) | High |
| Booking DSL | ❌ Premature | 5+ booking templates | Medium |
| Schema Engine | ❌ Premature | Never | High |
| Generic Form | ❌ Premature | 5+ form templates | Medium |
| SDK Contracts | ❌ Premature | 3-5 templates, 6mo stable | High |

---

## SECTION 9 — IMPLEMENTATION EXECUTION PLAN

### Step 1: Booking Module Scaffold

**What:** Create folder structure and NestJS module
**Files:**
- `src/templates/booking/booking.module.ts`
- `src/templates/booking/booking.service.ts` (stub)
- `src/templates/booking/booking.handler.ts` (stub)
- `src/templates/booking/booking.types.ts`

**Why:** Establish template boundary before business logic
**Invariants checked:**
- ✅ No imports from `miniapp/`
- ✅ No imports from `lead-funnel/`
- ✅ Implements `TemplateHandler` interface

### Step 2: Booking Entity

**What:** Create `Booking` entity and `BookingSlot` entity
**Files:**
- `src/templates/booking/entities/booking.entity.ts`
- `src/templates/booking/entities/booking-slot.entity.ts`

**Why:** Template-specific data storage
**Invariants checked:**
- ✅ No fields added to `Customer`
- ✅ No fields added to `Bot`
- ✅ Template-specific data isolated

### Step 3: DTOs and Validation

**What:** Create input validation DTOs
**Files:**
- `src/templates/booking/dto/create-booking.dto.ts`
- `src/templates/booking/dto/update-booking.dto.ts`

**Why:** Input validation before business logic
**Invariants checked:**
- ✅ Validation in DTO, not service
- ✅ No template-specific validation in core

### Step 4: Booking Service Core Logic

**What:** Implement booking creation, confirmation, cancellation
**Files:**
- `src/templates/booking/booking.service.ts`

**Why:** Core business logic
**Invariants checked:**
- ✅ Uses `CustomerService.ensureCustomer()`
- ✅ Uses `AnalyticsService.trackEvent()` with generic events
- ✅ Transaction safety for booking creation
- ✅ No imports from `miniapp/`

### Step 5: Booking Handler

**What:** Implement `TemplateHandler` interface
**Files:**
- `src/templates/booking/booking.handler.ts`

**Why:** Webhook dispatch
**Invariants checked:**
- ✅ Thin dispatcher (no business logic)
- ✅ Routes to `BookingService`
- ✅ Handles text, callback, start

### Step 6: Template Factory Registration

**What:** Register booking handler in `TemplateFactory`
**Files:**
- `src/templates/template.factory.ts`

**Why:** Enable webhook dispatch to booking
**Invariants checked:**
- ✅ Manual registration (no plugin system)
- ✅ No runtime changes needed

### Step 7: Owner Module Registry

**What:** Register booking metadata
**Files:**
- `src/templates/booking/booking.owner-module.ts`
- `src/owner-modules/owner-module.registry.ts`

**Why:** Operational UI composition
**Invariants checked:**
- ✅ Navigation from metadata
- ✅ Widgets from metadata
- ✅ Settings schema explicit

### Step 8: Mini App Booking Endpoints

**What:** Add booking API endpoints
**Files:**
- `src/miniapp/controllers/owner-dashboard.controller.ts` (extend)

**Endpoints:**
- `GET /miniapp/bots/:id/bookings` — List bookings
- `GET /miniapp/bots/:id/bookings/stats` — Booking metrics
- `GET /miniapp/bots/:id/bookings/slots` — Available slots

**Why:** Operational visibility
**Invariants checked:**
- ✅ `@UseGuards(BotOwnershipGuard)`
- ✅ READ-ONLY (no business logic)
- ✅ Returns data, not UI

### Step 9: Analytics Integration

**What:** Add tracking calls in booking flow
**Files:**
- `src/templates/booking/booking.service.ts`

**Events:**
- `session:started` (flow begins)
- `conversion:achieved` (booking confirmed)
- `session:abandoned` (flow abandoned)

**Why:** Validate generic analytics work for booking
**Invariants checked:**
- ✅ Generic event names
- ✅ Template context in metadata
- ✅ No `booking:created` core event

### Step 10: Billing Integration

**What:** Add quota checks
**Files:**
- `src/templates/booking/booking.service.ts`

**Checks:**
- `canAddFlow()` on flow start
- `canAddInteraction()` on booking creation

**Why:** Validate capability-based billing
**Invariants checked:**
- ✅ Generic quotas (`maxInteractionsPerMonth`, `maxFlows`)
- ✅ No `maxBookingsPerMonth`

### Step 11: Transaction Safety

**What:** Wrap booking creation in transaction
**Files:**
- `src/templates/booking/booking.service.ts`

**Transaction includes:**
- Create booking
- Update customer status
- Mark slot unavailable

**Why:** Data integrity
**Invariants checked:**
- ✅ All-or-nothing
- ✅ Rollback on failure
- ✅ No partial state

### Step 12: Race Condition Handling

**What:** Add unique constraints and retry logic
**Files:**
- `src/templates/booking/entities/booking.entity.ts`
- `src/templates/booking/booking.service.ts`

**Constraints:**
- `(botId, date, timeSlot)` unique
- Slot collision detection

**Why:** Concurrent safety
**Invariants checked:**
- ✅ No double bookings
- ✅ Graceful conflict handling

### Step 13: Idempotency

**What:** Verify webhook idempotency works
**Files:**
- `src/webhook/webhook.service.ts` (already exists)

**Test:**
- Send duplicate webhook
- Verify `ProcessedUpdate` skips second

**Why:** Duplicate prevention
**Invariants checked:**
- ✅ Already handled by platform
- ✅ No booking-specific idempotency needed

### Step 14: Final Validation

**What:** Run architectural validation checklist
**Checklist:**
- [ ] No core entity changes
- [ ] No core service changes
- [ ] No template-specific core events
- [ ] No template-specific quotas
- [ ] No hardcoded frontend routes
- [ ] No cross-template imports
- [ ] No runtime → operational imports
- [ ] Transaction safety verified
- [ ] Race conditions handled
- [ ] Generic analytics verified

**Result:**
- ✅ All checks pass → Architecture validated
- ❌ Any check fails → Fix before proceeding

---

## SECTION 10 — FINAL ARCHITECTURAL VERDICT

### Verdict

**ARCHITECTURE VALIDATED**

**Booking template can be implemented without:**
- ✅ Core entity changes
- ✅ Core service changes
- ✅ Template-specific core events
- ✅ Template-specific quotas
- ✅ Hardcoded frontend routes
- ✅ Cross-template dependencies
- ✅ Runtime → operational imports
- ✅ Premature abstractions

### Strongest Architectural Decisions

1. **Universal Customer Entity**
   - Customer is truly template-agnostic
   - `ensureCustomer()` works for any template
   - No template pollution

2. **Generic Analytics Taxonomy**
   - `session:started`, `conversion:achieved` work for all templates
   - Metadata carries template context
   - Dashboard queries remain universal

3. **Capability-Based Billing**
   - `maxInteractionsPerMonth` works for leads, bookings, orders
   - No template-specific quotas needed
   - New templates fit automatically

4. **Metadata-Driven Operational UI**
   - `OwnerModuleRegistry` enables template-specific UI without hardcoding
   - Navigation, widgets, settings from metadata
   - Frontend remains template-agnostic

5. **Runtime/Operational Separation**
   - Clear boundary enforced by module structure
   - Runtime never imports operational
   - Operational is READ-ONLY

### Weakest Architectural Assumptions

1. **UserState Payload Flexibility**
   - Assumption: `jsonb` payload is sufficient for any template state
   - Risk: Very complex templates may need structured state
   - Mitigation: Monitor as templates grow

2. **Bot Config Schema**
   - Assumption: `Record<string, any>` config is sufficient
   - Risk: Config validation becomes template-specific
   - Mitigation: Keep config validation in template DTOs

3. **Widget Type Sufficiency**
   - Assumption: `metrics`, `list`, `calendar` are sufficient
   - Risk: Future templates may need new widget types
   - Mitigation: Add widget types incrementally

### Highest-Risk Future Drift Vectors

1. **Frontend Template Awareness**
   - Risk: Frontend developer adds `if (template === 'booking')`
   - Impact: Platform becomes template-specific
   - Prevention: Strict code review, metadata-only rendering

2. **Analytics Event Creep**
   - Risk: Developer adds `booking:created` for "clarity"
   - Impact: Core analytics becomes template-aware
   - Prevention: Strict event taxonomy review

3. **Billing Quota Expansion**
   - Risk: Product team requests `maxBookingsPerMonth`
   - Impact: Billing becomes template-centric
   - Prevention: Capability philosophy enforcement

4. **Customer Entity Pollution**
   - Risk: Developer adds `bookingData` to Customer for "convenience"
   - Impact: Customer becomes template-aware
   - Prevention: Entity boundary review

5. **Feature-First Development**
   - Risk: Team adds team management, webhooks, API keys
   - Impact: Platform loses focus
   - Prevention: Sequencing discipline

### What MUST Stay Frozen

1. **Customer Entity Schema**
   - No template-specific fields
   - No template-specific foreign keys
   - Universal only

2. **Core Analytics Event Names**
   - `session:started`, `session:completed`, `session:abandoned`
   - `conversion:achieved`
   - No template-specific events

3. **Capability-Based Quotas**
   - `maxInteractionsPerMonth`
   - `maxFlows`
   - No template-specific quotas

4. **Runtime/Operational Separation**
   - Runtime never imports operational
   - Operational is READ-ONLY
   - No exceptions

5. **Template Isolation**
   - No cross-template imports
   - Templates register metadata only
   - No template modifies core

### What Can Safely Evolve

1. **Widget Types**
   - Can add new widget types as needed
   - Frontend renders from type, not hardcoded

2. **Metadata Schema**
   - `OwnerModuleDefinition` can evolve
   - Add new metadata fields incrementally

3. **Booking Business Logic**
   - Booking service can grow
   - Add cancellation, rescheduling, reminders

4. **Operational APIs**
   - New endpoints for booking data
   - READ-ONLY, guarded by ownership

5. **Analytics Metadata**
   - Booking can add template-specific metadata
   - Metadata is JSON, flexible

---

## APPENDIX: VALIDATION CHECKLIST

### Pre-Implementation Checklist

- [ ] Customer entity has no template-specific fields
- [ ] Analytics taxonomy has no template-specific events
- [ ] Billing has no template-specific quotas
- [ ] Runtime has no operational imports
- [ ] Template factory has no cross-template imports
- [ ] OwnerModuleRegistry has metadata for booking
- [ ] Mini App endpoints have ownership guards

### Post-Implementation Checklist

- [ ] Booking creates customers via `CustomerService`
- [ ] Booking tracks events via `AnalyticsService` (generic names)
- [ ] Booking checks quotas via `BillingService` (generic quotas)
- [ ] Booking creation is transactional
- [ ] Slot collisions handled with unique constraints
- [ ] Webhook idempotency works
- [ ] No core files modified
- [ ] No template-specific frontend routes
- [ ] Navigation composed from metadata
- [ ] Widgets composed from metadata

### Final Verdict Checklist

- [ ] Architecture validated: booking fits without core changes
- [ ] Universality proven: generic patterns work for 2 templates
- [ ] No drift detected: no funnel-centric assumptions
- [ ] Sequencing preserved: no premature abstractions
- [ ] Invariants intact: all 10 invariants preserved

---

**END OF IMPLEMENTATION VALIDATION**

**Verdict: ARCHITECTURE VALIDATED — Booking template can be implemented safely.**

**Next step: Proceed with implementation execution plan (Section 9).**
