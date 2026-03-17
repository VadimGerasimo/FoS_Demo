'use client'

import { useState, useEffect } from 'react'
import {
  ComposedChart,
  Line,
  Scatter,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { WinLossData } from '@/lib/data'

function interpolateWinRate(curve: { price: number; winRate: number }[], price: number): number {
  const sorted = [...curve].sort((a, b) => a.price - b.price)
  if (price <= sorted[0].price) return sorted[0].winRate
  if (price >= sorted[sorted.length - 1].price) return sorted[sorted.length - 1].winRate
  const lower = sorted.filter(p => p.price <= price).at(-1)!
  const upper = sorted.find(p => p.price > price)!
  const t = (price - lower.price) / (upper.price - lower.price)
  return lower.winRate + t * (upper.winRate - lower.winRate)
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: { price: number; winRate?: number; won?: boolean } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d) return null
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="text-text-secondary">Price: <span className="font-medium text-text-primary">€{d.price?.toFixed(2)}/kg</span></p>
      {d.winRate !== undefined && (
        <p className="text-text-secondary">Win Rate: <span className="font-medium text-text-primary">{d.winRate.toFixed(0)}%</span></p>
      )}
      {d.won !== undefined && (
        <p className={`font-medium ${d.won ? 'text-zone-green' : 'text-zone-red'}`}>{d.won ? 'Won' : 'Lost'}</p>
      )}
    </div>
  )
}

interface WinProbabilityCurveProps {
  data: WinLossData
  currentPrice?: number
}

export function WinProbabilityCurve({ data, currentPrice }: WinProbabilityCurveProps) {
  const [animateOnMount, setAnimateOnMount] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAnimateOnMount(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const wonQuotes = data.historicalQuotes
    .filter(q => q.won)
    .map(q => ({ price: q.price, winRate: interpolateWinRate(data.curve, q.price), won: true }))

  const lostQuotes = data.historicalQuotes
    .filter(q => !q.won)
    .map(q => ({ price: q.price, winRate: interpolateWinRate(data.curve, q.price), won: false }))

  const priceDomain: [number, number] = [
    Math.min(...data.curve.map(p => p.price)) - 0.1,
    Math.max(...data.curve.map(p => p.price)) + 0.1,
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" />
        <XAxis
          type="number"
          dataKey="price"
          domain={priceDomain}
          tickFormatter={(v) => `€${(v as number).toFixed(2)}`}
          tick={{ fontSize: 10, fill: '#939598' }}
          label={{ value: '€/kg', position: 'bottom', offset: 20, style: { fontSize: 11, fill: '#939598' } }}
        />
        <YAxis
          type="number"
          dataKey="winRate"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: '#939598' }}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Cliff zone shading */}
        <ReferenceArea
          x1={data.cliffMin}
          x2={data.cliffMax}
          fill="#dc2626"
          fillOpacity={0.1}
          stroke="#dc2626"
          strokeOpacity={0.3}
          label={{ value: 'Cliff zone', position: 'insideTop', fontSize: 10, fill: '#dc2626' }}
        />

        {/* Optimal price line */}
        <ReferenceLine
          x={data.optimalPrice}
          stroke="#059669"
          strokeDasharray="4 3"
          label={{ value: 'Optimal', position: 'top', fontSize: 10, fill: '#059669' }}
        />

        {/* Current price line */}
        {currentPrice && (
          <ReferenceLine
            x={currentPrice}
            stroke="#6d6e71"
            strokeDasharray="4 3"
            label={{ value: 'Current', position: 'top', fontSize: 10, fill: '#6d6e71' }}
          />
        )}

        {/* Win probability curve */}
        <Line
          data={data.curve}
          dataKey="winRate"
          stroke="#eb8c00"
          strokeWidth={2.5}
          dot={false}
          type="monotone"
          isAnimationActive={animateOnMount}
          animationDuration={900}
        />

        {/* Won quotes */}
        <Scatter
          data={wonQuotes}
          dataKey="winRate"
          fill="#059669"
          r={4}
          isAnimationActive={false}
        />

        {/* Lost quotes */}
        <Scatter
          data={lostQuotes}
          dataKey="winRate"
          fill="#dc2626"
          r={4}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
