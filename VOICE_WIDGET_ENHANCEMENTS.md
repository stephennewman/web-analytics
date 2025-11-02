# Voice Feedback Widget Enhancements

## 🆕 New Features

### 1. ✅ Show/Hide Toggle Button
- **Small X button** on all widgets to minimize
- **Remembers user preference** via localStorage
- **Mini show button** appears when hidden (small bottom-right icon)
- Works across all widget styles

### 2. ✅ Page Exclusion System
- Configure pages where widget should NOT appear
- Supports:
  - **Exact paths**: `/checkout`, `/login`
  - **Wildcards**: `/admin/*`, `/dashboard/*`
  - **URL contains**: Any substring match
- Configure via Settings → Voice Feedback Widget → Exclude Pages
- Database column: `feedback_excluded_paths` (TEXT, newline-separated)

### 3. ✅ New "Honey-Bee" Widget (Gamified & Highly Engaging)
- 🐝 **Animated bee mascot** with wiggle & bounce effects
- 🍯 **Honey/gold theme** matching Trackerbeez brand
- 🎁 **Gamification elements** (rewards messaging, celebration animations)
- 🎨 **Gradient backgrounds** with yellow/amber/orange
- ✨ **Smooth animations** throughout all states
- 📱 **Mobile-responsive** design

## Widget Styles Available

1. **Glassmorphic Button** - Clean, modern, floating button
2. **Scrolling Ticker** - Bottom banner with feedback quotes
3. **B2B Product Roadmap** - Purple-themed, fast-scrolling
4. **🆕 Honey-Bee (Gamified)** - Fun, animated, bee-themed

## Implementation Details

### Frontend (track.js)
- Added `isHidden` state and localStorage persistence
- Added `shouldExcludeCurrentPage()` URL matching logic
- Added `toggleVisibility()` and `showMinimizedButton()` methods
- Created `getHoneyBeeHTML()` with 6 animated states
- Hide buttons added to all widget styles

### Backend (API)
- Updated `/api/feedback/enabled` to return `excludedPaths` array
- Parses `feedback_excluded_paths` from database (JSON or comma-separated)

### Settings UI
- Added Honey-Bee widget option with preview
- Added "Exclude Pages" textarea with examples
- Auto-saves on blur

### Database
- Migration: `supabase_migration_feedback_excluded_paths.sql`
- Column: `clients.feedback_excluded_paths TEXT`

## Usage Examples

### Exclude checkout pages:
```
/checkout
/cart
/payment/*
```

### Exclude admin areas:
```
/admin/*
/dashboard/settings/*
```

### Mix of patterns:
```
/login
/signup
/checkout
/admin/*
```

## Mobile Optimizations
- Honey-Bee widget scales down on mobile (80px → 65px)
- All widgets maintain touch-friendly tap targets
- Minimized button positioned for easy thumb access

## Animations

### Honey-Bee Widget
- `honeyBounce` - Gentle vertical bounce
- `beeWiggle` - Side-to-side rotation
- `beeFloat` - Floating with rotation
- `recordPulseHoney` - Recording state pulse with glow
- `beeRecording` - Active recording animation
- `beeApprove` - Review state rotation
- `honeySpinner` - Loading spinner
- `beeDeliver` - Horizontal delivery animation
- `beeCelebrate` - Success celebration

## Testing Checklist
- [ ] Test show/hide on all 4 widget styles
- [ ] Verify localStorage persists across page loads
- [ ] Test excluded paths (exact, wildcard, contains)
- [ ] Test Honey-Bee widget on desktop
- [ ] Test Honey-Bee widget on mobile
- [ ] Verify all recording states work
- [ ] Check hide button doesn't trigger expand
- [ ] Test minimized button restores widget

## Files Changed
- ✅ `public/track.js` - Widget logic & HTML
- ✅ `app/api/feedback/enabled/route.ts` - API returns excluded paths
- ✅ `app/dashboard/clients/SetupView.tsx` - Settings UI
- ✅ `supabase_migration_feedback_excluded_paths.sql` - Database migration

## Next Steps (Future)
- Add widget preview in settings (live demo)
- Track widget hide/show analytics
- A/B test different widget styles
- Add more gamification (points, badges, leaderboard)


