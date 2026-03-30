# Equazion — Product Requirements Document

**Version:** 1.1
**Date:** 2026-03-16
**Owner:** PwC
**Status:** Approved for Implementation

---

## 1. Executive Summary

Equazion is a commercial pricing intelligence demo tool built by PwC for ChocoMaker, a fictional chocolate manufacturing company. The application showcases seven integrated pricing capabilities — from conversational data exploration to real-time quoting to revenue bridge analysis — in a single, cohesive product experience. All data is illustrative and all scenarios are choreographed to tell a specific commercial story to a live audience.

The tool is designed to be presented by a PwC consultant to an audience of commercial directors, pricing managers, and sales representatives. The UI must feel like a production-grade pricing system — credible, polished, and data-rich — while remaining fully controlled through pre-scripted scenario flows under the hood. The demo experience lives in the presenter's narration; the UI must never betray the scripted nature of the content.

**Primary Demo Scenario:** Scenario 1 — Baker Klaas Asks for More Discount. This is the core story the MVP must tell end-to-end without hesitation. Sarah, a sales rep, uses Equazion live on a call with Baker Klaas to hold the price, propose a smart uplift, and open a cross-sell conversation — all in under two minutes, with no spreadsheet and no manager.

**MVP Goal:** Deliver a fully navigable Next.js web application where Scenario 1 runs flawlessly across Segmentation, Deal Pricing, and Chat. All remaining screens are fully populated and navigable as supporting context. The tool is deployable to Vercel and ready for live client demonstrations.

---

## 2. Mission

**Mission Statement:** Equazion demonstrates that pricing decisions don't have to be gut-feel — they can be grounded in data, guided by AI, and governed by clear commercial logic, all from a single interface.

### Core Principles

1. **Story over feature** — Every design decision serves the demo narrative. Scenario 1 is the north star; every screen should feel like it belongs to the same story.
2. **Credibility through data density** — Tables, charts, and metrics must feel populated and real. Sparse screens break immersion.
3. **Invisible choreography** — Scenario flows are invisible to the UI. No step counters, no scenario labels, no "demo mode" affordances.
4. **Context continuity** — The active account and product are always visible and always in sync. Changing them in any filter pane updates every visual on the screen instantly.
5. **AI as co-pilot, not gimmick** — The "Explain what I see" and Chat features surface genuine insight language, not generic filler text.

---

## 3. Target Users

### Primary Personas

| Persona | Role | Demo Context |
|---|---|---|
| Sarah (Sales Rep) | Account manager negotiating a deal live on a call | Primary actor in Scenario 1 — uses Segmentation, Deal Pricing, Chat |
| Pricing Manager | Reviews account profitability and rebate structures | Supporting viewer — interested in Waterfall and Segmentation |
| Commercial Director | Evaluates portfolio performance and growth quality | Supporting viewer — interested in PVM and Chat queries |
| New Sales Rep | Onboarding, learning why pricing differs by account | Asks "why" questions in Chat |

### Audience (Demo)
- **Live presenter:** PwC consultant playing the role of Sarah, narrating the scenario
- **Observers:** Mix of commercial directors, pricing managers, and sales reps at the client
- **Technical comfort:** Medium — comfortable with dashboards and CRM tools; not developers

### Key Needs
- Understand whether an account is priced correctly relative to segment
- Know whether granting a discount is safe or margin-eroding
- Model alternative pricing options (give discount / hold flat / uplift) side by side
- Quickly surface cross-sell opportunities attached to an account
- Understand if revenue growth is real or volume-driven

---

## 4. MVP Scope

### Core Functionality
- ✅ Chat with Your Data — conversational interface with dynamic right-panel visuals
- ✅ Segmentation screen — scatter plot with floor/target curves, filter pane, comparison mode, prospect input
- ✅ Deal Pricing screen — live quoting with tier discount, escalation workflow, margin bridge, three-scenario modelling
- ✅ Win/Loss Price Intelligence — win probability curve, standalone screen
- ✅ Ease of Realization — composite score with dimension breakdown, standalone screen
- ✅ Price Waterfall — full price decomposition waterfall
- ✅ PVM Bridge — price/volume/mix revenue bridge with per-product table
- ✅ Global "Explain what I see" — AI slide-over on every screen
- ✅ Global filter pane — account + product selectors on every screen, visuals update reactively
- ✅ Cross-screen context (active account/product carried via AppContext, synced to filter pane)
- ✅ Sidebar navigation — dark, PwC-branded, no scenario labels
- ✅ 8–10 mock accounts, 5–6 mock SKUs in all data tables
- ✅ Animated prospect dot on Segmentation curve
- ✅ Segmentation comparison mode (split panel toggle)
- ✅ Deal Pricing escalation simulation ("request sent to manager" state)
- ✅ Saveable conversations (localStorage)
- ✅ Pin to shared library (visual affordance)

