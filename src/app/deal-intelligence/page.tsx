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

function WinLossLegend({ optimalPrice, currentPrice, contractedPrice }: { optimalPrice: number; currentPrice?: number; contractedPrice?: number }) {
  const hasSimulated = currentPrice && contractedPrice && Math.abs(currentPrice - contractedPrice) > 0.005
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
      <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
        <span className="w-5 border-t-2 border-dashed border-[#6d6e71] inline-block" />
        Contracted price
      </span>
      {hasSimulated && (
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted">
          <span className="w-5 border-t-2 border-dashed border-blue-500 inline-block" style={{ borderStyle: 'dashed' }} />
          Simulated price
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
  const [priceAdjustPct, setPriceAdjustPct] = useState(0)
  const [diPriceInputStr, setDiPriceInputStr] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const quotedPriceParam = searchParams.get('quotedPrice')
  const quotedPrice = quotedPriceParam ? parseFloat(quotedPriceParam) : undefined

  const productId = activeProductId ?? 'milk-couverture'
  const winLossData = getWinLossForProduct(productId) ?? getWinLossForProduct('milk-couverture')!

  const account = accounts.find(a => a.id === activeAccountId)
  const contractedPrice = account?.price ?? winLossData.optimalPrice

  // Reset adjustment when account/product changes
  useEffect(() => {
    setPriceAdjustPct(0)
    setDiPriceInputStr('')
  }, [activeAccountId, activeProductId])

  // Initialize from Deal Pricing quoted price if present
  useEffect(() => {
    if (quotedPrice && quotedPrice !== contractedPrice) {
      const pct = ((quotedPrice / contractedPrice) - 1) * 100
      setPriceAdjustPct(parseFloat(Math.max(-15, Math.min(25, pct)).toFixed(1)))
      setDiPriceInputStr(quotedPrice.toFixed(2))
    }
  }, [quotedPrice, contractedPrice])

  const currentPrice = contractedPrice * (1 + priceAdjustPct / 100)
  const hasAdjustment = Math.abs(priceAdjustPct) > 0.05

  const winRateAtCurrent = Math.round(interpolateWinRate(winLossData.curve, currentPrice))
  const winRateAtOptimal = Math.round(interpolateWinRate(winLossData.curve, winLossData.optimalPrice))
  const winRateAtContracted = Math.round(interpolateWinRate(winLossData.curve, contractedPrice))
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
    ? 'Safe zone. Strong win probability'
    : winZone === 'amber'
    ? 'Caution: approaching cliff'
    : 'Danger: high deal loss risk'

  const keyMetrics = {
    winRateAtCurrentPrice: winRateAtCurrent,
    accountQualityScore: eorCompositeScore,
    dealScore,
    cliffMin: winLossData.cliffMin,
    cliffMax: winLossData.cliffMax,
    optimalPrice: winLossData.optimalPrice,
    currentPrice,
    weakestAccountQualityDimension: [...eorData.dimensions].sort((a, b) => a.score - b.score)[0]?.name,
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

            {/* DEAL ANALYSIS — deal score left, price simulator right, single row */}
            <div className="card p-4">
              <div className="flex items-center gap-5">
                {/* Deal score — left */}
                <div className="shrink-0 min-w-[145px]">
                  <p className="text-[10px] font-semibold text-text-secondary mb-1">Deal score</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-bold leading-none ${
                      dealScoreZone === 'green' ? 'text-zone-green' :
                      dealScoreZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{dealScore}</span>
                    <span className="text-text-muted text-sm">/ 100</span>
                  </div>
                  <span className={`mt-1.5 inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                    dealScoreZone === 'green' ? 'bg-zone-green-bg text-zone-green' :
                    dealScoreZone === 'amber' ? 'bg-zone-amber-bg text-zone-amber' :
                    'bg-zone-red-bg text-zone-red'
                  }`}>{dealScoreLabel}</span>
                </div>

                <div className="h-14 w-px bg-border-default shrink-0" />

                {/* Score breakdown */}
                <div className="flex gap-5 shrink-0">
                  <div>
                    <p className="text-[10px] text-text-muted mb-0.5">Price risk <span className="opacity-60">(60%)</span></p>
                    <p className={`text-lg font-bold ${
                      winZone === 'green' ? 'text-zone-green' :
                      winZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{Math.round((winRateAtCurrent / 100) * 0.6 * 100)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted mb-0.5">Account <span className="opacity-60">(40%)</span></p>
                    <p className={`text-lg font-bold ${
                      eorZone === 'green' ? 'text-zone-green' :
                      eorZone === 'amber' ? 'text-zone-amber' :
                      'text-zone-red'
                    }`}>{Math.round((eorCompositeScore / 10) * 0.4 * 100)}</p>
                  </div>
                </div>

                <div className="h-14 w-px bg-border-default shrink-0" />

                {/* Price simulator — right side */}
                <div className="flex-1 flex flex-col gap-1.5" style={{ minWidth: 0 }}>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-text-muted font-medium">Price simulator</p>
                    {hasAdjustment && (
                      <button
                        onClick={() => { setPriceAdjustPct(0); setDiPriceInputStr('') }}
                        className="text-[9px] text-pwc-orange hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={-15}
                      max={25}
                      step={0.5}
                      value={priceAdjustPct}
                      onChange={e => {
                        const pct = parseFloat(e.target.value)
                        setPriceAdjustPct(pct)
                        setDiPriceInputStr((contractedPrice * (1 + pct / 100)).toFixed(2))
                      }}
                      className="flex-1 slider-slim"
                      style={{ minWidth: 0 }}
                    />
                    <div className="flex items-center gap-0.5 border border-border-default rounded px-1.5 py-0.5 bg-page-bg shrink-0">
                      <span className="text-[9px] text-text-muted">€</span>
                      <input
                        type="number"
                        step="0.01"
                        value={diPriceInputStr || currentPrice.toFixed(2)}
                        onChange={e => setDiPriceInputStr(e.target.value)}
                        onBlur={() => {
                          const parsed = parseFloat(diPriceInputStr)
                          if (!isNaN(parsed) && parsed > 0) {
                            const newPct = Math.max(-15, Math.min(25, ((parsed / contractedPrice) - 1) * 100))
                            setPriceAdjustPct(parseFloat(newPct.toFixed(1)))
                            setDiPriceInputStr((contractedPrice * (1 + newPct / 100)).toFixed(2))
                          } else {
                            setDiPriceInputStr(currentPrice.toFixed(2))
                          }
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                        className="w-14 text-xs font-medium border-0 bg-transparent text-right focus:outline-none"
                      />
                      <span className="text-[9px] text-text-muted">/kg</span>
                    </div>
                    <span className={`text-[10px] font-semibold shrink-0 w-10 text-right ${
                      priceAdjustPct < 0 ? 'text-zone-red' : priceAdjustPct > 0 ? 'text-zone-green' : 'text-text-primary'
                    }`}>
                      {priceAdjustPct >= 0 ? '+' : ''}{priceAdjustPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {segmentFloor && (
                      <button
                        onClick={() => {
                          const pct = Math.max(-15, Math.min(25, ((segmentFloor / contractedPrice) - 1) * 100))
                          setPriceAdjustPct(parseFloat(pct.toFixed(1)))
                          setDiPriceInputStr(segmentFloor.toFixed(2))
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded border border-zone-red/40 text-zone-red hover:bg-zone-red/10 transition-colors"
                      >
                        Floor
                      </button>
                    )}
                    {segmentTarget && (
                      <button
                        onClick={() => {
                          const pct = Math.max(-15, Math.min(25, ((segmentTarget / contractedPrice) - 1) * 100))
                          setPriceAdjustPct(parseFloat(pct.toFixed(1)))
                          setDiPriceInputStr(segmentTarget.toFixed(2))
                        }}
                        className="text-[9px] px-1.5 py-0.5 rounded border border-zone-green/40 text-zone-green hover:bg-zone-green/10 transition-colors"
                      >
                        Target
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const pct = Math.max(-15, Math.min(25, ((winLossData.optimalPrice / contractedPrice) - 1) * 100))
                        setPriceAdjustPct(parseFloat(pct.toFixed(1)))
                        setDiPriceInputStr(winLossData.optimalPrice.toFixed(2))
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded border border-pwc-orange/40 text-pwc-orange hover:bg-pwc-orange/10 transition-colors"
                    >
                      Optimal
                    </button>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-[9px] text-text-muted">Win rate:</span>
                      <span className={`text-sm font-bold ${
                        winZone === 'green' ? 'text-zone-green' :
                        winZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{winRateAtCurrent}%</span>
                      {hasAdjustment && (
                        <span className={`text-[9px] font-medium ${
                          winRateAtCurrent > winRateAtContracted ? 'text-zone-green' :
                          winRateAtCurrent < winRateAtContracted ? 'text-zone-red' :
                          'text-text-muted'
                        }`}>
                          ({winRateAtCurrent > winRateAtContracted ? '+' : ''}{winRateAtCurrent - winRateAtContracted}pp)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1 - Win Probability */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-text-secondary">Win probability analysis</span>
                <div className="h-px flex-1 bg-border-default" />
              </div>
              <div className="flex gap-6" style={{ minHeight: 320 }}>
                {/* Chart card (65%) */}
                <div className="card flex-1 p-4" style={{ flexBasis: '65%' }}>
                  <h2 className="text-sm font-semibold text-text-primary mb-3">
                    Win Probability: {products.find(p => p.id === productId)?.name ?? productId}
                  </h2>
                  <div style={{ height: '280px' }}>
                    <WinProbabilityCurve data={winLossData} currentPrice={currentPrice} contractedPrice={contractedPrice} />
                  </div>
                  <WinLossLegend optimalPrice={winLossData.optimalPrice} currentPrice={currentPrice} contractedPrice={contractedPrice} />
                </div>

                {/* Insight panel (35%) */}
                <div className="card p-5 flex flex-col" style={{ flexBasis: '35%' }}>
                  <h2 className="text-sm font-semibold text-text-primary pb-3 mb-3 border-b border-border-default">Price Intelligence</h2>

                  {/* Optimal + Gap */}
                  <div className="grid grid-cols-2 gap-3 pb-3 mb-3 border-b border-border-default">
                    <div>
                      <p className="text-[10px] text-text-muted font-medium mb-0.5">Optimal Price</p>
                      <p className="text-lg font-bold text-zone-green">€{winLossData.optimalPrice.toFixed(2)}/kg</p>
                      <p className="text-[10px] text-zone-green font-medium mt-0.5">{winRateAtOptimal}% win rate</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-medium mb-0.5">Gap to Optimal</p>
                      <p className={`text-lg font-semibold ${gapToOptimal > 0 ? 'text-zone-amber' : 'text-zone-green'}`}>
                        {gapToOptimal > 0 ? '+' : ''}€{gapToOptimal.toFixed(2)}/kg
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {gapToOptimal > 0 ? 'Margin upside available' : 'At or above optimal'}
                      </p>
                    </div>
                  </div>

                  {/* Segment thresholds */}
                  {(segmentFloor || segmentTarget) && (
                    <div className="pb-3 mb-3 border-b border-border-default">
                      <p className="text-[10px] text-text-muted font-medium mb-2">Segment Thresholds</p>
                      {segmentFloor && (
                        <div className="flex justify-between items-center text-[10px] mb-1">
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
                    </div>
                  )}

                  {/* Cliff zone + current status */}
                  <div className="grid grid-cols-2 gap-3 pb-3 mb-3 border-b border-border-default">
                    <div>
                      <p className="text-[10px] text-text-muted font-medium mb-0.5">Cliff Zone</p>
                      <p className="text-sm font-semibold text-zone-red">€{winLossData.cliffMin.toFixed(2)} – €{winLossData.cliffMax.toFixed(2)}</p>
                      <p className="text-[9px] text-text-muted mt-0.5">Win rate drops ~54% → 28%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted font-medium mb-0.5">{hasAdjustment ? 'Simulated' : 'Current'} Price</p>
                      <p className={`text-sm font-bold ${
                        winZone === 'green' ? 'text-zone-green' :
                        winZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{winRateAtCurrent}% win rate</p>
                      <p className="text-[9px] text-text-muted mt-0.5">at €{currentPrice.toFixed(2)}/kg</p>
                      <p className={`text-[9px] font-medium mt-0.5 ${
                        winZone === 'green' ? 'text-zone-green' :
                        winZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{winZoneLabel}</p>
                    </div>
                  </div>

                  {/* Deal Pricing quoted price */}
                  {quotedPrice && quotedPrice !== contractedPrice && winRateAtQuoted !== undefined && (
                    <div className="border border-blue-200 bg-blue-50 rounded-lg px-3 py-2 mb-3">
                      <p className="text-[10px] text-blue-600 font-medium mb-0.5">Deal Pricing quoted price</p>
                      <p className={`text-sm font-bold ${
                        quotedZone === 'green' ? 'text-zone-green' :
                        quotedZone === 'amber' ? 'text-zone-amber' :
                        'text-zone-red'
                      }`}>{winRateAtQuoted}% win rate</p>
                      <p className="text-[9px] text-blue-500 mt-0.5">at €{quotedPrice.toFixed(2)}/kg</p>
                    </div>
                  )}

                  {/* Data basis footer */}
                  <div className="text-[9px] text-text-muted leading-relaxed bg-page-bg rounded px-3 py-2 mt-auto">
                    {winLossData.historicalQuotes.length} historical quotes:{' '}
                    <span className="text-zone-green font-medium">{wonCount} won</span>,{' '}
                    <span className="text-zone-red font-medium">{lostCount} lost</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border-default" />
              <span className="text-xs font-semibold text-pwc-orange px-2">Deal closability</span>
              <div className="h-px flex-1 bg-border-default" />
            </div>

            {/* SECTION 2 - Account Quality */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-text-secondary">Account quality</span>
                <div className="h-px flex-1 bg-border-default" />
              </div>
              <div className="flex gap-6">
                {/* Left: composite score + dimension bars (45%) */}
                <div className="flex flex-col gap-4" style={{ flexBasis: '45%' }}>
                  <div className="card p-5">
                    <p className="text-xs text-text-muted mb-1">Account quality score</p>
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
                      {eorCompositeScore >= 7 ? 'High quality' : eorCompositeScore >= 5 ? 'Medium quality' : 'Low quality'}
                    </span>
                    <p className="text-xs text-text-muted mt-2">
                      {accounts.find(a => a.id === accountId)?.name ?? accountId}
                    </p>
                  </div>

                  {isFallback && (
                    <div className="px-3 py-2 bg-page-bg border border-border-default rounded-lg text-xs text-text-muted">
                      Showing Bakker Klaas data (no Account Quality data for selected account)
                    </div>
                  )}

                  <div className="card p-4">
                    <h3 className="text-xs font-semibold text-text-secondary mb-4">Dimension breakdown</h3>
                    <EoRDimensions dimensions={eorData.dimensions} />
                  </div>
                </div>

                {/* Right: sortable account comparison table (55%) */}
                <div className="card p-4 overflow-y-auto" style={{ flexBasis: '55%' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-text-secondary">Account comparison</h3>
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
