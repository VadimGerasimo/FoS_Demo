# Feature: PVM Page Enhancements — Interactive Drill-Down, Bucket Education & Visual Improvements

The following plan should be complete, but validate documentation and codebase patterns before implementing. Pay special attention to naming of existing Tailwind classes (e.g., `text-zone-green`, `text-zone-red`, `text-zone-amber`, `bg-zone-amber-bg`, `text-pwc-orange`, `bg-page-bg`, `border-border-default`, `text-text-primary`, `text-text-muted`, `text-text-secondary`) and how panels slide in (`translate-x-full` → `translate-x-0`, `transition-transform duration-300`). Import from the right files.

## Feature Description

Enhance the Price-Volume-Mix (PVM) page from a static reporting view into an interactive, educational analytical tool. Improvements span four areas:

1. **Bucket Education** — Progressive-disclosure tooltips and definitions on Volume/Price/Mix labels so users understand what each bar represents without cluttering the default view.
2. **Bar Click → Insight Panel** — Clicking a Volume, Price, or Mix bar opens a slide-in panel with a bucket-specific narrative, top product contributors, formula card, and a pre-populated AI chat CTA.
3. **Visual Chart Improvements** — Connector lines between waterfall bars, bar dimming on selection, enriched tooltips per bar type.
4. **Enhanced Warning Logic & KPI Copy** — More specific warning banner text, expanded alert conditions, improved "Primary Driver" KPI label, and a Price Realization Rate derived metric.

## User Story

As a PwC consultant demoing Equazion to a CPO or VP Sales,
I want the PVM page to educate users on what each bucket means and reveal deeper insights when they click into a bar,
So that the demo tells a compelling "growth quality" story and the client can self-serve analytical depth without leaving the page.

## Problem Statement

The current PVM page is a static waterfall chart with a table. Users who are unfamiliar with PVM decomposition (most C-level audiences) have no way to understand what Volume vs Price vs Mix means, and there is no reward for interacting with the chart beyond a basic hover tooltip. The page cannot guide a non-analyst through the commercial story on its own.

## Solution Statement

Introduce a three-layer progressive-disclosure system:
- **Layer 1 (ambient):** Always-visible chart with enhanced bar labels and a richer warning banner.
- **Layer 2 (hover):** Info tooltips on bar axis labels explaining each bucket in plain language; per-bar rich tooltips showing top product contributors.
- **Layer 3 (click):** A slide-in `BucketInsightPanel` with narrative text, top-contributors mini-bar chart, collapsible formula, and AI chat CTA.

Connector lines between bars and bar dimming complete the visual upgrade.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium–High
**Primary Systems Affected**: `PVMBridge.tsx`, `pvm/page.tsx`, `data/pvm.json`, `contextualPrompts.ts`
**Dependencies**: Recharts (already installed), Lucide React (already installed), Tailwind CSS (already configured)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — MUST READ BEFORE IMPLEMENTING

- `src/components/charts/PVMBridge.tsx` (lines 1–225) — The entire component. All changes happen here or in a new sibling component. Note: stacked bar chart with `spacer` + `value` bars on `stackId="pvm"`. `Cell` components per bar for color. `LabelList` for top labels.
- `src/app/pvm/page.tsx` (lines 1–153) — Page wrapper. Stats row, `PVMBridge` card, `ExplainPanel`, `ContextualChatPanel`. The `BucketInsightPanel` will be added alongside the existing panels.
- `src/components/shared/ExplainPanel.tsx` (lines 1–80) — Slide-in panel pattern to MIRROR exactly: `fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out`, overlay with `fixed inset-0 z-40 bg-black/20`.
- `src/lib/data.ts` (lines 53–70) — `PVMData` interface. `products[]` sub-type. Do NOT change this interface.
- `data/pvm.json` — Actual data values used for narrative text generation. Know these numbers.
- `src/lib/contextualPrompts.ts` (lines 25–26) — PVM prompt for AI explain. Update to pass `selectedBucket` context.
- `src/app/api/explain/route.ts` (lines 32–40) — PVM fallback. Update `recommendedActions` to reference bucket if provided.

### New Files to Create

- `src/components/charts/BucketInsightPanel.tsx` — Slide-in panel for bucket-level drill-down (mirrors `ExplainPanel.tsx` structure)
- `src/lib/pvmInsights.ts` — Pure function library returning bucket-specific narrative objects keyed by `(accountId, bucket)`. No React, no side-effects.

