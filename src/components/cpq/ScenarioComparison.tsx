'use client'

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
}

const ZONE_STYLES = {
  red: { border: 'border-zone-red/30', bg: 'bg-zone-red-bg', text: 'text-zone-red', badge: 'zone-badge-red' },
  amber: { border: 'border-zone-amber/30', bg: 'bg-zone-amber-bg', text: 'text-zone-amber', badge: 'zone-badge-amber' },
  green: { border: 'border-zone-green/30', bg: 'bg-zone-green-bg', text: 'text-zone-green', badge: 'zone-badge-green' },
}

export function ScenarioComparison({ scenarios, activeDiscountPct }: ScenarioComparisonProps) {
  return (
    <div className="flex gap-3">
      {scenarios.map((s) => {
        const styles = ZONE_STYLES[s.zone]
        const isActive = Math.abs(s.discountPct - activeDiscountPct) < 0.5

        return (
          <div
            key={s.label}
            className={clsx(
              'flex-1 rounded-xl border-2 p-4 transition-all',
              styles.border,
              s.isRecommended ? 'ring-2 ring-pwc-orange/30' : '',
              isActive ? 'shadow-md' : 'opacity-90'
            )}
          >
            {s.isRecommended && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-pwc-orange/10 rounded-full text-[10px] font-semibold text-pwc-orange-dark mb-2">
                ★ Recommended
              </div>
            )}
            <p className="text-xs font-semibold text-text-secondary mb-2">{s.label}</p>

            <p className={`text-2xl font-bold ${styles.text}`}>
              €{s.netPrice.toFixed(2)}
              <span className="text-sm font-normal text-text-muted">/kg</span>
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className={styles.badge}>
                {s.discountPct > 0 ? `+${s.discountPct}%` : s.discountPct < 0 ? `${s.discountPct}%` : 'Flat'}
              </span>
              <span className="text-xs text-text-muted">GM {s.grossMarginPct}%</span>
            </div>

            <p className={`text-xs mt-2 ${styles.text}`}>{s.verdict}</p>
          </div>
        )
      })}
    </div>
  )
}
