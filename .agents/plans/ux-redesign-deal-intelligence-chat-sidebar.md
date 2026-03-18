# Feature: UX Redesign — Deal Intelligence, Chat Enhancements, Sidebar Collapse

The following plan should be complete, but validate codebase patterns and task sanity before implementing. Pay special attention to the existing Tailwind token names (text-zone-red, bg-zone-amber-bg, etc.), the exact structure of page components, and the shared ExplainButton/ExplainPanel wiring pattern.

## Feature Description

A multi-part UX overhaul of the Equazion pricing demo tool covering: merging Win/Loss and Ease of Realization screens into a unified Deal Intelligence page with a Deal Score, renaming and reorganising the sidebar navigation, adding a sidebar collapse toggle, adding suggested question chips to the chat page, adding a contextual per-page chat panel on all analytical screens, and renaming the demo persona (Sarah → Maxime) and account display name (Baker Klaas → Bakker Klaas).

## User Story

As a PwC consultant demoing Equazion to a live audience,
I want a unified Deal Intelligence view, contextual AI chat on every page, and a collapsible sidebar,
So that the demo flows more naturally, the presenter can ask AI questions without leaving the current screen, and the UI maximises chart space during screen share.

## Problem Statement

Currently: (1) Win/Loss and EoR are separate screens the presenter must navigate between; (2) the sidebar always occupies 240px even when the presenter wants full-screen charts; (3) the main chat page has no conversational prompts to guide a live audience; (4) every analytical page requires the presenter to navigate away to ask an AI question; (5) the demo uses the wrong name spelling (Baker Klaas) and a different presenter persona (Sarah).

## Solution Statement

Merge Win/Loss + EoR into a single Deal Intelligence page with a computed Deal Score tile. Add a collapsible sidebar. Add suggested question chips to the chat page. Add a ContextualChatPanel slide-in on all 5 analytical pages. Rename throughout.

## Feature Metadata

**Feature Type**: Enhancement (UX redesign + new components)
**Estimated Complexity**: High
**Primary Systems Affected**: Sidebar, all 7 page routes, ExplainButton positioning, chat API, explain API, data files
**Dependencies**: lucide-react (already installed), Next.js App Router redirects

---

## CONTEXT REFERENCES

### Relevant Codebase Files — READ THESE BEFORE IMPLEMENTING

- `src/components/layout/Sidebar.tsx` (lines 1–73) — Current NAV_ITEMS array structure, `clsx` active state pattern, PwC footer. Mirror this for collapse toggle.
- `src/components/layout/TopBar.tsx` (lines 1–36) — SCREEN_TITLES lookup, avatar "S"/Sarah to update.
- `src/app/win-loss/page.tsx` (lines 1–122) — Full page to merge. Contains `interpolateWinRate` util, `FadeWrapper`, `ChartSkeleton`, `ExplainButton` wiring pattern.
- `src/app/ease-of-realization/page.tsx` (lines 1–151) — Full page to merge. Composite score tile, dimension bars, sortable table.
- `src/app/chat/page.tsx` (lines 1–166) — Full chat page to copy to `/ask-your-data`. `handleSubmit` function to reuse in SuggestedQuestions.
- `src/components/chat/MessageInput.tsx` (lines 1–67) — Input component with context chip. Pattern to follow for SuggestedQuestions placement.
- `src/components/charts/WinProbabilityCurve.tsx` (lines 1–158) — Current chart (no legend). `ComposedChart` with `ReferenceArea`, `ReferenceLine`, `Line`, `Scatter` from recharts.
- `src/components/charts/EoRDimensions.tsx` (lines 1–29) — Simple dimension bar component to reuse in Deal Intelligence.
- `src/components/shared/ExplainButton.tsx` (lines 1–64) — `fixed bottom-6 right-6 z-40` positioning. Must shift to `right-[124px]` on pages with contextual chat.
- `src/components/shared/ExplainPanel.tsx` (lines 1–80) — Has backdrop overlay (`bg-black/20`). ContextualChatPanel must NOT have this.
- `src/components/shared/FadeWrapper.tsx` — Wraps content with `key={fadeKey}` for re-animation on filter change.
- `src/components/shared/ChartSkeleton.tsx` — Loading skeleton pattern used in every page.
- `src/app/api/explain/route.ts` (lines 1–125) — `FALLBACK_RESPONSES` object keyed by screen name. Add `"deal-intelligence"` and `"ask-your-data"` entries.
- `src/app/api/chat/route.ts` (lines 1–101) — OpenAI semantic routing, returns `scenarioId`, `response`, `visualType`, `dataKey`. Used by ContextualChatPanel too.
- `src/components/cpq/WinProbSignal.tsx` (line 47) — Link to `/win-loss` → must update to `/deal-intelligence`.
- `src/components/cpq/EoRSignal.tsx` (line 42) — Link to `/ease-of-realization` → must update to `/deal-intelligence`.
- `data/accounts.json` — `"name": "Baker Klaas"` on `baker-klaas` entry. Display name only.
- `data/chat-scenarios.json` — All response text strings with "Baker Klaas" to rename. 2 new scenarios to add.
- `src/app/segmentation/page.tsx` — Reference for how pages wire ExplainButton. Will receive ContextualChatPanel.
- `src/app/waterfall/page.tsx` — Has "Baker Klaas" fallback text. Will receive ContextualChatPanel.
- `src/app/pvm/page.tsx` — Will receive ContextualChatPanel.
- `src/app/cpq/page.tsx` — Will receive ContextualChatPanel.
- `next.config.mjs` — Add redirects here for old routes.

### New Files to Create

- `src/app/deal-intelligence/page.tsx` — Merged Win/Loss + EoR + Deal Score page
- `src/app/ask-your-data/page.tsx` — Renamed chat page (copy of chat/page.tsx + SuggestedQuestions)
- `src/lib/interpolateWinRate.ts` — Extract shared util (currently duplicated in 3 files)
- `src/components/chat/SuggestedQuestions.tsx` — Clickable question chips for chat page
- `src/components/chat/ContextualChatPanel.tsx` — Per-page AI chat slide-in panel
- `src/lib/contextualPrompts.ts` — Screen-specific auto-summary prompt builders

