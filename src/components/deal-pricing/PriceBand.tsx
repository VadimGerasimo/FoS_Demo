'use client'

interface PriceBandProps {
  floorPrice: number
  targetPrice: number
  netPrice: number
}

export function PriceBand({ floorPrice, targetPrice, netPrice }: PriceBandProps) {
  const directorThreshold = floorPrice * 0.95

  // Range is capped just above target to avoid the large irrelevant "up to list price" green buffer
  const minDisplay = floorPrice * 0.85
  const maxDisplay = targetPrice * 1.10
  const range = maxDisplay - minDisplay

  function toPercent(price: number) {
    // Inverted: high price → small % (left), low price → large % (right)
    return Math.max(0, Math.min(100, ((maxDisplay - price) / range) * 100))
  }

  const targetPct    = toPercent(targetPrice)
  const floorPct     = toPercent(floorPrice)
  const directorPct  = toPercent(directorThreshold)
  const netPct       = toPercent(netPrice)

  // Match exactly the escalation logic in page.tsx
  const zone =
    netPrice < directorThreshold ? 'director' :
    netPrice < floorPrice        ? 'manager'  :
    netPrice < targetPrice       ? 'rep'       : 'none'

  const zoneColor =
    zone === 'director' ? '#dc2626' :
    zone === 'manager'  ? '#ea580c' :
    zone === 'rep'      ? '#eb8c00' : '#059669'

  // Zone centre positions for labels
  const amberCenter    = targetPct + (floorPct - targetPct) / 2
  const managerCenter  = floorPct  + (directorPct - floorPct) / 2
  const directorCenter = directorPct + (100 - directorPct) / 2

  return (
    <div className="w-full">
      {/* Net price floating label above indicator */}
      <div className="relative h-5 mb-0.5">
        <span
          className={`absolute text-xs font-bold transition-all duration-300 -translate-x-1/2 ${
            zone === 'director' ? 'text-zone-red'   :
            zone === 'manager'  ? 'text-orange-600' :
            zone === 'rep'      ? 'text-zone-amber' : 'text-zone-green'
          }`}
          style={{ left: `${netPct}%` }}
        >
          €{netPrice.toFixed(2)}
        </span>
      </div>

      {/* Band */}
      <div className="relative h-8 rounded-lg overflow-hidden border border-border-default">
        {/* Green zone: above target — no escalation */}
        <div
          className="absolute top-0 bottom-0 bg-zone-green/20"
          style={{ left: 0, width: `${targetPct}%` }}
        />
        {/* Amber zone: target → floor — rep escalation */}
        <div
          className="absolute top-0 bottom-0 bg-zone-amber/20"
          style={{ left: `${targetPct}%`, width: `${floorPct - targetPct}%` }}
        />
        {/* Orange zone: floor → −5% — manager escalation */}
        <div
          className="absolute top-0 bottom-0 bg-orange-200/50"
          style={{ left: `${floorPct}%`, width: `${directorPct - floorPct}%` }}
        />
        {/* Red zone: below −5% — director escalation */}
        <div
          className="absolute top-0 bottom-0 bg-zone-red/25"
          style={{ left: `${directorPct}%`, right: 0 }}
        />

        {/* Target tick */}
        <div className="absolute top-0 bottom-0 w-px bg-zone-green/60" style={{ left: `${targetPct}%` }} />
        {/* Floor tick */}
        <div className="absolute top-0 bottom-0 w-px bg-orange-400/70" style={{ left: `${floorPct}%` }} />
        {/* Director threshold tick */}
        <div className="absolute top-0 bottom-0 w-px bg-zone-red/60" style={{ left: `${directorPct}%` }} />

        {/* Escalation zone labels — only for the 3 escalation zones, not the green OK zone */}
        {[
          { label: 'Rep',      left: amberCenter,    color: '#eb8c00' },
          { label: 'Manager',  left: managerCenter,  color: '#ea580c' },
          { label: 'Director', left: directorCenter, color: '#dc2626' },
        ].map(({ label, left, color }) => (
          <span
            key={label}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[9px] font-semibold pointer-events-none select-none"
            style={{ left: `${left}%`, color, opacity: 0.85 }}
          >
            {label}
          </span>
        ))}

        {/* Price indicator — triangle marker with stem */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center"
          style={{ left: `calc(${netPct}% - 12px)`, width: 24, transition: 'left 300ms' }}
        >
          <div
            className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent"
            style={{ borderTopColor: zoneColor }}
          />
          <div className="flex-1 w-0.5" style={{ backgroundColor: zoneColor }} />
        </div>
      </div>

      {/* Axis labels */}
      <div className="relative mt-1 h-4 text-[10px] text-text-muted">
        <span className="absolute" style={{ left: `${targetPct}%`, transform: 'translateX(-50%)' }}>
          Target €{targetPrice.toFixed(2)}
        </span>
        <span className="absolute" style={{ left: `${floorPct}%`, transform: 'translateX(-50%)' }}>
          Floor €{floorPrice.toFixed(2)}
        </span>
        <span className="absolute text-zone-red/70" style={{ left: `${directorPct}%`, transform: 'translateX(-50%)' }}>
          −5%
        </span>
      </div>
    </div>
  )
}
