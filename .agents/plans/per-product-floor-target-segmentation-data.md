# Feature: Per-Product Floor/Target + Full Segmentation Data Coverage

The following plan should be complete, but validate codebase patterns before implementing.
Pay special attention to existing ID conventions, interface field names, and import paths.

## Feature Description

Extend the Equazion segmentation screen to support per-product floor and target prices, and populate segmentation data for all 6 products (currently only Milk Couverture has full coverage; White Couverture, Dark Couverture, Cocoa Powder, and Hazelnut Praline have zero entries; Dark Compound has only 2).

## User Story

As a demo presenter
I want to select any product in the segmentation screen
So that a meaningful scatter chart appears with correct floor/target benchmarks for that product

## Problem Statement

- `accounts.json` stores a single `floor` and `target` per account, calibrated for Milk Couverture only
- Selecting any other product shows an empty or near-empty chart
- Floor/target reference lines are incorrect for non-MC products

## Solution Statement

1. Replace `floor: number` / `target: number` on the `Account` interface with `floors: Record<string, number>` / `targets: Record<string, number>`
2. Add `getFloor(account, productId)` and `getTarget(account, productId)` helpers in `data.ts`
3. Update 3 consumers: `segmentation/page.tsx`, `ComparisonPanel.tsx`, `cpq/page.tsx`
4. Populate `segmentation.json` with entries for all 5 missing/sparse products

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: `data/accounts.json`, `data/segmentation.json`, `src/lib/data.ts`, `src/app/segmentation/page.tsx`, `src/components/segmentation/ComparisonPanel.tsx`, `src/app/cpq/page.tsx`
**Dependencies**: None (data-only + type change)

---

## CONTEXT REFERENCES

### Files YOU MUST READ before implementing

- `data/accounts.json` — current flat `floor`/`target` structure to replace
- `data/segmentation.json` — existing entry ID convention (`seg-{acct}-{prod}`) and field schema
- `src/lib/data.ts` (lines 1–49) — `Account` interface definition; add helpers after line 148
- `src/app/segmentation/page.tsx` (lines 35–44) — `floorPrice`/`targetPrice` derivation to update
- `src/components/segmentation/ComparisonPanel.tsx` (lines 48–62) — two `.floor`/`.target` usages
- `src/app/cpq/page.tsx` (lines 55–56) — `floorPrice`/`targetPrice` derivation to update

### New Files to Create

None — all changes are to existing files.

---

## PRICE DERIVATION METHODOLOGY

All per-product prices in `segmentation.json` are derived by:
> `scaled_price = mc_price × (product_list_price / 5.80)`  rounded to 2 dp

All per-product floors/targets in `accounts.json` are derived by:
> `product_floor = mc_floor × (product_list_price / 5.80)`
> `product_target = mc_target × (product_list_price / 5.80)`  rounded to 2 dp

Product list prices: MC=5.80, WC=6.20, DC=5.40, DCo=4.60, CP=3.20, HP=7.40
Scale factors:  WC=×1.069, DCV=×0.931, DCO=×0.793, CP=×0.552, HP=×1.276

Volume adjustments vs Milk Couverture:
- White Couverture, Dark Couverture, Dark Compound: **same volumes**
- Cocoa Powder (mid-market only): **×2** (bulk ingredient; enterprise stays same to respect X-axis domain of 50 000)
- Hazelnut Praline: **×0.5** (specialty filling, rounded to nearest 5)

---

## SEGMENT ID ABBREVIATIONS (for `segmentation.json` entry IDs)

| Product | Suffix |
|---|---|
| milk-couverture | `-mc` |
| white-couverture | `-wc` |
| dark-couverture | `-dcv` |
| dark-compound | `-dc` (existing) |
| cocoa-powder | `-cpw` |
| hazelnut-praline | `-hp` |

Account abbreviations (match existing): bk, pm, ca, cl, bd, sr, rc, gr, if→if2 (note: `if` is a JS keyword — keep as-is in JSON strings), eu, nb, sc, bk2, hs, di, ac, cp→cpr (Cioccolato Puro), dv, mb, wk, zc, dp

---

## IMPLEMENTATION PLAN

### Phase 1: Type + Interface Update

Update `Account` interface and add helpers in `data.ts`.

### Phase 2: Data Files

Update `accounts.json` (replace flat floor/target with objects, also fix 3 price discrepancies).
Update `segmentation.json` (add ~88 new entries, update 2 existing Dark Compound entries).

### Phase 3: Consumer Updates

Update the 3 files that read `account.floor` / `account.target`.

---

## STEP-BY-STEP TASKS

---

### TASK 1 — UPDATE `src/lib/data.ts` — Account interface

**IMPLEMENT:** Replace `floor: number` and `target: number` with `floors` and `targets` as `Record<string, number>`.

Find (lines 8–9 in the Account interface):
```ts
  floor: number        // €/kg segment floor
  target: number       // €/kg segment target
```

Replace with:
```ts
  floors: Record<string, number>   // €/kg segment floor per product
  targets: Record<string, number>  // €/kg segment target per product
```

**VALIDATE:** `npx tsc --noEmit` — expect type errors on `.floor` / `.target` usages (will be fixed in Tasks 3–5).

---

### TASK 2 — ADD helpers in `src/lib/data.ts`

**IMPLEMENT:** Add two helper functions after the last existing helper (after line 148):

```ts
export function getFloor(account: Account, productId: string): number {
  return account.floors[productId] ?? account.floors['milk-couverture'] ?? 4.57
}

export function getTarget(account: Account, productId: string): number {
  return account.targets[productId] ?? account.targets['milk-couverture'] ?? 4.85
}
```

**VALIDATE:** `npx tsc --noEmit` — same errors as Task 1 (not yet resolved).

---

### TASK 3 — UPDATE `data/accounts.json`

**IMPLEMENT:** Replace the entire file with the JSON below.
Changes vs current:
- `floor`/`target` → `floors`/`targets` (objects with 6 keys each)
- Price fixes: `choco-artisan` price 4.90→**5.20**, `dolce-italia` price 4.40→**4.32**, `artisan-cacao` price 4.55→**4.65**