### Existing Files to Modify

- `src/components/charts/PVMBridge.tsx` — Add bar click state, connector lines (custom SVG layer), per-bar rich tooltips, bar dimming, info tooltips on labels, enhanced warning logic, table badge pills.
- `src/app/pvm/page.tsx` — Add `BucketInsightPanel` import and state (`selectedBucket`). Update `primaryDriver` label logic. Add Price Realization Rate stat card.
- `src/lib/contextualPrompts.ts` — Extend `pvm` case to mention selected bucket.
- `src/app/api/explain/route.ts` — Update PVM fallback `recommendedActions` to be more specific.

---

## Patterns to Follow

### Panel Slide-In Pattern (from `ExplainPanel.tsx`)
```tsx
// Overlay
{isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />}

// Panel
<div className={`fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
  isOpen ? 'translate-x-0' : 'translate-x-full'
}`}>
```

### Zone Color Classes (Tailwind config)
- Green: `text-zone-green`, `bg-zone-green/10`
- Red: `text-zone-red`, `bg-zone-red/10`
- Amber: `text-zone-amber`, `bg-zone-amber-bg`, `border-zone-amber/30`
- PwC Orange: `text-pwc-orange`, `bg-pwc-orange/10`

### Card/Section Pattern (from `pvm/page.tsx`)
```tsx
<div className="card p-4">
  <h2 className="text-sm font-semibold text-text-primary mb-4">...</h2>
  ...
</div>
```

### Stat Card Pattern (from `pvm/page.tsx` lines 94–104)
```tsx
<div className="card px-4 py-3 flex-1">
  <p className="text-xs text-text-muted mb-0.5">{label}</p>
  <p className={`text-lg font-semibold ${zoneClass}`}>{value}</p>
</div>
```

### Recharts `Cell` onClick Pattern
```tsx
<Bar dataKey="value" stackId="pvm" onClick={(data, index) => handleBarClick(data, index)}>
  {chartData.map((d, i) => (
    <Cell
      key={`cell-${i}`}
      fill={getFill(d)}
      opacity={selectedBar !== null && selectedBar !== d.name ? 0.35 : 1}
      style={{ cursor: d.isAnchor ? 'default' : 'pointer' }}
    />
  ))}
</Bar>
```

### Naming Conventions
- Component files: PascalCase (`BucketInsightPanel.tsx`)
- Utility files: camelCase (`pvmInsights.ts`)
- Props interfaces: suffix `Props` (`BucketInsightPanelProps`)
- Types: PascalCase (`BucketKey`, `BucketInsight`)

---

## IMPLEMENTATION PLAN

### Phase 1: Data & Logic Layer

Create pure insight content and update data structures before touching UI.

**Tasks:**
- Create `src/lib/pvmInsights.ts` with bucket narrative content for each account
- Update `src/lib/contextualPrompts.ts` to support `selectedBucket` parameter
- Update `src/app/api/explain/route.ts` PVM fallback text

### Phase 2: Core Component — BucketInsightPanel

Create the slide-in panel that appears when a bar is clicked.

**Tasks:**
- Create `src/components/charts/BucketInsightPanel.tsx` mirroring `ExplainPanel` layout
- Implement bucket header, hero metric, narrative, top-contributors mini bar, formula card (collapsible), AI CTA button

### Phase 3: PVMBridge Visual Upgrades

Enhance the chart component with selection state, connector lines, rich tooltips, bar dimming, info tooltips on labels.

**Tasks:**
- Add `selectedBar` state and `onClick` handler to Bar
- Add connector lines via Recharts `<Customized>` SVG layer
- Replace `CustomTooltip` with a richer per-bar tooltip
- Add `(?)` info icons next to bar axis labels
- Enhance warning banner with specific text and expanded conditions

### Phase 4: Page-Level Integration

Wire `BucketInsightPanel` into `pvm/page.tsx`, update KPI cards.

**Tasks:**
- Add `selectedBucket` state and pass to `PVMBridge` and `BucketInsightPanel`
- Update `primaryDriver` KPI value to include erosion framing
- Add Price Realization Rate as a 5th derived stat card

---

## STEP-BY-STEP TASKS

### TASK 1 — CREATE `src/lib/pvmInsights.ts`

