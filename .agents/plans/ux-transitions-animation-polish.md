# Feature: UX Transitions & Animation Polish

The following plan should be complete, but it's important that you validate codebase patterns and task sanity before you start implementing.

Pay special attention to the existing `@keyframes fadeIn` and `animate-fade-in` pattern in `globals.css` — all new animations must follow that same pattern. Do not install Framer Motion or any animation library. Everything is CSS + Tailwind.

## Feature Description

A systematic pass over every interactive component to eliminate abrupt snap-in/snap-out behavior, add missing panel slide animations, fix overlay fades, animate demo-critical state changes (EscalationBanner), add page-level transitions, and add micro-interaction polish (button press states, chat message entry, contributor bar fills, accordion height). The goal is to raise demo polish so that transitions feel intentional and smooth throughout the entire Equazion client demo.

## User Story

As a PwC sales consultant running a live client demo,
I want every panel, state change, and navigation to transition smoothly,
So that the tool feels polished and production-grade rather than a prototype.

## Problem Statement

The codebase has 10 distinct transition gaps: 3 panels with no slide animation on their overlays, 1 panel (DemoGuidePanel) with zero animation whatsoever, abrupt EscalationBanner appear/disappear that kills the demo's key storytelling moment, no page-level route transitions, sidebar label content that pops in/out during collapse, chat messages that snap in, a ContributorBar that renders at full width instantly, a formula accordion that pops open, and button interactions with no press feedback.

## Solution Statement

All fixes use only Tailwind CSS utility classes and new `@keyframes` / `@layer utilities` entries in `globals.css`. The approach for all "unmount-on-hide" anti-patterns is to replace `if (!isOpen) return null` / conditional render with a persistent element that uses `opacity-0/100` + `translate-x/y` toggling with `transition-*` classes. This preserves DOM presence so CSS transitions can run in both directions. Page transitions use a `key={pathname}` re-mount with `animate-fade-in`. No new npm packages required.

## Feature Metadata

**Feature Type**: Enhancement / Polish
**Estimated Complexity**: Low-Medium
**Primary Systems Affected**: Layout, Deal Pricing, Chat panels, Shared components, App layout
**Dependencies**: None new — Tailwind CSS 3.4 (already installed), existing `globals.css` keyframes

---

## CONTEXT REFERENCES

### Relevant Codebase Files — YOU MUST READ THESE BEFORE IMPLEMENTING!

- `src/app/globals.css` (lines 45-57) — Why: The ONLY place to add new keyframes and `@layer utilities` animation classes. All animation utilities live here. Pattern to follow for every new animation.
- `src/components/shared/FadeWrapper.tsx` — Why: Shows how `key`-prop-triggered re-mount + `animate-fade-in` works. Page transition will use same technique.
- `src/app/layout.tsx` — Why: Root layout — page transition wrapper goes around `{children}` here. Must read before modifying.
- `src/components/layout/DemoGuidePanel.tsx` (lines 35-150) — Why: Currently uses `if (!isOpen) return null` — full refactor needed to slide pattern.
- `src/components/shared/ExplainPanel.tsx` (lines 12-80) — Why: Overlay uses `{isOpen && <div.../>}` — the exact anti-pattern to fix. Panel slide itself is correct.
- `src/components/charts/BucketInsightPanel.tsx` (lines 76-191) — Why: Same overlay anti-pattern + formula accordion pop + ContributorBar width fix.
- `src/components/chat/ContextualChatPanel.tsx` (lines 167-235) — Why: Missing overlay entirely + state reset happens synchronously during slide-out + messages need fade-in.
- `src/components/deal-pricing/EscalationBanner.tsx` (lines 38-81) — Why: `if (level === 'none') return null` kills transition. Most critical demo moment to fix.
- `src/components/layout/Sidebar.tsx` (lines 45-97) — Why: Conditional `{!collapsed && ...}` for label/logo — needs opacity fade.
- `src/app/deal-pricing/page.tsx` (lines 120-125) — Why: Escalation zone badge needs `transition-colors` added.
- `src/components/shared/ExplainButton.tsx` (lines 43-71) — Why: Error state switches instantly, button needs active press state.
- `src/components/charts/BucketInsightPanel.tsx` (lines 15-39) — Why: ContributorBar inner div `style={{ width: pct% }}` needs `transition-[width]`.

