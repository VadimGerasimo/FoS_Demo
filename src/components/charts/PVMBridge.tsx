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
} from 'recharts'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { PVMData } from '@/lib/data'
import type { BucketKey } from '@/lib/pvmInsights'

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

// ─── Alert logic ──────────────────────────────────────────────────────────────
function getAlertConfig(d: PVMData): { message: string; severity: 'high' | 'medium' | 'info' } | null {
  const { volumeEffect: vol, priceEffect: price, mixEffect: mix } = d
  if (vol > 0 && price < 0 && mix < 0)
    return { message: 'Both price and mix are negative while volume grows. This indicates discounting-driven growth; revenue quality is declining even as top-line holds.', severity: 'high' }
  if (vol < 0 && price < 0 && mix < 0)
    return { message: 'Critical: revenue declining across all three drivers. Escalate to commercial review.', severity: 'high' }
  if (price < 0 && mix < 0 && vol <= 0)
    return { message: 'Price and mix erosion without volume offset. This signals pure commercial quality deterioration.', severity: 'high' }
  if (price > 0 && vol < 0)
    return { message: 'Monitor: volume declined following price action. Assess demand elasticity.', severity: 'medium' }
  if (Math.abs(mix) > Math.abs(price) && mix < 0 && price > 0)
    return { message: 'Mix erosion is outpacing price gains; net yield is declining despite price improvement.', severity: 'medium' }
  if (vol < 0 && price < 0 && mix > 0)
    return { message: 'Positive signal: Revenue quality improving as lower-margin volume is shed.', severity: 'info' }
  return null
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const BUCKET_DEFINITIONS: Record<string, string> = {
  Volume: 'Revenue change from selling more or fewer units, holding prior-period prices and mix constant.',
  Price: 'Revenue change from realized price movements on the same products, isolating rate changes from volume or portfolio shifts.',
  Mix: 'Revenue change from portfolio composition shift: selling proportionally more of lower-value vs higher-value products.',
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: PVMBarDatum }[]
  data: PVMData
}

