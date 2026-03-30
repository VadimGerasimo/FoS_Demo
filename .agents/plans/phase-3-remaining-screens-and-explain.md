# Feature: Phase 3 — Remaining Screens + Full AI Explain

The following plan is complete and self-contained. Read every referenced file before implementing. Pay close attention to existing Tailwind token names, the AppContext shape, Recharts patterns from SegmentationScatter, and the component structure in Deal Pricing.

## Feature Description

Phase 3 completes the four placeholder screens (Waterfall, PVM, Win/Loss, Ease of Realization), adds the global "Explain what I see" AI feature across all seven screens, adds Win Probability and EoR signal cards to the Deal Pricing page, and wires up the remaining visual types in DynamicRightPanel for Chat. After Phase 3, every screen is fully functional and every page has AI explain capability.

## User Story

As a PwC demo presenter,
I want all seven screens populated with live charts and an AI explain button on every page,
So that the full demo is navigable in any direction, secondary scenarios are credible, and the audience sees AI-driven insight everywhere — not just in Chat.

## Problem Statement

Four screens currently render placeholder text. The Chat right panel falls back to "Full chart view available in Phase 3" for waterfall/pvm/winLoss/eor. There is no `/api/explain` route. There are no ExplainButton or ExplainPanel components. Deal Pricing lacks Win Probability and EoR signal cards.

## Solution Statement

Build four chart components (WaterfallChart, PVMBridge, WinProbabilityCurve, EoRDimensions), replace the four placeholder pages with full implementations, create the `/api/explain` API route, build ExplainButton + ExplainPanel shared components and mount them on all seven pages, add WinProbSignal + EoRSignal to Deal Pricing, and update DynamicRightPanel to render the new chart types.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: 4 screen pages, 4 chart components, 2 shared components, 2 Deal Pricing components, 1 API route, DynamicRightPanel, ChatPage
**Dependencies**: recharts (already installed), openai (already installed), lucide-react (already installed)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — YOU MUST READ THESE BEFORE IMPLEMENTING

- `src/components/charts/SegmentationScatter.tsx` — **The Recharts pattern for all new chart components.** 'use client', ResponsiveContainer wrapper, typed props interface, custom tooltip pattern, Cell colouring.
- `src/components/deal-pricing/MarginBridge.tsx` — **Waterfall-style bar rendering pattern** (stacked bars with spacer concept, height proportional to maxVal, Tailwind zone color classes).
- `src/components/deal-pricing/ScenarioComparison.tsx` — Card + badge + zone style pattern for new signal cards.
- `src/components/deal-pricing/EscalationBanner.tsx` — State-animated component pattern; shows how `useEffect` is used for timed state transitions.
- `src/app/chat/page.tsx` — Shows RightPanelState shape and how DynamicRightPanel receives data. **Must update** to also pass `accountId` and `productId` in RightPanelState.
- `src/components/chat/DynamicRightPanel.tsx` (lines 62–97) — The switch block that needs new cases for waterfall/pvm/winLoss/eor.
- `src/app/deal-pricing/page.tsx` — Full Deal Pricing page structure. WinProbSignal and EoRSignal cards go after the ScenarioComparison card.
- `src/app/segmentation/page.tsx` — Reference for how a fully implemented screen page is structured: 'use client', useAppContext, inline stats row, .card wrapper around chart, toolbar row.
- `src/lib/data.ts` — **All types and data helpers.** Use these types and getters — do NOT reimport JSON directly in page files. Key getters: `getWaterfallForAccount(accountId, productId)`, `getPVMForAccount(accountId)`, `getWinLossForProduct(productId)`, `getEoRForAccount(accountId)`. Full dataset exports: `accounts`, `eorDataset`.
- `src/context/AppContext.tsx` — AppContext shape: `{ activeAccountId, activeProductId, activeVolume, setAccount, setProduct, setVolume }`.
- `src/app/globals.css` — Utility classes: `.card`, `.zone-badge-red/amber/green`, `.page-container`, `.page-title`.
- `tailwind.config.ts` — All colour tokens. Use exact names: `pwc-orange`, `zone-red`, `zone-amber`, `zone-green`, `zone-red-bg`, `zone-amber-bg`, `zone-green-bg`, `text-primary`, `text-secondary`, `text-muted`, `border-default`, `page-bg`, `card-bg`, `sidebar-bg`.
- `data/waterfall.json` — Waterfall data shape: `accountId`, `productId`, `layers[]` with `name`, `value`, `cumulative`, `isHighlighted?`.
- `data/pvm.json` — PVM data shape: `accountId`, `priorRevenue`, `volumeEffect`, `priceEffect`, `mixEffect`, `currentRevenue`, `products[]`.
- `data/win-loss.json` — Win/Loss shape: `productId`, `curve[]` ({price, winRate}), `cliffMin`, `cliffMax`, `optimalPrice`, `historicalQuotes[]` ({price, won}).
- `data/ease-of-realization.json` — EoR shape: `accountId`, `compositeScore`, `dimensions[]` ({name, score, driverNote}).
- `src/app/api/chat/route.ts` — **Mirror this pattern** for `/api/explain`. OpenAI client initialisation, API key check, try/catch, NextResponse.json.
- `data/chat-scenarios.json` — Shows `dataKey` format for waterfall (`"baker-klaas-milk-couverture"`) and pvm (`"schoko-retail"`). The DynamicRightPanel update must parse these.

### New Files to Create

- `src/components/charts/WaterfallChart.tsx` — Recharts ComposedChart waterfall for the Waterfall page and DynamicRightPanel
- `src/components/charts/PVMBridge.tsx` — Recharts ComposedChart PVM bridge for the PVM page and DynamicRightPanel
- `src/components/charts/WinProbabilityCurve.tsx` — Recharts ComposedChart win prob curve + historical scatter for Win/Loss page and DynamicRightPanel
- `src/components/charts/EoRDimensions.tsx` — Custom HTML/Tailwind dimension bars for EoR page and DynamicRightPanel
- `src/components/shared/ExplainButton.tsx` — Floating bottom-right sparkle button that triggers the explain flow
- `src/components/shared/ExplainPanel.tsx` — Slide-over right panel showing whatISee / whyItMatters / recommendedActions
- `src/components/deal-pricing/WinProbSignal.tsx` — Compact win probability card for Deal Pricing page
- `src/components/deal-pricing/EoRSignal.tsx` — Compact EoR score card for Deal Pricing page
- `src/app/api/explain/route.ts` — POST endpoint that calls gpt-4o with screen-aware system prompt

### Files to Update

- `src/app/waterfall/page.tsx` — Replace placeholder with full Waterfall implementation
- `src/app/pvm/page.tsx` — Replace placeholder with full PVM Bridge implementation
- `src/app/win-loss/page.tsx` — Replace placeholder with full Win/Loss implementation
- `src/app/ease-of-realization/page.tsx` — Replace placeholder with full EoR implementation
- `src/app/deal-pricing/page.tsx` — Add WinProbSignal + EoRSignal cards + ExplainButton
- `src/app/chat/page.tsx` — Add `accountId`/`productId` to RightPanelState; pass to DynamicRightPanel; add ExplainButton
- `src/app/segmentation/page.tsx` — Add ExplainButton
- `src/components/chat/DynamicRightPanel.tsx` — Add waterfall/pvm/winLoss/eor visual type cases; accept new `accountId`/`productId` props

---

## VISUAL DESIGN SPECIFICATIONS

### WaterfallChart — Confirmed Visual Design

Research from Vendavo, McKinsey-style pricing dashboards, and Recharts community confirms the following:

#### Bar Structure & Colours
```
List Price        Invoice Disc.    Net Invoice    Rebate          Payment Terms    Net-Net Price
┌──────────┐         ┌──────┐      ┌──────────┐   ┌──────────┐    ┌────────┐     ┌──────────┐
│          │         │      │      │          │   │⚠ ORANGE  │    │        │     │          │
│  GREEN   │         │ RED  │      │  DARK    │   │ BORDER   │    │  RED   │     │  DARK    │
│  #059669 │         │#dc26 │      │#323336   │   │ #eb8c00  │    │#dc2626 │     │#323336   │
└──────────┘─────────└──────┘──────└──────────┘───└──────────┘────└────────┘─────└──────────┘
  anchored    floating  floating   floating (sub)  floating        floating      anchored
  from 0                           from List−Disc  HIGHLIGHTED                   from 0
```

