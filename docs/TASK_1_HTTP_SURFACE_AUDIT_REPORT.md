# HTTP SURFACE AUDIT REPORT

**TASK:** 1 — HTTP Surface Audit  
**Date:** 2026-05-19  
**Status:** ✅ COMPLETE

---

## 1. Current SPA Routes

| Namespace | Handler | Status |
|-----------|---------|--------|
| `/app` | Owner MiniApp SPA entry | ✅ Working |
| `/app/*path` | SPA fallback → index.html | ✅ Working |
| `/customer` | Customer MiniApp SPA entry (with query params) | ✅ Working |
| `/customer/*path` | SPA fallback → index.html | ✅ Working |

---

## 2. Current API Routes

| Namespace | Controller | Methods | Auth Guard |
|-----------|------------|---------|------------|
| `/webhook/:botId/:secret` | WebhookController | POST | Secret-based |
| `/platform-bot/webhook` | PlatformBotController | POST | Telegram |
| `/health` | AppController | GET | None |
| `/owner-modules` | OwnerModulesController | GET | None |
| `/owners/:id` | OwnerController | GET | None |
| `/admin/*` | AdminController | DELETE | ⚠️ None (unsafe) |
| `/miniapp` | MiniappController | GET | MiniAppAuthGuard |
| `/miniapp/bots/:id/overview` | OwnerDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/miniapp/bots/:id/view` | OwnerDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/miniapp/bots/:id/customers` | OwnerDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/miniapp/bots/:id/leads` | OwnerDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/miniapp/bots/:id/analytics` | OwnerDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/miniapp/bots/:id/bookings` | BookingDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/miniapp/bots/:id/bookings/calendar` | BookingDashboardController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/bots` | BotController | GET, POST | MiniAppAuthGuard |
| `/bots/:id` | BotController | GET, PATCH, DELETE | MiniAppAuthGuard + BotOwnershipGuard |
| `/bots/:id/customers` | BotController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/bots/:id/overview` | BotController | GET | MiniAppAuthGuard + BotOwnershipGuard |
| `/customer/bot/:botId/slots` | CustomerBookingController | GET | CustomerAuthGuard |
| `/customer/bot/:botId/bookings` | CustomerBookingController | POST | CustomerAuthGuard |
| `/customer/bot/:botId/bookings/:bookingId` | CustomerBookingController | GET | CustomerAuthGuard |

---

## 3. Current Middleware Order

```typescript
// main.ts (current)
1. NestJS API Routes (handled by Express adapter)
2. express.static('/app') with exclusion: /api/*
3. express.static('/customer') with exclusion: /bot/*
4. SPA fallback /app/*path with exclusion: /api/*
5. SPA fallback /customer/*path with exclusion: /bot/*
6. SPA fallback /customer (exact match)
```

---

## 4. Exclusion Hacks (Current)

### In main.ts

```typescript
// /app static middleware
if (req.path.startsWith('/api')) return next();

// /app SPA fallback
if (req.path.startsWith('/api')) return next();

// /customer static middleware
if (/^\/bot\//.test(req.path)) return next();

// /customer SPA fallback
if (req.path.startsWith('/bot/')) return next();
```

**Total exclusion patterns:** 4

---

## 5. Namespace Conflicts

### CRITICAL: Customer API Conflict

**Problem:**
```
/customer/*               → SPA namespace
/customer/bot/:botId/*    → API namespace (CONFLICT!)
```

The `/customer/bot/:botId/*` API lives INSIDE the SPA namespace. This creates:
- SPA fallback must manually exclude `/bot/*`
- Static middleware must manually exclude `/bot/*`
- Future `/customer/*` routes will collide with existing APIs

### MODERATE: Owner API Inconsistency

**Current Owner API namespaces:**
```
/miniapp/dashboard
/miniapp/navigation
/miniapp/me
/miniapp/bots/:id/...
/bots/:id/...
/owners/:id
```

**Problems:**
1. Mixed between `/miniapp/*`, `/bots/*`, `/owners/*`
2. No clear `/api/owner/*` namespace
3. Hard to reason about API surface
4. Future analytics/billing APIs will add more inconsistency

---

## 6. Route Collision Risks

