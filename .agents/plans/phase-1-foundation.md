# Feature: Phase 1 — Foundation (Shell + Data)

The following plan is complete and self-contained. Validate every file path, import, and command before proceeding. Pay special attention to Next.js 14 App Router conventions — all layouts and pages must follow the App Router pattern, not Pages Router.

## Feature Description

Scaffold the complete Equazion application shell: Next.js 14 project with TypeScript and Tailwind CSS, PwC/Equazion brand identity, sidebar + topbar layout, all seven route pages (placeholder content), AppContext for cross-screen state, FilterBar component mounted on every screen, and all mock JSON data files fully populated with Scenario 1 numbers baked in.

No AI API routes in Phase 1. No charts. No business logic. Just the shell that Phase 2 will fill.

## User Story

As a PwC consultant preparing for a demo,
I want a navigable Next.js app with all seven screens, a working filter bar, and fully populated mock data,
So that Phase 2 can layer in charts and AI without touching data or shell structure.

## Problem Statement

The project directory is empty (only `brand_assets/` and `.claude/`). There is no Next.js app, no package.json, no data files. Phase 1 must create the complete foundation.

## Solution Statement

Run `create-next-app`, configure brand tokens, build layout shell, scaffold all routes, wire AppContext and FilterBar, and write all JSON data files — in that exact order.

## Feature Metadata

**Feature Type**: New Capability (greenfield)
**Estimated Complexity**: Medium
**Primary Systems Affected**: Entire application (foundation)
**Dependencies**: Node.js 18+, Next.js 14, React 18, TypeScript 5, Tailwind CSS 3, lucide-react, clsx

---

## CONTEXT REFERENCES

### Brand Assets (READ BEFORE STYLING)

- `brand_assets/palette.css` — full CSS variable token list; source of truth for all colours
- `brand_assets/Equazion_logo.png` — logo for sidebar header
- `brand_assets/PwC-logo-icon.png` — PwC square icon (sidebar footer)
- `brand_assets/PwC-logo-white.svg` — PwC white wordmark (sidebar footer)

### Key Colour Decisions from palette.css

| Role | CSS Var | Hex | Usage |
|---|---|---|---|
| Sidebar background | `--darkslategray` | `rgb(50,51,54)` | Sidebar bg |
| PwC orange accent | `--darkorange-100` | `#eb8c00` | Active nav, accents |
| Body background | `--whitesmoke-300` | `#f5f5f5` | Page bg |
| Red zone | `--crimson-400` | `#dc2626` | Below floor |
| Amber zone | `--darkorange-100` | `#eb8c00` | In-band |
| Green zone | `--seagreen-200` | `#059669` | Above target |
| Border colour | `--gainsboro-100` | `#ddd` | Dividers |
| Text primary | `--darkslategray-200` | `#333` | Body text |

### New Files to Create

```
FoS_Demo/
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.local
├── .gitignore
├── vercel.json
├── public/
│   ├── equazion-logo.png        (copy from brand_assets/)
│   ├── pwc-logo-icon.png        (copy from brand_assets/)
│   └── pwc-logo-white.svg       (copy from brand_assets/)
├── data/
│   ├── accounts.json
│   ├── products.json
│   ├── quotes.json
│   ├── segmentation.json
│   ├── waterfall.json
│   ├── pvm.json
│   ├── win-loss.json
│   ├── ease-of-realization.json
│   └── chat-scenarios.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── chat/page.tsx
│   │   ├── segmentation/page.tsx
│   │   ├── deal-pricing/page.tsx
│   │   ├── win-loss/page.tsx
│   │   ├── ease-of-realization/page.tsx
│   │   ├── waterfall/page.tsx
│   │   └── pvm/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── shared/
│   │       └── FilterBar.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   └── lib/
│       └── data.ts
```

### Relevant Documentation

- [Next.js 14 App Router](https://nextjs.org/docs/app) — use App Router, NOT Pages Router
- [Next.js layout.tsx](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates) — root layout wraps all children with sidebar/topbar
- [Tailwind CSS v3 Config](https://tailwindcss.com/docs/configuration) — extend `colors` in tailwind.config.ts with brand tokens
- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image) — use `next/image` for logos

---

## IMPLEMENTATION PLAN

### Phase 1: Project Bootstrap

Initialize Next.js, install dependencies, copy brand assets, configure Tailwind with brand tokens.

### Phase 2: Layout Shell

Root layout.tsx, Sidebar, TopBar — the persistent chrome that wraps every screen.

### Phase 3: AppContext + FilterBar

Cross-screen state and the universal filter component.

### Phase 4: Route Pages

Seven screen pages with placeholder content, each mounting FilterBar.

### Phase 5: Data Files

All nine JSON files fully populated, Scenario 1 numbers exact.

### Phase 6: Data Access Utility

`src/lib/data.ts` with typed import helpers.

---

## STEP-BY-STEP TASKS

---

### TASK 1 — Bootstrap Next.js project

Run inside `C:\Users\Vadim Gerasimov\POCs\FoS_Demo`:

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Then move the generated `app/` directory into `src/app/` (or re-run with `--src-dir`):

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- **GOTCHA**: The `.` installs into the existing directory. If prompted about existing files, accept overwrite for generated files only.
- **GOTCHA**: Use `--src-dir` so Next.js creates `src/app/` matching the PRD structure.
- **VALIDATE**: `npm run dev` starts on port 3000 without errors.

---

### TASK 2 — Install additional dependencies

```bash
npm install lucide-react clsx recharts openai
npm install --save-dev @types/node
```

- **VALIDATE**: `cat package.json | grep -E "lucide|clsx|recharts|openai"`

---

### TASK 3 — Copy brand assets to public/

```bash
cp brand_assets/Equazion_logo.png public/equazion-logo.png
cp brand_assets/PwC-logo-icon.png public/pwc-logo-icon.png
cp "brand_assets/PwC-logo-white.svg" public/pwc-logo-white.svg
```

- **VALIDATE**: All three files exist in `public/`

---

### TASK 4 — Configure Tailwind with brand tokens

**UPDATE** `tailwind.config.ts` — extend colors:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        'pwc-orange': '#eb8c00',
        'pwc-orange-dark': '#dc6900',
        // Sidebar
        'sidebar-bg': 'rgb(50,51,54)',
        'sidebar-hover': 'rgba(255,255,255,0.08)',
        'sidebar-active': 'rgba(235,140,0,0.15)',
        // Page
        'page-bg': '#f5f5f5',
        'card-bg': '#ffffff',
        // Zone colours
        'zone-red': '#dc2626',
        'zone-red-bg': '#fef2f2',
        'zone-amber': '#eb8c00',
        'zone-amber-bg': '#fffbeb',
        'zone-green': '#059669',
        'zone-green-bg': '#ecfdf5',
        // Text
        'text-primary': '#333333',
        'text-secondary': '#6d6e71',
        'text-muted': '#939598',
        // Borders
        'border-default': '#e7e7e8',
        'border-strong': '#dadadc',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- **VALIDATE**: `npm run build` completes without Tailwind errors.

---

### TASK 5 — Update globals.css

**REPLACE** `src/app/globals.css` contents:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  body {
    @apply bg-page-bg text-text-primary;
  }
}