**Colour rules** (use hex inside Recharts Cell, use Tailwind classes in surrounding HTML):
- List Price (first anchor bar): `#059669` (zone-green)
- Deduction bars (Invoice Discount, Rebate, Payment Terms): `#dc2626` (zone-red)
- Highlighted bar (`isHighlighted: true` in JSON — Baker Klaas rebate): `#eb8c00` (pwc-orange) with `stroke="#eb8c00"` `strokeWidth={2}`
- Net Invoice Price (zero-value intermediate): **SKIP** — filter this layer out entirely (confirmed: intermediate zero-value anchors clutter the chart)
- Net-Net Price (final anchor bar): `rgb(50,51,54)` (sidebar-bg)

**Orange border for above-norm bars** (Cell prop):
```tsx
<Cell
  key={`cell-${i}`}
  fill={getFill(layer)}
  stroke={layer.isHighlighted ? '#eb8c00' : 'none'}
  strokeWidth={layer.isHighlighted ? 2.5 : 0}
/>
```

#### Floating Bar Data Transform (Confirmed Correct)
For the transparent spacer approach in Recharts — confirmed working, avoids `stackOffset="sign"` bug:
```
List Price:      spacer=0,           value=5.80  → bar from 0 to 5.80 (green)
Invoice Disc.:   spacer=5.22,        value=0.58  → bar from 5.22 to 5.80 (red, floating)
[Net Invoice Price: value=0 → SKIP]
Rebate:          spacer=4.45,        value=0.77  → bar from 4.45 to 5.22 (orange, highlighted)
Payment Terms:   spacer=4.20,        value=0.25  → bar from 4.20 to 4.45 (red)
Net-Net Price:   spacer=0,           value=4.20  → bar from 0 to 4.20 (dark, anchored)
```
**Key formula**: for deduction layers (value < 0): `spacer = layer.cumulative`, `barValue = Math.abs(layer.value)`

#### Value Labels on Bars
Use `<LabelList>` on the value `<Bar>` — NOT the spacer bar. Show `€{value}/kg` above each bar.
```tsx
<LabelList
  dataKey="value"
  position="top"
  offset={6}
  style={{ fontSize: 10, fill: '#6d6e71', fontWeight: 500 }}
  formatter={(v: number) => `€${v.toFixed(2)}`}
/>
```
**GOTCHA**: `LabelList position="top"` on a stacked bar renders above the value bar, not above the spacer+value combined height. This is actually what we want — the label appears directly above the coloured bar.

#### Summary Stats (below chart or in stats row above)
Show these as stat cards (using the existing `.card px-4 py-3 flex-1` pattern):
- **List Price**: €5.80/kg
- **Net-Net Price**: €4.20/kg (coloured by zone)
- **Total Deduction**: €1.60/kg (−27.6%)
- **Price Realization**: 72.4% = net-net / list price

#### Segment Norm Overlay (optional but recommended for Baker Klaas rebate)
Add an amber banner below the chart when the highlighted layer exists:
```tsx
<div className="flex items-center gap-2 mt-3 px-3 py-2 bg-zone-amber-bg border border-zone-amber/30 rounded-lg text-xs text-zone-amber">
  <AlertTriangle size={13} />
  Rebate is 9.2% — 5.1pts above the Mid-Market Benelux norm of 4.1%
</div>
```
The norm values are fixed for this demo (Baker Klaas rebate norm = 4.1%, actual = 9.2%).

---

### PVMBridge — Confirmed Visual Design

Research confirms the standard bridge structure and floating bar technique.

#### Bar Structure & Colours
```
Prior Period   Volume Effect   Price Effect   Mix Effect    Current Period
┌──────────┐   ┌─────────┐     (floating)    (floating)    ┌──────────┐
│          │   │  GREEN  │     ┌──────┐       ┌──────┐     │          │
│  DARK    │   │+€42k    │     │ RED  │       │ RED  │     │  DARK    │
│#323336   │   │#059669  │     │-€22k │       │-€19k │     │#323336   │
│          │   │         │     │#dc26 │       │#dc26 │     │          │
└──────────┘───└─────────┘─────└──────┘───────└──────┘─────└──────────┘
 anchored       floating         floating       floating      anchored
 from 0         UP               DOWN           DOWN          from 0
 €1,892k                      from €1,934k   from €1,912k   €1,893k
```

**Colour rules**:
- Prior Period (anchor): `rgb(50,51,54)` — sidebar-bg
- Volume Effect (positive here): `#059669` — zone-green
- Price Effect (negative here): `#dc2626` — zone-red
- Mix Effect (negative here): `#dc2626` — zone-red
- Current Period (anchor): `rgb(50,51,54)` — sidebar-bg
- Rule: always derive color from `effect >= 0 ? '#059669' : '#dc2626'`, never hardcode

#### Floating Bar Data Transform for NEGATIVE Effects (Critical)
When an effect is negative, the bar floats DOWN from the running total:
```
Running total after Volume:  1,934,000
Price Effect: -22,000
  → spacer = 1,934,000 + (-22,000) = 1,912,000  ← bottom of floating bar
  → barValue = abs(-22,000) = 22,000              ← bar height

Running total after Price:   1,912,000
Mix Effect: -19,000
  → spacer = 1,912,000 + (-19,000) = 1,893,000  ← bottom of floating bar
  → barValue = abs(-19,000) = 19,000

Running total after Mix:     1,893,000  = currentRevenue ✓
```

**General formula** — confirmed correct for both positive and negative effects:
```typescript
// For effect bars (not anchors):
spacer = effect >= 0
  ? runningTotal                     // positive: spacer at bottom, bar goes up
  : runningTotal + effect            // negative: spacer at lower bound, bar goes up to runningTotal
barValue = Math.abs(effect)
```

#### Value Labels on Bars
Show +/- sign explicitly:
```tsx
<LabelList
  dataKey="displayLabel"    // pre-computed string like "+€42k" or "−€22k"
  position="top"
  offset={6}
  style={{ fontSize: 10, fill: '#6d6e71', fontWeight: 600 }}
/>
```

Pre-compute `displayLabel` in the transform function:
```typescript
displayLabel: effect >= 0 ? `+€${(effect/1000).toFixed(0)}k` : `−€${(Math.abs(effect)/1000).toFixed(0)}k`
```

For anchor bars (Prior Period / Current Period), show the absolute value: `€${(value/1000).toFixed(0)}k`

#### AI Warning Banner
Shown **above the chart** (not below) for maximum visibility when `priceEffect < 0 && mixEffect < 0`:
```tsx
<div className="flex items-center gap-2 mb-3 px-3 py-2 bg-zone-amber-bg border border-zone-amber/30 rounded-lg text-xs text-zone-amber font-medium">
  <AlertTriangle size={13} />
  Price and mix are both negative — revenue growth is volume-driven only
</div>
```

#### Per-Product Table Column Order & Formatting
Standard consulting format confirmed: right-align all numeric columns.
```
Product        | Prior Rev  | Vol Effect  | Price Effect | Mix Effect  | Current Rev | Δ%
Dark Compound  | €1,254k    | +€88k       | −€32k        | −€13k       | €1,298k     | +3.5%
Milk Couverture| €638k      | −€46k       | +€10k        | −€6k        | €595k       | −6.8%
─────────────────────────────────────────────────────────────────────────────────────────────
Total          | €1,892k    | +€42k       | −€22k        | −€19k       | €1,893k     | +0.1%
```

- Currency: `€${(val/1000).toFixed(0)}k` for values ≥ 1000
- Effect columns: green text for positive, red text for negative
- Total row: `font-semibold bg-page-bg`