- **IMPLEMENT**: Export `BucketKey = 'volume' | 'price' | 'mix'` type. Export `BucketInsight` interface: `{ title: string; heroValue: string; heroDirection: 'up'|'down'|'neutral'; narrative: string; topContributors: { name: string; value: number; formatted: string }[]; formula: { expression: string; plain: string }; actionPrompt: string }`. Export `getPVMInsight(accountId: string, bucket: BucketKey): BucketInsight` function.
- **CONTENT** for `schoko-retail`:
  - `volume`: title="Volume Effect", heroValue="+€42k", heroDirection="up", narrative="Volume growth of +€42k is driven by Dark Compound expanding in the discount channel. Milk Couverture volume is declining — growth is concentrated in one SKU. The overall volume number looks stronger than the underlying mix warrants.", topContributors=[{name:"Dark Compound", value:88200},{name:"Milk Couverture", value:-46200}], formula={expression:"(Curr Qty − Prior Qty) × Prior Unit Price", plain:"Revenue change if only units sold changed"}, actionPrompt="Explain the Volume Effect for Schoko Retail and whether the growth is sustainable"
  - `price`: title="Price Effect", heroValue="−€22k", heroDirection="down", narrative="Price realization declined €22k versus the prior period — consistent with reactive discounting. Three off-invoice adjustments were granted in Q3–Q4 without documented volume commitments. At current volumes this erosion pattern compounds to ~€85k annually if uncorrected.", topContributors=[{name:"Dark Compound", value:-31500},{name:"Milk Couverture", value:9500}], formula={expression:"Curr Qty × (Curr Unit Price − Prior Unit Price)", plain:"Revenue change from rate changes on same products"}, actionPrompt="Explain the Price Effect for Schoko Retail and what actions could address the erosion"
  - `mix`: title="Mix Effect", heroValue="−€19k", heroDirection="down", narrative="Mix erosion of −€19k reflects a portfolio shift toward lower-margin SKUs. Milk Couverture — the higher-margin product — is declining as a revenue share while Dark Compound grows. Even as total revenue holds, commercial quality is deteriorating.", topContributors=[{name:"Dark Compound", value:-12600},{name:"Milk Couverture", value:-6400}], formula={expression:"Total Revenue − Prior Revenue − Volume Effect − Price Effect", plain:"Revenue change from portfolio composition shift (residual)"}, actionPrompt="Explain the Mix Effect for Schoko Retail and how to recover the mix"
- **CONTENT** for `baker-klaas`:
  - `volume`: narrative="Baker Klaas is growing at +13.3% — above category average. Volume gains reflect successful penetration of the artisan/bakery segment. This account is in an early growth phase.", topContributors=[{name:"Milk Couverture", value:3360}]
  - `price`: narrative="A modest price concession of −€840 was extended in Q4, likely tied to a contract negotiation. At this account size and growth rate, within acceptable tolerance. This is the first price concession — flag as a leading indicator.", topContributors=[{name:"Milk Couverture", value:-840}]
  - `mix`: narrative="Minor mix headwind. Baker Klaas purchases are concentrated in a single SKU so mix variance reflects order size and frequency shifts rather than product substitution. Monitor as the account grows.", topContributors=[{name:"Milk Couverture", value:-504}]
- **GOTCHA**: For accounts not in the insight map (non schoko-retail / baker-klaas), return a generic fallback object — never throw.
- **VALIDATE**: `npx tsc --noEmit` — no type errors

### TASK 2 — UPDATE `src/lib/contextualPrompts.ts`

- **UPDATE**: The `pvm` case to accept optional `selectedBucket?: string` from `keyMetrics`. If `keyMetrics.selectedBucket` is truthy, add: `If the user is asking about the ${keyMetrics.selectedBucket} effect specifically, focus interpretation on that bucket.`
- **PATTERN**: Follow existing `keyMetrics.bothNegative` pattern already used in the pvm case — just extend the prompt string.
- **VALIDATE**: `npx tsc --noEmit`

### TASK 3 — UPDATE `src/app/api/explain/route.ts` — PVM fallback

- **UPDATE**: `pvm` fallback `recommendedActions` to:
  ```
  [
    'Review accounts where both price AND mix are negative — this signals discounting-driven volume with deteriorating commercial quality',
    'Investigate product mix shift: if a lower-margin SKU is growing faster than the premium line, set a mix recovery target in the next commercial planning cycle',
    'For accounts with negative price effect, check whether discounts were tied to volume commitments — undocumented concessions compound over renewal cycles',
  ]
  ```
