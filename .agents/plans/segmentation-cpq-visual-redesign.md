# Feature: Segmentation & CPQ Visual Redesign

The following plan should be complete, but validate codebase patterns before implementing.
Pay special attention to Tailwind class names — they are custom tokens defined in `tailwind.config.ts`.
Import from the exact file paths listed; do not invent new data utilities.

---

## Feature Description

A visual redesign of the Segmentation and CPQ screens to increase information density, fix misleading
visualizations, and make critical pricing signals (zone breaches, escalation risk, win probability)
immediately readable by a sales rep during a live customer negotiation.

## User Story

As a sales rep preparing or negotiating a deal,
I want the Segmentation and CPQ screens to surface critical pricing signals at a glance,
So that I can make defensible pricing decisions without scrolling or mentally decoding raw numbers.

## Problem Statement

Current screens have low visual hierarchy: KPI cards are identical weight regardless of urgency,
scatter chart axes obscure clustering, price band marker is hard to read, margin bridge bars do not
render visibly, and the escalation/scenario section requires extensive scrolling.

## Solution Statement

Apply targeted visual upgrades per the spec: colored card borders, a new segment health panel,
chart axis/curve improvements, a redesigned CPQ price band with escalation labels, a fixed margin
bridge, per-card adjustable scenarios with Apply buttons, and a repositioned Win Prob / EoR section.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: High
**Primary Systems Affected**: Segmentation page, CPQ page, 8 existing components, 2 new components
**Dependencies**: recharts (already installed), clsx (already installed), lucide-react (already installed)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — MUST READ BEFORE IMPLEMENTING

- `src/app/segmentation/page.tsx` (lines 82–103) — KPI strip map; add `borderLeft` style and vs-Floor dominant logic
- `src/components/charts/SegmentationScatter.tsx` (full file) — all chart changes go here; uses recharts ScatterChart
- `src/components/segmentation/ComparisonPanel.tsx` — reference for how account data is accessed
- `src/app/cpq/page.tsx` (lines 19–24, 49–53, 66–99, 111–203) — escalation fn, netPrice formula (ALREADY FIXED to `1 + dealDiscountPct/100`), scenarios array, layout order
- `src/components/cpq/PriceBand.tsx` (full file) — direction already fixed; needs marker + zone labels
- `src/components/cpq/MarginBridge.tsx` (full file) — internal `afterDeal` formula still uses OLD sign (line 10); bars are h-20 container with `heightPct` of listPrice — scale issue causes invisible bars
- `src/components/cpq/EscalationBanner.tsx` (lines 59–64) — justification textarea currently only at `rep` level
- `src/components/cpq/ScenarioComparison.tsx` (full file) — needs per-card state + Apply button
- `src/components/cpq/WinProbSignal.tsx` — needs larger number display
- `src/components/cpq/EoRSignal.tsx` — needs larger number + risk bar
- `data/segmentation.json` — 12 points; `zone` field is stale (pre-computed, may not reflect current floor); always recompute zone at render time
- `data/accounts.json` — has `floor`, `target`, `volume`, `price`, `segment`, `segmentId` per account
- `data/quotes.json` — has `tierDiscount`, `currentPrice`, scenarios; use for DealContextPanel
- `tailwind.config.ts` — custom tokens: `zone-red`, `zone-amber`, `zone-green`, `zone-red-bg`, `zone-amber-bg`, `zone-green-bg`, `pwc-orange`, `text-primary`, `text-secondary`, `text-muted`, `border-default`, `page-bg`, `sidebar-bg`

### New Files to Create

- `src/components/segmentation/SegmentHealthPanel.tsx` — segment health summary panel (count, volume, avg margin, distribution bar)
- `src/components/cpq/DealContextPanel.tsx` — compact account + SKU context row

### Patterns to Follow

**Card pattern** (from any existing card):
```tsx
<div className="card px-4 py-3 flex-1">
  <p className="text-xs text-text-muted mb-0.5">{label}</p>
  <p className="text-lg font-semibold text-text-primary">{value}</p>
</div>
```

**Zone color mapping** (used everywhere):
```tsx
const zoneText = zone === 'red' ? 'text-zone-red' : zone === 'amber' ? 'text-zone-amber' : 'text-zone-green'
const zoneBg   = zone === 'red' ? 'bg-zone-red-bg' : zone === 'amber' ? 'bg-zone-amber-bg' : 'bg-zone-green-bg'
```

**Data access pattern** (from lib/data):
```tsx
import { accounts, getSegmentationForProduct } from '@/lib/data'
const account = accounts.find(a => a.id === accountId)
```

**Recharts pattern** (from SegmentationScatter.tsx):
- All chart components live inside `<ResponsiveContainer><ScatterChart margin={{...}}>`
- Custom shapes via `shape={(props) => <MyDot {...props} />}`
- Reference lines via `<ReferenceLine y={val} .../>`
- Additional `<Line>` overlaid on scatter requires adding `Line` to imports and passing curve data as a separate `<Scatter>` is NOT appropriate — use `<Line>` with its own data prop (type="monotone")

**clsx pattern** (from ScenarioComparison.tsx):
```tsx
import { clsx } from 'clsx'
className={clsx('base-class', condition && 'conditional-class')}
```

---

## IMPLEMENTATION PLAN

### Phase 1 — Segmentation: KPI Strip + Chart Fixes

Foundational chart and KPI improvements on the segmentation screen.

### Phase 2 — Segmentation: New Segment Health Panel

New component inserted between KPI strip and chart.

### Phase 3 — CPQ: PriceBand, Marker & Escalation Zone Labels

Visual upgrades to the price band component.

### Phase 4 — CPQ: Discount Section Overhaul

Slider improvements, combined discount readout, headroom label.

### Phase 5 — CPQ: Margin Bridge Fix

Fix formula, bar scale, add CoGS bar.

### Phase 6 — CPQ: Scenario Comparison Upgrade

