# Feature: Scenario 1 Demo Alignment — Baker Klaas Discount Request

The following plan should be complete, but validate codebase patterns and task sanity before implementing.

Pay special attention to where `netPrice` is derived, which props flow to child components, and how `keyMetrics` is passed to the Explain API.

## Feature Description

Scenario 1 ("Baker Klaas Asks for More Discount") must be fully walkable as a demo story. Currently the Deal Pricing screen computes `netPrice` from list price minus tier discount (yielding ~€5.51), so the slider produces wrong numbers (€5.23 / €5.51 / €5.73) instead of the scenario-correct values (€3.99 / €4.20 / €4.37). The DealContextPanel also shows wrong segment position ("Above target" instead of "Below floor"). Two minor Segmentation issues reduce narrative richness.

## User Story

As a PwC demo presenter running Scenario 1
I want the Deal Pricing slider to anchor to Baker Klaas's current deal price (€4.20)
So that the three slider positions produce €3.99 (−5%), €4.20 (flat), €4.37 (+4%) — matching the script and triggering the correct escalation colors

## Problem Statement

1. `netPrice` in `deal-pricing/page.tsx` is computed as `listPrice × (1 − tierDiscount%) × (1 + dealDiscount%)`, yielding €5.51 at 0% rep adjustment for Baker Klaas — wrong baseline.
2. `DealContextPanel` derives "Segment position" from the slider `currentPrice` prop instead of `lastQuotedPrice`, showing "Above target" when Baker Klaas is actually "Below floor."
3. Price stack display labels ("List price", "Tier discount", "Rep adjustment") are technically correct but misleading for a deal where the baseline is already the current deal price.
4. Segmentation Explain `keyMetrics` is missing `accountName` and `upliftToFloor`, so GPT-4o cannot generate a fully account-specific narrative.
5. No individual account percentile rank is shown in the Segmentation KPI area.

## Solution Statement

- Anchor `netPrice` to `quoteBase.currentPrice` (the current deal price) plus the rep adjustment percentage. Remove the tier-discount subtraction from the live calculation — tier discount is already baked into the current price.
- Fix `DealContextPanel` to derive segment position from `lastQuotedPrice`, not `currentPrice` (the slider value).
- Update Deal Pricing price stack labels to reflect the anchored baseline.
- Enrich Segmentation `keyMetrics` with `accountName` and `upliftToFloor`.
- Add percentile rank badge to the Segmentation KPI row.

## Feature Metadata

**Feature Type**: Bug Fix + Enhancement
**Estimated Complexity**: Low
**Primary Systems Affected**: Deal Pricing page, DealContextPanel, Segmentation page, SegmentHealthPanel
**Dependencies**: None (all internal, data already in JSON files)

---

## CONTEXT REFERENCES

### Relevant Codebase Files — MUST READ BEFORE IMPLEMENTING

- `src/app/deal-pricing/page.tsx` (lines 37–67) — Current `netPrice` computation and slider state; this is the primary fix location
- `src/app/deal-pricing/page.tsx` (lines 80–93) — DealContextPanel prop pass; `currentPrice={netPrice}` vs `lastQuotedPrice` must be understood
- `src/app/deal-pricing/page.tsx` (lines 115–181) — Price stack labels and combined discount line
- `src/components/deal-pricing/DealContextPanel.tsx` (lines 19–20) — Bug: segment position uses `currentPrice` instead of `lastQuotedPrice`
- `src/app/segmentation/page.tsx` (lines 183–191) — Explain `keyMetrics` object; fields to add
- `src/app/segmentation/page.tsx` (lines 89–138) — KPI cards array; add percentile card here
- `src/components/segmentation/SegmentHealthPanel.tsx` (lines 13–24) — Where percentile rank can be computed from `points` array
- `data/quotes.json` — Baker Klaas / milk-couverture entry: `currentPrice: 4.20, tierDiscount: 5.0, grossMarginPct: 18.3`; scenario entries with net prices 3.99 / 4.20 / 4.37
- `data/accounts.json` — Baker Klaas: `price: 4.20, floor: 4.57, target: 4.85, segment: "Mid-Market Benelux", volume: 320`
- `src/lib/data.ts` (lines 1–50) — `Account` interface; `account.price` is the current net-net deal price

### New Files to Create

None — all fixes are in existing files.

### Patterns to Follow

**Net price pattern** — after fix, mirrors how `lastQuotedPrice` is already surfaced:
```typescript
// quoteBase already has currentPrice = 4.20
const basePrice = (quoteBase?.currentPrice as number | undefined) ?? account?.price ?? 4.20
const netPrice = useMemo(() => basePrice * (1 + dealDiscountPct / 100), [basePrice, dealDiscountPct])
```