function CustomTooltip({ active, payload, data }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  if (!d?.name) return null

  const isAnchor = d.isAnchor
  const isEffect = !isAnchor

  if (isAnchor) {
    const totalValue = d.name === 'Prior Period' ? data.priorRevenue : data.currentRevenue
    return (
      <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2.5 text-xs min-w-[160px]">
        <p className="font-semibold mb-2 text-text-muted">{d.name}</p>
        <p className="font-bold text-base mb-2 text-text-primary">{fmt(totalValue)}</p>
        <div className="border-t border-border-default pt-2 flex flex-col gap-1">
          {data.products.map(p => (
            <div key={p.productId} className="flex justify-between gap-4">
              <span className="text-text-muted">{p.productName}</span>
              <span className="font-medium text-text-primary">{fmt(d.name === 'Prior Period' ? p.priorRevenue : p.currentRevenue)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isEffect) {
    const effectValue = d.name === 'Volume'
      ? data.volumeEffect
      : d.name === 'Price'
      ? data.priceEffect
      : data.mixEffect

    const topProduct = [...data.products].sort((a, b) => {
      const aVal = d.name === 'Volume' ? a.volumeEffect : d.name === 'Price' ? a.priceEffect : a.mixEffect
      const bVal = d.name === 'Volume' ? b.volumeEffect : d.name === 'Price' ? b.priceEffect : b.mixEffect
      return Math.abs(bVal) - Math.abs(aVal)
    })[0]

    const topProductVal = topProduct
      ? (d.name === 'Volume' ? topProduct.volumeEffect : d.name === 'Price' ? topProduct.priceEffect : topProduct.mixEffect)
      : 0

    const isPositive = effectValue >= 0
    const definition = BUCKET_DEFINITIONS[d.name]

    return (
      <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2.5 text-xs min-w-[200px]">
        <p className="font-semibold mb-1 text-text-muted">{d.name} Effect</p>
        <p className={`font-bold text-base mb-2 ${isPositive ? 'text-zone-green' : 'text-zone-red'}`}>
          {fmtEffect(effectValue)}
        </p>
        {definition && (
          <p className="text-text-muted text-[10px] leading-relaxed mb-2 border-t border-border-default pt-2">{definition}</p>
        )}
        {topProduct && (
          <div className="border-t border-border-default pt-2">
            <p className="text-text-muted mb-1">Largest driver</p>
            <div className="flex justify-between gap-4">
              <span className="text-text-primary">{topProduct.productName}</span>
              <span className={`font-medium ${topProductVal >= 0 ? 'text-zone-green' : 'text-zone-red'}`}>
                {fmtEffect(topProductVal)}
              </span>
            </div>
          </div>
        )}
        <p className="text-text-muted text-[10px] mt-2 border-t border-border-default pt-2">Click to explore →</p>
      </div>
    )
  }

  return null
}

// ─── Custom X-Axis Tick ────────────────────────────────────────────────────────
function CustomXTick(props: {
  x?: number
  y?: number
  payload?: { value: string }
}) {
  const { x = 0, y = 0, payload } = props
  const label = payload?.value ?? ''
  const definition = BUCKET_DEFINITIONS[label]

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fill="#939598"
        fontSize={11}
      >
        {label}
      </text>
      {definition && (
        <text
          x={12}
          y={0}
          dy={14}
          textAnchor="start"
          fill="#c4b5a0"
          fontSize={9}
          style={{ cursor: 'help' }}
        >
          <title>{definition}</title>
          (?)
        </text>
      )}
    </g>
  )
}

const PERIOD_OPTIONS = ['YTD 2026 vs YTD 2025', 'Q4 2026 vs Q4 2025']

interface PVMBridgeProps {
  data: PVMData
  selectedBarName?: BucketKey | null
  onBarSelect?: (barName: BucketKey | null) => void
}

export function PVMBridge({ data, selectedBarName, onBarSelect }: PVMBridgeProps) {
  const [period, setPeriod] = useState(PERIOD_OPTIONS[0])
  const [animateOnMount, setAnimateOnMount] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setAnimateOnMount(false), 1200)
    return () => clearTimeout(t)
  }, [])

  const chartData = transformPVM(data)

  function handleBarClick(barDatum: PVMBarDatum) {
    if (barDatum.isAnchor) return
    const key = barDatum.name.toLowerCase() as BucketKey
    if (selectedBarName === key) {
      onBarSelect?.(null)
    } else {
      onBarSelect?.(key)
    }
  }

  const alert = getAlertConfig(data)
  const alertStyles = {
    high: 'bg-zone-amber-bg border-zone-amber/30 text-zone-amber',
    medium: 'bg-blue-50 border-blue-200 text-blue-700',
    info: 'bg-zone-green/10 border-zone-green/30 text-zone-green',
  }

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

      {/* Alert banner */}
      {alert && (
        <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium ${alertStyles[alert.severity]}`}>
          <AlertTriangle size={13} className="shrink-0" />
          {alert.message}
        </div>
      )}

      {/* Chart */}
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 24, right: 24, bottom: 20, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e7e8" vertical={false} />
            <XAxis
              dataKey="name"
              tick={<CustomXTick />}
            />
            <YAxis
              tickFormatter={(v) => `€${((v as number) / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fill: '#939598' }}
              width={50}
            />
            <Tooltip content={(props) => (
              <CustomTooltip
                active={props.active}
                payload={props.payload as unknown as { payload: PVMBarDatum }[] | undefined}
                data={data}
              />
            )} />


            <Bar
              dataKey="spacer"
              stackId="pvm"
              fill="transparent"
              isAnimationActive={false}
              onClick={(d: unknown) => handleBarClick(d as PVMBarDatum)}
              style={{ cursor: 'pointer' }}
            />
            <Bar
              dataKey="value"
              stackId="pvm"
              isAnimationActive={animateOnMount}
              animationDuration={900}
              radius={[3, 3, 0, 0]}
              onClick={(d: unknown) => handleBarClick(d as PVMBarDatum)}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((d, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={getFill(d)}
                  opacity={
                    selectedBarName !== null &&
                    selectedBarName !== undefined &&
                    !d.isAnchor &&
                    d.name.toLowerCase() !== selectedBarName
                      ? 0.35
                      : 1
                  }
                  style={{ cursor: d.isAnchor ? 'default' : 'pointer' }}
                />
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
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Prior rev</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Vol effect</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Price effect</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Mix effect</th>
              <th className="text-right px-3 py-2 font-semibold text-text-secondary">Current rev</th>
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
                <td className="px-3 py-2 text-right">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    p.delta >= 0
                      ? 'bg-zone-green/10 text-zone-green'
                      : 'bg-zone-red/10 text-zone-red'
                  }`}>
                    {p.delta >= 0 ? '+' : ''}{p.delta.toFixed(1)}%
                  </span>
                </td>
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
              <td className="px-3 py-2 text-right">
                {(() => {
                  const totalDelta = ((data.currentRevenue - data.priorRevenue) / data.priorRevenue) * 100
                  return (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      totalDelta >= 0
                        ? 'bg-zone-green/10 text-zone-green'
                        : 'bg-zone-red/10 text-zone-red'
                    }`}>
                      {totalDelta >= 0 ? '+' : ''}{totalDelta.toFixed(1)}%
                    </span>
                  )
                })()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
