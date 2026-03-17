'use client'

interface PriceBandProps {
  listPrice: number
  floorPrice: number
  targetPrice: number
  netPrice: number
}

export function PriceBand({ listPrice, floorPrice, targetPrice, netPrice }: PriceBandProps) {
  // Band runs right-to-left in price terms: left = high price (Target+), right = low price (Floor-)
  const minDisplay = floorPrice * 0.88
  const maxDisplay = listPrice * 1.05
  const range = maxDisplay - minDisplay

  function toPercent(price: number) {
    // Inverted: high price → small % (left), low price → large % (right)
    return Math.max(0, Math.min(100, ((maxDisplay - price) / range) * 100))
  }

  const floorPct = toPercent(floorPrice)
  const targetPct = toPercent(targetPrice)
  const netPct = toPercent(netPrice)

  const zone =
    netPrice < floorPrice ? 'red' :
    netPrice < targetPrice ? 'amber' : 'green'

  // Zone center positions for escalation labels
  const greenCenter = targetPct / 2
  const amberCenter = targetPct + (floorPct - targetPct) / 2
  const redCenter = floorPct + (100 - floorPct) / 2

  const zoneColor = zone === 'red' ? '#dc2626' : zone === 'amber' ? '#eb8c00' : '#059669'

  return (
    <div className="w-full">
      {/* Net price floating label above indicator */}
      <div className="relative h-5 mb-0.5">
        <span
          className={`absolute text-xs font-bold transition-all duration-300 -translate-x-1/2 ${
            zone === 'red' ? 'text-zone-red' : zone === 'amber' ? 'text-zone-amber' : 'text-zone-green'
          }`}
          style={{ left: `${netPct}%` }}
        >
          €{netPrice.toFixed(2)}
        </span>
      </div>

      {/* Band */}
      <div className="relative h-8 rounded-lg overflow-hidden border border-border-default">
        {/* Green zone: left edge → target (high price, above target) */}
        <div
          className="absolute top-0 bottom-0 bg-zone-green/20"
          style={{ left: 0, width: `${targetPct}%` }}
        />
        {/* Amber zone: target → floor (in-band) */}
        <div
          className="absolute top-0 bottom-0 bg-zone-amber/20"
          style={{ left: `${targetPct}%`, width: `${floorPct - targetPct}%` }}
        />
        {/* Red zone: floor → right edge (below floor) */}
        <div
          className="absolute top-0 bottom-0 bg-zone-red/20"
          style={{ left: `${floorPct}%`, right: 0 }}
        />

        {/* Target tick */}
        <div
          className="absolute top-0 bottom-0 w-px bg-zone-green/60"
          style={{ left: `${targetPct}%` }}
        />
        {/* Floor tick */}
        <div
          className="absolute top-0 bottom-0 w-px bg-zone-red/60"
          style={{ left: `${floorPct}%` }}
        />

        {/* Escalation zone labels */}
        {[
          { label: 'Rep', left: greenCenter, color: '#059669' },
          { label: 'Manager', left: amberCenter, color: '#eb8c00' },
          { label: 'Director', left: redCenter, color: '#dc2626' },
        ].map(({ label, left, color }) => (
          <span
            key={label}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[9px] font-semibold pointer-events-none select-none"
            style={{ left: `${left}%`, color, opacity: 0.7 }}
          >
            {label}
          </span>
        ))}

        {/* Price indicator — triangle marker with stem */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center"
          style={{ left: `calc(${netPct}% - 12px)`, width: 24, transition: 'left 300ms' }}
        >
          {/* Triangle pointing down */}
          <div
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: zoneColor }}
          />
          {/* Vertical stem */}
          <div
            className="flex-1 w-0.5"
            style={{ backgroundColor: zoneColor }}
          />
        </div>
      </div>

      {/* Labels — Target on left, Floor on right */}
      <div className="relative mt-1 h-4 text-[10px] text-text-muted">
        <span className="absolute" style={{ left: `${targetPct}%`, transform: 'translateX(-50%)' }}>
          Target €{targetPrice.toFixed(2)}
        </span>
        <span className="absolute" style={{ left: `${floorPct}%`, transform: 'translateX(-50%)' }}>
          Floor €{floorPrice.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