#### Summary Stat Cards (above chart, in stats row)
- **Prior Revenue**: €1,892k
- **Current Revenue**: €1,893k (zone coloured: green if > prior, red if < prior)
- **Net Change**: +€1k (+0.1%)
- **Primary Driver**: "Volume +€42k" — the largest absolute effect

---

## PATTERNS TO FOLLOW

### Component File Header Pattern
Every component file begins with `'use client'` (all new components are client components).

### Recharts Chart Component Pattern
```tsx
'use client'
import { ResponsiveContainer, ComposedChart, Bar, ... } from 'recharts'
import type { WaterfallItem } from '@/lib/data'   // always type from @/lib/data

interface MyChartProps {
  data: WaterfallItem
  // ...
}

export function MyChart({ data }: MyChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={transformed} margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
        {/* axes, bars, lines */}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
```

### Page Component Pattern (Client Screen)
```tsx
'use client'
import { useAppContext } from '@/context/AppContext'
import { accounts, products, getWaterfallForAccount } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExplainButton } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useState } from 'react'

export default function WaterfallPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  // ...
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      {/* content */}
      <ExplainButton screen="waterfall" keyMetrics={...} onResult={(r) => { setExplainResult(r); setExplainOpen(true) }} />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
```

### Zone Colour Classes (use these exact Tailwind tokens)
- Red: `text-zone-red`, `bg-zone-red-bg`, `border-zone-red/30`
- Amber: `text-zone-amber`, `bg-zone-amber-bg`, `border-zone-amber/30`
- Green: `text-zone-green`, `bg-zone-green-bg`, `border-zone-green/30`

### Card Pattern
```tsx
<div className="card p-4">
  <h3 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">Title</h3>
  {/* content */}
</div>
```

### Stats Row Pattern (from segmentation/page.tsx lines 69–91)
```tsx
<div className="flex gap-4">
  {[{ label: 'X', value: 'Y', zone: 'red' }, ...].map(({ label, value, zone }) => (
    <div key={label} className="card px-4 py-3 flex-1">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className={`text-lg font-semibold ${zone === 'red' ? 'text-zone-red' : ...}`}>{value}</p>
    </div>
  ))}
</div>
```

### Recharts Colour Literals
Do NOT use Tailwind classes inside SVG elements. Use hex values directly:
- `#dc2626` (zone-red), `#eb8c00` (zone-amber / pwc-orange), `#059669` (zone-green)
- `#939598` (text-muted), `#333333` (text-primary), `#6d6e71` (text-secondary)
- `#e7e7e8` (border-default), `#f5f5f5` (page-bg), `rgb(50,51,54)` (sidebar-bg)

---

## IMPLEMENTATION PLAN

### Phase A — Chart Components

Build all chart primitives first, with no page or routing dependencies.

### Phase B — API Route + Shared UI

Build `/api/explain`, `ExplainButton`, and `ExplainPanel`. No page dependencies.

### Phase C — Deal Pricing Signal Components

Build `WinProbSignal` and `EoRSignal`. Depend on data helpers only.

### Phase D — Screen Pages

Replace the four placeholder pages. Depend on chart components + ExplainButton/Panel.

### Phase E — Integration Updates

Update Deal Pricing page, ChatPage, DynamicRightPanel. Add ExplainButton to Segmentation and Chat pages.

---

## STEP-BY-STEP TASKS

### TASK 1: CREATE `src/components/charts/WaterfallChart.tsx`

**SEE**: "WaterfallChart — Confirmed Visual Design" section above for full colour spec, bar structure diagram, and label pattern.

**IMPLEMENT**: Recharts `BarChart` waterfall using transparent spacer bar + value bar stacked pattern. Do NOT use `ComposedChart` or `stackOffset="sign"` — both have known issues with negative values in Recharts.

**Data transformation** (filter out zero-value intermediate anchors like "Net Invoice Price"):
```typescript
interface WaterfallBarDatum {
  name: string
  spacer: number      // transparent offset bar height
  value: number       // visible coloured bar height (always positive)
  isFinal: boolean    // Net-Net Price anchor
  isStart: boolean    // List Price anchor
  isHighlighted: boolean
  originalCumulative: number  // for tooltip
}

function transformLayers(layers: WaterfallItem['layers']): WaterfallBarDatum[] {
  return layers
    .filter(l => !(l.value === 0 && l.name !== 'Net-Net Price'))  // drop zero-value intermediates
    .map(l => {
      if (l.name === 'List Price') {
        return { name: l.name, spacer: 0, value: l.value, isFinal: false, isStart: true, isHighlighted: false, originalCumulative: l.cumulative }
      }
      if (l.value === 0) {
        // Net-Net Price final bar: anchor at 0, height = cumulative
        return { name: l.name, spacer: 0, value: l.cumulative, isFinal: true, isStart: false, isHighlighted: false, originalCumulative: l.cumulative }
      }
      // Deduction bar: spacer = cumulative (lower bound of the floating bar), value = abs(deduction)
      return { name: l.name, spacer: l.cumulative, value: Math.abs(l.value), isFinal: false, isStart: false, isHighlighted: l.isHighlighted ?? false, originalCumulative: l.cumulative }
    })
}
```

**Colour function**:
```typescript
function getFill(d: WaterfallBarDatum): string {
  if (d.isStart) return '#059669'         // List Price — green
  if (d.isFinal) return 'rgb(50,51,54)'  // Net-Net Price — dark (sidebar-bg)
  if (d.isHighlighted) return '#eb8c00'  // Above-norm bar (Baker Klaas rebate) — orange
  return '#dc2626'                        // Deductions — red
}
```

**Props**:
```typescript
interface WaterfallChartProps {
  data: WaterfallItem
}
```