Per-card state, Apply buttons, dynamic recommended, chip verdicts.

### Phase 7 — CPQ: Context Panel + Layout Reorder

New DealContextPanel, reposition Win Prob / EoR above scenarios.

---

## STEP-BY-STEP TASKS

> Execute every task in order. Each task is independently testable in the browser.

---

### TASK 1 — UPDATE `src/app/segmentation/page.tsx` — KPI strip colored borders + vs-Floor dominant card

**IMPLEMENT:**

Replace the current cards map (lines 83–102) with the following logic:

```tsx
const KPI_CONFIG = [
  {
    label: 'Current price',
    value: `€${activeAccount.price.toFixed(2)}/kg`,
    borderColor: 'border-l-blue-500',
  },
  {
    label: 'Segment floor',
    value: `€${floorPrice.toFixed(2)}/kg`,
    borderColor: 'border-l-zone-red',
  },
  {
    label: 'Segment target',
    value: `€${targetPrice.toFixed(2)}/kg`,
    borderColor: 'border-l-zone-green',
  },
  {
    label: 'vs Floor',
    value: `${((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1)}%`,
    zone: activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green',
    borderColor: activeAccount.price < floorPrice ? 'border-l-zone-red' : 'border-l-zone-amber',
    dominant: activeAccount.price < floorPrice,  // full red background when below floor
  },
]
```

Render each card:
```tsx
<div
  key={cfg.label}
  className={clsx(
    'card px-4 py-3 flex-1 border-l-4',
    cfg.borderColor,
    cfg.dominant && 'bg-zone-red text-white',   // override card bg when vs-Floor is critical
  )}
>
  <p className={clsx('text-xs mb-0.5', cfg.dominant ? 'text-red-100' : 'text-text-muted')}>{cfg.label}</p>
  <p className={clsx('text-lg font-semibold', cfg.dominant ? 'text-white' : (
    cfg.zone === 'red' ? 'text-zone-red' :
    cfg.zone === 'amber' ? 'text-zone-amber' :
    cfg.zone === 'green' ? 'text-zone-green' :
    'text-text-primary'
  ))}>{cfg.value}</p>
</div>
```

**IMPORTS:** Add `clsx` — `import { clsx } from 'clsx'`
**GOTCHA:** `border-l-4` requires Tailwind to know the color classes at build time. Use `border-l-blue-500` (standard Tailwind) and the custom `border-l-zone-red` / `border-l-zone-green` tokens. Confirm these work; if not, use inline `style={{ borderLeftColor: '#dc2626' }}` as fallback.
**VALIDATE:** Browser — KPI strip shows 4 cards with visible left border colors. When baker-klaas (price 4.20 < floor 4.57) is selected, "vs Floor" card has a solid red background with white text.

---

### TASK 2 — UPDATE `src/components/charts/SegmentationScatter.tsx` — Y-axis tighten + X-axis ticks

**IMPLEMENT:**

1. Change `YAxis` domain from `[3.0, 6.5]` to dynamic:
```tsx
const yMin = parseFloat((Math.min(floorPrice * 0.87, ...points.map(p => p.price)) - 0.1).toFixed(2))
const yMax = parseFloat((Math.max(targetPrice * 1.12, ...points.map(p => p.price)) + 0.1).toFixed(2))
```
Pass `domain={[yMin, yMax]}` to `<YAxis>`.

2. Change `XAxis` domain from `[100, 100000]` to `[150, 50000]` and add `ticks={[150, 250, 400, 700, 2000, 10000, 50000]}` to `<XAxis>`.

**PATTERN:** `SegmentationScatter.tsx` lines 105–125
**GOTCHA:** With log scale and custom ticks, pass `allowDataOverflow={false}` on XAxis to prevent clip issues.
**VALIDATE:** Chart Y-axis now shows range approximately €4.0–€5.5 for Mid-Market Benelux. X-axis shows 6+ tick marks.

---

### TASK 3 — UPDATE `src/components/charts/SegmentationScatter.tsx` — Downward-sloping floor/target curves + shaded band

**IMPLEMENT:**

Remove the two `<ReferenceLine>` components (lines 128–143).

Add imports: `Line, ReferenceArea` to the recharts import block.

Generate curve data points for floor and target lines. Use the same formula as `ProspectInput.tsx` (`price = base * (vol/320)^-0.04`). Generate 8 points across the visible X range:

```tsx
const CURVE_VOLUMES = [150, 250, 400, 700, 1200, 5000, 15000, 50000]

function priceCurve(base: number, volumes: number[]): { volume: number; price: number }[] {
  return volumes.map(v => ({ volume: v, price: parseFloat((base * Math.pow(v / 320, -0.04)).toFixed(3)) }))
}

const floorCurve = priceCurve(floorPrice, CURVE_VOLUMES)
const targetCurve = priceCurve(targetPrice, CURVE_VOLUMES)
```

Render as two `<Line>` components (NOT `<Scatter>`). Add them BEFORE the main `<Scatter>`:

```tsx
<Line
  data={floorCurve}
  dataKey="price"
  stroke="#dc2626"
  strokeDasharray="5 4"
  strokeWidth={1.5}
  dot={false}
  isAnimationActive={false}
  label={false}
/>
<Line
  data={targetCurve}
  dataKey="price"
  stroke="#059669"
  strokeDasharray="5 4"
  strokeWidth={1.5}
  dot={false}
  isAnimationActive={false}
  label={false}
/>
```

For the shaded band between floor and target — recharts `ReferenceArea` only supports horizontal bands (y1/y2 fixed). Instead, render a custom SVG overlay. Add a `customized` prop to `ScatterChart` OR use a `<Customized>` component inside the chart:

```tsx
// Inside ScatterChart, after Line components:
<Customized
  component={({ xAxisMap, yAxisMap }: { xAxisMap: Record<string, { scale: (v: number) => number }>, yAxisMap: Record<string, { scale: (v: number) => number } }) => {
    const xScale = Object.values(xAxisMap)[0]?.scale
    const yScale = Object.values(yAxisMap)[0]?.scale
    if (!xScale || !yScale) return null
    // Build SVG polygon path between floorCurve and targetCurve (reversed)
    const topPoints = targetCurve.map(p => `${xScale(p.volume)},${yScale(p.price)}`).join(' ')
    const bottomPoints = [...floorCurve].reverse().map(p => `${xScale(p.volume)},${yScale(p.price)}`).join(' ')
    return (
      <polygon
        points={`${topPoints} ${bottomPoints}`}
        fill="#059669"
        fillOpacity={0.07}
        stroke="none"
      />
    )
  }}
/>
```

Add `Customized` to recharts imports.

**GOTCHA:** `ScatterChart` does not include `<Line>` by default — recharts' `ScatterChart` actually IS a `ComposedChart` variant that supports `<Line>`. If `Line` doesn't render, change `ScatterChart` → `ComposedChart` (also from recharts) — it supports `Scatter`, `Line`, and `Customized` simultaneously.
**IMPORTS:** `import { ..., Line, ComposedChart, Customized } from 'recharts'` — remove `ScatterChart` if switching to `ComposedChart`.
**VALIDATE:** Floor and target lines are now gently downward-sloping curves (not flat). A light green band is visible between them.

---

### TASK 4 — UPDATE `src/components/charts/SegmentationScatter.tsx` — Fix dot coloring + Baker Klaas leader line + label sizes

**IMPLEMENT:**

1. **Fix dot coloring** — In `CustomDot`, recompute zone at render time instead of using `payload.zone`:
```tsx
function CustomDot({ cx = 0, cy = 0, payload, activeAccountId, floorPrice, targetPrice }: CustomDotProps) {
  if (!payload) return null
  // Recompute zone from live floor/target — stale JSON zone field ignored
  const liveZone = payload.price < floorPrice ? 'red' : payload.price < targetPrice ? 'amber' : 'green'
  const fill = ZONE_FILL[liveZone] ?? '#6d6e71'
  ...
}
```

Add `floorPrice: number` and `targetPrice: number` to `CustomDotProps` interface.

Pass them through the `shape` prop:
```tsx
shape={(props: unknown) => (
  <CustomDot
    {...(props as CustomDotProps)}
    activeAccountId={activeAccountId}
    floorPrice={floorPrice}
    targetPrice={targetPrice}
  />
)}
```

2. **Baker Klaas leader line** — In `CustomDot`, when `isActive`, replace the offset text with an SVG group with a short leader line:
```tsx
{isActive && (
  <g>
    <line
      x1={cx + r + 2}
      y1={cy}
      x2={cx + 20}
      y2={cy - 10}
      stroke={fill}
      strokeWidth={1}
    />
    <text
      x={cx + 22}
      y={cy - 12}
      fontSize={11}
      fontWeight={600}
      fill={fill}
    >
      {payload.accountName}
    </text>
  </g>
)}
```

3. **Floor/Target labels** — Since we removed `ReferenceLine`, add custom right-edge labels inside the `Customized` component (or as a separate `Customized` component):

```tsx
// Inside the band polygon Customized component, also render labels:
const lastFloor = floorCurve[floorCurve.length - 1]
const lastTarget = targetCurve[targetCurve.length - 1]
return (
  <>
    <polygon ... />
    <text x={xScale(lastFloor.volume) + 6} y={yScale(lastFloor.price) + 4} fontSize={13} fontWeight={600} fill="#dc2626">
      Floor €{floorPrice.toFixed(2)}
    </text>
    <text x={xScale(lastTarget.volume) + 6} y={yScale(lastTarget.price) + 4} fontSize={13} fontWeight={600} fill="#059669">
      Target €{targetPrice.toFixed(2)}
    </text>
  </>
)
```

**GOTCHA:** The `Customized` component only works inside `ComposedChart`. Ensure Task 3's `ComposedChart` migration is done first.
**VALIDATE:** Baker Klaas dot (below floor, price 4.20) is RED (not amber). Leader line connects dot to label. Floor/Target labels at right edge are clearly readable at font size 13.

---

### TASK 5 — CREATE `src/components/segmentation/SegmentHealthPanel.tsx` — Segment health summary

**IMPLEMENT:**

New component that takes `activeSegmentId: string`, `points: SegmentationPoint[]`, `floorPrice: number`, `targetPrice: number` and renders a compact summary panel.

```tsx
'use client'

import type { SegmentationPoint } from '@/lib/data'

interface SegmentHealthPanelProps {
  segmentId: string
  segmentName: string
  points: SegmentationPoint[]
  floorPrice: number
  targetPrice: number
}

export function SegmentHealthPanel({ segmentId: _segmentId, segmentName, points, floorPrice, targetPrice }: SegmentHealthPanelProps) {
  // Filter to this segment only — use accountName deduplication
  const segmentPoints = points  // already pre-filtered by product; segment filtering is informational

  const count = segmentPoints.length
  const yearlyVolume = segmentPoints.reduce((sum, p) => sum + p.volume * 12, 0)

  // Average margin proxy: (price - floor) / price * 100
  const avgMargin = segmentPoints.reduce((sum, p) => sum + ((p.price - floorPrice) / p.price * 100), 0) / (count || 1)

  const aboveTarget = segmentPoints.filter(p => p.price >= targetPrice).length
  const inBand      = segmentPoints.filter(p => p.price >= floorPrice && p.price < targetPrice).length
  const belowFloor  = segmentPoints.filter(p => p.price < floorPrice).length

  const abovePct  = Math.round((aboveTarget / count) * 100) || 0
  const inBandPct = Math.round((inBand / count) * 100) || 0
  const belowPct  = Math.round((belowFloor / count) * 100) || 0

  return (
    <div className="card px-4 py-3 flex items-center gap-6 flex-wrap">
      {/* Segment description */}
      <div className="min-w-0">
        <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">Segment</p>
        <p className="text-sm font-semibold text-text-primary">{segmentName}</p>
      </div>

      <div className="h-8 w-px bg-border-default shrink-0" />

      {/* Stats */}
      {[
        { label: 'Account-products', value: count.toString() },
        { label: 'Yearly volume', value: `${(yearlyVolume / 1000).toFixed(0)}k kg` },
        { label: 'Avg margin proxy', value: `${avgMargin.toFixed(1)}%` },
      ].map(({ label, value }) => (
        <div key={label} className="shrink-0">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-text-primary">{value}</p>
        </div>
      ))}

      <div className="h-8 w-px bg-border-default shrink-0" />

      {/* Distribution bar */}
      <div className="flex-1 min-w-48">
        <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1.5">Distribution</p>
        <div className="flex h-4 rounded overflow-hidden gap-px">
          {abovePct > 0  && <div className="bg-zone-green" style={{ width: `${abovePct}%` }} title={`Above target: ${abovePct}%`} />}
          {inBandPct > 0 && <div className="bg-zone-amber" style={{ width: `${inBandPct}%` }} title={`In-band: ${inBandPct}%`} />}
          {belowPct > 0  && <div className="bg-zone-red" style={{ width: `${belowPct}%` }} title={`Below floor: ${belowPct}%`} />}
        </div>
        <div className="flex gap-3 mt-1 text-[9px] text-text-muted">
          <span><span className="text-zone-green font-medium">{abovePct}%</span> above target</span>
          <span><span className="text-zone-amber font-medium">{inBandPct}%</span> in band</span>
          <span><span className="text-zone-red font-medium">{belowPct}%</span> below floor</span>
        </div>
      </div>
    </div>
  )
}
```

**VALIDATE:** Component renders without errors with `points` from `getSegmentationForProduct('milk-couverture')`.

---

### TASK 6 — UPDATE `src/app/segmentation/page.tsx` — Insert SegmentHealthPanel

**IMPLEMENT:**

1. Import: `import { SegmentHealthPanel } from '@/components/segmentation/SegmentHealthPanel'`

2. In the single-view branch (after the KPI strip div, before the chart card), insert:
```tsx
{activeAccount && (
  <SegmentHealthPanel
    segmentId={activeAccount.segmentId}
    segmentName={activeAccount.segment}
    points={points}
    floorPrice={floorPrice}
    targetPrice={targetPrice}
  />
)}
```

**VALIDATE:** Panel appears between KPI strip and scatter chart showing segment name, count, volume, margin proxy, and color distribution bar.

---

### TASK 7 — UPDATE `src/components/cpq/PriceBand.tsx` — Prominent net price marker + escalation zone labels

**IMPLEMENT:**

The component currently receives only `listPrice, floorPrice, targetPrice, netPrice`. Add `escalationThresholds` and `tierDiscountPct` props so zone labels can be computed. Actually, to keep it simple, just compute the zone label widths directly from the already-available `targetPct` / `floorPct`.

Update props interface:
```tsx
interface PriceBandProps {
  listPrice: number
  floorPrice: number
  targetPrice: number
  netPrice: number
}
```
(No prop change needed — zones are derived from existing prices.)

Changes to the band container:

1. **Net price on marker** — Replace the thin `w-1` indicator div with a visible triangle + price label:
```tsx
{/* Price indicator — triangle marker with price label */}
<div
  className="absolute top-0 bottom-0 flex flex-col items-center"
  style={{ left: `calc(${netPct}% - 12px)`, width: 24, transition: 'left 300ms' }}
>
  {/* Triangle pointing down */}
  <div className={`w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent ${
    zone === 'red' ? 'border-t-zone-red' : zone === 'amber' ? 'border-t-zone-amber' : 'border-t-zone-green'
  }`} />
  {/* Vertical stem */}
  <div className={`flex-1 w-0.5 ${
    zone === 'red' ? 'bg-zone-red' : zone === 'amber' ? 'bg-zone-amber' : 'bg-zone-green'
  }`} />
</div>
```

Add the net price above the band container (not inside it, to avoid overflow):
```tsx
{/* Net price floating above indicator */}
<div
  className="relative h-5 mb-0.5"
>
  <span
    className={`absolute text-xs font-bold transition-all duration-300 -translate-x-1/2 ${
      zone === 'red' ? 'text-zone-red' : zone === 'amber' ? 'text-zone-amber' : 'text-zone-green'
    }`}
    style={{ left: `${netPct}%` }}
  >
    €{netPrice.toFixed(2)}
  </span>
</div>
```

2. **Escalation zone labels inside band** — Add text labels centered within each color zone:

Compute zone center positions:
```tsx
const greenCenter = targetPct / 2          // center of green zone (0 → targetPct)
const amberCenter = targetPct + (floorPct - targetPct) / 2   // center of amber zone
const redCenter = floorPct + (100 - floorPct) / 2            // center of red zone
```

Inside the band container (after zone divs, before ticks):
```tsx
{/* Escalation zone labels */}
{[
  { label: 'Rep', left: greenCenter, color: 'text-zone-green/70' },
  { label: 'Manager', left: amberCenter, color: 'text-zone-amber/70' },
  { label: 'Director', left: redCenter, color: 'text-zone-red/70' },
].map(({ label, left, color }) => (
  <span
    key={label}
    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[9px] font-semibold pointer-events-none select-none ${color}`}
    style={{ left: `${left}%` }}
  >
    {label}
  </span>
))}
```

**GOTCHA:** The band `overflow-hidden` clips content — ensure escalation labels are inside the band div but use `opacity-70` text so they don't overwhelm the indicator.
**VALIDATE:** Price band shows "Rep | Manager | Director" text in the green/amber/red zones. Current net price is shown as a label above a triangle marker that moves with the slider.

---

### TASK 8 — UPDATE `src/app/cpq/page.tsx` — Discount section overhaul

**IMPLEMENT:**

Locate the discount section (lines 138–166). Make these changes:

1. **Tier chip label** — Line 141–143, change chip text:
```tsx
{/* Before */}
{account?.volume?.toLocaleString()} kg/mo
{/* After */}
Tier 2 — auto-applied at −{tierDiscountPct}%
```

2. **Rename label** — Line 148, change `"Deal discount / uplift"` to `"Rep adjustment"` and add sub-label:
```tsx
<span className="text-text-secondary flex flex-col">
  Rep adjustment
  <span className="text-[10px] text-text-muted">Allowed: −10% to +20%</span>
