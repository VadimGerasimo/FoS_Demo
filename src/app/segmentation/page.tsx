'use client'

import { useState } from 'react'
import { accounts, products, getSegmentationForProduct } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { SegmentationScatter } from '@/components/charts/SegmentationScatter'
import { ComparisonPanel } from '@/components/segmentation/ComparisonPanel'
import { ProspectInput } from '@/components/segmentation/ProspectInput'
import { useAppContext } from '@/context/AppContext'
import { Columns2, LayoutPanelLeft } from 'lucide-react'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'

interface ProspectPoint {
  volume: number
  price: number
}

export default function SegmentationPage() {
  const { activeAccountId, activeProductId } = useAppContext()
  const [comparisonMode, setComparisonMode] = useState(false)
  const [prospectPoint, setProspectPoint] = useState<ProspectPoint | null>(null)
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)

  const productId = activeProductId ?? 'milk-couverture'
  const points = getSegmentationForProduct(productId)
  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const floorPrice = activeAccount?.floor ?? 4.57
  const targetPrice = activeAccount?.target ?? 4.85

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-border-default">
        <div className="flex items-center gap-2">
          <ProspectInput
            floorPrice={floorPrice}
            onProspect={(volume, price) => setProspectPoint({ volume, price })}
          />
          {prospectPoint && (
            <button
              onClick={() => setProspectPoint(null)}
              className="text-xs text-text-muted hover:text-text-primary underline"
            >
              Clear prospect
            </button>
          )}
        </div>
        <button
          onClick={() => setComparisonMode(v => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            comparisonMode
              ? 'bg-pwc-orange/10 border-pwc-orange/30 text-pwc-orange-dark'
              : 'border-border-default text-text-secondary hover:border-pwc-orange hover:text-pwc-orange-dark'
          }`}
        >
          {comparisonMode ? <LayoutPanelLeft size={15} /> : <Columns2 size={15} />}
          {comparisonMode ? 'Single view' : 'Compare accounts'}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 gap-4 min-h-0">
        {comparisonMode ? (
          <ComparisonPanel productId={activeProductId} />
        ) : (
          <>
            {/* Stats row */}
            {activeAccount && (
              <div className="flex gap-4">
                {[
                  { label: 'Current price', value: `€${activeAccount.price.toFixed(2)}/kg` },
                  { label: 'Segment floor', value: `€${floorPrice.toFixed(2)}/kg`, highlight: true },
                  { label: 'Segment target', value: `€${targetPrice.toFixed(2)}/kg` },
                  {
                    label: 'vs Floor',
                    value: `${((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1)}%`,
                    zone: activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green',
                  },
                ].map(({ label, value, zone }) => (
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
            )}

            {/* Chart */}
            <div className="card flex-1 p-4 min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-text-primary">
                  Segment Position — {products.find(p => p.id === productId)?.name ?? 'All Products'}
                </h2>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-zone-red" />Below floor</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-zone-amber" />In-band</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-zone-green" />Above target</span>
                </div>
              </div>
              <div style={{ height: 'calc(100% - 32px)' }}>
                <SegmentationScatter
                  points={points}
                  floorPrice={floorPrice}
                  targetPrice={targetPrice}
                  activeAccountId={activeAccountId}
                  prospectPoint={prospectPoint}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <ExplainButton
        screen="segmentation"
        accountId={activeAccountId}
        productId={activeProductId ?? productId}
        keyMetrics={{
          currentPrice: activeAccount?.price,
          floorPrice,
          targetPrice,
          vsFloor: activeAccount ? ((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1) : null,
          zone: activeAccount ? (activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green') : null,
        }}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
