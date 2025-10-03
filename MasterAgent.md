# MasterAgent - Web Analytics Platform

**Current Date/Time:** Friday, October 3, 2025

## Project Purpose
Build a conversion-focused analytics platform for marketers. Embeddable JavaScript tracks visitor behavior across client websites. Dashboard shows why visitors don't convert and what to fix (not just what happened).

## Goals
1. Enable multi-client tracking via embeddable script
2. Identify conversion blockers (exit points, form abandonment, bounce)
3. Provide actionable insights (not arbitrary metrics)
4. Scale to agency model (manage multiple client sites)

## Success Criteria
- Client embeds script → sees data in 60 seconds
- Dashboard highlights top 3 conversion problems automatically
- Non-technical marketers can interpret insights
- Session replay shows failed conversions

## Core Differentiator
Unlike Hotjar/FullStory: focus on conversion killers only, AI-suggested fixes, value-based insights over vanity metrics.

---

## Build Plan (7 Phases)
1. **Core Infrastructure** - Supabase DB, API endpoint, tracking script
2. **Dashboard Auth** - Supabase Auth, client management
3. **Conversion Tracking** - Clicks, forms, conversion events
4. **Funnel Analysis** - Define funnels, visualize drop-offs
5. **Problem Detection** - Exit tracking, bounce alerts, abandonment
6. **Session Replay** - rrweb recording + player
7. **Multi-Tenant** - RLS, usage limits, Stripe billing

---

## Status Log

### 2025-10-03 - Project Initialization
- Cleared Next.js boilerplate to clean slate
- Created MasterAgent.md
- Finalized 7-phase build plan

### 2025-10-03 - Phase 1 Complete ✅
**Task 1.1:** Supabase project created, schema deployed
**Task 1.2:** API endpoint `/api/track` working with CORS
**Task 1.3:** Tracking script captures pageviews successfully
- **TEST RESULT:** Pageview tracked from test.html → verified in DB

### 2025-10-03 - Phase 2 Complete ✅
**Task 2.1:** Auth (signup/login) with auto-redirect
**Task 2.2:** Single-site tracking (1 user = 1 tracking script)
**Task 2.3:** Analytics dashboard showing pageviews, sessions, recent events
- **MODEL:** Self-service (not agency) - users track their own site

### 2025-10-03 - Phase 3 Complete ✅
**Task 3.1:** Auto-track clicks (data-track attribute)
**Task 3.2:** Auto-track forms (starts & submissions)
**Task 3.3:** Conversion tracking (webAnalytics.conversion())
- **Dashboard shows:** Pageviews, clicks, form starts/submits, conversions, conversion rate
- **NEXT:** Phase 4 - Funnels or Phase 6 - Session Replay

---

## Technical Stack
- **Frontend:** Next.js 15 + Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Supabase (Postgres + Auth + Storage)
- **Tracking:** Vanilla JS (<3KB)
- **Session Replay:** rrweb + rrweb-player
- **Billing:** Stripe (future)
- **Hosting:** Vercel

---

## Deployment History
_None yet_


