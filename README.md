# 🐝 Trackerbee

**Buzz through your conversion problems.**

Trackerbee shows you why visitors don't convert and what to fix—not just what happened.

## What Makes Trackerbee Different

- **Conversion killers only** - Focus on what stops conversions, not vanity metrics
- **Actionable insights** - Get AI-suggested fixes, not arbitrary data
- **Multi-site tracking** - Manage multiple client sites from one dashboard
- **Real-time monitoring** - See live visitors and track behavior as it happens
- **Frustration detection** - Rage clicks, dead clicks, JS errors, and exit intent

## Features

✅ Embeddable tracking script (<3KB)  
✅ Session replay with full journey paths  
✅ Click & form tracking (auto-detected)  
✅ Conversion intent signals (phone, email, downloads)  
✅ Device & location intelligence  
✅ Time-of-day heatmaps  
✅ Exit page analysis  
✅ Scroll engagement patterns  
✅ Multi-site management  
✅ Resizable data tables with advanced filtering

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Add Tracking Script to Your Site

```html
<script src="https://your-domain.vercel.app/track.js"></script>
<script>
  webAnalytics.init('YOUR_CLIENT_ID');
</script>
```

## Design System

🐝 **Bee Theme:**
- Primary: Yellow (#EAB308) & Amber (#F59E0B)
- Accent: Black (#000000)
- Neutral: Gray scales
- Active states: Yellow-50 background with yellow-900 text

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Supabase (Postgres + Auth)
- **Hosting:** Vercel
- **Tracking:** Vanilla JavaScript

## Deployment

```bash
npm run build
git push origin main  # Auto-deploys to Vercel
```

## License

Proprietary - All rights reserved