```json
[
  {
    "id": "baker-klaas",
    "name": "Baker Klaas",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 320,
    "price": 4.20,
    "floors": {
      "milk-couverture": 4.57,
      "white-couverture": 4.89,
      "dark-couverture": 4.25,
      "dark-compound": 3.62,
      "cocoa-powder": 2.52,
      "hazelnut-praline": 5.83
    },
    "targets": {
      "milk-couverture": 4.85,
      "white-couverture": 5.18,
      "dark-couverture": 4.52,
      "dark-compound": 3.85,
      "cocoa-powder": 2.68,
      "hazelnut-praline": 6.19
    },
    "region": "Benelux"
  },
  {
    "id": "schoko-retail",
    "name": "Schoko Retail Group",
    "segment": "Enterprise Key Accounts",
    "segmentId": "enterprise-key-accounts",
    "volume": 38000,
    "price": 3.55,
    "floors": {
      "milk-couverture": 3.40,
      "white-couverture": 3.63,
      "dark-couverture": 3.17,
      "dark-compound": 2.70,
      "cocoa-powder": 1.88,
      "hazelnut-praline": 4.34
    },
    "targets": {
      "milk-couverture": 4.10,
      "white-couverture": 4.38,
      "dark-couverture": 3.82,
      "dark-compound": 3.25,
      "cocoa-powder": 2.26,
      "hazelnut-praline": 5.23
    },
    "region": "DACH"
  },
  {
    "id": "patisserie-moreau",
    "name": "Pâtisserie Moreau",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 480,
    "price": 4.75,
    "floors": {
      "milk-couverture": 4.57,
      "white-couverture": 4.89,
      "dark-couverture": 4.25,
      "dark-compound": 3.62,
      "cocoa-powder": 2.52,
      "hazelnut-praline": 5.83
    },
    "targets": {
      "milk-couverture": 4.85,
      "white-couverture": 5.18,
      "dark-couverture": 4.52,
      "dark-compound": 3.85,
      "cocoa-powder": 2.68,
      "hazelnut-praline": 6.19
    },
    "region": "France"
  },
  {
    "id": "choco-artisan",
    "name": "Choco Artisan BV",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 210,
    "price": 5.20,
    "floors": {
      "milk-couverture": 4.57,
      "white-couverture": 4.89,
      "dark-couverture": 4.25,
      "dark-compound": 3.62,
      "cocoa-powder": 2.52,
      "hazelnut-praline": 5.83
    },
    "targets": {
      "milk-couverture": 4.85,
      "white-couverture": 5.18,
      "dark-couverture": 4.52,
      "dark-compound": 3.85,
      "cocoa-powder": 2.68,
      "hazelnut-praline": 6.19
    },
    "region": "Netherlands"
  },
  {
    "id": "nordic-bakes",
    "name": "Nordic Bakes AS",
    "segment": "Mid-Market Nordics",
    "segmentId": "mid-market-nordics",
    "volume": 650,
    "price": 4.60,
    "floors": {
      "milk-couverture": 4.20,
      "white-couverture": 4.49,
      "dark-couverture": 3.91,
      "dark-compound": 3.33,
      "cocoa-powder": 2.32,
      "hazelnut-praline": 5.36
    },
    "targets": {
      "milk-couverture": 5.00,
      "white-couverture": 5.34,
      "dark-couverture": 4.66,
      "dark-compound": 3.97,
      "cocoa-powder": 2.76,
      "hazelnut-praline": 6.38
    },
    "region": "Scandinavia"
  },
  {
    "id": "dolce-italia",
    "name": "Dolce Italia SpA",
    "segment": "Mid-Market Southern Europe",
    "segmentId": "mid-market-south-eu",
    "volume": 920,
    "price": 4.32,
    "floors": {
      "milk-couverture": 4.10,
      "white-couverture": 4.38,
      "dark-couverture": 3.82,
      "dark-compound": 3.25,
      "cocoa-powder": 2.26,
      "hazelnut-praline": 5.23
    },
    "targets": {
      "milk-couverture": 4.80,
      "white-couverture": 5.13,
      "dark-couverture": 4.47,
      "dark-compound": 3.81,
      "cocoa-powder": 2.65,
      "hazelnut-praline": 6.12
    },
    "region": "Italy"
  },
  {
    "id": "confiserie-lambert",
    "name": "Confiserie Lambert",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 390,
    "price": 5.10,
    "floors": {
      "milk-couverture": 4.57,
      "white-couverture": 4.89,
      "dark-couverture": 4.25,
      "dark-compound": 3.62,
      "cocoa-powder": 2.52,
      "hazelnut-praline": 5.83
    },
    "targets": {
      "milk-couverture": 4.85,
      "white-couverture": 5.18,
      "dark-couverture": 4.52,
      "dark-compound": 3.85,
      "cocoa-powder": 2.68,
      "hazelnut-praline": 6.19
    },
    "region": "Belgium"
  },
  {
    "id": "munchen-bakerei",
    "name": "Münchener Bäckerei",
    "segment": "Mid-Market DACH",
    "segmentId": "mid-market-dach",
    "volume": 710,
    "price": 4.30,
    "floors": {
      "milk-couverture": 4.00,
      "white-couverture": 4.28,
      "dark-couverture": 3.72,
      "dark-compound": 3.17,
      "cocoa-powder": 2.21,
      "hazelnut-praline": 5.10
    },
    "targets": {
      "milk-couverture": 4.70,
      "white-couverture": 5.02,
      "dark-couverture": 4.38,
      "dark-compound": 3.73,
      "cocoa-powder": 2.59,
      "hazelnut-praline": 5.99
    },
    "region": "Germany"
  },
  {
    "id": "royal-confections",
    "name": "Royal Confections Ltd",
    "segment": "Enterprise Key Accounts",
    "segmentId": "enterprise-key-accounts",
    "volume": 22000,
    "price": 3.70,
    "floors": {
      "milk-couverture": 3.40,
      "white-couverture": 3.63,
      "dark-couverture": 3.17,
      "dark-compound": 2.70,
      "cocoa-powder": 1.88,
      "hazelnut-praline": 4.34
    },
    "targets": {
      "milk-couverture": 4.10,
      "white-couverture": 4.38,
      "dark-couverture": 3.82,
      "dark-compound": 3.25,
      "cocoa-powder": 2.26,
      "hazelnut-praline": 5.23
    },
    "region": "UK"
  },
  {
    "id": "artisan-cacao",
    "name": "Artisan Cacao SL",
    "segment": "Mid-Market Southern Europe",
    "segmentId": "mid-market-south-eu",
    "volume": 280,
    "price": 4.65,
    "floors": {
      "milk-couverture": 4.10,
      "white-couverture": 4.38,
      "dark-couverture": 3.82,
      "dark-compound": 3.25,
      "cocoa-powder": 2.26,
      "hazelnut-praline": 5.23
    },
    "targets": {
      "milk-couverture": 4.80,
      "white-couverture": 5.13,
      "dark-couverture": 4.47,
      "dark-compound": 3.81,
      "cocoa-powder": 2.65,
      "hazelnut-praline": 6.12
    },
    "region": "Spain"
  }
]
```

