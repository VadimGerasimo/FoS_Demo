'use client'

import { useState, useMemo, useEffect } from 'react'
import { accounts, products, getFloor, getTarget, getWaterfallForAccount } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { PriceBand } from '@/components/deal-pricing/PriceBand'
import { MarginBridge } from '@/components/deal-pricing/MarginBridge'
import { EscalationBanner, type EscalationLevel } from '@/components/deal-pricing/EscalationBanner'
import { WinProbSignal } from '@/components/deal-pricing/WinProbSignal'
import { EoRSignal } from '@/components/deal-pricing/EoRSignal'
import { DealContextPanel } from '@/components/deal-pricing/DealContextPanel'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'
import { ContextualChatPanel } from '@/components/chat/ContextualChatPanel'
import { MessageSquare } from 'lucide-react'
import quotesData from '../../../data/quotes.json'

function getEscalationLevel(netPrice: number, floorPrice: number, targetPrice: number): EscalationLevel {
  if (netPrice < floorPrice * 0.95) return 'director'  // >5% below floor
  if (netPrice < floorPrice) return 'manager'           // below floor
  if (netPrice < targetPrice) return 'rep'              // below target, in-band
  return 'none'
}

export default function DealPricingPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [dealDiscountPct, setDealDiscountPct] = useState(0)
  const [priceInputStr, setPriceInputStr] = useState('')
  const [pctInputStr, setPctInputStr] = useState('')
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
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
  const waterfallData = getWaterfallForAccount(accountId, productId) ?? getWaterfallForAccount('baker-klaas', 'milk-couverture')!
  const contractedDiscountLayers = (waterfallData?.layers ?? [])
    .filter(l => l.value < 0 && l.section === 'price' && !l.isSubtotal)

  // Derive actual COGS from waterfall — fixed manufacturing cost, aligned with Waterfall screen
  const nnpLayer = waterfallData?.layers.find(l => l.name === 'Net-Net Price')
  const gmLayer  = waterfallData?.layers.find(l => l.name === 'Gross Margin')
  const waterfallNNP  = nnpLayer?.cumulative ?? listPrice
  const actualCOGS    = waterfallNNP - (gmLayer?.cumulative ?? 0)

  const basePrice = (quoteBase?.currentPrice as number | undefined) ?? account?.price ?? listPrice * (1 - tierDiscountPct / 100)
  const netPrice = useMemo(
    () => basePrice * (1 + dealDiscountPct / 100),
    [basePrice, dealDiscountPct]
  )

  const floorPrice = account ? getFloor(account, productId) : 4.57
  const targetPrice = account ? getTarget(account, productId) : 4.85

  const escalationLevel = getEscalationLevel(netPrice, floorPrice, targetPrice)

  // GM% is dynamic: COGS is fixed from waterfall, price moves with slider
  const grossMarginPct = useMemo(
    () => netPrice > 0 ? Math.max(0, (netPrice - actualCOGS) / netPrice * 100) : 0,
    [netPrice, actualCOGS]
  )

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
      <div className="p-6 pb-20 flex flex-col gap-5">
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
            actualCOGS={actualCOGS}
          />
        )}

        {/* Quote header */}
        <div className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                {account?.name ?? 'Select account'} · {product?.name ?? 'Select product'}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {account?.segment} · Vol {(account?.volume ?? 0).toLocaleString()} kg/mo
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors duration-300 ${
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
              <span className="text-text-secondary">Contracted discounts vs list</span>
              <span className="text-zone-red font-medium">−{((listPrice - basePrice) / listPrice * 100).toFixed(1)}%</span>
            </div>
            {contractedDiscountLayers.map(layer => (
              <div key={layer.name} className="flex items-center justify-between text-xs pl-3 border-l-2 border-zone-red/20 ml-1">
                <span className="text-text-muted">{layer.name}</span>
                <span className="text-text-muted">−€{Math.abs(layer.value).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-1 border-t border-border-default">
              <span className="text-text-secondary font-medium">Contracted base price</span>
              <span className="font-semibold">€{basePrice.toFixed(2)}/kg</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex flex-col">
                Rep adjustment
                <span className="text-[10px] text-text-muted">Allowed: −10% to +20%</span>
              </span>
              <div className="flex flex-col gap-1.5">
                {/* Slider row — matches Deal Intelligence layout */}
                <div className="flex items-center gap-3 justify-end">
                  <input
                    type="range"
                    min={-10}
                    max={20}
                    step={0.5}
                    value={dealDiscountPct}
                    onChange={e => {
                      const pct = parseFloat(e.target.value)
                      setDealDiscountPct(pct)
                      setPriceInputStr((basePrice * (1 + pct / 100)).toFixed(2))
                      setPctInputStr('')
                    }}
                    className="w-32 slider-slim"
                  />
                  <div className="flex items-center gap-0.5 border border-border-default rounded px-1.5 py-0.5 bg-page-bg shrink-0 focus-within:border-pwc-orange">
                    <span className="text-[9px] text-text-muted">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={priceInputStr || netPrice.toFixed(2)}
                      onChange={e => setPriceInputStr(e.target.value)}
                      onBlur={() => {
                        const parsed = parseFloat(priceInputStr)
                        if (!isNaN(parsed) && parsed > 0) {
                          const newPct = Math.max(-10, Math.min(20, ((parsed / basePrice) - 1) * 100))
                          setDealDiscountPct(parseFloat(newPct.toFixed(1)))
                          setPriceInputStr((basePrice * (1 + newPct / 100)).toFixed(2))
                        } else {
                          setPriceInputStr(netPrice.toFixed(2))
                        }
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                      className="w-14 text-xs font-medium border-0 bg-transparent text-right focus:outline-none"
                    />
                    <span className="text-[9px] text-text-muted">/kg</span>
                  </div>
                  <div className="flex items-center shrink-0 border border-border-default rounded px-1.5 py-0.5 bg-page-bg focus-within:border-pwc-orange">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={pctInputStr !== '' ? pctInputStr : (dealDiscountPct > 0 ? `+${dealDiscountPct}` : `${dealDiscountPct}`)}
                      onFocus={e => {
                        setPctInputStr(String(dealDiscountPct))
                        requestAnimationFrame(() => e.target.select())
                      }}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '' || v === '-' || v === '+' || /^[+-]?\d*\.?\d*$/.test(v)) {
                          setPctInputStr(v)
                        }
                      }}
                      onBlur={() => {
                        const parsed = parseFloat(pctInputStr)
                        if (!isNaN(parsed)) {
                          const clamped = Math.max(-10, Math.min(20, parsed))
                          setDealDiscountPct(parseFloat(clamped.toFixed(1)))
                          setPriceInputStr((basePrice * (1 + clamped / 100)).toFixed(2))
                        }
                        setPctInputStr('')
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                      className={`w-10 text-xs font-semibold border-0 bg-transparent text-right focus:outline-none ${
                        dealDiscountPct < 0 ? 'text-zone-red' : dealDiscountPct > 0 ? 'text-zone-green' : 'text-text-primary'
                      }`}
                    />
                    <span className="text-[9px] text-text-muted">%</span>
                  </div>
                </div>
                {/* Snap-to buttons + headroom — full width, buttons left, headroom right */}
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const pct = Math.max(-10, Math.min(20, ((floorPrice / basePrice) - 1) * 100))
                        setDealDiscountPct(parseFloat(pct.toFixed(1)))
                        setPriceInputStr(floorPrice.toFixed(2))
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded border border-zone-red/40 text-zone-red hover:bg-zone-red/10 transition-colors"
                    >
                      Floor
                    </button>
                    <button
                      onClick={() => {
                        const pct = Math.max(-10, Math.min(20, ((targetPrice / basePrice) - 1) * 100))
                        setDealDiscountPct(parseFloat(pct.toFixed(1)))
                        setPriceInputStr(targetPrice.toFixed(2))
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded border border-zone-green/40 text-zone-green hover:bg-zone-green/10 transition-colors"
                    >
                      Target
                    </button>
                  </div>
                  {/* Headroom label — pushed right */}
                  <span className={`text-[10px] ml-auto font-medium ${
                    escalationLevel === 'manager' || escalationLevel === 'director' ? 'text-zone-red' :
                    escalationLevel === 'rep' ? 'text-zone-amber' : 'text-text-muted'
                  }`}>
                    {escalationLevel === 'none' && netPrice < targetPrice * 1.15
                      ? `€${(netPrice - targetPrice).toFixed(2)} vs target`
                      : escalationLevel !== 'none'
                      ? `€${(netPrice - floorPrice).toFixed(2)} vs floor`
                      : '\u00A0'}
                  </span>
                </div>
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
          <h3 className="text-xs font-semibold text-text-secondary mb-3">Margin bridge</h3>
          <MarginBridge
            listPrice={listPrice}
            basePrice={basePrice}
            dealDiscountPct={dealDiscountPct}
            netPrice={netPrice}
            grossMarginPct={grossMarginPct}
            actualCOGS={actualCOGS}
          />
        </div>
      </div>
      </FadeWrapper>
      )}

      {(() => {
        const keyMetrics = {
          accountId,
          productId,
          listPrice,
          netPrice,
          tierDiscountPct,
          dealDiscountPct,
          escalationLevel,
          floorPrice,
          targetPrice,
          grossMarginPct: grossMarginPct,
        }
        return (
          <>
            <ExplainButton
              screen="deal-pricing"
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
              screen="deal-pricing"
              accountId={activeAccountId}
              productId={activeProductId}
              accountName={accounts.find(a => a.id === activeAccountId)?.name ?? null}
              productName={products.find(p => p.id === activeProductId)?.name ?? null}
              keyMetrics={keyMetrics}
            />
          </>
        )
      })()}
    </div>
  )
}
