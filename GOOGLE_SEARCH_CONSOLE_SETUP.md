# Google Search Console Integration Setup

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project:**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name it "Trackerbee" (or your app name)
   - Click "Create"

3. **Enable Google Search Console API:**
   - In the search bar, type "Search Console API"
   - Click "Google Search Console API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" > "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External
     - App name: Trackerbee
     - User support email: your email
     - Developer contact: your email
     - Add scope: `https://www.googleapis.com/auth/webmasters.readonly`
     - Add test users: your email
     - Click "Save and Continue"
   
   - Create OAuth Client ID:
     - Application type: Web application
     - Name: Trackerbee Web Client
     - Authorized JavaScript origins:
       - `http://localhost:3000` (for local development)
       - `https://your-production-domain.com` (for production)
     - Authorized redirect URIs:
       - `http://localhost:3000/api/gsc/callback` (for local)
       - `https://your-production-domain.com/api/gsc/callback` (for production)
     - Click "Create"

5. **Copy Your Credentials:**
   - You'll see a popup with your Client ID and Client Secret
   - **COPY THESE NOW** - you'll need them for .env.local

---

## Step 2: Add to .env.local

Add these lines to your `.env.local` file:

```bash
# Google Search Console OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL in production
```

---

## Step 3: Run Database Migration

Run the migration to add GSC fields to your database:

```bash
# Using Supabase CLI
supabase db execute -f supabase_migration_google_search_console.sql

# Or using MCP (if you have it set up)
@supabase apply_migration --name google_search_console --query "$(cat supabase_migration_google_search_console.sql)"
```

---

## Step 4: Restart Your Dev Server

```bash
npm run dev
```

---

## Step 5: Test the Integration

1. Go to your dashboard: `http://localhost:3000/dashboard/clients`
2. Select a site
3. Go to Settings tab
4. Find "Google Search Console" section
5. Click "Connect Google Search Console"
6. Authorize the app with Google
7. You should be redirected back with a success message!

---

## Step 6: Verify GSC Site Ownership

**Important:** The domain/site you're tracking must be verified in Google Search Console first!

1. Go to https://search.google.com/search-console
2. Add your property (domain or URL prefix)
3. Verify ownership (DNS, HTML file, or tag)
4. Once verified, Trackerbee can access the data

---

## Troubleshooting

### "Google OAuth not configured" error
- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env.local`
- Restart your dev server after adding them

### "Failed to exchange code for tokens"
- Check that your redirect URI in Google Cloud Console matches exactly
- Make sure `NEXT_PUBLIC_APP_URL` is set correctly

### "GSC API error: 403"
- The site must be verified in Google Search Console first
- Make sure the Google account you're authorizing with has access to the property

### "Failed to refresh token"
- The refresh token might be invalid
- Disconnect and reconnect Google Search Console

---

## Production Deployment

When deploying to production (Vercel):

1. **Add environment variables in Vercel:**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (your production domain)

2. **Update Google Cloud Console redirect URIs:**
   - Add your production callback URL
   - Example: `https://trackerbee.vercel.app/api/gsc/callback`

3. **Publish OAuth App:**
   - In Google Cloud Console > OAuth consent screen
   - Change from "Testing" to "In Production"
   - Submit for verification (if needed for public use)

---

## What Data Gets Synced

When you click "Sync Data", Trackerbee fetches:
- **Last 30 days** of search performance data
- **Search queries** that led to your site
- **Impressions** (how many times your site showed in search)
- **Clicks** (how many times users clicked)
- **CTR** (Click-Through Rate)
- **Average Position** in search results
- **Device breakdown** (mobile, desktop, tablet)
- **Page-level data** (which pages get traffic)

This data will be displayed in a new "SEO Performance" tab (coming next!).

---

## Next Steps

After connecting, you can:
- View search queries in the dashboard
- Track ranking changes over time
- Identify low-hanging fruit (high impressions, low CTR)
- Compare organic vs direct traffic
- See which pages drive the most search traffic

---

Need help? Check the Google Search Console API documentation:
https://developers.google.com/webmaster-tools/search-console-api-original/v3/

