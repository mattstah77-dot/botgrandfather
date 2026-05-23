# Multi-Tenant Integrity

**Purpose:** Owner data is strictly isolated  
**Status:** CANONICAL — Tier 1 Invariant  
**Version:** 1.0

---

## THE LAW

> **Every database query MUST include ownership verification.**
> **One owner MUST NEVER access another owner's data.**

---

## ISOLATION MECHANISMS

### Ownership Verification

All operational endpoints verify ownership:

```typescript
// ✅ CORRECT
@UseGuards(MiniAppAuthGuard, BotOwnershipGuard)
@Get('bots/:id')
async getBot(@Param('id') botId: string, @Req() req) {
  return this.botService.findById(botId);
}
```

`BotOwnershipGuard` ensures:
```typescript
if (bot.ownerId !== session.ownerId) {
  throw new ForbiddenException();
}
```

### Query Scoping

All database queries scoped by owner:

```typescript
// ✅ CORRECT
async getOwnerBots(ownerId: string) {
  return this.botRepo.find({ where: { ownerId } });
}

// ❌ FORBIDDEN
async getAllBots() {
  return this.botRepo.find(); // No owner filter!
}
```

### Bot-Level Isolation

Runtime operations scoped by bot:

```typescript
// ✅ CORRECT
async getCustomers(botId: string) {
  return this.customerRepo.find({ where: { botId } });
}

// ❌ FORBIDDEN
async getAllCustomers() {
  return this.customerRepo.find(); // No bot filter!
}
```

---

## ISOLATION LEVELS

| Level | Scope | Enforcement |
|-------|-------|-------------|
| Owner | Owner sees only own bots | `BotOwnershipGuard` |
| Bot | Bot processes only own customers | `botId` in queries |
| Customer | Customer data isolated by bot | `botId` + `telegramUserId` |

---

## FORBIDDEN PATTERNS

### Global Queries

```typescript
// ❌ FORBIDDEN
async getAllCustomers() {
  return this.customerRepo.find();
}
```

### Missing Ownership Check

```typescript
// ❌ FORBIDDEN
@Get('bots/:id')
async getBot(@Param('id') botId: string) {
  // No ownership verification!
  return this.botService.findById(botId);
}
```

### Cross-Owner Data Access

```typescript
// ❌ FORBIDDEN
async getCustomer(ownerId: string, customerId: string) {
  // Should verify bot ownership first
  return this.customerRepo.findOne({ where: { id: customerId } });
}
```

---

## INVARIANTS

> **Invariant MTI.1:** Every operational endpoint verifies ownership.

> **Invariant MTI.2:** Every database query includes owner or bot scope.

> **Invariant MTI.3:** One owner MUST NEVER access another owner's data.

> **Invariant MTI.4:** Runtime operations scoped by botId.

> **Invariant MTI.5:** Global queries are FORBIDDEN.

---

**Version 1.0 — 2026-05-23**
