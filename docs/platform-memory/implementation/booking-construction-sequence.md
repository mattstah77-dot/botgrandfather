# Booking Capability Construction Sequence

**Purpose:** Define EXACT implementation order for Booking capability  
**Status:** CANONICAL — Tier 1 Implementation Governance  
**Version:** 1.0  
**Unit:** Booking Implementation Transition  
**Date:** 2026-05-23

---

## CORE PRINCIPLE

> **Build in dependency order. Build minimal first. Build more only after less works.**

---

## PHASE 1 — DOMAIN SKELETON

### Goal

Establish domain entities, repositories, and ownership.

### Deliverables

| # | Deliverable | File | Notes |
|---|-------------|------|-------|
| 1 | Customer entity | `src/customer/entities/customer.entity.ts` | Already exists |
| 2 | Booking entity | `src/booking/entities/booking.entity.ts` | Create |
| 3 | ProviderAvailability entity | `src/booking/entities/provider-availability.entity.ts` | Already exists |
| 4 | BookingRepository | `src/booking/repositories/booking.repository.ts` | Create |
| 5 | ProviderAvailabilityRepository | `src/booking/repositories/provider-availability.repository.ts` | Create |
| 6 | Capability registration | `src/templates/booking/booking.template.ts` | Create |

### What to Build

```typescript
// 1. Booking entity
@Entity('bookings')
class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  botId: string;

  @Column('uuid')
  customerId: string;

  @Column('date')
  date: string;

  @Column('time')
  timeSlot: string;

  @Column('enum', { enum: BookingStatus })
  status: BookingStatus;

  // ... timestamps
}

// 2. BookingRepository
@Injectable()
class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repo: Repository<Booking>,
  ) {}

  async create(booking: Booking): Promise<Booking> {
    return this.repo.save(booking);
  }

  async findOne(id: string): Promise<Booking | null> {
    return this.repo.findOne({ where: { id } });
  }
}

// 3. Capability registration
@Injectable()
class BookingTemplate {
  key = 'booking';
  name = 'Booking';
  getRuntimeService() { return this.bookingRuntimeService; }
  getQueryService() { return this.bookingQueryService; }
}
```

### What NOT to Build Yet

- ❌ Recurrence engines
- ❌ Automation
- ❌ Workflows
- ❌ Queues
- ❌ Orchestration
- ❌ Drag-drop systems
- ❌ Optimization infrastructure

### Validation

- [ ] Entities defined
- [ ] Repositories created
- [ ] Module structure in place
- [ ] No runtime logic yet
- [ ] No query logic yet

---

## PHASE 2 — TEMPORAL CORE

### Goal

Implement core temporal semantics: availability computation, occupancy checks, write-time validation.

### Deliverables

| # | Deliverable | File | Notes |
|---|-------------|------|-------|
| 1 | ProviderAvailabilityService | `src/booking/services/provider-availability.service.ts` | Create |
| 2 | OccupancyChecker | `src/booking/services/occupancy-checker.service.ts` | Create |
| 3 | TemporalValidator | `src/booking/services/temporal-validator.service.ts` | Create |
| 4 | BookingQueryService (partial) | `src/booking/services/booking-query.service.ts` | Create |

### What to Build

```typescript
// 1. ProviderAvailabilityService
@Injectable()
class ProviderAvailabilityService {
  async getAvailableDays(botId: string, providerId: string): Promise<string[]> {
    // Compute available days from working hours + excluded dates
  }
}

// 2. OccupancyChecker
@Injectable()
class OccupancyChecker {
  async isSlotOccupied(botId: string, date: string, timeSlot: string): Promise<boolean> {
    const existing = await this.bookingRepo.findOne({
      where: { botId, date, timeSlot, status: In(['pending', 'confirmed']) }
    });
    return !!existing;
  }
}

// 3. TemporalValidator
@Injectable()
class TemporalValidator {
  async validateBooking(data: CreateBookingDto): Promise<void> {
    // Validate date not in past
    // Validate date not excluded
    // Validate time within working hours
    // Validate slot not occupied
  }
}

// 4. BookingQueryService (partial)
@Injectable()
class BookingQueryService {
  async getAvailableSlots(botId: string, date: string): Promise<string[]> {
    // Compute available slots (no caching, ephemeral)
  }
}
```

