# 🐝 Trackerbee Desktop Notifier

Get **automatic desktop notifications** when new tickets are created in Trackerbee!

## 🚀 Quick Start

### 1. Start the notifier:
```bash
npm run notifier:bg
```

This runs in the background and checks for new tickets every 5 minutes.

### 2. Stop the notifier:
```bash
npm run notifier:stop
```

---

## 📱 What You'll Get

**When a new ticket arrives:**
- 🔴 High priority: Red dot + notification
- 🟡 Medium priority: Yellow dot + notification  
- 🟢 Low priority: Green dot + notification

**Example notification:**
```
🔴 New Trackerbee Ticket
Dashboard refresh redirects to settings
Status: new | Priority: high
```

---

## ⚙️ Configuration

The notifier uses your existing Supabase credentials from `.env.local`:
- `SUPABASE_URL`
- `SUPABASE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Check interval:** 5 minutes (configurable in `trackerbee-notifier.js`)

---

## 🎯 Usage Tips

### **Start on system boot (macOS):**
Add to your `.zshrc` or `.bashrc`:
```bash
cd /Users/stephennewman/web-analytics && npm run notifier:bg
```

### **Check if running:**
```bash
ps aux | grep trackerbee-notifier
```

### **View logs (foreground mode):**
```bash
npm run notifier
```

---

## 🔧 Troubleshooting

**No notifications appearing?**
1. Check System Preferences → Notifications
2. Enable notifications for "Terminal" or "iTerm"
3. Test: `osascript -e 'display notification "Test" with title "Trackerbee"'`

**Notifier not starting?**
1. Ensure Supabase credentials are in `.env.local`
2. Run in foreground to see errors: `npm run notifier`

---

## 🔄 Integration with Cursor

You can **combine** this with the `.cursorrules` file:

1. **Notifier** alerts you instantly when tickets arrive
2. **Cursor** auto-checks tickets when you open a conversation
3. **Best of both worlds** - passive + active monitoring!

---

## 💡 Future Enhancements

Want to customize? Edit `trackerbee-notifier.js`:
- Change check interval (line 87)
- Filter by priority or status
- Send to Slack instead of desktop
- Group notifications by time window

---

🐝 **Happy ticket tracking!**