- **UPDATE**: `whatISee` to: `"The PVM bridge decomposes revenue change into volume, price, and mix effects — showing whether growth is commercially healthy or masking margin erosion."`
- **VALIDATE**: No TypeScript errors. `curl -X POST http://localhost:3000/api/explain -H "Content-Type: application/json" -d '{"screen":"pvm","accountId":"schoko-retail","keyMetrics":{}}'` should return updated text when API key is absent.

### TASK 4 — CREATE `src/components/charts/BucketInsightPanel.tsx`

- **IMPLEMENT**: A slide-in panel (400px wide, right side) that mirrors `ExplainPanel.tsx` structure exactly.
- **PROPS**:
  ```tsx
  interface BucketInsightPanelProps {
    isOpen: boolean
    onClose: () => void
    insight: BucketInsight | null
    bucketKey: BucketKey | null
    onAskAI: (prompt: string) => void  // pre-populates ContextualChatPanel
  }
  ```
- **LAYOUT** (top to bottom inside panel body):
  1. **Header**: Colored dot (green/red based on `heroDirection`) + `insight.title` + X close button. Sub-label: current period (hardcoded "YTD 2025").
  2. **Hero metric block**: Large `insight.heroValue` with direction arrow icon (`TrendingUp`/`TrendingDown` from lucide-react). Color: green if up, red if down.
  3. **Narrative block**: `bg-page-bg rounded-xl p-4` — `insight.narrative` text at `text-sm`.
  4. **Top Contributors section**: Label "TOP CONTRIBUTORS" in `text-[10px] font-semibold text-text-muted uppercase`. For each contributor, render a horizontal mini-bar: container `w-full`, bar `h-2 rounded-full` in green/red, value label right-aligned. Sort by `Math.abs(value)` descending.
  5. **Formula section** (collapsible): Toggle with ChevronDown. Shows `insight.formula.expression` in a code-style block (`font-mono text-xs bg-page-bg rounded p-2`) and `insight.formula.plain` below in muted text.
  6. **CTA button**: "Ask AI about this →" — calls `onAskAI(insight.actionPrompt)`. Style: `w-full py-2 rounded-lg bg-pwc-orange/10 text-pwc-orange text-sm font-medium hover:bg-pwc-orange/20 transition-colors text-center`. Use TrendingUp/TrendingDown/Minus for direction icons.