### What NOT to Build Yet

- ❌ Customer runtime endpoints
- ❌ MiniApp integration
- ❌ Owner operational UI
- ❌ Dashboard projections
- ❌ Concurrency handling
- ❌ Rescheduling

### Validation

- [ ] Availability computation works
- [ ] Occupancy checks work
- [ ] Temporal validation works
- [ ] No runtime endpoints yet
- [ ] No UI integration yet

---

## PHASE 3 — CUSTOMER RUNTIME

### Goal

Implement customer-facing booking flow with hybrid access layer.

### Deliverables

| # | Deliverable | File | Notes |
|---|-------------|------|-------|
| 1 | BookingRuntimeService | `src/booking/services/booking-runtime.service.ts` | Create |
| 2 | Customer MiniApp endpoints | `src/booking/controllers/booking-customer.controller.ts` | Create |
| 3 | Chat entry points | `src/booking/controllers/booking-chat.controller.ts` | Create |
| 4 | CreateBookingDto | `src/booking/dto/create-booking.dto.ts` | Create |
| 5 | BookingStatus enum | `src/booking/entities/booking-status.enum.ts` | Create |

### What to Build

```typescript
// 1. BookingRuntimeService
@Injectable()
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    // Re-validate at write time
    await this.temporalValidator.validateBooking(data);
    
    // Create booking
    const booking = this.bookingRepo.create(data);
    return this.bookingRepo.save(booking);
  }
}

// 2. Customer MiniApp endpoints
@Controller('miniapp/bots/:id/bookings')
class BookingCustomerController {
  @Get('slots')
  async getSlots(@Param('id') botId: string, @Query('date') date: string) {
    return this.bookingQueryService.getAvailableSlots(botId, date);
  }

  @Post('create')
  async createBooking(@Body() data: CreateBookingDto) {
    return this.bookingRuntimeService.createBooking(data);
  }
}

// 3. Chat entry points
@Controller('chat')
class BookingChatController {
  @Post('/start-booking')
  async startBooking(@Param('userId') userId: string) {
    // Chat provides entry only
    await this.telegram.sendMessage(userId, 'Open booking:', {
      reply_markup: { web_app: { url: '...' } }
    });
  }
}
```

### What NOT to Build Yet

- ❌ Rescheduling
- ❌ Cancellation
- ❌ Dashboard projections
- ❌ Owner operational UI
- ❌ Concurrency handling
- ❌ Notifications

### Validation

- [ ] Booking creation works end-to-end
- [ ] Slot selection works
- [ ] Hybrid UX coherent (Chat → MiniApp)
- [ ] No rescheduling yet
- [ ] No cancellation yet

---

## PHASE 4 — OWNER OPERATIONAL LAYER

### Goal

Implement operational visibility: projections, dashboard visibility, booking management.

### Deliverables

| # | Deliverable | File | Notes |
|---|-------------|------|-------|
| 1 | Operational projections | `src/booking/projections/booking-projection.service.ts` | Create |
| 2 | Dashboard endpoints | `src/booking/controllers/booking-dashboard.controller.ts` | Create |
| 3 | Booking management endpoints | `src/booking/controllers/booking-management.controller.ts` | Create |
| 4 | DashboardCapabilityProvider | `src/booking/providers/booking-dashboard.provider.ts` | Create |

### What to Build