**Recharts structure** — use `BarChart` (not `ComposedChart`), two stacked `Bar` series:
```tsx
<ResponsiveContainer width="100%" height="100%">
  <BarChart data={chartData} margin={{ top: 24, right: 24, bottom: 40, left: 20 }} barCategoryGap="25%">
    <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" vertical={false} />
    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#939598' }} interval={0} angle={-20} textAnchor="end" height={50} />
    <YAxis tickFormatter={(v) => `€${v.toFixed(2)}`} tick={{ fontSize: 10, fill: '#939598' }} domain={[0, 'dataMax + 0.5']} />
    <Tooltip content={<CustomTooltip />} />
    {/* Invisible spacer — MUST come first */}
    <Bar dataKey="spacer" stackId="wf" fill="transparent" isAnimationActive={false} />
    {/* Visible coloured bar */}
    <Bar dataKey="value" stackId="wf" isAnimationActive={false} radius={[3, 3, 0, 0]}>
      {chartData.map((d, i) => (
        <Cell key={i} fill={getFill(d)} stroke={d.isHighlighted ? '#eb8c00' : 'none'} strokeWidth={d.isHighlighted ? 2.5 : 0} />
      ))}
      <LabelList dataKey="value" position="top" offset={6} style={{ fontSize: 10, fill: '#6d6e71', fontWeight: 500 }} formatter={(v: number) => `€${v.toFixed(2)}`} />
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**Custom Tooltip**: Show bar name, €/kg value, and the running cumulative:
```tsx
function CustomTooltip({ active, payload }: { active?: boolean; payload?: {payload: WaterfallBarDatum}[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-text-primary mb-1">{d.name}</p>
      <p className="text-text-secondary">Amount: <span className="font-medium text-text-primary">€{d.value.toFixed(2)}/kg</span></p>
      <p className="text-text-secondary">Cumulative: <span className="font-medium text-text-primary">€{d.originalCumulative.toFixed(2)}/kg</span></p>
    </div>
  )
}
```

**Highlighted bar banner** (rendered on the SCREEN PAGE, not inside this component): When `data.layers.some(l => l.isHighlighted)`, the page renders an amber callout below the chart. This component is chart-only — no banners inside it.

**IMPORTS**:
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import type { WaterfallItem } from '@/lib/data'
```

**VALIDATE**: `npx tsc --noEmit` passes. Baker Klaas waterfall visually shows: green List Price bar anchored at 0, two red floating bars, one orange floating bar (Rebate), red floating bar, dark Net-Net Price anchored at 0.

---

### TASK 2: CREATE `src/components/charts/PVMBridge.tsx`

**SEE**: "PVMBridge — Confirmed Visual Design" section above for full colour spec, bar structure diagram, floating bar formula, label format, and table layout.

**IMPLEMENT**: Recharts `BarChart` PVM bridge. Same transparent spacer technique as WaterfallChart. This component renders the chart, the AI warning banner (when applicable), and the per-product table.

**Data transformation** — the critical formula for negative effects:
```typescript
interface PVMBarDatum {
  name: string
  spacer: number       // transparent offset (bottom of floating bar)
  value: number        // bar height (always positive abs value)
  isNegative: boolean  // for colour
  isAnchor: boolean    // Prior Period or Current Period
  displayLabel: string // pre-computed "+€42k" or "−€22k" or "€1,892k"
}

function transformPVM(d: PVMData): PVMBarDatum[] {
  const fmt = (v: number) =>
    Math.abs(v) >= 1000
      ? `€${(Math.abs(v) / 1000).toFixed(0)}k`
      : `€${Math.abs(v).toFixed(0)}`
  const fmtEffect = (v: number) =>
    v >= 0 ? `+${fmt(v)}` : `−${fmt(v)}`

  const after_vol = d.priorRevenue + d.volumeEffect
  const after_price = after_vol + d.priceEffect
  // after_mix = d.currentRevenue

  return [
    {
      name: 'Prior Period',
      spacer: 0,
      value: d.priorRevenue,
      isNegative: false,
      isAnchor: true,
      displayLabel: fmt(d.priorRevenue),
    },
    {
      name: 'Volume',
      // positive: spacer at bottom (priorRevenue), bar goes up
      // negative: spacer at lower bound (priorRevenue + volumeEffect), bar goes up to priorRevenue
      spacer: d.volumeEffect >= 0 ? d.priorRevenue : d.priorRevenue + d.volumeEffect,
      value: Math.abs(d.volumeEffect),
      isNegative: d.volumeEffect < 0,
      isAnchor: false,
      displayLabel: fmtEffect(d.volumeEffect),
    },
    {
      name: 'Price',
      spacer: d.priceEffect >= 0 ? after_vol : after_vol + d.priceEffect,
      value: Math.abs(d.priceEffect),
      isNegative: d.priceEffect < 0,
      isAnchor: false,
      displayLabel: fmtEffect(d.priceEffect),
    },
    {
      name: 'Mix',
      spacer: d.mixEffect >= 0 ? after_price : after_price + d.mixEffect,
      value: Math.abs(d.mixEffect),
      isNegative: d.mixEffect < 0,
      isAnchor: false,
      displayLabel: fmtEffect(d.mixEffect),
    },
    {
      name: 'Current Period',
      spacer: 0,
      value: d.currentRevenue,
      isNegative: false,
      isAnchor: true,
      displayLabel: fmt(d.currentRevenue),
    },
  ]
}
```

**Colour function**:
```typescript
const getFill = (d: PVMBarDatum): string => {
  if (d.isAnchor) return 'rgb(50,51,54)'
  return d.isNegative ? '#dc2626' : '#059669'
}
```

**Recharts structure**:
```tsx
<BarChart data={chartData} margin={{ top: 24, right: 24, bottom: 40, left: 50 }}>
  <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" vertical={false} />
  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#939598' }} />
  <YAxis tickFormatter={(v) => `€${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#939598' }} width={50} />
  <Tooltip content={<CustomTooltip />} />
  <Bar dataKey="spacer" stackId="pvm" fill="transparent" isAnimationActive={false} />
  <Bar dataKey="value" stackId="pvm" isAnimationActive={false} radius={[3, 3, 0, 0]}>
    {chartData.map((d, i) => (
      <Cell key={i} fill={getFill(d)} />
    ))}
    <LabelList dataKey="displayLabel" position="top" offset={6} style={{ fontSize: 10, fill: '#6d6e71', fontWeight: 600 }} />
  </Bar>
</BarChart>
```

**AI Warning Banner** — render ABOVE the chart when both price and mix are negative:
```tsx
{data.priceEffect < 0 && data.mixEffect < 0 && (
  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-zone-amber-bg border border-zone-amber/30 rounded-lg text-xs text-zone-amber font-medium">
    <AlertTriangle size={13} />
    Price and mix are both negative — revenue growth is volume-driven only
  </div>
)}
```

**Per-product table** — render below the chart. Column order: Product | Prior Revenue | Vol Effect | Price Effect | Mix Effect | Current Revenue | Δ%
- Currency format: `€${(v/1000).toFixed(0)}k` for values ≥ 1000
- Effect columns: `text-zone-green font-medium` if positive, `text-zone-red font-medium` if negative
- Δ% column: same colouring
- Total row: `font-semibold` weight, slightly darker `bg-page-bg`

**Period selector**: Static dropdown inside this component (at top). Two options: "YTD 2025 vs YTD 2024" (default), "Q4 2025 vs Q4 2024". Use `useState` — changing does NOT change data (demo aesthetic only).

**Props**:
```typescript
interface PVMBridgeProps {
  data: PVMData
}
```

**IMPORTS**: `BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList` from recharts; `AlertTriangle, ChevronDown` from lucide-react; `PVMData` from `@/lib/data`; `useState` from react.

**VALIDATE**: `npx tsc --noEmit` passes. For Schoko Retail data: amber warning banner fires (price −€22k, mix −€19k). Labels show "+€42k" on Volume bar, "−€22k" on Price bar, "−€19k" on Mix bar.

---

### TASK 3: CREATE `src/components/charts/WinProbabilityCurve.tsx`

**IMPLEMENT**: Recharts ComposedChart. Win probability curve (Line) + historical quotes (Scatter) + cliff zone shading (ReferenceArea) + current price reference line.

**Props**:
```typescript
interface WinProbabilityCurveProps {
  data: WinLossData
  currentPrice?: number   // vertical reference line for current quote price
}
```

**Recharts structure**: `ComposedChart`
- `Line dataKey="winRate"` — smooth curve, `stroke="#eb8c00"`, `strokeWidth={2.5}`, `dot={false}`, `type="monotone"`
- `ReferenceArea x1={data.cliffMin} x2={data.cliffMax}` — `fill="#dc2626"`, `fillOpacity={0.1}`, `stroke="#dc2626"`, `strokeOpacity={0.3}` — the "cliff zone"
- `ReferenceLine x={data.optimalPrice}` — `stroke="#059669"`, `strokeDasharray="4 3"`, label `{ value: 'Optimal', position: 'top', fontSize: 10, fill: '#059669' }`
- `ReferenceLine x={currentPrice}` (if provided) — `stroke="#6d6e71"`, `strokeDasharray="4 3"`, label `{ value: 'Current', position: 'top', fontSize: 10, fill: '#6d6e71' }`
- Historical quotes as two `Scatter` series (won and lost): filter `data.historicalQuotes` by `won` flag. Each point `{ x: price, y: <win rate at that price via interpolation>, won: boolean }`. Won dots: `fill="#059669"`, lost: `fill="#dc2626"`, `r={4}`.

Win rate interpolation helper for historical quote dots:
```typescript
function interpolateWinRate(curve: {price: number; winRate: number}[], price: number): number {
  const sorted = [...curve].sort((a, b) => a.price - b.price)
  if (price <= sorted[0].price) return sorted[0].winRate
  if (price >= sorted[sorted.length - 1].price) return sorted[sorted.length - 1].winRate
  const lower = sorted.filter(p => p.price <= price).at(-1)!
  const upper = sorted.find(p => p.price > price)!
  const t = (price - lower.price) / (upper.price - lower.price)
  return lower.winRate + t * (upper.winRate - lower.winRate)
}
```

**Axes**:
- `XAxis dataKey="price"` — `tickFormatter={(v) => \`€${v.toFixed(2)}\`}`, label `{ value: '€/kg', position: 'bottom', offset: 20 }`
- `YAxis` — `tickFormatter={(v) => \`${v}%\`}`, `domain={[0, 100]}`

**Insight panel**: NOT inside the chart component — render separately on the Win/Loss page (see Task 7).

**IMPORTS**: `ComposedChart, Line, Scatter, ReferenceArea, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer` from recharts; `WinLossData` from `@/lib/data`.

**VALIDATE**: `npx tsc --noEmit` passes.

---

### TASK 4: CREATE `src/components/charts/EoRDimensions.tsx`

**IMPLEMENT**: Custom HTML/Tailwind dimension bars — no Recharts needed. Seven horizontal progress bars, each 0–10 scale.

**Props**:
```typescript
interface EoRDimensionsProps {
  dimensions: { name: string; score: number; driverNote: string }[]
}
```

**Render each dimension**:
```tsx
{dimensions.map(d => (
  <div key={d.name} className="mb-4">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs font-medium text-text-primary">{d.name}</span>
      <span className={`text-xs font-bold ${d.score >= 7 ? 'text-zone-green' : d.score >= 5 ? 'text-zone-amber' : 'text-zone-red'}`}>
        {d.score.toFixed(1)}
      </span>
    </div>
    <div className="w-full h-2 bg-page-bg rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${d.score >= 7 ? 'bg-zone-green' : d.score >= 5 ? 'bg-zone-amber' : 'bg-zone-red'}`}
        style={{ width: `${d.score * 10}%` }}
      />
    </div>
    <p className="text-[10px] text-text-muted mt-1">{d.driverNote}</p>
  </div>
))}
```

**IMPORTS**: Only React/Tailwind — no external chart library.

**VALIDATE**: `npx tsc --noEmit` passes.

---

### TASK 5: CREATE `src/app/api/explain/route.ts`

**IMPLEMENT**: POST endpoint. Mirror `/api/chat/route.ts` structure exactly.

Request body: `{ screen: string, accountId: string | null, productId: string | null, keyMetrics: Record<string, unknown> }`

Response: `{ whatISee: string, whyItMatters: string, recommendedActions: string[] }`

**Fallback responses** (used when no API key or on error): define a `FALLBACK_RESPONSES` map per screen:

```typescript
const FALLBACK_RESPONSES: Record<string, { whatISee: string; whyItMatters: string; recommendedActions: string[] }> = {
  segmentation: {
    whatISee: 'The scatter plot shows account positions relative to the segment floor and target price bands.',
    whyItMatters: 'Accounts below the floor represent pricing risk and potential margin erosion.',
    recommendedActions: ['Review accounts below the floor line', 'Plan staged corrections over 2–3 renewal cycles', 'Use the comparison mode to benchmark against peers'],
  },
  deal-pricing: {
    whatISee: 'The Deal Pricing screen shows the live price stack, margin bridge, and three scenario comparison for the selected account and product.',
    whyItMatters: 'Each scenario shows the margin impact and escalation status of different discount strategies.',
    recommendedActions: ['Compare all three scenarios before committing to a discount', 'Check if escalation approval is needed', 'Review win probability before submitting the quote'],
  },
  waterfall: {
    whatISee: 'The price waterfall shows how the list price decomposes through invoice discounts, rebates, and payment terms to reach the net-net price.',
    whyItMatters: 'Understanding which layer drives the largest deduction helps identify where to focus contract renegotiation.',
    recommendedActions: ['Compare the rebate level to the segment norm', 'Identify layers that exceed the segment average', 'Discuss performance-linked rebate structures at next renewal'],
  },
  pvm: {
    whatISee: 'The PVM bridge decomposes revenue change into volume, price, and mix effects between periods.',
    whyItMatters: 'Revenue growth driven only by volume while price and mix are negative signals deteriorating commercial quality.',
    recommendedActions: ['Flag accounts with negative price AND mix effects to the commercial director', 'Investigate product mix shift drivers', 'Set mix improvement targets in next commercial planning cycle'],
  },
  'win-loss': {
    whatISee: 'The win probability curve shows how win rate changes with price for this product, with the cliff zone marking the region of rapid win rate decline.',
    whyItMatters: 'Pricing above the cliff zone significantly increases deal loss risk — knowing the cliff boundary helps set the right floor.',
    recommendedActions: ['Avoid quoting above the cliff maximum without strong differentiation', 'Use the optimal price point as a benchmark for new quotes', 'Review historical lost quotes to understand competitor pricing patterns'],
  },
  'ease-of-realization': {
    whatISee: 'The Ease of Realization composite score aggregates 7 dimensions of account attractiveness beyond price — including purchasing power, cooperation, and relationship stability.',
    whyItMatters: 'A high list price is only valuable if the deal can be realised — EoR flags operationally risky accounts that may not be worth aggressive discounting.',
    recommendedActions: ['Combine EoR score with segment position to prioritise renewal effort', 'Accounts with low EoR and below-floor pricing are highest risk', 'Use dimension notes to tailor the commercial conversation'],
  },
  chat: {
    whatISee: 'The chat interface allows free-text questions about account pricing data, with AI responses displayed alongside relevant visualisations.',
    whyItMatters: 'Conversational access to pricing data enables reps to get instant insight without navigating multiple screens.',
    recommendedActions: ['Ask about specific accounts to pull their segment position', 'Use follow-up questions to drill into waterfall or cross-sell data', 'Save useful conversations for future reference'],
  },
}
```

**System prompt** (used when API key is present):
```typescript
const systemPrompt = `You are a commercial pricing analyst assistant for Equazion, PwC's pricing intelligence platform. You are looking at the "${screen}" screen for account "${accountId ?? 'unknown'}" and product "${productId ?? 'unknown'}".

Current screen metrics: ${JSON.stringify(keyMetrics, null, 2)}

Generate a concise, professional pricing insight in exactly this JSON format:
{
  "whatISee": "One sentence describing the key data visible on screen",
  "whyItMatters": "One sentence explaining the commercial significance",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}

Be specific — reference the actual metric values provided. Sound like a knowledgeable pricing consultant, not a generic chatbot. Return ONLY valid JSON.`
```

**OpenAI call**: `gpt-4o`, `temperature: 0.3`, `max_tokens: 400`. Parse the response as JSON. If JSON.parse fails, return the fallback for that screen.

**IMPORTS**: `NextResponse` from `next/server`, `OpenAI` from `openai`.

**VALIDATE**: `npx tsc --noEmit` passes. `curl -X POST http://localhost:3000/api/explain -H "Content-Type: application/json" -d '{"screen":"waterfall","accountId":"baker-klaas","productId":"milk-couverture","keyMetrics":{"netNetPrice":4.20}}' ` returns valid JSON.

