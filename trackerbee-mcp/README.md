# 🐝🐝🐝 Trackerbeez MCP Server for Cursor

Connect your Trackerbeez roadmap directly to Cursor! Build features based on real user feedback with AI assistance.

## 🎯 What It Does

Use `@trackerbeez` in Cursor to:
- See what's currently being built
- Get ticket details with voice feedback transcripts
- Find the next highest priority feature
- Search tickets by keyword
- Access full AI scoring and user engagement metrics

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd trackerbee-mcp
npm install
npm run build
```

### 2. Configure Cursor

Add to your Cursor settings (`~/.cursor/config.json` or via Settings UI):

```json
{
  "mcpServers": {
    "trackerbeez": {
      "command": "node",
      "args": ["/Users/stephennewman/web-analytics/trackerbee-mcp/build/index.js"],
      "env": {
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_KEY": "your-supabase-anon-key"
      }
    }
  }
}
```

**Get your Supabase credentials:**
- URL: From your Supabase project settings
- Key: Use the `anon` key (not service role)

### 3. Restart Cursor

Quit and reopen Cursor to load the MCP server.

### 4. Test It!

In Cursor Composer:
```
@trackerbeez get_building_tickets
```

## 🛠️ Available Tools

### `get_building_tickets`
Get all tickets currently in "Building" status.

**Usage:**
```
@trackerbeez get_building_tickets
```

**With client filter:**
```
@trackerbeez get_building_tickets {"client_id": "82c08676-46d2-4c60-aa70-7256e80e7a28"}
```

### `get_ticket_details`
Get full details including voice feedback transcripts.

**Usage:**
```
@trackerbeez get_ticket_details {"ticket_id": "abc-123"}
```

### `get_next_priority`
Get the highest priority ticket based on AI scoring.

**Usage:**
```
@trackerbeez get_next_priority
```

**With framework:**
```
@trackerbeez get_next_priority {"framework": "quick_win"}
```

**Frameworks:**
- `traditional` - Balanced demand + value + effort
- `quick_win` - Maximum impact per hour
- `differentiation` - Unique competitive advantage
- `enterprise` - Enterprise blockers
- `viral` - Features that drive sharing
- `gray_area` - Unstated user needs

### `list_tickets`
List all tickets by status.

**Usage:**
```
@trackerbeez list_tickets {"status": "planned"}
```

**Statuses:** `new`, `planned`, `building`, `shipped`

### `search_tickets`
Search tickets by keyword.

**Usage:**
```
@trackerbeez search_tickets {"keyword": "mobile"}
```

### `get_recent_tickets`
Get tickets created within the last X hours. Perfect for checking what's new!

**Usage:**
```
@trackerbeez get_recent_tickets
```

**With custom time range:**
```
@trackerbeez get_recent_tickets {"hours_ago": 1}  // Last hour
@trackerbeez get_recent_tickets {"hours_ago": 168}  // Last week
```

**Pro Tip:** Ask Cursor to check for you regularly:
```
You: @trackerbeez what tickets were created in the last hour?
(internally calls get_recent_tickets with hours_ago: 1)
```

## 💡 Example Workflows

### Morning Planning
```
You: @trackerbeez what should I build today?
(internally calls get_next_priority)

You: @trackerbeez get ticket details for [id from above]
(shows full context + voice feedback)

You: @cursor implement this feature using the feedback above
```

### Check Progress
```
You: @trackerbeez what's in building?
(shows all active tickets)
```

### Check What's New
```
You: @trackerbeez what's new since yesterday?
(internally calls get_recent_tickets with hours_ago: 24)

You: @trackerbeez any new tickets in the last hour?
(shows tickets created in last hour)
```

### Find Related Work
```
You: @trackerbeez search for "authentication" tickets
(finds all auth-related tickets)
```

## 🔧 Development

### Watch mode
```bash
npm run watch
```

### Rebuild
```bash
npm run build
```

### Debug
Check Cursor logs:
- macOS: `~/Library/Logs/Cursor/`
- Look for MCP server stderr output

## 📦 Project Structure

```
trackerbee-mcp/
├── src/
│   └── index.ts          # MCP server implementation
├── build/                # Compiled JavaScript (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

## 🐝 Phase 2 (Coming Soon)

Write operations:
- `update_ticket_status` - Move tickets between columns
- `mark_shipped` - Mark as shipped with notes
- `add_implementation_note` - Document what was built

## 🔒 Security

- Uses Supabase RLS (Row Level Security)
- Read-only for Phase 1
- Env vars never committed to git

## 🆘 Troubleshooting

**Server not showing in Cursor:**
1. Check config path is correct
2. Ensure `npm run build` completed successfully
3. Restart Cursor completely
4. Check Cursor logs for errors

**"No tickets found":**
1. Verify SUPABASE_URL and SUPABASE_KEY are correct
2. Check RLS policies allow reads
3. Ensure tickets exist in database

**TypeScript errors:**
```bash
rm -rf node_modules build
npm install
npm run build
```

## 📝 License

MIT - Part of Trackerbeez web analytics project

