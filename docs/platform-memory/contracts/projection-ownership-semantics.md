# Projection Ownership Semantics

**Purpose:** Define who owns projections and rendering boundaries  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Phase:** PRE-UNIT-04 Stabilization  
**Date:** 2026-05-23

---

## SECTION 1 — PROJECTION OWNERSHIP

### Who Owns Projections

| Owner | Responsibility |
|-------|---------------|
| **Capability** | Defines projection semantics, data shape, business meaning |
| **Operational Surface** | Renders projections, applies UI formatting |
| **Platform** | Provides infrastructure for projection delivery |

### Ownership Hierarchy

```
Capability (Owner)
    │
    ├── Defines → projection schema
    ├── Defines → business meaning
    ├── Defines → data shape
    └── Defines → filtering rules
    │
    └── OWNS projection semantics

Operational Surface (Renderer)
    │
    ├── Renders → projection data
    ├── Formats → UI presentation
    ├── Applies → visual styling
    └── Handles → user interaction
    │
    └── DOES NOT own semantics

Platform (Infrastructure)
    │
    ├── Provides → HTTP transport
    ├── Provides → auth/authz
    ├── Provides → database
    └── Provides → DI container
    │
    └── DOES NOT own projections
```

---

## SECTION 2 — CAPABILITY OWNS PROJECTION SEMANTICS

### What Capability Defines

| Aspect | Example | Why Capability Owns |
|--------|---------|-------------------|
| **Schema** | Booking has date, timeSlot, status | Business entity shape |
| **Business meaning** | "confirmed" means owner approved | Domain semantics |
| **Data shape** | Ticket has subject, status, priority | Domain structure |
| **Filtering rules** | Owner sees own bot's bookings | Tenant isolation |
| **Aggregation logic** | Status distribution counts | Domain calculation |

### Code Example: Capability-Owned Projection

```typescript
// ✅ CORRECT: Capability defines projection
@Injectable()
class BookingQueryService {
  /**
   * Capability defines what "status distribution" means.
   * This is domain-specific logic.
   */
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
  
  /**
   * Capability defines what "available slots" means.
   * This is domain-specific logic.
   */
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
}
```

---

## SECTION 3 — OPERATIONAL SURFACE ONLY RENDERS

### What Operational Surface Does

| Action | Example | Why Surface Does This |
|--------|---------|----------------------|
| **Renders data** | Displays booking list | UI presentation |
| **Formats dates** | "2026-06-01" → "June 1, 2026" | User-friendly display |
| **Applies styling** | Status badges, colors | Visual hierarchy |
| **Handles pagination** | Page 1 of 5 | UX optimization |
| **Applies sorting** | Sort by date, status | User preference |

### What Operational Surface Does NOT Do

| Action | Example | Why Forbidden |
|--------|---------|---------------|
| **Define business meaning** | "confirmed" means X | Domain semantics |
| **Define data shape** | Booking has field Y | Entity structure |
| **Define filtering** | Show only Z bookings | Business rules |
| **Define aggregation** | Count bookings by W | Domain calculation |

### Code Example: Surface Renders Only

```typescript
// ✅ CORRECT: Surface renders capability-defined projections
@Controller('miniapp/bots')
class BookingDashboardController {
  constructor(private readonly bookingQueryService: BookingQueryService) {}
  
  @Get(':id/bookings')
  async getBotBookings(
    @Param('id') botId: string,
    @Query('page') page?: string,
    @Query('status') status?: string,
  ) {
    // Surface renders what capability provides
    return this.bookingQueryService.getBotBookings(
      botId,
      page ? parseInt(page, 10) : 1,
      status,
    );
  }
  
  @Get(':id/bookings/status-distribution')
  async getStatusDistribution(@Param('id') botId: string) {
    // Surface renders what capability provides
    return this.bookingQueryService.getStatusDistribution(botId);
  }
}
```

---

## SECTION 4 — MINI APP DOES NOT DEFINE SEMANTICS

### What Mini App Does NOT Define