@layer components {
  /* Zone badge utilities */
  .zone-badge-red {
    @apply bg-zone-red-bg text-zone-red border border-zone-red/20 rounded-full px-2.5 py-0.5 text-xs font-semibold;
  }
  .zone-badge-amber {
    @apply bg-zone-amber-bg text-zone-amber border border-zone-amber/20 rounded-full px-2.5 py-0.5 text-xs font-semibold;
  }
  .zone-badge-green {
    @apply bg-zone-green-bg text-zone-green border border-zone-green/20 rounded-full px-2.5 py-0.5 text-xs font-semibold;
  }

  /* Card */
  .card {
    @apply bg-card-bg border border-border-default rounded-xl shadow-sm;
  }

  /* Page layout */
  .page-container {
    @apply flex flex-col gap-6 p-6 h-full;
  }

  .page-title {
    @apply text-xl font-semibold text-text-primary;
  }
}
```

- **VALIDATE**: Dev server renders page without CSS errors.

---

### TASK 6 — Create AppContext

**CREATE** `src/context/AppContext.tsx`:

```tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextValue {
  activeAccountId: string | null
  activeProductId: string | null
  activeVolume: number | null
  setAccount: (id: string | null) => void
  setProduct: (id: string | null) => void
  setVolume: (kg: number | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeAccountId, setActiveAccountId] = useState<string | null>('baker-klaas')
  const [activeProductId, setActiveProductId] = useState<string | null>('milk-couverture')
  const [activeVolume, setActiveVolume] = useState<number | null>(320)

  return (
    <AppContext.Provider
      value={{
        activeAccountId,
        activeProductId,
        activeVolume,
        setAccount: setActiveAccountId,
        setProduct: setActiveProductId,
        setVolume: setActiveVolume,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
```

- **NOTE**: Default state pre-selects Baker Klaas + Milk Couverture so Scenario 1 is the cold-start state.
- **VALIDATE**: TypeScript compiles without error on `npm run build`.

---

### TASK 7 — Create Sidebar component

**CREATE** `src/components/layout/Sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  MessageSquare,
  ScatterChart,
  Calculator,
  TrendingUp,
  BarChart2,
  Layers,
  GitBranch,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/chat', label: 'Chat with Your Data', icon: MessageSquare },
  { href: '/segmentation', label: 'Segmentation', icon: ScatterChart },
  { href: '/deal-pricing', label: 'Deal Pricing', icon: Calculator },
  { href: '/win-loss', label: 'Win / Loss', icon: TrendingUp },
  { href: '/ease-of-realization', label: 'Ease of Realization', icon: BarChart2 },
  { href: '/waterfall', label: 'Price Waterfall', icon: Layers },
  { href: '/pvm', label: 'PVM Bridge', icon: GitBranch },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar-bg shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <Image
          src="/equazion-logo.png"
          alt="Equazion"
          width={28}
          height={28}
          className="rounded"
        />
        <span className="text-white font-semibold text-[15px] tracking-tight">
          Equazion
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-active text-pwc-orange font-medium'
                  : 'text-white/70 hover:text-white hover:bg-sidebar-hover'
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* PwC Footer */}
      <div className="flex items-center gap-2 px-5 py-4 border-t border-white/10">
        <Image
          src="/pwc-logo-white.svg"
          alt="PwC"
          width={36}
          height={18}
          className="opacity-60"
        />
        <span className="text-white/40 text-xs">Commercial Intelligence</span>
      </div>
    </aside>
  )
}
```

- **GOTCHA**: `usePathname` requires `'use client'` — the sidebar is a client component.
- **VALIDATE**: All seven nav links render; active state highlights correctly when navigating.

---

### TASK 8 — Create TopBar component

**CREATE** `src/components/layout/TopBar.tsx`:

```tsx
'use client'

import { useAppContext } from '@/context/AppContext'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

const SCREEN_TITLES: Record<string, string> = {
  '/chat': 'Chat with Your Data',
  '/segmentation': 'Segmentation',
  '/deal-pricing': 'Deal Pricing',
  '/win-loss': 'Win / Loss Price Intelligence',
  '/ease-of-realization': 'Ease of Realization',
  '/waterfall': 'Price Waterfall',
  '/pvm': 'PVM Bridge',
}

export function TopBar() {
  const pathname = usePathname()
  const title = SCREEN_TITLES[pathname] ?? 'Equazion'

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-border-default shrink-0">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded-lg hover:bg-page-bg transition-colors text-text-muted hover:text-text-primary">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-semibold">
            S
          </div>
          <span className="text-sm text-text-secondary font-medium">Sarah</span>
        </div>
      </div>
    </header>
  )
}
```

- **VALIDATE**: TopBar shows correct page title on each screen.

---

### TASK 9 — Create root layout.tsx

**REPLACE** `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { AppProvider } from '@/context/AppContext'