**GOTCHA:** `choco-artisan` price changed 4.90→5.20, `dolce-italia` 4.40→4.32, `artisan-cacao` 4.55→4.65 — these fix the KPI↔dot discrepancies identified in the data review.
**VALIDATE:** `node -e "JSON.parse(require('fs').readFileSync('data/accounts.json','utf8')); console.log('valid')"` from project root.

---

### TASK 4 — UPDATE `data/segmentation.json`

**IMPLEMENT:** Replace the entire file. The new file contains:
- All 22 existing Milk Couverture entries (unchanged)
- 2 existing Dark Compound entries **updated** (baker-klaas price 3.85→3.33, schoko-retail price 3.70→2.82, zone red→amber for schoko-retail)
- 20 new White Couverture entries
- 20 new Dark Couverture entries
- 19 new Dark Compound entries (21 total - 2 existing = 19 new)
- 21 new Cocoa Powder entries
- 20 new Hazelnut Praline entries

Full file content:

```json
[
  {
    "id": "seg-bk-mc",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "milk-couverture",
    "volume": 320,
    "price": 4.20,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-pm-mc",
    "accountId": "patisserie-moreau",
    "accountName": "Pâtisserie Moreau",
    "productId": "milk-couverture",
    "volume": 480,
    "price": 4.75,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-ca-mc",
    "accountId": "choco-artisan",
    "accountName": "Choco Artisan BV",
    "productId": "milk-couverture",
    "volume": 210,
    "price": 5.20,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-cl-mc",
    "accountId": "confiserie-lambert",
    "accountName": "Confiserie Lambert",
    "productId": "milk-couverture",
    "volume": 390,
    "price": 5.10,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-bd-mc",
    "accountId": "bruxelles-doux",
    "accountName": "Bruxelles Doux NV",
    "productId": "milk-couverture",
    "volume": 560,
    "price": 4.40,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-sr-mc",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "milk-couverture",
    "volume": 38000,
    "price": 3.55,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-rc-mc",
    "accountId": "royal-confections",
    "accountName": "Royal Confections Ltd",
    "productId": "milk-couverture",
    "volume": 22000,
    "price": 3.70,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-gr-mc",
    "accountId": "global-retail",
    "accountName": "Global Retail GmbH",
    "productId": "milk-couverture",
    "volume": 48000,
    "price": 3.25,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-if-mc",
    "accountId": "interfood",
    "accountName": "InterFood BV",
    "productId": "milk-couverture",
    "volume": 12000,
    "price": 4.20,
    "segment": "Enterprise Key Accounts",
    "zone": "green"
  },
  {
    "id": "seg-eu-mc",
    "accountId": "euro-patisserie",
    "accountName": "Euro Patisserie AG",
    "productId": "milk-couverture",
    "volume": 16000,
    "price": 3.35,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-nb-mc",
    "accountId": "nordic-bakes",
    "accountName": "Nordic Bakes AS",
    "productId": "milk-couverture",
    "volume": 650,
    "price": 4.60,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-sc-mc",
    "accountId": "scandichoc",
    "accountName": "Scandichoc AS",
    "productId": "milk-couverture",
    "volume": 280,
    "price": 4.05,
    "segment": "Mid-Market Nordics",
    "zone": "red"
  },
  {
    "id": "seg-bk2-mc",
    "accountId": "bergens-konfekt",
    "accountName": "Bergens Konfekt",
    "productId": "milk-couverture",
    "volume": 420,
    "price": 4.85,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-hs-mc",
    "accountId": "helsinki-sweet",
    "accountName": "Helsinki Sweet OY",
    "productId": "milk-couverture",
    "volume": 350,
    "price": 5.20,
    "segment": "Mid-Market Nordics",
    "zone": "green"
  },
  {
    "id": "seg-di-mc",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "milk-couverture",
    "volume": 920,
    "price": 4.32,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-ac-mc",
    "accountId": "artisan-cacao",
    "accountName": "Artisan Cacao SL",
    "productId": "milk-couverture",
    "volume": 280,
    "price": 4.65,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-cpr-mc",
    "accountId": "cioccolato-puro",
    "accountName": "Cioccolato Puro Srl",
    "productId": "milk-couverture",
    "volume": 550,
    "price": 3.90,
    "segment": "Mid-Market Southern Europe",
    "zone": "red"
  },
  {
    "id": "seg-dv-mc",
    "accountId": "dulce-valencia",
    "accountName": "Dulce Valencia SA",
    "productId": "milk-couverture",
    "volume": 320,
    "price": 4.95,
    "segment": "Mid-Market Southern Europe",
    "zone": "green"
  },
  {
    "id": "seg-mb-mc",
    "accountId": "munchen-bakerei",
    "accountName": "Münchener Bäckerei",
    "productId": "milk-couverture",
    "volume": 710,
    "price": 4.30,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-wk-mc",
    "accountId": "wiener-konditorei",
    "accountName": "Wiener Konditorei GmbH",
    "productId": "milk-couverture",
    "volume": 450,
    "price": 3.85,
    "segment": "Mid-Market DACH",
    "zone": "red"
  },
  {
    "id": "seg-zc-mc",
    "accountId": "zurich-chocolat",
    "accountName": "Zürich Chocolat AG",
    "productId": "milk-couverture",
    "volume": 580,
    "price": 4.45,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-dp-mc",
    "accountId": "dresdner-pralinen",
    "accountName": "Dresdner Pralinen GmbH",
    "productId": "milk-couverture",
    "volume": 320,
    "price": 4.80,
    "segment": "Mid-Market DACH",
    "zone": "green"
  },
  {
    "id": "seg-bk-dc",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "dark-compound",
    "volume": 320,
    "price": 3.33,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-pm-dc",
    "accountId": "patisserie-moreau",
    "accountName": "Pâtisserie Moreau",
    "productId": "dark-compound",
    "volume": 480,
    "price": 3.77,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-ca-dc",
    "accountId": "choco-artisan",
    "accountName": "Choco Artisan BV",
    "productId": "dark-compound",
    "volume": 210,
    "price": 4.12,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-cl-dc",
    "accountId": "confiserie-lambert",
    "accountName": "Confiserie Lambert",
    "productId": "dark-compound",
    "volume": 390,
    "price": 4.04,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-bd-dc",
    "accountId": "bruxelles-doux",
    "accountName": "Bruxelles Doux NV",
    "productId": "dark-compound",
    "volume": 560,
    "price": 3.49,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-nb-dc",
    "accountId": "nordic-bakes",
    "accountName": "Nordic Bakes AS",
    "productId": "dark-compound",
    "volume": 650,
    "price": 3.65,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-sc-dc",
    "accountId": "scandichoc",
    "accountName": "Scandichoc AS",
    "productId": "dark-compound",
    "volume": 280,
    "price": 3.21,
    "segment": "Mid-Market Nordics",
    "zone": "red"
  },
  {
    "id": "seg-bk2-dc",
    "accountId": "bergens-konfekt",
    "accountName": "Bergens Konfekt",
    "productId": "dark-compound",
    "volume": 420,
    "price": 3.85,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-hs-dc",
    "accountId": "helsinki-sweet",
    "accountName": "Helsinki Sweet OY",
    "productId": "dark-compound",
    "volume": 350,
    "price": 4.12,
    "segment": "Mid-Market Nordics",
    "zone": "green"
  },
  {
    "id": "seg-di-dc",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "dark-compound",
    "volume": 920,
    "price": 3.43,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-ac-dc",
    "accountId": "artisan-cacao",
    "accountName": "Artisan Cacao SL",
    "productId": "dark-compound",
    "volume": 280,
    "price": 3.69,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-cpr-dc",
    "accountId": "cioccolato-puro",
    "accountName": "Cioccolato Puro Srl",
    "productId": "dark-compound",
    "volume": 550,
    "price": 3.09,
    "segment": "Mid-Market Southern Europe",
    "zone": "red"
  },
  {
    "id": "seg-dv-dc",
    "accountId": "dulce-valencia",
    "accountName": "Dulce Valencia SA",
    "productId": "dark-compound",
    "volume": 320,
    "price": 3.93,
    "segment": "Mid-Market Southern Europe",
    "zone": "green"
  },
  {
    "id": "seg-mb-dc",
    "accountId": "munchen-bakerei",
    "accountName": "Münchener Bäckerei",
    "productId": "dark-compound",
    "volume": 710,
    "price": 3.41,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-wk-dc",
    "accountId": "wiener-konditorei",
    "accountName": "Wiener Konditorei GmbH",
    "productId": "dark-compound",
    "volume": 450,
    "price": 3.05,
    "segment": "Mid-Market DACH",
    "zone": "red"
  },
  {
    "id": "seg-zc-dc",
    "accountId": "zurich-chocolat",
    "accountName": "Zürich Chocolat AG",
    "productId": "dark-compound",
    "volume": 580,
    "price": 3.53,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-dp-dc",
    "accountId": "dresdner-pralinen",
    "accountName": "Dresdner Pralinen GmbH",
    "productId": "dark-compound",
    "volume": 320,
    "price": 3.81,
    "segment": "Mid-Market DACH",
    "zone": "green"
  },
  {
    "id": "seg-sr-dc",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "dark-compound",
    "volume": 38000,
    "price": 2.82,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-rc-dc",
    "accountId": "royal-confections",
    "accountName": "Royal Confections Ltd",
    "productId": "dark-compound",
    "volume": 22000,
    "price": 2.93,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-gr-dc",
    "accountId": "global-retail",
    "accountName": "Global Retail GmbH",
    "productId": "dark-compound",
    "volume": 48000,
    "price": 2.58,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-if-dc",
    "accountId": "interfood",
    "accountName": "InterFood BV",
    "productId": "dark-compound",
    "volume": 12000,
    "price": 3.33,
    "segment": "Enterprise Key Accounts",
    "zone": "green"
  },
  {
    "id": "seg-eu-dc",
    "accountId": "euro-patisserie",
    "accountName": "Euro Patisserie AG",
    "productId": "dark-compound",
    "volume": 16000,
    "price": 2.66,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-bk-wc",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "white-couverture",
    "volume": 320,
    "price": 4.49,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-pm-wc",
    "accountId": "patisserie-moreau",
    "accountName": "Pâtisserie Moreau",
    "productId": "white-couverture",
    "volume": 480,
    "price": 5.08,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-ca-wc",
    "accountId": "choco-artisan",
    "accountName": "Choco Artisan BV",
    "productId": "white-couverture",
    "volume": 210,
    "price": 5.56,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-cl-wc",
    "accountId": "confiserie-lambert",
    "accountName": "Confiserie Lambert",
    "productId": "white-couverture",
    "volume": 390,
    "price": 5.45,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-bd-wc",
    "accountId": "bruxelles-doux",
    "accountName": "Bruxelles Doux NV",
    "productId": "white-couverture",
    "volume": 560,
    "price": 4.70,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-nb-wc",
    "accountId": "nordic-bakes",
    "accountName": "Nordic Bakes AS",
    "productId": "white-couverture",
    "volume": 650,
    "price": 4.92,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-sc-wc",
    "accountId": "scandichoc",
    "accountName": "Scandichoc AS",
    "productId": "white-couverture",
    "volume": 280,
    "price": 4.33,
    "segment": "Mid-Market Nordics",
    "zone": "red"
  },
  {
    "id": "seg-bk2-wc",
    "accountId": "bergens-konfekt",
    "accountName": "Bergens Konfekt",
    "productId": "white-couverture",
    "volume": 420,
    "price": 5.19,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-hs-wc",
    "accountId": "helsinki-sweet",
    "accountName": "Helsinki Sweet OY",
    "productId": "white-couverture",
    "volume": 350,
    "price": 5.56,
    "segment": "Mid-Market Nordics",
    "zone": "green"
  },
  {
    "id": "seg-di-wc",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "white-couverture",
    "volume": 920,
    "price": 4.62,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-ac-wc",
    "accountId": "artisan-cacao",
    "accountName": "Artisan Cacao SL",
    "productId": "white-couverture",
    "volume": 280,
    "price": 4.97,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-cpr-wc",
    "accountId": "cioccolato-puro",
    "accountName": "Cioccolato Puro Srl",
    "productId": "white-couverture",
    "volume": 550,
    "price": 4.17,
    "segment": "Mid-Market Southern Europe",
    "zone": "red"
  },
  {
    "id": "seg-dv-wc",
    "accountId": "dulce-valencia",
    "accountName": "Dulce Valencia SA",
    "productId": "white-couverture",
    "volume": 320,
    "price": 5.29,
    "segment": "Mid-Market Southern Europe",
    "zone": "green"
  },
  {
    "id": "seg-mb-wc",
    "accountId": "munchen-bakerei",
    "accountName": "Münchener Bäckerei",
    "productId": "white-couverture",
    "volume": 710,
    "price": 4.60,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-wk-wc",
    "accountId": "wiener-konditorei",
    "accountName": "Wiener Konditorei GmbH",
    "productId": "white-couverture",
    "volume": 450,
    "price": 4.12,
    "segment": "Mid-Market DACH",
    "zone": "red"
  },
  {
    "id": "seg-zc-wc",
    "accountId": "zurich-chocolat",
    "accountName": "Zürich Chocolat AG",
    "productId": "white-couverture",
    "volume": 580,
    "price": 4.76,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-dp-wc",
    "accountId": "dresdner-pralinen",
    "accountName": "Dresdner Pralinen GmbH",
    "productId": "white-couverture",
    "volume": 320,
    "price": 5.13,
    "segment": "Mid-Market DACH",
    "zone": "green"
  },
  {
    "id": "seg-sr-wc",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "white-couverture",
    "volume": 38000,
    "price": 3.80,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-rc-wc",
    "accountId": "royal-confections",
    "accountName": "Royal Confections Ltd",
    "productId": "white-couverture",
    "volume": 22000,
    "price": 3.96,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-gr-wc",
    "accountId": "global-retail",
    "accountName": "Global Retail GmbH",
    "productId": "white-couverture",
    "volume": 48000,
    "price": 3.47,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-if-wc",
    "accountId": "interfood",
    "accountName": "InterFood BV",
    "productId": "white-couverture",
    "volume": 12000,
    "price": 4.49,
    "segment": "Enterprise Key Accounts",
    "zone": "green"
  },
  {
    "id": "seg-eu-wc",
    "accountId": "euro-patisserie",
    "accountName": "Euro Patisserie AG",
    "productId": "white-couverture",
    "volume": 16000,
    "price": 3.58,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-bk-dcv",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "dark-couverture",
    "volume": 320,
    "price": 3.91,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-pm-dcv",
    "accountId": "patisserie-moreau",
    "accountName": "Pâtisserie Moreau",
    "productId": "dark-couverture",
    "volume": 480,
    "price": 4.42,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-ca-dcv",
    "accountId": "choco-artisan",
    "accountName": "Choco Artisan BV",
    "productId": "dark-couverture",
    "volume": 210,
    "price": 4.84,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-cl-dcv",
    "accountId": "confiserie-lambert",
    "accountName": "Confiserie Lambert",
    "productId": "dark-couverture",
    "volume": 390,
    "price": 4.75,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-bd-dcv",
    "accountId": "bruxelles-doux",
    "accountName": "Bruxelles Doux NV",
    "productId": "dark-couverture",
    "volume": 560,
    "price": 4.10,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-nb-dcv",
    "accountId": "nordic-bakes",
    "accountName": "Nordic Bakes AS",
    "productId": "dark-couverture",
    "volume": 650,
    "price": 4.28,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-sc-dcv",
    "accountId": "scandichoc",
    "accountName": "Scandichoc AS",
    "productId": "dark-couverture",
    "volume": 280,
    "price": 3.77,
    "segment": "Mid-Market Nordics",
    "zone": "red"
  },
  {
    "id": "seg-bk2-dcv",
    "accountId": "bergens-konfekt",
    "accountName": "Bergens Konfekt",
    "productId": "dark-couverture",
    "volume": 420,
    "price": 4.52,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-hs-dcv",
    "accountId": "helsinki-sweet",
    "accountName": "Helsinki Sweet OY",
    "productId": "dark-couverture",
    "volume": 350,
    "price": 4.84,
    "segment": "Mid-Market Nordics",
    "zone": "green"
  },
  {
    "id": "seg-di-dcv",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "dark-couverture",
    "volume": 920,
    "price": 4.02,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-ac-dcv",
    "accountId": "artisan-cacao",
    "accountName": "Artisan Cacao SL",
    "productId": "dark-couverture",
    "volume": 280,
    "price": 4.33,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-cpr-dcv",
    "accountId": "cioccolato-puro",
    "accountName": "Cioccolato Puro Srl",
    "productId": "dark-couverture",
    "volume": 550,
    "price": 3.63,
    "segment": "Mid-Market Southern Europe",
    "zone": "red"
  },
  {
    "id": "seg-dv-dcv",
    "accountId": "dulce-valencia",
    "accountName": "Dulce Valencia SA",
    "productId": "dark-couverture",
    "volume": 320,
    "price": 4.61,
    "segment": "Mid-Market Southern Europe",
    "zone": "green"
  },
  {
    "id": "seg-mb-dcv",
    "accountId": "munchen-bakerei",
    "accountName": "Münchener Bäckerei",
    "productId": "dark-couverture",
    "volume": 710,
    "price": 4.00,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-wk-dcv",
    "accountId": "wiener-konditorei",
    "accountName": "Wiener Konditorei GmbH",
    "productId": "dark-couverture",
    "volume": 450,
    "price": 3.58,
    "segment": "Mid-Market DACH",
    "zone": "red"
  },
  {
    "id": "seg-zc-dcv",
    "accountId": "zurich-chocolat",
    "accountName": "Zürich Chocolat AG",
    "productId": "dark-couverture",
    "volume": 580,
    "price": 4.14,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-dp-dcv",
    "accountId": "dresdner-pralinen",
    "accountName": "Dresdner Pralinen GmbH",
    "productId": "dark-couverture",
    "volume": 320,
    "price": 4.47,
    "segment": "Mid-Market DACH",
    "zone": "green"
  },
  {
    "id": "seg-sr-dcv",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "dark-couverture",
    "volume": 38000,
    "price": 3.31,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-rc-dcv",
    "accountId": "royal-confections",
    "accountName": "Royal Confections Ltd",
    "productId": "dark-couverture",
    "volume": 22000,
    "price": 3.45,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-gr-dcv",
    "accountId": "global-retail",
    "accountName": "Global Retail GmbH",
    "productId": "dark-couverture",
    "volume": 48000,
    "price": 3.03,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-if-dcv",
    "accountId": "interfood",
    "accountName": "InterFood BV",
    "productId": "dark-couverture",
    "volume": 12000,
    "price": 3.91,
    "segment": "Enterprise Key Accounts",
    "zone": "green"
  },
  {
    "id": "seg-eu-dcv",
    "accountId": "euro-patisserie",
    "accountName": "Euro Patisserie AG",
    "productId": "dark-couverture",
    "volume": 16000,
    "price": 3.12,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-bk-cpw",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "cocoa-powder",
    "volume": 640,
    "price": 2.32,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-pm-cpw",
    "accountId": "patisserie-moreau",
    "accountName": "Pâtisserie Moreau",
    "productId": "cocoa-powder",
    "volume": 960,
    "price": 2.62,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-ca-cpw",
    "accountId": "choco-artisan",
    "accountName": "Choco Artisan BV",
    "productId": "cocoa-powder",
    "volume": 420,
    "price": 2.87,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-cl-cpw",
    "accountId": "confiserie-lambert",
    "accountName": "Confiserie Lambert",
    "productId": "cocoa-powder",
    "volume": 780,
    "price": 2.82,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-bd-cpw",
    "accountId": "bruxelles-doux",
    "accountName": "Bruxelles Doux NV",
    "productId": "cocoa-powder",
    "volume": 1120,
    "price": 2.43,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-nb-cpw",
    "accountId": "nordic-bakes",
    "accountName": "Nordic Bakes AS",
    "productId": "cocoa-powder",
    "volume": 1300,
    "price": 2.54,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-sc-cpw",
    "accountId": "scandichoc",
    "accountName": "Scandichoc AS",
    "productId": "cocoa-powder",
    "volume": 560,
    "price": 2.24,
    "segment": "Mid-Market Nordics",
    "zone": "red"
  },
  {
    "id": "seg-bk2-cpw",
    "accountId": "bergens-konfekt",
    "accountName": "Bergens Konfekt",
    "productId": "cocoa-powder",
    "volume": 840,
    "price": 2.68,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-hs-cpw",
    "accountId": "helsinki-sweet",
    "accountName": "Helsinki Sweet OY",
    "productId": "cocoa-powder",
    "volume": 700,
    "price": 2.87,
    "segment": "Mid-Market Nordics",
    "zone": "green"
  },
  {
    "id": "seg-di-cpw",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "cocoa-powder",
    "volume": 1840,
    "price": 2.39,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-ac-cpw",
    "accountId": "artisan-cacao",
    "accountName": "Artisan Cacao SL",
    "productId": "cocoa-powder",
    "volume": 560,
    "price": 2.57,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-cpr-cpw",
    "accountId": "cioccolato-puro",
    "accountName": "Cioccolato Puro Srl",
    "productId": "cocoa-powder",
    "volume": 1100,
    "price": 2.15,
    "segment": "Mid-Market Southern Europe",
    "zone": "red"
  },
  {
    "id": "seg-dv-cpw",
    "accountId": "dulce-valencia",
    "accountName": "Dulce Valencia SA",
    "productId": "cocoa-powder",
    "volume": 640,
    "price": 2.73,
    "segment": "Mid-Market Southern Europe",
    "zone": "green"
  },
  {
    "id": "seg-mb-cpw",
    "accountId": "munchen-bakerei",
    "accountName": "Münchener Bäckerei",
    "productId": "cocoa-powder",
    "volume": 1420,
    "price": 2.37,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-wk-cpw",
    "accountId": "wiener-konditorei",
    "accountName": "Wiener Konditorei GmbH",
    "productId": "cocoa-powder",
    "volume": 900,
    "price": 2.13,
    "segment": "Mid-Market DACH",
    "zone": "red"
  },
  {
    "id": "seg-zc-cpw",
    "accountId": "zurich-chocolat",
    "accountName": "Zürich Chocolat AG",
    "productId": "cocoa-powder",
    "volume": 1160,
    "price": 2.46,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-dp-cpw",
    "accountId": "dresdner-pralinen",
    "accountName": "Dresdner Pralinen GmbH",
    "productId": "cocoa-powder",
    "volume": 640,
    "price": 2.65,
    "segment": "Mid-Market DACH",
    "zone": "green"
  },
  {
    "id": "seg-sr-cpw",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "cocoa-powder",
    "volume": 38000,
    "price": 1.96,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-rc-cpw",
    "accountId": "royal-confections",
    "accountName": "Royal Confections Ltd",
    "productId": "cocoa-powder",
    "volume": 22000,
    "price": 2.04,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-gr-cpw",
    "accountId": "global-retail",
    "accountName": "Global Retail GmbH",
    "productId": "cocoa-powder",
    "volume": 48000,
    "price": 1.79,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-if-cpw",
    "accountId": "interfood",
    "accountName": "InterFood BV",
    "productId": "cocoa-powder",
    "volume": 12000,
    "price": 2.32,
    "segment": "Enterprise Key Accounts",
    "zone": "green"
  },
  {
    "id": "seg-eu-cpw",
    "accountId": "euro-patisserie",
    "accountName": "Euro Patisserie AG",
    "productId": "cocoa-powder",
    "volume": 16000,
    "price": 1.85,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-bk-hp",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "hazelnut-praline",
    "volume": 160,
    "price": 5.36,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-pm-hp",
    "accountId": "patisserie-moreau",
    "accountName": "Pâtisserie Moreau",
    "productId": "hazelnut-praline",
    "volume": 240,
    "price": 6.06,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-ca-hp",
    "accountId": "choco-artisan",
    "accountName": "Choco Artisan BV",
    "productId": "hazelnut-praline",
    "volume": 105,
    "price": 6.64,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-cl-hp",
    "accountId": "confiserie-lambert",
    "accountName": "Confiserie Lambert",
    "productId": "hazelnut-praline",
    "volume": 195,
    "price": 6.51,
    "segment": "Mid-Market Benelux",
    "zone": "green"
  },
  {
    "id": "seg-bd-hp",
    "accountId": "bruxelles-doux",
    "accountName": "Bruxelles Doux NV",
    "productId": "hazelnut-praline",
    "volume": 280,
    "price": 5.61,
    "segment": "Mid-Market Benelux",
    "zone": "red"
  },
  {
    "id": "seg-nb-hp",
    "accountId": "nordic-bakes",
    "accountName": "Nordic Bakes AS",
    "productId": "hazelnut-praline",
    "volume": 325,
    "price": 5.87,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-sc-hp",
    "accountId": "scandichoc",
    "accountName": "Scandichoc AS",
    "productId": "hazelnut-praline",
    "volume": 140,
    "price": 5.17,
    "segment": "Mid-Market Nordics",
    "zone": "red"
  },
  {
    "id": "seg-bk2-hp",
    "accountId": "bergens-konfekt",
    "accountName": "Bergens Konfekt",
    "productId": "hazelnut-praline",
    "volume": 210,
    "price": 6.19,
    "segment": "Mid-Market Nordics",
    "zone": "amber"
  },
  {
    "id": "seg-hs-hp",
    "accountId": "helsinki-sweet",
    "accountName": "Helsinki Sweet OY",
    "productId": "hazelnut-praline",
    "volume": 175,
    "price": 6.64,
    "segment": "Mid-Market Nordics",
    "zone": "green"
  },
  {
    "id": "seg-di-hp",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "hazelnut-praline",
    "volume": 460,
    "price": 5.51,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-ac-hp",
    "accountId": "artisan-cacao",
    "accountName": "Artisan Cacao SL",
    "productId": "hazelnut-praline",
    "volume": 140,
    "price": 5.93,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
  },
  {
    "id": "seg-cpr-hp",
    "accountId": "cioccolato-puro",
    "accountName": "Cioccolato Puro Srl",
    "productId": "hazelnut-praline",
    "volume": 275,
    "price": 4.98,
    "segment": "Mid-Market Southern Europe",
    "zone": "red"
  },
  {
    "id": "seg-dv-hp",
    "accountId": "dulce-valencia",
    "accountName": "Dulce Valencia SA",
    "productId": "hazelnut-praline",
    "volume": 160,
    "price": 6.32,
    "segment": "Mid-Market Southern Europe",
    "zone": "green"
  },
  {
    "id": "seg-mb-hp",
    "accountId": "munchen-bakerei",
    "accountName": "Münchener Bäckerei",
    "productId": "hazelnut-praline",
    "volume": 355,
    "price": 5.49,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-wk-hp",
    "accountId": "wiener-konditorei",
    "accountName": "Wiener Konditorei GmbH",
    "productId": "hazelnut-praline",
    "volume": 225,
    "price": 4.91,
    "segment": "Mid-Market DACH",
    "zone": "red"
  },
  {
    "id": "seg-zc-hp",
    "accountId": "zurich-chocolat",
    "accountName": "Zürich Chocolat AG",
    "productId": "hazelnut-praline",
    "volume": 290,
    "price": 5.68,
    "segment": "Mid-Market DACH",
    "zone": "amber"
  },
  {
    "id": "seg-dp-hp",
    "accountId": "dresdner-pralinen",
    "accountName": "Dresdner Pralinen GmbH",
    "productId": "hazelnut-praline",
    "volume": 160,
    "price": 6.13,
    "segment": "Mid-Market DACH",
    "zone": "green"
  },
  {
    "id": "seg-sr-hp",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "hazelnut-praline",
    "volume": 19000,
    "price": 4.53,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-rc-hp",
    "accountId": "royal-confections",
    "accountName": "Royal Confections Ltd",
    "productId": "hazelnut-praline",
    "volume": 11000,
    "price": 4.72,
    "segment": "Enterprise Key Accounts",
    "zone": "amber"
  },
  {
    "id": "seg-gr-hp",
    "accountId": "global-retail",
    "accountName": "Global Retail GmbH",
    "productId": "hazelnut-praline",
    "volume": 24000,
    "price": 4.15,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  },
  {
    "id": "seg-if-hp",
    "accountId": "interfood",
    "accountName": "InterFood BV",
    "productId": "hazelnut-praline",
    "volume": 6000,
    "price": 5.36,
    "segment": "Enterprise Key Accounts",
    "zone": "green"
  },
  {
    "id": "seg-eu-hp",
    "accountId": "euro-patisserie",
    "accountName": "Euro Patisserie AG",
    "productId": "hazelnut-praline",
    "volume": 8000,
    "price": 4.28,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  }
]
```

