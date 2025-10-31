# 🎨 Design System Documentation

## Overview

Trackerbee uses a **hybrid design system** combining:
- **Tremor** - Analytics-focused components (charts, KPIs, metrics)
- **shadcn/ui** - General-purpose components (buttons, modals, forms)
- **Custom Design Config** - Adjustable "boldness" levels

---

## 🎚️ Boldness Levels

The design system has **3 boldness levels** you can switch between instantly:

### **Level 1: Professional** (DEFAULT)
- Thin borders (1-2px)
- Subtle drop shadows
- Muted, professional colors
- Best for: B2B, Enterprise, Analytics

**Use Case:** Default professional look for serious business tools

### **Level 2: Balanced**
- Medium borders (2-3px)
- Offset shadows (2-4px offset)
- Slightly bolder colors
- Best for: SMB SaaS, Modern products

**Use Case:** Stand out while maintaining professionalism

### **Level 3: Bold/Neobrutalism**
- Thick borders (4-5px, black)
- Strong offset shadows (6-10px)
- Saturated colors
- Hover animations (button "pops")
- Best for: Consumer apps, Creative tools, Startups

**Use Case:** Maximum differentiation, memorable brand

---

## 🚀 How to Ramp Up Boldness

### Quick Toggle (1 minute)

1. Open `lib/design-system.ts`
2. Change line 11:
```typescript
boldnessLevel: 1,  // Change to 2 or 3
```
3. Save and refresh!

### What Changes:

| Element | Level 1 | Level 2 | Level 3 |
|---------|---------|---------|---------|
| **Buttons** | `bg-purple-600` thin border | `bg-purple-500` 2px border | `bg-purple-400` 4px black border + offset shadow |
| **Cards** | `border border-gray-200` | `border-2 border-gray-300` | `border-4 border-black shadow-[6px_6px_0px]` |
| **Badges** | `bg-green-100 text-green-800` | `bg-green-200 border-2` | `bg-green-300 text-black border-2 border-black` |
| **Shadows** | Subtle drop | 2-4px offset | 6-10px offset |

---

## 📦 Component Usage

### Using Design System Helpers

```typescript
import { getCardClass, getButtonClass, getBadgeClass } from '@/lib/design-system';

// Automatically adapts to current boldness level
<div className={getCardClass()}>
  <button className={getButtonClass('primary')}>Save</button>
  <span className={getBadgeClass('success')}>Active</span>
</div>
```

### Using shadcn Components

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

<Card>
  <Button variant="default">Click Me</Button>
  <Badge variant="success">New</Badge>
</Card>
```

### Using Tremor Components

```typescript
import { Card, Metric, BarChart, ProgressBar } from '@tremor/react';

<Card>
  <Metric
    metric={stats.totalSessions}
    metricLabel="Total Sessions"
    change={+12.5}
    changeType="positive"
  />
  <BarChart
    data={chartData}
    index="name"
    categories={["value"]}
  />
</Card>
```

---

## 🎨 Color Palette

### Primary Colors
- **Purple:** Primary actions, highlights
- **Yellow:** Accent, CTAs, warnings
- **Green:** Success, positive metrics
- **Red:** Errors, alerts, negative metrics
- **Blue:** Info, links, secondary actions

### Usage by Boldness Level

**Level 1 (Professional):**
- `purple-600`, `yellow-500`, `green-600`, `red-600`
- White text on dark backgrounds

**Level 2 (Balanced):**
- `purple-500`, `yellow-400`, `green-500`, `red-500`
- White text, some black text

**Level 3 (Bold):**
- `purple-400`, `yellow-300`, `green-400`, `red-400`
- Black text on bright backgrounds

---

## 🔧 Customization

### Adding New Helper Functions

Edit `lib/design-system.ts`:

```typescript
export const getAlertClass = (type: 'info' | 'warning' | 'error') => {
  const level = designConfig.boldnessLevel;
  
  if (level === 1) {
    // Professional style
    return 'border-l-4 bg-blue-50 p-4';
  } else if (level === 2) {
    // Balanced style
    return 'border-2 bg-blue-100 p-4 shadow-[2px_2px_0px]';
  } else {
    // Bold style
    return 'border-4 border-black bg-blue-300 p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]';
  }
};
```

### Overriding Specific Components

You can always override with custom Tailwind classes:

```typescript
// Use design system as base, override specific props
<button className={`${getButtonClass('primary')} !bg-pink-500`}>
  Custom Color
</button>
```

---

## 📊 Component Recommendations

### Use Tremor For:
- ✅ Charts (bar, line, area, donut)
- ✅ KPI cards & metrics
- ✅ Tables with data
- ✅ Progress indicators
- ✅ Analytics dashboards

### Use shadcn For:
- ✅ Buttons & forms
- ✅ Modals & dialogs
- ✅ Navigation
- ✅ Dropdowns & selects
- ✅ General UI components

### Use Custom Design System For:
- ✅ Unique branded components
- ✅ Consistent styling across mixed components
- ✅ Easy theme switching

---

## 🚀 Migration Strategy

### Phase 1: High-Impact Components (Week 1)
1. Replace main CTA buttons with `getButtonClass()`
2. Update stat cards to use Tremor's `<Metric>`
3. Apply `getCardClass()` to main dashboard cards

### Phase 2: Analytics Visualizations (Week 2)
1. Replace custom charts with Tremor charts
2. Update tables to Tremor `<Table>`
3. Convert progress bars to Tremor `<ProgressBar>`

### Phase 3: Full Migration (Week 3)
1. Update all modals to shadcn `<Dialog>`
2. Standardize all buttons/badges
3. Apply design system helpers everywhere

---

## 🎯 Quick Wins

### 1. Make Buttons Pop (2 minutes)
```typescript
// Before
<button className="px-4 py-2 bg-purple-600 text-white rounded">Save</button>

// After
<button className={getButtonClass('primary')}>Save</button>
```

### 2. Upgrade Stat Cards (5 minutes)
```typescript
// Before
<div className="bg-white p-4 rounded border">
  <p className="text-xs text-gray-600">Sessions</p>
  <p className="text-2xl font-bold">{sessions}</p>
</div>

// After
import { Card, Metric } from '@tremor/react';

<Card>
  <Metric metric={sessions} metricLabel="Sessions" />
</Card>
```

### 3. Consistent Badges (1 minute)
```typescript
// Before
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>

// After
<span className={getBadgeClass('success')}>Active</span>
```

---

## 🔄 A/B Testing Boldness

Want to test which level converts better?

```typescript
// Set based on user segment or feature flag
const userSegment = getUserSegment(); // 'a' | 'b' | 'c'
designConfig.boldnessLevel = userSegment === 'a' ? 1 : 
                             userSegment === 'b' ? 2 : 3;
```

---

## 📝 Examples

See `DESIGN_EXAMPLES.md` for code examples of common patterns.

---

## 🆘 Support

Questions? Check:
1. Tremor docs: https://www.tremor.so/docs
2. shadcn/ui docs: https://ui.shadcn.com/
3. This file!

**To ramp up boldness:** Just change `boldnessLevel` in `lib/design-system.ts` from 1 → 2 → 3 and watch your UI transform! 🎨

