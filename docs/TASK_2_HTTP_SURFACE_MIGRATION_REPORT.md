# HTTP SURFACE MIGRATION REPORT

**TASK:** 2 — API Namespace Migration  
**Date:** 2026-05-19  
**Status:** ✅ COMPLETE

---

## 1. Routes Migrated

### Customer APIs (MOVED)

| Old Route | New Route | Method | Status |
|-----------|-----------|--------|--------|
| `/customer/bot/:botId/slots` | `/api/customer/bot/:botId/slots` | GET | ✅ Migrated |
| `/customer/bot/:botId/bookings` | `/api/customer/bot/:botId/bookings` | POST | ✅ Migrated |
| `/customer/bot/:botId/bookings/:bookingId` | `/api/customer/bot/:botId/bookings/:bookingId` | GET | ✅ Migrated |

### Files Changed

1. `src/customer-miniapp/controllers/customer-booking.controller.ts`
   - Changed `@Controller('customer/bot/:botId')` → `@Controller('api/customer/bot/:botId')`
   - Updated JSDoc comments

2. `frontend/customer-miniapp/src/api/client.ts`
   - Changed `/customer/bot/` → `/api/customer/bot/`

---

## 2. Frontend Changes

### Before
```typescript
fetchJson(`/customer/bot/${botId}/slots?date=${...}`)
fetchJson(`/customer/bot/${botId}/bookings`, { method: 'POST', ... })
```

### After
```typescript
fetchJson(`/api/customer/bot/${botId}/slots?date=${...}`)
fetchJson(`/api/customer/bot/${botId}/bookings`, { method: 'POST', ... })
```

---

## 3. Middleware Cleanup

### Exclusion Hacks REMOVED

```typescript
// REMOVED:
if (/^\/bot\//.test(req.path)) return next();  // Customer static
if (req.path.startsWith('/bot/')) return next();  // Customer SPA fallback

// STILL EXISTS (legacy - owner APIs not yet migrated):
if (req.path.startsWith('/api')) return next();  // Owner static/spa
```

### Final Middleware Order (DETERMINISTIC)

```typescript
// 1. NestJS API Routes (handled by Express adapter FIRST)
expressApp.use('/api/customer/bot/:botId/*')  // ✅ NEW - Customer APIs
expressApp.use('/miniapp/*')                   // Legacy owner APIs
expressApp.use('/webhook/*')
// ...other NestJS routes

// 2. Static Files
expressApp.use('/app', express.static(...))    // Owner SPA (with /api exclusion)
expressApp.use('/customer', express.static(...))  // Customer SPA (NO exclusion)

// 3. SPA Fallback
expressApp.get('/app/*path', ...)             // Owner SPA fallback
expressApp.get('/customer/*path', ...)        // Customer SPA fallback (NO exclusion)
expressApp.get('/customer', ...)              // Customer entry point
```

### Removed Hacks Summary