export const metadata: Metadata = {
  title: 'Equazion',
  description: 'Commercial Pricing Intelligence — PwC',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto bg-page-bg">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
```

- **GOTCHA**: `AppProvider` must wrap `Sidebar` and `TopBar` since both use `useAppContext`.
- **VALIDATE**: Full-height sidebar + topbar layout renders on all pages.

---

### TASK 10 — Create root page.tsx (redirect)

**REPLACE** `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/chat')
}
```

- **VALIDATE**: Navigating to `/` immediately lands on `/chat`.

---

### TASK 11 — Create FilterBar component

**CREATE** `src/components/shared/FilterBar.tsx`:

```tsx
'use client'

import { useAppContext } from '@/context/AppContext'
import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { Account, Product } from '@/lib/data'

interface FilterBarProps {
  accounts: Account[]
  products: Product[]
}

export function FilterBar({ accounts, products }: FilterBarProps) {
  const { activeAccountId, activeProductId, setAccount, setProduct } = useAppContext()

  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const activeProduct = products.find(p => p.id === activeProductId)

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-border-default">
      {/* Account selector */}
      <div className="relative">
        <label className="text-xs font-medium text-text-muted mr-1.5">Account</label>
        <select
          value={activeAccountId ?? ''}
          onChange={e => setAccount(e.target.value || null)}
          className="text-sm text-text-primary border border-border-default rounded-lg px-3 py-1.5 pr-8 bg-white appearance-none cursor-pointer hover:border-pwc-orange focus:outline-none focus:border-pwc-orange transition-colors"
        >
          <option value="">All accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none mt-0.5" />
      </div>

      {/* Product selector */}
      <div className="relative">
        <label className="text-xs font-medium text-text-muted mr-1.5">Product</label>
        <select
          value={activeProductId ?? ''}
          onChange={e => setProduct(e.target.value || null)}
          className="text-sm text-text-primary border border-border-default rounded-lg px-3 py-1.5 pr-8 bg-white appearance-none cursor-pointer hover:border-pwc-orange focus:outline-none focus:border-pwc-orange transition-colors"
        >
          <option value="">All products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none mt-0.5" />
      </div>

      {/* Active context pill */}
      {(activeAccount || activeProduct) && (
        <div className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-pwc-orange/10 border border-pwc-orange/20 rounded-full text-xs font-medium text-pwc-orange-dark">
          {activeAccount?.name}
          {activeAccount && activeProduct && <span className="opacity-60">·</span>}
          {activeProduct?.name}
          <button
            onClick={() => { setAccount(null); setProduct(null) }}
            className="ml-0.5 hover:opacity-70 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Segment badge */}
      {activeAccount && (
        <span className="ml-auto text-xs text-text-muted font-medium px-2.5 py-1 bg-page-bg border border-border-default rounded-full">
          {activeAccount.segment}
        </span>
      )}
    </div>
  )
}
```

- **NOTE**: FilterBar receives `accounts` and `products` as props (loaded server-side by each page) to avoid repeated data loading.
- **VALIDATE**: Selecting an account/product updates AppContext; pill appears and clears correctly.

---

### TASK 12 — Create data access library

**CREATE** `src/lib/data.ts`:

```ts
// Type definitions for all data entities

export interface Account {
  id: string
  name: string
  segment: string
  segmentId: string
  volume: number       // kg/month
  price: number        // €/kg current net-net
  floor: number        // €/kg segment floor
  target: number       // €/kg segment target
  region: string
}

export interface Product {
  id: string
  name: string
  family: string
  listPrice: number    // €/kg
  escalationThresholds: {
    rep: number        // % discount that triggers rep escalation
    manager: number    // % discount that triggers manager escalation
    director: number   // % discount that triggers director escalation
  }
}

export interface SegmentationPoint {
  id: string
  accountId: string
  accountName: string
  productId: string
  volume: number
  price: number
  segment: string
  zone: 'green' | 'amber' | 'red'
}

export interface WaterfallItem {
  accountId: string
  productId: string
  layers: {
    name: string
    value: number    // negative = deduction
    cumulative: number
    isHighlighted?: boolean
  }[]
}

export interface PVMData {
  accountId: string
  priorRevenue: number
  volumeEffect: number
  priceEffect: number
  mixEffect: number
  currentRevenue: number
  products: {
    productId: string
    productName: string
    priorRevenue: number
    volumeEffect: number
    priceEffect: number
    mixEffect: number
    currentRevenue: number
    delta: number
  }[]
}

export interface WinLossData {
  productId: string
  curve: { price: number; winRate: number }[]
  cliffMin: number
  cliffMax: number
  optimalPrice: number
  historicalQuotes: {
    price: number
    won: boolean
  }[]
}

export interface EoRData {
  accountId: string
  compositeScore: number
  dimensions: {
    name: string
    score: number
    driverNote: string
  }[]
}

export interface ChatScenario {
  id: string
  matchPhrases: string[]
  accountId: string | null
  productId: string | null
  response: string
  visualType: 'scatter' | 'waterfall' | 'pvm' | 'winLoss' | 'eor' | 'table' | null
  dataKey: string | null
  suggestedAction: string | null
  tableData?: Record<string, string | number>[]
}

// Import helpers — all data loaded synchronously from JSON
import accountsData from '../../data/accounts.json'
import productsData from '../../data/products.json'
import segmentationData from '../../data/segmentation.json'
import waterfallData from '../../data/waterfall.json'
import pvmData from '../../data/pvm.json'
import winLossData from '../../data/win-loss.json'
import eorData from '../../data/ease-of-realization.json'
import chatScenariosData from '../../data/chat-scenarios.json'

export const accounts: Account[] = accountsData as Account[]
export const products: Product[] = productsData as Product[]
export const segmentationPoints: SegmentationPoint[] = segmentationData as SegmentationPoint[]
export const waterfallItems: WaterfallItem[] = waterfallData as WaterfallItem[]
export const pvmDataset: PVMData[] = pvmData as PVMData[]
export const winLossDataset: WinLossData[] = winLossData as WinLossData[]
export const eorDataset: EoRData[] = eorData as EoRData[]
export const chatScenarios: ChatScenario[] = chatScenariosData as ChatScenario[]

// Filter helpers
export function getAccount(id: string | null): Account | undefined {
  return accounts.find(a => a.id === id)
}

export function getProduct(id: string | null): Product | undefined {
  return products.find(p => p.id === id)
}

export function getSegmentationForProduct(productId: string): SegmentationPoint[] {
  return segmentationPoints.filter(p => p.productId === productId)
}

export function getWaterfallForAccount(accountId: string, productId: string): WaterfallItem | undefined {
  return waterfallItems.find(w => w.accountId === accountId && w.productId === productId)
}

export function getPVMForAccount(accountId: string): PVMData | undefined {
  return pvmDataset.find(p => p.accountId === accountId)
}

export function getWinLossForProduct(productId: string): WinLossData | undefined {
  return winLossDataset.find(w => w.productId === productId)
}

export function getEoRForAccount(accountId: string): EoRData | undefined {
  return eorDataset.find(e => e.accountId === accountId)
}
```

- **GOTCHA**: JSON imports require `"resolveJsonModule": true` in `tsconfig.json` — verify this is set (create-next-app sets it by default).
- **VALIDATE**: `npm run build` compiles `data.ts` without TypeScript errors.

---

### TASK 13 — Create data/accounts.json

**CREATE** `data/accounts.json`:

```json
[
  {
    "id": "baker-klaas",
    "name": "Baker Klaas",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 320,
    "price": 4.20,
    "floor": 4.05,
    "target": 4.85,
    "region": "Benelux"
  },
  {
    "id": "schoko-retail",
    "name": "Schoko Retail Group",
    "segment": "Enterprise Key Accounts",
    "segmentId": "enterprise-key-accounts",
    "volume": 38000,
    "price": 3.55,
    "floor": 3.40,
    "target": 4.10,
    "region": "DACH"
  },
  {
    "id": "patisserie-moreau",
    "name": "Pâtisserie Moreau",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 480,
    "price": 4.75,
    "floor": 4.05,
    "target": 4.85,
    "region": "France"
  },
  {
    "id": "choco-artisan",
    "name": "Choco Artisan BV",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 210,
    "price": 4.90,
    "floor": 4.05,
    "target": 4.85,
    "region": "Netherlands"
  },
  {
    "id": "nordic-bakes",
    "name": "Nordic Bakes AS",
    "segment": "Mid-Market Nordics",
    "segmentId": "mid-market-nordics",
    "volume": 650,
    "price": 4.60,
    "floor": 4.20,
    "target": 5.00,
    "region": "Scandinavia"
  },
  {
    "id": "dolce-italia",
    "name": "Dolce Italia SpA",
    "segment": "Mid-Market Southern Europe",
    "segmentId": "mid-market-south-eu",
    "volume": 920,
    "price": 4.40,
    "floor": 4.10,
    "target": 4.80,
    "region": "Italy"
  },
  {
    "id": "confiserie-lambert",
    "name": "Confiserie Lambert",
    "segment": "Mid-Market Benelux",
    "segmentId": "mid-market-benelux",
    "volume": 390,
    "price": 5.10,
    "floor": 4.05,
    "target": 4.85,
    "region": "Belgium"
  },
  {
    "id": "munchen-bakerei",
    "name": "Münchener Bäckerei",
    "segment": "Mid-Market DACH",
    "segmentId": "mid-market-dach",
    "volume": 710,
    "price": 4.30,
    "floor": 4.00,
    "target": 4.70,
    "region": "Germany"
  },
  {
    "id": "royal-confections",
    "name": "Royal Confections Ltd",
    "segment": "Enterprise Key Accounts",
    "segmentId": "enterprise-key-accounts",
    "volume": 22000,
    "price": 3.80,
    "floor": 3.40,
    "target": 4.10,
    "region": "UK"
  },
  {
    "id": "artisan-cacao",
    "name": "Artisan Cacao SL",
    "segment": "Mid-Market Southern Europe",
    "segmentId": "mid-market-south-eu",
    "volume": 280,
    "price": 4.55,
    "floor": 4.10,
    "target": 4.80,
    "region": "Spain"
  }
]
```

---

### TASK 14 — Create data/products.json

**CREATE** `data/products.json`:

```json
[
  {
    "id": "milk-couverture",
    "name": "Milk Couverture",
    "family": "Couverture",
    "listPrice": 5.80,
    "escalationThresholds": {
      "rep": 5,
      "manager": 10,
      "director": 15
    }
  },
  {
    "id": "white-couverture",
    "name": "White Couverture",
    "family": "Couverture",
    "listPrice": 6.20,
    "escalationThresholds": {
      "rep": 5,
      "manager": 10,
      "director": 15
    }
  },
  {
    "id": "cocoa-powder",
    "name": "Cocoa Powder",
    "family": "Ingredient",
    "listPrice": 3.20,
    "escalationThresholds": {
      "rep": 8,
      "manager": 12,
      "director": 18
    }
  },
  {
    "id": "dark-compound",
    "name": "Dark Compound",
    "family": "Compound",
    "listPrice": 4.60,
    "escalationThresholds": {
      "rep": 6,
      "manager": 11,
      "director": 16
    }
  },
  {
    "id": "hazelnut-praline",
    "name": "Hazelnut Praline",
    "family": "Filling",
    "listPrice": 7.40,
    "escalationThresholds": {
      "rep": 4,
      "manager": 8,
      "director": 12
    }
  },
  {
    "id": "dark-couverture",
    "name": "Dark Couverture",
    "family": "Couverture",
    "listPrice": 5.40,
    "escalationThresholds": {
      "rep": 5,
      "manager": 10,
      "director": 15
    }
  }
]
```

---

### TASK 15 — Create data/segmentation.json

**CREATE** `data/segmentation.json` (Milk Couverture points — all 10 accounts):

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
    "price": 4.90,
    "segment": "Mid-Market Benelux",
    "zone": "green"
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
    "id": "seg-di-mc",
    "accountId": "dolce-italia",
    "accountName": "Dolce Italia SpA",
    "productId": "milk-couverture",
    "volume": 920,
    "price": 4.40,
    "segment": "Mid-Market Southern Europe",
    "zone": "amber"
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
    "id": "seg-bk-dc",
    "accountId": "baker-klaas",
    "accountName": "Baker Klaas",
    "productId": "dark-compound",
    "volume": 120,
    "price": 3.85,
    "segment": "Mid-Market Benelux",
    "zone": "amber"
  },
  {
    "id": "seg-sr-dc",
    "accountId": "schoko-retail",
    "accountName": "Schoko Retail Group",
    "productId": "dark-compound",
    "volume": 45000,
    "price": 3.70,
    "segment": "Enterprise Key Accounts",
    "zone": "red"
  }
]
```

---

### TASK 16 — Create data/waterfall.json

**CREATE** `data/waterfall.json`:

```json
[
  {
    "accountId": "baker-klaas",
    "productId": "milk-couverture",
    "layers": [
      { "name": "List Price", "value": 5.80, "cumulative": 5.80 },
      { "name": "Invoice Discount", "value": -0.58, "cumulative": 5.22 },
      { "name": "Net Invoice Price", "value": 0, "cumulative": 5.22 },
      { "name": "Rebate", "value": -0.77, "cumulative": 4.45, "isHighlighted": true },
      { "name": "Payment Terms Adj.", "value": -0.25, "cumulative": 4.20 },
      { "name": "Net-Net Price", "value": 0, "cumulative": 4.20 }
    ]
  },
  {
    "accountId": "schoko-retail",
    "productId": "milk-couverture",
    "layers": [
      { "name": "List Price", "value": 5.80, "cumulative": 5.80 },
      { "name": "Invoice Discount", "value": -1.16, "cumulative": 4.64 },
      { "name": "Net Invoice Price", "value": 0, "cumulative": 4.64 },
      { "name": "Rebate", "value": -0.88, "cumulative": 3.76 },
      { "name": "Payment Terms Adj.", "value": -0.21, "cumulative": 3.55 },
      { "name": "Net-Net Price", "value": 0, "cumulative": 3.55 }
    ]
  },
  {
    "accountId": "schoko-retail",
    "productId": "dark-compound",
    "layers": [
      { "name": "List Price", "value": 4.60, "cumulative": 4.60 },
      { "name": "Invoice Discount", "value": -0.55, "cumulative": 4.05 },
      { "name": "Net Invoice Price", "value": 0, "cumulative": 4.05 },
      { "name": "Rebate", "value": -0.23, "cumulative": 3.82 },
      { "name": "Payment Terms Adj.", "value": -0.12, "cumulative": 3.70 },
      { "name": "Net-Net Price", "value": 0, "cumulative": 3.70 }
    ]
  }
]
```

- **NOTE**: Baker Klaas rebate of `−0.77` represents 13.3% rebate rate — approximately "+5.1pts vs norm" as specified in the PRD.

---

### TASK 17 — Create data/pvm.json

**CREATE** `data/pvm.json` (Schoko data for Scenario 4):

```json
[
  {
    "accountId": "schoko-retail",
    "priorRevenue": 1892000,
    "volumeEffect": 42000,
    "priceEffect": -22000,
    "mixEffect": -19000,
    "currentRevenue": 1893000,
    "products": [
      {
        "productId": "dark-compound",
        "productName": "Dark Compound",
        "priorRevenue": 1254000,
        "volumeEffect": 88200,
        "priceEffect": -31500,
        "mixEffect": -12600,
        "currentRevenue": 1298100,
        "delta": 3.5
      },
      {
        "productId": "milk-couverture",
        "productName": "Milk Couverture",
        "priorRevenue": 638000,
        "volumeEffect": -46200,
        "priceEffect": 9500,
        "mixEffect": -6400,
        "currentRevenue": 594900,
        "delta": -6.8
      }
    ]
  },
  {
    "accountId": "baker-klaas",
    "priorRevenue": 15120,
    "volumeEffect": 3360,
    "priceEffect": -840,
    "mixEffect": -504,
    "currentRevenue": 17136,
    "products": [
      {
        "productId": "milk-couverture",
        "productName": "Milk Couverture",
        "priorRevenue": 15120,
        "volumeEffect": 3360,
        "priceEffect": -840,
        "mixEffect": -504,
        "currentRevenue": 17136,
        "delta": 13.3
      }
    ]
  }
]
```

---

### TASK 18 — Create data/win-loss.json

**CREATE** `data/win-loss.json`:

```json
[
  {
    "productId": "milk-couverture",
    "curve": [
      { "price": 3.80, "winRate": 92 },
      { "price": 4.00, "winRate": 88 },
      { "price": 4.20, "winRate": 82 },
      { "price": 4.40, "winRate": 74 },
      { "price": 4.60, "winRate": 65 },
      { "price": 4.80, "winRate": 54 },
      { "price": 4.90, "winRate": 47 },
      { "price": 5.00, "winRate": 38 },
      { "price": 5.10, "winRate": 28 },
      { "price": 5.20, "winRate": 18 },
      { "price": 5.40, "winRate": 9 },
      { "price": 5.60, "winRate": 4 }
    ],
    "cliffMin": 4.85,
    "cliffMax": 5.10,
    "optimalPrice": 4.60,
    "historicalQuotes": [
      { "price": 4.20, "won": true },
      { "price": 4.35, "won": true },
      { "price": 4.50, "won": true },
      { "price": 4.60, "won": true },
      { "price": 4.70, "won": false },
      { "price": 4.80, "won": true },
      { "price": 4.90, "won": false },
      { "price": 4.95, "won": false },
      { "price": 5.00, "won": false },
      { "price": 5.10, "won": false },
      { "price": 4.40, "won": true },
      { "price": 4.55, "won": true }
    ]
  },
  {
    "productId": "dark-compound",
    "curve": [
      { "price": 3.20, "winRate": 90 },
      { "price": 3.40, "winRate": 85 },
      { "price": 3.60, "winRate": 76 },
      { "price": 3.80, "winRate": 64 },
      { "price": 4.00, "winRate": 50 },
      { "price": 4.20, "winRate": 35 },
      { "price": 4.40, "winRate": 20 },
      { "price": 4.60, "winRate": 9 }
    ],
    "cliffMin": 3.90,
    "cliffMax": 4.20,
    "optimalPrice": 3.70,
    "historicalQuotes": [
      { "price": 3.50, "won": true },
      { "price": 3.70, "won": true },
      { "price": 3.80, "won": true },
      { "price": 4.00, "won": false },
      { "price": 4.10, "won": false },
      { "price": 3.60, "won": true }
    ]
  }
]
```

---

### TASK 19 — Create data/ease-of-realization.json

**CREATE** `data/ease-of-realization.json`:

```json
[
  {
    "accountId": "baker-klaas",
    "compositeScore": 6.2,
    "dimensions": [
      { "name": "Purchasing Power", "score": 5.5, "driverNote": "Mid-market, limited leverage" },
      { "name": "Formulation Cooperation", "score": 7.8, "driverNote": "Active NPD collaboration" },
      { "name": "OTIF Track Record", "score": 6.9, "driverNote": "94% OTIF last 12 months" },
      { "name": "Communication Sentiment", "score": 7.2, "driverNote": "Positive engagement, responsive" },
      { "name": "Relationship Stability", "score": 5.0, "driverNote": "3 year relationship, some churn risk" },
      { "name": "Volume Consistency", "score": 6.5, "driverNote": "±12% seasonal variation" },
      { "name": "RM Cost Impact", "score": 4.5, "driverNote": "Cocoa spot exposure, price-sensitive" }
    ]
  },
  {
    "accountId": "schoko-retail",
    "compositeScore": 7.4,
    "dimensions": [
      { "name": "Purchasing Power", "score": 9.2, "driverNote": "Top-tier enterprise, strong balance sheet" },
      { "name": "Formulation Cooperation", "score": 6.0, "driverNote": "Standard recipes, low NPD activity" },
      { "name": "OTIF Track Record", "score": 8.1, "driverNote": "98.2% OTIF last 12 months" },
      { "name": "Communication Sentiment", "score": 5.8, "driverNote": "Transactional relationship" },
      { "name": "Relationship Stability", "score": 8.5, "driverNote": "7 year preferred supplier agreement" },
      { "name": "Volume Consistency", "score": 9.0, "driverNote": "Steady 38k kg/month baseline" },
      { "name": "RM Cost Impact", "score": 5.5, "driverNote": "Hedged until Q3, then exposed" }
    ]
  },
  {
    "accountId": "confiserie-lambert",
    "compositeScore": 8.1,
    "dimensions": [
      { "name": "Purchasing Power", "score": 7.5, "driverNote": "Premium artisan, strong margins" },
      { "name": "Formulation Cooperation", "score": 9.2, "driverNote": "Co-develops exclusive recipes" },
      { "name": "OTIF Track Record", "score": 8.8, "driverNote": "99% OTIF" },
      { "name": "Communication Sentiment", "score": 8.5, "driverNote": "High engagement, NPS promoter" },
      { "name": "Relationship Stability", "score": 8.0, "driverNote": "5 year relationship, no churn signals" },
      { "name": "Volume Consistency", "score": 7.5, "driverNote": "Consistent seasonal peaks" },
      { "name": "RM Cost Impact", "score": 7.0, "driverNote": "Fixed-price contracts on key inputs" }
    ]
  }
]
```

---

### TASK 20 — Create data/quotes.json

**CREATE** `data/quotes.json` (Deal Pricing baseline data):

```json
[
  {
    "accountId": "baker-klaas",
    "productId": "milk-couverture",
    "currentPrice": 4.20,
    "volume": 320,
    "tierDiscount": 5.0,
    "dealDiscount": 0,
    "grossMarginPct": 18.3,
    "segmentMedianPrice": 4.85,
    "scenarios": {
      "grantDiscount": {
        "discountPct": -5,
        "netPrice": 3.99,
        "grossMarginPct": 14.1,
        "zone": "red",
        "verdict": "Below floor — margin critical, escalation required"
      },
      "holdFlat": {
        "discountPct": 0,
        "netPrice": 4.20,
        "grossMarginPct": 18.3,
        "zone": "amber",
        "verdict": "Holds position but leaves pricing gap vs segment"
      },
      "proposeUplift": {
        "discountPct": 4,
        "netPrice": 4.37,
        "grossMarginPct": 19.8,
        "zone": "amber",
        "verdict": "Recommended — defensible step toward fair pricing",
        "isRecommended": true
      }
    }
  },
  {
    "accountId": "schoko-retail",
    "productId": "dark-compound",
    "currentPrice": 3.70,
    "volume": 45000,
    "tierDiscount": 15.0,
    "dealDiscount": 5.0,
    "grossMarginPct": 19.6,
    "segmentMedianPrice": 3.90,
    "scenarios": {
      "grantDiscount": {
        "discountPct": -3,
        "netPrice": 3.59,
        "grossMarginPct": 16.3,
        "zone": "red",
        "verdict": "Below floor — loss-making at this volume"
      },
      "holdFlat": {
        "discountPct": 0,
        "netPrice": 3.70,
        "grossMarginPct": 19.6,
        "zone": "amber",
        "verdict": "Current position — marginally below target"
      },
      "proposeUplift": {
        "discountPct": 5,
        "netPrice": 3.89,
        "grossMarginPct": 22.1,
        "zone": "amber",
        "verdict": "Recommended — below median, defensible for volume",
        "isRecommended": true
      }
    }
  }
]
```

---

### TASK 21 — Create data/chat-scenarios.json

**CREATE** `data/chat-scenarios.json`:

```json
[
  {
    "id": "baker-klaas-segment-comparison",
    "matchPhrases": [
      "how does baker klaas compare",
      "baker klaas similar bakers",
      "cross-sell opportunities baker klaas",
      "baker klaas segment peers",
      "baker klaas benchmark"
    ],
    "accountId": "baker-klaas",
    "productId": "milk-couverture",
    "response": "Baker Klaas is in the bottom 20% of the Mid-Market Benelux segment at €4.20/kg vs a segment median of €4.85/kg. They do not currently purchase White Couverture or Cocoa Powder — both have a 73% co-purchase rate among similar bakers in the segment and carry above-average margins.",
    "visualType": "table",
    "dataKey": "baker-klaas-peer-comparison",
    "suggestedAction": "Propose a trial bundle of White Couverture + Cocoa Powder at an introductory rate alongside the renewal",
    "tableData": [
      { "account": "Baker Klaas", "price": "€4.20/kg", "segment": "Mid-Market Benelux", "percentile": "Bottom 20%", "whiteCouverture": "No", "cocoaPowder": "No" },
      { "account": "Segment Median", "price": "€4.85/kg", "segment": "Mid-Market Benelux", "percentile": "50th", "whiteCouverture": "73%", "cocoaPowder": "73%" },
      { "account": "Pâtisserie Moreau", "price": "€4.75/kg", "segment": "Mid-Market Benelux", "percentile": "42nd", "whiteCouverture": "Yes", "cocoaPowder": "Yes" },
      { "account": "Confiserie Lambert", "price": "€5.10/kg", "segment": "Mid-Market Benelux", "percentile": "91st", "whiteCouverture": "Yes", "cocoaPowder": "Yes" },
      { "account": "Choco Artisan BV", "price": "€4.90/kg", "segment": "Mid-Market Benelux", "percentile": "68th", "whiteCouverture": "Yes", "cocoaPowder": "No" }
    ]
  },
  {
    "id": "baker-klaas-waterfall",
    "matchPhrases": [
      "baker klaas rebate",
      "baker klaas margin leakage",
      "baker klaas price waterfall",
      "where is baker klaas margin going",
      "baker klaas discount breakdown"
    ],
    "accountId": "baker-klaas",
    "productId": "milk-couverture",
    "response": "Baker Klaas has a 9.2% flat rebate — €38,400 total annual leakage — which is 5.1 percentage points above the Mid-Market Benelux norm. Combined with the invoice discount, net-net realisation is €4.20/kg vs a list price of €5.80/kg. The rebate structure is the primary driver of margin erosion.",
    "visualType": "waterfall",
    "dataKey": "baker-klaas-milk-couverture",
    "suggestedAction": "Review rebate structure in next contract cycle — propose performance-linked rebate to cap total leakage",
    "tableData": null
  },
  {
    "id": "schoko-pvm-analysis",
    "matchPhrases": [
      "schoko revenue growth",
      "is schoko growing",
      "schoko pvm",
      "schoko price volume mix",
      "schoko revenue quality"
    ],
    "accountId": "schoko-retail",
    "productId": null,
    "response": "Schoko Retail Group shows a net revenue increase of just €1k on a base of €1.89M — masking significant headwinds. Volume added €42k but price drag cost €22k and mix shift cost €19k. Growth looks flat but the quality is deteriorating: the mix is shifting toward lower-margin Dark Compound and away from Milk Couverture.",
    "visualType": "pvm",
    "dataKey": "schoko-retail",
    "suggestedAction": "Present the mix shift data to commercial director — initiate Milk Couverture re-engagement campaign",
    "tableData": null
  },
  {
    "id": "why-does-schoko-pay-less",
    "matchPhrases": [
      "why does schoko pay less",
      "schoko vs baker klaas price",
      "why different prices same product",
      "explain schoko pricing",
      "price difference schoko baker klaas"
    ],
    "accountId": null,
    "productId": "milk-couverture",
    "response": "Schoko Retail Group pays €3.55/kg vs Baker Klaas at €4.20/kg — a €0.65/kg difference on Milk Couverture. This is driven by three factors: (1) Volume tier: Schoko buys 38,000 kg/month vs Baker Klaas at 320 kg/month, triggering an Enterprise volume discount; (2) Contract structure: Schoko has a 3-year preferred supplier agreement with committed volume guarantees; (3) Segment floor: Enterprise Key Accounts have a lower floor (€3.40/kg) reflecting genuine cost-to-serve advantages at scale.",
    "visualType": "scatter",
    "dataKey": "milk-couverture",
    "suggestedAction": null,
    "tableData": null
  },
  {
    "id": "generic-fallback",
    "matchPhrases": [],
    "accountId": null,
    "productId": null,
    "response": "I can help you explore pricing data for your accounts and products. Try asking about a specific account's segment position, margin waterfall, or cross-sell opportunities — for example: 'How does Baker Klaas compare to similar bakers?' or 'Show me Schoko's revenue breakdown.'",
    "visualType": null,
    "dataKey": null,
    "suggestedAction": null,
    "tableData": null
  }
]
```

---

### TASK 22 — Scaffold all seven page routes

**CREATE** `src/app/chat/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function ChatPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Chat with Your Data — coming in Phase 2
      </div>
    </div>
  )
}
```

**CREATE** `src/app/segmentation/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function SegmentationPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Segmentation — coming in Phase 2
      </div>
    </div>
  )
}
```

**CREATE** `src/app/deal-pricing/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function DealPricingPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Deal Pricing — coming in Phase 2
      </div>
    </div>
  )
}
```

**CREATE** `src/app/win-loss/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function WinLossPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Win / Loss Price Intelligence — coming in Phase 3
      </div>
    </div>
  )
}
```

**CREATE** `src/app/ease-of-realization/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function EoRPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Ease of Realization — coming in Phase 3
      </div>
    </div>
  )
}
```

**CREATE** `src/app/waterfall/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function WaterfallPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Price Waterfall — coming in Phase 3
      </div>
    </div>
  )
}
```

**CREATE** `src/app/pvm/page.tsx`:

```tsx
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function PVMPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        PVM Bridge — coming in Phase 3
      </div>
    </div>
  )
}
```

- **NOTE**: Pages are **Server Components** — they import from `@/lib/data` synchronously and pass typed arrays to `<FilterBar>` as props. FilterBar is a Client Component.
- **VALIDATE**: All seven routes render without errors. Sidebar navigation highlights correctly.

---

### TASK 23 — Create .env.local

**CREATE** `.env.local`:

```bash
# OpenAI API key — required for /api/chat and /api/explain routes (Phase 3)
OPENAI_API_KEY=your_key_here
```

- **VALIDATE**: `.gitignore` includes `.env.local` (create-next-app adds this by default).

---

### TASK 24 — Create vercel.json

**CREATE** `vercel.json`:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

- **VALIDATE**: `vercel --prod` deploys without error (optional at Phase 1).

---

### TASK 25 — Update next.config.ts

**REPLACE** `next.config.ts` to allow image domains and confirm strict TypeScript:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,  // Fine for demo — avoids Vercel image optimization limits
  },
}

