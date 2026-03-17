'use client'

import { useState, useMemo } from 'react'
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { PriceBand } from '@/components/cpq/PriceBand'
import { MarginBridge } from '@/components/cpq/MarginBridge'
import { EscalationBanner, type EscalationLevel } from '@/components/cpq/EscalationBanner'
import { ScenarioComparison } from '@/components/cpq/ScenarioComparison'
import { WinProbSignal } from '@/components/cpq/WinProbSignal'
import { EoRSignal } from '@/components/cpq/EoRSignal'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import quotesData from '../../../data/quotes.json'

function getEscalationLevel(discountPct: number, thresholds: { rep: number; manager: number; director: number }): EscalationLevel {
  if (discountPct >= thresholds.director) return 'director'
  if (discountPct >= thresholds.manager) return 'manager'
  if (discountPct >= thresholds.rep) return 'rep'
  return 'none'
}

export default function CPQPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [dealDiscountPct, setDealDiscountPct] = useState(0)
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)

  const accountId = activeAccountId ?? 'baker-klaas'
  const productId = activeProductId ?? 'milk-couverture'

  const account = accounts.find(a => a.id === accountId)
  const product = products.find(p => p.id === productId)
  const quoteBase = (quotesData as Record<string, unknown>[]).find(q => q.accountId === accountId && q.productId === productId)
    ?? (quotesData as Record<string, unknown>[])[0]

  const listPrice = product?.listPrice ?? 5.80
  const tierDiscountPct = (quoteBase?.tierDiscount as number | undefined) ?? 5
  const thresholds = product?.escalationThresholds ?? { rep: 5, manager: 10, director: 15 }

  const netPrice = useMemo(() => {
    const afterTier = listPrice * (1 - tierDiscountPct / 100)
    // dealDiscountPct > 0 means discount (reduce); < 0 means uplift (increase)
    return afterTier * (1 - dealDiscountPct / 100)
  }, [listPrice, tierDiscountPct, dealDiscountPct])

  const escalationLevel = getEscalationLevel(dealDiscountPct, thresholds)

  const floorPrice = account?.floor ?? 4.57
  const targetPrice = account?.target ?? 4.85

  const scenarios = [
    {
      label: 'Grant 5% discount',
      discountPct: -5,
      netPrice: listPrice * (1 - tierDiscountPct / 100) * 1.05,
      grossMarginPct: 14.1,
      zone: 'red' as const,
      verdict: 'Below floor — margin critical, escalation required',
    },
    {
      label: 'Hold flat',
      discountPct: 0,
      netPrice: listPrice * (1 - tierDiscountPct / 100),
      grossMarginPct: 18.3,
      zone: 'amber' as const,
      verdict: 'Holds position but leaves pricing gap vs segment',
    },
    {
      label: 'Propose +4% uplift',
      discountPct: 4,
      netPrice: listPrice * (1 - tierDiscountPct / 100) * 0.96,
      grossMarginPct: 19.8,
      zone: 'amber' as const,
      verdict: 'Defensible step toward fair pricing',
      isRecommended: true,
    },
  ]

  // Use baker-klaas scenario 1 exact numbers when active
  if (accountId === 'baker-klaas' && productId === 'milk-couverture') {
    scenarios[0].netPrice = 3.99
    scenarios[1].netPrice = 4.20
    scenarios[2].netPrice = 4.37
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {/* Quote header */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {account?.name ?? 'Select account'} — {product?.name ?? 'Select product'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {account?.segment} · Vol {(account?.volume ?? 0).toLocaleString()} kg/mo
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
              escalationLevel === 'none' ? 'bg-zone-green-bg text-zone-green' :
              escalationLevel === 'rep' ? 'bg-zone-amber-bg text-zone-amber' :
              'bg-zone-red-bg text-zone-red'
            }`}>
              €{netPrice.toFixed(2)}/kg
            </div>
          </div>

          {/* Price stack */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">List price</span>
              <span className="font-medium">€{listPrice.toFixed(2)}/kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1">
                Tier discount
                <span className="text-[10px] bg-page-bg border border-border-default px-1.5 py-0.5 rounded text-text-muted">
                  {account?.volume?.toLocaleString()} kg/mo
                </span>
              </span>
              <span className="text-zone-red font-medium">−{tierDiscountPct}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Deal discount / uplift</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={-10}
                  max={20}
                  step={0.5}
                  value={dealDiscountPct}
                  onChange={e => setDealDiscountPct(parseFloat(e.target.value))}
                  className="w-32 accent-pwc-orange"
                />
                <span className={`w-14 text-right font-medium text-sm ${
                  dealDiscountPct < 0 ? 'text-zone-red' :
                  dealDiscountPct > 0 ? 'text-zone-green' : 'text-text-primary'
                }`}>
                  {dealDiscountPct > 0 ? `+${dealDiscountPct}` : dealDiscountPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Price band */}
          <PriceBand
            listPrice={listPrice}
            floorPrice={floorPrice}
            targetPrice={targetPrice}
            netPrice={netPrice}
          />
        </div>

        {/* Escalation banner */}
        <EscalationBanner level={escalationLevel} discountPct={dealDiscountPct} />

        {/* Margin bridge */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">Margin Bridge</h3>
          <MarginBridge
            listPrice={listPrice}
            tierDiscountPct={tierDiscountPct}
            dealDiscountPct={dealDiscountPct}
            netPrice={netPrice}
          />
        </div>

        {/* Three-scenario comparison */}
        <div className="card p-4">
          <h3 className="text-xs font-semibold text-text-secondary mb-3 uppercase tracking-wide">Scenario Comparison</h3>
          <ScenarioComparison scenarios={scenarios} activeDiscountPct={dealDiscountPct} />
        </div>

        {/* Win Probability + EoR signals */}
        <div className="grid grid-cols-2 gap-4">
          <WinProbSignal productId={productId} currentPrice={netPrice} />
          <EoRSignal accountId={accountId} />
        </div>
      </div>

      <ExplainButton
        screen="cpq"
        accountId={activeAccountId}
        productId={activeProductId}
        keyMetrics={{
          accountId,
          productId,
          listPrice,
          netPrice,
          tierDiscountPct,
          dealDiscountPct,
          escalationLevel,
          floorPrice,
          targetPrice,
        }}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