**GOTCHA:** The old `"seg-cp-mc"` ID (Cioccolato Puro / milk-couverture) has been renamed to `"seg-cpr-mc"` to free the `-cp` suffix for cocoa-powder. Verify no other code references these IDs by string — they are only used as JSON `id` fields for uniqueness.
**VALIDATE:** `node -e "const d=JSON.parse(require('fs').readFileSync('data/segmentation.json','utf8')); const ids=d.map(x=>x.id); console.log('total:', ids.length, 'unique:', new Set(ids).size)"` — both counts must be equal and total should be 122.

---

### TASK 5 — UPDATE `src/app/segmentation/page.tsx`

**IMPLEMENT:** Update lines 35–39. Add import of helpers, replace flat `.floor`/`.target` access.

Add to imports at top (line 5, after existing `@/lib/data` import):
```ts
import { accounts, products, getSegmentationForProduct, getFloor, getTarget } from '@/lib/data'
```

Replace lines 38–39:
```ts
// BEFORE
const floorPrice = activeAccount?.floor ?? 4.57
const targetPrice = activeAccount?.target ?? 4.85

// AFTER
const floorPrice = activeAccount ? getFloor(activeAccount, productId) : 4.57
const targetPrice = activeAccount ? getTarget(activeAccount, productId) : 4.85
```

