# Frontend Branching Debt — Documented

**Status:** KNOWN, DOCUMENTED, TOLERATED  
**Date:** Stabilization Sprint  
**Priority:** P1 — Deferred until backend provides generic metadata-driven operational endpoints

## Current State

The frontend (`frontend/owner-miniapp/`) contains template-specific branching in:

- `CapabilityPage.tsx` — switch/case on template type for rendering
- `BotOverviewPage.tsx` — switch/case on template type for widgets and actions
- `api/client.ts` — `CAPABILITY_MAP` bridges navigation IDs to template keys

## Why This Exists

The backend does NOT yet provide generic metadata-driven operational endpoints.

Current operational data flow:
```
OwnerModuleRegistry → metadata (navigation, sections)
DashboardCapabilityRegistry → template-specific query services
DashboardService → aggregates via registry
```

The frontend receives:
- Navigation metadata (generic)
- Template-specific API responses (NOT generic)

Without a generic operational data contract, the frontend MUST branch on template type.

## Why NOT Fix Now

Per sprint constraints:
- NO new abstractions
- NO generic renderer
- NO schema renderer
- NO dynamic UI framework
- NO capability renderer

Fixing frontend branching requires:
1. Generic operational data endpoint (backend)
2. Generic item schema (backend)
3. Generic action schema (backend)
4. Generic renderer (frontend)

This IS the correct long-term architecture, but it is FUTURE architecture.
Building it now would violate the stabilization sprint's core rule:
> DO NOT BUILD NEW ARCHITECTURE.

## When This Will Be Fixed

**Trigger:** Backend provides generic metadata-driven operational endpoints.

**Prerequisites:**
- `OwnerModuleRegistry` exposes operational data contracts per template
- `DashboardCapabilityRegistry` exposes generic item serialization
- Backend endpoint: `GET /miniapp/bots/:botId/operational/:section`
- Response shape is template-agnostic (items, actions, filters, sorts)

**Estimated Timeline:** After Booking Phase 5 (Hardening), during operational layer evolution.

## What Is Tolerated

Current branching is EXPLICIT and ISOLATED:
- `CapabilityPage.tsx` — one switch/case for rendering
- `BotOverviewPage.tsx` — one switch/case for widgets
- `api/client.ts` — one map for endpoint routing

This is NOT accidental complexity. It is DOCUMENTED transitional debt.

## What Is Forbidden

- NO adding more template-specific pages (use CapabilityPage pattern)
- NO adding template-specific controllers (use generic endpoints)
- NO hiding branching behind "generic" abstractions that aren't actually generic
- NO pretending the frontend is metadata-driven when it isn't

## Verification

Frontend branching is contained to exactly 3 locations:
1. `frontend/owner-miniapp/src/pages/CapabilityPage.tsx`
2. `frontend/owner-miniapp/src/pages/BotOverviewPage.tsx`
3. `frontend/owner-miniapp/src/api/client.ts`

Any new template-specific branching must be added to this list with justification.

## Success Criteria (Future)

When fixed:
- [ ] `CapabilityPage.tsx` has NO switch/case on template type
- [ ] `BotOverviewPage.tsx` has NO switch/case on template type
- [ ] `api/client.ts` has NO `CAPABILITY_MAP`
- [ ] All operational data comes through generic endpoint
- [ ] Frontend renders from metadata + generic contracts ONLY

---
**Document Owner:** Architecture Stabilization Sprint  
**Review Cycle:** After each new template addition
