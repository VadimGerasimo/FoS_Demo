'use client'

import { useState, useEffect } from 'react'
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
  ReferenceArea,
  ReferenceLine,
} from 'recharts'
import type { WaterfallItem, WaterfallSection } from '@/lib/data'

interface WaterfallBarDatum {
  name: string
  spacer: number
  value: number
  isFinal: boolean
  isStart: boolean
  isHighlighted: boolean
  originalCumulative: number
  section: WaterfallSection
}

function transformLayers(layers: WaterfallItem['layers']): WaterfallBarDatum[] {
  return layers
    .filter(l => !(l.value === 0 && !l.isSubtotal))
    .map(l => {
      const section: WaterfallSection = l.section ?? 'price'
      if (l.name === 'List Price') {
        return { name: l.name, spacer: 0, value: l.value, isFinal: false, isStart: true, isHighlighted: false, originalCumulative: l.cumulative, section }
      }
      if (l.isSubtotal) {
        return { name: l.name, spacer: 0, value: l.cumulative, isFinal: true, isStart: false, isHighlighted: false, originalCumulative: l.cumulative, section }
      }
      return { name: l.name, spacer: l.cumulative, value: Math.abs(l.value), isFinal: false, isStart: false, isHighlighted: l.isHighlighted ?? false, originalCumulative: l.cumulative, section }
    })
}

function getFill(d: WaterfallBarDatum): string {
  if (d.isStart) return '#059669'
  if (d.isFinal) {
    if (d.section === 'cogs') return '#1e3a5f'
    if (d.section === 'sga') return '#3b0764'
    return 'rgb(50,51,54)'
  }
  if (d.isHighlighted) return '#eb8c00'
  if (d.section === 'cogs') return '#2563eb'
  if (d.section === 'sga') return '#7c3aed'
  return '#dc2626'
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: WaterfallBarDatum }[]
  listPrice: number
}

function CustomTooltip({ active, payload, listPrice }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d?.name) return null

  const pctOfList = listPrice > 0 && !d.isStart && !d.isFinal
    ? ((d.value / listPrice) * 100).toFixed(1)
    : null
  const realizationPct = listPrice > 0
    ? ((d.originalCumulative / listPrice) * 100).toFixed(1)
    : null

  const sectionLabel =
    d.section === 'cogs' ? 'Cost of Goods Sold' :
    d.section === 'sga'  ? 'SG&A & Operations' :
    'Price Realization'

  const sectionColor =
    d.section === 'cogs' ? 'text-blue-700' :
    d.section === 'sga'  ? 'text-violet-700' :
    'text-red-700'

  return (
    <div className="bg-white border border-border-default rounded-lg shadow-lg px-3 py-2.5 text-xs min-w-[180px]">
      <p className="font-semibold text-text-primary mb-1.5">{d.name}</p>
      {d.isStart ? (
        <p className="text-text-secondary">List Price: <span className="font-medium text-text-primary">€{d.originalCumulative.toFixed(2)}/kg</span></p>
      ) : d.isFinal ? (
        <>
          <p className="text-text-secondary">Value: <span className="font-medium text-text-primary">€{d.originalCumulative.toFixed(2)}/kg</span></p>
          {realizationPct && (
            <p className="text-text-secondary">vs. List Price: <span className="font-medium text-text-primary">{realizationPct}%</span></p>
          )}
        </>
      ) : (
        <>
          <p className="text-text-secondary">Deduction: <span className="font-medium text-text-primary">−€{d.value.toFixed(2)}/kg</span></p>
          <p className="text-text-secondary">Running total: <span className="font-medium text-text-primary">€{d.originalCumulative.toFixed(2)}/kg</span></p>
          {pctOfList && (
            <p className="text-text-secondary">% of list: <span className="font-medium text-text-primary">−{pctOfList}%</span></p>
          )}
        </>
      )}
      <p className={`mt-1.5 pt-1.5 border-t border-border-default font-medium text-[10px] uppercase tracking-wide ${sectionColor}`}>
        {sectionLabel}
      </p>
    </div>
  )
}