</span>
```

3. **Floating value label + slider track gradient** — Replace the current `<input type="range">` + static `<span>` with:

```tsx
<div className="flex flex-col items-end gap-1">
  {/* Floating value above thumb */}
  <div className="relative w-32 h-4">
    <span
      className={`absolute text-xs font-semibold -translate-x-1/2 transition-all duration-150 ${
        dealDiscountPct < 0 ? 'text-zone-red' : dealDiscountPct > 0 ? 'text-zone-green' : 'text-text-primary'
      }`}
      style={{ left: `${((dealDiscountPct - (-10)) / 30) * 100}%` }}
    >
      {dealDiscountPct > 0 ? `+${dealDiscountPct}` : dealDiscountPct}%
    </span>
  </div>
  {/* Slider with gradient track */}
  <div className="relative w-32">
    {/* Gradient track underlay */}
    <div
      className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 rounded-full pointer-events-none"
      style={{ background: 'linear-gradient(to right, #059669, #eb8c00 40%, #dc2626 75%)' }}
    />
    <input
      type="range"
      min={-10}
      max={20}
      step={0.5}
      value={dealDiscountPct}
      onChange={e => setDealDiscountPct(parseFloat(e.target.value))}
      className="relative w-full accent-pwc-orange appearance-none bg-transparent"
    />
    {/* Center notch at 0% */}
    <div
      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-text-muted/60 pointer-events-none rounded-full"
      style={{ left: `${((0 - (-10)) / 30) * 100}%` }}
    />
  </div>