### Technical
- ✅ Next.js 14+ (App Router)
- ✅ Recharts for all data visualisations
- ✅ OpenAI gpt-4o API integration (semantic question matching)
- ✅ Static JSON data files (easily editable for demo tweaks)
- ✅ PwC/Equazion brand identity (palette, logos)
- ✅ `.env.local` template for API key
- ✅ Vercel deployment configuration

### Out of Scope
- ❌ Authentication / login screen
- ❌ Real database or backend persistence
- ❌ Multi-user / multi-session state
- ❌ Mobile or tablet responsive layout
- ❌ Dark mode
- ❌ Export to PDF / Excel
- ❌ Real-time data feeds or integrations
- ❌ User management / roles
- ❌ Multi-language support
- ❌ Accessibility compliance (WCAG)

---

## 5. Primary Demo Scenario

### Scenario 1 — Baker Klaas Asks for More Discount
*Addresses: Q1 (speed) · Q4 (reduce unnecessary discounting)*

Sarah is on the phone with Baker Klaas — a mid-market bakery renewing their annual contract on Milk Couverture. The buyer wants an extra 5% off. Sarah has Equazion open on her screen.

**Step 1 — Segmentation: See where Baker Klaas stands**
Sarah selects Baker Klaas + Milk Couverture in the filter pane. His dot appears visibly below the segment floor on the scatter plot. The AI tells her instantly: Baker Klaas is already 8% below the Mid-Market Benelux floor on this SKU. Granting more discount would widen the gap further — a 12% uplift would be needed just to return to fair pricing. The recommendation: staged correction over two to three renewal cycles.

**Step 2 — Deal Pricing: Model three scenarios side by side**
Sarah opens Deal Pricing with Baker Klaas + Milk Couverture pre-loaded from context. She models three options:
- Give the 5% discount → red zone, margin 14.1%, escalation fires
- Hold flat (0%) → amber zone, margin 18.3%, still below segment target
- Propose +4% uplift → still amber but moves toward in-band, margin 19.8%

The tool shows that even at +4%, Baker Klaas is still well below the segment median of €4.85/kg. The uplift is defensible. It is the sweet spot.

**Step 3 — Chat: Get competitive context and cross-sell intelligence**
Sarah asks the AI agent: *"How does Baker Klaas compare to similar bakers, and are there any cross-sell opportunities?"*

Within seconds she learns:
- Baker Klaas is in the bottom 15% of the Mid-Market Benelux segment at €4.20/kg vs a median of €4.85/kg
- Baker Klaas does not currently buy White Couverture or Cocoa Powder
- 73% of similar bakers in the segment co-purchase these two SKUs
- Both are high-attach, high-margin products

**The outcome:**
Sarah goes back to the buyer with confidence:

> *"You've actually been on a very favourable rate — well below similar bakeries in your segment. I've kept the adjustment to just 4%, which still keeps you competitive. And I'd love to set you up with a trial on White Couverture and Cocoa Powder at an introductory rate — most bakers your size are bundling these and seeing real value."*

**The result:** A 9 percentage point swing from where the deal was heading. A cross-sell conversation opened on two new SKUs. Baker Klaas stays — because the uplift was justified, gradual, and came with added value. No spreadsheet, no waiting for a manager to call back. Just the right data, at the right moment, in the hands of the rep who needs it.

---

### Secondary Scenarios (Supporting Data — Not Primary Demo Focus)

| # | Title | Primary Screens | Key Data Moment |
|---|---|---|---|
| 2 | Silent margin erosion on Baker Klaas | Waterfall → Chat | 9.2% flat rebate; €38,400 total leakage |
| 3 | Schoko volume deal negotiation | Segmentation → Deal Pricing → Chat | 45k kg at €3.70; €166,500 GM |
| 4 | Growing or getting squeezed? (Schoko PVM) | PVM → Chat | +€7k net, -€22k price, -€19k mix |
| 5 | Why does Schoko pay less? | Segmentation (comparison) → Chat | Baker Klaas 18.3% vs Schoko 26.8% net-net |