| Aspect | Why Not |
|--------|---------|
| **Business semantics** | "pending" means awaiting confirmation — defined by Booking capability |
| **Lifecycle semantics** | "confirmed" → "completed" flow — defined by Booking capability |
| **Operational meaning** | What "available slot" means — defined by Booking capability |
| **Data validation** | What constitutes valid booking — defined by Booking capability |
| **State transitions** | When status can change — defined by Booking capability |

### Code Example: Mini App Does Not Define

```typescript
// ❌ FORBIDDEN: Mini App defines business semantics
// frontend/owner-miniapp/src/components/BookingCard.tsx
function BookingCard({ booking }: { booking: Booking }) {
  // ❌ FORBIDDEN: Mini App defines meaning
  const statusMeaning = {
    pending: 'Waiting for owner',
    confirmed: 'Owner approved',
    completed: 'Service done',
    cancelled: 'Cancelled',
  };
  
  return (
    <div>
      <span>{statusMeaning[booking.status]}</span>
    </div>
  );
}

// ✅ CORRECT: Mini App renders capability-defined data
function BookingCard({ booking }: { booking: Booking }) {
  // ✅ CORRECT: Mini App renders what backend provides
  return (
    <div>
      <span>{booking.statusLabel}</span>  {/* Backend provides label */}
    </div>
  );
}
```

---

## SECTION 5 — PROJECTION OWNERSHIP MATRIX

| Aspect | Capability Owns | Surface Renders | Platform Provides |
|--------|----------------|-----------------|-------------------|
| **Schema** | ✅ | ❌ | ❌ |
| **Business meaning** | ✅ | ❌ | ❌ |
| **Data shape** | ✅ | ❌ | ❌ |
| **Filtering rules** | ✅ | ❌ | ❌ |
| **Aggregation logic** | ✅ | ❌ | ❌ |
| **UI formatting** | ❌ | ✅ | ❌ |
| **Visual styling** | ❌ | ✅ | ❌ |
| **Pagination** | ❌ | ✅ | ❌ |
| **Sorting UI** | ❌ | ✅ | ❌ |
| **HTTP transport** | ❌ | ❌ | ✅ |
| **Auth/AuthZ** | ❌ | ❌ | ✅ |
| **Database** | ❌ | ❌ | ✅ |

---

## SECTION 6 — VALIDATION GATES

### Gate 1: Capability Defines Semantics

```bash
grep -r "statusMeaning\|statusLabel.*frontend\|businessLogic.*frontend" frontend/
# Expected: no results
```

**Status:** ✅ PASS

### Gate 2: Surface Does Not Define Schema

```bash
grep -r "interface.*Booking.*frontend\|type.*Ticket.*frontend" frontend/
# Expected: only type imports from backend
```

**Status:** ✅ PASS

### Gate 3: No Business Logic in Controllers

```bash
grep -r "if.*status.*pending.*confirm\|businessRule\|workflowLogic" src/templates/
# Expected: no results (only in runtime services)
```

**Status:** ✅ PASS

---

## SECTION 7 — CANONICAL RULES

### Rule 1: Capability Owns Projection Semantics

Capability defines what projections mean, what they contain, how they are computed.

### Rule 2: Surface Only Renders

Operational surface renders capability-defined projections without modifying semantics.

### Rule 3: Mini App Does Not Define Business Meaning

Mini App does not encode business logic, lifecycle rules, or operational meaning.

### Rule 4: Platform Provides Infrastructure

Platform provides transport, auth, database — not projection semantics.

### Rule 5: No Semantic Leakage

Business semantics do not leak from capabilities into surfaces.

### Rule 6: No Schema Duplication

Projection schemas are defined in capabilities, not duplicated in surfaces.

### Rule 7: No Logic in Rendering

Rendering layer contains no business logic, only presentation logic.

### Rule 8: Capability Is Source of Truth

Capability is the sole authority on projection semantics.

---

**Version 1.0 — PRE-UNIT-04 — 2026-05-23**