### New Files to Create

None — all changes are modifications to existing files.

### Relevant Documentation

- [Tailwind CSS Transition](https://tailwindcss.com/docs/transition-property) — `transition-[width]`, `transition-[grid-template-rows]`, `transition-opacity`, `transition-transform`, `transition-colors` syntax
- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation) — `@layer utilities` pattern for custom animations, `animation-fill-mode: both`
- [Tailwind CSS arbitrary values](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) — `max-h-[0px]` / `max-h-[500px]` pattern for accordion
- [CSS `translate-x-full`](https://tailwindcss.com/docs/translate) — The slide panel pattern already used in ExplainPanel (line 25) — mirror exactly

### Patterns to Follow

**Existing slide panel pattern** (ExplainPanel.tsx line 24-27 — MIRROR THIS for DemoGuidePanel):
```tsx
<div className={`fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-2xl flex flex-col
  transition-transform duration-300 ease-in-out
  ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
```

**Existing overlay pattern — CORRECT VERSION** (ExplainPanel.tsx line 16-21 — the overlay fade fix follows this structure but must always render):
```tsx
{/* CORRECT: always render, toggle opacity */}
<div
  className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300
    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
  onClick={onClose}
/>
```

**Existing fade-in animation** (globals.css line 46-51):
```css
.animate-fade-in {
  animation: fadeIn 200ms ease-out both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**FadeWrapper key-change re-mount pattern** (FadeWrapper.tsx line 9-11):
```tsx
<div key={fadeKey} className={`animate-fade-in ${className ?? ''}`}>
```

**Accordion using max-height** — no existing example in codebase, use this pattern:
```tsx
<div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out
  ${isOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
  {/* content always rendered, never conditionally mounted */}
</div>
```

**EscalationBanner animate-in pattern** — use this CSS approach in globals.css:
```css
.animate-slide-down {
  animation: slideDown 350ms ease-out both;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**Button active press** — Tailwind utility to add to primary buttons:
```
active:scale-[0.97] transition-transform duration-75
```

**Staggered message fade** — per-message animation delay:
```tsx
<div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
```

**Naming conventions**: PascalCase for components, camelCase for props/functions, kebab-case for CSS class names.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation — CSS utilities in globals.css

Add all new keyframes and utility classes to `globals.css` first. Every subsequent task depends on these classes existing.

**Tasks:**
- Add `animate-slide-down` keyframe + utility (for EscalationBanner)
- Add `animate-slide-in-right` keyframe + utility (optional alias for DemoGuidePanel, but translate pattern is preferred)
- Verify existing `animate-fade-in` / `fadeIn` are present (they are — don't duplicate)

### Phase 2: Critical Demo Path Fixes

Fix the highest-impact items that affect the demo storytelling flow.

**Tasks:**
- Fix DemoGuidePanel (no animation → slide-in)
- Fix EscalationBanner (instant snap → slide-down animate-in, graceful exit)
- Add page transition to layout.tsx

### Phase 3: Panel Overlay Fixes

Fix all three panels with broken overlay transitions.

**Tasks:**
- Fix ExplainPanel overlay
- Fix BucketInsightPanel overlay
- Add overlay + fix state reset timing in ContextualChatPanel

### Phase 4: Component-Level Polish

Smaller but visible polish items.

**Tasks:**
- Sidebar label/logo fade during collapse
- Chat message fade-in on append
- ContributorBar width transition
- Formula accordion height animation
- Button active press state
- Escalation zone badge transition-colors in Deal Pricing page
- ExplainButton error state transition

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### TASK 1 — UPDATE `src/app/globals.css`

- **IMPLEMENT**: Add `animate-slide-down` utility and `@keyframes slideDown` to `@layer utilities` block (after existing `animate-fade-in-slow`, before closing brace). Add `animate-message-in` for chat messages with a 150ms ease-out. The `@keyframes slideDown` block goes in the global scope after the existing `@keyframes fadeIn`.
- **PATTERN**: Follow exact pattern of existing `animate-fade-in` at line 46-48
- **ADD** to `@layer utilities` block (after line 51, before `}`):
  ```css
  .animate-slide-down {
    animation: slideDown 350ms ease-out both;
  }
  .animate-message-in {
    animation: fadeIn 180ms ease-out both;
  }
  ```
- **ADD** after existing `@keyframes fadeIn` block (after line 57):
  ```css
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  ```
- **GOTCHA**: Do NOT add `@keyframes` inside `@layer` blocks — they must be at root level in the CSS file, same as the existing `fadeIn` keyframe on line 54.
- **VALIDATE**: `npx next build 2>&1 | tail -5` — must show no CSS errors

---

### TASK 2 — UPDATE `src/components/layout/DemoGuidePanel.tsx`

- **IMPLEMENT**: Remove `if (!isOpen) return null` (line 36). Replace with always-rendered structure. Apply `transition-transform duration-300 ease-in-out` + `translate-x-full/translate-x-0` to the panel div. Apply `transition-opacity duration-300` + `opacity-0/opacity-100 pointer-events-none/auto` to the overlay div. The panel should slide in from the right exactly like ExplainPanel.
- **PATTERN**: ExplainPanel.tsx lines 13-27 — MIRROR EXACTLY. Width should remain `w-[480px]` (as currently coded).
- **BEFORE** (current lines 35-47):
  ```tsx
  export function DemoGuidePanel({ isOpen, onClose }: Props) {
    if (!isOpen) return null
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
        {/* Panel */}
        <div className="fixed top-0 right-0 z-50 h-full w-[480px] bg-white shadow-2xl flex flex-col">
  ```
- **AFTER**:
  ```tsx
  export function DemoGuidePanel({ isOpen, onClose }: Props) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />
        {/* Panel */}
        <div className={`fixed top-0 right-0 z-50 h-full w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
  ```
- **GOTCHA**: Remove ONLY the `if (!isOpen) return null` line and the `<>` is already present. The closing `</>` and all inner content remain unchanged.
- **VALIDATE**: `npx next lint src/components/layout/DemoGuidePanel.tsx`

---

### TASK 3 — UPDATE `src/components/deal-pricing/EscalationBanner.tsx`

- **IMPLEMENT**: Replace `if (level === 'none') return null` (line 55) with a persistent wrapper that animates in/out. The outer container should always render, using `animate-slide-down` (from Task 1) when `level !== 'none'`, and `hidden` only when `level === 'none'`. Additionally, add a `key={level}` on the inner content div so changing between `rep`/`manager`/`director` also triggers a re-animate.
- **PATTERN**: Use the `animate-slide-down` class added in Task 1. Use `key={level}` re-mount trick (same as FadeWrapper's `key={fadeKey}` pattern at FadeWrapper.tsx line 11).
- **REMOVE**: Line 55 `if (level === 'none') return null`
- **REMOVE**: Line 57 `if (!cfg) return null`
- **WRAP** the entire return in:
  ```tsx
  if (level === 'none') return null   // keep this — we want it gone from DOM when 'none' is stable
  ```
  Wait — the problem is we can't animate-out if we return null. The correct approach for banner **entry only** (since "none" state has nothing to show) is:
  - Keep `if (level === 'none') return null`
  - Add `animate-slide-down key={level}` to the existing wrapper div so it re-animates on each level change and on first appear
  - This gives a clean slide-down on enter; the exit (return null) is instant but acceptable since the price is already back in safe zone at that point
- **ACTUAL IMPLEMENTATION**:
  - Keep both `return null` guards as-is
  - On the wrapper `<div>` at line 62, add `key={level}` and `animate-slide-down` to the existing className:
  ```tsx
  <div key={level} className={`animate-slide-down flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} transition-all`}>
  ```
- **GOTCHA**: `key` prop on a regular div triggers React re-mount, which re-runs the CSS animation. This is the correct approach. Do not add `key` to the outer fragment — add it to the `<div>` wrapper itself.
- **VALIDATE**: `npx next lint src/components/deal-pricing/EscalationBanner.tsx`

---

### TASK 4 — UPDATE `src/app/layout.tsx`

- **IMPLEMENT**: Add page fade transition by wrapping `{children}` with a `key={pathname}` div that applies `animate-fade-in`. Requires importing `usePathname` from `next/navigation`. Because `layout.tsx` is a Server Component by default in Next.js 14 App Router, we must either (a) create a thin `PageTransitionWrapper` client component, or (b) move the children wrapper inline. Option (a) is cleaner.
- **CREATE** new file `src/components/layout/PageTransitionWrapper.tsx`:
  ```tsx
  'use client'
  import { usePathname } from 'next/navigation'
  export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    return (
      <div key={pathname} className="animate-fade-in h-full">
        {children}
      </div>
    )
  }
  ```
- **UPDATE** `src/app/layout.tsx`: Import `PageTransitionWrapper` and wrap `{children}`:
  ```tsx
  import { PageTransitionWrapper } from '@/components/layout/PageTransitionWrapper'
  // ...
  <main className="flex-1 overflow-y-auto bg-page-bg">
    <PageTransitionWrapper>{children}</PageTransitionWrapper>
  </main>
  ```
- **GOTCHA 1**: `layout.tsx` is a Server Component — cannot use `usePathname` directly. The thin client wrapper is mandatory.
- **GOTCHA 2**: The `animate-fade-in` duration is 200ms. Do NOT use `animate-fade-in-slow` (400ms) for page transitions — it feels sluggish.
- **GOTCHA 3**: The wrapper div needs `h-full` to avoid breaking existing `flex-1 overflow-y-auto` layout in pages.
- **VALIDATE**: `npx next build 2>&1 | grep -E "error|Error"` — must be zero errors

---

### TASK 5 — UPDATE `src/components/shared/ExplainPanel.tsx`

- **IMPLEMENT**: Fix the overlay to always render (not conditional), using opacity toggle with `pointer-events-none` when closed.
- **BEFORE** (lines 15-21):
  ```tsx
  {isOpen && (
    <div
      className="fixed inset-0 z-40 bg-black/20"
      onClick={onClose}
    />
  )}
  ```
- **AFTER**:
  ```tsx
  <div
    className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    onClick={onClose}
  />
  ```
- **GOTCHA**: Remove the `{isOpen && (...)}` wrapper — the div should be directly inside the fragment, not conditionally rendered.
- **VALIDATE**: `npx next lint src/components/shared/ExplainPanel.tsx`

---

### TASK 6 — UPDATE `src/components/charts/BucketInsightPanel.tsx`

Three sub-fixes in one file.

#### 6a — Fix overlay (same pattern as Task 5)
- **BEFORE** (lines 78-83):
  ```tsx
  {isOpen && (
    <div
      className="fixed inset-0 z-40 bg-black/20"
      onClick={onClose}
    />
  )}
  ```
- **AFTER**: Same fix as ExplainPanel Task 5 — always-rendered div with opacity/pointer-events toggle.

#### 6b — ContributorBar width transition (lines 33-37)
- **IMPLEMENT**: Add `transition-[width] duration-500 ease-out` to the inner fill `<div>` in the `ContributorBar` function.
- **BEFORE** (line 33-37):
  ```tsx
  <div className="h-1.5 w-full bg-page-bg rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full ${isPositive ? 'bg-zone-green' : 'bg-zone-red'}`}
      style={{ width: `${pct}%` }}
    />
  ```
- **AFTER**:
  ```tsx
  <div className="h-1.5 w-full bg-page-bg rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-[width] duration-500 ease-out ${isPositive ? 'bg-zone-green' : 'bg-zone-red'}`}
      style={{ width: `${pct}%` }}
    />
  ```

#### 6c — Formula accordion height animation (lines 152-172)
- **IMPLEMENT**: Replace `{formulaOpen && <div...>}` conditional render with always-rendered div using `max-h` transition.
- **BEFORE** (lines 164-171):
  ```tsx
  {formulaOpen && (
    <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border-default pt-3">
      ...
    </div>
  )}
  ```
- **AFTER**:
  ```tsx
  <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${formulaOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
    <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border-default pt-3">
      ...
    </div>
  </div>
  ```
- **GOTCHA**: The `border-t` is inside the inner div, so it animates in with the content — this is correct behavior. Do NOT put `border-t` on the outer `max-h` div.
- **VALIDATE**: `npx next lint src/components/charts/BucketInsightPanel.tsx`

---

### TASK 7 — UPDATE `src/components/chat/ContextualChatPanel.tsx`

Three sub-fixes.

#### 7a — Add overlay (currently missing entirely)
- **IMPLEMENT**: Add a persistent overlay div at the top of the return, using the same opacity/pointer-events pattern. Insert before the main panel div (line 168).
- **ADD** before line 168:
  ```tsx
  <div
    className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    onClick={onClose}
  />
  ```
- **WRAP** the existing `<div className={`fixed top-0 right-0...`}>` and new overlay in a fragment `<>...</>`.

#### 7b — Delay state reset to avoid content clearing during slide-out
- **IMPLEMENT**: In the `useEffect` that resets state when `isOpen` becomes false (lines 133-140), add a 300ms delay matching the panel transition duration before clearing messages.
- **BEFORE** (lines 133-140):
  ```tsx
  useEffect(() => {
    if (!isOpen) {
      setMessages([])
      setInput('')
      setLoading(false)
      hasFiredRef.current = false
    }
  }, [isOpen])
  ```
- **AFTER**:
  ```tsx
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setMessages([])
        setInput('')
        setLoading(false)
        hasFiredRef.current = false
      }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])
  ```

#### 7c — Chat message fade-in on append
- **IMPLEMENT**: Add `animate-message-in` (from Task 1) to each message bubble wrapper div (line 189).
- **BEFORE** (line 189):
  ```tsx
  <div key={i} className={m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start w-full'}>
  ```
- **AFTER**:
  ```tsx
  <div key={i} className={`animate-message-in ${m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start w-full'}`}>
  ```
- **GOTCHA**: `animate-message-in` uses `animation: fadeIn 180ms ease-out both` (defined in Task 1). It uses `both` fill-mode so there's no flash on mount.
- **VALIDATE**: `npx next lint src/components/chat/ContextualChatPanel.tsx`

---

### TASK 8 — UPDATE `src/components/layout/Sidebar.tsx`

Fix sidebar label and logo popping during collapse animation.

#### 8a — Nav item labels
- **IMPLEMENT**: Replace `{!collapsed && <span>{label}</span>}` (line 84) with always-rendered span using opacity + width transition.
- **BEFORE** (line 84):
  ```tsx
  {!collapsed && <span>{label}</span>}
  ```
- **AFTER**:
  ```tsx
  <span className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
    {label}
  </span>
  ```

#### 8b — Logo area
- **IMPLEMENT**: The logo uses `{!collapsed && <EquazionLogo .../>}` (line 54). Wrap in opacity transition instead.
- **BEFORE** (line 54):
  ```tsx
  {!collapsed && <EquazionLogo bg="rgb(50,51,54)" fontSize={28} />}
  ```
- **AFTER**:
  ```tsx
  <div className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
    <EquazionLogo bg="rgb(50,51,54)" fontSize={28} />
  </div>
  ```

#### 8c — Footer text
- **IMPLEMENT**: Same pattern for `{!collapsed && <span className="text-white/40 text-xs">Commercial Intelligence</span>}` (line 93).
- **AFTER**:
  ```tsx
  <span className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap text-white/40 text-xs ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
    Commercial Intelligence
  </span>
  ```
- **GOTCHA**: Duration is 150ms (shorter than the 200ms width transition) so text fades out before the sidebar finishes collapsing, preventing text clipping artifacts.
- **VALIDATE**: `npx next lint src/components/layout/Sidebar.tsx`

---

### TASK 9 — UPDATE `src/app/deal-pricing/page.tsx`

Add `transition-colors duration-300` to the escalation zone badge.

- **IMPLEMENT**: Find the net price badge div (lines 120-126). Add `transition-colors duration-300` to its className.
- **BEFORE** (lines 120-126):
  ```tsx
  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
    escalationLevel === 'none' ? 'bg-zone-green-bg text-zone-green' :
    escalationLevel === 'rep' ? 'bg-zone-amber-bg text-zone-amber' :
    'bg-zone-red-bg text-zone-red'
  }`}>
    €{netPrice.toFixed(2)}/kg
  </div>
  ```