### Patterns to Follow

**Page component structure (every page):**
```tsx
'use client'
import { useState, useEffect } from 'react'
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'

export default function SomePage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])
  // ...
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      {!mounted ? (
        <div className="flex-1 p-6"><ChartSkeleton rows={2} height="h-56" /></div>
      ) : (
        <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}-${activeProductId ?? 'none'}`} className="...">
          {/* content */}
        </FadeWrapper>
      )}
      <ExplainButton screen="page-name" ... onResult={(r) => { setExplainResult(r); setExplainOpen(true) }} />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
```

**Tailwind color tokens used in the project:**
- `text-zone-red`, `text-zone-amber`, `text-zone-green`
- `bg-zone-red-bg`, `bg-zone-amber-bg`, `bg-zone-green-bg`
- `text-pwc-orange`, `text-pwc-orange-dark`, `bg-pwc-orange`, `bg-pwc-orange/10`
- `text-text-primary`, `text-text-secondary`, `text-text-muted`
- `border-border-default`, `bg-page-bg`, `bg-sidebar-bg`, `bg-sidebar-active`, `bg-sidebar-hover`
- `card` class — utility class used for white cards with border and shadow

**FadeWrapper pattern:** wrap the main content area, use `fadeKey` combining `activeAccountId` and `activeProductId`.

**ExplainButton is always `fixed bottom-6 right-6 z-40`** — when ContextualChatPanel button is also present on a page, ExplainButton must move to `right-[124px]` and chat trigger sits at `right-6`.

**interpolateWinRate** — currently duplicated in `win-loss/page.tsx`, `WinProbabilityCurve.tsx`, and `WinProbSignal.tsx`. Extract to `src/lib/interpolateWinRate.ts` and import from there.

---

## IMPLEMENTATION PLAN

### Phase 1: Data and Name Changes (zero-risk, no structural changes)

Rename display strings only. Account IDs never change.

### Phase 2: Core New Pages (Deal Intelligence + Ask Your Data)

Build the merged Deal Intelligence page and the renamed Ask Your Data page.

### Phase 3: Sidebar Updates (renames + collapse toggle)

Update NAV_ITEMS, add collapse state machine with localStorage persistence.

### Phase 4: Chat Enhancements

Add SuggestedQuestions component to Ask Your Data page.

### Phase 5: Per-Page Contextual Chat Panel

Build ContextualChatPanel and wire it into all 5 analytical pages.

---

## STEP-BY-STEP TASKS

### TASK 1 — EXTRACT shared interpolateWinRate utility

**CREATE** `src/lib/interpolateWinRate.ts`
```ts
export function interpolateWinRate(curve: { price: number; winRate: number }[], price: number): number {
  const sorted = [...curve].sort((a, b) => a.price - b.price)
  if (price <= sorted[0].price) return sorted[0].winRate
  if (price >= sorted[sorted.length - 1].price) return sorted[sorted.length - 1].winRate
  const lower = sorted.filter(p => p.price <= price).at(-1)!
  const upper = sorted.find(p => p.price > price)!
  const t = (price - lower.price) / (upper.price - lower.price)
  return lower.winRate + t * (upper.winRate - lower.winRate)
}
```
- **REMOVE** the duplicate `interpolateWinRate` function bodies from: `src/app/win-loss/page.tsx`, `src/components/charts/WinProbabilityCurve.tsx`, `src/components/cpq/WinProbSignal.tsx`
- **ADD** `import { interpolateWinRate } from '@/lib/interpolateWinRate'` to each of those three files
- **GOTCHA**: Do not change anything else in those files during this task
- **VALIDATE**: `npm run build` — zero TypeScript errors

---

### TASK 2 — UPDATE data/accounts.json — rename Baker Klaas → Bakker Klaas

**UPDATE** `data/accounts.json`
- Find the entry with `"id": "baker-klaas"`
- Change `"name": "Baker Klaas"` → `"name": "Bakker Klaas"`
- Do NOT change the `id` field or any other field
- **VALIDATE**: `grep -r "Baker Klaas" data/` should return 0 results after this change. `grep -r "baker-klaas" data/` should return many results (IDs intact).

---

### TASK 3 — UPDATE data/chat-scenarios.json — rename + 2 new scenarios

**UPDATE** `data/chat-scenarios.json`
- Replace all occurrences of `"Baker Klaas"` (display text in `response` and `tableData` strings) with `"Bakker Klaas"`
- Do NOT change `matchPhrases` values that say `"baker klaas"` (lowercase) — these are for fuzzy matching by the AI and can stay. Optionally add `"bakker klaas"` variants alongside.
- Do NOT change `"accountId": "baker-klaas"` fields
- **ADD** two new scenario objects at the end of the array (before the closing `]`):

```json
{
  "id": "baker-klaas-win-probability",
  "matchPhrases": [
    "is this a safe price to quote",
    "safe price bakker klaas",
    "win probability bakker klaas",
    "will we win at 4.37",
    "what is the win rate",
    "should I quote bakker klaas",
    "deal risk bakker klaas",
    "cliff zone milk couverture"
  ],
  "accountId": "baker-klaas",
  "productId": "milk-couverture",
  "response": "At €4.37/kg — the recommended +4% uplift — win probability on Milk Couverture is approximately 75%. That is above the cliff zone, which begins at €4.85/kg. The optimal price point is €4.60/kg, and the current price of €4.20/kg carries an 82% win rate. The uplift to €4.37 is a commercially sound step: it recovers margin without entering the danger zone. Bakker Klaas's EoR score of 6.2/10 is medium — the deal is winnable and the account is manageable, but a performance-linked rebate structure is recommended at renewal.",
  "visualType": "scatter",
  "dataKey": "milk-couverture",
  "suggestedAction": "Quote €4.37/kg with a performance rebate condition — justified by segment position and comfortably below the price cliff",
  "tableData": null
},
{
  "id": "baker-klaas-cross-sell",
  "matchPhrases": [
    "cross-sell bakker klaas",
    "what else can I sell bakker klaas",
    "other products bakker klaas",
    "expand bakker klaas",
    "bakker klaas product range",
    "white couverture bakker klaas",
    "cocoa powder bakker klaas"
  ],
  "accountId": "baker-klaas",
  "productId": null,
  "response": "Bakker Klaas does not currently purchase White Couverture or Cocoa Powder. Both products have a 73% co-purchase rate among similar Mid-Market Benelux bakers. White Couverture carries a segment target of €5.18/kg — a higher-margin SKU than Milk Couverture. A trial bundle at introductory pricing alongside the Milk Couverture renewal is the recommended approach. Pâtisserie Moreau and Confiserie Lambert — direct segment peers — both purchase all three products.",
  "visualType": "table",
  "dataKey": "baker-klaas-peer-comparison",
  "suggestedAction": "Propose a White Couverture + Cocoa Powder trial bundle at introductory rate alongside the Milk Couverture renewal",
  "tableData": null
}
```

- **VALIDATE**: `npm run build` — the JSON must be valid. Verify with `node -e "JSON.parse(require('fs').readFileSync('data/chat-scenarios.json','utf8'))"`.

---

### TASK 4 — UPDATE TopBar.tsx — Sarah → Maxime, screen titles

**UPDATE** `src/components/layout/TopBar.tsx`
- Change `"S"` → `"M"` (avatar initial, line 29)
- Change `"Sarah"` → `"Maxime"` (display name, line 31)
- Update `SCREEN_TITLES`:
  - Remove: `'/win-loss': 'Win / Loss Price Intelligence'`
  - Remove: `'/ease-of-realization': 'Ease of Realization'`
  - Add: `'/deal-intelligence': 'Deal Intelligence'`
  - Change: `'/chat': 'Chat with Your Data'` → `'/ask-your-data': 'Ask Your Data'`
  - Change: `'/pvm': 'PVM Bridge'` → `'/pvm': 'Price-Volume-Mix'`
- **VALIDATE**: `npm run build`

---

### TASK 5 — UPDATE src/app/api/chat/route.ts — update fuzzy match comment

**UPDATE** `src/app/api/chat/route.ts` line 59
- Change the comment `"Baker Klaar" means "Baker Klaas"` → `"Baker Klaar" means "Bakker Klaas"`
- **VALIDATE**: `npm run build`

---

### TASK 6 — UPDATE src/app/api/explain/route.ts — new entries + update copy

**UPDATE** `src/app/api/explain/route.ts`
- Change key `'chat'` in `FALLBACK_RESPONSES` to `'ask-your-data'` (keep same content)
- **ADD** new entry for `'deal-intelligence'`:
```ts
'deal-intelligence': {
  whatISee: 'The Deal Intelligence page combines win probability at the current quoted price with the Ease of Realization composite score to produce a single Deal Score for this account and product.',
  whyItMatters: 'A high win rate alone does not make a good deal — EoR flags whether the account can deliver the contracted value. The Deal Score synthesises both signals into one actionable verdict.',
  recommendedActions: [
    'Check the Deal Score before submitting any quote — green (≥70) means proceed, amber (45–69) means attach conditions',
    'If EoR is below 6.0, review the weakest dimension before agreeing to a price concession',
    'Use the cliff zone on the win curve to set the hard floor for this negotiation',
  ],
},
```
- Keep the old `'win-loss'` and `'ease-of-realization'` entries (do not delete — they may be hit via old bookmarks)
- **VALIDATE**: `npm run build`

---

### TASK 7 — UPDATE waterfall page — fallback notice text

**UPDATE** `src/app/waterfall/page.tsx`
- Find the string `"Showing Baker Klaas data"` (wherever it appears as a fallback notice)
- Replace with `"Showing Bakker Klaas data"`
- **VALIDATE**: `npm run build`

---

### TASK 8 — UPDATE CPQ signals — link targets

**UPDATE** `src/components/cpq/WinProbSignal.tsx` line 47
- Change `href="/win-loss"` → `href="/deal-intelligence"`

**UPDATE** `src/components/cpq/EoRSignal.tsx` line 42
- Change `href="/ease-of-realization"` → `href="/deal-intelligence"`

- **VALIDATE**: `npm run build`

---

### TASK 9 — CREATE src/app/deal-intelligence/page.tsx — merged page

**CREATE** `src/app/deal-intelligence/page.tsx`

This page merges the existing Win/Loss and EoR pages into a single vertical scroll layout with a Deal Score tile at the top.

**Import list:**
```tsx
'use client'
import { useState, useEffect } from 'react'
import { accounts, products, getWinLossForProduct, getEoRForAccount, eorDataset } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { WinProbabilityCurve } from '@/components/charts/WinProbabilityCurve'
import { EoRDimensions } from '@/components/charts/EoRDimensions'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'
import { interpolateWinRate } from '@/lib/interpolateWinRate'
import { ChevronUp, ChevronDown } from 'lucide-react'
```

**Deal Score formula (compute in the component):**
```ts
const dealScore = Math.round((winRateAtCurrent / 100) * 0.6 * 100 + (eorCompositeScore / 10) * 0.4 * 100)
// dealScore is 0–100
const dealScoreZone = dealScore >= 70 ? 'green' : dealScore >= 45 ? 'amber' : 'red'
const dealScoreLabel = dealScore >= 70 ? 'Proceed' : dealScore >= 45 ? 'Proceed with Conditions' : 'Escalate / Review'
```

**Page layout structure:**
```
<FilterBar />
{!mounted ? <ChartSkeleton /> : (
  <FadeWrapper fadeKey={`${activeAccountId}-${activeProductId}`} className="flex-1 flex flex-col overflow-y-auto">
    <div className="p-6 flex flex-col gap-6">

      {/* DEAL SCORE TILE — top of page */}
      <div className="card p-5 flex items-center gap-6">
        {/* Large Deal Score number (0–100) with zone badge */}
        {/* Win rate at current price */}
        {/* EoR composite score */}
      </div>

      {/* SECTION 1 — Win Probability */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Win Probability Analysis</span>
          <div className="h-px flex-1 bg-border-default" />
        </div>
        <div className="flex gap-6" style={{ minHeight: 320 }}>
          {/* Chart card (65%) */}
          <div className="card flex-1 p-4" style={{ flexBasis: '65%' }}>
            {/* h2 title */}
            {/* WinProbabilityCurve — 280px height */}
            {/* WinLossLegend below chart */}
          </div>
          {/* Insight panel (35%) */}
          <div className="card p-5 flex flex-col gap-4" style={{ flexBasis: '35%' }}>
            {/* Optimal Price */}
            {/* Gap to Optimal — new metric */}
            {/* Cliff Zone with specific win rate numbers */}
            {/* Win Rate at Current Price with zone label */}
            {/* Historical quote count */}
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border-default" />
        <span className="text-xs font-semibold text-pwc-orange uppercase tracking-wide px-2">Deal Closability</span>
        <div className="h-px flex-1 bg-border-default" />
      </div>

      {/* SECTION 2 — Ease of Realization */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Ease of Realization</span>
          <div className="h-px flex-1 bg-border-default" />
        </div>
        <div className="flex gap-6">
          {/* Left: composite score + dimension bars (45%) */}
          <div className="flex flex-col gap-4" style={{ flexBasis: '45%' }}>
            {/* Composite score card */}
            {/* isFallback notice */}
            {/* EoRDimensions */}
          </div>
          {/* Right: sortable account comparison table (55%) */}
          <div className="card p-4 overflow-y-auto" style={{ flexBasis: '55%' }}>
            {/* Same table as ease-of-realization/page.tsx lines 93–136 */}
          </div>
        </div>
      </div>

    </div>
  </FadeWrapper>
)}
<ExplainButton screen="deal-intelligence" ... rightOffset="right-[124px]" ... />
<ExplainPanel ... />
```

**IMPORTANT — Insight panel additions (beyond the existing win-loss page):**
1. "Gap to Optimal" metric: `€${(winLossData.optimalPrice - currentPrice).toFixed(2)}/kg` — amber if positive (current below optimal)
2. Cliff zone description: `"Quoting above €${cliffMin.toFixed(2)}/kg risks deal loss"` with computed win rates at cliff boundaries
3. Zone context label below win rate: `"Safe zone — strong win probability"` / `"Caution — approaching cliff"` / `"Danger — high deal loss risk"`

**keyMetrics for ExplainButton:**
```ts
const keyMetrics = {
  winRateAtCurrentPrice: winRateAtCurrent,
  eorCompositeScore: eorCompositeScore,
  dealScore,
  cliffMin: winLossData.cliffMin,
  cliffMax: winLossData.cliffMax,
  optimalPrice: winLossData.optimalPrice,
  currentPrice,
  weakestEoRDimension: [...eorData.dimensions].sort((a, b) => a.score - b.score)[0]?.name,
}
```

**ExplainButton positioning on this page:** since ContextualChatPanel (Task 14) will add a chat trigger at `right-6`, move ExplainButton to `right-[124px]`. Add a prop `className` override to ExplainButton or apply inline. See Task 13 for ExplainButton modification.

**EoR data fallback:** mirror the EoR page pattern exactly:
```ts
const accountId = activeAccountId ?? 'baker-klaas'
const eorData = getEoRForAccount(accountId) ?? eorDataset[0]
const isFallback = !getEoRForAccount(accountId) && accountId !== 'baker-klaas'
```
But use `"Bakker Klaas"` in the fallback notice string.

**Win/Loss data fallback:** mirror the win-loss page pattern:
```ts
const productId = activeProductId ?? 'milk-couverture'
const winLossData = getWinLossForProduct(productId) ?? getWinLossForProduct('milk-couverture')!
const account = accounts.find(a => a.id === activeAccountId)
const currentPrice = account?.price ?? winLossData.optimalPrice
```

- **VALIDATE**: `npm run build` — page renders without errors. Navigate to `/deal-intelligence` — both sections visible, Deal Score shows.

---

### TASK 10 — CREATE Win/Loss Legend as inline component in deal-intelligence page

**ADD** a `WinLossLegend` inline component (or a small standalone file `src/components/charts/WinLossLegend.tsx`) that renders a horizontal legend strip below the `WinProbabilityCurve` chart container.

**Legend items (render as flex row, `flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1`):**

Each item: `flex items-center gap-1.5 text-[10px] text-text-muted`

| Swatch | Label |
|--------|-------|
| `<span className="w-3 h-3 rounded-full bg-zone-green inline-block" />` | Won deal |
| `<span className="w-3 h-3 rounded-full bg-zone-red inline-block" />` | Lost deal |
| `<span className="w-5 h-px bg-pwc-orange inline-block" />` | Win probability curve |
| `<span className="w-5 h-2 bg-zone-red/20 border border-zone-red/40 inline-block rounded-sm" />` | Price cliff zone |
| `<span className="w-5 border-t-2 border-dashed border-[#6d6e71] inline-block" />` | Current price |
| `<span className="w-5 border-t-2 border-dashed border-zone-green inline-block" />` | Optimal price |

Props: `{ optimalPrice: number; currentPrice?: number }`

Place this component immediately after the `<div style={{ height: '280px' }}>` block (the WinProbabilityCurve container), inside the chart card.

- **VALIDATE**: Legend visible below chart at `/deal-intelligence`.

---

### TASK 11 — REDIRECT old win-loss and ease-of-realization routes

**UPDATE** `next.config.mjs` — add redirects:
```js
const nextConfig = {
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/win-loss', destination: '/deal-intelligence', permanent: false },
      { source: '/ease-of-realization', destination: '/deal-intelligence', permanent: false },
      { source: '/chat', destination: '/ask-your-data', permanent: false },
    ]
  },
}
```

**UPDATE** `src/app/win-loss/page.tsx` — replace the entire file body with:
```tsx
import { redirect } from 'next/navigation'
export default function WinLossRedirect() {
  redirect('/deal-intelligence')
}
```

**UPDATE** `src/app/ease-of-realization/page.tsx` — same pattern pointing to `/deal-intelligence`.

- **GOTCHA**: Keep the old files as redirect stubs (not deleted) so any bookmarked links still work.
- **VALIDATE**: Navigating to `/win-loss` or `/ease-of-realization` redirects to `/deal-intelligence`.

---

### TASK 12 — CREATE src/app/ask-your-data/page.tsx

**CREATE** `src/app/ask-your-data/page.tsx`
- Copy the full content of `src/app/chat/page.tsx` verbatim
- Change the `ExplainButton` `screen` prop from `"chat"` to `"ask-your-data"`
- Add `SuggestedQuestions` component (Task 16) between the ConversationThread div and the MessageInput
- **DO NOT** modify `src/app/chat/page.tsx` yet — it becomes a redirect stub in Task 11

**UPDATE** `src/app/chat/page.tsx` (after ask-your-data is confirmed working):
```tsx
import { redirect } from 'next/navigation'
export default function ChatRedirect() {
  redirect('/ask-your-data')
}
```

- **VALIDATE**: `/ask-your-data` renders the full chat page. `/chat` redirects there.

---

### TASK 13 — UPDATE ExplainButton — add optional className prop

**UPDATE** `src/components/shared/ExplainButton.tsx`
- Add `className?: string` to `ExplainButtonProps`
- In the button JSX, change the hardcoded `"fixed bottom-6 right-6 z-40 ..."` to use `clsx`:
```tsx
import { clsx } from 'clsx'
// ...
className={clsx(
  'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg text-white rounded-full shadow-lg hover:bg-pwc-orange transition-colors text-sm font-medium disabled:opacity-60',
  props.className ?? 'right-6'
)}
```
- This allows pages with the ContextualChatPanel to pass `className="right-[124px]"` without changing the default behavior on other pages.
- **GOTCHA**: `clsx` is already imported in the project. `import { clsx } from 'clsx'`
- **VALIDATE**: `npm run build`. All existing pages still show ExplainButton at `right-6`.

---

### TASK 14 — UPDATE Sidebar — renames + collapse toggle

**UPDATE** `src/components/layout/Sidebar.tsx`

**Step A — Update NAV_ITEMS:**
```ts
import { MessageSquare, ScatterChart, Calculator, Target, Layers, GitBranch } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/ask-your-data', label: 'Ask Your Data', icon: MessageSquare },
  { href: '/segmentation', label: 'Segmentation', icon: ScatterChart },
  { href: '/cpq', label: 'CPQ', icon: Calculator },
  { href: '/deal-intelligence', label: 'Deal Intelligence', icon: Target },
  { href: '/waterfall', label: 'Price Waterfall', icon: Layers },
  { href: '/pvm', label: 'Price-Volume-Mix', icon: GitBranch },
]
```
- `TrendingUp` and `BarChart2` are removed from imports (Win/Loss and EoR no longer have nav items).
- `Target` is the lucide-react crosshair icon — import it.

**Step B — Add collapse state:**
```ts
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('equazion-sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapse() {
    setCollapsed(v => {
      localStorage.setItem('equazion-sidebar-collapsed', String(!v))
      return !v
    })
  }
  // ...