</div>
```

4. **Headroom label** — Add below the slider div, inside the deal discount row:
```tsx
{escalationLevel === 'none' && dealDiscountPct < 0 && (
  <p className="text-[10px] text-text-muted mt-1 text-right w-full">
    {(thresholds.rep + dealDiscountPct).toFixed(1)}% before Rep approval required
  </p>
)}
{escalationLevel === 'rep' && (
  <p className="text-[10px] text-zone-amber mt-1 text-right w-full">
    {(thresholds.manager + dealDiscountPct).toFixed(1)}% before Manager approval
  </p>
)}
```

5. **Combined effective discount row** — Add between the slider section and `<PriceBand>`:
```tsx
<div className="flex items-center justify-between text-xs pt-2 border-t border-border-default">
  <span className="text-text-muted">Combined effective discount</span>
  <span className="font-semibold text-text-primary">
    Tier (−{tierDiscountPct}%) + Rep ({dealDiscountPct >= 0 ? '+' : ''}{dealDiscountPct}%) ={' '}
    <span className={dealDiscountPct < 0 ? 'text-zone-red' : 'text-zone-green'}>
      {(-(tierDiscountPct) + dealDiscountPct).toFixed(1)}%
    </span>
  </span>
</div>
```

**GOTCHA:** The `appearance-none` on the range input will remove the default thumb — the gradient track div handles the visual but the thumb may disappear on some browsers. Use `accent-pwc-orange` (already set) and drop `appearance-none` if the thumb vanishes; just keep the gradient track as a decorative overlay.
**VALIDATE:** Slider shows gradient track (green left → red right). Value label floats above the thumb and moves with it. 0% position has a visible notch. Headroom text updates as slider moves.

---

### TASK 9 — UPDATE `src/components/cpq/EscalationBanner.tsx` — Justification textarea on all levels

**IMPLEMENT:**

Move the `<textarea>` outside the `{level === 'rep' && ...}` guard — add it to all escalation levels:

```tsx
{/* Before — only at rep level */}
{level === 'rep' && (
  <textarea ... />
)}

