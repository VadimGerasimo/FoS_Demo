'use client'

import { SegmentationScatter } from '@/components/charts/SegmentationScatter'
import { accounts as allAccounts, getSegmentationForProduct, getFloor, getTarget } from '@/lib/data'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ComparisonPanelProps {
  productId: string | null
}

export function ComparisonPanel({ productId }: ComparisonPanelProps) {
  const [leftAccountId, setLeftAccountId] = useState<string>('baker-klaas')
  const [rightAccountId, setRightAccountId] = useState<string>('schoko-retail')

  const points = productId ? getSegmentationForProduct(productId) : getSegmentationForProduct('milk-couverture')

  const leftAccount = allAccounts.find(a => a.id === leftAccountId)
  const rightAccount = allAccounts.find(a => a.id === rightAccountId)

  return (
    <div className="flex gap-4 flex-1 min-h-0">
      {[
        { accountId: leftAccountId, setAccountId: setLeftAccountId, account: leftAccount },
        { accountId: rightAccountId, setAccountId: setRightAccountId, account: rightAccount },
      ].map(({ accountId, setAccountId, account }, i) => (
        <div key={i} className="card flex-1 flex flex-col p-4 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="text-sm font-medium text-text-primary border border-border-default rounded-lg px-3 py-1.5 pr-7 bg-white appearance-none cursor-pointer focus:outline-none focus:border-pwc-orange"
              >
                {allAccounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
            {account && (
              <span className="text-xs text-text-muted px-2 py-0.5 bg-page-bg rounded-full border border-border-default">
                {account.segment}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <SegmentationScatter
              points={points}
              floorPrice={account ? getFloor(account, productId ?? 'milk-couverture') : 4.57}
              targetPrice={account ? getTarget(account, productId ?? 'milk-couverture') : 4.85}
              activeAccountId={accountId}
              isAnimationActive={false}
            />
          </div>
          {account && (
            <div className="mt-2 flex gap-4 text-xs text-text-muted border-t border-border-default pt-2">
              <span>Price: <strong className="text-text-primary">€{account.price.toFixed(2)}/kg</strong></span>
              <span>Vol: <strong className="text-text-primary">{account.volume.toLocaleString()} kg/mo</strong></span>
              <span className={`font-semibold ${account.price < getFloor(account, productId ?? 'milk-couverture') ? 'text-zone-red' : account.price < getTarget(account, productId ?? 'milk-couverture') ? 'text-zone-amber' : 'text-zone-green'}`}>
                {account.price < getFloor(account, productId ?? 'milk-couverture') ? 'Below floor' : account.price < getTarget(account, productId ?? 'milk-couverture') ? 'In-band' : 'Above target'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