```

**Step C — Conditional layout:**
```tsx
<aside
  className={clsx(
    'relative flex flex-col min-h-screen bg-sidebar-bg shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out',
    collapsed ? 'w-14' : 'w-60'
  )}
>
  {/* Logo area */}
  <div className="flex items-center px-5 py-5 border-b border-white/10 min-h-[68px]">
    {!collapsed && <EquazionLogo bg="rgb(50,51,54)" fontSize={28} />}
  </div>

  {/* Toggle button — overlaps right edge */}
  <button
    onClick={toggleCollapse}
    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    className="absolute top-[52px] -right-3 z-10 w-6 h-6 rounded-full bg-sidebar-bg border border-white/20 text-white/60 hover:text-white flex items-center justify-center shadow-md"
  >
    {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
  </button>

  {/* Navigation */}
  <nav className="flex flex-col gap-0.5 px-2 py-4 flex-1">
    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
      const isActive = pathname === href || pathname.startsWith(href + '/')
      return (
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
          {!collapsed && <span>{label}</span>}
        </Link>
      )
    })}
  </nav>

  {/* PwC Footer */}
  <div className={clsx('flex items-center gap-2 px-5 py-4 border-t border-white/10', collapsed && 'justify-center px-2')}>
    <Image src="/pwc-logo-white.svg" alt="PwC" width={collapsed ? 24 : 36} height={18} className="opacity-60" />
    {!collapsed && <span className="text-white/40 text-xs">Commercial Intelligence</span>}
  </div>