---

### TASK 6: CREATE `src/components/shared/ExplainButton.tsx`

**IMPLEMENT**: Floating button, fixed bottom-right. Calls `/api/explain`, emits result via callback.

```typescript
export interface ExplainResult {
  whatISee: string
  whyItMatters: string
  recommendedActions: string[]
}

interface ExplainButtonProps {
  screen: string
  keyMetrics: Record<string, unknown>
  accountId?: string | null
  productId?: string | null
  onResult: (result: ExplainResult) => void
}
```

**Behaviour**:
- Fixed position: `fixed bottom-6 right-6 z-40`
- Button style: `flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg text-white rounded-full shadow-lg hover:bg-pwc-orange transition-colors text-sm font-medium`
- Icon: `<Sparkles size={15} />` from lucide-react
- Label: "Explain" (show spinner during loading)
- Loading state: `useState<boolean>(false)`, disable button while loading
- On click: POST to `/api/explain`, on success call `onResult(data)`, on error silently do nothing (demo tool)

```tsx
async function handleClick() {
  setLoading(true)
  try {
    const res = await fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen, accountId, productId, keyMetrics }),
    })
    const data = await res.json()
    onResult(data)
  } catch {
    // silent fail
  } finally {
    setLoading(false)
  }
}
```

**IMPORTS**: `useState` from react; `Sparkles, Loader2` from lucide-react.