{/* After — show at all levels */}
{level !== 'none' && (
  <textarea
    placeholder="Add deal justification (required)..."
    rows={2}
    className="text-xs border border-border-default rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-pwc-orange w-48 shrink-0"
  />
)}
```

**VALIDATE:** Textarea appears when slider crosses rep (5%), manager (10%), or director (15%) discount thresholds.

---

### TASK 10 — UPDATE `src/components/cpq/MarginBridge.tsx` — Fix formula + bar scale + CoGS bar + GM label

**IMPLEMENT:**

1. **Fix internal formula** (line 10) — still uses old sign convention:
```tsx
// Before
const afterDeal = afterTier * (1 - dealDiscountPct / 100)
// After — match the fix already applied in page.tsx
const afterDeal = afterTier * (1 + dealDiscountPct / 100)
```

2. **Fix Deal label** (line 17) — update to match new semantics (negative = discount, positive = uplift):
```tsx
// Before
label: `Deal ${dealDiscountPct >= 0 ? (dealDiscountPct === 0 ? '0%' : `−${dealDiscountPct}%`) : `+${Math.abs(dealDiscountPct)}%`}`
// After
label: dealDiscountPct === 0 ? 'Deal 0%' : dealDiscountPct < 0 ? `Deal ${dealDiscountPct}%` : `Deal +${dealDiscountPct}%`
```

3. **Fix Deal step isPositive** (line 17):
```tsx
// Before: isPositive: dealDiscountPct <= 0
// After: uplift (positive) adds to price → green bar; discount (negative) reduces → red bar
isPositive: dealDiscountPct >= 0
```

4. **Add CoGS step** — Insert after Net-Net step:
```tsx
const costBasis = netPrice * 0.75
const steps = [
  { label: 'List',    value: listPrice,           isPositive: true,  isFinal: false },
  { label: `Tier −${tierDiscountPct}%`, value: afterTier - listPrice, isPositive: false, isFinal: false },
  { label: dealLabel, value: afterDeal - afterTier, isPositive: dealDiscountPct >= 0, isFinal: false },
  { label: 'Net-Net', value: netPrice,             isPositive: true,  isFinal: false, isSubtotal: true },
  { label: 'CoGS',    value: -costBasis,           isPositive: false, isFinal: false },
  { label: 'Gross Margin', value: netPrice - costBasis, isPositive: true, isFinal: true },
]
```

5. **Fix bar scale** — The `h-20` container (80px) causes tiny bars. Change container to `h-32` and increase the maxVal scale:
```tsx
const maxVal = listPrice  // keep same, but increase container
<div className="flex items-end gap-1.5 h-32">
```

6. **GM label inside Gross Margin bar** — Remove the standalone `<div className="mt-2 text-xs text-text-muted">GM: ...</div>` and instead show it inside the final bar as an overlay:

Modify the bar render to check `isFinal` and add a centered label:
```tsx
<div className="flex flex-col items-center flex-1 gap-1" key={label}>
  <span className="text-[9px] text-text-muted font-medium">
    {isFinal ? `GM ${gmPct}%` : `€${Math.abs(value).toFixed(2)}`}
  </span>
  <div
    className={`w-full rounded-t transition-all duration-300 relative ${barClass}`}
    style={{ height: `${Math.max(4, heightPct)}%` }}
  />
