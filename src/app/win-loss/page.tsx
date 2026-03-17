'use client'

import { useState, useEffect } from 'react'
import { accounts, products, getWinLossForProduct } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { WinProbabilityCurve } from '@/components/charts/WinProbabilityCurve'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'

function interpolateWinRate(curve: { price: number; winRate: number }[], price: number): number {
  const sorted = [...curve].sort((a, b) => a.price - b.price)
  if (price <= sorted[0].price) return sorted[0].winRate
  if (price >= sorted[sorted.length - 1].price) return sorted[sorted.length - 1].winRate
  const lower = sorted.filter(p => p.price <= price).at(-1)!
  const upper = sorted.find(p => p.price > price)!
  const t = (price - lower.price) / (upper.price - lower.price)
  return lower.winRate + t * (upper.winRate - lower.winRate)
}

export default function WinLossPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const productId = activeProductId ?? 'milk-couverture'
  const winLossData =
    getWinLossForProduct(productId) ??
    getWinLossForProduct('milk-couverture')!

  const account = accounts.find(a => a.id === activeAccountId)
  const currentPrice = account?.price ?? winLossData.optimalPrice

  const winRateAtCurrent = Math.round(interpolateWinRate(winLossData.curve, currentPrice))
  const zone = winRateAtCurrent >= 65 ? 'green' : winRateAtCurrent >= 40 ? 'amber' : 'red'
  const wonCount = winLossData.historicalQuotes.filter(q => q.won).length
  const lostCount = winLossData.historicalQuotes.filter(q => !q.won).length

  const keyMetrics = {
    productId,
    accountId: activeAccountId,
    currentPrice,
    optimalPrice: winLossData.optimalPrice,
    cliffMin: winLossData.cliffMin,
    cliffMax: winLossData.cliffMax,
    winRateAtCurrent,
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {!mounted ? (
        <div className="flex-1 p-6"><ChartSkeleton rows={1} height="h-56" /></div>
      ) : (
      <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}-${activeProductId ?? 'none'}`} className="flex-1 flex min-h-0">
      <div className="flex-1 flex p-6 gap-6 min-h-0">
        {/* Left — chart (65%) */}
        <div className="card flex-1 p-4 min-h-0" style={{ flexBasis: '65%' }}>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Win Probability — {products.find(p => p.id === productId)?.name ?? productId}
          </h2>
          <div style={{ height: 'calc(100% - 32px)' }}>
            <WinProbabilityCurve data={winLossData} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Right — insight panel (35%) */}
        <div className="card p-5 flex flex-col gap-4" style={{ flexBasis: '35%' }}>
          <h2 className="text-sm font-semibold text-text-primary">Price Intelligence</h2>

          <div>
            <p className="text-xs text-text-muted mb-0.5">Optimal Price</p>
            <p className="text-xl font-bold text-zone-green">€{winLossData.optimalPrice.toFixed(2)}/kg</p>
          </div>

          <div>
            <p className="text-xs text-text-muted mb-0.5">Cliff Zone</p>
            <p className="text-sm font-semibold text-zone-red">€{winLossData.cliffMin.toFixed(2)} – €{winLossData.cliffMax.toFixed(2)}/kg</p>
            <p className="text-xs text-text-muted mt-0.5">Win rate drops sharply in this range</p>
          </div>

          <div>
            <p className="text-xs text-text-muted mb-0.5">Win Rate at Current Price</p>
            <p className={`text-xl font-bold ${
              zone === 'green' ? 'text-zone-green' :
              zone === 'amber' ? 'text-zone-amber' :
              'text-zone-red'
            }`}>{winRateAtCurrent}%</p>
            {currentPrice && (
              <p className="text-xs text-text-muted mt-0.5">at €{currentPrice.toFixed(2)}/kg</p>
            )}
          </div>

          <div className="text-xs text-text-muted leading-relaxed">
            Based on {winLossData.historicalQuotes.length} historical quotes.{' '}
            <span className="text-zone-green font-medium">{wonCount} won</span>,{' '}
            <span className="text-zone-red font-medium">{lostCount} lost</span>.
          </div>
        </div>
      </div>
      </FadeWrapper>
      )}

      <ExplainButton
        screen="win-loss"
        accountId={activeAccountId}
        productId={activeProductId}
        keyMetrics={keyMetrics}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