interface WaterfallChartProps {
  data: WaterfallItem
}

// Section background definitions (no inline chart labels — legend rendered above chart)
const SECTION_AREAS = [
  { x1: 'List Price',          x2: 'Net-Net Price',        fill: 'rgba(220,38,38,0.04)' },
  { x1: 'Materials',           x2: 'Gross Margin',         fill: 'rgba(37,99,235,0.05)' },
  { x1: 'Transport & Freight', x2: 'Net Margin',           fill: 'rgba(124,58,237,0.05)' },
]

const SECTION_LEGEND = [
  { label: 'PRICING', color: '#dc2626' },
  { label: 'COGS',    color: '#2563eb' },
  { label: 'SG&A',    color: '#7c3aed' },
]

const SECTION_DIVIDERS = ['Net-Net Price', 'Gross Margin']

export function WaterfallChart({ data }: WaterfallChartProps) {
  const chartData = transformLayers(data.layers)
  const listPrice = data.layers[0]?.cumulative ?? 0
  const [animateOnMount, setAnimateOnMount] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAnimateOnMount(false), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Section legend */}
      <div className="flex gap-5 px-2 pb-1">
        {SECTION_LEGEND.map(s => (
          <span key={s.label} style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.06em' }}>
            ■ {s.label}
          </span>
        ))}
      </div>
      <div className="flex-1 min-h-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 36, right: 24, bottom: 55, left: 20 }} barCategoryGap="12%">
        {/* Section background bands */}
        {SECTION_AREAS.map(s => (
          <ReferenceArea
            key={s.x1}
            x1={s.x1}
            x2={s.x2}
            fill={s.fill}
          />
        ))}

        <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" vertical={false} />

        <XAxis
          dataKey="name"
          tick={{ fontSize: 9.5, fill: '#939598' }}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={55}
        />
        <YAxis
          tickFormatter={(v) => `€${(v as number).toFixed(2)}`}
          tick={{ fontSize: 10, fill: '#939598' }}
          domain={[0, 'dataMax + 0.5']}
          label={{ value: '€/kg', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: '#939598' } }}
        />

        <Tooltip content={(props) => <CustomTooltip active={props.active} payload={props.payload as unknown as { payload: WaterfallBarDatum }[]} listPrice={listPrice} />} />

        {/* Section divider lines */}
        {SECTION_DIVIDERS.map(name => (
          <ReferenceLine key={name} x={name} stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="4 2" />
        ))}


        <Bar dataKey="spacer" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar
          dataKey="value"
          stackId="wf"
          isAnimationActive={animateOnMount}
          animationDuration={1000}
          radius={[3, 3, 0, 0]}
        >
          {chartData.map((d, i) => (
            <Cell
              key={`cell-${i}`}
              fill={getFill(d)}
              stroke={d.isHighlighted ? '#eb8c00' : d.isFinal ? 'rgba(255,255,255,0.15)' : 'none'}
              strokeWidth={d.isHighlighted ? 2.5 : 0}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            offset={4}
            content={(props) => {
              const { x = 0, y = 0, width = 0, value = 0, index = 0 } = props as any
              const d = chartData[index]
              if (!d) return null
              const cx = (x as number) + (width as number) / 2
              const topY = y as number
              const euros = `€${(value as number).toFixed(2)}`
              const pct = !d.isStart && !d.isFinal && listPrice > 0
                ? `−${(d.value / listPrice * 100).toFixed(1)}%`
                : null
              return (
                <g>
                  <text x={cx} y={topY - 2} textAnchor="middle" fontSize={9} fill="#6d6e71" fontWeight={500}>{euros}</text>
                  {pct && <text x={cx} y={topY - 12} textAnchor="middle" fontSize={8} fill="#939598">{pct}</text>}
                </g>
              )
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
      </div>
    </div>
  )
}
