'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { accounts, products, getWinLossForProduct, getEoRForAccount, eorDataset } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { WinProbabilityCurve } from '@/components/charts/WinProbabilityCurve'
import { EoRDimensions } from '@/components/charts/EoRDimensions'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { ContextualChatPanel } from '@/components/chat/ContextualChatPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'
import { interpolateWinRate } from '@/lib/interpolateWinRate'
import { ChevronUp, ChevronDown, MessageSquare } from 'lucide-react'

function WinLossLegend({ optimalPrice, currentPrice, quotedPrice }: { optimalPrice: number; currentPrice?: number; quotedPrice?: number }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
      <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-3 h-3 rounded-full bg-zone-green inline-block" />
        Won deal
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-3 h-3 rounded-full bg-zone-red inline-block" />
        Lost deal
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-5 h-px bg-pwc-orange inline-block" />
        Win probability curve
      </span>
      <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-5 h-2 bg-zone-red/20 border border-zone-red/40 inline-block rounded-sm" />
        Price cliff zone
      </span>
      {currentPrice && (
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-5 border-t-2 border-dashed border-[#6d6e71] inline-block" />
          Contracted price
        </span>
      )}
      {quotedPrice && quotedPrice !== currentPrice && (
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-5 border-t-2 border-dashed border-blue-500 inline-block" style={{ borderStyle: 'dashed' }} />
          CPQ quoted price
        </span>
      )}
      <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-5 border-t-2 border-dashed border-zone-green inline-block" />
        Optimal price (€{optimalPrice.toFixed(2)}/kg)
      </span>
    </div>
  )
}