- **PATTERN**: MIRROR `ExplainPanel.tsx` for overlay + panel slide-in CSS exactly. Use `translate-x-full` / `translate-x-0` transition. z-index: overlay `z-40`, panel `z-50` (same as ExplainPanel — they won't coexist).
- **GOTCHA**: When `insight` is null (panel open before data loads), show a skeleton / "No data" state, not a JS error.
- **VALIDATE**: `npx tsc --noEmit`

### TASK 5 — UPDATE `src/components/charts/PVMBridge.tsx` — Bar click selection state

- **ADD** to component state:
  ```tsx
  const [selectedBar, setSelectedBar] = useState<string | null>(null)
  ```
- **ADD** `onBarSelect` prop to `PVMBridgeProps`:
  ```tsx
  onBarSelect?: (barName: 'volume' | 'price' | 'mix' | null) => void
  ```
- **UPDATE** the `<Bar dataKey="value">` to add:
  - `onClick` handler: if `d.isAnchor` do nothing; otherwise toggle selected bar. Call `onBarSelect` with lowercase key or null.
  - `Cell` components: add `opacity={selectedBar !== null && selectedBar !== d.name ? 0.35 : 1}` and `style={{ cursor: d.isAnchor ? 'default' : 'pointer' }}`.
- **GOTCHA**: The `onClick` on `<Bar>` in Recharts receives `(data: PVMBarDatum, index: number)`. The bar name is `data.name` (e.g., "Volume", "Price", "Mix"). Map to lowercase for the `BucketKey` type.
- **GOTCHA**: The stacked bar has TWO `<Bar>` elements (spacer + value). Only add `onClick` to the `dataKey="value"` bar, not the spacer bar.
- **VALIDATE**: `npx tsc --noEmit`

### TASK 6 — UPDATE `src/components/charts/PVMBridge.tsx` — Connector lines (SVG custom layer)

- **IMPLEMENT**: Add a custom SVG overlay using Recharts `<Customized>` component to draw dashed horizontal connector lines between bar tops.
- **APPROACH**: Create `ConnectorLines` component that receives Recharts internal props (`xAxisMap`, `yAxisMap`, `data`). For each pair of adjacent bars, draw a `<line>` from the right edge of bar N's top to the left edge of bar N+1's bottom anchor:
  ```tsx
  // Pseudo-logic — adapt based on actual Recharts coordinate props
  function ConnectorLines(props: any) {
    // props contains: offset, xAxisMap, yAxisMap, layout
    // Use recharts internal offset to calculate bar center x positions
    // Connect: Prior Period top → Volume bottom
    //          Volume top → Price bottom
    //          Price top → Mix bottom
    //          Mix top → Current Period bottom
    return (
      <g>
        {connections.map((conn, i) => (
          <line
            key={i}
            x1={conn.x1} y1={conn.y1}
            x2={conn.x2} y2={conn.y2}
            stroke="#d1d5db"
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        ))}
      </g>
    )
  }
  ```
- **SIMPLER ALTERNATIVE** if `<Customized>` coordinate system proves complex: Add `<ReferenceLine>` components for each connector y-value using the known data values. This is less precise but ships faster.
  - Prior Period top y = `priorRevenue`
  - After Volume y = `priorRevenue + volumeEffect`
  - After Price y = `priorRevenue + volumeEffect + priceEffect`
  - After Mix y = `currentRevenue`
  - Draw horizontal `<ReferenceLine y={...} stroke="#d1d5db" strokeDasharray="4 3" />` at each transition level.
- **PREFERRED**: Use the `<ReferenceLine>` approach as it's simpler and achieves the visual goal (horizontal guide lines at each level transition).
- **VALIDATE**: Visually verify in browser at `http://localhost:3000/pvm`. Lines should appear as subtle dashed horizontals connecting bar segments.

### TASK 7 — UPDATE `src/components/charts/PVMBridge.tsx` — Rich per-bar tooltips

- **REPLACE** `CustomTooltip` with a richer implementation that branches on `d.name`:
  ```tsx
  function CustomTooltip({ active, payload, data: pvmData }: CustomTooltipProps & { data: PVMData }) {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as PVMBarDatum
    // Branch on d.name: 'Prior Period' | 'Volume' | 'Price' | 'Mix' | 'Current Period'
  }
  ```
- **FOR ANCHOR BARS** (Prior Period / Current Period): Show total + product breakdown from `pvmData.products`.
- **FOR EFFECT BARS** (Volume / Price / Mix): Show effect total, top product contributor (name + value), and "Click to explore →" hint text.
- **STYLING**: Dark background tooltip: `bg-[#0f172a] text-white rounded-lg shadow-lg px-3 py-2.5 text-xs`. Use `border-b border-white/10` between sections.
- **GOTCHA**: Pass `pvmData` (the `PVMData` prop) into the tooltip via Recharts `content` prop: `<Tooltip content={(props) => <CustomTooltip {...props} data={data} />} />`. Do NOT add a new prop to `PVMBridgeProps` — `data` is already available in the closure.
- **VALIDATE**: `npx tsc --noEmit`; hover each bar in browser to verify tooltips.

### TASK 8 — UPDATE `src/components/charts/PVMBridge.tsx` — Info tooltips on bar axis labels

- **IMPLEMENT**: Replace the `XAxis` default ticks with a custom tick component that adds a `(?)` icon next to Volume, Price, and Mix labels (not anchor bars).
- **DEFINITIONS** to show on hover:
  - Volume: "Revenue change from selling more or fewer units, holding prior-period prices and mix constant."
  - Price: "Revenue change from realized price movements on the same products, isolating rate changes from volume or portfolio shifts."
  - Mix: "Revenue change from portfolio composition shift — selling proportionally more of lower-value vs higher-value products."
  - Anchors (Prior/Current Period): No `(?)` icon.
- **APPROACH**: Use `<XAxis tick={<CustomXTick definitions={BUCKET_DEFINITIONS} />} />`. The custom tick renders the label text and conditionally adds a `title` attribute (native browser tooltip) on a small `<text>` element for the `(?)`. For a polished look, use a positioned `<g>` SVG group with the label + a small circled `?` character.
- **SIMPLER ALTERNATIVE**: If SVG custom tick is complex, add `(?)` as part of the label string and handle hover via a simple React state tooltip positioned absolutely over the chart. This is less elegant but more controllable.
- **PREFERRED**: Custom SVG tick with native `<title>` element — browsers show this as a native tooltip, zero JS required.
- **VALIDATE**: Hover "Volume", "Price", "Mix" labels — tooltip text appears.

### TASK 9 — UPDATE `src/components/charts/PVMBridge.tsx` — Enhanced warning banner & expanded alert logic

- **REPLACE** the current single warning condition with an `alertConfig` computed from data:
  ```tsx
  function getAlertConfig(d: PVMData): { message: string; severity: 'high' | 'medium' | 'info' } | null {
    const { volumeEffect: vol, priceEffect: price, mixEffect: mix } = d
    if (vol > 0 && price < 0 && mix < 0)
      return { message: "Both price and mix are negative while volume grows — discounting-driven growth. Revenue quality is declining even as top-line holds.", severity: 'high' }
    if (vol < 0 && price < 0 && mix < 0)
      return { message: "Critical: Revenue declining across all three drivers — escalate to commercial review.", severity: 'high' }
    if (price < 0 && mix < 0 && vol <= 0)
      return { message: "Price and mix erosion without volume offset — pure commercial quality deterioration.", severity: 'high' }
    if (price > 0 && vol < 0)
      return { message: "Monitor: Volume declined following price action — assess demand elasticity.", severity: 'medium' }
    if (Math.abs(mix) > Math.abs(price) && mix < 0 && price > 0)
      return { message: "Mix erosion is outpacing price gains — net yield is declining despite price improvement.", severity: 'medium' }
    if (vol < 0 && price < 0 && mix > 0)
      return { message: "Positive signal: Revenue quality improving as lower-margin volume is shed.", severity: 'info' }
    return null
  }
  ```
- **RENDER**: Replace the hardcoded warning `div` with:
  ```tsx
  {(() => {
    const alert = getAlertConfig(data)
    if (!alert) return null
    const styles = {
      high: 'bg-zone-amber-bg border-zone-amber/30 text-zone-amber',
      medium: 'bg-blue-50 border-blue-200 text-blue-700',
      info: 'bg-zone-green/10 border-zone-green/30 text-zone-green',
    }
    return (
      <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium ${styles[alert.severity]}`}>
        <AlertTriangle size={13} />
        {alert.message}
      </div>
    )
  })()}
  ```
- **VALIDATE**: Check Schoko Retail shows the "volume+, price−, mix−" message. Toggle accounts to verify logic.

### TASK 10 — UPDATE `src/components/charts/PVMBridge.tsx` — Table delta % badge pills

- **UPDATE** the `Δ%` column cell to render a badge pill instead of plain colored text:
  ```tsx
  <td className="px-3 py-2 text-right">
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
      p.delta >= 0
        ? 'bg-zone-green/10 text-zone-green'
        : 'bg-zone-red/10 text-zone-red'
    }`}>
      {p.delta >= 0 ? '+' : ''}{p.delta.toFixed(1)}%
    </span>
  </td>
  ```
