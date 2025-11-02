# 🐝 Auto-Conversion Detection

Trackerbeez now **automatically detects conversions** without requiring manual `TrackerBee.conversion()` calls!

---

## ✅ What Gets Auto-Detected

### 1. **Thank You / Confirmation Pages**
Automatically tracks conversions when users land on:
- `/thank-you`, `/thankyou`
- `/success`, `/confirmation`, `/confirmed`
- `/complete`, `/submitted`
- `/order-complete`, `/purchase-complete`
- `/appointment-confirmed`, `/booking-confirmed`

### 2. **Form Submissions**
Tracks conversions when forms are submitted with buttons containing:
- "Submit", "Send", "Purchase"
- "Buy Now", "Place Order", "Complete"
- "Confirm", "Book Now", "Schedule"
- "Request Appointment", "Get Started"
- "Sign Up", "Subscribe"

### 3. **Conversion Button Clicks**
Tracks when users click buttons with conversion-indicating text (same patterns as above).

---

## 🚀 How It Works

**For the pupperazipetspa.com example:**

1. ✅ User clicks "Send Request" button
2. 🐝 Auto-detection catches the button text "Send"
3. 🐝 Tracks conversion with `source: 'button_click'`
4. ✅ OR they land on a thank-you page
5. 🐝 Auto-detection catches the URL pattern
6. 🐝 Tracks conversion with `source: 'url_pattern'`

**Result:** `"converted": true` ✅

---

## 📊 Conversion Data Structure

Auto-detected conversions include extra metadata:

```json
{
  "event_type": "conversion",
  "data": {
    "value": 1,
    "auto_detected": true,
    "source": "form_submission", // or "url_pattern" or "button_click"
    "details": {
      "button_text": "Send Request",
      "form_action": "/api/submit",
      "form_id": "appointment-form"
    }
  }
}
```

---

## ⚙️ Configuration Options

### Disable Auto-Detection (if you want manual control)
```html
<script 
  src="https://your-domain.com/track.js?id=YOUR_CLIENT_ID"
  data-auto-convert="false"
></script>
```

### Manual Conversion Tracking (still works!)
```javascript
// Explicitly track a conversion
TrackerBee.conversion(1); // value = 1
TrackerBee.conversion(99.99); // track dollar amount
```

---

## 🔍 How to Verify It's Working

### In Browser Console:
You'll see these logs when conversions are detected:
```
🐝 Auto-conversion detection initialized
🐝 Form submission detected: Send Request
🐝 AUTO-CONVERSION DETECTED: form_submission {...}
```

### In Trackerbeez Dashboard:
- Session will show `"converted": true`
- Events will include a `conversion` event
- Event data will show `"auto_detected": true`

---

## 🛡️ Duplicate Prevention

Auto-detection prevents double-counting:
- ✅ Only **1 conversion per session** (uses localStorage)
- ✅ Tracks first successful detection
- ✅ Ignores subsequent attempts in same session

---

## 🎯 Supported Patterns

### URL Patterns (case-insensitive):
```
/thank-you
/thankyou
/success
/confirmation
/confirmed
/complete
/submitted
/order-complete
/purchase-complete
/checkout-success
/appointment-confirmed
/booking-confirmed
```

### Button Text Patterns (case-insensitive):
```
Submit
Send
Purchase
Buy Now
Place Order
Complete
Confirm
Book Now
Schedule
Request Appointment
Get Started
Sign Up
Subscribe
```

---

## 🔧 Custom Patterns (Coming Soon)

We'll add support for custom patterns via data attributes:

```html
<script 
  src="https://your-domain.com/track.js?id=YOUR_CLIENT_ID"
  data-conversion-urls="/checkout-complete,/order-success"
  data-conversion-buttons="Join Now,Start Trial"
></script>
```

---

## 📈 Use Cases

### E-Commerce
- Detects "Place Order", "Complete Purchase"
- Tracks `/order-complete`, `/checkout-success`

### SaaS / Lead Gen
- Detects "Get Started", "Sign Up", "Subscribe"
- Tracks `/confirmation`, `/thank-you`

### Service Bookings
- Detects "Request Appointment", "Book Now"
- Tracks `/appointment-confirmed`, `/booking-confirmed`

### Contact Forms
- Detects "Send", "Submit", "Send Request"
- Tracks form submissions automatically

---

## 🐞 Troubleshooting

### Conversion not detected?

1. **Check console logs** - Should see `🐝 Auto-conversion detection initialized`
2. **Check button text** - Does it match patterns?
3. **Check URL** - Does thank-you page match patterns?
4. **Try manual tracking** - `TrackerBee.conversion(1)`

### Double conversions?

- Auto-detection has built-in deduplication
- Only tracks **once per session**
- Check if you're calling `TrackerBee.conversion()` manually AND auto-detect is running

### Want to customize?

Contact support or check the `autoConversionConfig` object in `track.js` to see all patterns.

---

## 🎯 Bottom Line

**No more missing conversions!** 🐝

Trackerbeez now automatically catches:
- ✅ Form submissions with "Send Request"
- ✅ Button clicks like "Book Now"
- ✅ Landing on `/thank-you` pages

Just install the tracking script and conversions are tracked automatically.

