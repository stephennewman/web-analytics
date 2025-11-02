# 🎬 Session Recording - Setup & Usage

## ✅ What Was Built

Full session recording implementation using rrweb:

### 1. Database Schema (`supabase_migration_session_recordings.sql`)
- New `session_recordings` table
- Auto-delete after 30 days
- Privacy controls (masking, consent)
- RLS policies

### 2. Client-Side Recording (`public/track.js`)
- rrweb integration (auto-loaded from CDN)
- Privacy-first configuration:
  - Auto-masks passwords, emails, phone numbers
  - `data-sensitive` class for custom masking
  - `rr-block` class to hide elements completely
- Batch uploads every 5 seconds
- Max 50 events per batch

### 3. API Endpoint (`/api/sessions/record`)
- POST: Receive and store recordings
- GET: List recordings for a client
- Merges events for same session

### 4. Dashboard View (`SessionsView.tsx`)
- List all recordings
- Filter by rage clicks, errors
- Replay player (rrweb-player)
- Privacy notice displayed

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
# Connect to Supabase
npx supabase db push --file supabase_migration_session_recordings.sql
```

Or manually run the SQL in Supabase SQL Editor.

### Step 2: Deploy to Production

```bash
npm run build
git add .
git commit -m "feat: add session recording"
git push
```

Vercel will auto-deploy.

### Step 3: Test on Your Site

1. Open your site with the tracking script
2. Browse around, click, scroll
3. Go to Dashboard → Sessions tab
4. Click "Watch Replay" to see the recording

---

## 🔒 Privacy Controls

### Auto-Masked by Default:
- ✅ Password fields
- ✅ Email fields
- ✅ Phone number fields

### Custom Masking:
```html
<!-- Hide specific text -->
<div data-sensitive>Sensitive info here</div>

<!-- Completely block element from recording -->
<div class="rr-block">Credit card form</div>

<!-- Ignore element (no events recorded) -->
<button class="rr-ignore">Don't track this</button>
```

### Skip Sensitive Pages:
To disable recording on specific pages, add to `track.js`:

```javascript
// After line 765, before startRecording()
const sensitivePages = ['/checkout', '/payment', '/admin'];
if (sensitivePages.some(p => window.location.pathname.includes(p))) {
  return; // Skip recording
}
```

---

## 📊 Storage & Retention

- **Storage:** ~500KB per 5-min session (compressed JSONB)
- **Auto-delete:** 30 days (configurable in migration)
- **Cost estimate:** 100 sessions/day = ~450MB/month (within Supabase free tier)

### Manual Cleanup (if needed):
```sql
-- Delete old recordings manually
DELETE FROM session_recordings 
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## 🎥 Replay Features

- ⏯️ **Play/Pause** - Control playback
- **Speed controls** - 1x, 2x, 4x
- **Timeline scrubbing** - Jump to any point
- **Auto-pause on errors** - Catches issues
- **Responsive preview** - See mobile sessions

---

## 🔧 Troubleshooting

### Recording Not Showing Up?
1. Check browser console for errors
2. Verify Supabase credentials in `.env.local`
3. Check table exists: `SELECT * FROM session_recordings LIMIT 1;`

### Player Not Loading?
- rrweb-player loads from CDN (requires internet)
- Check browser console for 404s

### Too Many Recordings?
Adjust batch frequency in `track.js`:
```javascript
// Line 810: Change from 5 seconds to 10
this.batchTimer = setInterval(function() {
  if (sessionRecorder.events.length > 0) {
    sessionRecorder.sendBatch();
  }
}, 10000); // 10 seconds
```

---

## 📈 Next Steps

1. **Enable on test site first** before production
2. **Monitor storage usage** in Supabase dashboard
3. **Add alerts** for rage clicks (Slack integration)
4. **Export replays** for bug reports

---

## 🛑 Opt-Out (GDPR Compliance)

To allow users to opt-out of recording:

```javascript
// Add to your privacy settings page
localStorage.setItem('trackerbee_no_recording', 'true');

// In track.js, check before starting:
if (localStorage.getItem('trackerbee_no_recording') === 'true') {
  return; // Skip recording
}
```

---

**Built with rrweb** - The industry standard for session replay 🎬

