'use client'

interface DealContextPanelProps {
  accountName: string
  segment: string
  volume: number
  lastQuotedPrice: number
  listPrice: number
  floorPrice: number
  targetPrice: number
  currentPrice: number
  tierDiscountPct: number
}

export function DealContextPanel({
  accountName, segment, volume, lastQuotedPrice,
  listPrice, floorPrice, targetPrice, currentPrice, tierDiscountPct,
}: DealContextPanelProps) {
  const segmentPosition = currentPrice < floorPrice ? 'Below floor' : currentPrice < targetPrice ? 'In-band' : 'Above target'
  const posZone = currentPrice < floorPrice ? 'red' : currentPrice < targetPrice ? 'amber' : 'green'
  const cogsApprox = currentPrice * 0.75

  return (
    <div className="card p-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
      {/* Account */}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wide">Account</p>
        <p className="font-semibold text-text-primary">{accountName}</p>
        <p className="text-text-muted">{segment} · {volume.toLocaleString()} kg/mo</p>
      </div>
      <div className="h-8 w-px bg-border-default" />
      {/* Account context */}
      {[
        { label: 'Last quoted', value: `€${lastQuotedPrice.toFixed(2)}/kg` },
        { label: 'Payment terms', value: 'Net 30' },
        { label: 'Contract tier', value: `Tier ${tierDiscountPct >= 10 ? '3' : tierDiscountPct >= 5 ? '2' : '1'}` },
        { label: 'Strategic flag', value: volume >= 1000 ? '★ Key Account' : 'Standard' },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="font-medium text-text-primary">{value}</p>
        </div>
      ))}
      <div className="h-8 w-px bg-border-default" />
      {/* SKU context */}
      {[
        { label: 'List price', value: `€${listPrice.toFixed(2)}/kg` },
        { label: 'CoGS (approx)', value: `€${cogsApprox.toFixed(2)}/kg` },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
          <p className="font-medium text-text-primary">{value}</p>
        </div>
      ))}
      <div>
        <p className="text-[10px] text-text-muted uppercase tracking-wide">Segment position</p>
        <span className={`font-semibold ${
          posZone === 'red' ? 'text-zone-red' : posZone === 'amber' ? 'text-zone-amber' : 'text-zone-green'
        }`}>{segmentPosition}</span>
      </div>
    </div>
  )
}
