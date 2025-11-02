# 🐝 Setting Up Trackerbee MCP in Cursor

## Quick Setup (5 minutes)

### 1️⃣ Get Your Supabase Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/fkgdwihxexwqldrpifcq/settings/api)
2. Copy your **anon/public** key (not the service_role key)

### 2️⃣ Configure Cursor

**Option A: Settings UI (Recommended)**
1. Open Cursor
2. Go to Settings (`Cmd+,`)
3. Search for "MCP" or find "Features > Model Context Protocol"
4. Click "Edit Config"
5. Add this configuration:

```json
{
  "mcpServers": {
    "trackerbee": {
      "command": "node",
      "args": ["/Users/stephennewman/web-analytics/trackerbee-mcp/build/index.js"],
      "env": {
        "SUPABASE_URL": "https://fkgdwihxexwqldrpifcq.supabase.co",
        "SUPABASE_KEY": "YOUR_SUPABASE_ANON_KEY_HERE"
      }
    }
  }
}
```

**Option B: Manual Config File**
Edit `~/.cursor/config.json` and add the above configuration.

### 3️⃣ Restart Cursor

Quit Cursor completely and reopen it.

### 4️⃣ Test It!

Open Cursor Composer (`Cmd+Shift+I` or `Cmd+I`) and try:

```
@trackerbee get_building_tickets
```

You should see JSON with your current "Building" tickets!

---

## 🎯 Example Usage

### Morning Planning Workflow

**Step 1: See what's ready to build**
```
@trackerbee get_next_priority {"framework": "quick_win"}
```

**Step 2: Get full context**
```
@trackerbee get_ticket_details {"ticket_id": "[id from above]"}
```

**Step 3: Start building**
```
@cursor implement the feature described above. Use the voice feedback transcripts to understand user needs.
```

### Check Active Work

```
@trackerbee get_building_tickets
```

Returns all tickets currently in "Building" status.

### Search for Related Work

```
@trackerbee search_tickets {"keyword": "mobile"}
```

Finds all tickets mentioning "mobile" in title or description.

---

## 🛠️ Available Tools

| Tool | Description | Example |
|------|-------------|---------|
| `get_building_tickets` | See what's being built now | `@trackerbee get_building_tickets` |
| `get_ticket_details` | Full context + voice feedback | `@trackerbee get_ticket_details {"ticket_id": "abc"}` |
| `get_next_priority` | AI-suggested next ticket | `@trackerbee get_next_priority {"framework": "quick_win"}` |
| `list_tickets` | Filter by status | `@trackerbee list_tickets {"status": "planned"}` |
| `search_tickets` | Find by keyword | `@trackerbee search_tickets {"keyword": "auth"}` |

---

## 🎨 Prioritization Frameworks

When using `get_next_priority`, choose a framework:

- **`traditional`** (default) - Balanced: demand + value + ease
- **`quick_win`** - Maximum impact per hour (low effort, high value)
- **`differentiation`** - Unique features that create competitive moat
- **`enterprise`** - Critical blockers for enterprise customers
- **`viral`** - Features that make users share/invite others
- **`gray_area`** - Unstated problems users didn't explicitly ask for

Example:
```
@trackerbee get_next_priority {"framework": "enterprise"}
```

---

## 🔍 What You Get in Each Response

### Ticket Details Include:
- ✅ Title, description, status, priority
- ✅ **Voice feedback transcripts** from actual users
- ✅ AI scoring across 6 frameworks
- ✅ User engagement metrics (unique users, feedback count)
- ✅ Sentiment analysis
- ✅ Audio URLs for voice feedback

### Voice Feedback Example:
```json
"feedback": [
  {
    "cleaned_transcript": "The mobile navigation is really hard to use on my iPhone. The menu button is too small and I keep hitting the wrong thing.",
    "sentiment": "negative",
    "created_at": "2025-11-01T..."
  }
]
```

---

## 🐛 Troubleshooting

### "Server not found" or `@trackerbee` doesn't autocomplete

1. Check Cursor MCP config is correct
2. Ensure path to `build/index.js` is absolute and correct
3. Quit Cursor **completely** (not just close window)
4. Reopen Cursor

### "No tickets found"

1. Verify `SUPABASE_KEY` is correct (use anon key)
2. Check you have tickets in your database
3. Ensure RLS policies allow reading tickets

### TypeScript/Build Errors

```bash
cd trackerbee-mcp
rm -rf node_modules build
npm install
npm run build
```

### Check Logs

- **macOS:** `~/Library/Logs/Cursor/`
- **Linux:** `~/.config/Cursor/logs/`
- **Windows:** `%APPDATA%\Cursor\logs\`

Look for MCP server stderr output.

---

## 🚀 Advanced Tips

### Filter by Client/Site

If you have multiple sites tracked:

```
@trackerbee get_building_tickets {"client_id": "82c08676-46d2-4c60-aa70-7256e80e7a28"}
```

### Combine with Cursor's AI

```
Step 1: @trackerbee get_ticket_details {"ticket_id": "abc-123"}
Step 2: @cursor Read the voice feedback above and implement a solution that addresses all the pain points mentioned.
```

### Create a Daily Workflow

Every morning:
1. `@trackerbee get_next_priority {"framework": "quick_win"}`
2. Get the ticket details
3. Build it with Cursor's help
4. (Phase 2: Mark as shipped via MCP)

---

## 📦 What's Coming in Phase 2

Write operations (coming soon):
- `update_ticket_status` - Move tickets between columns from Cursor
- `mark_shipped` - Mark as shipped with release notes
- `add_implementation_note` - Document what you built

---

## 🎉 You're Ready!

Now you can build features directly from your roadmap with full user context! 🐝✨

**Next:** Try `@trackerbee get_next_priority` and start building!