**VALIDATE**: Component renders without errors when used on any page.

---

### TASK 7: CREATE `src/components/shared/ExplainPanel.tsx`

**IMPLEMENT**: Slide-over panel from the right. Shows the three sections from ExplainResult.

```typescript
interface ExplainPanelProps {
  isOpen: boolean
  onClose: () => void
  result: ExplainResult | null
}
```

**Layout**:
- Overlay: `fixed inset-0 z-40 bg-black/20` (click to close)
- Panel: `fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-2xl flex flex-col`
- Header: `flex items-center justify-between px-5 py-4 border-b border-border-default`
  - Title: `<Sparkles size={16} className="text-pwc-orange" />` + "AI Explain"
  - Close button: `<X size={16} />` lucide icon
- Body: `flex-1 overflow-y-auto p-5 flex flex-col gap-5`

Three sections, each in a card-like container:
```tsx
// What I'm seeing
<div className="p-4 bg-page-bg rounded-xl">
  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">What I'm Seeing</p>
  <p className="text-sm text-text-primary">{result.whatISee}</p>
</div>
// Why it matters
<div className="p-4 bg-zone-amber-bg border border-zone-amber/20 rounded-xl">
  <p className="text-[10px] font-semibold text-zone-amber uppercase tracking-wide mb-2">Why It Matters</p>
  <p className="text-sm text-text-primary">{result.whyItMatters}</p>
</div>
// Recommended actions
<div>
  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Recommended Actions</p>
  <ul className="flex flex-col gap-2">
    {result.recommendedActions.map((action, i) => (
      <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
        <span className="mt-0.5 w-5 h-5 rounded-full bg-pwc-orange/10 text-pwc-orange text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
        {action}
      </li>
    ))}
  </ul>
</div>
```

**Animation**: Use CSS transition for slide-in. Apply `translate-x-0` when open, `translate-x-full` when closed. Add `transition-transform duration-300 ease-in-out` to the panel div.

**GOTCHA**: The panel must be rendered in the DOM even when closed (so the transition works). Control visibility via `translate-x-full` / `translate-x-0` classes based on `isOpen`.

**IMPORTS**: `X, Sparkles` from lucide-react; `ExplainResult` type (export it from `ExplainButton.tsx` and import here).

**VALIDATE**: Panel slides in/out smoothly; `npx tsc --noEmit` passes.

---

### TASK 8: CREATE `src/components/deal-pricing/WinProbSignal.tsx`

**IMPLEMENT**: Compact win probability signal card for Deal Pricing. Shows win probability at the current net price, with "See full analysis →" link.

Win rate interpolation: reuse the same `interpolateWinRate` function (copy it — it's a small pure utility).

```typescript
interface WinProbSignalProps {
  productId: string
  currentPrice: number
}
```

**Render**:
```tsx
const data = getWinLossForProduct(productId)
if (!data) return null
const winRate = Math.round(interpolateWinRate(data.curve, currentPrice))
const zone = winRate >= 65 ? 'green' : winRate >= 40 ? 'amber' : 'red'
```

Layout: compact card (`.card p-4`). Two-column layout:
- Left: label "Win Probability", large `{winRate}%` in zone colour, sub-text "at current price"
- Right: small note about cliff zone if current price is inside the cliff range

Navigation link: `<Link href="/win-loss" className="text-xs text-pwc-orange hover:underline mt-2 inline-block">See full analysis →</Link>`

**IMPORTS**: `Link` from `next/link`; `getWinLossForProduct, WinLossData` from `@/lib/data`.

**VALIDATE**: Renders without error when `productId = 'milk-couverture'` and `currentPrice = 4.20`.

---

### TASK 9: CREATE `src/components/deal-pricing/EoRSignal.tsx`

**IMPLEMENT**: Compact EoR score badge card for Deal Pricing. Shows composite score and lowest-scoring dimension as top risk flag.

```typescript
interface EoRSignalProps {
  accountId: string
}
```

**Render**:
```tsx
const data = getEoRForAccount(accountId)
if (!data) return null
const score = data.compositeScore
const zone = score >= 7 ? 'green' : score >= 5 ? 'amber' : 'red'
const topRisk = [...data.dimensions].sort((a, b) => a.score - b.score)[0]
```

Layout: compact card. Score displayed as large `{score}/10` in zone colour. Below: "Top risk: {topRisk.name}" in small muted text with the driverNote.

Navigation link: `<Link href="/ease-of-realization">See detail →</Link>`

**IMPORTS**: `Link` from `next/link`; `getEoRForAccount` from `@/lib/data`.

**VALIDATE**: Renders without error when `accountId = 'baker-klaas'`.

---

### TASK 10: UPDATE `src/app/waterfall/page.tsx`

**IMPLEMENT**: Full Waterfall screen. Replace the placeholder entirely.

Page structure:
1. `<FilterBar accounts={accounts} products={products} />`
2. Stats row (4 cards): List Price, Net-Net Price, Total Deduction (list - net-net), Net-Net Margin %
3. Waterfall chart card: `<div className="card flex-1 p-4 min-h-0">` with `WaterfallChart` inside `<div style={{ height: 'calc(100% - 32px)' }}`
4. Summary stats below chart: segment target %, variance from segment target
5. Baker Klaas rebate highlight: if the active account has a highlighted layer (`isHighlighted: true`), render a banner: `"Rebate is {rebatePct}% — {X}pts above segment norm of {norm}%"`
6. `<ExplainButton>` + `<ExplainPanel>`

Data retrieval:
```tsx
const accountId = activeAccountId ?? 'baker-klaas'
const productId = activeProductId ?? 'milk-couverture'
const waterfallData = getWaterfallForAccount(accountId, productId)
  ?? getWaterfallForAccount('baker-klaas', 'milk-couverture')!  // fallback to default
```

Key metrics for ExplainButton:
```tsx
const keyMetrics = {
  accountId,
  productId,
  listPrice: waterfallData.layers[0].cumulative,
  netNetPrice: waterfallData.layers[waterfallData.layers.length - 1].cumulative,
  totalDeduction: waterfallData.layers[0].cumulative - waterfallData.layers[waterfallData.layers.length - 1].cumulative,
  highlightedLayerName: waterfallData.layers.find(l => l.isHighlighted)?.name ?? null,
}
```

**IMPORTS**: `'use client'`; `useState` from react; `useAppContext`; `accounts, products, getWaterfallForAccount` from `@/lib/data`; `FilterBar`; `WaterfallChart`; `ExplainButton, ExplainResult`; `ExplainPanel`.

**VALIDATE**: Navigate to `/waterfall` with Baker Klaas + Milk Couverture selected — rebate bar should be amber/orange. `npx tsc --noEmit` passes.

---

### TASK 11: UPDATE `src/app/pvm/page.tsx`

**IMPLEMENT**: Full PVM Bridge screen.

Page structure:
1. `<FilterBar accounts={accounts} products={products} />`
2. Stats row (4 cards): Prior Revenue, Current Revenue, Net Change (€ and %), primary effect driver ("Price: −€22k" etc.)
3. Period selector row: dropdown + label
4. PVM bridge chart card + per-product table (both inside `PVMBridge` component)
5. AI warning banner (inside PVMBridge when price + mix are both negative)
6. `<ExplainButton>` + `<ExplainPanel>`

Data retrieval:
```tsx
const accountId = activeAccountId ?? 'schoko-retail'  // default to schoko for PVM scenario
const pvmData = getPVMForAccount(accountId)
  ?? getPVMForAccount('schoko-retail')!
```

**GOTCHA**: `getPVMForAccount` only has data for `schoko-retail` and `baker-klaas`. If a different account is selected and returns undefined, fall back to schoko-retail's data.

Key metrics for ExplainButton:
```tsx
{
  accountId,
  priorRevenue: pvmData.priorRevenue,
  currentRevenue: pvmData.currentRevenue,
  volumeEffect: pvmData.volumeEffect,
  priceEffect: pvmData.priceEffect,
  mixEffect: pvmData.mixEffect,
  bothNegative: pvmData.priceEffect < 0 && pvmData.mixEffect < 0,
}
```

**VALIDATE**: Navigate to `/pvm` — chart renders, per-product table visible. For Schoko Retail, the amber warning banner fires.

---

### TASK 12: UPDATE `src/app/win-loss/page.tsx`

**IMPLEMENT**: Full Win/Loss Price Intelligence screen.

Page structure:
1. `<FilterBar accounts={accounts} products={products} />`
2. Two-column layout (`flex gap-6`):
   - **Left (65%)**: Win Probability Curve chart card (full height)
   - **Right (35%)**: Insight panel card with stats
3. `<ExplainButton>` + `<ExplainPanel>`

**Insight panel** (right sidebar, not a Recharts component):
```tsx
<div className="flex flex-col gap-4">
  <div>
    <p className="text-xs text-text-muted mb-0.5">Optimal Price</p>
    <p className="text-lg font-bold text-zone-green">€{data.optimalPrice.toFixed(2)}/kg</p>
  </div>
  <div>
    <p className="text-xs text-text-muted mb-0.5">Cliff Zone</p>
    <p className="text-sm font-semibold text-zone-red">€{data.cliffMin.toFixed(2)} – €{data.cliffMax.toFixed(2)}/kg</p>
    <p className="text-xs text-text-muted mt-0.5">Win rate drops sharply in this range</p>
  </div>
  <div>
    <p className="text-xs text-text-muted mb-0.5">Win Rate at Current Price</p>
    <p className={`text-lg font-bold ${zone colour}`}>{winRateAtCurrent}%</p>
  </div>
  <div className="text-xs text-text-muted mt-2 leading-relaxed">
    Historical win rate based on {data.historicalQuotes.length} past quotes.
    {data.historicalQuotes.filter(q => q.won).length} won, {data.historicalQuotes.filter(q => !q.won).length} lost.
  </div>
</div>
```

Data retrieval:
```tsx
const productId = activeProductId ?? 'milk-couverture'
const winLossData = getWinLossForProduct(productId)
  ?? getWinLossForProduct('milk-couverture')!
const account = accounts.find(a => a.id === activeAccountId)
const currentPrice = account?.price ?? winLossData.optimalPrice
```

Pass `currentPrice` to `WinProbabilityCurve` for the vertical reference line.

**VALIDATE**: Navigate to `/win-loss` — win probability curve renders, cliff zone shaded in red, historical dots visible.

---

### TASK 13: UPDATE `src/app/ease-of-realization/page.tsx`

**IMPLEMENT**: Full Ease of Realization screen.

Page structure:
1. `<FilterBar accounts={accounts} products={products} />`
2. Two-column layout:
   - **Left (45%)**: Composite score header + 7 dimension bars
   - **Right (55%)**: Account comparison table (all accounts)
3. `<ExplainButton>` + `<ExplainPanel>`

**Composite score header**:
```tsx
const zone = compositeScore >= 7 ? 'green' : compositeScore >= 5 ? 'amber' : 'red'
<div className="card p-5">
  <p className="text-xs text-text-muted mb-1">Ease of Realization Score</p>
  <div className="flex items-baseline gap-2">
    <span className={`text-5xl font-bold ${zone colours}`}>{compositeScore.toFixed(1)}</span>
    <span className="text-text-muted text-lg">/ 10</span>
  </div>
  <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${zone badge styles}`}>
    {compositeScore >= 7 ? 'High Ease' : compositeScore >= 5 ? 'Medium Ease' : 'Low Ease'}
  </span>
