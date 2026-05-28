# Projection Rendering Contract

**Purpose:** Define projection rendering boundaries and responsibilities  
**Status:** CANONICAL — Tier 2 Contract  
**Version:** 1.0  
**Unit:** 05 — Projection Consumption & Operational Read Models  
**Date:** 2026-05-23

---

## RENDERING RESPONSIBILITY MATRIX

| Aspect | Capability Owns | Operational Surface Owns | Platform Owns |
|--------|----------------|-------------------------|---------------|
| **Business meaning** | ✅ | ❌ | ❌ |
| **Data shape** | ✅ | ❌ | ❌ |
| **Filtering rules** | ✅ | ❌ | ❌ |
| **Aggregation logic** | ✅ | ❌ | ❌ |
| **Field names** | ✅ | ❌ | ❌ |
| **Status values** | ✅ | ❌ | ❌ |
| **Date formatting** | ❌ | ✅ | ❌ |
| **UI labels** | ❌ | ✅ | ❌ |
| **Color coding** | ❌ | ✅ | ❌ |
| **Pagination** | ❌ | ✅ | ❌ |
| **Sorting UI** | ❌ | ✅ | ❌ |
| **HTTP transport** | ❌ | ❌ | ✅ |
| **Auth/AuthZ** | ❌ | ❌ | ✅ |
| **Serialization** | ❌ | ❌ | ✅ |

---

## CAPABILITY OWNS MEANING

### What Capability Defines

```typescript
// ✅ CORRECT: Capability defines business meaning
class BookingQueryService {
  async getStatusDistribution(botId: string) {
    return this.bookingRepository
      .createQueryBuilder('b')
      .select('b.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('b.botId = :botId', { botId })
      .groupBy('b.status')
      .getRawMany();
  }
  
  // Capability defines what "status" means
  // Capability defines what "distribution" means
}
```

### What Capability Provides

```typescript
// ✅ CORRECT: Capability provides formatted response
return {
  status: 'confirmed',        // Capability defines
  statusLabel: 'Confirmed',   // Capability provides
  statusColor: 'green',       // Capability suggests
};
```

---

## OPERATIONAL SURFACE OWNS RENDERING

### What Surface Does

```typescript
// ✅ CORRECT: Surface renders capability-defined data
class DashboardController {
  @Get(':id/bookings')
  async getBookings(@Param('id') botId: string) {
    const bookings = await this.bookingQueryService.getBotBookings(botId);
    
    return bookings.map(booking => ({
      // Surface adds rendering metadata
      id: booking.id,
      date: this.formatDate(booking.date),           // Surface formats
      time: booking.timeSlot,
      status: booking.status,
      statusLabel: booking.statusLabel,              // From capability
      statusColor: this.getStatusColor(booking.status), // Surface colors
      customerName: booking.customerName,
    }));
  }
}
```

### What Surface Does NOT Do

```typescript
// ❌ FORBIDDEN: Surface defines business meaning
class DashboardController {
  @Get(':id/bookings')
  async getBookings(@Param('id') botId: string) {
    const bookings = await this.bookingQueryService.getBotBookings(botId);
    
    return bookings.map(booking => ({
      id: booking.id,
      // ❌ FORBIDDEN: Surface defines status meaning
      statusMeaning: booking.status === 'confirmed' 
        ? 'Owner approved this booking'
        : 'Waiting for approval',
      // ❌ FORBIDDEN: Surface defines business logic
      canCancel: booking.status === 'pending' || booking.status === 'confirmed',
    }));
  }
}
```

---

## PLATFORM OWNS TRANSPORT

### What Platform Provides

```typescript
// Platform provides:
// - HTTP server (NestJS)
// - Authentication (JWT)
// - Authorization (guards)
// - Request/response serialization
// - Error handling middleware
// - Logging infrastructure
```

### Platform Does NOT Own

```typescript
// Platform does NOT:
// - Define business semantics
// - Define projection shape
// - Define rendering logic
// - Define UI behavior
```

---

## TRANSPORT VS BUSINESS SEMANTICS

### Transport Semantics (Platform)

| Aspect | Example | Owner |
|--------|---------|-------|
| HTTP status codes | 200, 404, 500 | Platform |
| Content-Type | application/json | Platform |
| Pagination headers | X-Total-Count | Platform |
| Auth headers | Authorization: Bearer | Platform |

### Business Semantics (Capability)

| Aspect | Example | Owner |
|--------|---------|-------|
| Status values | pending, confirmed, cancelled | Capability |
| Field names | timeSlot, providerId | Capability |
| Validation rules | slot must be available | Capability |
| Business logic | confirmBooking flow | Capability |

### Rendering Semantics (Surface)

| Aspect | Example | Owner |
|--------|---------|-------|
| Date display | "June 1, 2026" | Surface |
| Color coding | green = confirmed | Surface |
| UI labels | "Book Now" | Surface |
| Sort order | date descending | Surface |

---

## PREVENTING FRONTEND SEMANTIC OWNERSHIP

### Forbidden: Frontend Defines Business Meaning

```typescript
// ❌ FORBIDDEN: Frontend defines status meaning
// frontend/components/BookingCard.tsx
function BookingCard({ booking }) {
  const statusLabels = {
    pending: 'Waiting for owner',
    confirmed: 'Owner approved',
    completed: 'Service done',
    cancelled: 'Cancelled by customer',
  };
  
  return <span>{statusLabels[booking.status]}</span>;
  // ❌ Frontend defines what status means
}
```

### Correct: Frontend Renders Capability-Defined Labels

```typescript
// ✅ CORRECT: Frontend renders capability-defined labels
function BookingCard({ booking }) {
  return <span>{booking.statusLabel}</span>;
  // ✅ Backend provides label
  // ✅ Frontend only renders
}
```

---

## PREVENTING PROJECTION MUTATION DURING RENDERING

### Forbidden: Rendering Mutates Projection

```typescript
// ❌ FORBIDDEN: Rendering mutates data
class DashboardController {
  async getBookings(botId: string) {
    const bookings = await this.bookingQueryService.getBotBookings(botId);
    
    // ❌ FORBIDDEN: Mutating during rendering
    for (const booking of bookings) {
      booking.displayDate = this.formatDate(booking.date);
      // Mutates original object!
    }
    
    return bookings;
  }
}
```

### Correct: Rendering Creates New Objects

```typescript
// ✅ CORRECT: Rendering creates new objects
class DashboardController {
  async getBookings(botId: string) {
    const bookings = await this.bookingQueryService.getBotBookings(botId);
    
    // ✅ Creates new objects, doesn't mutate
    return bookings.map(booking => ({
      ...booking,
      displayDate: this.formatDate(booking.date),
    }));
  }
}
```

---

## CANONICAL RULES

### Rule 1: Capability Owns Business Semantics

Capability defines what data means, what values are valid, how entities relate.

### Rule 2: Surface Owns Presentation

Surface formats, styles, and arranges data for human consumption.

### Rule 3: Platform Owns Transport

Platform handles HTTP, auth, serialization, error handling.

### Rule 4: Frontend Does Not Own Semantics

Frontend renders capability-defined labels and meanings. It does not define them.

### Rule 5: Rendering Does Not Mutate

Rendering creates new presentation objects. It never mutates capability-defined data.

### Rule 6: Transport Is Semantically Neutral

HTTP layer knows nothing about business meaning.

---

**Version 1.0 — UNIT 05 — 2026-05-23**
