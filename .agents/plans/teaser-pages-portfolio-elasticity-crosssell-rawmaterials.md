# Feature: Teaser Pages — Portfolio Overview, Price Elasticity, Cross-Sell/Upsell, Raw Material Insights

The following plan should be complete, but validate codebase patterns and task sanity before implementing.
Pay special attention to exact class names, color tokens, and import paths — all are specific to this project.

## Feature Description

Add 4 "Option B" teaser pages to the Equazion demo app. Each page is a fully navigable screen (not a modal or locked nav item) that shows the screen name, a pitch line, an "In Development" banner, and 1–2 skeleton chart areas hinting at the real content. The pages feel like real screens that are almost ready — not empty placeholders. This makes the tool feel like a larger, enterprise-grade platform during demos.

## User Story

As a PwC demo presenter
I want to click on upcoming module names in the sidebar and see a polished preview screen
So that the demo audience perceives Equazion as a full commercial intelligence platform, not just 6 screens

## Problem Statement

The current app covers deal/transaction-level and period analytics well, but shows no portfolio-level, predictive, or commodity views. Audiences perceive the tool as narrower than it is. Adding teaser pages for modules in development signals roadmap depth without requiring full implementation.

## Solution Statement

Create a shared `TeaserPage` component that accepts page-specific config (icon, title, subtitle, skeleton definitions). Four thin page files pass their config to it. The sidebar gets 4 new nav items with a `comingSoon` flag that renders a "SOON" badge in expanded mode. All skeleton visuals are pure CSS/inline SVG — zero data dependencies, zero Recharts.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Low
**Primary Systems Affected**: Sidebar navigation, new route pages
**Dependencies**: `lucide-react` (already installed, v0.577.0) — all required icons confirmed available

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ THESE BEFORE IMPLEMENTING

- `src/components/layout/Sidebar.tsx` (lines 1–27) — **Why**: Current `NAV_ITEMS` array structure and icon import pattern to extend. Currently typed as plain object literal (no explicit type). Line 70–91: nav rendering loop — where to add `comingSoon` badge and divider logic.
- `src/components/layout/Sidebar.tsx` (lines 70–91) — **Why**: Exact JSX structure of a nav link — className logic using `clsx`, collapsed/expanded `<span>` pattern, `Icon` usage with `strokeWidth`.
- `src/app/waterfall/page.tsx` (lines 111–119) — **Why**: Canonical page shell pattern: `<div className="flex flex-col h-full">` wrapper, use of `.card` class, `p-6` padding, `gap-3` spacing.
- `src/components/shared/ChartSkeleton.tsx` (lines 1–27) — **Why**: Existing skeleton component — use as visual reference. TeaserPage will use a variant-aware skeleton sub-component, not ChartSkeleton directly (needs heatmap/line/scatter variants).
- `src/app/globals.css` (lines 30–43) — **Why**: `.card`, `.page-container`, `.page-title` utility class definitions. `.animate-fade-in` at line 46.
- `tailwind.config.ts` (lines 11–36) — **Why**: Source of truth for all color tokens. Key tokens for this feature:
  - `pwc-orange: #eb8c00`
  - `pwc-orange-dark: #dc6900`
  - `border-default: #e7e7e8`
  - `border-strong: #dadadc`
  - `text-muted: #939598`
  - `text-secondary: #6d6e71`
  - `page-bg: #f5f5f5`
  - `card-bg: #ffffff`

### New Files to Create

- `src/components/shared/TeaserPage.tsx` — Shared teaser component; all 4 pages use this
- `src/app/portfolio-overview/page.tsx` — Portfolio Overview teaser page
- `src/app/price-elasticity/page.tsx` — Price Elasticity teaser page
- `src/app/cross-sell/page.tsx` — Cross-Sell / Upsell teaser page
- `src/app/raw-materials/page.tsx` — Raw Material Insights teaser page

### Files to Modify

- `src/components/layout/Sidebar.tsx` — Add 4 nav items, `comingSoon` field, divider, SOON badge, 4 new Lucide imports

### Patterns to Follow

**Page shell pattern** (from `src/app/waterfall/page.tsx` line 112):
```tsx
'use client'
export default function PageName() {
  return (
    <div className="flex flex-col h-full">
      {/* content */}
    </div>
  )
}
```

