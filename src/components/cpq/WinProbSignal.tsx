'use client'

import Link from 'next/link'
import { getWinLossForProduct } from '@/lib/data'

function interpolateWinRate(curve: { price: number; winRate: number }[], price: number): number {
  const sorted = [...curve].sort((a, b) => a.price - b.price)
  if (price <= sorted[0].price) return sorted[0].winRate
  if (price >= sorted[sorted.length - 1].price) return sorted[sorted.length - 1].winRate
  const lower = sorted.filter(p => p.price <= price).at(-1)!
  const upper = sorted.find(p => p.price > price)!
  const t = (price - lower.price) / (upper.price - lower.price)
  return lower.winRate + t * (upper.winRate - lower.winRate)
}

interface WinProbSignalProps {
  productId: string
  currentPrice: number
}

export function WinProbSignal({ productId, currentPrice }: WinProbSignalProps) {
  const data = getWinLossForProduct(productId)
  if (!data) return null

  const winRate = Math.round(interpolateWinRate(data.curve, currentPrice))
  const zone = winRate >= 65 ? 'green' : winRate >= 40 ? 'amber' : 'red'
  const inCliff = currentPrice >= data.cliffMin && currentPrice <= data.cliffMax

  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">Win Probability</p>
      <div className="flex items-end gap-2 mb-1">
        <span className={`text-3xl font-bold ${
          zone === 'green' ? 'text-zone-green' :
          zone === 'amber' ? 'text-zone-amber' :
          'text-zone-red'
        }`}>
          {winRate}%
        </span>
        <span className="text-xs text-text-muted mb-1">at current price</span>
      </div>
      {inCliff && (
        <p className="text-[10px] text-zone-amber mb-2">
          Current price is inside the cliff zone — win rate dropping fast
        </p>
      )}
      <Link
        href="/win-loss"
        className="text-xs text-pwc-orange hover:underline mt-1 inline-block"
      >
        See full analysis →
      </Link>
    </div>
  )
}
