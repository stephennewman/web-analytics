# Data Capture & Display Audit

## ✅ FULLY TRACKED & DISPLAYED

### Location Data
- **IP Address**: ✅ Captured in `events.data._geo.ip` (not displayed for privacy)
- **Country**: ✅ Captured in `events.data._geo.country` + `sessions.country` → 🖥️ Displayed as "🌍 [City], [Region], [Country]"
- **Region/State**: ✅ Captured in `events.data._geo.region` + `sessions.region` → 🖥️ Displayed
- **City**: ✅ Captured in `events.data._geo.city` + `sessions.city` → 🖥️ Displayed (URL-decoded)
- **Timezone**: ✅ Captured in `events.data.timezone` + `sessions.timezone` → 🖥️ Displayed as "🕐 America/New_York"
- **Language**: ✅ Captured in `events.data.language` + `sessions.language` → 🖥️ Displayed as "🗣️ en-US"

### Device Data
- **Device Type**: ✅ Captured in `events.data.device_type` → 🖥️ Displayed in session header
- **Screen Width/Height**: ✅ Captured in `events.data.screen_width/height` → ❌ NOT displayed
- **Viewport Width/Height**: ✅ Captured in `events.data.viewport_width/height` → ❌ NOT displayed
- **User Agent**: ✅ Captured in `events.data.user_agent` → ❌ NOT displayed
- **Referrer**: ✅ Captured in `events.data.referrer` → 🖥️ Displayed as "🔗 From: [referrer]"

### Engagement Metrics
- **Pageviews**: ✅ Counted from events → 🖥️ Displayed in session cards
- **Clicks**: ✅ Captured with element, text, href → 🖥️ Displayed (count only)
- **Time Spent**: ✅ Captured in exit event → 🖥️ Displayed in session cards
- **Scroll Depth**: ✅ Captured (25%, 50%, 75%, 100%) → 🖥️ Displayed (max %)
- **Load Time**: ✅ Captured in performance event → 🖥️ Displayed with "SLOW!" warning

### Conversion Signals
- **Phone Clicks**: ✅ Captured → 🖥️ Displayed in green badge
- **Email Clicks**: ✅ Captured → 🖥️ Displayed in green badge
- **Downloads**: ✅ Captured → 🖥️ Displayed in green badge
- **Form Submits**: ✅ Captured → 🖥️ Displayed in green badge

### Frustration Signals
- **Rage Clicks**: ✅ Captured → 🖥️ Displayed in red badge
- **Dead Clicks**: ✅ Captured → 🖥️ Displayed in yellow badge
- **JS Errors**: ✅ Captured → 🖥️ Displayed in orange badge

### Advanced Engagement
- **Text Copies**: ✅ Captured → 🖥️ Displayed (count in engagement section)
- **Tab Switches**: ✅ Captured with away time → 🖥️ Displayed (count)
- **Idle Time**: ✅ Captured → 🖥️ Displayed (count)
- **Orientation Changes**: ✅ Captured → 🖥️ Displayed (count)
- **Field Corrections**: ✅ Captured → 🖥️ Displayed (count)
- **Field Timing**: ✅ Captured → 🖥️ Displayed (count)

### Campaign Data
- **UTM Parameters**: ✅ Captured (source, medium, campaign, term, content) → 🖥️ Displayed as "📢 Campaign: [source] / [medium] / [campaign]"

---

## ❌ CAPTURED BUT NOT DISPLAYED

### Device Details (Low Priority)
- Screen resolution (width x height)
- Viewport dimensions
- User agent string
- Languages array (only first language shown)

### Performance Details
- DOM Ready time
- First Paint time
(Only load_time is shown)

### Event-Level Details
- Click element classes
- Full click text (truncated to 100 chars)
- Individual scroll depth events (only max shown)
- Exit active_time vs time_spent breakdown

---

## 🎯 MISSING/NOT TRACKED

These were mentioned in original planning but not implemented:

### Network/Tech
- ❌ Network speed
- ❌ Battery level
- ❌ Zoom level

### Form Analytics
- ❌ Autocomplete usage
- ❌ Validation errors

### E-commerce
- ❌ Cart events
- ❌ Checkout events

### Media
- ❌ Video engagement
- ❌ Audio engagement

### Security/Privacy
- ❌ Bot detection
- ❌ Ad blocker detection
- ❌ Do Not Track status

### Interaction
- ❌ Right-click events
- ❌ Paste events (copy is tracked)
- ❌ Back button clicks

---

## 📊 SUMMARY

**Total Data Points Tracked**: 35+
**Displayed in UI**: 28
**Captured but Hidden**: 7
**Not Yet Implemented**: 15

**Database Health**: ✅ All captured data properly stored
- `events.data` (JSONB): Full detail storage
- `sessions` table: Indexed columns for fast queries (country, region, city, timezone, language)

