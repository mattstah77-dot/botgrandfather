# Semantic Over-Abstraction Audit

**Purpose:** Analyze risk of dangerous abstraction emergence  
**Status:** CANONICAL — Tier 2 Audit  
**Version:** 1.0  
**Date:** 2026-05-23

---

## SECTION 1 — THE DANGER

### What Is Over-Abstraction

**Over-Abstraction** is the unintentional emergence of general-purpose abstractions that:
- Generalize temporal logic
- Create reusable operational semantics
- Build universal projection systems
- Define platform-level lifecycle models
- Enable capability-neutral business execution
- Introduce metadata-driven operational engines

### Why It's Dangerous

| Risk | Impact |
|------|--------|
| **Framework emergence** | Platform becomes scheduling engine |
| **Identity loss** | Platform loses capability-specific focus |
| **Complexity explosion** | Abstractions require more code than explicit |
| **Orchestration drift** | General abstractions enable workflow engines |
| **Maintenance burden** | Abstractions must handle all cases |

---

## SECTION 2 — ABSTRACTION RISK ANALYSIS

### Risk 1: Generalized Temporal Abstractions

**Safe:**
```typescript
// ✅ Capability-specific
async getAvailableSlots(botId: string, date: string): Promise<string[]> {
  const availability = await this.getProviderAvailability(botId);
  const bookings = await this.getBookingsForDate(botId, date);
  
  const occupied = bookings
    .filter(b => ['pending', 'confirmed'].includes(b.status))
    .map(b => b.timeSlot);
  
  return this.generateSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration
  ).filter(slot => !occupied.includes(slot));
}
```

**Dangerous:**
```typescript
// ❌ Generalized temporal abstraction
@Injectable()
class TemporalAvailabilityEngine {
  async getAvailableSlots(
    resourceId: string,
    availabilitySource: AvailabilitySource,
    occupancySource: OccupancySource,
    options: TemporalOptions
  ): Promise<TemporalSlot[]> {
    // Universal temporal logic
  }
}
```

**Why Dangerous:**
- Becomes scheduling framework
- Enables arbitrary resource types
- Encodes universal temporal semantics
- Platform becomes temporal engine

---

### Risk 2: Reusable Operational Semantics

**Safe:**
```typescript
// ✅ Capability-specific
@Injectable()
class BookingQueryService {
  async getBookedSlots(botId: string, date: string): Promise<string[]> {
    const bookings = await this.bookingRepository.find({
      where: { botId, date, status: In(['pending', 'confirmed']) }
    });
    return bookings.map(b => b.timeSlot);
  }
}
```

**Dangerous:**
```typescript
// ❌ Reusable operational semantics
@Injectable()
class OccupancyEngine {
  async getOccupiedSlots(
    resourceId: string,
    occupancyQuery: OccupancyQuery,
    options: OccupancyOptions
  ): Promise<string[]> {
    // Universal occupancy logic
  }
}
```

**Why Dangerous:**
- Becomes occupancy framework
- Enables arbitrary resource types
- Encodes universal occupancy semantics
- Platform becomes resource manager

---

### Risk 3: Universal Projection Systems

**Safe:**
```typescript
// ✅ Capability-specific projection
async getBookingProjection(botId: string): Promise<BookingProjection> {
  const bookings = await this.bookingRepository.find({ where: { botId } });
  return {
    total: bookings.length,
    byStatus: this.groupByStatus(bookings),
  };
}
```

**Dangerous:**
```typescript
// ❌ Universal projection system
@Injectable()
class ProjectionEngine {
  async createProjection<T>(
    source: DataSource<T>,
    transformations: ProjectionTransform<T>[],
    options: ProjectionOptions
  ): Promise<Projection<T>> {
    // Universal projection engine
  }
}
```

**Why Dangerous:**
- Becomes projection framework
- Enables arbitrary data sources
- Encodes universal transformation logic
- Platform becomes data pipeline engine

---

### Risk 4: Platform-Level Lifecycle Models

**Safe:**
```typescript
// ✅ Capability-specific lifecycle
enum BookingStatus {
  pending,
  confirmed,
  completed,
  cancelled,
  no_show
}

async confirmBooking(bookingId: string) {
  const booking = await this.getBooking(bookingId);
  if (booking.status !== 'pending') throw new Error('Cannot confirm');
  booking.status = 'confirmed';
  await this.save(booking);
}
```

**Dangerous:**
```typescript
// ❌ Platform-level lifecycle model
enum LifecycleState {
  created,
  processing,
  completed,
  cancelled
}

interface LifecycleMachine<T> {
  transition(state: LifecycleState, entity: T): Promise<LifecycleState>;
  validate(from: LifecycleState, to: LifecycleState): boolean;
}
```

**Why Dangerous:**
- Becomes workflow engine
- Enables arbitrary state machines
- Encodes universal lifecycle semantics
- Platform becomes BPM system

---

### Risk 5: Capability-Neutral Business Execution

**Safe:**
```typescript
// ✅ Capability-specific execution
class BookingRuntimeService {
  async createBooking(data: CreateBookingDto) {
    // Booking-specific logic
  }
}

class SupportRuntimeService {
  async createTicket(data: CreateTicketDto) {
    // Support-specific logic
  }
}
```

