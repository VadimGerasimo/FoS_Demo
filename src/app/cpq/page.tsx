'use client'

import { useState, useMemo, useEffect } from 'react'
import { accounts, products, getFloor, getTarget } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { PriceBand } from '@/components/cpq/PriceBand'
import { MarginBridge } from '@/components/cpq/MarginBridge'
import { EscalationBanner, type EscalationLevel } from '@/components/cpq/EscalationBanner'
import { WinProbSignal } from '@/components/cpq/WinProbSignal'
import { EoRSignal } from '@/components/cpq/EoRSignal'
import { DealContextPanel } from '@/components/cpq/DealContextPanel'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'
import quotesData from '../../../data/quotes.json'

function getEscalationLevel(netPrice: number, floorPrice: number, targetPrice: number): EscalationLevel {
  if (netPrice < floorPrice * 0.95) return 'director'  // >5% below floor
  if (netPrice < floorPrice) return 'manager'           // below floor
  if (netPrice < targetPrice) return 'rep'              // below target, in-band
  return 'none'
}

export default function CPQPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [dealDiscountPct, setDealDiscountPct] = useState(0)
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const accountId = activeAccountId ?? 'baker-klaas'
  const productId = activeProductId ?? 'milk-couverture'

  const account = accounts.find(a => a.id === accountId)
  const product = products.find(p => p.id === productId)
  const quoteBase = (quotesData as Record<string, unknown>[]).find(q => q.accountId === accountId && q.productId === productId)
    ?? (quotesData as Record<string, unknown>[])[0]

  const listPrice = product?.listPrice ?? 5.80
  const tierDiscountPct = (quoteBase?.tierDiscount as number | undefined) ?? 5
  const thresholds = product?.escalationThresholds ?? { rep: 5, manager: 10, director: 15 }

  const basePrice = (quoteBase?.currentPrice as number | undefined) ?? account?.price ?? listPrice * (1 - tierDiscountPct / 100)
  const netPrice = useMemo(
    () => basePrice * (1 + dealDiscountPct / 100),
    [basePrice, dealDiscountPct]
  )

  const floorPrice = account ? getFloor(account, productId) : 4.57
  const targetPrice = account ? getTarget(account, productId) : 4.85

  const escalationLevel = getEscalationLevel(netPrice, floorPrice, targetPrice)

  const approxGrossMarginPct = useMemo(() => {
    if (dealDiscountPct <= -5) return 14.1
    if (dealDiscountPct >= 4) return 19.8
    return parseFloat((18.3 + ((dealDiscountPct / 4) * (19.8 - 18.3))).toFixed(1))
  }, [dealDiscountPct])

  // Floating slider value label position: ((value - min) / range) * 100
  const sliderLabelLeft = ((dealDiscountPct - (-10)) / 30) * 100

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {!mounted ? (
        <div className="flex-1 overflow-y-auto p-6">
          <ChartSkeleton rows={3} height="h-32" />
        </div>
      ) : (
      <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}-${activeProductId ?? 'none'}`} className="flex-1 overflow-y-auto">
      <div className="p-6 flex flex-col gap-5">
        {/* Deal Context Panel */}
        {account && (
          <DealContextPanel
            accountName={account.name}
            segment={account.segment}
            volume={account.volume}
            lastQuotedPrice={(quoteBase?.currentPrice as number | undefined) ?? account.price}
            listPrice={listPrice}
            floorPrice={floorPrice}
            targetPrice={targetPrice}
            currentPrice={netPrice}
            tierDiscountPct={tierDiscountPct}
          />
        )}

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
              <span className="text-text-secondary">Current deal price</span>
              <span className="font-medium">€{basePrice.toFixed(2)}/kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-1">
                Tier discount (baked in)
                <span className="text-[10px] bg-page-bg border border-border-default px-1.5 py-0.5 rounded text-text-muted">
                  −{tierDiscountPct}% vs list (€{listPrice.toFixed(2)}/kg)
                </span>
              </span>
              <span className="text-text-muted font-medium">−{tierDiscountPct}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex flex-col">
                Rep adjustment
                <span className="text-[10px] text-text-muted">Allowed: −10% to +20%</span>
              </span>
              <div className="flex flex-col items-end gap-1">
                {/* Floating value above thumb */}
                <div className="relative w-32 h-4">
                  <span
                    className={`absolute text-xs font-semibold -translate-x-1/2 transition-all duration-150 ${
                      dealDiscountPct < 0 ? 'text-zone-red' : dealDiscountPct > 0 ? 'text-zone-green' : 'text-text-primary'
                    }`}
                    style={{ left: `${sliderLabelLeft}%` }}
                  >
                    {dealDiscountPct > 0 ? `+${dealDiscountPct}` : dealDiscountPct}%
                  </span>
                </div>
                {/* Slider */}
                <input
                  type="range"
                  min={-10}
                  max={20}
                  step={0.5}
                  value={dealDiscountPct}
                  onChange={e => setDealDiscountPct(parseFloat(e.target.value))}
                  className="w-32 accent-pwc-orange"
                />
                {/* Headroom label */}
                {escalationLevel === 'none' && netPrice < targetPrice * 1.15 && (
                  <p className="text-[10px] text-text-muted mt-0.5 text-right w-32">
                    €{(netPrice - targetPrice).toFixed(2)} vs target
                  </p>
                )}
                {escalationLevel === 'rep' && (
                  <p className="text-[10px] text-zone-amber mt-0.5 text-right w-32">
                    €{(netPrice - floorPrice).toFixed(2)} vs floor
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Rep adjustment summary */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-default mb-4">
            <span className="text-text-muted">Rep adjustment</span>
            <span className="font-semibold text-text-primary">
              <span className={dealDiscountPct < 0 ? 'text-zone-red' : dealDiscountPct > 0 ? 'text-zone-green' : 'text-text-primary'}>
                {dealDiscountPct >= 0 ? '+' : ''}{dealDiscountPct}%
              </span>
            </span>
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

        {/* Win Probability + EoR signals — above scenarios for visibility */}
        <div className="grid grid-cols-2 gap-4">
          <WinProbSignal productId={productId} currentPrice={netPrice} />
          <EoRSignal accountId={accountId} />
        </div>

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
      </div>
      </FadeWrapper>
      )}

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
          grossMarginPct: approxGrossMarginPct,
        }}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