</aside>
```

- **GOTCHA**: The `aside` must keep `shrink-0` — the main content area reflows automatically via flexbox when the aside width changes.
- **GOTCHA**: `overflow-hidden` on the aside ensures label text clips cleanly during the width transition (no text wrapping).
- **VALIDATE**: `npm run build`. Sidebar collapses to icons, expands back. Collapsed state persists across page refresh (stored in localStorage).

---

### TASK 15 — CREATE src/components/chat/SuggestedQuestions.tsx

**CREATE** `src/components/chat/SuggestedQuestions.tsx`

```tsx
'use client'

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
}

const DEFAULT_QUESTIONS = [
  'How does Bakker Klaas compare to similar bakers in the segment?',
  'Where is the margin going on the Bakker Klaas account?',
  'Is €4.37/kg a safe price to quote Bakker Klaas on Milk Couverture?',
  'What other products should I be discussing with Bakker Klaas?',
]

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-4 pb-3 flex flex-wrap gap-2">
      <p className="w-full text-[10px] text-text-muted font-medium uppercase tracking-wide mb-1">Suggested questions</p>
      {DEFAULT_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 text-xs rounded-full border border-pwc-orange/30 text-pwc-orange-dark bg-pwc-orange/5 hover:bg-pwc-orange/10 transition-colors text-left"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
```

**GOTCHA**: The chips should only render when `messages.length === 0`. Control this in the parent page, not inside this component (keep the component pure). In `ask-your-data/page.tsx`, render `{messages.length === 0 && <SuggestedQuestions onSelect={handleSubmit} />}` between the thread div and the MessageInput.

- **VALIDATE**: Chips appear on empty chat. Clicking a chip auto-submits the question. Chips disappear after first message sent.

---

### TASK 16 — CREATE src/lib/contextualPrompts.ts

**CREATE** `src/lib/contextualPrompts.ts`

This file contains per-screen prompt builders for the ContextualChatPanel auto-summary.

```ts
export type ScreenId = 'segmentation' | 'cpq' | 'deal-intelligence' | 'waterfall' | 'pvm'

export function buildContextualPrompt(
  screen: ScreenId,
  accountName: string | null,
  productName: string | null,
  keyMetrics: Record<string, unknown>
): string {
  const acct = accountName ?? 'the selected account'
  const prod = productName ?? 'the selected product'

  switch (screen) {
    case 'segmentation':
      return `Summarise what you see on the segmentation screen for ${acct} on ${prod}. Current price: €${keyMetrics.currentPrice ?? '?'}/kg. Floor: €${keyMetrics.floorPrice ?? '?'}/kg. Target: €${keyMetrics.targetPrice ?? '?'}/kg. Zone: ${keyMetrics.zone ?? 'unknown'}. Be specific, analytical, and concise — 3 sentences max.`

    case 'cpq':
      return `Summarise the CPQ pricing situation for ${acct} on ${prod}. Give a brief analysis of the three scenarios shown and recommend the best option. Be direct and use specific numbers if available.`

    case 'deal-intelligence':
      return `Summarise the deal intelligence for ${acct} on ${prod}. Win rate: ${keyMetrics.winRateAtCurrentPrice ?? '?'}% at current price. EoR score: ${keyMetrics.eorCompositeScore ?? '?'}/10. Deal Score: ${keyMetrics.dealScore ?? '?'}. Provide a clear verdict on whether to proceed with this deal.`

    case 'waterfall':
      return `Summarise the price waterfall for ${acct} on ${prod}. Identify the largest deduction layer and compare it to segment norms. Recommend the most impactful lever to improve net-net realization.`

    case 'pvm':
      return `Summarise the Price-Volume-Mix bridge for ${acct}. Identify whether revenue growth is healthy (price and mix positive) or masking erosion (price or mix negative). Provide a commercial interpretation in 3 sentences.`

    default:
      return `Summarise what you see on the current screen for ${acct}.`
  }
}
```

- **VALIDATE**: `npm run build` — TypeScript compiles without errors.

---

### TASK 17 — CREATE src/components/chat/ContextualChatPanel.tsx

**CREATE** `src/components/chat/ContextualChatPanel.tsx`

This is a right-side slide-in chat panel (380px wide) that auto-sends a context-aware prompt when opened.

**Key design decisions:**
- NO backdrop overlay (user must be able to see the chart while chatting)
- Width: `w-[380px]`, `fixed top-0 right-0 h-full z-50`, same slide-in transition as ExplainPanel
- Auto-send on open: fires `/api/chat` with the contextual prompt as the user message; the user message is NOT shown in the thread (only the AI response is shown as the first bubble)
- Follow-up messages work normally: user types → POST to `/api/chat` → response appended
- Panel state resets on close (local messages array cleared)
- Close button in panel header

**Props interface:**
```tsx
interface ContextualChatPanelProps {
  isOpen: boolean
  onClose: () => void
  screen: ScreenId
  accountId: string | null
  productId: string | null
  accountName: string | null
  productName: string | null
  keyMetrics: Record<string, unknown>
}
```

**Internal state:**
```ts
const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; content: string }[]>([])
const [input, setInput] = useState('')
const [loading, setLoading] = useState(false)
const hasFiredRef = useRef(false)
```

**Auto-send effect:**
```ts
useEffect(() => {
  if (!isOpen || hasFiredRef.current) return
  hasFiredRef.current = true
  const prompt = buildContextualPrompt(screen, accountName, productName, keyMetrics)
  setLoading(true)
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: prompt }),
  })
    .then(r => r.json())
    .then(data => {
      setMessages([{ role: 'assistant', content: data.response }])
    })
    .catch(() => {
      setMessages([{ role: 'assistant', content: 'Unable to load summary. Please try asking a question.' }])
    })
    .finally(() => setLoading(false))
}, [isOpen])

