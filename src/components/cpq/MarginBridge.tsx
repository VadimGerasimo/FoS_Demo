'use client'

interface MarginBridgeProps {
  listPrice: number
  tierDiscountPct: number
  dealDiscountPct: number
  netPrice: number
}

export function MarginBridge({ listPrice, tierDiscountPct, dealDiscountPct, netPrice }: MarginBridgeProps) {
  const afterTier = listPrice * (1 - tierDiscountPct / 100)
  const afterDeal = afterTier * (1 - dealDiscountPct / 100)
  // Gross margin assuming cost = 75% of net price (approx)
  const costBasis = netPrice * 0.75
  const gmPct = ((netPrice - costBasis) / netPrice * 100).toFixed(1)

  const steps = [
    { label: 'List', value: listPrice, isPositive: true },
    { label: `Tier −${tierDiscountPct}%`, value: afterTier - listPrice, isPositive: false },
    { label: `Deal ${dealDiscountPct >= 0 ? (dealDiscountPct === 0 ? '0%' : `−${dealDiscountPct}%`) : `+${Math.abs(dealDiscountPct)}%`}`, value: afterDeal - afterTier, isPositive: dealDiscountPct <= 0 },
    { label: 'Net-Net', value: netPrice, isPositive: true, isFinal: true },
  ]

  const maxVal = listPrice

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 h-20">
        {steps.map(({ label, value, isPositive, isFinal }) => {
          const heightPct = Math.abs(value) / maxVal * 100
          return (
            <div key={label} className="flex flex-col items-center flex-1 gap-1">
              <span className="text-[9px] text-text-muted font-medium">
                €{Math.abs(value).toFixed(2)}
              </span>
              <div
                className={`w-full rounded-t transition-all duration-300 ${
                  isFinal
                    ? 'bg-sidebar-bg'
                    : isPositive
                    ? 'bg-zone-green/60'
                    : 'bg-zone-red/60'
                }`}
                style={{ height: `${Math.max(4, heightPct)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {steps.map(({ label }) => (
          <span key={label} className="flex-1 text-center text-[9px] text-text-muted truncate">{label}</span>
        ))}
      </div>
      <div className="mt-2 text-xs text-text-muted">
        GM: <span className="font-semibold text-text-primary">{gmPct}%</span>
      </div>
    </div>
  )
}