- **ALSO UPDATE** the Total row delta cell with the same pill pattern.
- **VALIDATE**: Visual check in browser — Δ% column shows colored pill badges.

### TASK 11 — UPDATE `src/app/pvm/page.tsx` — BucketInsightPanel integration

- **ADD** imports: `BucketInsightPanel` from `@/components/charts/BucketInsightPanel`, `getPVMInsight`, `BucketKey` from `@/lib/pvmInsights`.
- **ADD** state:
  ```tsx
  const [selectedBucket, setSelectedBucket] = useState<BucketKey | null>(null)
  const [bucketPanelOpen, setBucketPanelOpen] = useState(false)
  ```
- **ADD** handler:
  ```tsx
  function handleBarSelect(bar: BucketKey | null) {
    if (bar === null) {
      setBucketPanelOpen(false)
      setSelectedBucket(null)
    } else {
      setSelectedBucket(bar)
      setBucketPanelOpen(true)
      // Close other panels
      setExplainOpen(false)
      setChatOpen(false)
    }
  }
  ```
- **ADD** `onAskAI` handler that closes bucket panel, opens chat, and pre-fills prompt (pass prompt string via a new `initialMessage` prop on `ContextualChatPanel` — see Task 12).
- **UPDATE** `<PVMBridge>` to pass `onBarSelect={handleBarSelect}` and `selectedBarName={selectedBucket}`.
- **ADD** `<BucketInsightPanel>` after the existing `<ExplainPanel>`:
  ```tsx
  <BucketInsightPanel
    isOpen={bucketPanelOpen}
    onClose={() => { setBucketPanelOpen(false); setSelectedBucket(null) }}
    insight={selectedBucket ? getPVMInsight(accountId, selectedBucket) : null}
    bucketKey={selectedBucket}
    onAskAI={(prompt) => { setBucketPanelOpen(false); setChatOpen(true); /* pass prompt */ }}
  />
  ```