**VALIDATE:** `npx tsc --noEmit` — error count should drop by 2.

---

### TASK 6 — UPDATE `src/components/segmentation/ComparisonPanel.tsx`

**IMPLEMENT:** Add helper imports, fix 3 `.floor`/`.target` usages.

Add to import (line 4):
```ts
import { accounts as allAccounts, getSegmentationForProduct, getFloor, getTarget } from '@/lib/data'
```

Replace line 50–51:
```ts
// BEFORE
floorPrice={account?.floor ?? 4.57}
targetPrice={account?.target ?? 4.85}

// AFTER
floorPrice={account ? getFloor(account, productId ?? 'milk-couverture') : 4.57}
targetPrice={account ? getTarget(account, productId ?? 'milk-couverture') : 4.85}
```

Replace line 60 (the zone label conditional):
```ts
// BEFORE
account.price < account.floor ? 'Below floor' : account.price < account.target ? 'In-band' : 'Above target'

// AFTER
account.price < getFloor(account, productId ?? 'milk-couverture') ? 'Below floor' : account.price < getTarget(account, productId ?? 'milk-couverture') ? 'In-band' : 'Above target'
```

**GOTCHA:** `ComparisonPanel` receives `productId: string | null` — always fall back to `'milk-couverture'` when null.
**VALIDATE:** `npx tsc --noEmit` — error count drops by 3.