**Card pattern** (from `globals.css` line 31 — `.card` = `bg-card-bg border border-border-default rounded-xl shadow-sm`):
```tsx
<div className="card p-4">...</div>
```

**Nav item structure** (from `Sidebar.tsx` lines 73–89):
```tsx
<Link
  key={href}
  href={href}
  title={collapsed ? label : undefined}
  className={clsx(
    'flex items-center rounded-lg text-sm transition-colors',
    collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
    isActive
      ? 'bg-sidebar-active text-pwc-orange font-medium'
      : 'text-white/70 hover:text-white hover:bg-sidebar-hover'
  )}
>
  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
  <span className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
    {label}
  </span>
</Link>
```

**Collapsed span hiding pattern**: `overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap` with `max-w-0 opacity-0` (collapsed) vs `max-w-[200px] opacity-100` (expanded). Apply same pattern to the SOON badge.

**Animate fade-in**: `className="animate-fade-in"` — defined in `globals.css` line 46 as `animation: fadeIn 200ms ease-out both`.

**No ExplainButton, no FilterBar, no chat button on teasers** — confirmed by design intent (nothing to explain, no data).

**`'use client'` on all page files** — consistent with all existing pages, even those that don't strictly need it.

---

## IMPLEMENTATION PLAN

### Phase 1: Shared TeaserPage Component

Create the single component that all 4 pages delegate to.

### Phase 2: Sidebar Update

Extend nav with 4 teaser items, visual divider, and SOON badge.

### Phase 3: Four Page Files

Thin wrappers calling TeaserPage with page-specific config.

### Phase 4: Validation

Build check + manual nav verification.

---

## STEP-BY-STEP TASKS

### TASK 1 — CREATE `src/components/shared/TeaserPage.tsx`

**IMPLEMENT**: A `'use client'` component (for consistency) that accepts the following props:
```ts
interface TeaserPageProps {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  subtitle: string
  skeletons: {
    label: string
    variant: 'heatmap' | 'line' | 'scatter' | 'bar'
    height?: string   // Tailwind height class, default 'h-48'
    wide?: boolean    // spans full width vs half width in flex row
  }[]
}
```

**IMPLEMENT** — Page layout structure:
```tsx
<div className="flex flex-col h-full p-6 gap-5 animate-fade-in">

  {/* Header */}
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-pwc-orange/10 flex items-center justify-center shrink-0">
        <Icon size={18} strokeWidth={1.8} className="text-pwc-orange" />
      </div>
      <h1 className="page-title">{title}</h1>
    </div>
    <p className="text-sm text-text-muted pl-12">{subtitle}</p>
  </div>

  {/* In Development banner */}
  <div className="flex items-start gap-3 px-4 py-3 bg-zone-amber-bg border border-zone-amber/25 rounded-xl">
    <Construction size={15} className="text-pwc-orange shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-pwc-orange-dark">This module is in development</p>
      <p className="text-xs text-text-muted mt-0.5">
        This capability is on the ChocoMaker roadmap. Contact your PwC team to discuss prioritisation and timeline.
      </p>
    </div>
  </div>

  {/* Skeleton grid */}
  <div className="flex flex-wrap gap-4 flex-1">
    {skeletons.map(skeleton => (
      <div
        key={skeleton.label}
        className={`card p-4 flex flex-col gap-3 ${skeleton.wide ? 'flex-1 min-w-[300px]' : 'flex-1 min-w-[240px]'}`}
      >
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide opacity-40">
          {skeleton.label}
        </p>
        <SkeletonChart variant={skeleton.variant} height={skeleton.height ?? 'h-48'} />
      </div>
    ))}
  </div>

</div>
```

**IMPLEMENT** — `SkeletonChart` internal component (not exported, defined in same file):

All variants wrap content in `<div className={`${height} relative overflow-hidden opacity-50`}>`.

