'use client'

import Link from 'next/link'
import { getEoRForAccount } from '@/lib/data'

interface EoRSignalProps {
  accountId: string
}

export function EoRSignal({ accountId }: EoRSignalProps) {
  const data = getEoRForAccount(accountId)
  if (!data) return null

  const score = data.compositeScore
  const zone = score >= 7 ? 'green' : score >= 5 ? 'amber' : 'red'
  const topRisk = [...data.dimensions].sort((a, b) => a.score - b.score)[0]

  return (
    <div className="card px-4 py-3 flex items-center gap-4">
      <div className="shrink-0">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-0.5">Account Quality</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold leading-none ${
            zone === 'green' ? 'text-zone-green' :
            zone === 'amber' ? 'text-zone-amber' :
            'text-zone-red'
          }`}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] text-text-muted">/ 10</span>
        </div>
      </div>
      {topRisk && (
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-text-muted truncate">Top risk: <span className="font-medium text-text-primary">{topRisk.name}</span></p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1.5 bg-border-default rounded-full overflow-hidden">
              <div className="h-full bg-zone-red rounded-full" style={{ width: `${topRisk.score * 10}%` }} />
            </div>
            <span className="text-[10px] text-text-muted shrink-0">{topRisk.score}/10</span>
          </div>
          <Link href="/deal-intelligence" className="text-[11px] text-pwc-orange hover:underline mt-1 inline-block">
            See detail →
          </Link>
        </div>
      )}
    </div>
  )
}