**Segmentation keyMetrics** — existing pattern in `segmentation/page.tsx` lines 183–191:
```typescript
keyMetrics={{
  currentPrice: activeAccount?.price,
  floorPrice,
  targetPrice,
  vsFloor: ...,
  zone: ...,
  // ADD:
  accountName: activeAccount?.name,
  upliftToFloor: activeAccount ? ((floorPrice - activeAccount.price) / activeAccount.price * 100).toFixed(1) : null,
}}
```

**KPI card pattern** — existing `KPI_CONFIG` array in `segmentation/page.tsx` lines 91–113; add entry with same shape: `{ label, value, borderColor }`.

---

## IMPLEMENTATION PLAN

### Phase 1: Fix Deal Pricing netPrice baseline (Critical)

Change `netPrice` to anchor from `quoteBase.currentPrice` instead of computing from `listPrice × (1 − tierDiscount%)`.

### Phase 2: Fix Deal Pricing price stack display (Critical — follows Phase 1)

Update the price stack labels so the UI reflects the new anchored-baseline logic. The "Tier discount" row becomes informational-only; the slider row label stays "Rep adjustment."

### Phase 3: Fix DealContextPanel segment position (Critical)

One-line fix: replace `currentPrice` with `lastQuotedPrice` in the segment position ternary.

### Phase 4: Enrich Segmentation Explain keyMetrics (Minor)

Add `accountName` and `upliftToFloor` to the keyMetrics object passed to ExplainButton.

### Phase 5: Add percentile rank to Segmentation KPI (Minor)

Compute the account's price rank within the segment's point array and add a KPI card.

---

## STEP-BY-STEP TASKS

### TASK 1 — UPDATE `src/app/deal-pricing/page.tsx`: Fix netPrice baseline

- **IMPLEMENT**: Replace the `netPrice` useMemo so it anchors to `quoteBase.currentPrice` (the actual current deal price), not list-price-minus-tier.
- **PATTERN**: `quoteBase?.currentPrice` is already read on line 86 for `lastQuotedPrice`; reuse the same source.
- **BEFORE** (lines 49–53):
  ```typescript
  const netPrice = useMemo(() => {
    const afterTier = listPrice * (1 - tierDiscountPct / 100)
    // dealDiscountPct > 0 means uplift (increase price); < 0 means discount (reduce price)
    return afterTier * (1 + dealDiscountPct / 100)
  }, [listPrice, tierDiscountPct, dealDiscountPct])
  ```
- **AFTER**:
  ```typescript
  const basePrice = (quoteBase?.currentPrice as number | undefined) ?? account?.price ?? listPrice * (1 - tierDiscountPct / 100)
  const netPrice = useMemo(
    () => basePrice * (1 + dealDiscountPct / 100),
    [basePrice, dealDiscountPct]
  )
  ```
- **ADD** `basePrice` declaration immediately before the `netPrice` useMemo (after line 48 / after `tierDiscountPct` declaration).
- **GOTCHA**: `basePrice` is derived from `quoteBase` which can be `undefined` for account/product combos with no entry; the fallback chain handles that gracefully.
- **VALIDATE**: With Baker Klaas / Milk Couverture at 0% rep adjustment → netPrice should equal exactly `4.20`. At −5% → `3.99`. At +4% → `4.37`.

### TASK 2 — UPDATE `src/app/deal-pricing/page.tsx`: Fix price stack labels

- **IMPLEMENT**: Update the price stack section (lines 115–181) so the row labels reflect the anchored-baseline model:
  - **Row 1**: Change label from `"List price"` → `"Current deal price"`, value from `€{listPrice.toFixed(2)}/kg` → `€{basePrice.toFixed(2)}/kg`
  - **Row 2** (Tier discount): Change to informational text only. Update the label to `"Tier discount (baked in)"` and change the value display from `−{tierDiscountPct}%` to a muted note like `−{tierDiscountPct}% vs list (€{listPrice.toFixed(2)}/kg)`. Keep the row but visually de-emphasise — remove `text-zone-red` from value, use `text-text-muted` instead.
  - **Row 3** (Rep adjustment): No label change needed. The slider range and behavior stay identical.
  - **Combined line** (lines 172–181): Update text from `"Tier (−{tierDiscountPct}%) + Rep (...)"` → `"Rep adjustment: {dealDiscountPct >= 0 ? '+' : ''}{dealDiscountPct}%"` with appropriate color.