---

### TASK 7 — UPDATE `src/app/cpq/page.tsx`

**IMPLEMENT:** Add helper imports, replace lines 55–56.

Add `getFloor, getTarget` to the existing `@/lib/data` import (line 4):
```ts
import { accounts, products, getFloor, getTarget } from '@/lib/data'
```

Replace lines 55–56:
```ts
// BEFORE
const floorPrice = account?.floor ?? 4.57
const targetPrice = account?.target ?? 4.85

// AFTER
const floorPrice = account ? getFloor(account, productId) : 4.57
const targetPrice = account ? getTarget(account, productId) : 4.85
```

**VALIDATE:** `npx tsc --noEmit` — zero type errors expected.

---

## VALIDATION COMMANDS

### Level 1 — Type check (run after every task)
```bash
npx tsc --noEmit
```
Expected: 0 errors after Task 7.

### Level 2 — JSON validity
```bash
node -e "JSON.parse(require('fs').readFileSync('data/accounts.json','utf8')); console.log('accounts.json OK')"
node -e "const d=JSON.parse(require('fs').readFileSync('data/segmentation.json','utf8')); const ids=d.map(x=>x.id); console.log('segmentation.json OK — entries:', ids.length, '/ unique IDs:', new Set(ids).size)"
```

### Level 3 — Dev server
```bash
npm run dev
```
Navigate to `http://localhost:3000/segmentation`, select each product in the dropdown, verify:
- Chart renders with dots for each product
- Floor/target reference lines shift per product
- KPI cards update correctly
- Baker Klaas is RED (below floor) for all 6 products