- **AFTER**:
  ```tsx
  <div className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors duration-300 ${
    escalationLevel === 'none' ? 'bg-zone-green-bg text-zone-green' :
    escalationLevel === 'rep' ? 'bg-zone-amber-bg text-zone-amber' :
    'bg-zone-red-bg text-zone-red'
  }`}>
    €{netPrice.toFixed(2)}/kg
  </div>
  ```
- **VALIDATE**: `npx next lint src/app/deal-pricing/page.tsx`

---

### TASK 10 — UPDATE `src/components/shared/ExplainButton.tsx`

Add active press state and smooth error transition.

- **IMPLEMENT 1**: Add `active:scale-[0.97] transition-transform duration-75` to the main button's className (line 63-65). This adds a tactile press animation.
- **IMPLEMENT 2**: Add `transition-colors duration-200` to the error state button (line 47-55) so the snap from normal→error state fades.
- **BEFORE** main button (lines 60-65):
  ```tsx
  className={clsx(
    'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg text-white rounded-full shadow-lg hover:bg-pwc-orange transition-colors text-sm font-medium disabled:opacity-60',
    className ?? 'right-6'
  )}
  ```
- **AFTER**:
  ```tsx
  className={clsx(
    'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg text-white rounded-full shadow-lg hover:bg-pwc-orange transition-colors active:scale-[0.97] text-sm font-medium disabled:opacity-60',
    className ?? 'right-6'
  )}
  ```
- **BEFORE** error button (lines 47-55):
  ```tsx
  className={clsx(
    'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-full shadow-lg text-sm font-medium',
    className ?? 'right-6'
  )}
  ```
- **AFTER**:
  ```tsx
  className={clsx(
    'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-full shadow-lg text-sm font-medium transition-colors duration-200',
    className ?? 'right-6'
  )}
  ```
- **VALIDATE**: `npx next lint src/components/shared/ExplainButton.tsx`

---

## TESTING STRATEGY

No automated test framework is present in this project (no Jest/Vitest config, no `__tests__` directory, no test scripts in `package.json`). Validation is via TypeScript compilation, ESLint, and manual browser testing.

### Manual Validation Checklist

**DemoGuidePanel (Task 2)**
- Click Bell icon in TopBar → panel slides in from right over 300ms ✓
- Click backdrop → panel slides out to right over 300ms ✓
- Previously: panel snapped in/out instantly

**EscalationBanner (Task 3)**
- On Deal Pricing page, drag slider to below floor price → banner slides down with 350ms ease-out ✓
- Drag back above floor → banner disappears (instant exit is acceptable) ✓
- Slide between `rep`/`manager`/`director` levels → banner re-animates each time ✓

**Page transitions (Task 4)**
- Click any sidebar nav item → content fades in over 200ms ✓
- No layout jump or scroll position issue ✓

**Panel overlays (Tasks 5, 6, 7)**
- Open/close ExplainPanel → backdrop fades in/out smoothly ✓
- Open/close BucketInsightPanel → backdrop fades in/out smoothly ✓
- Open ContextualChatPanel → backdrop fades in, messages appear with fade-in animation ✓
- Close ContextualChatPanel → panel slides out, messages visible during slide (not cleared mid-animation) ✓

**Sidebar (Task 8)**
- Click collapse toggle → labels/logo fade out during width collapse, no text clipping ✓
- Click expand → labels/logo fade in after width expands ✓

**Deal Pricing badge (Task 9)**
- Drag slider across zone boundaries → badge color blends smoothly ✓

**ExplainButton (Task 10)**
- Click Explain button → button slightly scales down on press ✓

**ContributorBar (Task 6b)**
- Click a PVM bucket bar → BucketInsightPanel opens, contributor bars animate from 0% to full width ✓

**Formula accordion (Task 6c)**
- Click "How it's calculated" → content smoothly expands with height animation ✓
- Click again → content smoothly collapses ✓

---

## VALIDATION COMMANDS

### Level 1: TypeScript & Linting

```bash
npx next lint
```
Must return zero errors. Warnings about `exhaustive-deps` are pre-existing and acceptable.

### Level 2: Build Check

```bash
npx next build
```
Must complete with zero errors. Watch for any CSS parsing errors from globals.css changes.

### Level 3: Individual file lint (run after each task)

```bash
npx next lint src/app/globals.css
npx next lint src/components/layout/DemoGuidePanel.tsx
npx next lint src/components/deal-pricing/EscalationBanner.tsx
npx next lint src/app/layout.tsx
npx next lint src/components/layout/PageTransitionWrapper.tsx
npx next lint src/components/shared/ExplainPanel.tsx
npx next lint src/components/charts/BucketInsightPanel.tsx
npx next lint src/components/chat/ContextualChatPanel.tsx
npx next lint src/components/layout/Sidebar.tsx
npx next lint src/app/deal-pricing/page.tsx
npx next lint src/components/shared/ExplainButton.tsx
```

### Level 4: Dev server smoke test

```bash
npm run dev
```
Open http://localhost:3000 and manually run through the validation checklist above.

---

## ACCEPTANCE CRITERIA

- [ ] DemoGuidePanel slides in/out from right (300ms ease-in-out) with fading backdrop
- [ ] EscalationBanner animates in with `slideDown` (350ms) when price breaches threshold; re-animates on zone change
- [ ] All page navigations trigger a 200ms fade-in on content
- [ ] ExplainPanel backdrop fades in/out (no more instant flash)
- [ ] BucketInsightPanel backdrop fades in/out
- [ ] ContextualChatPanel has backdrop, messages fade in, content preserved during slide-out
- [ ] Sidebar labels and logo fade during collapse (no text clipping)
- [ ] ContributorBar widths animate from 0% to value on panel open
- [ ] Formula accordion expands/collapses with height animation
- [ ] Deal Pricing escalation zone badge color blends on slider zone crossing
- [ ] ExplainButton shows press feedback on click
- [ ] `npx next build` passes with zero errors
- [ ] `npx next lint` passes with zero errors
- [ ] No regressions: all existing panel open/close functionality works correctly
- [ ] No layout shifts or scroll jumps introduced by page transition wrapper

---

## COMPLETION CHECKLIST

- [ ] Task 1 (globals.css): `animate-slide-down` + `animate-message-in` added
- [ ] Task 2 (DemoGuidePanel): slide-in + overlay fade implemented
- [ ] Task 3 (EscalationBanner): `key={level}` + `animate-slide-down` on wrapper
- [ ] Task 4 (layout.tsx): PageTransitionWrapper created and integrated
- [ ] Task 5 (ExplainPanel): overlay always-rendered with opacity toggle
- [ ] Task 6 (BucketInsightPanel): overlay + ContributorBar transition + accordion height
- [ ] Task 7 (ContextualChatPanel): overlay + delayed reset + message fade
- [ ] Task 8 (Sidebar): label/logo opacity fade during collapse
- [ ] Task 9 (deal-pricing/page.tsx): badge `transition-colors duration-300`
- [ ] Task 10 (ExplainButton): `active:scale-[0.97]` + error state transition
- [ ] `npx next lint` — zero errors
- [ ] `npx next build` — zero errors
- [ ] Manual browser walkthrough of all 10 acceptance criteria

---

## NOTES

**Why no Framer Motion?** The existing animation system (Tailwind CSS + custom `@keyframes` in globals.css) handles all required cases without adding a dependency. Framer Motion's `AnimatePresence` would be ideal for true mount/unmount transitions, but it adds ~30KB and changes the mental model significantly. All fixes here work within the existing paradigm.

**The EscalationBanner exit trade-off**: Proper exit animation for EscalationBanner would require keeping it mounted with `opacity-0` when `level === 'none'`. This was intentionally kept as instant-exit because: (1) the demo scenario always goes from escalation → safe by raising price (a positive action), (2) the instant disappearance of the red banner when price is corrected actually reinforces the "problem solved" moment, (3) implementing exit animation requires a `useEffect` with a delayed `setVisible(false)` which adds non-trivial complexity. The `key={level}` entry animation is the best ROI here.

**The sidebar approach**: Using `max-w-0 / max-w-[200px]` + `opacity-0 / opacity-100` is preferred over `w-0 / w-full` because `max-w` doesn't trigger layout recalculation on the parent flex container in the same way. The opacity fade is tuned to 150ms (slightly faster than the 200ms sidebar width) so text fades out before the container is too narrow to display it cleanly.

**Page transition key behavior**: Using `key={pathname}` causes React to unmount/remount the page children on every route change. This is intentional — it ensures the `animate-fade-in` CSS animation fires on every navigation. The trade-off is that page components fully remount (scroll position resets, local state clears), which is desirable for a demo tool where each screen is conceptually independent.

**Confidence Score**: 9/10 — All changes are pure CSS/Tailwind with well-established patterns already in the codebase. The only complexity is the ContextualChatPanel overlay wrapping (needs a React fragment) and the PageTransitionWrapper server/client boundary. Both are straightforward.