</div>
```

**VALIDATE:** Margin bridge shows 6 bars (List, Tier, Deal, Net-Net, CoGS, Gross Margin). All bars have visible height. Gross Margin bar shows "GM XX.X%" as its label.

---

### TASK 11 — UPDATE `src/components/cpq/ScenarioComparison.tsx` — Per-card state, Apply button, dynamic recommended, red chip

**IMPLEMENT:**

Move per-card discount state into the component and add `onApply` callback:

```tsx
interface ScenarioComparisonProps {
  scenarios: Scenario[]
  activeDiscountPct: number
  onApply: (discountPct: number) => void
}
```

Add `useState` for per-card overrides:
```tsx
const [cardOverrides, setCardOverrides] = useState<Record<string, number>>({})
```

For each card, compute effective values using the override if present:
```tsx
const effectivePct = cardOverrides[s.label] ?? s.discountPct
// Recompute netPrice and GM from effectivePct for cards that have overrides
// Use a simple linear approximation consistent with cpq/page.tsx
```

Actually, for simplicity (and to avoid prop-drilling the full price calculation), pass a `baseAfterTier` prop from the parent so cards can compute their own net prices:

Update props:
```tsx
interface ScenarioComparisonProps {
  scenarios: Scenario[]
  activeDiscountPct: number
  baseAfterTier: number          // afterTier price, so cards can compute their own net
  onApply: (discountPct: number) => void
}
```

Card render:
```tsx
const effectivePct = cardOverrides[s.label] ?? s.discountPct
const effectiveNetPrice = baseAfterTier * (1 + effectivePct / 100)
// Approximate GM — use a lookup or linear interp
const effectiveGM = s.grossMarginPct + (effectivePct - s.discountPct) * 0.3  // rough 0.3% GM per 1% price

return (
  <div key={s.label} className={clsx(
    'flex-1 rounded-xl border-2 p-4 transition-all',
    styles.border,
    s.isRecommended ? 'ring-2 ring-pwc-orange bg-orange-50 border-pwc-orange' : '',
    isActive ? 'shadow-md' : 'opacity-90',
  )}>
    {s.isRecommended && (
      <div className="...">★ Recommended</div>
    )}

    {/* Per-card mini slider */}
    <input
      type="range"
      min={-10}
      max={20}
      step={0.5}
      value={effectivePct}
      onChange={e => setCardOverrides(prev => ({ ...prev, [s.label]: parseFloat(e.target.value) }))}
      className="w-full accent-pwc-orange mt-1 mb-2"
    />

    <p className={`text-2xl font-bold ${styles.text}`}>
      €{effectiveNetPrice.toFixed(2)}<span className="text-sm font-normal text-text-muted">/kg</span>
    </p>

    <div className="flex items-center gap-2 mt-2">
      <span className={styles.badge}>
        {effectivePct > 0 ? `+${effectivePct}%` : effectivePct < 0 ? `${effectivePct}%` : 'Flat'}
      </span>
      <span className="text-xs text-text-muted">GM {effectiveGM.toFixed(1)}%</span>
    </div>

    {/* Verdict — red chip for below-floor warnings */}
    {s.zone === 'red' ? (
      <span className="inline-block mt-2 px-2 py-0.5 bg-zone-red text-white text-[10px] font-semibold rounded-full">
        {s.verdict}
      </span>
    ) : (
      <p className={`text-xs mt-2 ${styles.text}`}>{s.verdict}</p>
    )}

    {/* Apply button */}
    <button
      onClick={() => onApply(effectivePct)}
      className="mt-3 w-full text-xs py-1.5 rounded-lg border border-pwc-orange text-pwc-orange-dark font-medium hover:bg-pwc-orange/10 transition-colors"
    >
      Apply
    </button>
  </div>
)
```

**UPDATE `src/app/cpq/page.tsx`** — Pass new props to `ScenarioComparison`:
```tsx
const baseAfterTier = useMemo(() => listPrice * (1 - tierDiscountPct / 100), [listPrice, tierDiscountPct])

<ScenarioComparison
  scenarios={scenarios}
  activeDiscountPct={dealDiscountPct}
  baseAfterTier={baseAfterTier}
  onApply={(pct) => setDealDiscountPct(pct)}