- **`heatmap`**: CSS grid of 48 cells (8 cols × 6 rows). Use `grid grid-cols-8 gap-1 h-full`. Each cell is `<div className="rounded-sm" style={{ backgroundColor: '#eb8c00', opacity: cellOpacity }}>` where cellOpacity varies from 0.05 to 0.35 using a hardcoded array of 48 values mixing low/mid/high opacities (no randomness — hardcode the array so output is deterministic). Include 2–3 "hot" cells at higher opacity (0.35–0.5) to simulate real leakage clusters. Add a row of grey label placeholders above and a column of grey label placeholders to the left using `bg-border-default rounded` bars.

  Exact structure:
  ```tsx
  <div className="flex flex-col gap-1 h-full">
    {/* Column headers (SKU labels) */}
    <div className="grid grid-cols-8 gap-1 pl-10">
      {['Milk Couv.','Dark 72%','White Comp.','Cocoa Pwd','Filling','Praline','Dark 54%','Compound'].map(h => (
        <div key={h} className="h-2 bg-border-default rounded opacity-40" />
      ))}
    </div>
    {/* Grid rows */}
    {HEATMAP_ROWS.map((row, ri) => (
      <div key={ri} className="flex gap-1 flex-1">
        {/* Row label */}
        <div className="w-8 h-full bg-border-default rounded opacity-30 shrink-0" />
        {/* Cells */}
        <div className="grid grid-cols-8 gap-1 flex-1">
          {row.map((opacity, ci) => (
            <div key={ci} className="rounded-sm" style={{ backgroundColor: opacity > 0.2 ? '#dc2626' : '#eb8c00', opacity }} />
          ))}
        </div>
      </div>
    ))}
  </div>
  ```

  Hardcode `HEATMAP_ROWS` as a constant above the component:
  ```ts
  const HEATMAP_ROWS = [
    [0.08, 0.35, 0.12, 0.05, 0.18, 0.07, 0.28, 0.10],
    [0.22, 0.10, 0.45, 0.08, 0.12, 0.30, 0.06, 0.15],
    [0.06, 0.18, 0.09, 0.32, 0.07, 0.14, 0.40, 0.08],
    [0.30, 0.08, 0.16, 0.12, 0.38, 0.09, 0.11, 0.25],
    [0.10, 0.25, 0.07, 0.20, 0.08, 0.42, 0.13, 0.06],
    [0.15, 0.06, 0.22, 0.09, 0.17, 0.08, 0.35, 0.12],
  ]
  ```

- **`line`**: Inline SVG with static demand/trend curve. Use `<svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">`. Draw:
  - 4 horizontal gridlines: `<line x1="0" y1={y} x2="400" y2={y} stroke="#e7e7e8" strokeWidth="1" />`
  - A smooth cubic bezier curve: `<path d="M 0 140 C 80 130, 160 90, 240 60 C 300 38, 350 30, 400 25" fill="none" stroke="#eb8c00" strokeWidth="2" opacity="0.35" />`
  - A vertical dashed marker at x=160 (current price): `<line x1="160" y1="0" x2="160" y2="160" stroke="#939598" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />`
  - Two x-axis tick labels as `<text>` at 0.4 opacity: `<text x="40" y="155" fontSize="10" fill="#939598" opacity="0.5">−10%</text>` and `<text x="140" y="155" fontSize="10" fill="#939598" opacity="0.5">Current</text>` and `<text x="300" y="155" fontSize="10" fill="#939598" opacity="0.5">+10%</text>`
  - For the **Raw Materials** variant of `line`, draw 3 curves instead of 1 (cocoa, sugar, dairy) with slightly different paths and stroke colors: `#eb8c00` (cocoa), `#6d6e71` (sugar), `#059669` (dairy) — all at opacity 0.3.

  **GOTCHA**: The `line` variant is used by both Price Elasticity (single curve) and Raw Materials (3 curves). Use a sub-prop or a separate variant name like `'multiline'` to distinguish, OR handle it in the page config by passing a different variant name. **Recommended**: add `'multiline'` as a fourth variant to `TeaserPageProps` skeletons type. The Raw Materials page uses `variant: 'multiline'`.