</div>
```

**Account comparison table**: Iterate over `eorDataset` (all accounts). Columns: Account Name, Composite Score (coloured), Top Risk Dimension (lowest score dimension name). Sortable by score (use `useState` for sort direction). Highlight the active account row.

Data retrieval:
```tsx
const accountId = activeAccountId ?? 'baker-klaas'
const eorData = getEoRForAccount(accountId) ?? eorDataset[0]
```

**IMPORTS**: `useAppContext`; `accounts, products, getEoRForAccount, eorDataset` from `@/lib/data`.

**VALIDATE**: Navigate to `/ease-of-realization` — composite score shows, 7 dimension bars render with correct colours.

---

### TASK 14: UPDATE `src/app/deal-pricing/page.tsx`

**ADD** WinProbSignal + EoRSignal cards and ExplainButton to the Deal Pricing page.

**Location**: Add after the ScenarioComparison card, before the closing `</div>` of the scrollable content area.

```tsx
// After ScenarioComparison card, add:
<div className="grid grid-cols-2 gap-4">
  <WinProbSignal productId={productId} currentPrice={netPrice} />
  <EoRSignal accountId={accountId} />
</div>
```

**Add ExplainButton + ExplainPanel** with Deal Pricing key metrics:
```tsx
const keyMetrics = {
  accountId,
  productId,
  listPrice,
  netPrice,
  tierDiscountPct,
  dealDiscountPct,
  escalationLevel,
  floorPrice,
  targetPrice,
}
```

**IMPORTS**: Add `WinProbSignal` from `@/components/deal-pricing/WinProbSignal`; `EoRSignal` from `@/components/deal-pricing/EoRSignal`; `ExplainButton, ExplainResult` from `@/components/shared/ExplainButton`; `ExplainPanel` from `@/components/shared/ExplainPanel`; `useState` is already imported.

**VALIDATE**: Deal Pricing page loads with two new compact cards visible below ScenarioComparison. Explain button floats bottom-right.

---

### TASK 15: UPDATE `src/app/chat/page.tsx`

**ADD** `accountId` and `productId` to `RightPanelState` and pass them to `DynamicRightPanel`.

**UPDATE** `RightPanelState` interface:
```typescript
interface RightPanelState {
  visualType: string | null
  dataKey: string | null
  tableData?: Record<string, string | number>[] | null
  accountId?: string | null      // ← NEW
  productId?: string | null      // ← NEW
}
```

**UPDATE** `handleSubmit` to include them:
```typescript
if (data.visualType) {
  setRightPanel({
    visualType: data.visualType,
    dataKey: data.dataKey,
    tableData: data.tableData,
    accountId: data.accountId,    // ← NEW
    productId: data.productId,    // ← NEW
  })
}
```

**UPDATE** DynamicRightPanel usage:
```tsx
<DynamicRightPanel
  visualType={rightPanel.visualType}
  dataKey={rightPanel.dataKey}
  tableData={rightPanel.tableData}
  accountId={rightPanel.accountId}    // ← NEW
  productId={rightPanel.productId}    // ← NEW
/>
```

**ADD ExplainButton** with chat-screen metrics:
```tsx
const { activeAccountId, activeProductId } = useAppContext()
// Add to existing destructure

<ExplainButton
  screen="chat"
  accountId={activeAccountId}
  productId={activeProductId}
  keyMetrics={{ messageCount: messages.length, lastVisualType: rightPanel.visualType }}
  onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
/>
<ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
```

**VALIDATE**: Chat page compiles; waterfall question in chat triggers waterfall visual in right panel (Task 16 must also be complete).

---

### TASK 16: UPDATE `src/components/chat/DynamicRightPanel.tsx`

**ADD** `accountId` and `productId` props; add chart cases for waterfall/pvm/winLoss/eor.

**UPDATE props interface**:
```typescript
interface DynamicRightPanelProps {
  visualType: string | null
  dataKey: string | null
  tableData?: Record<string, string | number>[] | null
  accountId?: string | null    // ← NEW
  productId?: string | null    // ← NEW
}
```

**ADD cases** in the main render switch (after the existing 'scatter' and 'table' cases):

```tsx
if (visualType === 'waterfall') {
  // dataKey format: "baker-klaas-milk-couverture" — but use accountId/productId directly when available
  const accId = accountId ?? 'baker-klaas'
  const prodId = productId ?? 'milk-couverture'
  const data = getWaterfallForAccount(accId, prodId) ?? getWaterfallForAccount('baker-klaas', 'milk-couverture')
  if (!data) return <EmptyState />
  return (
    <div className="h-full">
      <WaterfallChart data={data} />
    </div>
  )
}

