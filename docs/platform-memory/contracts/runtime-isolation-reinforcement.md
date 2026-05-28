# Runtime Isolation Reinforcement

**Purpose:** Define capability runtime isolation boundaries  
**Status:** CANONICAL — Tier 1 Contract  
**Version:** 1.0  
**Phase:** PRE-UNIT-04 Stabilization  
**Date:** 2026-05-23

---

## SECTION 1 — CAPABILITY RUNTIME ISOLATION

### Definition

**Capability Runtime Isolation** means each capability operates as an independent runtime with no cross-capability execution, orchestration, or synchronization.

### Isolation Principle

```
Booking Runtime        Support Runtime       Lead Funnel Runtime
    │                        │                       │
    ├── Owns DB              ├── Owns DB             ├── Owns DB
    ├── Owns logic           ├── Owns logic          ├── Owns logic
    ├── Owns projections     ├── Owns projections    ├── Owns projections
    └── Isolated             └── Isolated            └── Isolated
    
    NO SHARED STATE          NO SHARED STATE         NO SHARED STATE
    NO ORCHESTRATION         NO ORCHESTRATION        NO ORCHESTRATION
    NO SYNCHRONIZATION       NO SYNCHRONIZATION      NO SYNCHRONIZATION
```

---

## SECTION 2 — WHAT CAPABILITIES MAY DO

### Allowed Actions

| Action | Example | Why Safe |
|--------|---------|----------|
| **Expose metadata** | Booking config, slot duration | Capability self-description |
| **Expose operational projections** | Booking list, ticket list | Read-only visibility |
| **Expose capability contracts** | Query service interfaces | API definition |
| **Own database tables** | bookings, tickets, leads | Data isolation |
| **Own business logic** | Booking creation flow | Logic isolation |

### Code Example: Safe Capability

```typescript
// ✅ SAFE: Booking capability is isolated
@Injectable()
class BookingRuntimeService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(ProviderAvailability)
    private readonly availabilityRepository: Repository<ProviderAvailability>,
  ) {}
  
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    // Booking-specific logic only
    const availability = await this.availabilityRepository.findOne({
      where: { botId: data.botId },
    });
    
    // Check slot availability
    const isAvailable = await this.isSlotAvailable(
      data.botId,
      data.date,
      data.timeSlot
    );
    
    if (!isAvailable) throw new Error('Slot not available');
    
    const booking = this.bookingRepository.create(data);
    return this.bookingRepository.save(booking);
  }
  
  // Only booking-related methods
  async confirmBooking(bookingId: string): Promise<Booking> { /* ... */ }
  async cancelBooking(bookingId: string): Promise<Booking> { /* ... */ }
  async completeBooking(bookingId: string): Promise<Booking> { /* ... */ }
}
```

---

## SECTION 3 — WHAT CAPABILITIES MUST NEVER DO

### Forbidden Actions

| Action | Example | Why Forbidden |
|--------|---------|---------------|
| **Execute each other** | Booking service calls support service | Cross-capability execution |
| **Orchestrate each other** | Booking service creates ticket | Workflow orchestration |
| **Synchronize each other** | Booking status syncs with ticket | State synchronization |
| **Depend on shared lifecycle** | Shared customer lifecycle | Lifecycle coupling |

### Code Example: Forbidden Capability

```typescript
// ❌ FORBIDDEN: Cross-capability execution
@Injectable()
class BookingRuntimeService {
  constructor(
    private readonly supportRuntimeService: SupportRuntimeService,  // ❌ WRONG
    private readonly leadFunnelService: LeadFunnelService,  // ❌ WRONG
  ) {}
  
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    const booking = await this.bookingRepository.save(data);
    
    // ❌ FORBIDDEN: Cross-capability orchestration
    await this.supportRuntimeService.createTicket({
      customerId: data.customerId,
      subject: `New booking: ${booking.id}`,
    });
    
    // ❌ FORBIDDEN: Cross-capability synchronization
    await this.leadFunnelService.markLeadConverted(data.customerId);
    
    return booking;
  }
}
```

---

## SECTION 4 — CAPABILITY PRIMITIVES

### Booking Is NOT a Scheduling Primitive