- **`scatter`**: A `relative` container with ~14 absolutely positioned circles simulating a propensity bubble chart. Hardcode positions as a constant array:
  ```ts
  const SCATTER_DOTS = [
    { x: '12%', y: '60%', size: 32, opacity: 0.20 },
    { x: '28%', y: '25%', size: 20, opacity: 0.35 },
    { x: '42%', y: '70%', size: 44, opacity: 0.15 },
    { x: '55%', y: '35%', size: 28, opacity: 0.40 },
    { x: '68%', y: '55%', size: 18, opacity: 0.28 },
    { x: '78%', y: '20%', size: 36, opacity: 0.22 },
    { x: '20%', y: '80%', size: 22, opacity: 0.30 },
    { x: '35%', y: '45%', size: 40, opacity: 0.18 },
    { x: '62%', y: '75%', size: 26, opacity: 0.35 },
    { x: '85%', y: '40%', size: 16, opacity: 0.42 },
    { x: '48%', y: '15%', size: 30, opacity: 0.25 },
    { x: '72%', y: '85%', size: 38, opacity: 0.16 },
    { x: '8%',  y: '35%', size: 24, opacity: 0.32 },
    { x: '92%', y: '65%', size: 20, opacity: 0.38 },
  ]
  ```
  Render as: `<div style={{ left: dot.x, top: dot.y, width: dot.size, height: dot.size, opacity: dot.opacity, backgroundColor: '#eb8c00', borderRadius: '50%', position: 'absolute', transform: 'translate(-50%, -50%)' }} />`

- **`bar`**: 6 static vertical bars of varying heights. Use `flex items-end gap-2 h-full px-2 pb-4`. Hardcode heights: `['55%', '80%', '38%', '65%', '42%', '72%']`. Each bar: `<div style={{ height, flex: 1 }} className="bg-border-strong rounded-t opacity-50" />`.

**IMPORTS** for TeaserPage.tsx:
```ts
'use client'
import { Construction } from 'lucide-react'
import type { ComponentType } from 'react'
```

**VALIDATE**: `cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -30`

---

### TASK 2 — UPDATE `src/components/layout/Sidebar.tsx`

**ADD** 4 new Lucide imports (line 9, after existing imports):
```ts
import {
  MessageSquare,
  ScatterChart,
  Calculator,
  Target,
  Layers,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  TrendingUp,
  ArrowUpRight,
  Wheat,
} from 'lucide-react'
```

**UPDATE** `NAV_ITEMS` array — add explicit type and 4 new entries. Replace the existing `const NAV_ITEMS = [...]` (lines 20–27) with:
```ts
type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  comingSoon?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/ask-your-data',      label: 'Ask Your Data',       icon: MessageSquare },
  { href: '/segmentation',       label: 'Segmentation',        icon: ScatterChart },
  { href: '/deal-pricing',                label: 'Deal Pricing',                 icon: Calculator },
  { href: '/deal-intelligence',  label: 'Deal Intelligence',   icon: Target },
  { href: '/waterfall',          label: 'Price Waterfall',     icon: Layers },
  { href: '/pvm',                label: 'Price-Volume-Mix',    icon: GitBranch },
  { href: '/portfolio-overview', label: 'Portfolio Overview',  icon: LayoutDashboard, comingSoon: true },
  { href: '/price-elasticity',   label: 'Price Elasticity',    icon: TrendingUp,      comingSoon: true },
  { href: '/cross-sell',         label: 'Cross-Sell / Upsell', icon: ArrowUpRight,    comingSoon: true },
  { href: '/raw-materials',      label: 'Raw Materials',       icon: Wheat,           comingSoon: true },
]
```

**GOTCHA**: `React` must be in scope for `React.ComponentType`. Since this is already a `'use client'` file using JSX, React is implicitly available via Next.js. The type reference `React.ComponentType` requires either `import React from 'react'` or `import type { ComponentType } from 'react'`. Check whether existing file imports React — it does NOT (uses named imports only). Use `ComponentType` from react:
```ts
import { useState, useEffect, type ComponentType } from 'react'
```
Then change the type to `icon: ComponentType<{ size?: number; strokeWidth?: number }>`.

**UPDATE** nav rendering loop (lines 69–91) — replace the `{NAV_ITEMS.map(...)}` block with:
```tsx
<nav className="flex flex-col gap-0.5 px-2 py-4 flex-1">
  {NAV_ITEMS.map(({ href, label, icon: Icon, comingSoon }, index) => {
    const isActive = pathname === href || pathname.startsWith(href + '/')
    const showDivider = index === 6  // divider before first teaser item
    return (
      <div key={href}>
        {showDivider && (
          <hr className="border-white/10 mx-2 my-2" />
        )}
        <Link
          href={href}
          title={collapsed ? label : undefined}
          className={clsx(
            'flex items-center rounded-lg text-sm transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
            isActive
              ? 'bg-sidebar-active text-pwc-orange font-medium'
              : 'text-white/70 hover:text-white hover:bg-sidebar-hover'
          )}
        >
          <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
          <span className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
            {label}
          </span>
          {!collapsed && comingSoon && (
            <span className="overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out ml-auto text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded bg-white/10 text-white/40 whitespace-nowrap">
              SOON
            </span>
          )}
        </Link>
      </div>
    )
  })}
</nav>
```

