'use client'

import { useState, useEffect } from 'react'
import { accounts, products, getEoRForAccount, eorDataset } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { EoRDimensions } from '@/components/charts/EoRDimensions'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'

export default function EoRPage() {
  const { activeAccountId } = useAppContext()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const accountId = activeAccountId ?? 'baker-klaas'
  const eorData = getEoRForAccount(accountId) ?? eorDataset[0]
  const isFallback = !getEoRForAccount(accountId) && accountId !== 'baker-klaas'

  const compositeScore = eorData.compositeScore
  const zone = compositeScore >= 7 ? 'green' : compositeScore >= 5 ? 'amber' : 'red'

  const sortedTable = [...eorDataset].sort((a, b) =>
    sortAsc ? a.compositeScore - b.compositeScore : b.compositeScore - a.compositeScore
  )

  const keyMetrics = {
    accountId,
    compositeScore,
    zone,
    dimensions: eorData.dimensions.map(d => ({ name: d.name, score: d.score })),
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {!mounted ? (
        <div className="flex-1 p-6"><ChartSkeleton rows={2} height="h-32" /></div>
      ) : (
      <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}`} className="flex-1 flex min-h-0 overflow-hidden">
      <div className="flex-1 flex p-6 gap-6 min-h-0 overflow-hidden">
        {/* Left — composite score + dimensions (45%) */}
        <div className="flex flex-col gap-4 overflow-y-auto" style={{ flexBasis: '45%' }}>
          {/* Composite score */}
          <div className="card p-5">
            <p className="text-xs text-text-muted mb-1">Ease of Realization Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${
                zone === 'green' ? 'text-zone-green' :
                zone === 'amber' ? 'text-zone-amber' :
                'text-zone-red'
              }`}>{compositeScore.toFixed(1)}</span>
              <span className="text-text-muted text-lg">/ 10</span>
            </div>
            <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${
              zone === 'green' ? 'bg-zone-green-bg text-zone-green' :
              zone === 'amber' ? 'bg-zone-amber-bg text-zone-amber' :
              'bg-zone-red-bg text-zone-red'
            }`}>
              {compositeScore >= 7 ? 'High Ease' : compositeScore >= 5 ? 'Medium Ease' : 'Low Ease'}
            </span>
            <p className="text-xs text-text-muted mt-2">
              {accounts.find(a => a.id === accountId)?.name ?? accountId}
            </p>
          </div>

          {/* Fallback notice */}
          {isFallback && (
            <div className="px-3 py-2 bg-page-bg border border-border-default rounded-lg text-xs text-text-muted">
              Showing Baker Klaas data (no EoR data for selected account)
            </div>
          )}

          {/* Dimension bars */}
          <div className="card p-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">Dimension Breakdown</h3>
            <EoRDimensions dimensions={eorData.dimensions} />
          </div>
        </div>

        {/* Right — account comparison table (55%) */}
        <div className="card p-4 overflow-y-auto" style={{ flexBasis: '55%' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Account Comparison</h3>
            <button
              onClick={() => setSortAsc(v => !v)}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
            >
              Score {sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-default">
                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Account</th>
                <th className="text-center px-3 py-2 font-semibold text-text-secondary">Score</th>
                <th className="text-left px-3 py-2 font-semibold text-text-secondary">Top Risk</th>
              </tr>
            </thead>
            <tbody>
              {sortedTable.map((row) => {
                const topRisk = [...row.dimensions].sort((a, b) => a.score - b.score)[0]
                const rowZone = row.compositeScore >= 7 ? 'green' : row.compositeScore >= 5 ? 'amber' : 'red'
                const isActive = row.accountId === accountId
                return (
                  <tr
                    key={row.accountId}
                    className={`border-b border-border-default ${isActive ? 'bg-pwc-orange/5' : ''}`}
                  >
                    <td className={`px-3 py-2.5 font-medium ${isActive ? 'text-pwc-orange-dark' : 'text-text-primary'}`}>
                      {accounts.find(a => a.id === row.accountId)?.name ?? row.accountId}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`font-bold ${
                        rowZone === 'green' ? 'text-zone-green' :
                        rowZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{row.compositeScore.toFixed(1)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-text-muted">{topRisk?.name ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      </FadeWrapper>
      )}

      <ExplainButton
        screen="ease-of-realization"
        accountId={activeAccountId}
        productId={null}
        keyMetrics={keyMetrics}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
