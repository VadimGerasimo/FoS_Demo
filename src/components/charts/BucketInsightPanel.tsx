'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import type { BucketInsight, BucketKey } from '@/lib/pvmInsights'

interface BucketInsightPanelProps {
  isOpen: boolean
  onClose: () => void
  insight: BucketInsight | null
  bucketKey: BucketKey | null
  onAskAI: (prompt: string) => void
}

function ContributorBar({ name, value, formatted, maxAbs }: {
  name: string
  value: number
  formatted: string
  maxAbs: number
}) {
  const pct = maxAbs > 0 ? (Math.abs(value) / maxAbs) * 100 : 0
  const isPositive = value >= 0

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-primary font-medium">{name}</span>
        <span className={isPositive ? 'text-zone-green font-semibold' : 'text-zone-red font-semibold'}>
          {formatted}
        </span>
      </div>
      <div className="h-1.5 w-full bg-page-bg rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${isPositive ? 'bg-zone-green' : 'bg-zone-red'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function BucketInsightPanel({
  isOpen,
  onClose,
  insight,
  onAskAI,
}: BucketInsightPanelProps) {
  const [formulaOpen, setFormulaOpen] = useState(false)

  const directionIcon = insight?.heroDirection === 'up'
    ? <TrendingUp size={20} className="text-zone-green" />
    : insight?.heroDirection === 'down'
    ? <TrendingDown size={20} className="text-zone-red" />
    : <Minus size={20} className="text-text-muted" />

  const heroColor = insight?.heroDirection === 'up'
    ? 'text-zone-green'
    : insight?.heroDirection === 'down'
    ? 'text-zone-red'
    : 'text-text-primary'

  const dotColor = insight?.heroDirection === 'up'
    ? 'bg-zone-green'
    : insight?.heroDirection === 'down'
    ? 'bg-zone-red'
    : 'bg-text-muted'

  const maxAbs = insight
    ? Math.max(...insight.topContributors.map(c => Math.abs(c.value)), 1)
    : 1

  const sortedContributors = insight
    ? [...insight.topContributors].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    : []

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
            <div>
              <span className="text-sm font-semibold text-text-primary">
                {insight?.title ?? 'Bucket Analysis'}
              </span>
              <p className="text-[10px] text-text-muted">YTD 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {insight ? (
            <>
              {/* Hero metric */}
              <div className="flex items-center gap-3">
                {directionIcon}
                <span className={`text-3xl font-bold ${heroColor}`}>
                  {insight.heroValue}
                </span>
                <span className="text-xs text-text-muted mt-1">vs. prior period</span>
              </div>

              {/* Narrative */}
              <div className="p-4 bg-page-bg rounded-xl">
                <p className="text-[10px] font-semibold text-text-muted mb-2">
                  What this means
                </p>
                <p className="text-sm text-text-primary leading-relaxed">{insight.narrative}</p>
              </div>

              {/* Top Contributors */}
              {sortedContributors.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-text-muted mb-3">
                    Top contributors
                  </p>
                  <div className="flex flex-col gap-3">
                    {sortedContributors.map(c => (
                      <ContributorBar
                        key={c.name}
                        name={c.name}
                        value={c.value}
                        formatted={c.formatted}
                        maxAbs={maxAbs}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Formula (collapsible) */}
              <div className="border border-border-default rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-text-secondary hover:bg-page-bg transition-colors"
                  onClick={() => setFormulaOpen(v => !v)}
                >
                  <span className="text-[10px] text-text-muted">How it&apos;s calculated</span>
                  {formulaOpen
                    ? <ChevronUp size={13} className="text-text-muted" />
                    : <ChevronDown size={13} className="text-text-muted" />
                  }
                </button>
                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${formulaOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
                  <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border-default pt-3">
                    <code className="font-mono text-xs bg-page-bg rounded-lg p-3 text-text-primary block leading-relaxed">
                      {insight.formula.expression}
                    </code>
                    <p className="text-xs text-text-muted leading-relaxed">{insight.formula.plain}</p>
                  </div>
                </div>
              </div>

              {/* Ask AI CTA */}
              <button
                onClick={() => onAskAI(insight.actionPrompt)}
                className="w-full py-2.5 rounded-xl bg-pwc-orange/10 text-pwc-orange text-sm font-medium hover:bg-pwc-orange/20 transition-colors text-center"
              >
                Ask AI about this →
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-text-muted">Select a bar to explore</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
