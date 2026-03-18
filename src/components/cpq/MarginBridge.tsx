'use client'

interface MarginBridgeProps {
  listPrice: number
  basePrice: number
  dealDiscountPct: number
  netPrice: number
  grossMarginPct: number
}

const MAX_H = 128

export function MarginBridge({ listPrice, basePrice, dealDiscountPct, netPrice, grossMarginPct }: MarginBridgeProps) {
  const costBasis  = netPrice * (1 - grossMarginPct / 100)
  const gmValue    = netPrice - costBasis

  // Convert a price value to pixels within MAX_H, anchored to listPrice as 100%
  const px = (v: number) => Math.max(0, (v / listPrice) * MAX_H)

  const tierPct    = ((listPrice - basePrice) / listPrice * 100).toFixed(1)
  const dealLabel  = dealDiscountPct === 0
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
    // Tier — floating bar from contracted base price up to listPrice (full real contracted discount)
    {
      label: `Tier −${tierPct}%`,
      barPx: Math.max(3, px(listPrice - basePrice)),
      bottomPx: px(basePrice),
      color: 'bg-zone-red/60',
      valueLabel: `−€${(listPrice - basePrice).toFixed(2)}`,
    },
    // Deal — floating bar between basePrice and netPrice (rep slider adjustment only)
    {
      label: dealLabel,
      barPx: Math.max(3, px(Math.abs(netPrice - basePrice))),
      bottomPx: px(Math.min(basePrice, netPrice)),
      color: dealDiscountPct >= 0 ? 'bg-zone-green/60' : 'bg-zone-red/60',
      valueLabel: dealDiscountPct === 0
        ? '—'
        : `${dealDiscountPct > 0 ? '+' : ''}€${(netPrice - basePrice).toFixed(2)}`,
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
      valueLabel: `${grossMarginPct.toFixed(1)}%`,
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
              style={{ bottom: Math.min(bottomPx + barPx + 3, MAX_H - 10) }}
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