```typescript
// ❌ FORBIDDEN: Booking as platform primitive
class UniversalScheduler {
  async schedule(botId: string, resource: string, time: string) {
    // Uses booking as generic scheduling primitive
    return this.bookingRuntimeService.createBooking({
      botId,
      resource,
      timeSlot: time,
    });
  }
}

// ✅ CORRECT: Booking is isolated capability
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    // Booking-specific logic only
    // Not used as generic scheduling primitive
  }
}
```

### Support Is NOT a Communication Primitive

```typescript
// ❌ FORBIDDEN: Support as platform primitive
class UniversalMessenger {
  async sendMessage(botId: string, customerId: string, message: string) {
    // Uses support as generic messaging primitive
    return this.supportRuntimeService.createTicket({
      botId,
      customerId,
      subject: message,
    });
  }
}

// ✅ CORRECT: Support is isolated capability
class SupportRuntimeService {
  async createTicket(data: CreateTicketDto): Promise<Ticket> {
    // Support-specific logic only
    // Not used as generic messaging primitive
  }
}
```

### Lead Funnel Is NOT a Conversion Primitive

```typescript
// ❌ FORBIDDEN: Lead Funnel as platform primitive
class UniversalConverter {
  async convert(customerId: string, type: string) {
    // Uses lead funnel as generic conversion primitive
    return this.leadFunnelService.createLead({
      customerId,
      type,
    });
  }
}

// ✅ CORRECT: Lead Funnel is isolated capability
class LeadFunnelService {
  async createLead(data: CreateLeadDto): Promise<Lead> {
    // Lead funnel-specific logic only
    // Not used as generic conversion primitive
  }
}
```

---

## SECTION 5 — CAPABILITY BOUNDARY CONTRACT

### Boundary Rules

| Rule | Meaning |
|------|---------|
| **No cross-capability imports** | Booking service does not import Support service |
| **No shared state** | Capabilities do not share database tables |
| **No shared lifecycle** | Each capability manages its own lifecycle |
| **No event coupling** | Capabilities do not listen to each other's events |
| **No shared configuration** | Each capability has its own config |

### Dependency Direction

```
Operational Surfaces (Dashboard, Mini App)
    │
    ├── READS from → BookingQueryService
    ├── READS from → SupportQueryService
    └── READS from → LeadFunnelQueryService
    │
    └── NO cross-capability dependencies

Capabilities (Booking, Support, LeadFunnel)
    │
    ├── Each has → Own database tables
    ├── Each has → Own business logic
    ├── Each has → Own runtime service
    └── Each has → Own query service
    │
    └── NO cross-capability dependencies
```

---

## SECTION 6 — VALIDATION GATES

### Gate 1: No Cross-Capability Imports

```bash
grep -r "import.*SupportRuntimeService.*from.*booking\|import.*BookingRuntimeService.*from.*support" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: No Shared Database Tables

```bash
grep -r "@Entity.*shared\|@Entity.*universal" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Cross-Capability Event Listeners

```bash
grep -r "@OnEvent.*booking.*support\|@OnEvent.*support.*booking" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Universal Primitives

```bash
grep -r "UniversalScheduler\|UniversalMessenger\|UniversalConverter" src/
# Expected: no results
```

**Status:** ✅ PASS

---

## SECTION 7 — CANONICAL RULES

### Rule 1: Capabilities Are Isolated

Each capability operates independently with no cross-capability dependencies.

### Rule 2: Capabilities Own Their Data

Each capability owns its database tables and state.

### Rule 3: Capabilities Own Their Logic

Each capability implements its own business logic.

### Rule 4: Capabilities Are Not Primitives

Capabilities are not reusable primitives for other capabilities.

### Rule 5: No Cross-Capability Execution

Capabilities do not execute methods on other capabilities.

### Rule 6: No Cross-Capability Orchestration

Capabilities do not orchestrate workflows across other capabilities.

### Rule 7: No Cross-Capability Synchronization

Capabilities do not synchronize state with other capabilities.

### Rule 8: No Shared Lifecycle

Each capability manages its own entity lifecycle independently.

---

**Version 1.0 — PRE-UNIT-04 — 2026-05-23**
