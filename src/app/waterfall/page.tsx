'use client'

import { useState } from 'react'
import { accounts, products, getWaterfallForAccount } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { WaterfallChart } from '@/components/charts/WaterfallChart'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { AlertTriangle } from 'lucide-react'

export default function WaterfallPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)

  const accountId = activeAccountId ?? 'baker-klaas'
  const productId = activeProductId ?? 'milk-couverture'

  const waterfallData =
    getWaterfallForAccount(accountId, productId) ??
    getWaterfallForAccount('baker-klaas', 'milk-couverture')!

  const listPrice = waterfallData.layers[0]?.cumulative ?? 0
  const netNetPrice = waterfallData.layers[waterfallData.layers.length - 1]?.cumulative ?? 0
  const totalDeduction = listPrice - netNetPrice
  const priceRealization = listPrice > 0 ? (netNetPrice / listPrice) * 100 : 0
  const highlightedLayer = waterfallData.layers.find(l => l.isHighlighted)

  const stats = [
    { label: 'List Price', value: `€${listPrice.toFixed(2)}/kg` },
    { label: 'Net-Net Price', value: `€${netNetPrice.toFixed(2)}/kg`, zone: 'red' as const },
    { label: 'Total Deduction', value: `€${totalDeduction.toFixed(2)}/kg (−${((totalDeduction / listPrice) * 100).toFixed(1)}%)` },
    { label: 'Price Realisation', value: `${priceRealization.toFixed(1)}%`, zone: priceRealization >= 80 ? 'green' as const : priceRealization >= 70 ? 'amber' as const : 'red' as const },
  ]

  const keyMetrics = {
    accountId,
    productId,
    listPrice,
    netNetPrice,
    totalDeduction,
    priceRealization: priceRealization.toFixed(1) + '%',
    highlightedLayerName: highlightedLayer?.name ?? null,
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
        {/* Stats row */}
        <div className="flex gap-4">
          {stats.map(({ label, value, zone }) => (
            <div key={label} className="card px-4 py-3 flex-1">
              <p className="text-xs text-text-muted mb-0.5">{label}</p>
              <p className={`text-lg font-semibold ${
                zone === 'red' ? 'text-zone-red' :
                zone === 'amber' ? 'text-zone-amber' :
                zone === 'green' ? 'text-zone-green' :
                'text-text-primary'
              }`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="card flex-1 p-4 min-h-0">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Price Waterfall — {accounts.find(a => a.id === accountId)?.name ?? accountId} · {products.find(p => p.id === productId)?.name ?? productId}
          </h2>
          <div style={{ height: 'calc(100% - 32px)' }}>
            <WaterfallChart data={waterfallData} />
          </div>
        </div>

        {/* Highlighted layer banner */}
        {highlightedLayer && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zone-amber-bg border border-zone-amber/30 rounded-lg text-xs text-zone-amber">
            <AlertTriangle size={13} />
            Rebate is 9.2% — 5.1pts above the Mid-Market Benelux norm of 4.1%
          </div>
        )}
      </div>

      <ExplainButton
        screen="waterfall"
        accountId={activeAccountId}
        productId={activeProductId}
        keyMetrics={keyMetrics}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