if (visualType === 'pvm') {
  const accId = accountId ?? dataKey ?? 'schoko-retail'
  const data = getPVMForAccount(accId) ?? getPVMForAccount('schoko-retail')
  if (!data) return <EmptyState />
  return (
    <div className="h-full overflow-y-auto">
      <PVMBridge data={data} />
    </div>
  )
}

if (visualType === 'winLoss') {
  const prodId = productId ?? dataKey ?? 'milk-couverture'
  const data = getWinLossForProduct(prodId) ?? getWinLossForProduct('milk-couverture')
  if (!data) return <EmptyState />
  return (
    <div className="h-full">
      <WinProbabilityCurve data={data} />
    </div>
  )
}

if (visualType === 'eor') {
  const accId = accountId ?? dataKey ?? 'baker-klaas'
  const data = getEoRForAccount(accId) ?? eorDataset[0]
  if (!data) return <EmptyState />
  return (
    <div className="h-full overflow-y-auto p-2">
      <EoRDimensions dimensions={data.dimensions} />
    </div>
  )
}
```

**REMOVE** the "Full chart view available in Phase 3" fallback — replace it with `<EmptyState />`.

**IMPORTS**: Add `WaterfallChart` from `@/components/charts/WaterfallChart`; `PVMBridge` from `@/components/charts/PVMBridge`; `WinProbabilityCurve` from `@/components/charts/WinProbabilityCurve`; `EoRDimensions` from `@/components/charts/EoRDimensions`; `getWaterfallForAccount, getPVMForAccount, getWinLossForProduct, getEoRForAccount, eorDataset` from `@/lib/data`.

**VALIDATE**: Ask "Baker Klaas price waterfall" in Chat — right panel renders WaterfallChart. Ask "Schoko PVM" — right panel renders PVMBridge.

---

### TASK 17: ADD ExplainButton to Segmentation page

**UPDATE `src/app/segmentation/page.tsx`**: Add ExplainButton + ExplainPanel with segmentation metrics.

Add imports: `ExplainButton, ExplainResult` from `@/components/shared/ExplainButton`; `ExplainPanel` from `@/components/shared/ExplainPanel`.

Add state: `const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)` and `const [explainOpen, setExplainOpen] = useState(false)`.

Add at end of return (before closing `</div>`):
```tsx
<ExplainButton
  screen="segmentation"
  accountId={activeAccountId}
  productId={activeProductId ?? productId}
  keyMetrics={{
    currentPrice: activeAccount?.price,
    floorPrice,
    targetPrice,
    vsFloor: activeAccount ? ((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1) : null,
    zone: activeAccount ? (activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green') : null,
  }}
  onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
/>
<ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
```

**VALIDATE**: Segmentation page has Explain button bottom-right; clicking it opens the slide-over panel.

---

## VALIDATION COMMANDS

### Level 1: TypeScript
```bash
cd "C:\Users\Vadim Gerasimov\POCs\FoS_Demo" && npx tsc --noEmit
```
Must return zero errors before moving to the next level.

### Level 2: Build
```bash
cd "C:\Users\Vadim Gerasimov\POCs\FoS_Demo" && npm run build
```
Must complete with zero errors. Warnings are acceptable.

### Level 3: Dev Server Check
```bash
cd "C:\Users\Vadim Gerasimov\POCs\FoS_Demo" && npm run dev
```
Navigate manually to each of these routes and confirm no runtime errors in the browser console:
- `/waterfall` — waterfall chart renders for Baker Klaas + Milk Couverture
- `/pvm` — PVM bridge renders, per-product table visible, amber warning banner fires for Schoko
- `/win-loss` — win probability curve renders, cliff zone shaded, historical quote dots visible
- `/ease-of-realization` — composite score 6.2 for Baker Klaas, all 7 dimension bars visible
- `/deal-pricing` — WinProbSignal and EoRSignal cards visible below ScenarioComparison
- `/chat` — type "Baker Klaas waterfall" → waterfall chart appears in right panel

### Level 4: Explain Flow
- On any screen, click the "Explain" floating button
- Confirm panel slides in from right with three sections populated
- Confirm panel closes when clicking the ×

### Level 5: API Test (requires running dev server)
```bash
curl -s -X POST http://localhost:3000/api/explain \
  -H "Content-Type: application/json" \
  -d '{"screen":"waterfall","accountId":"baker-klaas","productId":"milk-couverture","keyMetrics":{"netNetPrice":4.20,"listPrice":5.80}}' \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(d); console.log('whatISee:', j.whatISee ? 'OK' : 'MISSING'); console.log('whyItMatters:', j.whyItMatters ? 'OK' : 'MISSING'); console.log('recommendedActions:', Array.isArray(j.recommendedActions) ? 'OK' : 'MISSING')"
```

---

## ACCEPTANCE CRITERIA

- [ ] `/waterfall` renders full waterfall bar chart with Baker Klaas rebate bar highlighted in amber
- [ ] `/pvm` renders bridge chart + per-product table; amber warning fires when price AND mix are both negative
- [ ] `/win-loss` renders win probability curve, cliff zone shaded, historical quote dots colour-coded (won=green, lost=red)
- [ ] `/ease-of-realization` renders 7 dimension bars + account comparison table; Baker Klaas composite score = 6.2
- [ ] Deal Pricing page shows WinProbSignal and EoRSignal cards below ScenarioComparison
- [ ] Explain button present on all 7 screens (segmentation, deal-pricing, waterfall, pvm, win-loss, ease-of-realization, chat)
- [ ] Explain panel slides in from right, shows three sections, closes cleanly
- [ ] `/api/explain` returns valid JSON with `whatISee`, `whyItMatters`, `recommendedActions[]`
- [ ] DynamicRightPanel renders WaterfallChart when Chat responds with `visualType: "waterfall"`
- [ ] DynamicRightPanel renders PVMBridge when Chat responds with `visualType: "pvm"`
- [ ] All charts use the correct Tailwind colour tokens (no hardcoded hex except inside SVG elements)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` completes successfully
- [ ] Full Scenario 1 walkthrough still works: Segmentation → Deal Pricing → Chat

---

## NOTES

### Waterfall Recharts Gotcha
Recharts `BarChart` with `layout="vertical"` flips axes. Use default (vertical) layout for a top-down waterfall. The invisible spacer bar must have `fill="transparent"` (not `fill="none"`) to correctly occupy space in the stack. Also: pass `isAnimationActive={false}` on filter-triggered re-renders to avoid jank; animate only on first mount.

### PVM Data Missing Accounts
`pvm.json` only has `schoko-retail` and `baker-klaas`. All other accounts should fall back to `schoko-retail` data. Make this obvious in the UI with a fallback note like `"Showing Schoko Retail Group data (no PVM data for selected account)"`.

### Win/Loss Scatter + Line in Same Chart
Use `ComposedChart` (not `LineChart`) because it's the only Recharts parent that accepts both `Line` and `Scatter` children. The `Scatter` for historical quotes needs an `x` and `y` dataKey — map `price → x` and `interpolatedWinRate → y`.

### ExplainPanel z-index
The panel is `z-50`, overlay is `z-40`. The FilterBar and Sidebar are at default stacking — the panel will correctly appear on top.

### EoR Account Comparison Table
Only 3 accounts have EoR data in `ease-of-realization.json` (baker-klaas, schoko-retail, confiserie-lambert). The table should show only these 3 — do not try to show all 10 accounts.

### DynamicRightPanel — dataKey Parsing
For `visualType === 'waterfall'`, the `dataKey` in `chat-scenarios.json` is `"baker-klaas-milk-couverture"`. Rather than parsing this string, use the `accountId` and `productId` passed from `ChatPage` (which come directly from the scenario's `accountId` / `productId` fields in the JSON). This is why Task 15 adds these to `RightPanelState` — prefer them over dataKey parsing.