- **GOTCHA**: The `sliderLabelLeft` calculation on line 67 uses the same `dealDiscountPct` range (−10 to +20) and does not change.
- **VALIDATE**: UI shows "Current deal price €4.20/kg" at top of price stack; tier row is visually secondary; combined line shows only rep adjustment.

### TASK 3 — UPDATE `src/components/deal-pricing/DealContextPanel.tsx`: Fix segment position

- **IMPLEMENT**: Line 19 — change `currentPrice` to `lastQuotedPrice` in the `segmentPosition` ternary.
- **BEFORE** (line 19):
  ```typescript
  const segmentPosition = currentPrice < floorPrice ? 'Below floor' : currentPrice < targetPrice ? 'In-band' : 'Above target'
  const posZone = currentPrice < floorPrice ? 'red' : currentPrice < targetPrice ? 'amber' : 'green'
  ```
- **AFTER**:
  ```typescript
  const segmentPosition = lastQuotedPrice < floorPrice ? 'Below floor' : lastQuotedPrice < targetPrice ? 'In-band' : 'Above target'
  const posZone = lastQuotedPrice < floorPrice ? 'red' : lastQuotedPrice < targetPrice ? 'amber' : 'green'
  ```
- **GOTCHA**: `currentPrice` prop is still needed for the CoGS approximation on line 21 (`const cogsApprox = currentPrice * 0.75`) — do NOT remove it from the function signature or JSX.
- **VALIDATE**: Baker Klaas DealContextPanel "Segment position" badge reads "Below floor" in red (€4.20 < floor €4.57).

### TASK 4 — UPDATE `src/app/segmentation/page.tsx`: Enrich Explain keyMetrics

- **IMPLEMENT**: Add `accountName` and `upliftToFloor` to the `keyMetrics` object passed to `ExplainButton` (lines 183–191).
- **BEFORE**:
  ```typescript
  keyMetrics={{
    currentPrice: activeAccount?.price,
    floorPrice,
    targetPrice,
    vsFloor: activeAccount ? ((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1) : null,
    zone: activeAccount ? (activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green') : null,
  }}
  ```
- **AFTER**:
  ```typescript
  keyMetrics={{
    accountName: activeAccount?.name,
    currentPrice: activeAccount?.price,
    floorPrice,
    targetPrice,
    vsFloor: activeAccount ? ((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1) : null,
    upliftToFloor: activeAccount && activeAccount.price < floorPrice
      ? ((floorPrice - activeAccount.price) / activeAccount.price * 100).toFixed(1)
      : null,
    zone: activeAccount ? (activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green') : null,
  }}
  ```
- **VALIDATE**: Open browser devtools Network tab, click Explain on Segmentation — request body should contain `accountName: "Baker Klaas"` and `upliftToFloor: "8.8"`.

### TASK 5 — UPDATE `src/app/segmentation/page.tsx`: Add percentile rank KPI card

- **IMPLEMENT**: In the `KPI_CONFIG` array (lines 91–113), add a fourth entry that shows the account's price rank within its segment points.
- **PATTERN**: Compute rank before the `KPI_CONFIG` array:
  ```typescript
  // Compute account's price rank within segment (lower price = worse rank)
  const sortedByPrice = [...points].sort((a, b) => a.price - b.price)
  const accountRankIdx = activeAccount
    ? sortedByPrice.findIndex(p => Math.abs(p.price - activeAccount.price) < 0.001)
    : -1
  const accountPercentile = accountRankIdx >= 0
    ? Math.round(((accountRankIdx + 1) / sortedByPrice.length) * 100)
    : null
  ```
- **ADD** to `KPI_CONFIG` array:
  ```typescript
  {
    label: 'Segment rank',
    value: accountPercentile !== null ? `Bottom ${accountPercentile}%` : '—',
    borderColor: accountPercentile !== null && accountPercentile <= 25 ? 'border-l-zone-red' : 'border-l-blue-500',
  },
  ```
- **GOTCHA**: `points` is the already-filtered array (same segment as active account), so the rank is within-segment. If `activeAccount` is null, this card still renders with `'—'`.
- **GOTCHA**: The `sortedByPrice.findIndex` uses a tolerance (< 0.001) because floating-point equality is unreliable.
- **VALIDATE**: Baker Klaas segmentation page shows 5 KPI cards; last card reads "Segment rank — Bottom X%" (expected ~15–25% given €4.20 is near the bottom of Mid-Market Benelux).

---

## TESTING STRATEGY

### Manual Validation (primary — this is a demo tool)

