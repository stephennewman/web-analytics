# Dashboard Showing No Data - Debug Instructions

## The Issue
Your Supabase database **HAS data** (112 events in sessions table), but Row Level Security (RLS) is preventing you from seeing it because:
- The logged-in user can only see sessions for clients they own
- The existing data belongs to different user accounts

## Quick Fix Options

### Option 1: Check Your Tracking Script (Recommended)
1. Go to http://localhost:3000/dashboard/clients
2. Copy your personal tracking script
3. Create a test HTML file and visit it a few times
4. Refresh dashboard - you should see YOUR new sessions

### Option 2: Check Console Logs
Open browser DevTools Console and look for:
```
Client ID: [your-client-id]
User ID: [your-user-id]  
Sessions query error: null/error
Sessions found: 0
```

If `Sessions found: 0`, your user account has no tracked sessions yet.

### Option 3: Query Database Directly
The database has this data:
- **Client 1**: user_id `bf70234a-fca0-46fe-af5c-d6003461438c` → 112 events
- **Client 2**: user_id `5ca41f4e-7dc0-482d-8520-9ffa4225f53f` → 0 events  
- **Client 3**: user_id `null` (test client) → 1 event

Your logged-in user can only see their own client's data.

## Test the Tracking Script

Create this test file anywhere:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Analytics Test</title>
  <script src="http://localhost:3000/track.js?id=YOUR_CLIENT_ID"></script>
</head>
<body>
  <h1>Test Page</h1>
  <a href="tel:555-1234">Call Us</a>
  <button onclick="webAnalytics.conversion()">Convert</button>
  
  <script>
    // Generate some activity
    setTimeout(() => {
      window.scrollTo(0, 500);
    }, 1000);
  </script>
</body>
</html>
```

Replace `YOUR_CLIENT_ID` with your actual client ID (shown in dashboard URL or console).

Visit this page, click around, scroll, then refresh your dashboard!

## If Still No Data
Run this to check what user you're logged in as:
```sql
SELECT auth.uid();
```

Then check if that user has a client:
```sql
SELECT * FROM clients WHERE user_id = 'YOUR_USER_ID';
```

