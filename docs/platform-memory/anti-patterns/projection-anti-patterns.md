# Projection Anti-Patterns

**Purpose:** Document projection-specific anti-patterns  
**Status:** CANONICAL — Tier 3 Anti-Pattern  
**Version:** 1.0  
**Unit:** 04 — Projection Architecture  
**Date:** 2026-05-23

---

## ANTI-PATTERN 1: Projection Escalation

### What It Is

Projection gains authority over time.

```typescript
// Stage 1: Innocent projection
async getBookingSummary(botId: string) {
  return this.bookingRepository.count({ where: { botId } });
}

// Stage 2: Projection used for decisions
async shouldAcceptBooking(botId: string) {
  const count = await this.getBookingSummary(botId);
  return count < 100;  // Projection used for business logic!
}

// Stage 3: Projection becomes authority
async createBooking(data: CreateBookingDto) {
  const summary = await this.getBookingSummary(data.botId);
  
  if (summary >= 100) {
    throw new Error('Booking limit reached');  // Projection enforces rule!
  }
  
  return this.bookingRepository.save(data);
}
```

### Why It Appears Attractive
- "Efficient" to use computed data
- "Convenient" to reuse projections
- "Fast" to avoid re-querying

### Why It Corrupts Architecture
- Projection becomes business rule
- Projection enforces limits
- Projection becomes authority

### Prevention
- Never use projections for business decisions
- Always query truth for validation
- Projections are advisory only

---

## ANTI-PATTERN 2: Projection Orchestration

### What It Is

Projection triggers cross-capability actions.

```typescript
// ❌ FORBIDDEN
async getCustomerProfile(customerId: string) {
  const bookings = await this.bookingQueryService.getCustomerBookings(customerId);
  const tickets = await this.supportQueryService.getCustomerTickets(customerId);
  
  // Projection triggers orchestration
  if (bookings.length > 0 && tickets.length === 0) {
    await this.supportRuntimeService.createTicket({
      customerId,
      subject: 'How was your booking?',
    });
  }
  
  return { bookings, tickets };
}
```

### Why It Appears Attractive
- "Smart" follow-up
- Automated engagement
- Proactive service

### Why It Corrupts Architecture
- Projection triggers actions
- Cross-capability coupling
- Hidden automation

### Prevention
- Projections are read-only
- No side effects in projections
- Actions require explicit user intent

---

## ANTI-PATTERN 3: Projection Lifecycle Ownership

### What It Is

Projection manages entity lifecycle.

```typescript
// ❌ FORBIDDEN
class SlotProjectionService {
  private activeSlots: Map<string, string[]> = new Map();
  
  async activateSlots(botId: string, date: string) {
    const slots = await this.computeSlots(botId, date);
    this.activeSlots.set(`${botId}:${date}`, slots);
  }
  
  async deactivateSlots(botId: string, date: string) {
    this.activeSlots.delete(`${botId}:${date}`);
  }
  
  async getActiveSlots(botId: string, date: string) {
    return this.activeSlots.get(`${botId}:${date}`) || [];
  }
}
```

### Why It Appears Attractive
- "Manage" slot lifecycle
- "Track" active slots
- "Optimize" slot queries

### Why It Corrupts Architecture
- Projection owns state
- Lifecycle management emerges
- State synchronization needed

### Prevention
- Slots are ephemeral
- No slot lifecycle
- Compute per request

---

## ANTI-PATTERN 4: Projection Synchronization Systems

### What It Is

System to keep projections synchronized across instances.

```typescript
// ❌ FORBIDDEN
class ProjectionSyncService {
  @Cron('*/30 * * * *')
  async syncAllProjections() {
    const bots = await this.botRepository.find();
    
    for (const bot of bots) {
      const slots = await this.computeSlots(bot.id);
      await this.distributedCache.set(`slots:${bot.id}`, slots);
    }
  }
}
```

### Why It Appears Attractive
- "Consistent" projections
- "Fast" reads from cache
- "Scalable" distributed system

### Why It Corrupts Architecture
- Cache becomes truth
- Sync complexity
- Race conditions

### Prevention
- No projection cache
- Recompute per request
- No synchronization

---

## ANTI-PATTERN 5: Smart Aggregation Engines

### What It Is

Aggregation that encodes business logic.

```typescript
// ❌ FORBIDDEN
class SmartDashboardService {
  async getCustomerHealth(customerId: string) {
    const [bookings, tickets] = await Promise.all([
      this.bookingQueryService.getCustomerBookings(customerId),
      this.supportQueryService.getCustomerTickets(customerId),
    ]);
    
    // Smart aggregation = business logic
    const health = this.calculateHealth(bookings, tickets);
    
    if (health.score < 50) {
      await this.retentionService.intervene(customerId);  // Action!
    }
    
    return health;
  }
}
```

### Why It Appears Attractive
- "Intelligent" insights
- Automated intervention
- Proactive service

### Why It Corrupts Architecture
- Aggregation becomes decision engine
- Business logic in projection
- Automation from analytics

### Prevention
- Aggregations are dumb
- No scoring
- No automated actions

---

## SUMMARY TABLE

| Anti-Pattern | Risk | Prevention |
|--------------|------|------------|
| Projection escalation | HIGH | Never use projections for decisions |
| Projection orchestration | VERY HIGH | No side effects in projections |
| Projection lifecycle ownership | HIGH | No projection state |
| Projection synchronization | VERY HIGH | No projection cache |
| Smart aggregation engines | VERY HIGH | Dumb aggregations only |

---

**Version 1.0 — UNIT 04 — 2026-05-23**
