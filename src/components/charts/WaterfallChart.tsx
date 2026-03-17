'use client'

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
import type { WaterfallItem } from '@/lib/data'

interface WaterfallBarDatum {
  name: string
  spacer: number
  value: number
  isFinal: boolean
  isStart: boolean
  isHighlighted: boolean
  originalCumulative: number
}

function transformLayers(layers: WaterfallItem['layers']): WaterfallBarDatum[] {
  return layers
    .filter(l => !(l.value === 0 && l.name !== 'Net-Net Price'))
    .map(l => {
      if (l.name === 'List Price') {
        return { name: l.name, spacer: 0, value: l.value, isFinal: false, isStart: true, isHighlighted: false, originalCumulative: l.cumulative }
      }
      if (l.value === 0) {
        return { name: l.name, spacer: 0, value: l.cumulative, isFinal: true, isStart: false, isHighlighted: false, originalCumulative: l.cumulative }
      }
      return { name: l.name, spacer: l.cumulative, value: Math.abs(l.value), isFinal: false, isStart: false, isHighlighted: l.isHighlighted ?? false, originalCumulative: l.cumulative }
    })
}

function getFill(d: WaterfallBarDatum): string {
  if (d.isStart) return '#059669'
  if (d.isFinal) return 'rgb(50,51,54)'
  if (d.isHighlighted) return '#eb8c00'
  return '#dc2626'
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: WaterfallBarDatum }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d?.name) return null
  return (
    <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-text-primary mb-1">{d.name}</p>
      <p className="text-text-secondary">Amount: <span className="font-medium text-text-primary">€{d.value.toFixed(2)}/kg</span></p>
      <p className="text-text-secondary">Cumulative: <span className="font-medium text-text-primary">€{d.originalCumulative.toFixed(2)}/kg</span></p>
    </div>
  )
}

interface WaterfallChartProps {
  data: WaterfallItem
}

export function WaterfallChart({ data }: WaterfallChartProps) {
  const chartData = transformLayers(data.layers)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 24, right: 24, bottom: 40, left: 20 }} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#939598' }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tickFormatter={(v) => `€${(v as number).toFixed(2)}`}
          tick={{ fontSize: 10, fill: '#939598' }}
          domain={[0, 'dataMax + 0.5']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="spacer" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="value" stackId="wf" isAnimationActive={false} radius={[3, 3, 0, 0]}>
          {chartData.map((d, i) => (
            <Cell
              key={`cell-${i}`}
              fill={getFill(d)}
              stroke={d.isHighlighted ? '#eb8c00' : 'none'}
              strokeWidth={d.isHighlighted ? 2.5 : 0}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            offset={6}
            style={{ fontSize: 10, fill: '#6d6e71', fontWeight: 500 }}
            formatter={(v: unknown) => `€${(v as number).toFixed(2)}`}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
