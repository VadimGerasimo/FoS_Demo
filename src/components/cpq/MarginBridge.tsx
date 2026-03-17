'use client'

interface MarginBridgeProps {
  listPrice: number
  tierDiscountPct: number
  dealDiscountPct: number
  netPrice: number
}

const MAX_H = 128

export function MarginBridge({ listPrice, tierDiscountPct, dealDiscountPct, netPrice }: MarginBridgeProps) {
  const afterTier  = listPrice * (1 - tierDiscountPct / 100)
  const afterDeal  = afterTier * (1 + dealDiscountPct / 100)   // equals netPrice
  const costBasis  = netPrice * 0.75
  const gmValue    = netPrice - costBasis
  const gmPct      = ((gmValue / netPrice) * 100).toFixed(1)

  // Convert a price value to pixels within MAX_H, anchored to listPrice as 100%
  const px = (v: number) => Math.max(0, (v / listPrice) * MAX_H)

  const dealLabel = dealDiscountPct === 0
    ? 'Deal 0%'
    : dealDiscountPct < 0 ? `Deal ${dealDiscountPct}%` : `Deal +${dealDiscountPct}%`

  const bars = [
    // List — solid bar from baseline to listPrice
    {
      label: 'List',
      barPx: MAX_H,
      bottomPx: 0,
      color: 'bg-zone-green/50',
      valueLabel: `€${listPrice.toFixed(2)}`,
    },
    // Tier — floating bar between afterTier and listPrice
    {
      label: `Tier −${tierDiscountPct}%`,
      barPx: Math.max(3, px(listPrice - afterTier)),
      bottomPx: px(afterTier),
      color: 'bg-zone-red/60',
      valueLabel: `−€${(listPrice - afterTier).toFixed(2)}`,
    },
    // Deal — floating bar between lower and upper of (afterTier, afterDeal)
    {
      label: dealLabel,
      barPx: Math.max(3, px(Math.abs(afterDeal - afterTier))),
      bottomPx: px(Math.min(afterTier, afterDeal)),
      color: dealDiscountPct >= 0 ? 'bg-zone-green/60' : 'bg-zone-red/60',
      valueLabel: dealDiscountPct === 0
        ? '—'
        : `${dealDiscountPct > 0 ? '+' : ''}€${(afterDeal - afterTier).toFixed(2)}`,
    },
    // Net-Net — solid connector bar from baseline to netPrice
    {
      label: 'Net-Net',
      barPx: px(netPrice),
      bottomPx: 0,
      color: 'bg-blue-400/50',
      valueLabel: `€${netPrice.toFixed(2)}`,
    },
    // CoGS — floating bar from GM level up to netPrice level
    {
      label: 'CoGS',
      barPx: Math.max(3, px(costBasis)),
      bottomPx: px(gmValue),
      color: 'bg-text-secondary/30',
      valueLabel: `−€${costBasis.toFixed(2)}`,
    },
    // Gross Margin — solid bar from baseline up to gmValue
    {
      label: 'GM',
      barPx: Math.max(3, px(gmValue)),
      bottomPx: 0,
      color: 'bg-zone-green',
      valueLabel: `${gmPct}%`,
    },
  ]

  return (
    <div className="w-full">
      <div className="flex gap-1.5" style={{ height: MAX_H }}>
        {bars.map(({ label, barPx, bottomPx, color, valueLabel }) => (
          <div key={label} className="flex-1 relative" style={{ height: MAX_H }}>
            {/* Value label floating just above the bar */}
            <span
              className="absolute w-full text-center text-[9px] text-text-muted font-medium leading-none"
              style={{ bottom: bottomPx + barPx + 3 }}
            >
              {valueLabel}
            </span>
            {/* The bar itself, positioned from the bottom */}
            <div
              className={`absolute w-full rounded-t transition-all duration-300 ${color}`}
              style={{ bottom: bottomPx, height: barPx }}
            />
          </div>
        ))}
      </div>
      {/* X-axis labels */}
      <div className="flex gap-1.5 mt-1.5 border-t border-border-default pt-1">
        {bars.map(({ label }) => (
          <span key={label} className="flex-1 text-center text-[9px] text-text-muted truncate">{label}</span>
        ))}
      </div>
    </div>
  )
}
