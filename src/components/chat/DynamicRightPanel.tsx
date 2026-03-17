'use client'

import { getSegmentationForProduct, getWaterfallForAccount, getPVMForAccount, getWinLossForProduct, getEoRForAccount, eorDataset } from '@/lib/data'
import { SegmentationScatter } from '@/components/charts/SegmentationScatter'
import { WaterfallChart } from '@/components/charts/WaterfallChart'
import { PVMBridge } from '@/components/charts/PVMBridge'
import { WinProbabilityCurve } from '@/components/charts/WinProbabilityCurve'
import { EoRDimensions } from '@/components/charts/EoRDimensions'
import { Sparkles } from 'lucide-react'

interface DynamicRightPanelProps {
  visualType: string | null
  dataKey: string | null
  tableData?: Record<string, string | number>[] | null
  accountId?: string | null
  productId?: string | null
}

function DataTable({ data }: { data: Record<string, string | number>[] }) {
  if (!data?.length) return null
  const headers = Object.keys(data[0])
  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border-default">
            {headers.map(h => (
              <th key={h} className="text-left px-3 py-2 font-semibold text-text-secondary capitalize">
                {h.replace(/([A-Z])/g, ' $1').trim()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={`border-b border-border-default ${i % 2 === 0 ? 'bg-white' : 'bg-page-bg'}`}>
              {headers.map(h => (
                <td key={h} className="px-3 py-2 text-text-primary">
                  {typeof row[h] === 'string' && (row[h] as string).includes('No')
                    ? <span className="text-text-muted">{row[h]}</span>
                    : typeof row[h] === 'string' && (row[h] as string).includes('Yes')
                    ? <span className="text-zone-green font-medium">{row[h]}</span>
                    : row[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 rounded-full bg-pwc-orange/10 flex items-center justify-center mb-3">
        <Sparkles size={20} className="text-pwc-orange" />
      </div>
      <p className="text-sm font-medium text-text-primary mb-1">Insights appear here</p>
      <p className="text-xs text-text-muted max-w-xs">
        Ask a question in the chat and the relevant analysis will visualise on this panel.
      </p>
    </div>
  )
}

export function DynamicRightPanel({ visualType, dataKey, tableData, accountId, productId }: DynamicRightPanelProps) {
  if (!visualType) return <EmptyState />

  if (visualType === 'table' && tableData?.length) {
    return (
      <div className="h-full overflow-auto">
        <DataTable data={tableData} />
      </div>
    )
  }

  if (visualType === 'scatter' && dataKey) {
    const points = getSegmentationForProduct(dataKey)
    return (
      <div className="h-full">
        <SegmentationScatter
          points={points}
          floorPrice={4.57}
          targetPrice={4.85}
          activeAccountId="baker-klaas"
          isAnimationActive={false}
        />
      </div>
    )
  }

  if (visualType === 'waterfall') {
    const accId = accountId ?? 'baker-klaas'
    const prodId = productId ?? 'milk-couverture'
    const data = getWaterfallForAccount(accId, prodId) ?? getWaterfallForAccount('baker-klaas', 'milk-couverture')
    if (!data) return <EmptyState />
    return (
      <div className="h-full">
        <WaterfallChart data={data} />
      </div>
    )
  }

  if (visualType === 'pvm') {
    const accId = accountId ?? dataKey ?? 'schoko-retail'
    const data = getPVMForAccount(accId as string) ?? getPVMForAccount('schoko-retail')
    if (!data) return <EmptyState />
    return (
      <div className="h-full overflow-y-auto">
        <PVMBridge data={data} />
      </div>
    )
  }

  if (visualType === 'winLoss') {
    const prodId = productId ?? dataKey ?? 'milk-couverture'
    const data = getWinLossForProduct(prodId as string) ?? getWinLossForProduct('milk-couverture')
    if (!data) return <EmptyState />
    return (
      <div className="h-full">
        <WinProbabilityCurve data={data} />
      </div>
    )
  }

  if (visualType === 'eor') {
    const accId = accountId ?? dataKey ?? 'baker-klaas'
    const data = getEoRForAccount(accId as string) ?? eorDataset[0]
    if (!data) return <EmptyState />
    return (
      <div className="h-full overflow-y-auto p-2">
        <EoRDimensions dimensions={data.dimensions} />
      </div>
    )
  }

  return <EmptyState />
}
