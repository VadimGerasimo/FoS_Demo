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
    <div className="card px-4 py-3 flex items-center gap-4">
      <div className="shrink-0">
        <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-0.5">Win Probability</p>
        <span className={`text-3xl font-bold leading-none ${
          zone === 'green' ? 'text-zone-green' :
          zone === 'amber' ? 'text-zone-amber' :
          'text-zone-red'
        }`}>
          {winRate}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        {inCliff && (
          <p className="text-[10px] text-zone-amber mb-1">
            Price in cliff zone — win rate dropping fast
          </p>
        )}
        <Link href="/win-loss" className="text-[11px] text-pwc-orange hover:underline">
          See full analysis →
        </Link>
      </div>
    </div>
  )
}