/>
```

**VALIDATE:** Each scenario card has a mini slider. Changing a card slider updates that card's price and GM independently. Clicking "Apply" snaps the main slider to that discount. Recommended card has orange border and light orange background. "Below floor" verdict shows as a red pill chip.

---

### TASK 12 — UPDATE `src/components/cpq/WinProbSignal.tsx` + `EoRSignal.tsx` — Larger display

**IMPLEMENT:**

In `WinProbSignal.tsx`, change `text-3xl` → `text-5xl` on the win rate number:
```tsx
<span className={`text-5xl font-bold ...`}>{winRate}%</span>
```

In `EoRSignal.tsx`, change `text-3xl` → `text-4xl` on the score:
```tsx
<span className={`text-4xl font-bold ...`}>{score.toFixed(1)}</span>
```

Also add a mini risk score bar below the top risk note in `EoRSignal`:
```tsx
{topRisk && (
  <div className="mb-2">
    <p className="text-[10px] text-text-muted">Top risk: <span className="font-medium text-text-primary">{topRisk.name}</span></p>
    <div className="flex items-center gap-2 mt-0.5">
      <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
        <div className="h-full bg-zone-red rounded-full" style={{ width: `${topRisk.score * 10}%` }} />
      </div>
      <span className="text-[10px] text-text-muted">{topRisk.score}/10</span>
    </div>
    <p className="text-[10px] text-text-muted mt-0.5">{topRisk.driverNote}</p>
  </div>
)}
```

**VALIDATE:** Win Probability percentage is large and immediately readable. EoR score is large with a risk bar below it.

---

### TASK 13 — UPDATE `src/app/cpq/page.tsx` — Reposition Win Prob + EoR above Scenario Comparison

**IMPLEMENT:**

In the page layout (lines 192–203), move the `grid grid-cols-2` Win Prob + EoR section to appear BEFORE the Scenario Comparison section:

```tsx
{/* Win Probability + EoR signals — above scenarios for visibility */}
<div className="grid grid-cols-2 gap-4">
  <WinProbSignal productId={productId} currentPrice={netPrice} />
  <EoRSignal accountId={accountId} />
</div>

{/* Three-scenario comparison */}
<div className="card p-4">
  <h3 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">Scenario Comparison</h3>
  <ScenarioComparison ... />
</div>

{/* Margin bridge */}
<div className="card p-4">
  ...
</div>
```

**VALIDATE:** Win Probability and EoR panels are visible without scrolling (above the scenario cards). Win Probability updates live as the main slider moves.

---

### TASK 14 — CREATE `src/components/cpq/DealContextPanel.tsx` — Account + SKU context

**IMPLEMENT:**

```tsx
'use client'

interface DealContextPanelProps {
  accountName: string
  segment: string
  volume: number
  lastQuotedPrice: number
  listPrice: number
  floorPrice: number
  targetPrice: number
  currentPrice: number
  tierDiscountPct: number
}

export function DealContextPanel({
  accountName, segment, volume, lastQuotedPrice,
  listPrice, floorPrice, targetPrice, currentPrice, tierDiscountPct,
}: DealContextPanelProps) {
  const segmentPosition = currentPrice < floorPrice ? 'Below floor' : currentPrice < targetPrice ? 'In-band' : 'Above target'
  const posZone = currentPrice < floorPrice ? 'red' : currentPrice < targetPrice ? 'amber' : 'green'
  const cogsApprox = currentPrice * 0.75

  return (
    <div className="card p-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
      {/* Account */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wide">Account</p>
        <p className="font-semibold text-text-primary">{accountName}</p>
        <p className="text-text-muted">{segment} · {volume.toLocaleString()} kg/mo</p>
      </div>
      <div className="h-8 w-px bg-border-default" />
      {/* Account context */}
      {[
        { label: 'Last quoted', value: `€${lastQuotedPrice.toFixed(2)}/kg` },
        { label: 'Payment terms', value: 'Net 30' },
        { label: 'Contract tier', value: `Tier ${tierDiscountPct >= 10 ? '3' : tierDiscountPct >= 5 ? '2' : '1'}` },
        { label: 'Strategic flag', value: volume >= 1000 ? '★ Key Account' : 'Standard' },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="font-medium text-text-primary">{value}</p>
        </div>
      ))}
      <div className="h-8 w-px bg-border-default" />
      {/* SKU context */}
      {[
        { label: 'List price', value: `€${listPrice.toFixed(2)}/kg` },
        { label: 'CoGS (approx)', value: `€${cogsApprox.toFixed(2)}/kg` },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="font-medium text-text-primary">{value}</p>
        </div>
      ))}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wide">Segment position</p>
        <span className={`font-semibold ${
          posZone === 'red' ? 'text-zone-red' : posZone === 'amber' ? 'text-zone-amber' : 'text-zone-green'
        }`}>{segmentPosition}</span>
      </div>
    </div>
  )
}
```

**UPDATE `src/app/cpq/page.tsx`** — Insert `<DealContextPanel>` between `<FilterBar>` and the quote card:

```tsx
import { DealContextPanel } from '@/components/cpq/DealContextPanel'