// Reset when panel closes
useEffect(() => {
  if (!isOpen) {
    setMessages([])
    setInput('')
    setLoading(false)
    hasFiredRef.current = false
  }
}, [isOpen])
```

**Submit handler:**
```ts
async function handleSubmit() {
  const q = input.trim()
  if (!q || loading) return
  setInput('')
  setMessages(prev => [...prev, { role: 'user', content: q }])
  setLoading(true)
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
  } catch {
    setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }])
  } finally {
    setLoading(false)
  }
}
```

**Panel JSX structure:**
```tsx
{/* No overlay */}
<div className={`fixed top-0 right-0 h-full w-[380px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
  {/* Header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-border-default shrink-0">
    <div className="flex items-center gap-2">
      <MessageSquare size={15} className="text-pwc-orange" />
      <span className="text-sm font-semibold text-text-primary">Ask about this screen</span>
    </div>
    <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
      <X size={16} />
    </button>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-page-bg">
    {loading && messages.length === 0 && (
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Loader2 size={12} className="animate-spin" />
        Analysing current view...
      </div>
    )}
    {messages.map((m, i) => (
      <div key={i} className={m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start max-w-[95%]'}>
        <div className={`rounded-xl px-3.5 py-2.5 text-sm ${
          m.role === 'user'
            ? 'bg-pwc-orange text-white'
            : 'bg-white border border-border-default text-text-primary'
        }`}>
          {m.content}
        </div>
      </div>
    ))}
    {loading && messages.length > 0 && (
      <div className="self-start">
        <div className="bg-white border border-border-default rounded-xl px-3.5 py-2.5">
          <Loader2 size={12} className="animate-spin text-text-muted" />
        </div>
      </div>
    )}
  </div>

  {/* Input */}
  <div className="border-t border-border-default px-3 py-3 bg-white shrink-0">
    <div className="flex gap-2 items-end">
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }}}
        placeholder="Ask a follow-up question..."
        rows={2}
        disabled={loading}
        className="flex-1 text-sm border border-border-default rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-pwc-orange transition-colors placeholder:text-text-muted disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="w-9 h-9 rounded-xl bg-pwc-orange text-white flex items-center justify-center hover:bg-pwc-orange-dark transition-colors disabled:opacity-40 shrink-0 mb-px"
      >
        <Send size={15} />
      </button>
    </div>
  </div>
</div>
```

**Imports needed:**
```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { X, MessageSquare, Send, Loader2 } from 'lucide-react'
import { buildContextualPrompt, type ScreenId } from '@/lib/contextualPrompts'
```

- **VALIDATE**: `npm run build`

---

### TASK 18 — ADD ContextualChatPanel trigger + FAB to all 5 analytical pages

Do this for: `segmentation/page.tsx`, `cpq/page.tsx`, `deal-intelligence/page.tsx` (already being created), `waterfall/page.tsx`, `pvm/page.tsx`.

**Pattern for each page — add to existing page component:**

```tsx
import { ContextualChatPanel } from '@/components/chat/ContextualChatPanel'
import { MessageSquare } from 'lucide-react'

// In component body, add state:
const [chatOpen, setChatOpen] = useState(false)

// Build page-specific keyMetrics for the prompt (use the same keyMetrics already computed for ExplainButton)
// Account name lookup:
const accountName = accounts.find(a => a.id === activeAccountId)?.name ?? null
const productName = products.find(p => p.id === activeProductId)?.name ?? null

// In JSX, add the chat trigger FAB (at same level as ExplainButton, inside the page div):
<button
  onClick={() => setChatOpen(true)}
  className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-white border border-border-default text-text-primary rounded-full shadow-lg hover:bg-page-bg transition-colors text-sm font-medium"
>
  <MessageSquare size={15} className="text-pwc-orange" />
  Ask
</button>

// Update ExplainButton to use className="right-[124px]" (Task 13 enables this)

// Add panel:
<ContextualChatPanel
  isOpen={chatOpen}
  onClose={() => setChatOpen(false)}
  screen="segmentation"  // change per page
  accountId={activeAccountId}
  productId={activeProductId}
  accountName={accountName}
  productName={productName}
  keyMetrics={keyMetrics}
/>
```

**Screen IDs per page:**
- `segmentation/page.tsx` → `screen="segmentation"`
- `cpq/page.tsx` → `screen="cpq"`
- `deal-intelligence/page.tsx` → `screen="deal-intelligence"`
- `waterfall/page.tsx` → `screen="waterfall"`
- `pvm/page.tsx` → `screen="pvm"`

**GOTCHA**: The `keyMetrics` object must be defined before both `ExplainButton` and `ContextualChatPanel`. Ensure the existing pages already have a `keyMetrics` const (some do, some may compute it inline). Refactor inline metrics into a `const keyMetrics = { ... }` variable if needed.

**GOTCHA**: The `ask-your-data` (chat) page does NOT get a ContextualChatPanel — it is already a full chat interface. Only the 5 analytical pages.

- **VALIDATE** (for each page): `npm run build`. Navigate to each page, click "Ask" button — panel slides in, auto-summary loads, follow-up questions work.

---

### TASK 19 — UPDATE src/app/page.tsx — update redirect if needed

**CHECK** `src/app/page.tsx` — if it contains `redirect('/chat')`, update to `redirect('/ask-your-data')`.

- **VALIDATE**: Navigating to `/` goes to `/ask-your-data`.

---

## TESTING STRATEGY

### Manual Validation Steps (no automated test suite in project)

1. **Full Scenario 1 walkthrough**: Log in as Maxime → Segmentation (Bakker Klaas / Milk Couverture, red dot) → CPQ (three scenarios) → Ask Your Data (click "How does Bakker Klaas compare..." chip → response + table) → Deal Intelligence (Deal Score 74, Win Probability 82%, EoR 6.2)
2. **Sidebar collapse**: Click collapse toggle → labels disappear, icons remain → reload page → collapsed state restored → expand → labels back
3. **Deal Intelligence**: Both sections visible without scrolling on 1440px display. Deal Score tile shows 74 for Bakker Klaas / Milk Couverture. Divider "Deal Closability" chip visible.
4. **Win/Loss legend**: All 6 legend items visible below chart. Labels match colors in chart.
5. **Contextual chat**: Open chat panel on each of 5 analytical pages → auto-summary loads → follow-up question works → close → reopen → fresh summary
6. **Name consistency**: Search UI for "Baker Klaas" (old spelling) — should return zero results. "Bakker Klaas" should appear in: accounts dropdown, chat responses, EoR table, waterfall fallback notice, Deal Intelligence EoR section.
7. **Redirects**: `/win-loss` → `/deal-intelligence`, `/ease-of-realization` → `/deal-intelligence`, `/chat` → `/ask-your-data`
8. **CPQ signals**: WinProbSignal "See full analysis →" and EoRSignal "See detail →" both navigate to `/deal-intelligence`

---

## VALIDATION COMMANDS

### Level 1: TypeScript + Build

```bash
npm run build
```
Must complete with zero errors and zero TypeScript type errors.

### Level 2: Lint

```bash
npm run lint
```
Must return zero errors (warnings acceptable).

### Level 3: JSON validity

```bash
node -e "JSON.parse(require('fs').readFileSync('data/chat-scenarios.json','utf8')); console.log('OK')"
node -e "JSON.parse(require('fs').readFileSync('data/accounts.json','utf8')); console.log('OK')"
```

### Level 4: Name consistency check

```bash
grep -r "Baker Klaas" src/ data/ --include="*.ts" --include="*.tsx" --include="*.json"
```
Expected: 0 results (all renamed to Bakker Klaas).

```bash
grep -r "Sarah" src/ --include="*.ts" --include="*.tsx"
```
Expected: 0 results in rendered UI files (TopBar.tsx should show Maxime).

```bash
grep -r "\"baker-klaas\"" data/ --include="*.json" | wc -l
```
Expected: many results (IDs preserved).

### Level 5: Route verification

Start dev server (`npm run dev`) and verify:
- `/` → redirects to `/ask-your-data`
- `/chat` → redirects to `/ask-your-data`
- `/win-loss` → redirects to `/deal-intelligence`
- `/ease-of-realization` → redirects to `/deal-intelligence`
- `/deal-intelligence` → renders Deal Intelligence page
- `/ask-your-data` → renders Ask Your Data chat page

---

## ACCEPTANCE CRITERIA

- [ ] "Bakker Klaas" used everywhere (zero "Baker Klaas" in rendered UI or data display strings)
- [ ] "Maxime" shown in TopBar avatar and name (was "Sarah" / "S")
- [ ] `/deal-intelligence` page renders with: Deal Score tile, Win Probability section with legend, "Deal Closability" divider, EoR section with dimension bars + account table
- [ ] Deal Score = 74 for Bakker Klaas / Milk Couverture at €4.20/kg
- [ ] Win/Loss chart has 6-item legend below chart area
- [ ] Insight panel shows "Gap to Optimal" metric and zone context label
- [ ] Old routes (`/win-loss`, `/ease-of-realization`, `/chat`) redirect correctly
- [ ] Sidebar shows 6 nav items (Win/Loss and EoR replaced by Deal Intelligence)
- [ ] Sidebar labels updated: "Ask Your Data", "Deal Intelligence", "Price-Volume-Mix"
- [ ] Sidebar collapse toggle works; collapsed state shows icons only with title tooltips
- [ ] Sidebar collapsed state persists across page refresh (localStorage)
- [ ] Suggested question chips appear on Ask Your Data page when thread is empty
- [ ] All 4 chips auto-submit on click (no manual Send required)
- [ ] Chips disappear after first message is sent
- [ ] "Ask" FAB visible on all 5 analytical pages (Segmentation, CPQ, Deal Intelligence, Waterfall, PVM)
- [ ] ExplainButton moves to `right-[124px]` on pages with the Ask FAB
- [ ] ContextualChatPanel opens, auto-summary loads, follow-up questions work
- [ ] ContextualChatPanel has no backdrop overlay (chart remains visible)
- [ ] Panel resets (fresh conversation) on close + reopen
- [ ] CPQ WinProbSignal and EoRSignal links both point to `/deal-intelligence`
- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes with zero errors

---

## COMPLETION CHECKLIST

- [ ] Task 1 — interpolateWinRate extracted to shared util
- [ ] Task 2 — accounts.json renamed
- [ ] Task 3 — chat-scenarios.json renamed + 2 new scenarios added
- [ ] Task 4 — TopBar.tsx updated (Maxime, screen titles)
- [ ] Task 5 — chat/route.ts comment updated
- [ ] Task 6 — explain/route.ts updated with deal-intelligence entry
- [ ] Task 7 — waterfall page fallback notice updated
- [ ] Task 8 — CPQ signal links updated
- [ ] Task 9 — deal-intelligence/page.tsx created
- [ ] Task 10 — WinLossLegend created and placed
- [ ] Task 11 — next.config.mjs redirects added, old pages converted to redirect stubs
- [ ] Task 12 — ask-your-data/page.tsx created, chat/page.tsx converted to redirect
- [ ] Task 13 — ExplainButton className prop added
- [ ] Task 14 — Sidebar.tsx updated (NAV_ITEMS + collapse toggle)
- [ ] Task 15 — SuggestedQuestions.tsx created and wired in ask-your-data
- [ ] Task 16 — contextualPrompts.ts created
- [ ] Task 17 — ContextualChatPanel.tsx created
- [ ] Task 18 — ContextualChatPanel wired into all 5 analytical pages
- [ ] Task 19 — Root redirect updated if needed
- [ ] All validation commands pass

---

## NOTES

### Preserved data IDs
The account ID `baker-klaas` is used as a foreign key throughout the entire codebase (AppContext default, EoR/WinLoss data lookups, chat scenario `accountId` fields). It must never change. Only the `name` display field changes to "Bakker Klaas".

### interpolateWinRate duplication
This function exists identically in 3 places. Extract first (Task 1) so all subsequent work imports from the shared util cleanly.

### Deal Score formula
`dealScore = round((winRate/100 * 0.6 + eorScore/10 * 0.4) * 100)`
- Bakker Klaas at €4.20/kg: (0.82 × 0.6 + 0.62 × 0.4) × 100 = (0.492 + 0.248) × 100 = 74
- At +4% uplift (€4.37/kg, ~75% win rate): (0.75 × 0.6 + 0.62 × 0.4) × 100 = (0.45 + 0.248) × 100 = 70 (just "Proceed")

### ContextualChatPanel vs ExplainPanel coexistence
Both panels are `z-50`, `fixed right-0`. They should never be open simultaneously. Each page only has one of each. No collision handling needed beyond not opening both.

### ExplainButton right position
Only pages that receive a ContextualChatPanel need `className="right-[124px]"`. Pages without a contextual chat (ask-your-data) continue to use the default `right-6`.

### No new API routes needed
ContextualChatPanel reuses `/api/chat`. The auto-summary prompt is a plain question string built client-side. The OpenAI semantic router may not always match a contextual prompt to a specific scenario — it will fall back to `generic-fallback`. This is acceptable behavior; the auto-summary will still be useful as the AI interprets the prompt directly if it cannot route it.

**Confidence Score: 8/10** — High confidence due to comprehensive pattern analysis. Main risk is ExplainButton positioning on pages where both FABs coexist (verify visually during Task 18). The ContextualChatPanel auto-summary will sometimes return generic-fallback responses when no exact scenario match exists — acceptable for a demo.