function DealIntelligenceContent() {
  const { activeAccountId, activeProductId } = useAppContext()
  const searchParams = useSearchParams()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const quotedPriceParam = searchParams.get('quotedPrice')
  const quotedPrice = quotedPriceParam ? parseFloat(quotedPriceParam) : undefined

  const productId = activeProductId ?? 'milk-couverture'
  const winLossData = getWinLossForProduct(productId) ?? getWinLossForProduct('milk-couverture')!

  const account = accounts.find(a => a.id === activeAccountId)
  const currentPrice = account?.price ?? winLossData.optimalPrice

  const winRateAtCurrent = Math.round(interpolateWinRate(winLossData.curve, currentPrice))
  const winRateAtOptimal = Math.round(interpolateWinRate(winLossData.curve, winLossData.optimalPrice))
  const winRateAtQuoted = quotedPrice ? Math.round(interpolateWinRate(winLossData.curve, quotedPrice)) : undefined
  const winZone = winRateAtCurrent >= 65 ? 'green' : winRateAtCurrent >= 40 ? 'amber' : 'red'
  const quotedZone = winRateAtQuoted !== undefined
    ? (winRateAtQuoted >= 65 ? 'green' : winRateAtQuoted >= 40 ? 'amber' : 'red')
    : undefined
  const wonCount = winLossData.historicalQuotes.filter(q => q.won).length
  const lostCount = winLossData.historicalQuotes.filter(q => !q.won).length
  const gapToOptimal = winLossData.optimalPrice - currentPrice

  const segmentFloor = account?.floors?.[productId]
  const segmentTarget = account?.targets?.[productId]

  const accountId = activeAccountId ?? 'baker-klaas'
  const eorData = getEoRForAccount(accountId) ?? eorDataset[0]
  const isFallback = !getEoRForAccount(accountId) && accountId !== 'baker-klaas'
  const eorCompositeScore = eorData.compositeScore
  const eorZone = eorCompositeScore >= 7 ? 'green' : eorCompositeScore >= 5 ? 'amber' : 'red'

  const sortedTable = [...eorDataset].sort((a, b) =>
    sortAsc ? a.compositeScore - b.compositeScore : b.compositeScore - a.compositeScore
  )

  const dealScore = Math.round((winRateAtCurrent / 100) * 0.6 * 100 + (eorCompositeScore / 10) * 0.4 * 100)
  const dealScoreZone = dealScore >= 70 ? 'green' : dealScore >= 45 ? 'amber' : 'red'
  const dealScoreLabel = dealScore >= 70 ? 'Proceed' : dealScore >= 45 ? 'Proceed with Conditions' : 'Escalate / Review'

  const winZoneLabel = winZone === 'green'
    ? 'Safe zone — strong win probability'
    : winZone === 'amber'
    ? 'Caution — approaching cliff'
    : 'Danger — high deal loss risk'

  const keyMetrics = {
    winRateAtCurrentPrice: winRateAtCurrent,
    eorCompositeScore,
    dealScore,
    cliffMin: winLossData.cliffMin,
    cliffMax: winLossData.cliffMax,
    optimalPrice: winLossData.optimalPrice,
    currentPrice,
    weakestEoRDimension: [...eorData.dimensions].sort((a, b) => a.score - b.score)[0]?.name,
  }

  const accountName = accounts.find(a => a.id === activeAccountId)?.name ?? null
  const productName = products.find(p => p.id === activeProductId)?.name ?? null

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {!mounted ? (
        <div className="flex-1 p-6"><ChartSkeleton rows={2} height="h-56" /></div>
      ) : (
        <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}-${activeProductId ?? 'none'}`} className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 flex flex-col gap-6">

            {/* CPQ QUOTED PRICE BANNER */}
            {quotedPrice && quotedPrice !== currentPrice && (
              <div className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-blue-700 font-medium">Viewing CPQ quoted price: €{quotedPrice.toFixed(2)}/kg</span>
                <span className="text-blue-500 mx-1">·</span>
                <span className="text-blue-600">
                  Win probability at this price: <span className={`font-bold ${
                    quotedZone === 'green' ? 'text-zone-green' :
                    quotedZone === 'amber' ? 'text-zone-amber' :
                    'text-zone-red'
                  }`}>{winRateAtQuoted}%</span>
                  {winRateAtQuoted !== undefined && winRateAtQuoted !== winRateAtCurrent && (
                    <span className={`ml-1 ${winRateAtQuoted > winRateAtCurrent ? 'text-zone-green' : 'text-zone-red'}`}>
                      ({winRateAtQuoted > winRateAtCurrent ? '+' : ''}{winRateAtQuoted - winRateAtCurrent}pp vs contracted)
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* DEAL SCORE TILE */}
            <div className="card p-5 flex items-center gap-6">
              <div className="shrink-0">
                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1">Deal Score</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold leading-none ${
                    dealScoreZone === 'green' ? 'text-zone-green' :
                    dealScoreZone === 'amber' ? 'text-zone-amber' :
                    'text-zone-red'
                  }`}>{dealScore}</span>
                  <span className="text-text-muted text-lg">/ 100</span>
                </div>
                <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                  dealScoreZone === 'green' ? 'bg-zone-green-bg text-zone-green' :
                  dealScoreZone === 'amber' ? 'bg-zone-amber-bg text-zone-amber' :
                  'bg-zone-red-bg text-zone-red'
                }`}>{dealScoreLabel}</span>
                <div className="mt-2 flex flex-col gap-0.5">
                  <p className="text-[9px] text-text-muted">
                    Price risk: <span className="font-medium text-text-secondary">{Math.round((winRateAtCurrent / 100) * 0.6 * 100)}</span>
                    <span className="text-text-muted"> (60%)</span>
                  </p>
                  <p className="text-[9px] text-text-muted">
                    Account quality: <span className="font-medium text-text-secondary">{Math.round((eorCompositeScore / 10) * 0.4 * 100)}</span>
                    <span className="text-text-muted"> (40%)</span>
                  </p>
                </div>
              </div>
              <div className="h-16 w-px bg-border-default shrink-0" />
              <div className="flex gap-8">
                <div>
                  <p className="text-[10px] text-text-muted mb-0.5">Win Rate — Contracted Price</p>
                  <p className={`text-2xl font-bold ${
                    winZone === 'green' ? 'text-zone-green' :
                    winZone === 'amber' ? 'text-zone-amber' :
                    'text-zone-red'
                  }`}>{winRateAtCurrent}%</p>
                  <p className="text-[10px] text-text-muted">at €{currentPrice.toFixed(2)}/kg</p>
                </div>
                {quotedPrice && quotedPrice !== currentPrice && winRateAtQuoted !== undefined && (
                  <div>
                    <p className="text-[10px] text-blue-600 font-medium mb-0.5">Win Rate — Quoted Price</p>
                    <p className={`text-2xl font-bold ${
                      quotedZone === 'green' ? 'text-zone-green' :
                      quotedZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{winRateAtQuoted}%</p>
                    <p className="text-[10px] text-blue-500">at €{quotedPrice.toFixed(2)}/kg</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-text-muted mb-0.5">Account Quality Score</p>
                  <div className="flex items-baseline gap-1">
                    <p className={`text-2xl font-bold ${
                      eorZone === 'green' ? 'text-zone-green' :
                      eorZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{eorCompositeScore.toFixed(1)}</p>
                    <span className="text-text-muted text-sm">/ 10</span>
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {eorCompositeScore >= 7 ? 'High Quality' : eorCompositeScore >= 5 ? 'Medium Quality' : 'Low Quality'}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 1 — Win Probability */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Win Probability Analysis</span>
                <div className="h-px flex-1 bg-border-default" />
              </div>
              <div className="flex gap-6" style={{ minHeight: 320 }}>
                {/* Chart card (65%) */}
                <div className="card flex-1 p-4" style={{ flexBasis: '65%' }}>
                  <h2 className="text-sm font-semibold text-text-primary mb-3">
                    Win Probability — {products.find(p => p.id === productId)?.name ?? productId}
                  </h2>
                  <div style={{ height: '280px' }}>
                    <WinProbabilityCurve data={winLossData} currentPrice={currentPrice} quotedPrice={quotedPrice} />
                  </div>
                  <WinLossLegend optimalPrice={winLossData.optimalPrice} currentPrice={currentPrice} quotedPrice={quotedPrice} />
                </div>

                {/* Insight panel (35%) */}
                <div className="card p-5 flex flex-col gap-4" style={{ flexBasis: '35%' }}>
                  <h2 className="text-sm font-semibold text-text-primary">Price Intelligence</h2>

                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Optimal Price</p>
                    <p className="text-xl font-bold text-zone-green">€{winLossData.optimalPrice.toFixed(2)}/kg</p>
                    <p className="text-[10px] text-zone-green font-medium mt-0.5">{winRateAtOptimal}% win rate</p>
                    <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                      Highest price before win rate drops below the safe zone (≥65%)
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Gap to Optimal</p>
                    <p className={`text-lg font-semibold ${gapToOptimal > 0 ? 'text-zone-amber' : 'text-zone-green'}`}>
                      {gapToOptimal > 0 ? '+' : ''}€{gapToOptimal.toFixed(2)}/kg
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {gapToOptimal > 0 ? 'Current price below optimal — margin upside available' : 'Current price at or above optimal'}
                    </p>
                  </div>

                  {(segmentFloor || segmentTarget) && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Segment Thresholds</p>
                      {segmentFloor && (
                        <div className="flex justify-between items-center text-[10px] mb-0.5">
                          <span className="text-text-muted">Floor</span>
                          <span className="font-semibold text-zone-red">€{segmentFloor.toFixed(2)}/kg</span>
                        </div>
                      )}
                      {segmentTarget && (
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-text-muted">Target</span>
                          <span className="font-semibold text-zone-amber">€{segmentTarget.toFixed(2)}/kg</span>
                        </div>
                      )}
                      {segmentTarget && (
                        <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                          Above target = cliff risk for {account?.segment ?? 'this segment'}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Cliff Zone</p>
                    <p className="text-sm font-semibold text-zone-red">€{winLossData.cliffMin.toFixed(2)} – €{winLossData.cliffMax.toFixed(2)}/kg</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Win rate drops from ~54% → 28% above this range
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted mb-0.5">Win Rate — Contracted Price</p>
                    <p className={`text-xl font-bold ${
                      winZone === 'green' ? 'text-zone-green' :
                      winZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{winRateAtCurrent}%</p>
                    <p className="text-xs text-text-muted mt-0.5">at €{currentPrice.toFixed(2)}/kg</p>
                    <p className={`text-xs font-medium mt-1 ${
                      winZone === 'green' ? 'text-zone-green' :
                      winZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{winZoneLabel}</p>
                  </div>

                  {quotedPrice && quotedPrice !== currentPrice && winRateAtQuoted !== undefined && (
                    <div className="border border-blue-200 bg-blue-50 rounded-lg px-3 py-2.5">
                      <p className="text-xs text-blue-600 font-medium mb-0.5">Win Rate — CPQ Quoted Price</p>
                      <p className={`text-xl font-bold ${
                        quotedZone === 'green' ? 'text-zone-green' :
                        quotedZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{winRateAtQuoted}%</p>
                      <p className="text-xs text-blue-500 mt-0.5">at €{quotedPrice.toFixed(2)}/kg</p>
                    </div>
                  )}

                  <div className="text-xs text-text-muted leading-relaxed">
                    Based on {winLossData.historicalQuotes.length} historical quotes.{' '}
                    <span className="text-zone-green font-medium">{wonCount} won</span>,{' '}
                    <span className="text-zone-red font-medium">{lostCount} lost</span>.
                  </div>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border-default" />
              <span className="text-xs font-semibold text-pwc-orange uppercase tracking-wide px-2">Deal Closability</span>
              <div className="h-px flex-1 bg-border-default" />
            </div>

            {/* SECTION 2 — Account Quality */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Account Quality</span>
                <div className="h-px flex-1 bg-border-default" />
              </div>
              <div className="flex gap-6">
                {/* Left: composite score + dimension bars (45%) */}
                <div className="flex flex-col gap-4" style={{ flexBasis: '45%' }}>
                  <div className="card p-5">
                    <p className="text-xs text-text-muted mb-1">Account Quality Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold ${
                        eorZone === 'green' ? 'text-zone-green' :
                        eorZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{eorCompositeScore.toFixed(1)}</span>
                      <span className="text-text-muted text-lg">/ 10</span>
                    </div>
                    <span className={`mt-2 inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                      eorZone === 'green' ? 'bg-zone-green-bg text-zone-green' :
                      eorZone === 'amber' ? 'bg-zone-amber-bg text-zone-amber' :
                      'bg-zone-red-bg text-zone-red'
                    }`}>
                      {eorCompositeScore >= 7 ? 'High Quality' : eorCompositeScore >= 5 ? 'Medium Quality' : 'Low Quality'}
                    </span>
                    <p className="text-xs text-text-muted mt-2">
                      {accounts.find(a => a.id === accountId)?.name ?? accountId}
                    </p>
                  </div>

                  {isFallback && (
                    <div className="px-3 py-2 bg-page-bg border border-border-default rounded-lg text-xs text-text-muted">
                      Showing Bakker Klaas data (no EoR data for selected account)
                    </div>
                  )}

                  <div className="card p-4">
                    <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">Dimension Breakdown</h3>
                    <EoRDimensions dimensions={eorData.dimensions} />
                  </div>
                </div>

                {/* Right: sortable account comparison table (55%) */}
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
            </div>

          </div>
        </FadeWrapper>
      )}

      <ExplainButton
        screen="deal-intelligence"
        accountId={activeAccountId}
        productId={activeProductId}
        keyMetrics={keyMetrics}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
        className="right-[124px]"
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-white border border-border-default text-text-primary rounded-full shadow-lg hover:bg-page-bg transition-colors text-sm font-medium"
      >
        <MessageSquare size={15} className="text-pwc-orange" />
        Ask
      </button>

      <ContextualChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        screen="deal-intelligence"
        accountId={activeAccountId}
        productId={activeProductId}
        accountName={accountName}
        productName={productName}
        keyMetrics={keyMetrics}
      />
    </div>
  )
}

export default function DealIntelligencePage() {
  return (
    <Suspense fallback={null}>
      <DealIntelligenceContent />
    </Suspense>
  )
}