export default nextConfig
```

- **VALIDATE**: `npm run build` succeeds.

---

## TESTING STRATEGY

Phase 1 has no automated tests — it is a scaffold/data task. Validation is manual.

### Manual Validation Checklist

- [ ] `npm run dev` starts without errors
- [ ] `/` redirects to `/chat`
- [ ] All seven sidebar links navigate to their correct page
- [ ] Each page shows FilterBar with Account and Product dropdowns
- [ ] Selecting "Baker Klaas" in any FilterBar updates the context pill across all screens
- [ ] Clearing the context pill resets both dropdowns to "All accounts" / "All products"
- [ ] Default load shows "Baker Klaas · Milk Couverture" pre-selected
- [ ] Sidebar shows PwC logo and "Commercial Intelligence" footer text
- [ ] TopBar shows correct screen title for each route
- [ ] Avatar "S" (Sarah) appears in TopBar
- [ ] `npm run build` completes with zero TypeScript errors

---

## VALIDATION COMMANDS

### Level 1: TypeScript & Lint

```bash
npm run build
npm run lint
```

### Level 2: Dev Server Smoke Test

```bash
npm run dev
# Open http://localhost:3000 — verify redirect to /chat
# Navigate to each of the 7 routes via sidebar
# Select Baker Klaas in FilterBar — verify pill appears
```

### Level 3: Data Integrity Check

```bash
node -e "
const accounts = require('./data/accounts.json');
const products = require('./data/products.json');
const seg = require('./data/segmentation.json');
console.log('Accounts:', accounts.length, '(expected 10)');
console.log('Products:', products.length, '(expected 6)');
console.log('Segmentation points:', seg.length, '(expected 12)');
const bk = accounts.find(a => a.id === 'baker-klaas');
console.log('Baker Klaas price:', bk.price, '(expected 4.20)');
console.log('Baker Klaas floor:', bk.floor, '(expected 4.05)');
"
```

---

## ACCEPTANCE CRITERIA

- [ ] `npm run build` completes with zero errors and zero TypeScript warnings
- [ ] `npm run lint` returns zero errors
- [ ] All seven routes are navigable from sidebar
- [ ] FilterBar renders on every screen with Account + Product dropdowns populated from JSON
- [ ] Selecting an account/product updates AppContext and shows the active context pill
- [ ] Default state is Baker Klaas + Milk Couverture pre-selected (Scenario 1 ready)
- [ ] Sidebar is dark PwC-branded with orange active state; no scenario labels visible
- [ ] TopBar shows correct screen title and "S" avatar
- [ ] Baker Klaas JSON data matches Scenario 1 numbers: price €4.20, floor €4.05, target €4.85
- [ ] `data/` contains all nine JSON files with no empty arrays
- [ ] Brand assets are in `public/` and render in Sidebar
- [ ] `.env.local` exists with `OPENAI_API_KEY` placeholder
- [ ] `vercel.json` is present

---

## COMPLETION CHECKLIST

- [ ] Task 1: Next.js project bootstrapped
- [ ] Task 2: Dependencies installed
- [ ] Task 3: Brand assets copied to public/
- [ ] Task 4: Tailwind config with brand tokens
- [ ] Task 5: globals.css with zone utilities
- [ ] Task 6: AppContext with default Baker Klaas state
- [ ] Task 7: Sidebar with PwC brand and navigation
- [ ] Task 8: TopBar with screen title and avatar
- [ ] Task 9: Root layout wrapping AppProvider + Sidebar + TopBar
- [ ] Task 10: Root page redirects to /chat
- [ ] Task 11: FilterBar with dropdowns, pill, and segment badge
- [ ] Task 12: data.ts with types and import helpers
- [ ] Task 13: accounts.json (10 accounts)
- [ ] Task 14: products.json (6 SKUs)
- [ ] Task 15: segmentation.json (12 data points)
- [ ] Task 16: waterfall.json
- [ ] Task 17: pvm.json
- [ ] Task 18: win-loss.json
- [ ] Task 19: ease-of-realization.json
- [ ] Task 20: quotes.json
- [ ] Task 21: chat-scenarios.json
- [ ] Task 22: All 7 route pages scaffolded
- [ ] Task 23: .env.local created
- [ ] Task 24: vercel.json created
- [ ] Task 25: next.config.ts updated
- [ ] All validation commands pass

---

## NOTES

**Bootstrap command preference:** Use `--src-dir` flag so the directory structure exactly matches the PRD. If create-next-app conflicts with existing `.git` or `.claude` files, accept the prompt to continue.

**Data file location:** JSON files live in `data/` at project root (not inside `src/`). This matches the PRD spec and keeps data editable without touching the source tree.

**FilterBar is a Client Component, pages are Server Components.** Pages import JSON directly (synchronous, zero latency) and pass typed arrays to FilterBar as props. Do NOT `'use client'` on page files — this would prevent server-side data access.

**Colour system:** All UI colours must use the Tailwind tokens defined in `tailwind.config.ts`. Never hardcode hex values in component files. The palette.css in `brand_assets/` is the source of truth; `tailwind.config.ts` maps the relevant tokens.

**No charts, no AI, no API routes in Phase 1.** Any chart or AI work belongs in Phase 2 or Phase 3. Keep Phase 1 strictly to shell, data, and navigation.

**Confidence Score: 9/10** — This is a greenfield Next.js 14 project with well-understood patterns. All data is self-contained JSON. The only risk is the `create-next-app` bootstrap conflicting with existing git/claude files — accepting the overwrite prompt resolves this.
