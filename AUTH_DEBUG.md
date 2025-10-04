# Authentication & Tracking Debug Guide

## Step 1: Verify You're Logged In

1. Go to: `http://localhost:3000/dashboard/clients`
2. If you see a login page → **You're not logged in**
3. If you see the dashboard → **You're logged in**

Your current user from console logs:
- **User ID:** `5ca41f4e-7dc0-482d-8520-9ffa4225f53f`
- **Client ID:** `21ab0e04-d89e-450a-b5d4-ffd6330dcaeb`

## Step 2: Test Tracking (IMPORTANT!)

### ❌ DON'T use file:// URLs
Opening `test-tracking.html` directly causes CORS errors.

### ✅ USE this URL instead:
```
http://localhost:8001/test-tracking.html
```

I just started a local server for you on port 8001.

## Step 3: Generate Test Data

1. **Open:** `http://localhost:8001/test-tracking.html`
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Look for:**
   ```
   Client ID: 21ab0e04-d89e-450a-b5d4-ffd6330dcaeb
   Tracking: {clientId: "21ab...", event: "pageview", ...}
   ```
4. **Click buttons** and **scroll down**
5. **Check for errors** in console

## Step 4: Verify Data Arrived

After interacting with the test page, refresh:
```
http://localhost:3000/dashboard/clients
```

You should see:
- Session count increase
- Event data appear
- Charts populate

## Common Issues

### Issue: "CORS error" in console
**Fix:** Use `http://localhost:8001/test-tracking.html` not `file://`

### Issue: "401 Unauthorized" in network tab
**Fix:** Your dashboard session expired, log out and back in

### Issue: Still no data
1. Check browser console for errors
2. Check Network tab for failed POST to `/api/track`
3. Verify dev server is running: `http://localhost:3000`

## Quick Test Command

Run this from your terminal to check if tracking endpoint works:
```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "21ab0e04-d89e-450a-b5d4-ffd6330dcaeb",
    "sessionId": "test_session_123",
    "event": "pageview",
    "url": "http://test.com",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }'
```

Should return: `{"success":true}`