- **VALIDATE**: `npx tsc --noEmit`. Click Volume bar → panel slides in. Click X → panel closes. Click Price bar → panel updates.

### TASK 12 — UPDATE `src/app/pvm/page.tsx` — KPI card improvements

- **UPDATE** `primaryDriver` value to include erosion framing when applicable:
  ```tsx
  const primaryDriverLabel = (() => {
    const d = primaryDriver
    const isPositive = d.value >= 0
    // If volume is primary driver but both price and mix are negative → add framing
    if (d.name === 'Volume' && pvmData.priceEffect < 0 && pvmData.mixEffect < 0) {
      return `Volume masking price erosion`
    }
    return `${d.name} ${fmtSigned(d.value)}`
  })()
  ```
- **UPDATE** the stats array `Primary Driver` entry to use `primaryDriverLabel`.
- **ADD** Price Realization Rate as a 5th stat card (append to `stats` array):
  ```tsx
  // Price Realization Rate: approximated as (currentRevenue / priorRevenue - 1) * 100
  // adjusted for volume: if vol growth > 0, rate = priceEffect / (priorRevenue + volumeEffect) * 100
  const priceRealizationRate = pvmData.priorRevenue > 0
    ? ((pvmData.priceEffect / (pvmData.priorRevenue + pvmData.volumeEffect)) * 100).toFixed(1)
    : '0.0'
  // Add to stats:
  {
    label: 'Price Realization',
    value: `${Number(priceRealizationRate) >= 0 ? '+' : ''}${priceRealizationRate}%`,
    zone: Number(priceRealizationRate) >= 0 ? 'green' : 'red',
  }
  ```
- **LAYOUT**: 5 cards in a row — change the `flex gap-4` container. At 5 cards they'll still fit at 1280px with `flex-1` each. If concerned about width, you can use `grid grid-cols-5 gap-3` instead.
- **VALIDATE**: Visual check — 5 KPI cards render correctly. Price Realization shows −1.2% for Schoko Retail (approximately).

### TASK 13 — UPDATE `src/components/charts/PVMBridge.tsx` — Pass selectedBarName to dim effect bars

- **ADD** prop `selectedBarName?: string | null` to `PVMBridgeProps`.
- **UPDATE** `<Cell>` opacity to use `selectedBarName` from props (not internal state — state was added in Task 5, but the parent now controls selection via `onBarSelect`). Remove internal `selectedBar` state — it's now lifted to the page.
  ```tsx
  // In Cell:
  opacity={selectedBarName !== null && selectedBarName !== undefined && selectedBarName !== d.name.toLowerCase() && !d.isAnchor ? 0.35 : 1}
  ```
- **GOTCHA**: The bar names in chart data are "Volume", "Price", "Mix" (capitalized). The `BucketKey` type is lowercase. The comparison must normalize: `d.name.toLowerCase() === selectedBarName`.
- **VALIDATE**: Selecting Volume bar dims Price and Mix bars to 40% opacity.

---

## TESTING STRATEGY

### Manual Validation (primary — no automated tests in this project)

- Verify each bar click opens the correct insight panel with the right narrative text
- Verify clicking the same bar again closes the panel
- Verify clicking a different bar updates the panel content without close/reopen flicker
- Verify "Ask AI about this →" closes the bucket panel and opens the chat panel
- Verify the warning banner shows the correct message for Schoko Retail vs Baker Klaas
- Verify connector lines appear as subtle dashed horizontals
- Verify bar dimming works correctly (selected bar stays full opacity, others dim)
- Verify tooltip `(?)` on bar labels shows correct definitions
- Verify Price Realization Rate KPI card shows correct value
- Verify Primary Driver says "Volume masking price erosion" for Schoko Retail
- Verify delta % badge pills render in table

### Edge Cases

- Account with no PVM data → falls back to schoko-retail, bucket insight panel should still work
- Baker Klaas (single-product account) → mix insight shows "order size/frequency shift" narrative
- All effects positive → no warning banner
- Period selector change → selected bar clears, panel closes

---

## VALIDATION COMMANDS

### Level 1: Type Check
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx tsc --noEmit
```

### Level 2: Lint
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx next lint
```

