# MasterAgent - Trackerbee 🐝

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

### 2025-10-03 - UI Redesign: Session Feed ✅
**Complete dashboard redesign:**
- Twitter-style feed: Each session = 1 card with all metrics
- Real-time sorting (recent, time spent, pageviews)
- Smart filters: All, Converted, High Intent, Frustrated, Errors
- Session cards show: pages, clicks, time, scroll, phone/email intent, frustration signals
- Color-coded borders (green=converted, purple=intent, red=frustrated)
- Auto-updates as new sessions come in (newest at top)

### 2025-10-03 - Phase 3 Complete ✅
**Task 3.1:** Auto-track clicks (data-track attribute)
**Task 3.2:** Auto-track forms (starts & submissions)
**Task 3.3:** Conversion tracking (webAnalytics.conversion())
**Task 3.4:** Enhanced auto-tracking (zero setup):
- Scroll depth (25%, 50%, 75%, 100%)
- Time on page (tracked per page navigation)
- Rage clicks (3+ clicks in 1 second - frustration indicator)
- Dead clicks (clicks on non-interactive elements - UX issues)
- Device data (screen size, viewport, device type)
- Referrer tracking (traffic source)
- UTM parameter capture (campaign tracking)
- Exit intent (time spent + scroll depth on exit)
- **Dashboard shows:** All metrics + frustration alerts
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

### 2025-10-03 - Production Deploy #1 ✅
- **URL:** https://web-analytics-axpyz75vi-krezzo.vercel.app
- **Platform:** Vercel
- **Features:** Phases 1-3 complete (tracking, auth, conversion analytics)
- **Status:** Live and functional

### 2025-10-03 - Production Deploy #2 ✅
- **Advanced Tracking:** Performance metrics, JS errors, conversion intent signals
- **Features Added:**
  - Page load time, DOM ready, first paint
  - JavaScript error tracking
  - Phone/email/download click detection
  - Form field timing & keystroke analysis
  - Copy event tracking (valuable content)
  - Idle & tab visibility detection
  - Orientation change tracking
  - Text selection filtering
- **Dashboard Enhancements:**
  - ✅ Conversion intent alerts (phone, email, downloads)
  - ⚠️ Performance warnings (slow loads, JS errors)
  - All new event types color-coded

### 2025-10-04 - Dashboard Redesign: Modern SaaS UI ✅
**Major UI/UX overhaul inspired by Hotjar/FullStory:**
- **Two-panel layout:** 
  - Left sidebar (15-20%): Logo, navigation (Dashboard/Live/Visitors/Insights), user profile
  - Main area (80-85%): Scrollable content with sticky header
- **Sticky header:** View title (Dashboard/Live/Visitors/Insights)
- **Working navigation system:**
  - Dashboard: Quick stats bar (5 metrics) + AI insights overview
  - Live: Real-time visitors (5min window) with current page, location, device
  - Visitors: Full session feed with filters/sort, clickable for details
  - Insights: Analytics widgets (navigation flow, scroll, exits, time-of-day, device intel)
- **Modern card-based sections:**
  - AI Insights: Stacked cards with icon badges and actionable tips
  - Winning Formula: Conversion-driving pages analysis
  - Navigation Flow: Visual path visualization
  - Device & Location Intel: Performance by device/location
  - Time-of-Day Patterns: Hourly heatmap + day/night breakdown
  - Scroll Engagement: Reader/Scanner/Bouncer patterns
  - Exit Page Analysis: Bounce rate and scroll depth per page
- **Session detail slide-over panel:** Right-side overlay showing full session details, journey path, click activity, engagement metrics, debug data
- **Design system:** Clean whites/grays, purple accent, subtle borders, consistent padding, rounded cards, hover states
- **Mobile responsive:** Grid layouts adapt to single-column on mobile, tap targets 44px+, readable fonts
- **Bug fixes:** RLS policy for tracking script, all cursor pointers added, empty states for all widgets
- **Build successful:** 11 routes compiled, 125 kB shared JS