// Inside the page, after FilterBar and before the main content div:
{mounted && account && (
  <DealContextPanel
    accountName={account.name}
    segment={account.segment}
    volume={account.volume}
    lastQuotedPrice={quoteBase?.currentPrice as number ?? account.price}
    listPrice={listPrice}
    floorPrice={floorPrice}
    targetPrice={targetPrice}
    currentPrice={netPrice}
    tierDiscountPct={tierDiscountPct}
  />
)}
```

Wait — DealContextPanel needs to go inside the `FadeWrapper`. Insert it at the top of the main content `<div className="p-6 flex flex-col gap-5">`.

**VALIDATE:** A compact context strip appears at the top of the CPQ page showing account, last quoted price, payment terms, contract tier, CoGS estimate, and segment position badge.

---

## TESTING STRATEGY

### Manual Browser Validation (Primary)

This is a demo tool with no unit test suite. All validation is manual.

### Segmentation Page Checklist

- [ ] Select Baker Klaas + Milk Couverture: "vs Floor" card has red background + white text (4.20 < 4.57)
- [ ] Select Confiserie Lambert: "vs Floor" card is green (5.10 > 4.85)
- [ ] KPI cards have visible left border colors (blue / red / green)
- [ ] Segment health panel shows count=10, yearly volume, distribution bar with red portion for Baker Klaas
- [ ] Y-axis shows range ~€4.0–€5.5 (not 3.0–6.5)
- [ ] X-axis shows ≥5 tick labels
- [ ] Floor and target lines are gently downward-sloping (not flat)
- [ ] Light green band is visible between floor and target curves
- [ ] Baker Klaas dot (price 4.20) is RED, not amber
- [ ] Baker Klaas has a leader line connecting dot to label
- [ ] Floor/Target labels on right edge are clearly readable

### CPQ Page Checklist

- [ ] Deal Context Panel visible at top: account, last quoted, CoGS, segment position
- [ ] Tier chip shows "Tier 2 — auto-applied at −5%" (not kg/mo)
- [ ] Label shows "Rep adjustment" with sub-label range
- [ ] Slider at −5% → net price DECREASES; slider at +4% → net price INCREASES
- [ ] Value label floats above thumb and moves with slider position
- [ ] 0% center notch is visible on slider track
- [ ] Gradient track: green on left → red on right
- [ ] Headroom label shows "X.X% before Rep/Manager approval"
- [ ] Combined effective discount row shows formula
- [ ] Price band: Triangle marker with net price label visible, moves with slider
- [ ] Price band: "Rep / Manager / Director" zone labels visible inside band
- [ ] Price band: Target on left (green zone), Floor toward right (red zone)
- [ ] Escalation banner shows justification textarea at ALL escalation levels, not just rep
- [ ] Margin bridge shows 6 bars with visible heights; "GM XX%" inside Gross Margin bar
- [ ] Win Prob and EoR panels appear ABOVE scenario cards; numbers are large
- [ ] Scenario cards each have a mini slider, Apply button, and independent price/GM
- [ ] Recommended card has orange border + light orange background
- [ ] "Below floor" verdict in Grant 5% scenario card is a red chip, not plain text
- [ ] Apply button snaps main slider to that scenario's discount

---

## VALIDATION COMMANDS

```bash
# Level 1 — TypeScript type check
cd "C:\Users\Vadim Gerasimov\POCs\FoS_Demo"
npx tsc --noEmit

# Level 2 — Dev server (watch for build errors)
npm run dev

# Level 3 — Production build
npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] All Segmentation KPI strip improvements implemented (colored borders, dominant vs-Floor card)
- [ ] Scatter chart Y-axis tightened, X-axis has 5+ ticks, floor/target are curves not flat lines
- [ ] Shaded band between floor/target visible
- [ ] Dot coloring recomputed from live floor/target (no stale amber dots below floor)
- [ ] Segment Health Panel present with distribution bar
- [ ] CPQ price band has net price label + escalation zone labels
- [ ] Slider shows gradient, floating value, center notch, headroom label
- [ ] Combined effective discount readout visible
- [ ] Margin bridge shows 6 bars with visible heights; CoGS bar present
- [ ] Escalation textarea present at all levels
- [ ] Scenario cards are independently adjustable with Apply buttons
- [ ] Recommended card visually prominent
- [ ] Win Prob + EoR above scenarios, large numbers
- [ ] Deal Context Panel present at top of CPQ
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds

---

## NOTES

### Key Architecture Decisions

1. **ScatterChart → ComposedChart**: Recharts `ScatterChart` does not support `<Line>` children. Switch to `ComposedChart` which supports `Scatter`, `Line`, and `Customized` simultaneously without API changes.

2. **Zone recompute in CustomDot**: The `zone` field in `segmentation.json` is pre-baked and can be stale. Always recompute from the live `floorPrice`/`targetPrice` passed as props. This is critical for the dot coloring fix.

3. **MarginBridge formula**: `MarginBridge.tsx` has its own internal `afterDeal` calculation on line 10 that uses the OLD sign convention `(1 - dealDiscountPct / 100)`. This MUST be fixed to `(1 + dealDiscountPct / 100)` in Task 10, independent of the fix already applied in `cpq/page.tsx`.

4. **Per-card scenario state**: The `ScenarioComparison` component gains internal state for per-card overrides. The parent still controls the main `dealDiscountPct` and the Apply button writes back to it via `onApply` callback.

5. **`border-l-4` with custom tokens**: Tailwind purges unused classes. The `border-l-blue-500` is a standard class and safe. `border-l-zone-red` and `border-l-zone-green` are custom tokens — if they don't generate `border-l-*` utilities, use `style={{ borderLeftColor: '#dc2626' }}` as a fallback.

6. **Floating slider label position**: The `left` percentage is computed as `((value - min) / (max - min)) * 100`. For min=−10, max=20, range=30: `((dealDiscountPct + 10) / 30) * 100`.

### Data Notes

- `segmentation.json` zone values are NOT reliable — always recompute from floor/target
- `accounts.json` has `floor` and `target` per account — use these as the authoritative source
- `quotes.json` has pre-baked scenarios — used for reference but CPQ page computes live prices from the slider
- Payment terms, strategic flag are not in the data — use plausible defaults in DealContextPanel (Net 30, Tier by discount level)

---

**Confidence Score: 8/10**

The plan covers all specified improvements with exact file paths, line references, and code patterns.
The main implementation risk is the `ScatterChart → ComposedChart` migration (Task 3) — recharts
`Customized` component typing can be finicky. If `Customized` causes type errors, use a custom
`shape` prop on a hidden `Scatter` with one point to render the SVG overlay instead.