### Level 4 — Manual spot checks

| Check | How |
|---|---|
| Baker Klaas / White Couverture: price €4.49, floor €4.89, -8.0% vs floor | Select BK + WC |
| Baker Klaas / Cocoa Powder: price €2.32, floor €2.52 | Select BK + CP |
| Baker Klaas / Hazelnut Praline: price €5.36, floor €5.83 | Select BK + HP |
| Choco Artisan BV / Milk Couverture: price €5.20 (was broken at €4.90) | Select CA + MC |
| Segment rank shows a number (not "—") for all 10 selectable accounts on MC | Cycle accounts |
| ComparisonPanel floor lines differ when switching products | Enable Compare mode |
| CPQ floor/target updates when switching from MC to WC | Navigate to CPQ |

---

## ACCEPTANCE CRITERIA

- [ ] All 6 products render a populated scatter chart with correct floor/target reference lines
- [ ] Baker Klaas is in the RED zone (below floor) for all 6 products
- [ ] "Segment rank" KPI shows a percentage (not "—") for all 10 selectable accounts on Milk Couverture
- [ ] "Current price" KPI matches the highlighted dot Y-position for all accounts (no more €4.90 vs €5.20 gap)
- [ ] CPQ floor and target values update correctly when product is switched
- [ ] ComparisonPanel floor/target lines use the correct product-specific values
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `segmentation.json` has 122 entries with unique IDs

---

## NOTES

- The `zone` field in `segmentation.json` is never read by the rendering code (`CustomDot` recalculates live from floor/target). It is included for documentation/reference only — keep it correct but know it is not load-bearing.
- Enterprise accounts (Cocoa Powder) keep the same volumes as MC to stay within the X-axis domain of 50 000. Mid-market Cocoa Powder volumes are ×2.
- Hazelnut Praline enterprise volumes are ×0.5 of MC; all remain within the [150, 50 000] X-axis range.
- The `"seg-cp-mc"` ID in the original file has been renamed to `"seg-cpr-mc"` (Cioccolato Puro). If any other file references that string ID, update it.

**Confidence score: 9/10** — all data pre-calculated, all consumer files identified, helper pattern is straightforward. Only risk is if another undiscovered file reads `.floor`/`.target` directly; run a final `grep -r "\.floor\b\|\.target\b" src/` to confirm none remain after Task 7.
