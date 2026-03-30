'use client'

import { useState } from 'react'
import { clsx } from 'clsx'

interface Scenario {
  label: string
  discountPct: number
  netPrice: number
  grossMarginPct: number
  zone: 'red' | 'amber' | 'green'
  verdict: string
  isRecommended?: boolean
}

interface ScenarioComparisonProps {
  scenarios: Scenario[]
  activeDiscountPct: number
  baseAfterTier: number
  onApply: (discountPct: number) => void
}

const ZONE_STYLES = {
  red: { border: 'border-zone-red/30', bg: 'bg-zone-red-bg', text: 'text-zone-red', badge: 'zone-badge-red' },
  amber: { border: 'border-zone-amber/30', bg: 'bg-zone-amber-bg', text: 'text-zone-amber', badge: 'zone-badge-amber' },
  green: { border: 'border-zone-green/30', bg: 'bg-zone-green-bg', text: 'text-zone-green', badge: 'zone-badge-green' },
}

export function ScenarioComparison({ scenarios, activeDiscountPct, baseAfterTier, onApply }: ScenarioComparisonProps) {
  const [cardOverrides, setCardOverrides] = useState<Record<string, number>>({})

  return (
    <div className="flex gap-3">
      {scenarios.map((s) => {
        const styles = ZONE_STYLES[s.zone]
        const isActive = Math.abs(s.discountPct - activeDiscountPct) < 0.5
        const effectivePct = cardOverrides[s.label] ?? s.discountPct
        const effectiveNetPrice = baseAfterTier * (1 + effectivePct / 100)
        const effectiveGM = s.grossMarginPct + (effectivePct - s.discountPct) * 0.3

        return (
          <div
            key={s.label}
            className={clsx(
              'flex-1 rounded-xl border-2 p-4 transition-all',
              styles.border,
              s.isRecommended ? 'ring-2 ring-pwc-orange bg-orange-50 border-pwc-orange' : '',
              isActive ? 'shadow-md' : 'opacity-90',
            )}
          >
            {s.isRecommended && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-pwc-orange/10 rounded-full text-[10px] font-semibold text-pwc-orange-dark mb-2">
                ★ Recommended
              </div>
            )}
            <p className="text-xs font-semibold text-text-secondary mb-2">{s.label}</p>

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
      })}
    </div>
  )
}