**GOTCHA**: `key` is now on the wrapping `<div>`, not the `<Link>`. This is correct — React needs the key on the outermost element returned from `.map()`.

**GOTCHA**: The `SOON` badge uses `ml-auto` to right-align. This only works because the link is `flex items-center` with a fixed width (`w-60` from the aside). Verify visually that the badge doesn't overflow in expanded mode.

**VALIDATE**: `cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -30`

---

### TASK 3 — CREATE `src/app/portfolio-overview/page.tsx`

```tsx
'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'
import { LayoutDashboard } from 'lucide-react'

export default function PortfolioOverviewPage() {
  return (
    <TeaserPage
      icon={LayoutDashboard}
      title="Portfolio Overview"
      subtitle="Identify margin leakage across your full customer and SKU portfolio — ranked by revenue at risk."
      skeletons={[
        { label: 'Margin Leakage Heatmap — Customers × SKUs', variant: 'heatmap', height: 'h-56', wide: true },
        { label: 'Top Leakage Sources', variant: 'bar', height: 'h-44' },
        { label: 'Portfolio Health Distribution', variant: 'scatter', height: 'h-44' },
      ]}
    />
  )
}
```

**VALIDATE**: `cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -30`

---

### TASK 4 — CREATE `src/app/price-elasticity/page.tsx`

```tsx
'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'
import { TrendingUp } from 'lucide-react'

export default function PriceElasticityPage() {
  return (
    <TeaserPage
      icon={TrendingUp}
      title="Price Elasticity"
      subtitle="Model the revenue and volume impact of price changes before you commit — per SKU and customer segment."
      skeletons={[
        { label: 'Elasticity Curve — Price vs. Predicted Demand', variant: 'line', height: 'h-52', wide: true },
        { label: 'What-If Scenario Impact', variant: 'bar', height: 'h-44' },
      ]}
    />
  )
}
```

**VALIDATE**: `cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -30`

---

### TASK 5 — CREATE `src/app/cross-sell/page.tsx`

```tsx
'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'
import { ArrowUpRight } from 'lucide-react'

export default function CrossSellPage() {
  return (
    <TeaserPage
      icon={ArrowUpRight}
      title="Cross-Sell / Upsell"
      subtitle="Surface white space opportunities and propensity scores across your customer base."
      skeletons={[
        { label: 'White Space Map — Products × Accounts', variant: 'scatter', height: 'h-56', wide: true },
        { label: 'Propensity Score Ranking', variant: 'bar', height: 'h-44' },
      ]}
    />
  )
}
```

**VALIDATE**: `cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -30`

---

### TASK 6 — CREATE `src/app/raw-materials/page.tsx`

```tsx
'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'
import { Wheat } from 'lucide-react'

export default function RawMaterialsPage() {
  return (
    <TeaserPage
      icon={Wheat}
      title="Raw Material Insights"
      subtitle="Track cocoa, sugar, and dairy commodity price trends and their impact on ChocoMaker's input cost structure."
      skeletons={[
        { label: 'Commodity Price Index — Cocoa · Sugar · Dairy (24 months)', variant: 'multiline', height: 'h-52', wide: true },
        { label: 'Input Cost Impact by SKU', variant: 'bar', height: 'h-44' },
      ]}
    />
  )
}
```

**VALIDATE**: `cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -30`

---

### TASK 7 — FINAL BUILD VALIDATION