Walk the full Scenario 1 script after implementing all tasks:

1. Navigate to Deal Pricing → select Baker Klaas / Milk Couverture
2. At 0% rep adjustment: price shows €4.20, "Segment position" in DealContextPanel shows **Below floor** (red)
3. Drag slider to −5%: price shows **€3.99**, EscalationBanner shows **red / director** level
4. Drag slider to 0%: price shows **€4.20**, banner shows **manager** (below floor but within 5%)
5. Drag slider to +4%: price shows **€4.37**, banner shows **manager** (still below floor — €4.37 < €4.57)
6. Click AI Explain on Deal Pricing — verify contextual numbers appear
7. Navigate to Segmentation → select Baker Klaas / Milk Couverture
8. Verify 5 KPI cards; "Segment rank" card shows "Bottom X%" in red
9. Click AI Explain on Segmentation — verify response mentions Baker Klaas by name and references the 8.8% uplift to floor
10. Navigate to Chat → type "How does Baker Klaas compare to peers?" → verify scenario fires with peer table

### Regression Check

- Switch to a different account (e.g., Callebaut Direct) — verify Deal Pricing slider still anchors to that account's `currentPrice` from quotes.json
- If no quotes.json entry exists for a combo, fallback chain (`account?.price ?? listPrice * (1 - tierDiscount/100)`) must not crash

---

## VALIDATION COMMANDS

### Level 1: Type check
```bash
cd "C:\Users\Vadim Gerasimov\POCs\FoS_Demo" && npx tsc --noEmit
```

### Level 2: Dev server runs without errors
```bash
cd "C:\Users\Vadim Gerasimov\POCs\FoS_Demo" && npm run dev
```
Then open `http://localhost:3000/deal-pricing` and verify no console errors.

### Level 3: Manual scenario walkthrough
Follow the 10-step manual validation above in the Chrome browser.

---

## ACCEPTANCE CRITERIA

- [ ] Deal Pricing at 0% rep adjustment shows **€4.20/kg** for Baker Klaas (not €5.51)
- [ ] Deal Pricing at −5% shows **€3.99/kg** and EscalationBanner is **red (director)**
- [ ] Deal Pricing at +4% shows **€4.37/kg**
- [ ] DealContextPanel "Segment position" shows **Below floor** (red) for Baker Klaas at any slider position below €4.57
- [ ] Deal Pricing price stack row 1 label reads **"Current deal price"** with value €4.20/kg
- [ ] Segmentation KPI row has **5 cards** including "Segment rank — Bottom X%"
- [ ] Segmentation Explain API request body contains `accountName: "Baker Klaas"` and `upliftToFloor: "8.8"`
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No regressions on other accounts/products

---

## COMPLETION CHECKLIST

- [ ] Task 1: netPrice baseline fixed — tsc passes, slider values correct
- [ ] Task 2: Price stack labels updated — UI displays "Current deal price"
- [ ] Task 3: DealContextPanel segment position fixed — shows "Below floor" for Baker Klaas
- [ ] Task 4: Segmentation keyMetrics enriched — accountName + upliftToFloor in API request
- [ ] Task 5: Percentile rank KPI card added — shows "Bottom X%" in Segmentation
- [ ] Full Scenario 1 walkthrough completed without narrative breaks

---

## NOTES

### Why anchor to currentPrice, not list-minus-tier?

The slider is meant to model a rep offering to change the existing deal price, not to re-derive price from scratch. `quoteBase.currentPrice` = €4.20 is the live contract rate. Tier discount is historical and already embedded in that price. The demo script explicitly references €3.99/€4.20/€4.37 as the three scenario outcomes — these only work if the baseline is €4.20.

### Script note on "12% uplift"

The original Scenario 1 script says "Baker Klaas needs a 12% uplift." The actual uplift from €4.20 to the segment floor €4.57 is 8.8%. The script figure appears to reference uplift to the target price (€4.85): (€4.85 − €4.20) / €4.20 = 15.5%, still not 12%. The closest interpretation is the gap as a percentage of floor: (€4.57 − €4.20) / €4.57 = 8.1%. The `upliftToFloor` keyMetric added in Task 4 will give GPT-4o the actual number so the AI Explain output is accurate regardless.

### CoGS approximation

`DealContextPanel` uses `currentPrice * 0.75` as CoGS. After Task 3, `currentPrice` prop still flows to this line — it will now reflect the slider value, not the baseline. This is intentional: CoGS should update live as the rep moves the slider. Only the segment position badge needed to be anchored to the deal's actual price.