### 2025-10-04 - Production Deploy #3 ✅
**Commit:** `0fba135` - Modern dashboard redesign
**Changes:** 18 files changed, 1074 insertions(+), 421 deletions(-)
**New files:**
- `ClientWrapper.tsx` - View state management
- `Sidebar.tsx` - Navigation component
- `SessionDetailPanel.tsx` - Session detail slide-over
- `AUTH_DEBUG.md`, `DEBUG_INSTRUCTIONS.md` - Debug documentation
**Features:**
- ✅ 4-view navigation system (Dashboard/Live/Visitors/Insights)
- ✅ Live visitor tracking with real-time updates
- ✅ Session detail panels with full journey data
- ✅ Modern card-based UI with clean design
- ✅ Mobile responsive layouts
- ✅ Fixed RLS policy for anonymous tracking
**Deploy method:** Git push to main → Vercel auto-deploy
**Status:** Live

### 2025-10-04 - Production Deploy #4 ✅
**Commit:** `40319ef` - Daily digest email feature
**URL:** https://web-analytics-8sgst7lmz-krezzo.vercel.app
**Changes:** 7 files changed, 739 insertions(+)
**New packages:** `resend`, `@react-email/render`
**New files:**
- `/api/send-digest/route.ts` - Manual test email endpoint
- `/api/cron/daily-digest/route.ts` - Automated 8am daily cron
- `vercel.json` - Cron job configuration
**Features:**
- ✅ "Send Test Email" button in dashboard header
- ✅ Beautiful HTML email template with metrics
- ✅ Yesterday's data: sessions, conversions, avg time, high-intent signals
- ✅ Alerts: conversion signals (phone/email/forms) + frustration signals (rage clicks/errors)
- ✅ Top 5 pages visited with view counts
- ✅ Email sender: stephen@krezzo.com
- ✅ Vercel Cron: runs daily at 8am UTC
**Env vars added:**
- ✅ `RESEND_API_KEY` (production)
- ✅ `CRON_SECRET` (production)
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` - **TODO: Add for cron job to work**
**Deploy method:** Git push → Vercel auto-deploy
**Status:** Live

### 2025-10-04 - Multi-Site Support ✅
**Commit:** Multi-site tracking implementation
**Changes:** 4 files changed, 150+ insertions
**New files:**
- `AddSiteForm.tsx` - Modal form for adding new sites
- `/api/clients/route.ts` - API endpoint for site management
**Features:**
- ✅ Site switcher dropdown in dashboard header (shows when 2+ sites)
- ✅ "Add Site" button with modal form (name + domain)
- ✅ URL-based site switching (`?site=client-id`)
- ✅ Each site gets unique tracking script with different `client_id`
- ✅ Data separation: sessions/events filtered by `client_id`
- ✅ Same dashboard, different data per site
- ✅ One login, multiple sites
**Database:** Uses existing `clients` table (1 user → many clients)
**Build:** ✅ Successful (14 routes compiled)
**Deploy:** ✅ Live at https://web-analytics-l1oy27yu5-krezzo.vercel.app
**Status:** Production ready

### 2025-10-04 - Macro ALL View ✅
**Commit:** `2066c3a` - Add macro ALL view for aggregated multi-site data
**Changes:** 5 files changed, 117 insertions(+), 44 deletions(-)
**Features:**
- ✅ **"🌐 All Sites" option** in site switcher dropdown
- ✅ **Aggregated data** from all user's sites in one view
- ✅ **Site labels** on session cards showing which site each session belongs to
- ✅ **URL parameter** `?site=all` for direct access to ALL view
- ✅ **Smart empty state** - different message for ALL view vs single site
- ✅ **Complete data separation** - sessions/events filtered by all client IDs
- ✅ **Same dashboard experience** - all insights work with aggregated data
**Use cases:**
- Agency overview across all client sites
- Portfolio performance analysis
- Cross-site conversion patterns
- Unified reporting dashboard
**Build:** ✅ Successful (14 routes compiled, 39s build time)

### 2025-10-08 - Major Feature Update ✅
**Commit:** `da41dd2` - Add site renaming, URL filtering, real-time visitor count, and visitors table
**Changes:** 21 files changed, 2344 insertions(+), 71 deletions(-)
**New Features:**
- ✅ **Site Renaming** - Inline edit modal with gear icon next to site switcher
- ✅ **URL Filtering** - Smart defaults + custom patterns to filter out localhost/test traffic
- ✅ **Real-time Visitor Count** - Live visitor count in sidebar with (0) indicator
- ✅ **Visitors Table** - Sortable table view replacing card-based visitors
- ✅ **IP Address Column** - Extract and display IP addresses from geo data
- ✅ **Referrer Column** - Show traffic sources with smart styling for direct vs external
- ✅ **View Persistence** - Maintain current view when switching between sites
- ✅ **UI Cleanup** - Removed send email button, improved sidebar indicators
**Database Changes:**
- ✅ Added `url_filters` JSONB column to clients table
- ✅ Smart defaults: localhost, 127.0.0.1, test., staging., dev.
**API Endpoints:**
- ✅ `PATCH /api/clients/[id]` - Update site name, domain, and filters
- ✅ `GET /api/live-visitors` - Real-time visitor count polling
**Build:** ✅ Successful (22 routes compiled, 45s build time)
**Deploy:** ✅ Live at https://web-analytics-ndt74zdhi-krezzo.vercel.app
**Status:** Production ready
**Deploy:** ✅ Live at https://web-analytics-l1oy27yu5-krezzo.vercel.app

### 2025-10-09 - Production Deploy #5 ✅
**Commit:** `4b079f3` - Update live visitors API and visitors table UI improvements
**URL:** https://web-analytics-kwrzgk2i7-krezzo.vercel.app
**Changes:** 3 files changed, 1016 insertions(+), 124 deletions(-)
**Modified files:**
- `MasterAgent.md` - Documentation update
- `app/api/live-visitors/route.ts` - Live visitor tracking improvements
- `app/dashboard/clients/VisitorsTable.tsx` - UI enhancements
**Build:** ✅ Successful (22 routes compiled, 40s build time)
**Status:** Live and ready

### 2025-10-09 - Production Deploy #6 ✅
**Commit:** `cd632a1` - Add column resizing to visitors table
**URL:** https://web-analytics-4tpxf13yv-krezzo.vercel.app
**Changes:** 1 file changed, 119 insertions(+), 14 deletions(-)
**Features:**
- ✅ Resizable table columns with drag handles
- ✅ All 11 columns (Time, Device, Location, IP, Referrer, Landing Page, Pages, Clicks, Time Spent, Status, Actions)
- ✅ Visual resize handles on right edge of each column header
- ✅ Smooth drag-to-resize with mouse
- ✅ Minimum width constraint (60px) prevents columns from becoming too narrow
- ✅ Column widths persist during session
- ✅ Purple hover state on resize handles
**Build:** ✅ Successful (22 routes compiled, 40s build time)
**Status:** Live and ready

### 2025-10-09 - Production Deploy #7 - Rebrand to Catlicks 🐱 ✅
**Commit:** `a4484f7` - Rebrand to Catlicks
**URL:** https://web-analytics-h2nygvs2u-krezzo.vercel.app
**Changes:** 5 files changed, 70 insertions(+), 26 deletions(-)
**Branding updates:**
- ✅ Product name: Catlicks
- ✅ Sidebar logo updated
- ✅ Page title: "Catlicks - Conversion Analytics"
- ✅ Meta description updated
- ✅ Package.json renamed
- ✅ README.md rewritten with full product overview
- ✅ MasterAgent.md updated
**Tagline:** "See why visitors don't convert and what to fix"
**Build:** ✅ Successful (22 routes compiled, 39s build time)
**Status:** Superseded by Deploy #8

### 2025-10-09 - Production Deploy #8 - Trackerbee 🐝 with Bee Theme ✅
**Commit:** `fcb6e59` - Rebrand to Trackerbee with bee theme (black & yellow)
**URL:** https://web-analytics-5r6ztlpdb-krezzo.vercel.app
**Changes:** 6 files changed, 95 insertions(+), 84 deletions(-)
**Complete rebrand:**
- 🐝 Product name: **Trackerbee**
- 🎨 **Bee theme** - Black & yellow color scheme
- ✅ Sidebar: Bee emoji + yellow/amber gradient logo
- ✅ Navigation: Yellow-50 backgrounds with yellow-900 text on active states
- ✅ User avatar: Yellow-400 to amber-500 gradient with black text
- ✅ Table colors: All purple replaced with yellow (focus rings, text, hovers, resize handles)
- ✅ Page title: "Trackerbee 🐝 - Conversion Analytics"
- ✅ Meta description: "Buzz through your conversion problems"
- ✅ README: Full bee theme documentation with design system
- ✅ Build system: Removed turbopack flag (fixes build errors)
**Design system:**
- Primary: Yellow-500 (#EAB308) & Amber-600 (#F59E0B)
- Accent: Black (#000000)
- Active states: Yellow-50 bg + Yellow-900 text + Yellow-200 border
**Build:** ✅ Successful (22 routes compiled, 48s build time)
**Status:** Live and ready

### 2025-10-09 - Production Deploy #9 - Bee Theme for Auth Pages ✅
**Commit:** `e18b159` - Apply bee theme to login & signup pages
**URL:** https://web-analytics-ob5cehgjf-krezzo.vercel.app
**Changes:** 2 files changed, 29 insertions(+), 17 deletions(-)
**Auth page updates:**
- 🐝 Login page: Full bee theme with logo, tagline, and yellow/amber colors
- 🐝 Signup page: Matching bee theme with consistent branding
- ✅ Background: Gradient from yellow-50 via white to amber-50
- ✅ Logo: Bee emoji + "Trackerbee" in yellow/amber gradient (text-4xl)
- ✅ Tagline: "Buzz through your conversion problems" (login) / "Start tracking conversions today" (signup)
- ✅ Form inputs: Yellow-500 focus rings and borders
- ✅ Submit buttons: Yellow-400 to amber-500 gradient with black text
- ✅ Links: Yellow-600 text with amber-600 hover
- ✅ Consistent styling across both pages
**Build:** ✅ Successful (22 routes compiled, 40s build time)
**Status:** Live and ready - Complete brand consistency across all pages

### 2025-10-30 - Settings Page Tracking Script Access ✅
**Changes:** 1 file changed, 28 insertions(+), 6 deletions(-)
**Modified files:**
- `app/dashboard/clients/SetupView.tsx` - Enhanced settings view with tracking script display
**Features:**
- ✅ Tracking script display in Settings view
- ✅ Copy button with bee theme styling (yellow-400 to amber-500 gradient)
- ✅ Installation instructions with yellow-themed tip box
- ✅ Each site's unique client_id embedded in script
- ✅ Hidden for "All Sites" view (only shows for individual sites)
- ✅ Slack settings maintained below tracking script section
**Script format:** `<script src="/track.js?id=CLIENT_ID"></script>`
**Build:** ✅ Successful (22 routes compiled, 6.6s compile time)
**Status:** Ready for deploy

### 2025-10-31 - Design System Implementation: Tremor + shadcn/ui ✅
**Phase 1 Commit:** `697a537` - Migrate AllSitesDashboard to Tremor
**Phase 2 Commit:** `f5d4c0a` - Migrate single-site dashboard and roadmap buttons
**Total Changes:** 3 files changed, 68 insertions(+), 72 deletions(-)
**Modified files:**
- `app/dashboard/clients/AllSitesDashboard.tsx` - Full Tremor migration
- `app/dashboard/clients/SetupView.tsx` - Stat cards to Tremor
- `app/dashboard/clients/RoadmapView.tsx` - Action buttons to design system
- `lib/design-system.ts` - NEW: 3-level boldness system
- `components/ui/button.tsx` - NEW: shadcn button component
- `components/ui/card.tsx` - NEW: shadcn card component
- `components/ui/badge.tsx` - NEW: shadcn badge component
**Design System Features:**
- ✅ Tremor components for analytics (Metric, Card, ProgressBar, BarList)
- ✅ shadcn/ui components for general UI (Button, Card, Badge)
- ✅ 3 boldness levels (1=Professional, 2=Balanced, 3=Bold/Neobrutalism)
- ✅ Helper functions: getCardClass(), getButtonClass(), getBadgeClass()
- ✅ Single-line boldness toggle (change 1 number in config)
**Visual Changes:**
- Portfolio dashboard: All cards, metrics, and progress bars use Tremor
- Single-site dashboard: Stat cards upgraded to Tremor Metrics with colored top decorations
- Roadmap: Primary action buttons standardized
- Consistent spacing, typography, and shadows throughout
**Bundle Impact:**
- Dashboard: 25.9 kB → 46.2 kB (+20.3 kB for Tremor + shadcn)
- Trade-off: Larger bundle for professional, consistent UI
**Configuration:**
- Boldness level: 1 (Professional - thin borders, subtle shadows, muted colors)
- Can ramp up to 2 (Balanced) or 3 (Bold/Neobrutalism) in seconds
**Build:** ✅ Successful (31 routes compiled, 5.6s compile time)
**Documentation:** DESIGN_SYSTEM.md created with full usage guide
**Status:** Phase 1 & 2 Complete - Core dashboards migrated

### 2025-11-01 - Production Deploy #10 - Trello-Style Drag & Drop ✅
**Commit:** `c215cc6` - Upgrade drag-and-drop to Trello-style with live preview and custom positioning
**Changes:** 7 files changed, 630 insertions(+), 198 deletions(-)
**New packages:** `@hello-pangea/dnd` (v16+)
**New files:**
- `app/api/tickets/reorder/route.ts` - Batch position updates endpoint
- `supabase_migration_custom_positions.sql` - Database migration for custom positioning
- `DRAG_DROP_UPGRADE.md` - Full implementation documentation
**Modified files:**
- `app/dashboard/clients/RoadmapView.tsx` - Complete drag-and-drop overhaul
- `app/api/tickets/[id]/route.ts` - Support for custom_position fields
- `package.json` & `package-lock.json` - New dependency
**Features:**
- ✅ Live visual preview while dragging (cards move before release)
- ✅ Smooth Trello-like drag experience
- ✅ Cards drop exactly where dragged (no jumping)
- ✅ Hybrid sorting: AI scores + manual positioning
- ✅ Drag between columns (status change + position)
- ✅ Drag within column (reorder)
- ✅ Position persistence to database
- ✅ Entire card is draggable (cursor-move on hover)
- ✅ Clean UI (no drag handles or pin icons)
- ✅ Mobile touch support built-in
- ✅ Reset Order button to return to AI sorting
**Database Changes:**
- ⚠️ **MIGRATION REQUIRED:** Add `custom_position` and `position_override` columns to `tickets` table
- See `supabase_migration_custom_positions.sql` for SQL
**API Endpoints:**
- `POST /api/tickets/reorder` - Batch update positions
- `DELETE /api/tickets/reorder` - Clear custom positions
- `PATCH /api/tickets/[id]` - Now accepts position fields
**Build:** ✅ Successful (32 routes compiled, 178 kB shared JS)
**Deploy Method:** Git push → Vercel auto-deploy
**Status:** 🚀 Deployed - Migration pending

