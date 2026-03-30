# Feature: Phase 4 — Polish & Demo Readiness

The following plan should be complete, but validate codebase patterns and task sanity before implementing.
Pay special attention to existing Tailwind class names, custom CSS tokens (defined in tailwind.config.ts), and existing animation patterns before adding new ones.

## Feature Description

Phase 4 transforms the fully-functional Phase 3 build into a demo-quality experience. The goal is polish, not features: charts that animate in gracefully, skeleton loaders that signal a "live" data system, smooth filter transitions, and no silent failures during a live Scenario 1 walkthrough. Every change must make the demo feel more credible and presenter-proof.

## User Story

As a PwC consultant presenting Equazion live to a ChocoMaker audience,
I want the UI to feel polished, animated, and production-grade,
So that the audience believes they are watching a real commercial pricing system — not a prototype.

## Problem Statement

Phase 3 is functionally complete but rough around the edges: Recharts animations are globally disabled (charts snap in abruptly), no skeleton loaders exist (charts appear instantaneously, betraying static data), filter switches have no visual feedback, and the ExplainButton fails silently on error. These gaps break demo immersion.

## Solution Statement

Enable initial-mount Recharts animations (disabled only on filter re-renders), add a brief skeleton shimmer on first page mount, add a crossfade when the filter context changes, and surface an error state in ExplainButton. Fix identified data inconsistencies so all screens tell a coherent story. Verify AI functionality (Chat + Explain) produces specific, accurate, context-aware responses with the live API key. All changes are additive — no existing functionality is removed.

## Feature Metadata