| Hack | Location | Status |
|------|----------|--------|
| `if (/^\/bot\//.test(req.path))` | Customer static | ✅ REMOVED |
| `if (req.path.startsWith('/bot/'))` | Customer SPA fallback | ✅ REMOVED |
| `if (req.path.startsWith('/api'))` | Owner static | ⚠️ STILL EXISTS (owner APIs at /miniapp/*) |

---

## 4. Final Route Map

### SPA Routes (HTML/JS/CSS Only)

| Route | Purpose |
|-------|---------|
| `/app` | Owner MiniApp entry |
| `/app/*` | Owner MiniApp React Router |
| `/customer` | Customer MiniApp entry (with ?botId=xxx) |
| `/customer/*` | Customer MiniApp React Router |

### API Routes (JSON Only)

| Route | Controller | Auth |
|-------|------------|------|
| `/api/customer/bot/:botId/slots` | CustomerBookingController | CustomerAuthGuard |
| `/api/customer/bot/:botId/bookings` | CustomerBookingController | CustomerAuthGuard |
| `/api/customer/bot/:botId/bookings/:id` | CustomerBookingController | CustomerAuthGuard |
| `/miniapp/dashboard` | MiniappController | MiniAppAuthGuard |
| `/miniapp/bots/:id/*` | OwnerDashboardController | MiniAppAuthGuard + BotOwnershipGuard |
| `/webhook/:botId/:secret` | WebhookController | Secret-based |
| `/platform-bot/webhook` | PlatformBotController | Telegram |

---

## 5. Collision Risks REMOVED

| Risk | Before | After |
|------|--------|-------|
| Add `/customer/settings` SPA route | HIGH - collides with `/customer/bot/*` | ✅ NONE |
| Add `/customer/profile` SPA route | MEDIUM | ✅ NONE |
| Future booking API expansion | HIGH - must avoid `/customer/*` | ✅ SAFE under `/api/customer/*` |

---

## 6. Remaining Architectural Debt

| Debt | Priority | Notes |
|------|----------|-------|
| Owner APIs at `/miniapp/*` not `/api/owner/*` | Low | Works, but inconsistent |
| Owner static still excludes `/api/*` | Low | Needed because `/miniapp/*` not under `/api/*` |
| 3 hardcoded services in customer app | Low | MVP scope |

---

## 7. Future API Namespace Philosophy

### Reserved Namespaces

| Namespace | Owner | Purpose |
|-----------|-------|---------|
| `/api/customer/*` | Customer-facing | Booking flows, availability, self-service |
| `/api/owner/*` | Owner dashboard | Bots, customers, analytics, settings |
| `/api/runtime/*` | Internal | Webhook processing, runtime operations |
| `/api/booking/*` | Platform | Slot generation, availability computation |
| `/api/analytics/*` | Platform | Analytics aggregation |
| `/api/admin/*` | Platform admin | Platform management, billing |

### Semantics

**`/api/customer/*`** — Customer-facing runtime APIs
- Booking flows
- Availability queries
- Customer self-service
- Uses child bot token for auth

**`/api/owner/*`** — Owner operational APIs
- Dashboard data
- Bot management
- Customer lists
- Analytics
- Uses platform bot token for auth

**`/api/runtime/*`** — Internal runtime operations
- Webhook processing
- Event handling
- Template-specific runtime logic
- No external auth (uses Telegram secret)

**`/api/booking/*`** — Booking engine (future)
- Slot generation
- Availability computation
- Resource allocation
- Cross-bot operations

**`/api/analytics/*`** — Analytics aggregation (future)
- Cross-bot analytics
- Platform-wide metrics
- Reporting

**`/api/admin/*`** — Platform administration (future)
- Billing management
- User management
- Platform configuration

---

## 8. Production Verification Checklist

- [ ] Customer Mini App loads (Service → Date → Slots → Confirm → Success)
- [ ] API `/api/customer/bot/:id/slots` returns JSON (not HTML)
- [ ] API `/api/customer/bot/:id/bookings` creates booking successfully
- [ ] SPA `/customer` serves index.html
- [ ] SPA `/customer/bots/123` serves index.html (React Router)
- [ ] Static `/customer/assets/*` serves JS/CSS
- [ ] No "Unexpected token '<'" errors in booking flow

---

## 9. Summary

| Metric | Before | After |
|--------|--------|-------|
| Customer API location | `/customer/bot/*` (SPA namespace) | `/api/customer/bot/*` (API namespace) |
| Exclusion hacks | 4 patterns | 1 pattern (owner only) |
| SPA/API collision risk | HIGH | NONE |
| Middleware complexity | High | Low (deterministic) |

---

**Migration Complete.** Awaiting approval for next task.

---

## Appendix: Commit History

```
7fb936e docs: TASK 1 - HTTP Surface Audit Report
bba3d1c fix(api-routing): skip API routes in SPA fallback middleware
1fa96a1 fix(customer-vite): add base: '/customer/' to Vite config
50f0a40 fix(customer-spa): add /customer route for query params entry
6ca6440 fix(static): replace ServeStaticModule with Express static middleware
bd53304 fix(cors,logging): add CORS headers, detailed logging for Render debug
95de664 fix(platform-bot): owner dashboard entry via BotGrandFather web_app button
```
