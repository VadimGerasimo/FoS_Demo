'use client'

import { useState, useEffect, useRef } from 'react'
import { accounts, products, getPVMForAccount } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { PVMBridge } from '@/components/charts/PVMBridge'
import { BucketInsightPanel } from '@/components/charts/BucketInsightPanel'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { useAppContext } from '@/context/AppContext'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { FadeWrapper } from '@/components/shared/FadeWrapper'
import { ContextualChatPanel } from '@/components/chat/ContextualChatPanel'
import { MessageSquare } from 'lucide-react'
import { getPVMInsight, type BucketKey } from '@/lib/pvmInsights'

function fmt(v: number): string {
  return Math.abs(v) >= 1000
    ? `€${(Math.abs(v) / 1000).toFixed(0)}k`
    : `€${Math.abs(v).toFixed(0)}`
}

function fmtSigned(v: number): string {
  const abs = fmt(v)
  return v >= 0 ? `+${abs}` : `−${abs}`
}

export default function PVMPage() {
  const { activeAccountId } = useAppContext()
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedBucket, setSelectedBucket] = useState<BucketKey | null>(null)
  const [bucketPanelOpen, setBucketPanelOpen] = useState(false)
  const aiPromptRef = useRef<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 350)
    return () => clearTimeout(t)
  }, [])

  const accountId = activeAccountId ?? 'schoko-retail'
  const pvmData = getPVMForAccount(accountId) ?? getPVMForAccount('schoko-retail')!
  const isFallback = !getPVMForAccount(accountId) && accountId !== 'schoko-retail'

  const netChange = pvmData.currentRevenue - pvmData.priorRevenue
  const netChangePct = pvmData.priorRevenue > 0
    ? ((netChange / pvmData.priorRevenue) * 100).toFixed(1)
    : '0.0'

  const effects = [
    { name: 'Volume', value: pvmData.volumeEffect },
    { name: 'Price', value: pvmData.priceEffect },
    { name: 'Mix', value: pvmData.mixEffect },
  ]
  const primaryDriver = effects.reduce((a, b) => Math.abs(a.value) > Math.abs(b.value) ? a : b)

  // Smart primary driver label
  const primaryDriverLabel = (() => {
    if (
      primaryDriver.name === 'Volume' &&
      pvmData.priceEffect < 0 &&
      pvmData.mixEffect < 0
    ) {
      return 'Volume masking price erosion'
    }
    return `${primaryDriver.name} ${fmtSigned(primaryDriver.value)}`
  })()

  // Price Realization Rate
  const priceRealizationRate = pvmData.priorRevenue > 0
    ? ((pvmData.priceEffect / (pvmData.priorRevenue + pvmData.volumeEffect)) * 100).toFixed(1)
    : '0.0'
  const priceRealizationNum = Number(priceRealizationRate)

  type StatZone = 'green' | 'amber' | 'red' | undefined
  const stats: { label: string; value: string; zone?: StatZone }[] = [
    { label: 'Prior Revenue', value: fmt(pvmData.priorRevenue) },
    {
      label: 'Current Revenue',
      value: fmt(pvmData.currentRevenue),
      zone: pvmData.currentRevenue >= pvmData.priorRevenue ? 'green' : 'red',
    },
    {
      label: 'Net Change',
      value: `${fmtSigned(netChange)} (${netChange >= 0 ? '+' : ''}${netChangePct}%)`,
      zone: netChange >= 0 ? 'green' : 'red',
    },
    {
      label: 'Primary Driver',
      value: primaryDriverLabel,
      zone: primaryDriver.value >= 0 ? 'green' : 'red',
    },
    {
      label: 'Price Realization',
      value: `${priceRealizationNum >= 0 ? '+' : ''}${priceRealizationRate}%`,
      zone: priceRealizationNum >= 0 ? 'green' : 'red',
    },
  ]

  const keyMetrics = {
    accountId,
    priorRevenue: pvmData.priorRevenue,
    currentRevenue: pvmData.currentRevenue,
    volumeEffect: pvmData.volumeEffect,
    priceEffect: pvmData.priceEffect,
    mixEffect: pvmData.mixEffect,
    bothNegative: pvmData.priceEffect < 0 && pvmData.mixEffect < 0,
    selectedBucket: selectedBucket ?? undefined,
  }

  function handleBarSelect(bar: BucketKey | null) {
    if (bar === null) {
      setBucketPanelOpen(false)
      setSelectedBucket(null)
    } else {
      setSelectedBucket(bar)
      setBucketPanelOpen(true)
      setExplainOpen(false)
      setChatOpen(false)
    }
  }

  function handleAskAI(prompt: string) {
    aiPromptRef.current = prompt
    setBucketPanelOpen(false)
    setSelectedBucket(null)
    setChatOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      {!mounted ? (
        <div className="flex-1 p-6"><ChartSkeleton rows={1} height="h-56" /></div>
      ) : (
      <FadeWrapper fadeKey={`${activeAccountId ?? 'none'}`} className="flex-1 overflow-y-auto">
      <div className="p-6 flex flex-col gap-4">
        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3">
          {stats.map(({ label, value, zone }) => (
            <div key={label} className="card px-3 py-2.5">
              <p className="text-[10px] text-text-muted mb-0.5 uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-bold leading-snug ${
                zone === 'red' ? 'text-zone-red' :
                zone === 'amber' ? 'text-zone-amber' :
                zone === 'green' ? 'text-zone-green' :
                'text-text-primary'
              }`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Fallback note */}
        {isFallback && (
          <div className="px-3 py-2 bg-page-bg border border-border-default rounded-lg text-xs text-text-muted">
            Showing Schoko Retail Group data (no PVM data for selected account)
          </div>
        )}

        {/* Chart + table card */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-1">
            Price / Volume / Mix Bridge — {accounts.find(a => a.id === (isFallback ? 'schoko-retail' : accountId))?.name ?? accountId}
          </h2>
          <p className="text-xs text-text-muted mb-4">Click a bar to explore that effect in detail</p>
          <PVMBridge
            data={pvmData}
            selectedBarName={selectedBucket}
            onBarSelect={handleBarSelect}
          />
        </div>
      </div>
      </FadeWrapper>
      )}

      <ExplainButton
        screen="pvm"
        accountId={activeAccountId}
        productId={null}
        keyMetrics={keyMetrics}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
        className="right-[124px]"
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />

      <BucketInsightPanel
        isOpen={bucketPanelOpen}
        onClose={() => { setBucketPanelOpen(false); setSelectedBucket(null) }}
        insight={selectedBucket ? getPVMInsight(accountId, selectedBucket) : null}
        bucketKey={selectedBucket}
        onAskAI={handleAskAI}
      />

      <button
        onClick={() => {
          aiPromptRef.current = null
          setChatOpen(true)
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-white border border-border-default text-text-primary rounded-full shadow-lg hover:bg-page-bg transition-colors text-sm font-medium"
      >
        <MessageSquare size={15} className="text-pwc-orange" />
        Ask
      </button>
      <ContextualChatPanel
        isOpen={chatOpen}
        onClose={() => { setChatOpen(false); aiPromptRef.current = null }}
        screen="pvm"
        accountId={activeAccountId}
        productId={null}
        accountName={accounts.find(a => a.id === activeAccountId)?.name ?? null}
        productName={null}
        keyMetrics={keyMetrics}
        initialMessage={aiPromptRef.current}
      />
    </div>
  )
}
