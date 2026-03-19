'use client'

import { useState, useEffect } from 'react'
import { accounts, products, getWaterfallForAccount, getAccount } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { WaterfallChart } from '@/components/charts/WaterfallChart'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { AlertTriangle, MessageSquare } from 'lucide-react'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'
import { ContextualChatPanel } from '@/components/chat/ContextualChatPanel'

export default function WaterfallPage() {
  const { activeAccountId, activeProductId } = useAppContext()
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

  const waterfallData =
    getWaterfallForAccount(accountId, productId) ??
    getWaterfallForAccount('baker-klaas', 'milk-couverture')!
  const isFallback = !getWaterfallForAccount(accountId, productId)

  const layers = waterfallData.layers
  const listPrice      = layers[0]?.cumulative ?? 0
  const netNetLayer    = layers.find(l => l.name === 'Net-Net Price')
  const grossMarginLayer = layers.find(l => l.name === 'Gross Margin')
  const netMarginLayer = layers.find(l => l.name === 'Net Margin')

  const netNetPrice    = netNetLayer?.cumulative ?? 0
  const grossMargin    = grossMarginLayer?.cumulative ?? 0
  const netMargin      = netMarginLayer?.cumulative ?? 0

  const totalDeduction   = listPrice - netNetPrice
  const priceRealization = listPrice > 0 ? (netNetPrice / listPrice) * 100 : 0
  const grossMarginPct   = netNetPrice > 0 ? (grossMargin / netNetPrice) * 100 : 0
  const netMarginPct     = netNetPrice > 0 ? (netMargin / netNetPrice) * 100 : 0

  const highlightedLayer = layers.find(l => l.isHighlighted)

  const account = getAccount(accountId)
  const volume = account?.volume ?? 0

  // Revenue leakage: full annual cost of deductions from list
  const revenueLeakage = volume * totalDeduction * 12
  const formatLeakage = (v: number) => {
    if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M / yr`
    if (v >= 10_000)    return `€${Math.round(v / 1_000)}k / yr`
    return `€${(v / 1_000).toFixed(1)}k / yr`
  }

  // Rebate intensity: rebate as % of net invoice price (post invoice-discount)
  const invoiceDiscountLayer = layers.find(l => l.name === 'Invoice Discount')
  const netInvoicePrice = listPrice + (invoiceDiscountLayer?.value ?? 0)
  const rebateLayer = layers.find(l => l.name === 'Rebate')
  const rebateIntensity = netInvoicePrice > 0 && rebateLayer
    ? (Math.abs(rebateLayer.value) / netInvoicePrice) * 100
    : 0

  // Dynamic alert banner
  const rebatePct = listPrice > 0 && rebateLayer ? (Math.abs(rebateLayer.value) / listPrice) * 100 : 0
  const showRebateAlert = highlightedLayer != null

  const pricingStats = [
    { label: 'List Price',        value: `€${listPrice.toFixed(2)}/kg` },
    { label: 'Net-Net Price',     value: `€${netNetPrice.toFixed(2)}/kg`,   zone: 'red' as const },
    { label: 'Total Deduction',   value: `€${totalDeduction.toFixed(2)}/kg (−${((totalDeduction / listPrice) * 100).toFixed(1)}%)` },
    { label: 'Price Realisation', value: `${priceRealization.toFixed(1)}%`, zone: priceRealization >= 80 ? 'green' as const : priceRealization >= 70 ? 'amber' as const : 'red' as const },
  ]

  const marginStats = [
    { label: 'Gross Margin %',      value: `${grossMarginPct.toFixed(1)}%`,  zone: 'blue' as const },
    { label: 'Net Margin %',        value: `${netMarginPct.toFixed(1)}%`,    zone: netMarginPct >= 18 ? 'green' as const : netMarginPct >= 12 ? 'amber' as const : 'red' as const },
    { label: 'Revenue Leakage',     value: revenueLeakage > 0 ? formatLeakage(revenueLeakage) : '—',
      zone: revenueLeakage > 500_000 ? 'red' as const : revenueLeakage > 100_000 ? 'amber' as const : undefined },
    { label: 'Rebate Intensity',    value: `${rebateIntensity.toFixed(1)}%`, zone: rebateIntensity > 15 ? 'red' as const : rebateIntensity > 8 ? 'amber' as const : 'green' as const },
  ]

  const keyMetrics = {
    accountId,
    productId,
    listPrice,
    netNetPrice,
    totalDeduction,
    priceRealization: priceRealization.toFixed(1) + '%',
    grossMargin,
    grossMarginPct: grossMarginPct.toFixed(1) + '%',
    netMargin,
    netMarginPct: netMarginPct.toFixed(1) + '%',
    highlightedLayerName: highlightedLayer?.name ?? null,
  }

  const statZoneClass = (zone?: string) => {
    if (zone === 'red')   return 'text-zone-red'
    if (zone === 'amber') return 'text-zone-amber'
    if (zone === 'green') return 'text-zone-green'
    if (zone === 'blue')  return 'text-blue-700'
    return 'text-text-primary'
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {!mounted ? (
        <div className="flex-1 p-6"><ChartSkeleton rows={1} height="h-56" /></div>
      ) : (
      <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}-${activeProductId ?? 'none'}`} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col p-6 gap-3 min-h-0">

        {/* Pricing stats row */}
        <div className="flex gap-3">
          {pricingStats.map(({ label, value, zone }) => (
            <div key={label} className="card px-4 py-3 flex-1">
              <p className="text-xs text-text-muted mb-0.5">{label}</p>
              <p className={`text-lg font-semibold ${statZoneClass(zone)}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Margin stats row */}
        <div className="flex gap-3">
          {marginStats.map(({ label, value, zone }) => (
            <div key={label} className="card px-4 py-3 flex-1">
              <p className="text-xs text-text-muted mb-0.5">{label}</p>
              <p className={`text-lg font-semibold ${statZoneClass(zone)}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="card flex-1 p-4 min-h-0">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Commercial Margin Waterfall — {accounts.find(a => a.id === accountId)?.name ?? accountId} · {products.find(p => p.id === productId)?.name ?? productId}
          </h2>
          <div style={{ height: 'calc(100% - 32px)' }}>
            <WaterfallChart data={waterfallData} />
          </div>
        </div>

        {/* Fallback notice */}
        {isFallback && (
          <div className="px-3 py-2 bg-page-bg border border-border-default rounded-lg text-xs text-text-muted">
            Showing Bakker Klaas data (no waterfall data for selected account/product)
          </div>
        )}

        {/* Dynamic alert banner */}
        {showRebateAlert && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zone-amber-bg border border-zone-amber/30 rounded-lg text-xs text-zone-amber">
            <AlertTriangle size={13} />
            Rebate is {rebatePct.toFixed(1)}% of list price — {rebatePct > 8 ? `${(rebatePct - 4.1).toFixed(1)}pts above the Mid-Market Benelux norm of 4.1%` : 'within segment norms'}
          </div>
        )}
      </div>
      </FadeWrapper>
      )}

      <ExplainButton
        screen="waterfall"
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
        screen="waterfall"
        accountId={activeAccountId}
        productId={activeProductId}
        accountName={accounts.find(a => a.id === activeAccountId)?.name ?? null}
        productName={products.find(p => p.id === activeProductId)?.name ?? null}
        keyMetrics={keyMetrics}
      />
    </div>
  )
}
