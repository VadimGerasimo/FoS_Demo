'use client'

import type { SegmentationPoint } from '@/lib/data'

interface SegmentHealthPanelProps {
  segmentId: string
  segmentName: string
  points: SegmentationPoint[]
  floorPrice: number
  targetPrice: number
}

export function SegmentHealthPanel({ segmentId: _segmentId, segmentName, points, floorPrice, targetPrice }: SegmentHealthPanelProps) {
  const count = points.length
  const yearlyVolume = points.reduce((sum, p) => sum + p.volume * 12, 0)
  const avgMargin = points.reduce((sum, p) => sum + ((p.price - floorPrice) / p.price * 100), 0) / (count || 1)

  const aboveTarget = points.filter(p => p.price >= targetPrice).length
  const inBand      = points.filter(p => p.price >= floorPrice && p.price < targetPrice).length
  const belowFloor  = points.filter(p => p.price < floorPrice).length

  const abovePct  = Math.round((aboveTarget / count) * 100) || 0
  const inBandPct = Math.round((inBand / count) * 100) || 0
  const belowPct  = Math.round((belowFloor / count) * 100) || 0

  return (
    <div className="card px-4 py-3 flex items-center gap-6 flex-wrap">
      <div className="min-w-0">
        <p className="text-[10px] text-text-muted uppercase tracking-wide font-medium">Segment</p>
        <p className="text-sm font-semibold text-text-primary">{segmentName}</p>
      </div>

      <div className="h-8 w-px bg-border-default shrink-0" />

      {[
        { label: 'Account-products', value: count.toString() },
        { label: 'Yearly volume', value: `${(yearlyVolume / 1000).toFixed(0)}k kg` },
        { label: 'Avg margin proxy', value: `${avgMargin.toFixed(1)}%` },
      ].map(({ label, value }) => (
        <div key={label} className="shrink-0">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-text-primary">{value}</p>
        </div>
      ))}

      <div className="h-8 w-px bg-border-default shrink-0" />

      <div className="flex-1 min-w-48">
        <p className="text-[10px] text-text-muted uppercase tracking-wide mb-1.5">Distribution</p>
        <div className="flex h-4 rounded overflow-hidden gap-px">
          {abovePct > 0  && <div className="bg-zone-green" style={{ width: `${abovePct}%` }} title={`Above target: ${abovePct}%`} />}
          {inBandPct > 0 && <div className="bg-zone-amber" style={{ width: `${inBandPct}%` }} title={`In-band: ${inBandPct}%`} />}
          {belowPct > 0  && <div className="bg-zone-red" style={{ width: `${belowPct}%` }} title={`Below floor: ${belowPct}%`} />}
        </div>
        <div className="flex gap-3 mt-1 text-[9px] text-text-muted">
          <span><span className="text-zone-green font-medium">{abovePct}%</span> above target</span>
          <span><span className="text-zone-amber font-medium">{inBandPct}%</span> in band</span>
          <span><span className="text-zone-red font-medium">{belowPct}%</span> below floor</span>
        </div>
      </div>
    </div>
  )
}