### Level 3: Build Check
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx next build
```

### Level 4: Dev Server Manual Testing
```bash
cd "/c/Users/Vadim Gerasimov/POCs/FoS_Demo" && npx next dev
# Navigate to http://localhost:3000/pvm
# Test each bar click, tooltip hover, warning banner
```

---

## ACCEPTANCE CRITERIA

- [ ] Clicking Volume/Price/Mix bar opens `BucketInsightPanel` with correct narrative for active account
- [ ] Clicking the active bar again (or pressing X) closes the panel
- [ ] Unselected bars dim to ~35% opacity when one is selected
- [ ] Connector lines (dashed horizontal guide lines) appear between bar transitions
- [ ] Hovering "Volume", "Price", "Mix" axis labels shows a definition tooltip
- [ ] Per-bar rich tooltips show top product contributors
- [ ] Warning banner text is specific and context-aware (not generic)
- [ ] Expanded alert conditions trigger correctly for each scenario
- [ ] `primaryDriver` KPI shows "Volume masking price erosion" for Schoko Retail
- [ ] Price Realization Rate KPI card renders correctly
- [ ] Delta % column renders as colored badge pills
- [ ] "Ask AI about this →" in bucket panel pre-populates and opens the chat panel
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx next build` completes successfully
- [ ] No regressions on other pages (Segmentation, Waterfall, etc.)

---

## COMPLETION CHECKLIST

- [ ] `src/lib/pvmInsights.ts` created with full insight content for schoko-retail and baker-klaas
- [ ] `src/lib/contextualPrompts.ts` updated for selected bucket context
- [ ] `src/app/api/explain/route.ts` PVM fallback updated
- [ ] `src/components/charts/BucketInsightPanel.tsx` created and rendering correctly
- [ ] `PVMBridge.tsx` — bar click state + `onBarSelect` prop added
- [ ] `PVMBridge.tsx` — connector reference lines added
- [ ] `PVMBridge.tsx` — rich per-bar tooltips implemented
- [ ] `PVMBridge.tsx` — `(?)` info icons on axis labels
- [ ] `PVMBridge.tsx` — enhanced warning logic with `getAlertConfig`
- [ ] `PVMBridge.tsx` — table delta % badge pills
- [ ] `PVMBridge.tsx` — `selectedBarName` prop for bar dimming
- [ ] `pvm/page.tsx` — `BucketInsightPanel` wired with state and handlers
- [ ] `pvm/page.tsx` — Primary Driver KPI label logic updated
- [ ] `pvm/page.tsx` — Price Realization Rate stat card added
- [ ] All acceptance criteria met
- [ ] TypeScript and build checks pass

---

## NOTES

### Architecture Decision: State Lifting
Bar selection state is lifted to `pvm/page.tsx` (not kept in `PVMBridge.tsx`) so that the `BucketInsightPanel` — which lives at the page level alongside `ExplainPanel` and `ContextualChatPanel` — can be opened/closed from the same state. This follows the existing pattern where `ExplainPanel` is controlled from the page level.

### Connector Lines Implementation Note
The `<ReferenceLine>` approach (Task 6) is recommended over `<Customized>` SVG because Recharts `<Customized>` requires accessing internal bar layout coordinates which are not well-documented and can change between versions. Reference lines at the known y-values achieve the same visual effect with zero risk.

### Formula Methodology Note (for narrative accuracy)
Mix Effect is the residual term (Total − Prior − Volume − Price). This is the additive constant-price decomposition method. The formula panel in `BucketInsightPanel` should note this explicitly: "Mix captures portfolio composition shift and the price-volume interaction term."

### No ContextualChatPanel `initialMessage` Prop Currently
Task 11 references passing a pre-populated prompt to `ContextualChatPanel`. Check if `ContextualChatPanel` already accepts an `initialMessage` prop — if not, this would be a separate small enhancement. The simplest workaround: store the prompt in a `useRef` in `pvm/page.tsx` and read it when the chat panel opens. Or skip pre-population on first pass and just open the chat — the "Ask AI about this →" CTA still works as a navigation bridge.

### Demo Impact Priority
If time is limited, implement Tasks in this order for maximum demo impact:
1. Tasks 9 (warning banner) — pure text, 15 minutes
2. Tasks 10, 12 (badge pills + KPI updates) — visual polish, 30 minutes
3. Tasks 1+4+11 (insight panel) — the showstopper, ~3 hours
4. Tasks 5+13 (bar dimming) — interaction feel, 30 minutes
5. Tasks 6+7+8 (connector lines + rich tooltips + label hints) — chart polish, ~2 hours
