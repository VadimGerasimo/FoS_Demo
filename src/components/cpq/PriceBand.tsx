'use client'

interface PriceBandProps {
  listPrice: number
  floorPrice: number
  targetPrice: number
  netPrice: number
}

export function PriceBand({ listPrice, floorPrice, targetPrice, netPrice }: PriceBandProps) {
  // Map a price to % position within the displayed range
  const minDisplay = floorPrice * 0.88
  const maxDisplay = listPrice * 1.05
  const range = maxDisplay - minDisplay

  function toPercent(price: number) {
    return Math.max(0, Math.min(100, ((price - minDisplay) / range) * 100))
  }

  const floorPct = toPercent(floorPrice)
  const targetPct = toPercent(targetPrice)
  const netPct = toPercent(netPrice)

  const zone =
    netPrice < floorPrice ? 'red' :
    netPrice < targetPrice ? 'amber' : 'green'

  return (
    <div className="w-full">
      <div className="relative h-8 rounded-lg overflow-hidden bg-zone-red-bg border border-border-default">
        {/* Red zone: start → floor */}
        <div
          className="absolute top-0 bottom-0 bg-zone-red/20"
          style={{ left: 0, width: `${floorPct}%` }}
        />
        {/* Amber zone: floor → target */}
        <div
          className="absolute top-0 bottom-0 bg-zone-amber/20"
          style={{ left: `${floorPct}%`, width: `${targetPct - floorPct}%` }}
        />
        {/* Green zone: target → end */}
        <div
          className="absolute top-0 bottom-0 bg-zone-green/20"
          style={{ left: `${targetPct}%`, right: 0 }}
        />

        {/* Floor tick */}
        <div
          className="absolute top-0 bottom-0 w-px bg-zone-red/50"
          style={{ left: `${floorPct}%` }}
        />
        {/* Target tick */}
        <div
          className="absolute top-0 bottom-0 w-px bg-zone-green/50"
          style={{ left: `${targetPct}%` }}
        />

        {/* Price indicator */}
        <div
          className={`absolute top-1 bottom-1 w-1 rounded-full transition-all duration-300 ${
            zone === 'red' ? 'bg-zone-red' :
            zone === 'amber' ? 'bg-zone-amber' : 'bg-zone-green'
          }`}
          style={{ left: `calc(${netPct}% - 2px)` }}
        />
      </div>

      {/* Labels */}
      <div className="relative mt-1 h-4 text-[10px] text-text-muted">
        <span className="absolute" style={{ left: `${floorPct}%`, transform: 'translateX(-50%)' }}>
          Floor €{floorPrice.toFixed(2)}
        </span>
        <span className="absolute" style={{ left: `${targetPct}%`, transform: 'translateX(-50%)' }}>
          Target €{targetPrice.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
