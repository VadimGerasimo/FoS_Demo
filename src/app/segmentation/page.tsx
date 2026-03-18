'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { accounts, products, getSegmentationForProduct, getFloor, getTarget } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { SegmentationScatter } from '@/components/charts/SegmentationScatter'
import { ComparisonPanel } from '@/components/segmentation/ComparisonPanel'
import { ProspectInput } from '@/components/segmentation/ProspectInput'
import { SegmentHealthPanel } from '@/components/segmentation/SegmentHealthPanel'
import { useAppContext } from '@/context/AppContext'
import { Columns2, LayoutPanelLeft, MessageSquare } from 'lucide-react'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { ContextualChatPanel } from '@/components/chat/ContextualChatPanel'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'

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
  const [chatOpen, setChatOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const productId = activeProductId ?? 'milk-couverture'
  const allPoints = getSegmentationForProduct(productId)
  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const floorPrice = activeAccount ? getFloor(activeAccount, productId) : 4.57
  const targetPrice = activeAccount ? getTarget(activeAccount, productId) : 4.85
  // Only show dots from the same segment as the active account
  const points = activeAccount
    ? allPoints.filter(p => p.segment === activeAccount.segment)
    : allPoints

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-border-default">
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
      <div className="flex-1 flex flex-col p-4 gap-3 min-h-0">
        {!mounted ? (
          <ChartSkeleton rows={2} height="h-64" />
        ) : (
        <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}-${activeProductId ?? 'none'}`} className="flex flex-col gap-4 flex-1 min-h-0">
        {comparisonMode ? (
          <ComparisonPanel productId={activeProductId} />
        ) : (
          <>
            {/* Stats row */}
            {activeAccount && (() => {
              const vsFloorZone = activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green'
              const sortedByPrice = [...points].sort((a, b) => a.price - b.price)
              const accountRankIdx = sortedByPrice.findIndex(p => Math.abs(p.price - activeAccount.price) < 0.001)
              const accountPercentile = accountRankIdx >= 0
                ? Math.round(((accountRankIdx + 1) / sortedByPrice.length) * 100)
                : null
              const KPI_CONFIG = [
                {
                  label: 'Current price',
                  value: `€${activeAccount.price.toFixed(2)}/kg`,
                  borderColor: 'border-l-blue-500',
                },
                {
                  label: 'Segment floor',
                  value: `€${floorPrice.toFixed(2)}/kg`,
                  borderColor: 'border-l-zone-red',
                },
                {
                  label: 'Segment target',
                  value: `€${targetPrice.toFixed(2)}/kg`,
                  borderColor: 'border-l-zone-green',
                },
                {
                  label: 'vs Floor',
                  value: `${((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1)}%`,
                  zone: vsFloorZone,
                  borderColor: activeAccount.price < floorPrice ? 'border-l-zone-red' : 'border-l-zone-amber',
                  dominant: activeAccount.price < floorPrice,
                },
                {
                  label: 'Segment rank',
                  value: accountPercentile !== null ? `Bottom ${accountPercentile}%` : '—',
                  borderColor: accountPercentile !== null && accountPercentile <= 25 ? 'border-l-zone-red' : 'border-l-blue-500',
                },
              ]
              return (
                <div className="flex gap-4">
                  {KPI_CONFIG.map((cfg) => (
                    <div
                      key={cfg.label}
                      className={clsx(
                        'card px-4 py-2 flex-1 border-l-4',
                        cfg.borderColor,
                        cfg.dominant && 'bg-zone-red-bg',
                      )}
                      style={cfg.dominant ? { borderLeftColor: '#dc2626' } : undefined}
                    >
                      <p className={clsx('text-xs mb-0.5', 'text-text-muted')}>{cfg.label}</p>
                      <p className={clsx('text-lg font-semibold', cfg.dominant ? 'text-zone-red' : (
                        cfg.zone === 'red' ? 'text-zone-red' :
                        cfg.zone === 'amber' ? 'text-zone-amber' :
                        cfg.zone === 'green' ? 'text-zone-green' :
                        'text-text-primary'
                      ))}>{cfg.value}</p>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Segment Health Panel */}
            {activeAccount && (
              <SegmentHealthPanel
                segmentId={activeAccount.segmentId}
                segmentName={activeAccount.segment}
                points={points}
                floorPrice={floorPrice}
                targetPrice={targetPrice}
              />
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
        </FadeWrapper>
        )}
      </div>

      {(() => {
        const keyMetrics = {
          accountName: activeAccount?.name,
          currentPrice: activeAccount?.price,
          floorPrice,
          targetPrice,
          vsFloor: activeAccount ? ((activeAccount.price - floorPrice) / floorPrice * 100).toFixed(1) : null,
          upliftToFloor: activeAccount && activeAccount.price < floorPrice
            ? ((floorPrice - activeAccount.price) / activeAccount.price * 100).toFixed(1)
            : null,
          zone: activeAccount ? (activeAccount.price < floorPrice ? 'red' : activeAccount.price < targetPrice ? 'amber' : 'green') : null,
        }
        const accountName = accounts.find(a => a.id === activeAccountId)?.name ?? null
        const productName = products.find(p => p.id === activeProductId)?.name ?? null
        return (
          <>
            <ExplainButton
              screen="segmentation"
              accountId={activeAccountId}
              productId={activeProductId ?? productId}
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
              screen="segmentation"
              accountId={activeAccountId}
              productId={activeProductId ?? productId}
              accountName={accountName}
              productName={productName}
              keyMetrics={keyMetrics}
            />
          </>
        )
      })()}
    </div>
  )
}