**VALIDATE**:
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx next build 2>&1 | tail -30
```

---

## TESTING STRATEGY

No unit or integration tests — this is a static UI feature with no data dependencies, no API calls, and no state logic. Manual validation is sufficient.

### Manual Validation Checklist

- [ ] All 4 new nav items appear below the existing 6 in the sidebar
- [ ] A subtle divider line separates live items from teaser items
- [ ] In **expanded** sidebar: "SOON" badge visible on all 4 teaser items, right-aligned
- [ ] In **collapsed** sidebar: icon only, no badge, no label (consistent with live items)
- [ ] Clicking each teaser nav item navigates to the correct route without 404
- [ ] Each page shows: icon + title + subtitle + orange banner + skeleton chart area(s)
- [ ] Heatmap skeleton shows a grid of colored cells (Portfolio Overview)
- [ ] Line skeleton shows a smooth curve with a dashed vertical marker (Price Elasticity)
- [ ] Scatter skeleton shows bubbles of varying size and opacity (Cross-Sell)
- [ ] Multiline skeleton shows 3 distinct curves (Raw Materials)
- [ ] Bar skeleton appears on all 4 pages as the secondary skeleton
- [ ] No ExplainButton, no FilterBar, no Ask chat button on any teaser page
- [ ] Page transition animation (`.animate-fade-in`) fires on navigation to teaser pages
- [ ] Active state highlights correctly in sidebar when on a teaser page

---

## VALIDATION COMMANDS

### Level 1: TypeScript
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit 2>&1 | head -40
```

### Level 2: Build
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx next build 2>&1 | tail -30
```

### Level 3: Dev Server (manual)
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npm run dev
```
Then navigate to:
- http://localhost:3000/portfolio-overview
- http://localhost:3000/price-elasticity
- http://localhost:3000/cross-sell
- http://localhost:3000/raw-materials

---

## ACCEPTANCE CRITERIA

- [ ] 4 new routes exist and render without errors
- [ ] Sidebar shows all 4 new items with SOON badge (expanded) and divider
- [ ] TeaserPage component renders for all 4 variant combinations
- [ ] No TypeScript errors (`npx tsc --noEmit` exits 0)
- [ ] `npx next build` passes without errors
- [ ] No regressions on existing 6 nav items (active states, collapse, routing all work)
- [ ] No ExplainButton or chat button rendered on teaser pages
- [ ] All skeleton variants render deterministically (hardcoded data, no randomness)

---

## COMPLETION CHECKLIST

- [ ] `src/components/shared/TeaserPage.tsx` created with all 4 skeleton variants (`heatmap`, `line`, `scatter`, `bar`, `multiline`)
- [ ] `src/components/layout/Sidebar.tsx` updated with 4 nav items, divider, SOON badge
- [ ] `src/app/portfolio-overview/page.tsx` created
- [ ] `src/app/price-elasticity/page.tsx` created
- [ ] `src/app/cross-sell/page.tsx` created
- [ ] `src/app/raw-materials/page.tsx` created
- [ ] TypeScript check passes
- [ ] Build passes
- [ ] Manual checklist above verified

---

## NOTES

**Color tokens to use in TeaserPage** (from `tailwind.config.ts`):
- Banner background: `bg-zone-amber-bg` (`#fffbeb`) — warmer/more on-brand than a grey neutral
- Banner border: `border-zone-amber/25`
- Banner icon + title: `text-pwc-orange` / `text-pwc-orange-dark`
- Heatmap hot cells: `#dc2626` (zone-red) for high-leakage cells; `#eb8c00` (pwc-orange) for medium
- SVG line curve: `stroke="#eb8c00"` at opacity 0.35
- SVG gridlines: `stroke="#e7e7e8"` (border-default)
- Scatter bubbles: `backgroundColor: '#eb8c00'`
- Bar chart: `bg-border-strong` (`#dadadc`)

**Arbitrary opacity in Tailwind**: `/25`, `/10`, `/30` etc. are all supported by Tailwind v3 JIT. Confirmed project uses Tailwind v3 (from `tailwind.config.ts` structure).

**`wide: true` skeleton behaviour**: In the flex-wrap grid, `wide: true` skeletons use `flex-1 min-w-[300px]` so they always claim a full row when other skeletons are narrower. The full-width heatmap and multiline chart will naturally span the row; the bar/scatter pair beside them will stack below. This gives a large-chart-on-top, small-charts-below layout without needing CSS grid.

**Confidence Score: 9/10** — All patterns, tokens, icons, and file structures are verified against the live codebase. The only risk is visual tuning of skeleton proportions on the actual screen, which may need minor height adjustments after manual review.