**Dangerous:**
```typescript
// ❌ Capability-neutral execution
@Injectable()
class BusinessExecutionEngine {
  async execute(
    capability: CapabilityType,
    action: BusinessAction,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    // Universal execution engine
  }
}
```

**Why Dangerous:**
- Becomes execution framework
- Enables arbitrary capabilities
- Encodes universal business semantics
- Platform becomes no-code engine

---

### Risk 6: Metadata-Driven Operational Engines

**Safe:**
```typescript
// ✅ Explicit code
@Injectable()
class BookingQueryService {
  async getStatusDistribution(botId: string): Promise<Record<string, number>> {
    const results = await this.bookingRepository
      .createQueryBuilder('b')
      .select('b.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('b.botId = :botId', { botId })
      .groupBy('b.status')
      .getRawMany();
    
    const counts: Record<string, number> = {};
    for (const row of results) {
      counts[row.status] = parseInt(row.count, 10);
    }
    return counts;
  }
}
```

**Dangerous:**
```typescript
// ❌ Metadata-driven engine
@Injectable()
class OperationalMetricsEngine {
  async generateMetrics(
    dataSource: string,
    aggregations: MetricAggregation[],
    filters: Filter[]
  ): Promise<Metric[]> {
    // Universal metrics engine driven by metadata
  }
}
```

**Why Dangerous:**
- Becomes metrics framework
- Enables arbitrary aggregations
- Encodes universal query logic
- Platform becomes BI engine

---

## SECTION 3 — ABSTRACTION BOUNDARIES

### Justified Abstraction

| Abstraction | Justification | Boundary |
|-------------|--------------|----------|
| **Repository pattern** | Standard data access | Internal only |
| **Service layer** | Business logic separation | Capability-specific |
| **Query/Command separation** | Clear responsibilities | Capability-specific |
| **Type guards** | Type safety | Internal only |

### Dangerous Abstraction

| Abstraction | Why Dangerous | Boundary |
|-------------|--------------|----------|
| **Universal temporal engine** | Becomes scheduling framework | FORBIDDEN |
| **Generic occupancy system** | Becomes resource manager | FORBIDDEN |
| **Universal projection engine** | Becomes data pipeline | FORBIDDEN |
| **Platform lifecycle model** | Becomes workflow engine | FORBIDDEN |
| **Capability-neutral execution** | Becomes no-code engine | FORBIDDEN |
| **Metadata-driven metrics** | Becomes BI engine | FORBIDDEN |

---

## SECTION 4 — DRIFT DETECTION

### Warning Signs

| Sign | Risk Level | Action |
|------|-----------|--------|
| Generic engine class names | ⚠️ MEDIUM | Review immediately |
| Universal interfaces | 🔴 HIGH | Stop and refactor |
| Metadata-driven logic | 🔴 HIGH | Stop and refactor |
| Capability-neutral abstractions | 🔴 HIGH | Stop and refactor |
| Reusable temporal semantics | 🔴 CRITICAL | Immediate rollback |
| Platform-level lifecycle | 🔴 CRITICAL | Immediate rollback |

---

### Detection Questions

| Question | YES = Drift Risk |
|----------|-----------------|
| Does abstraction have generic name (Engine, Framework, System)? | ✅ Risk |
| Does abstraction work with arbitrary resource types? | ✅ Risk |
| Does abstraction use metadata for behavior? | ✅ Risk |
| Does abstraction enable capability-neutral execution? | ✅ Risk |
| Does abstraction encode universal temporal semantics? | ✅ Risk |
| Does abstraction create platform-level lifecycle? | ✅ Risk |
| Is abstraction more complex than explicit code? | ✅ Risk |
| Does abstraction enable workflow orchestration? | ✅ Risk |

---

## SECTION 5 — CANONICAL RULES

### Rule 1: Explicit Over Abstract

Explicit capability-specific code is safer than general abstractions.

### Rule 2: Capability-Specific Only

Abstractions must be capability-specific, not universal.

### Rule 3: No Generic Engine Names

Avoid names like "Engine", "Framework", "System" for capabilities.

### Rule 4: No Metadata-Driven Logic

Behavior must be in code, not metadata.

### Rule 5: No Platform-Level Lifecycles

Lifecycle models must be capability-specific.

### Rule 6: No Universal Temporal Semantics

Temporal logic must be capability-specific.

### Rule 7: Abstraction Must Not Enable Orchestration

Abstractions must not enable workflow orchestration.

### Rule 8: Complexity Must Not Increase

Abstraction must reduce complexity, not increase it.

---

## SECTION 6 — VALIDATION GATES

### Gate 1: No Generic Engine Names

```bash
grep -r "class.*Engine\|class.*Framework\|class.*System" src/templates/
# Expected: no results (except core infrastructure)
```

**Status:** ✅ PASS

### Gate 2: No Universal Interfaces

```bash
grep -r "interface.*Universal\|interface.*Generic\|interface.*Resource" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 3: No Metadata-Driven Logic

```bash
grep -r "metadata.*behavior\|config.*logic\|dynamic.*execution" src/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 4: No Capability-Neutral Abstractions

```bash
grep -r "CapabilityType\|BusinessAction\|ExecutionContext" src/templates/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 5: No Platform-Level Lifecycle

```bash
grep -r "LifecycleMachine\|LifecycleState\|StateMachine" src/templates/
# Expected: no results
```

**Status:** ✅ PASS

---

**Version 1.0 — 2026-05-23**
