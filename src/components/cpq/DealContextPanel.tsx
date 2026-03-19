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
  actualCOGS: number
}

export function DealContextPanel({
  accountName, segment, volume, lastQuotedPrice,
  listPrice, floorPrice, targetPrice, tierDiscountPct, actualCOGS,
}: DealContextPanelProps) {
  const segmentPosition = lastQuotedPrice < floorPrice ? 'Below floor' : lastQuotedPrice < targetPrice ? 'In-band' : 'Above target'
  const posZone = lastQuotedPrice < floorPrice ? 'red' : lastQuotedPrice < targetPrice ? 'amber' : 'green'

  return (
    <div className="card overflow-hidden text-xs flex divide-x divide-border-default">

      {/* Left: Deal context */}
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2 p-3 flex-1">
        <p className="text-[9px] font-semibold text-text-muted uppercase tracking-widest w-full">Deal Context</p>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Account</p>
          <p className="font-semibold text-text-primary">{accountName}</p>
          <p className="text-text-muted">{volume.toLocaleString()} kg/mo</p>
        </div>
        {[
          { label: 'Last quoted', value: `€${lastQuotedPrice.toFixed(2)}/kg` },
          { label: 'Payment terms', value: 'Net 30' },
          { label: 'Contract tier', value: `Tier ${tierDiscountPct >= 10 ? '3' : tierDiscountPct >= 5 ? '2' : '1'}` },
          { label: 'Strategic flag', value: volume >= 1000 ? '★ Key Account' : 'Standard' },
          { label: 'List price', value: `€${listPrice.toFixed(2)}/kg` },
          { label: 'CoGS', value: `€${actualCOGS.toFixed(2)}/kg` },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] text-text-muted uppercase tracking-wide">{label}</p>
            <p className="font-medium text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Right: Segment benchmarks */}
      <div className="flex flex-wrap items-start gap-x-6 gap-y-2 p-3 bg-page-bg">
        <p className="text-[9px] font-semibold text-pwc-orange uppercase tracking-widest w-full">Segment</p>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Name</p>
          <p className="font-semibold text-text-primary">{segment}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Floor</p>
          <p className="font-medium text-zone-red">€{floorPrice.toFixed(2)}/kg</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Target</p>
          <p className="font-medium text-zone-green">€{targetPrice.toFixed(2)}/kg</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Position</p>
          <p className={`font-semibold ${
            posZone === 'red' ? 'text-zone-red' : posZone === 'amber' ? 'text-zone-amber' : 'text-zone-green'
          }`}>{segmentPosition}</p>
        </div>
      </div>

    </div>
  )
}