```typescript
// 1. Operational projections
@Injectable()
class BookingProjectionService {
  async getBotBookings(botId: string): Promise<Booking[]> {
    // Read-only projection
    return this.bookingRepo.find({ where: { botId } });
  }

  async getBookingStats(botId: string): Promise<BookingStats> {
    // Dumb aggregation
    const bookings = await this.getBotBookings(botId);
    return { total: bookings.length };
  }
}

// 2. Dashboard endpoints
@Controller('miniapp/bots/:id/booking-dashboard')
class BookingDashboardController {
  @Get('bookings')
  async getBookings(@Param('id') botId: string) {
    return this.bookingProjectionService.getBotBookings(botId);
  }

  @Get('stats')
  async getStats(@Param('id') botId: string) {
    return this.bookingProjectionService.getBookingStats(botId);
  }
}

// 3. Booking management endpoints
@Controller('miniapp/bots/:id/bookings')
class BookingManagementController {
  @Post(':bookingId/confirm')
  async confirmBooking(@Param('bookingId') bookingId: string) {
    // Owner confirms booking
    return this.bookingRuntimeService.confirmBooking(bookingId);
  }

  @Post(':bookingId/cancel')
  async cancelBooking(@Param('bookingId') bookingId: string) {
    // Owner cancels booking
    return this.bookingRuntimeService.cancelBooking(bookingId);
  }
}
```

### What NOT to Build Yet

- ❌ Concurrency validation
- ❌ Runtime validation (already in Phase 2)
- ❌ Recurrence
- ❌ Automation
- ❌ Notifications
- ❌ Scalability infrastructure

### Validation

- [ ] Operational projections work
- [ ] Dashboard visibility works
- [ ] Booking management works
- [ ] No concurrency handling yet
- [ ] Projections are observational only

---

## PHASE 5 — HARDENING

### Goal

Add concurrency validation, runtime validation, scalability checks.

### Deliverables

| # | Deliverable | File | Notes |
|---|-------------|------|-------|
| 1 | Database unique constraint | `@Unique(['botId', 'date', 'timeSlot', 'status'])` | Create |
| 2 | Concurrency handling | `src/booking/services/concurrency-handler.service.ts` | Create |
| 3 | Write-time validation (enhanced) | `src/booking/services/write-time-validator.service.ts` | Enhance |
| 4 | Timezone handling | `src/booking/utils/timezone.util.ts` | Create |

### What to Build

```typescript
// 1. Database unique constraint
@Entity('bookings')
@Unique(['botId', 'date', 'timeSlot', 'status'])
class Booking {
  // ... fields
}

// 2. Concurrency handling
@Injectable()
class ConcurrencyHandler {
  async handleBookingConflict(error: Error): Promise<Error> {
    if (isUniqueViolation(error)) {
      return new Error('Slot just booked, please select another');
    }
    throw error;
  }
}

// 3. Write-time validation (enhanced)
@Injectable()
class WriteTimeValidator {
  async validateAtWriteTime(data: CreateBookingDto): Promise<void> {
    // Re-read availability
    // Re-check occupancy
    // Validate against current truth
  }
}
```

### What NOT to Build

- ❌ Recurrence engines
- ❌ Automation
- ❌ Workflows
- ❌ Queues
- ❌ Distributed systems
- ❌ Slot materialization
- ❌ Optimization infrastructure

### Validation

- [ ] Concurrency handled gracefully
- [ ] Unique constraints in place
- [ ] Write-time validation complete
- [ ] Timezone handling safe
- [ ] No premature optimization

---

## FORBIDDEN IN EARLY PHASES

### Phase 1-2 Forbidden

- ❌ Customer runtime
- ❌ MiniApp integration
- ❌ Chat integration
- ❌ Dashboard projections
- ❌ Owner UI

### Phase 3 Forbidden

- ❌ Dashboard projections
- ❌ Owner UI
- ❌ Recurrence
- ❌ Automation
- ❌ Workflows

### Phase 4 Forbidden

- ❌ Recurrence engines
- ❌ Automation
- ❌ Workflows
- ❌ Queues
- ❌ Optimization infrastructure

---

## CANONICAL RULES

### Rule 1: Follow Phase Order

Do not skip phases. Do not implement Phase 3 before Phase 2.

### Rule 2: Minimal Per Phase

Build only what is required for that phase.

### Rule 3: No Early Features

Rescheduling, cancellation, recurrence come AFTER core booking works.

### Rule 4: No Premature Infrastructure

Optimization, queuing, distribution come AFTER performance pressure.

### Rule 5: Validation Per Phase

Each phase must be validated before proceeding to next.

### Rule 6: Stop When Phase Complete

Do not add "just one more thing" to phase.

---

**Version 1.0 — Booking Implementation Transition — 2026-05-23**
