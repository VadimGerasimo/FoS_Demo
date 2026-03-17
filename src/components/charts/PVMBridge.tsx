'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { PVMData } from '@/lib/data'

interface PVMBarDatum {
  name: string
  spacer: number
  value: number
  isNegative: boolean
  isAnchor: boolean
  displayLabel: string
}

function fmt(v: number): string {
  return Math.abs(v) >= 1000
    ? `€${(Math.abs(v) / 1000).toFixed(0)}k`
    : `€${Math.abs(v).toFixed(0)}`
}

function fmtEffect(v: number): string {
  return v >= 0 ? `+${fmt(v)}` : `−${fmt(v)}`
}

function fmtEffectTable(v: number): string {
  return v >= 0 ? `+${fmt(v)}` : `−${fmt(v)}`
}

function transformPVM(d: PVMData): PVMBarDatum[] {
  const afterVol = d.priorRevenue + d.volumeEffect
  const afterPrice = afterVol + d.priceEffect

  return [
    {
      name: 'Prior Period',
      spacer: 0,
      value: d.priorRevenue,
      isNegative: false,
      isAnchor: true,
      displayLabel: fmt(d.priorRevenue),
    },
    {
      name: 'Volume',
      spacer: d.volumeEffect >= 0 ? d.priorRevenue : d.priorRevenue + d.volumeEffect,
      value: Math.abs(d.volumeEffect),
      isNegative: d.volumeEffect < 0,
      isAnchor: false,
      displayLabel: fmtEffect(d.volumeEffect),
    },
    {
      name: 'Price',
      spacer: d.priceEffect >= 0 ? afterVol : afterVol + d.priceEffect,
      value: Math.abs(d.priceEffect),
      isNegative: d.priceEffect < 0,
      isAnchor: false,
      displayLabel: fmtEffect(d.priceEffect),
    },
    {
      name: 'Mix',
      spacer: d.mixEffect >= 0 ? afterPrice : afterPrice + d.mixEffect,
      value: Math.abs(d.mixEffect),
      isNegative: d.mixEffect < 0,
      isAnchor: false,
      displayLabel: fmtEffect(d.mixEffect),
    },
    {
      name: 'Current Period',
      spacer: 0,
      value: d.currentRevenue,
      isNegative: false,
      isAnchor: true,
      displayLabel: fmt(d.currentRevenue),
    },
  ]
}

const getFill = (d: PVMBarDatum): string => {
  if (d.isAnchor) return 'rgb(50,51,54)'
  return d.isNegative ? '#dc2626' : '#059669'
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: PVMBarDatum }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d?.name) return null
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-text-primary mb-1">{d.name}</p>
      <p className="text-text-secondary">{d.displayLabel}</p>
    </div>
  )
}

const PERIOD_OPTIONS = ['YTD 2025 vs YTD 2024', 'Q4 2025 vs Q4 2024']

interface PVMBridgeProps {
  data: PVMData
}

export function PVMBridge({ data }: PVMBridgeProps) {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0])
  const chartData = transformPVM(data)

  return (
    <div className="flex flex-col gap-4">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Period:</span>
        <div className="relative">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="appearance-none text-xs font-medium text-text-primary bg-white border border-border-default rounded-lg px-3 py-1.5 pr-7 cursor-pointer focus:outline-none focus:border-pwc-orange"
          >
            {PERIOD_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* AI warning banner */}
      {data.priceEffect < 0 && data.mixEffect < 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-zone-amber-bg border border-zone-amber/30 rounded-lg text-xs text-zone-amber font-medium">
          <AlertTriangle size={13} />
          Price and mix are both negative — revenue growth is volume-driven only
        </div>
      )}

      {/* Chart */}
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 24, right: 24, bottom: 20, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#939598' }} />
            <YAxis
              tickFormatter={(v) => `€${((v as number) / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#939598' }}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spacer" stackId="pvm" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="value" stackId="pvm" isAnimationActive={false} radius={[3, 3, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={`cell-${i}`} fill={getFill(d)} />
              ))}
              <LabelList
                dataKey="displayLabel"
                position="top"
                offset={6}
                style={{ fontSize: 10, fill: '#6d6e71', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-product table */}
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border-default">
              <th className="text-left px-3 py-2 font-semibold text-text-secondary">Product</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Prior Rev</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Vol Effect</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Price Effect</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Mix Effect</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Current Rev</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Δ%</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map((p, i) => (
              <tr key={p.productId} className={`border-b border-border-default ${i % 2 === 0 ? 'bg-white' : 'bg-page-bg'}`}>
                <td className="px-3 py-2 text-text-primary font-medium">{p.productName}</td>
                <td className="px-3 py-2 text-right text-text-primary">{fmt(p.priorRevenue)}</td>
                <td className={`px-3 py-2 text-right font-medium ${p.volumeEffect >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{fmtEffectTable(p.volumeEffect)}</td>
                <td className={`px-3 py-2 text-right font-medium ${p.priceEffect >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{fmtEffectTable(p.priceEffect)}</td>
                <td className={`px-3 py-2 text-right font-medium ${p.mixEffect >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{fmtEffectTable(p.mixEffect)}</td>
                <td className="px-3 py-2 text-right text-text-primary">{fmt(p.currentRevenue)}</td>
                <td className={`px-3 py-2 text-right font-medium ${p.delta >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{p.delta >= 0 ? '+' : ''}{p.delta.toFixed(1)}%</td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="border-t-2 border-border-default font-semibold bg-page-bg">
              <td className="px-3 py-2 text-text-primary">Total</td>
              <td className="px-3 py-2 text-right text-text-primary">{fmt(data.priorRevenue)}</td>
              <td className={`px-3 py-2 text-right ${data.volumeEffect >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{fmtEffectTable(data.volumeEffect)}</td>
              <td className={`px-3 py-2 text-right ${data.priceEffect >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{fmtEffectTable(data.priceEffect)}</td>
              <td className={`px-3 py-2 text-right ${data.mixEffect >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>{fmtEffectTable(data.mixEffect)}</td>
              <td className="px-3 py-2 text-right text-text-primary">{fmt(data.currentRevenue)}</td>
              <td className={`px-3 py-2 text-right ${data.currentRevenue >= data.priorRevenue ? 'text-zone-green' : 'text-zone-red'}`}>
                {data.currentRevenue >= data.priorRevenue ? '+' : ''}
                {(((data.currentRevenue - data.priorRevenue) / data.priorRevenue) * 100).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
