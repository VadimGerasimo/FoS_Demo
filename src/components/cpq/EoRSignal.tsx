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
    <div className="card p-4">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Ease of Realization</p>
      <div className="flex items-end gap-2 mb-1">
        <span className={`text-3xl font-bold ${
          zone === 'green' ? 'text-zone-green' :
          zone === 'amber' ? 'text-zone-amber' :
          'text-zone-red'
        }`}>
          {score.toFixed(1)}
        </span>
        <span className="text-xs text-text-muted mb-1">/ 10</span>
      </div>
      {topRisk && (
        <div className="mb-2">
          <p className="text-[10px] text-text-muted">Top risk: <span className="font-medium text-text-primary">{topRisk.name}</span></p>
          <p className="text-[10px] text-text-muted">{topRisk.driverNote}</p>
        </div>
      )}
      <Link
        href="/ease-of-realization"
        className="text-xs text-pwc-orange hover:underline mt-1 inline-block"
      >
        See detail →
      </Link>
    </div>
  )
}