All secondary scenario data is present in the JSON files and all screens are fully navigable. They are available if the presenter chooses to extend the demo, but Scenario 1 is the rehearsed primary flow.

---

## 6. User Stories

### Primary Story — Sarah holds price and opens cross-sell (Scenario 1)
> **As Sarah, a sales rep on a live call,** I want to instantly see where Baker Klaas sits relative to the segment floor, model three pricing options, and get AI-surfaced cross-sell intelligence, **so that** I can respond to a discount request with data, propose a defensible uplift, and expand the deal — all without putting the customer on hold.

*Concrete flow:* Filter pane set to Baker Klaas + Milk Couverture → Segmentation shows red dot 8% below floor → Deal Pricing shows three scenario comparison → Chat answers "How does Baker Klaas compare?" → Sarah quotes +4% with confidence.

---

### Supporting Stories

**Story 2 — Rep assesses deal attractiveness holistically**
> **As a sales rep preparing a quote,** I want to see both the win probability and ease of realization score alongside the price, **so that** I understand commercial attractiveness and operational risk before submitting.

**Story 3 — Manager spots margin leakage**
> **As a pricing manager,** I want to see a full price waterfall decomposition for any account, **so that** I can identify which discount layer is eroding margin beyond the segment norm.

**Story 4 — Director diagnoses revenue quality**
> **As a commercial director,** I want to decompose revenue growth into volume, price, and mix effects, **so that** I can tell whether growth is genuine margin expansion or volume masking erosion.

**Story 5 — New rep understands pricing logic**
> **As a new sales rep,** I want to understand why two customers pay different prices for the same product, **so that** I can explain it credibly in customer conversations.

**Story 6 — Presenter explores data conversationally**
> **As a demo presenter,** I want to pose natural language questions about accounts and pricing, **so that** the audience sees AI-driven insight rather than a scripted walkthrough.

---

## 7. Core Architecture & Patterns

### Architecture Overview
- **Rendering:** Next.js App Router with React Server Components where possible; client components for all interactive/chart elements
- **Data layer:** Static JSON files in `/data/` — no ORM, no database. All screens import JSON directly or via a thin data-access utility.
- **State management:** React Context (`AppContext`) for cross-screen active account/product/volume state. localStorage for saved conversations. No Redux or Zustand needed.
- **Filter pane pattern:** Every screen mounts the same `<FilterBar>` component at the top. It reads and writes to `AppContext`. Changing account or product in any `FilterBar` triggers a re-render of all charts on that screen using the new context values.
- **AI layer:** Two Next.js API routes (`/api/chat`, `/api/explain`) that call OpenAI gpt-4o. Responses are structured JSON that the frontend routes to the correct visual component.