| Scenario | Risk Level | Description |
|----------|-------------|-------------|
| Add `/customer/settings` SPA route | HIGH | Collides with existing `/customer/bot/*` API |
| Add `/customer/profile` SPA route | HIGH | No current collision, but fragile |
| Add `/app/settings` SPA route | MEDIUM | `/app/api/*` excluded, but easy to forget |
| Add new Owner API | MEDIUM | Must choose between `/miniapp/*`, `/bots/*`, `/owners/*` |
| Add analytics API | HIGH | No dedicated namespace |

---

## 7. Current Frontend API Calls

### Owner MiniApp (frontend/owner-miniapp/src/api/client.ts)
```typescript
/miniapp/dashboard
/miniapp/navigation
/miniapp/me
/miniapp/bots/:id/overview
/miniapp/bots/:id/bookings
/miniapp/bots/:id/customers
```

### Customer MiniApp (frontend/customer-miniapp/src/api/client.ts)
```typescript
/customer/bot/:botId/slots        // ⚠️ PROBLEM: inside SPA namespace
/customer/bot/:botId/bookings     // ⚠️ PROBLEM: inside SPA namespace
```

---

## 8. Proposed Migration Map

### Customer APIs (MUST MOVE)
```
FROM: /customer/bot/:botId/*
TO:   /api/customer/bot/:botId/*
```

Affected:
- `GET /customer/bot/:botId/slots` → `GET /api/customer/bot/:botId/slots`
- `POST /customer/bot/:botId/bookings` → `POST /api/customer/bot/:botId/bookings`
- `GET /customer/bot/:botId/bookings/:bookingId` → `GET /api/customer/bot/:botId/bookings/:bookingId`

Frontend changes:
- `frontend/customer-miniapp/src/api/client.ts` - update paths

### Owner APIs (RECOMMENDED TO STANDARDIZE)
```
CURRENT: /miniapp/*, /bots/*, /owners/*
PROPOSED: /api/owner/*
```

Optional future migration (not blocking):
- `/miniapp/dashboard` → `/api/owner/dashboard`
- `/miniapp/bots/:id/overview` → `/api/owner/bots/:id/overview`
- `/bots/:id` → `/api/owner/bots/:id`

---

## 9. After Customer API Migration

### Expected middleware order (SIMPLIFIED)
```typescript
// No exclusions needed!
1. NestJS API Routes
   - /api/customer/bot/*  ✅ (NEW)
   - /miniapp/*           (legacy, but isolated)
   - /webhook/*

2. Static files
   - /app → public/app/
   - /customer → public/customer/
   (NO exclusions needed)

3. SPA fallback
   - /app/*path → index.html
   - /customer/*path → index.html
   (NO exclusions needed)
```

### Exclusion hacks removed:
- `if (req.path.startsWith('/api'))` - REMOVED
- `if (/^\/bot\//.test(req.path))` - REMOVED

---

## 10. Security Verification

**Current security model (unchanged):**
- `/api/customer/*` → uses `CustomerAuthGuard` (child bot token)
- `/miniapp/*` → uses `MiniAppAuthGuard` (platform token)
- `/bots/*` → uses `MiniAppAuthGuard` + `BotOwnershipGuard`

**After migration:**
- Same guards, just different paths
- No security changes required

---

## 11. Summary

| Issue | Current State | Target State |
|-------|---------------|--------------|
| Customer API location | `/customer/bot/*` (SPA namespace) | `/api/customer/bot/*` (API namespace) |
| Owner API location | Mixed `/miniapp/*`, `/bots/*`, `/owners/*` | `/api/owner/*` (future) |
| Exclusion hacks | 4 patterns | 0 patterns (after customer migration) |
| SPA/API collision risk | HIGH | NONE |
| Middleware complexity | High (manual exclusions) | Low (deterministic) |

---

## 12. Next Step (TASK 2)

**API Namespace Migration Plan** — prepare safe migration plan for:
1. Customer APIs: `/customer/bot/*` → `/api/customer/bot/*`
2. Frontend client updates
3. Auth guard path handling
4. Backward compatibility considerations

---

**Audit Complete.** Awaiting approval for TASK 2.