**Feature Type**: Enhancement / Polish + Data Integrity + AI Validation
**Estimated Complexity**: Low–Medium
**Primary Systems Affected**: All chart components, FilterBar, ExplainButton, globals.css, data/*.json, /api/explain route, /api/chat route
**Dependencies**: No new packages — Tailwind animate utilities, Recharts animation props, React useState/useRef/useEffect

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ THESE BEFORE IMPLEMENTING

- `src/app/globals.css` — Where to add `@keyframes` and `.animate-*` utilities
- `tailwind.config.ts` — Custom color tokens and existing theme extensions; do NOT introduce colors not defined here
- `src/components/charts/WaterfallChart.tsx` (lines 88–92) — `isAnimationActive={false}` pattern to replace
- `src/components/charts/PVMBridge.tsx` (lines 158–163) — Same `isAnimationActive={false}` pattern
- `src/components/charts/WinProbabilityCurve.tsx` (lines 125–147) — Same pattern on Line + Scatter
- `src/components/charts/SegmentationScatter.tsx` (lines 100–115) — Already has `isAnimationActive` as a prop; check default and parent usage
- `src/components/charts/EoRDimensions.tsx` (line 20) — `transition-all duration-500` already on progress bars; do not double-animate
- `src/components/shared/ExplainButton.tsx` (lines 25–48) — Silent catch block to fix; existing loading + icon pattern to follow
- `src/components/shared/FilterBar.tsx` (lines 55–70) — Active context pill; source of filter switch events
- `src/components/deal-pricing/EscalationBanner.tsx` (lines 43–62) — Already has `transition-all duration-300` pattern to reference
- `src/app/segmentation/page.tsx` — Wraps SegmentationScatter; where to add fade wrapper
- `src/app/deal-pricing/page.tsx` — Largest page; add skeleton and fade wrapper here
- `src/app/waterfall/page.tsx` — Add skeleton
- `src/app/pvm/page.tsx` — Add skeleton
- `src/app/win-loss/page.tsx` — Add skeleton
- `src/app/ease-of-realization/page.tsx` — Add skeleton
- `src/context/AppContext.tsx` — Source of `activeAccountId` + `activeProductId` used as fade trigger key

### New Files to Create

- `src/components/shared/ChartSkeleton.tsx` — Reusable shimmer skeleton for chart areas
- `src/components/shared/FadeWrapper.tsx` — Lightweight wrapper that triggers CSS fade when its `key` prop changes (filter switch crossfade)

### Patterns to Follow

**Animation on initial mount only (not on filter re-renders):**
```tsx
// At top of any chart component:
const [animateOnMount, setAnimateOnMount] = useState(true)
useEffect(() => {
  const t = setTimeout(() => setAnimateOnMount(false), 1200)
  return () => clearTimeout(t)
}, [])
// Then on Recharts elements:
// isAnimationActive={animateOnMount}  animationDuration={900}
```
This gives a one-time draw-in on page load, then disables animation for all subsequent filter re-renders — matching the PRD risk mitigation note.

**Skeleton shimmer pattern (Tailwind):**
```tsx
// Uses Tailwind's built-in animate-pulse; no new CSS needed
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-border-default rounded w-1/3" />
  <div className="h-48 bg-border-default rounded-lg opacity-50" />
</div>
```
Use `border-default` (existing token) not hardcoded gray.

**Page-mount skeleton with brief delay:**
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => {
  const t = setTimeout(() => setMounted(true), 350)
  return () => clearTimeout(t)
}, [])
if (!mounted) return <ChartSkeleton rows={3} />
```
350ms is intentional: long enough to see the skeleton flash (signals "loading from data system"), short enough not to irritate a live audience.

**Filter crossfade using CSS key + fade-in utility:**
```tsx
// FadeWrapper.tsx
<div key={fadeKey} className="animate-fade-in">
  {children}
</div>
// In globals.css @layer utilities:
// .animate-fade-in { animation: fadeIn 200ms ease-out; }
// @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
```
Use `fadeKey={activeAccountId + '-' + activeProductId}` in page components. When the filter changes, React unmounts/remounts the FadeWrapper, triggering the CSS fade.

**ExplainButton error state — follow existing loading pattern:**
```tsx
// Existing: const [loading, setLoading] = useState(false)
// Add:      const [error, setError]   = useState(false)
// In catch:
setError(true)
setTimeout(() => setError(false), 3000)
// In render — add error branch before loading branch:
// error → show AlertCircle icon + "Try again" label in red
```

**Existing Tailwind token names to use** (from tailwind.config.ts — do NOT invent new ones):
- Colors: `pwc-orange`, `pwc-orange-dark`, `text-primary`, `text-secondary`, `border-default`, `card-bg`, `page-bg`, `sidebar-hover`
- Sizing follows existing `rounded-xl`, `shadow-sm`, `p-6`, `gap-6` patterns

---

## IMPLEMENTATION PLAN

### Phase 1: CSS Foundation

Add `@keyframes fadeIn` and `.animate-fade-in` utility to `globals.css` so subsequent tasks can reference the class. No component changes yet.

### Phase 2: Shared Components

Create `ChartSkeleton.tsx` and `FadeWrapper.tsx`. These are the building blocks for all page-level and chart-level polish.

### Phase 3: Chart Animations

Update each chart component to use the `animateOnMount` pattern — one-time initial draw-in, disabled on re-renders.

### Phase 4: Page-Level Skeleton + Crossfade

Wrap chart sections in each page with `FadeWrapper` and add the `mounted` skeleton gate.

### Phase 5: ExplainButton Error State

Fix the silent catch to surface an error state in the button UI.

### Phase 6: Final QA Checklist

Manual validation steps for Scenario 1 end-to-end, 1440px viewport, and filter switching on every screen.

---

## STEP-BY-STEP TASKS

### Task 1 — UPDATE `src/app/globals.css`

- **ADD** `@keyframes fadeIn` and `.animate-fade-in` inside `@layer utilities`
- **CONTENT** to add at the end of the file, inside a new `@layer utilities` block:

```css
@layer utilities {
  .animate-fade-in {
    animation: fadeIn 200ms ease-out both;
  }
  .animate-fade-in-slow {
    animation: fadeIn 400ms ease-out both;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- **GOTCHA**: Do NOT put `@keyframes` inside an `@layer` block — put it at root level outside any `@layer`. The `.animate-fade-in` class goes inside `@layer utilities`.
- **VALIDATE**: `npm run build` — no CSS errors

---

### Task 2 — CREATE `src/components/shared/ChartSkeleton.tsx`

- **IMPLEMENT**: Reusable skeleton component with configurable rows and optional title bar
- **PATTERN**: Uses `animate-pulse` (Tailwind built-in), `border-default` token, matches `.card` utility class from globals.css
- **IMPORTS**: React only — no external deps

```tsx
'use client'

interface ChartSkeletonProps {
  rows?: number
  showTitle?: boolean
  height?: string
}

export function ChartSkeleton({ rows = 1, showTitle = true, height = 'h-48' }: ChartSkeletonProps) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {showTitle && (
        <div className="flex gap-3">
          <div className="h-3 bg-border-default rounded w-32" />
          <div className="h-3 bg-border-default rounded w-20 opacity-60" />
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} bg-border-default rounded-lg opacity-40`} style={{ opacity: 0.4 - i * 0.08 }} />
      ))}
    </div>
  )
}
```

- **VALIDATE**: Import in any page and check it renders without errors: `npm run dev` → navigate to `/deal-pricing`

---

### Task 3 — CREATE `src/components/shared/FadeWrapper.tsx`

- **IMPLEMENT**: Thin wrapper div that re-mounts (triggering CSS fade) when `fadeKey` changes
- **PATTERN**: Uses `animate-fade-in` class defined in Task 1
- **NOTE**: The `key` prop on the outer div is intentional — React will unmount/remount the div whenever `fadeKey` changes, restarting the CSS animation

```tsx
'use client'

interface FadeWrapperProps {
  fadeKey: string
  children: React.ReactNode
  className?: string
}

export function FadeWrapper({ fadeKey, children, className }: FadeWrapperProps) {
  return (
    <div key={fadeKey} className={`animate-fade-in ${className ?? ''}`}>
      {children}
    </div>
  )
}
```

- **GOTCHA**: `key` on a component's own div doesn't work — the `key` must be on the element returned, which it is here. Confirm this works correctly in the browser.
- **VALIDATE**: `npm run build` — TypeScript clean

---

### Task 4 — UPDATE `src/components/charts/WaterfallChart.tsx`

- **IMPLEMENT**: Replace hardcoded `isAnimationActive={false}` with `animateOnMount` pattern
- **PATTERN**: `animateOnMount` state + `useEffect` timeout (1200ms) — see Patterns section above
- **IMPORTS**: Add `useState, useEffect` to existing React import
- **CHANGE**: Lines 88–92 — change `isAnimationActive={false}` to `isAnimationActive={animateOnMount}` on both `<Bar>` elements. Add `animationDuration={900}` to each `<Bar>`.
- **ADD** at top of component body (before return):
  ```tsx
  const [animateOnMount, setAnimateOnMount] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAnimateOnMount(false), 1200)
    return () => clearTimeout(t)
  }, [])
  ```
- **VALIDATE**: `npm run dev` → `/waterfall` — bars animate in on first load, do not re-animate when switching account in FilterBar

---

### Task 5 — UPDATE `src/components/charts/PVMBridge.tsx`

- **IMPLEMENT**: Same `animateOnMount` pattern as Task 4
- **CHANGE**: Lines 158–163 — `isAnimationActive={false}` → `isAnimationActive={animateOnMount}`, add `animationDuration={900}`
- **ADD**: Same `useState/useEffect` block at top of component body
- **IMPORTS**: Add `useState, useEffect` to existing React import
- **VALIDATE**: `npm run dev` → `/pvm` — bridge bars animate in on load, stable on filter change

---

### Task 6 — UPDATE `src/components/charts/WinProbabilityCurve.tsx`

- **IMPLEMENT**: Same `animateOnMount` pattern
- **CHANGE**: Lines 125–147 — change `isAnimationActive={false}` on the `<Line>` and both `<Scatter>` elements to `isAnimationActive={animateOnMount}`. Add `animationDuration={900}` to the `<Line>` element.
- **ADD**: Same `useState/useEffect` block
- **IMPORTS**: Add `useState, useEffect`
- **VALIDATE**: `npm run dev` → `/win-loss` — curve draws in on load

---

### Task 7 — UPDATE `src/components/charts/SegmentationScatter.tsx`

- **IMPLEMENT**: The component already accepts `isAnimationActive` as a prop. Verify the default (when no prop is passed) is `true`. Check `segmentation/page.tsx` line 116 — no prop is passed, so it defaults to the component default.
- **READ** the component prop default carefully before changing anything.
- **IF** the default is already `true`, no code change needed here — just confirm in browser that dots animate in on `/segmentation` initial load.
- **IF** the default is `false`, change the prop default to `true`.
- **GOTCHA**: `DynamicRightPanel` sets `isAnimationActive={false}` for its embedded scatter (line 88) — do NOT change that; the chat panel should not animate the scatter on every message.
- **VALIDATE**: `npm run dev` → `/segmentation` — dots animate in on page load; switching account does NOT re-animate

---

### Task 8 — UPDATE `src/app/segmentation/page.tsx`

- **IMPLEMENT**: Add page-mount skeleton gate + FadeWrapper around the chart section
- **READ** the full page first to understand the layout structure
- **ADD** `mounted` state + 350ms timeout at top of component
- **IMPORT**: `ChartSkeleton`, `FadeWrapper` from `@/components/shared/`
- **PATTERN**:
  ```tsx
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])
  ```
- **WRAP** the main chart area (not the FilterBar or page title) with:
  ```tsx
  {!mounted ? (
    <ChartSkeleton rows={2} height="h-64" />
  ) : (
    <FadeWrapper fadeKey={`${activeAccountId}-${activeProductId}`}>
      {/* existing chart section */}
    </FadeWrapper>
  )}
  ```
- **IMPORTS**: `useState, useEffect` (likely already imported), `ChartSkeleton`, `FadeWrapper`, `useAppContext` (to get account/product for fadeKey)
- **VALIDATE**: `npm run dev` → `/segmentation` — skeleton briefly visible on first load, then chart fades in; switching account triggers fade crossfade

---

### Task 9 — UPDATE `src/app/deal-pricing/page.tsx`

- **IMPLEMENT**: Same skeleton + FadeWrapper pattern as Task 8
- **READ** the full page first — Deal Pricing has multiple sections (price stack, scenario comparison, signals)
- **WRAP** the main content sections (below FilterBar) in `FadeWrapper`
- **USE** `fadeKey={`${activeAccountId}-${activeProductId}`}`
- **ADD** `mounted` gate with `ChartSkeleton rows={3} height="h-32"`
- **VALIDATE**: `npm run dev` → `/deal-pricing` — skeleton on load, fade on filter change

---

### Task 10 — UPDATE `src/app/waterfall/page.tsx`

- **IMPLEMENT**: Same skeleton + FadeWrapper pattern
- **ADD** `mounted` gate: `ChartSkeleton rows={1} height="h-56"`
- **WRAP** chart section in `FadeWrapper`
- **VALIDATE**: `npm run dev` → `/waterfall`

---

### Task 11 — UPDATE `src/app/pvm/page.tsx`

- **IMPLEMENT**: Same skeleton + FadeWrapper pattern
- **ADD** `mounted` gate: `ChartSkeleton rows={1} height="h-56"`
- **VALIDATE**: `npm run dev` → `/pvm`

---

### Task 12 — UPDATE `src/app/win-loss/page.tsx`

- **IMPLEMENT**: Same skeleton + FadeWrapper pattern
- **VALIDATE**: `npm run dev` → `/win-loss`

---

### Task 13 — UPDATE `src/app/ease-of-realization/page.tsx`

- **IMPLEMENT**: Same skeleton + FadeWrapper pattern
- **VALIDATE**: `npm run dev` → `/ease-of-realization`

---

### Task 14 — UPDATE `src/components/shared/ExplainButton.tsx`

- **IMPLEMENT**: Fix silent catch — add `error` state that shows visual feedback for 3 seconds
- **READ** lines 1–55 fully before editing
- **ADD** state:
  ```tsx
  const [error, setError] = useState(false)
  ```
- **UPDATE** catch block:
  ```tsx
  } catch {
    setError(true)
    setTimeout(() => setError(false), 3000)
  } finally {
    setLoading(false)
  }
  ```
- **UPDATE** render — add error branch before the loading branch. Import `AlertCircle` from `lucide-react` (check if already imported):
  ```tsx
  // Error state
  if (error) return (
    <button
      disabled
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 text-sm font-medium shadow-lg"
    >
      <AlertCircle className="w-4 h-4" />
      Try again
    </button>
  )
  ```
- **GOTCHA**: The button has `fixed bottom-6 right-6` positioning — match that exactly in the error branch so it doesn't jump
- **VALIDATE**: Temporarily set `OPENAI_API_KEY` to an invalid value in `.env.local`, navigate to any screen, click Explain — error state should appear. Restore key after.

---

---

## DATA AUDIT & FIXES

These tasks must run before the AI validation tasks. All data issues were found by cross-referencing `data/*.json` files, page components, and the PRD Scenario 1 key numbers.

### Data Issue Summary

| # | File | Issue | Impact |
|---|------|-------|--------|
| D1 | `accounts.json` | Royal Confections `price: 3.80` but `segmentation.json` has `price: 3.70` | Stats row shows €3.80 but dot is at €3.70 on Segmentation |
| D2 | `waterfall.json` | Only 3 entries (baker-klaas/milk-couverture, schoko-retail/milk-couverture, schoko-retail/dark-compound). All other accounts silently show baker-klaas waterfall with no disclaimer | Waterfall page shows wrong account's data without any warning |
| D3 | `ease-of-realization.json` | Only 3 accounts have EoR data (baker-klaas, schoko-retail, confiserie-lambert). Other 7 fall back to baker-klaas silently | EoR page shows wrong account's data without any warning |
| D4 | `chat-scenarios.json` | `baker-klaas-waterfall` response: "9.2% flat rebate — €38,400 total annual leakage". Rebate in `waterfall.json` is €0.77/kg. At 320 kg/month: 320 × 12 × 0.77 = **€2,957/year**, not €38,400. The figure is ~13× too high. | A sharp audience member will catch this if they do mental math |
| D5 | `deal-pricing/page.tsx` | Scenario comparison "Propose +4% uplift" computes `netPrice: listPrice × (1-tier) × 0.96` (i.e. applies 4% *discount*). For baker-klaas the override corrects this to €4.37, but other accounts see a wrong uplift price in the scenario card | Non-baker-klaas Deal Pricing scenario comparison shows incorrect uplift net price |
| D6 | `deal-pricing/page.tsx` | `ExplainButton` keyMetrics doesn't include `grossMarginPct` | AI explain for Deal Pricing can't reference margin impact by number |

---

### Task D1 — UPDATE `data/accounts.json`

- **FIX**: Align Royal Confections `price` to match `segmentation.json`
- **CHANGE**: `"id": "royal-confections"` entry — change `"price": 3.80` → `"price": 3.70`
- **WHY**: Segmentation stats row reads from `accounts.json` but the dot position comes from `segmentation.json`. The two must match for the same product (milk-couverture).
- **VALIDATE**: `npm run dev` → select Royal Confections on Segmentation → stats row shows €3.70/kg and dot is at €3.70/kg ✓

---

### Task D2 — UPDATE `src/app/waterfall/page.tsx`

- **FIX**: Show a fallback notice when displaying baker-klaas data for non-baker-klaas accounts (mirror the PVM page pattern at `pvm/page.tsx` lines 93–98)
- **READ** `src/app/waterfall/page.tsx` lines 20–23 to see the fallback logic
- **ADD**: An `isFallback` flag analogous to PVM:
  ```tsx
  import { getWaterfallForAccount } from '@/lib/data'  // check exact import in data.ts
  const isFallback = !getWaterfallForAccount(accountId, productId) && accountId !== 'baker-klaas'
  ```
- **ADD** below the stats row (mirror `pvm/page.tsx` lines 93–98):
  ```tsx
  {isFallback && (
    <div className="px-3 py-2 bg-page-bg border border-border-default rounded-lg text-xs text-text-muted">
      Showing Baker Klaas data (no waterfall data for selected account/product)
    </div>
  )}
  ```
- **GOTCHA**: `getWaterfallForAccount` takes both `accountId` and `productId`. Check the exact signature in `src/lib/data.ts` before writing the isFallback check.
- **VALIDATE**: `npm run dev` → select any account other than baker-klaas on Waterfall → fallback notice appears

---

### Task D3 — UPDATE `src/app/ease-of-realization/page.tsx`

- **FIX**: Show fallback notice when no EoR data exists for selected account (only baker-klaas, schoko-retail, confiserie-lambert have data)
- **READ** current page lines 18–19: `const eorData = getEoRForAccount(accountId) ?? eorDataset[0]`
- **ADD** isFallback detection:
  ```tsx
  import { getEoRForAccount } from '@/lib/data'
  const isFallback = !getEoRForAccount(accountId) && accountId !== 'baker-klaas'
  const displayAccountId = isFallback ? 'baker-klaas' : accountId
  ```
- **ADD** fallback notice below the composite score card, using the same pattern as PVM/Waterfall
- **VALIDATE**: `npm run dev` → select Nordic Bakes on EoR → fallback notice appears; select baker-klaas → no notice

---

### Task D4 — UPDATE `data/chat-scenarios.json`

- **FIX**: The `baker-klaas-waterfall` scenario response claims "€38,400 total annual leakage". Actual math: 320 kg/month × 12 months × €0.77 rebate/kg = €2,957/year. The figure needs to be corrected.
- **CORRECT response** (update the `response` field for `id: "baker-klaas-waterfall"`):
  ```
  "Baker Klaas has a rebate of €0.77/kg — approximately €2,960 in annual leakage — applied after the invoice discount, bringing net-net price to €4.20/kg on a list price of €5.80/kg. The rebate layer is the primary margin driver and sits above the Mid-Market Benelux norm. Combined with the invoice discount, total deduction is €1.60/kg — a 27.6% departure from list."
  ```
- **NOTE**: Remove the "9.2% flat rebate" and "€38,400" figures entirely — they don't reconcile with the waterfall data and will be caught in a live demo. Replace with figures that math out from waterfall.json.
- **ALSO UPDATE** the `suggestedAction` field to stay consistent with the updated response.
- **VALIDATE**: `npm run dev` → Chat → type "baker klaas rebate" → response should show the corrected figures

---

### Task D5 — UPDATE `src/app/deal-pricing/page.tsx`

- **FIX**: The "Propose +4% uplift" scenario uses `× 0.96` (a discount) instead of `× 1.04` (an uplift). The baker-klaas override corrects it for that account, but other accounts show a wrong net price.
- **READ** lines 53–87 of `deal-pricing/page.tsx` carefully before editing.
- **CHANGE** `scenarios[2]` `netPrice` formula from:
  ```tsx
  netPrice: listPrice * (1 - tierDiscountPct / 100) * 0.96,
  ```
  to:
  ```tsx
  netPrice: listPrice * (1 - tierDiscountPct / 100) * 1.04,
  ```
  The `discountPct: 4` field on this scenario means uplift (positive = uplift in the scenario display context), not an actual discount. The formula should multiply by 1.04.
- **VERIFY** the baker-klaas override still produces €4.37 after this fix:
  - afterTier = 5.80 × (1 - tier/100) = 4.20 (if tier=27.586%) → 4.20 × 1.04 = 4.368 ≈ €4.37 ✓
  - The override `scenarios[2].netPrice = 4.37` can be kept for precision, but the formula will now be correct for other accounts too.
- **VALIDATE**: `npm run dev` → select Schoko Retail on Deal Pricing → scenario comparison "Propose +4% uplift" should show a price HIGHER than the "Hold flat" price, not lower

---

### Task D6 — UPDATE `src/app/deal-pricing/page.tsx` (ExplainButton keyMetrics)

- **FIX**: Add `grossMarginPct` to the keyMetrics sent to ExplainButton so the AI can reference it
- **READ** lines 186–201 (ExplainButton usage) in `deal-pricing/page.tsx`
- **DERIVE** grossMarginPct from the scenarios: when `dealDiscountPct === 0`, the margin is ~18.3% (from `scenarios[1].grossMarginPct`). Build a live computed value:
  ```tsx
  const approxGrossMarginPct = useMemo(() => {
    // Linear interpolation between scenario margins based on current discount
    if (dealDiscountPct <= -5) return 14.1    // grant 5% discount
    if (dealDiscountPct >= 4)  return 19.8    // uplift
    return 18.3 + ((dealDiscountPct / 4) * (19.8 - 18.3))  // interpolate between flat and uplift
  }, [dealDiscountPct])
  ```
- **ADD** `grossMarginPct: approxGrossMarginPct` to the `keyMetrics` object at line ~195
- **VALIDATE**: Click Explain on Deal Pricing with Baker Klaas selected → AI response should mention a specific margin percentage

---

## AI FUNCTIONALITY VALIDATION

These tasks verify that both the Chat and Explain features work correctly with the live API key. Run these AFTER the data fixes above.

### AI Architecture Reminder

- **Chat route** (`/api/chat`): First tries local phrase matching against `chat-scenarios.json`. Only calls OpenAI if no phrase match. Returns scripted `response`, `visualType`, `dataKey`, `tableData`.
- **Explain route** (`/api/explain`): Always calls OpenAI (falls back to static responses only if API key missing or on error). Sends `screen`, `accountId`, `productId`, `keyMetrics` to gpt-4o. Expects JSON with `whatISee`, `whyItMatters`, `recommendedActions`.

### Task A1 — TEST Chat phrase matching (no API key needed)

Verify each scripted scenario matches correctly via local phrase matching:

| Question to type | Expected scenario ID | Expected visual |
|-----------------|---------------------|-----------------|
| `"How does Baker Klaas compare to similar bakers, and are there any cross-sell opportunities?"` | `baker-klaas-segment-comparison` | table (peer comparison) |
| `"baker klaas rebate"` | `baker-klaas-waterfall` | waterfall chart |
| `"Schoko revenue growth"` | `schoko-pvm-analysis` | PVM bridge |
| `"Why does Schoko pay less than Baker Klaas"` | `why-does-schoko-pay-less` | scatter chart |

For each: type the question in Chat, verify the right visual appears in the right panel, and the response text matches the scripted content from `chat-scenarios.json`.

- **VALIDATE**: All 4 questions produce the correct visual and response. No OpenAI call is needed for these (check browser Network tab — `/api/chat` should respond instantly, not show a pending OpenAI call).

---

### Task A2 — TEST Chat OpenAI semantic fallback (requires live API key)

Test an off-script question that won't phrase-match:

| Question | Expected behaviour |
|----------|-------------------|
| `"Tell me about Confiserie Lambert's pricing"` | Should OpenAI-match to `baker-klaas-segment-comparison` or `why-does-schoko-pay-less` (closest relevant), OR return `generic-fallback` gracefully |
| `"What is the best price for dark compound?"` | Should match `why-does-schoko-pay-less` (closest) or fallback |

- **VALIDATE**: Neither question crashes the UI. The response is coherent (even if generic-fallback). No "undefined" or raw JSON displayed.

---

### Task A3 — TEST Explain on Segmentation screen

- **SETUP**: Select Baker Klaas + Milk Couverture in FilterBar on `/segmentation`
- **ACTION**: Click "Explain what I see"
- **EXPECTED response content** (gpt-4o will generate based on keyMetrics):
  - `whatISee` should mention: €4.20/kg current price, €4.57/kg floor (or close), ~-8% vs floor, red zone
  - `whyItMatters` should explain why being below floor is commercially significant
  - `recommendedActions` should include something about a staged uplift / not granting further discounts
- **FAIL criteria**: Generic text that doesn't reference Baker Klaas, €4.20, or the floor. If the response is completely generic (e.g. "This screen shows pricing data"), the keyMetrics are not being sent correctly — check the ExplainButton `keyMetrics` prop and the API route system prompt.
- **ALSO TEST**: Select Schoko Retail + Milk Couverture → Explain → response should reference €3.55/kg, enterprise segment, different floor.

---

### Task A4 — TEST Explain on Deal Pricing screen

- **SETUP**: Select Baker Klaas + Milk Couverture, leave discount slider at 0 (flat)
- **ACTION**: Click "Explain what I see"
- **EXPECTED**: Response mentions €4.20/kg net price, ~18.3% gross margin, the escalation state, and the recommended uplift opportunity
- **THEN**: Move slider to -5 (grant 5% discount), click Explain again
- **EXPECTED**: Response should now mention a lower net price and reference the escalation/approval requirement
- **VALIDATE**: Both responses are specific to the current slider position, not generic

---

### Task A5 — TEST Explain on Waterfall screen

- **SETUP**: Baker Klaas + Milk Couverture
- **ACTION**: Click "Explain what I see"
- **EXPECTED**: Response references net-net price (€4.20/kg), total deduction (€1.60/kg), price realisation (~72.4%), and the highlighted rebate layer
- **FAIL criteria**: Response says "the waterfall shows how list price decomposes" without referencing actual numbers

---

### Task A6 — TEST Explain on PVM screen

- **SETUP**: Select Schoko Retail (the only account with PVM data; others show fallback)
- **ACTION**: Click "Explain what I see"
- **EXPECTED**: Response references the volume/price/mix effects by value (+€42k volume, -€22k price, -€19k mix), flags that both price AND mix are negative, recommends mix-improvement action
- **VALIDATE**: Specific numbers appear in the explain output

---

### Task A7 — TEST Explain on Win/Loss screen

- **SETUP**: Milk Couverture (default)
- **ACTION**: Click "Explain what I see"
- **EXPECTED**: Response mentions optimal price (€4.60/kg), cliff zone (€4.85–€5.10), win rate at current price
- **VALIDATE**: Response references the actual cliff boundaries from `win-loss.json`

---

### Task A8 — TEST Explain on EoR screen

- **SETUP**: Baker Klaas (default)
- **ACTION**: Click "Explain what I see"
- **EXPECTED**: Response mentions composite score (6.2/10), Medium Ease zone, lowest-scoring dimension (RM Cost Impact at 4.5)
- **VALIDATE**: Score and dimension names appear in the explain output

---

### Task A9 — TEST Explain on Chat screen

- **ACTION**: Click "Explain what I see" while on `/chat` with some messages in the thread
- **EXPECTED**: Response explains what the chat interface does and gives guidance on useful questions to ask
- **NOTE**: Chat screen sends no meaningful keyMetrics (the chat thread content isn't serialised). The response will be more generic than other screens — this is acceptable as long as it's coherent and doesn't error.

---

### Task A10 — VERIFY Explain fallback responses (no API key scenario)

- **TEMPORARILY** set `OPENAI_API_KEY=your_key_here` in `.env.local`
- **ACTION**: Click Explain on Segmentation
- **EXPECTED**: The static fallback response renders correctly: "The scatter plot shows account positions relative to the segment floor and target price bands" + 3 actions
- **RESTORE** API key after verification
- **PURPOSE**: Ensure the demo can run without an API key (e.g. offline, no network) and still shows a reasonable explain

---

### Task 15 — FINAL BUILD VALIDATION

- **RUN**: `npm run build` — must complete with zero TypeScript errors and zero ESLint errors
- **RUN**: `npm run dev` — full Scenario 1 walkthrough:
  1. Land on `/chat`, type the Baker Klaas peer comparison question → visual renders in right panel
  2. Navigate to `/segmentation` → skeleton flashes → chart fades in with Baker Klaas red dot → switch account → fade crossfade triggers
  3. Navigate to `/deal-pricing` → skeleton → Deal Pricing loads → slide discount slider past 5% → escalation banner fires
  4. Click "Explain what I see" on `/segmentation` → spinner → panel slides in from right
  5. Navigate to `/waterfall`, `/pvm`, `/win-loss`, `/ease-of-realization` — all load with skeleton then chart
- **CHECK**: No console errors during full walkthrough

---

## TESTING STRATEGY

This project has no automated test suite. Validation is manual visual QA.

### Manual Test Cases

| Test | Expected | Screen |
|------|----------|--------|
| Initial page load | Skeleton shimmer ~350ms, then chart fades in | All screens |
| Filter account change | Chart section fades out → fades in with new data | All screens |
| Chart draw-in | Bars/lines animate on first load only | Waterfall, PVM, Win/Loss |
| Segmentation dots | Dots animate in on page load; no re-animation on filter change | /segmentation |
| ExplainButton loading | Spinner visible during API call | All screens |
| ExplainButton error | "Try again" in red for 3s then resets | All screens |
| ExplainPanel | Slides in from right with transition | All screens |
| Escalation banner | Smooth transition between states | /deal-pricing |
| Scenario 1 full flow | No visual glitches, no console errors | Chat → Segmentation → Deal Pricing |

### Edge Cases

- Filter change during skeleton mount period — FadeWrapper should handle gracefully (key change forces remount regardless)
- ExplainButton clicked twice rapidly — loading state prevents double-click; no duplicate calls
- Recharts animation duration overlap with filter change — `animateOnMount` is set to `false` after 1200ms; if user changes filter before that, the animation is still in-flight but visual is fine

---

## VALIDATION COMMANDS

### Level 1: TypeScript + Lint
```bash
npm run build
```
Zero errors required.

### Level 2: Dev Server
```bash
npm run dev
```
Navigate every screen. No console errors.

### Level 3: Manual Scenario 1 Walkthrough
See Task 15 checklist above.

---

## ACCEPTANCE CRITERIA

**Polish**
- [ ] All chart pages show a skeleton shimmer (~350ms) on initial page mount
- [ ] All chart pages show a fade-in crossfade when account or product changes in FilterBar
- [ ] WaterfallChart, PVMBridge, WinProbabilityCurve bars/lines animate in on initial page load
- [ ] Recharts animations do NOT re-trigger on filter switches
- [ ] ExplainButton shows a red "Try again" error state (instead of silent failure) for 3 seconds on API error
- [ ] `npm run build` passes with zero TypeScript and ESLint errors

**Data Integrity**
- [ ] Royal Confections shows €3.70/kg in both the segmentation stats row and the dot position
- [ ] Waterfall page shows a fallback notice for accounts without waterfall data
- [ ] EoR page shows a fallback notice for accounts without EoR data
- [ ] Chat "baker klaas rebate" scenario response references correct figures (€0.77/kg, ~€2,960/year)
- [ ] Deal Pricing "Propose +4% uplift" scenario shows a net price HIGHER than "Hold flat" for all accounts
- [ ] Deal Pricing Explain response references a gross margin percentage

**AI Functionality**
- [ ] All 4 scripted chat scenarios phrase-match correctly and show the right visual
- [ ] Off-script questions return graceful fallback (no crashes, no raw JSON)
- [ ] Explain on Segmentation references actual €/kg values and % vs floor
- [ ] Explain on Deal Pricing references the current net price and escalation state
- [ ] Explain on Waterfall references net-net price and highlighted rebate layer
- [ ] Explain on PVM references the signed effects (volume/price/mix) by value
- [ ] Explain panel renders on all 7 screens without console errors

**Overall**
- [ ] Full Scenario 1 walkthrough (Chat → Segmentation → Deal Pricing) runs with zero console errors and zero visual glitches
- [ ] All screens render correctly at 1440×900 viewport

---

## COMPLETION CHECKLIST

**Polish Tasks**
- [ ] Task 1 — globals.css animation utilities added
- [ ] Task 2 — ChartSkeleton component created
- [ ] Task 3 — FadeWrapper component created
- [ ] Task 4 — WaterfallChart animated on mount
- [ ] Task 5 — PVMBridge animated on mount
- [ ] Task 6 — WinProbabilityCurve animated on mount
- [ ] Task 7 — SegmentationScatter mount animation verified
- [ ] Task 8 — Segmentation page skeleton + fade
- [ ] Task 9 — Deal Pricing page skeleton + fade
- [ ] Task 10 — Waterfall page skeleton + fade
- [ ] Task 11 — PVM page skeleton + fade
- [ ] Task 12 — Win/Loss page skeleton + fade
- [ ] Task 13 — EoR page skeleton + fade
- [ ] Task 14 — ExplainButton error state

**Data Fixes**
- [ ] Task D1 — Royal Confections price aligned in accounts.json
- [ ] Task D2 — Waterfall page fallback notice added
- [ ] Task D3 — EoR page fallback notice added
- [ ] Task D4 — Chat waterfall scenario figures corrected
- [ ] Task D5 — Deal Pricing uplift scenario formula fixed
- [ ] Task D6 — Deal Pricing ExplainButton keyMetrics includes grossMarginPct

**AI Validation**
- [ ] Task A1 — All 4 scripted chat scenarios phrase-match correctly
- [ ] Task A2 — Off-script questions return graceful fallback
- [ ] Task A3 — Explain on Segmentation references specific metrics
- [ ] Task A4 — Explain on Deal Pricing reflects current slider state
- [ ] Task A5 — Explain on Waterfall references waterfall figures
- [ ] Task A6 — Explain on PVM references signed effects
- [ ] Task A7 — Explain on Win/Loss references cliff zone
- [ ] Task A8 — Explain on EoR references composite score
- [ ] Task A9 — Explain on Chat is coherent
- [ ] Task A10 — Fallback explain works without API key

**Final**
- [ ] Task 15 — Final build + Scenario 1 walkthrough

---

## NOTES

**Why 350ms skeleton delay?** It's intentional — just long enough that a live audience registers "the system is loading data" without being annoying. Without any delay, the data appears instantaneously, betraying the static JSON source. This is a demo credibility detail.

**Why disable Recharts animation after 1200ms?** Filter switches should feel instant (<100ms per PRD quality criteria). If animation is still enabled when a filter changes, the chart redraws with animation which looks sluggish. The 1200ms window covers the initial draw-in and then locks out further animation.

**What's intentionally NOT in this plan:**
- React Error Boundaries — the app won't hit uncaught errors in a controlled demo; adds complexity for no demo benefit
- Stagger animations on list items — too flashy for a serious pricing tool; would feel like a marketing site
- Page transition animations between routes — Next.js App Router doesn't support shared layout transitions without extra libraries; the skeleton approach achieves the same credibility signal at zero complexity cost
- Cross-browser testing — manual activity for the presenter; not automatable

**Confidence score: 8.5/10** — All patterns are directly derivable from existing code. The only risk is the `key`-driven FadeWrapper pattern, which is a React pattern that works reliably but should be confirmed in browser on first pass.