### Directory Structure
```
FoS_Demo/
├── brand_assets/                  # Logos, palette.css (source of truth)
├── public/
│   ├── equazion-logo.png
│   ├── pwc-logo-icon.png
│   └── pwc-logo-white.svg
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
│   │   ├── layout.tsx             # Root layout: sidebar + topbar shell
│   │   ├── page.tsx               # Redirect → /chat
│   │   ├── chat/page.tsx
│   │   ├── segmentation/page.tsx
│   │   ├── deal-pricing/page.tsx
│   │   ├── win-loss/page.tsx
│   │   ├── ease-of-realization/page.tsx
│   │   ├── waterfall/page.tsx
│   │   ├── pvm/page.tsx
│   │   └── api/
│   │       ├── chat/route.ts
│   │       └── explain/route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   ├── shared/
│   │   │   ├── FilterBar.tsx      # Account + product selectors — used on every screen
│   │   │   ├── ExplainButton.tsx
│   │   │   └── ExplainPanel.tsx
│   │   ├── charts/
│   │   │   ├── SegmentationScatter.tsx
│   │   │   ├── WaterfallChart.tsx
│   │   │   ├── PVMBridge.tsx
│   │   │   ├── WinProbabilityCurve.tsx
│   │   │   └── EoRDimensions.tsx
│   │   ├── deal-pricing/
│   │   │   ├── PriceBand.tsx
│   │   │   ├── MarginBridge.tsx
│   │   │   ├── EscalationBanner.tsx
│   │   │   ├── ScenarioComparison.tsx  # Three-scenario modelling panel
│   │   │   ├── WinProbSignal.tsx
│   │   │   └── EoRSignal.tsx
│   │   ├── chat/
│   │   │   ├── ConversationThread.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── DynamicRightPanel.tsx
│   │   │   └── SavedConversations.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── lib/
│   │   └── data.ts                # JSON import helpers + filter utilities
│   └── styles/
│       └── globals.css            # PwC palette vars + Tailwind base
├── .env.local                     # OPENAI_API_KEY placeholder
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Key Design Patterns

**Filter Pane / AppContext sync:**
Every screen's data-driven components receive `accountId` and `productId` as props derived from `AppContext`. When `FilterBar` updates context, all child components re-render with filtered data. No page reload, no routing — instant visual update.

```ts
// AppContext shape
{
  activeAccountId: string | null,
  activeProductId: string | null,
  activeVolume: number | null,
  setAccount: (id: string) => void,
  setProduct: (id: string) => void,
  setVolume: (kg: number) => void,
}
```

**Scenario data isolation:** Each JSON file contains data for all accounts/products. The frontend filters by `accountId` / `productId` from AppContext. No scenario-specific code paths — the data tells the story.

**Visual routing in Chat:** The `/api/chat` response includes a `visualType` enum (`scatter | waterfall | pvm | winLoss | eor | table`) and a `dataKey` pointing to a pre-computed data slice in `chat-scenarios.json`. `DynamicRightPanel` switches on `visualType` to render the correct chart.

**Escalation state machine:** Deal Pricing tracks discount level as a derived value. Thresholds are defined in `products.json` per SKU. State: `none → rep → manager → director`.

---

## 8. Feature Specifications

### 8.0 Global Filter Bar (shared component — all screens)
Every screen renders `<FilterBar>` directly below the page title.

- **Account selector:** Dropdown populated from `accounts.json`. Shows account name + segment badge. Selecting updates `AppContext.activeAccountId`. All charts on the page immediately re-render filtered to the new account.
- **Product selector:** Dropdown populated from `products.json`, optionally filtered to products with data for the selected account. Selecting updates `AppContext.activeProductId`.
- **Active context pill:** Shows the currently selected account + product as a chip (e.g., "Baker Klaas · Milk Couverture"). Chip has an × to clear.
- **Sync with Chat:** When Chat sets context (via an AI response that identifies an account), the `FilterBar` on all other screens reflects the new selection immediately.
- **Placement:** Consistent top-of-page position on every screen. Same component, same visual treatment.

---

### 8.1 Chat with Your Data
- **Left panel (40%):** Conversation thread with user bubbles and AI response bubbles. Each AI bubble leads with an insight sentence, shows 2–3 supporting data points, and closes with a recommended action. Save conversation button (localStorage). Pinned visuals gallery (visual affordance only).
- **Right panel (60%):** Renders one of: SegmentationScatter, WaterfallChart, PVMBridge, WinProbabilityCurve, EoRDimensions, or a DataTable. Updates on each new AI response with a smooth transition.
- **Input:** Full-width text input at bottom of left panel. Submit on Enter or button click.
- **Context chip:** Shows active account name if set (e.g., "Baker Klaas") above the input, derived from AppContext. Clicking clears context.
- **Saved conversations:** Slide-out drawer listing saved conversation titles (localStorage). Clicking loads the thread.
- **Scenario 1 key questions pre-scripted:**
  - *"How does Baker Klaas compare to similar bakers, and are there any cross-sell opportunities?"* → Responds with segment percentile, segment median price, and two high-attach SKUs (White Couverture + Cocoa Powder at 73% co-purchase rate). Visual: DataTable of similar accounts.

---

### 8.2 Segmentation
- **Filter bar:** `<FilterBar>` at top. Changing account highlights that account's dot and re-centres the chart. Changing product re-renders the entire scatter for the new product dimension.
- **Main view:** Recharts ScatterChart. X-axis: volume (kg/month, log scale). Y-axis: price (€/kg). Two reference lines: floor curve (red dashed) and target curve (green dashed). Dots coloured by zone: green (above target), amber (in-band), red (below floor).
- **Baker Klaas state (Scenario 1):** Red dot, prominently labelled, visually isolated below the floor line. Tooltip shows: "8% below floor · €4.20/kg vs floor €4.05/kg".
- **Comparison mode:** Toggle button switches to two-panel layout. Each panel has its own account/segment selector. Used for Scenario 5 (Baker Klaas vs Schoko side-by-side).
- **New prospect input:** Volume input field at top. On submit, an amber ghost dot animates onto the chart at the correct floor-curve position, with a label showing the implied floor price.
- **Account detail tooltip:** Hover over any dot shows account name, price/kg, volume, segment, % vs floor.

---

### 8.3 Deal Pricing
- **Filter bar:** `<FilterBar>` at top. Changing account or product resets the price calculation stack to the new combination's data.
- **Customer + product selectors:** Also mirrored inline in the quote header (redundant with filter bar for visual clarity in this screen).
- **Price calculation stack:**
  - List price (read-only, from products.json)
  - Tier discount (auto-applied based on volume, read-only with tooltip explanation)
  - Volume/deal discount (rep-editable slider 0–20% + numeric input)
  - Net price (live computed)
- **Three-scenario comparison panel (Scenario 1 feature):**
  A panel below the main price stack showing three columns, each computing the outcome of a different discount choice:
  - Column A: Grant 5% discount → red zone, GM% shown, escalation indicator
  - Column B: Hold flat (0% deal discount) → current zone + GM%
  - Column C: Propose +4% uplift → zone, GM%, label "Recommended"
  Each column shows: net price, GM%, zone colour, and a one-line verdict. Columns update live as the rep adjusts the main discount slider.
- **Price band visual:** Horizontal bar showing zones (red: below floor, amber: in-band, green: above target). Current price shown as a live indicator.
- **Margin bridge:** Mini waterfall showing list → tier → deal → net-net with GM% at each stage. Updates live.
- **Escalation system:**
  - 0–5% deal discount: no escalation (green state)
  - 5–10%: Rep escalation amber — banner: "Approval required: this discount requires manager sign-off"
  - 10–15%: Manager escalation orange — simulates "Request sent to manager" state after 2s
  - 15%+: Director escalation red
  - Deal justification textarea activates at first escalation threshold
- **Win Probability signal:** Compact card showing % with mini sparkline. "See full analysis →" navigates to Win/Loss screen with context.
- **EoR signal:** Compact score badge with top driver callout. "See detail →" navigates to EoR screen.

---

### 8.4 Win/Loss Price Intelligence
- **Filter bar:** `<FilterBar>` at top. Changing account or product reloads the win probability curve for that combination.
- **Win probability curve:** Recharts LineChart. X-axis: price (€/kg). Y-axis: win rate (%). Shaded cliff zone. Current quote price as vertical reference line.
- **Historical quote scatter:** Won quotes (green) and lost quotes (red) overlaid.
- **Insight panel:** Right sidebar with: optimal price point, cliff zone range, competitor sensitivity note, historical win rate at current price.

---

### 8.5 Ease of Realization
- **Filter bar:** `<FilterBar>` at top. Changing account reloads dimension scores for that account.
- **Composite score:** Large prominent display (e.g., "6.2 / 10") with colour coding and label (Low / Medium / High ease).
- **7 dimension bars:** Purchasing Power, Formulation Cooperation, OTIF Track Record, Communication Sentiment, Relationship Stability, Volume Consistency, RM Cost Impact. Each with score + driver note.
- **Account comparison table:** All accounts listed with composite score and top risk flag. Sortable.

---

### 8.6 Price Waterfall
- **Filter bar:** `<FilterBar>` at top. Changing account rerenders the waterfall for that account's price layers.
- **Full waterfall:** List Price → Invoice Discount → Net Invoice Price → Rebate → Payment Terms Adjustment → Net-Net Price.
- **Segment average overlay:** Horizontal tick on each bar showing segment norm.
- **Baker Klaas highlight:** Rebate bar emphasised — orange border, tooltip noting "+5.1pts vs norm".
- **Summary stats:** Net-Net Margin %, Segment Target %, variance.

---

### 8.7 PVM Bridge
- **Filter bar:** `<FilterBar>` at top. Changing account rerenders the bridge for that account.
- **Revenue bridge:** Signed bar chart. Sequence: Prior Period → Volume Effect → Price Effect → Mix Effect → Current Period. Positive green, negative red.
- **Period selector:** Dropdown for comparison period.
- **Per-product table:** Product, Prior Revenue, Volume Effect, Price Effect, Mix Effect, Current Revenue, Δ%.
- **AI warning banner:** Fires when price effect and mix effect are both negative simultaneously.

---

### 8.8 Global "Explain what I see"
- **Trigger:** Floating button bottom-right of every screen. Sparkle/AI icon + "Explain" label.
- **Behaviour:** Sends current screen ID + serialised key metrics (including active account/product from AppContext) to `/api/explain`. Loading spinner during call.
- **Output:** Slide-over panel from the right. Three sections: "What I'm seeing", "Why it matters", "Recommended actions". Panel dismissible; chart stays visible behind it.

---

## 9. Technology Stack

### Core
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| Charts | Recharts | 2+ |
| AI | OpenAI SDK | 4+ |
| Deployment | Vercel | Latest |

### Dependencies
```json
{
  "next": "^14",
  "react": "^18",
  "react-dom": "^18",
  "recharts": "^2",
  "openai": "^4",
  "tailwindcss": "^3",
  "typescript": "^5",
  "clsx": "^2",
  "lucide-react": "latest"
}
```

### Data
- All mock data in `/data/*.json` — no database, no ORM
- Data accessed via import helpers in `src/lib/data.ts`
- Accounts and products defined in JSON — adding/editing an account requires only a JSON edit

### Environment Variables
```bash
# .env.local
OPENAI_API_KEY=your_key_here
```

---

## 10. Security & Configuration

### Configuration
- API key stored in `.env.local`, never committed to git
- `.gitignore` must include `.env.local`
- All OpenAI calls are server-side only (API routes) — key never exposed to client

### Security Scope
- ✅ Server-side API key handling
- ✅ Input sanitisation on chat input before passing to OpenAI
- ❌ Authentication (out of scope for demo)
- ❌ Rate limiting (out of scope for demo)
- ❌ CSRF protection (out of scope for demo)

### Deployment
- Vercel project with `OPENAI_API_KEY` set as environment variable in Vercel dashboard
- Static JSON data bundled with build

---

## 11. API Specification

### POST `/api/chat`
Matches a free-text question to a pre-scripted scenario response using gpt-4o.

**Request:**
```json
{
  "question": "How does Baker Klaas compare to similar bakers, and are there any cross-sell opportunities?",
  "activeAccountId": "baker-klaas",
  "activeProductId": "milk-couverture"
}
```

**Response:**
```json
{
  "scenarioId": "baker-klaas-segment-comparison",
  "response": "Baker Klaas is in the bottom 15% of the Mid-Market Benelux segment at €4.20/kg vs a segment median of €4.85/kg. They do not currently purchase White Couverture or Cocoa Powder — both have a 73% co-purchase rate among similar bakers in the segment and carry above-average margins.",
  "visualType": "table",
  "dataKey": "baker-klaas-peer-comparison",
  "suggestedAction": "Propose a trial bundle of White Couverture + Cocoa Powder at an introductory rate alongside the renewal"
}
```

**System prompt pattern:**
- Embeds full list of scenario IDs with descriptions
- Instructs gpt-4o to return the best matching `scenarioId`
- Falls back to a graceful generic response if no match (confidence < threshold)

---

### POST `/api/explain`
Generates an AI explanation of the current screen state.

**Request:**
```json
{
  "screen": "segmentation",
  "accountId": "baker-klaas",
  "productId": "milk-couverture",
  "keyMetrics": {
    "currentPrice": 4.20,
    "floorPrice": 4.05,
    "targetPrice": 4.85,
    "segmentMedian": 4.85,
    "percentVsFloor": -8,
    "upliftToTarget": 12
  }
}
```

**Response:**
```json
{
  "whatISee": "Baker Klaas is priced 8% below the Mid-Market Benelux floor on Milk Couverture at €4.20/kg. The segment floor is €4.05/kg and the target is €4.85/kg — Baker Klaas sits 15% below the segment median.",
  "whyItMatters": "Any further discount deepens an already non-compliant position. Granting 5% would move Baker Klaas to €3.99/kg — below floor — and set a precedent for next cycle.",
  "recommendedActions": [
    "Propose a +4% staged uplift: €4.37/kg — still below median, defensible as gradual correction",
    "Frame uplift as a return toward fair pricing, not a price increase",
    "Open cross-sell on White Couverture and Cocoa Powder to add value to the conversation"
  ]
}
```

---

## 12. Success Criteria

### MVP Definition of Done
Scenario 1 runs end-to-end without hesitation: Sarah selects Baker Klaas + Milk Couverture in the filter pane, the Segmentation screen shows his red dot below floor, Deal Pricing shows the three-scenario comparison with escalation on the discount option, and Chat answers the peer comparison question with cross-sell intelligence. All other screens are fully populated and navigable. Accounts and products are defined in JSON files and can be switched on the fly via the filter pane.

### Functional Requirements
- ✅ All seven screens render with populated data
- ✅ Sidebar navigation works between all screens
- ✅ Global filter bar present on every screen — account + product selectors update all visuals reactively
- ✅ AppContext carries active account/product across all screens and stays in sync with filter bar
- ✅ Chat accepts free-text, calls OpenAI, and renders the correct visual in the right panel
- ✅ Chat sets AppContext when an account is identified in the response
- ✅ Deal Pricing three-scenario comparison panel works for Scenario 1
- ✅ Deal Pricing escalation fires at correct thresholds and simulates approval workflow
- ✅ Segmentation shows Baker Klaas red dot 8% below floor by default
- ✅ Segmentation comparison mode splits into two panels
- ✅ Prospect dot animates onto the segmentation curve
- ✅ "Explain what I see" works on every screen
- ✅ Conversations save and reload from localStorage
- ✅ All charts render without errors on a 1440px desktop viewport
- ✅ PwC/Equazion branding consistent throughout

### Quality Indicators
- Charts load in < 500ms (all data is local JSON)
- AI responses return in < 5s on a standard connection
- Switching account/product in filter bar updates visuals in < 100ms (no API call required)
- No console errors during a full Scenario 1 walkthrough
- Colour coding consistent across all screens (red/amber/green system)

### UX Goals
- Sarah can complete Scenario 1 in under 2 minutes from landing on Chat
- A cold viewer assumes the tool is connected to a live ChocoMaker data system
- The filter bar always shows what's selected — no ambiguity about which account/product is in view
- The "Explain what I see" responses feel like a knowledgeable analyst, not a chatbot

---

## 13. Implementation Phases

### Phase 1 — Foundation (Shell + Data)
**Goal:** Working Next.js app with navigation, brand, filter bar wired to AppContext, and all mock data defined.

- ✅ Next.js project initialised with TypeScript + Tailwind
- ✅ Brand assets integrated (palette, logos, fonts)
- ✅ Sidebar and TopBar components built
- ✅ All seven route pages scaffolded (placeholder content)
- ✅ AppContext implemented (activeAccountId, activeProductId, setters)
- ✅ `<FilterBar>` component built and mounted on all seven screens
- ✅ All JSON data files created (accounts × 10, products × 6, quotes, segmentation, waterfall, pvm, win-loss, eor, chat-scenarios)
- ✅ Baker Klaas + Milk Couverture data tuned to Scenario 1 numbers
- ✅ `.env.local` template created
- ✅ Vercel config in place

**Validation:** App navigates between all screens. Filter bar renders on each screen. Changing account in filter bar propagates to AppContext (verified via console/React DevTools).

---

### Phase 2 — Scenario 1 Screens (Segmentation + Deal Pricing + Chat)
**Goal:** Scenario 1 runs end-to-end.

- ✅ Segmentation: scatter plot, Baker Klaas red dot, floor/target curves, filter-reactive re-render
- ✅ Segmentation: comparison mode toggle, prospect input + animation
- ✅ Deal Pricing: price stack, live margin bridge, price band, filter-reactive re-render
- ✅ Deal Pricing: three-scenario comparison panel (give 5% / hold flat / +4% uplift)
- ✅ Deal Pricing: escalation state machine — amber at 5%, simulated approval at 10%
- ✅ Chat: left/right split, conversation thread, DynamicRightPanel
- ✅ Chat: Scenario 1 pre-scripted Q&A (peer comparison + cross-sell)
- ✅ Chat: sets AppContext on account identification

**Validation:** Full Scenario 1 walkthrough: Segmentation → Deal Pricing → Chat. All three steps land cleanly.

---

### Phase 3 — Remaining Screens + Full AI
**Goal:** All seven screens fully functional. AI Explain working everywhere.

- ✅ Price Waterfall: full decomposition, segment average overlay, Baker Klaas rebate highlight, filter-reactive
- ✅ PVM Bridge: signed bar chart, period selector, per-product table, filter-reactive
- ✅ Win/Loss: win probability curve, historical scatter, cliff zone, filter-reactive
- ✅ Ease of Realization: composite score, 7 dimension bars, account comparison table, filter-reactive
- ✅ `/api/explain` route: screen-aware prompts for all seven screens
- ✅ ExplainButton + ExplainPanel on all seven screens
- ✅ Win Prob + EoR signals in Deal Pricing with navigation links
- ✅ Saved conversations (localStorage): save, list, reload
- ✅ Pin visual (visual affordance)

**Validation:** Every screen renders correct data for Baker Klaas + Milk Couverture by default. Filter switching works on every screen. Explain produces credible language on every screen.

---

### Phase 4 — Polish & Demo Readiness
**Goal:** Demo-quality finish, rehearsal-ready.

- ✅ Micro-animations: prospect dot, escalation banner transitions, panel slide-ins, filter switch fade
- ✅ Loading states: skeleton loaders on charts, spinner on AI calls
- ✅ Hover states, tooltips, and empty states on all charts
- ✅ Cross-browser check (Chrome primary, Edge secondary)
- ✅ 1440px viewport QA pass
- ✅ Vercel deployment verified
- ✅ Full end-to-end Scenario 1 walkthrough — zero glitches

**Validation:** Presenter can demo Scenario 1 without any hesitation, broken visuals, or navigation dead-ends.

---

## 14. Future Considerations

### Post-Demo Enhancements
- Real data integration via an API layer (replace JSON with live endpoints)
- Authentication and user roles (rep vs manager vs director views)
- Actual approval workflow with email notifications
- Export: quote to PDF, waterfall to Excel
- Scenario builder: configure which accounts/products are featured

### Additional AI Features
- Proactive anomaly alerts ("3 accounts crossed below floor this week")
- Natural language price simulation ("what if we raised all Milk Couverture prices by 2%?")
- Multi-account comparison in Chat

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OpenAI API latency makes Chat feel sluggish during live demo | Medium | High | Add streaming responses; pre-cache Scenario 1 answers client-side as instant fallback |
| gpt-4o mismatches a question to the wrong scenario | Medium | High | Tighten system prompt with explicit scenario ID list; confidence threshold; graceful fallback |
| Filter bar switch feels slow if charts re-animate on every change | Low | Medium | Use `isAnimationActive={false}` on filter-triggered re-renders; animate only on initial mount |
| Presenter goes off-script and Chat has no matching scenario | Medium | Medium | Graceful fallback: "Let me show you the closest relevant analysis" + sensible default visual |
| Brand inconsistency across screens | Low | Medium | Single `tokens.ts` file with all colours derived from palette.css; enforce via Tailwind config |

---

## 16. Appendix

### Key Accounts Reference

| Account | Segment | Volume (kg/mo) | Price (€/kg) | Floor (€/kg) | Primary Scenario |
|---|---|---|---|---|---|
| Baker Klaas | Mid-Market Benelux | 320 | 4.20 | 4.05 | **Scenario 1 (primary)** |
| Schoko Retail Group | Enterprise Key Accounts | 38,000 | 3.55 | 3.40 | Scenarios 3, 4, 5 |
| + 8 supporting accounts | Various | Various | Various | Various | Background data only |

### Key Products Reference

| SKU | Family | List Price (€/kg) | Primary Scenario |
|---|---|---|---|
| Milk Couverture | Couverture | 5.80 | **Scenario 1 (primary)** |
| White Couverture | Couverture | 6.20 | Scenario 1 cross-sell target |
| Cocoa Powder | Ingredient | 3.20 | Scenario 1 cross-sell target |
| Dark Compound | Compound | 4.60 | Scenarios 3, 4, 5 |
| + 2 supporting SKUs | Various | Various | Background data only |

### Scenario 1 Key Numbers (must match across all screens)

| Metric | Value |
|---|---|
| Baker Klaas current price (Milk Couverture) | €4.20/kg |
| Segment floor (Mid-Market Benelux) | €4.05/kg |
| Segment target | €4.85/kg |
| Segment median | €4.85/kg |
| % below floor | −8% |
| Uplift needed to reach target | +12% |
| Recommended uplift (sweet spot) | +4% → €4.37/kg |
| GM% at −5% (discount scenario) | 14.1% |
| GM% at flat (hold scenario) | 18.3% |
| GM% at +4% (recommended scenario) | 19.8% |
| Baker Klaas segment percentile | Bottom 15% |
| White Couverture co-purchase rate (peers) | 73% |
| Cocoa Powder co-purchase rate (peers) | 73% |

### Brand Assets Location
```
/brand_assets/
├── Equazion_logo.png
├── PwC-logo-icon.png
├── PwC-logo-white.svg
└── palette.css
```

### Environment Setup
```bash
# Install
npm install

# Local development
npm run dev

# Build
npm run build

# Deploy
vercel --prod
```
