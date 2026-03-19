'use client'

import { useState } from 'react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  useXAxisScale,
  useYAxisScale,
} from 'recharts'
import type { SegmentationPoint } from '@/lib/data'
import { products as allProducts } from '@/lib/data'

function productName(productId: string): string {
  return allProducts.find(p => p.id === productId)?.name ?? productId
}

interface ProspectPoint {
  volume: number
  price: number
}

interface SegmentationScatterProps {
  points: SegmentationPoint[]
  floorPrice: number
  targetPrice: number
  activeAccountId: string | null
  prospectPoint?: ProspectPoint | null
  isAnimationActive?: boolean
}

const ZONE_FILL: Record<string, string> = {
  red: '#dc2626',
  amber: '#eb8c00',
  green: '#059669',
}

interface CustomDotProps {
  cx?: number
  cy?: number
  payload?: SegmentationPoint
  activeAccountId: string | null
  floorPrice: number
  targetPrice: number
}

function CustomDot({ cx = 0, cy = 0, payload, activeAccountId, floorPrice, targetPrice }: CustomDotProps) {
  if (!payload) return null
  const isActive = payload.accountId === activeAccountId
  const floorAtVol = priceCurve(floorPrice, [payload.volume])[0].price
  const targetAtVol = priceCurve(targetPrice, [payload.volume])[0].price
  const liveZone = payload.price < floorAtVol ? 'red' : payload.price < targetAtVol ? 'amber' : 'green'
  const fill = ZONE_FILL[liveZone] ?? '#6d6e71'
  const r = isActive ? 9 : 6
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={isActive ? '#fff' : 'transparent'}
        strokeWidth={isActive ? 2.5 : 0}
        opacity={isActive ? 1 : 0.65}
      />
      {isActive && (() => {
        const label1 = payload.accountName
        const label2 = productName(payload.productId)
        const padX = 10
        const padY = 5
        const lineH = 14
        const gap = 2
        const charW = 6.2
        const textW = Math.max(label1.length, label2.length) * charW
        const boxW = textW + padX * 2
        const boxH = lineH * 2 + gap + padY * 2
        const offsetY = 16
        const labelX = cx - boxW / 2
        const labelY = cy - r - offsetY - boxH
        const arrowTipY = cy - r - 4
        const arrowBaseY = labelY + boxH
        return (
          <g>
            {/* Connector arrow */}
            <line x1={cx} y1={arrowTipY} x2={cx} y2={arrowBaseY} stroke={fill} strokeWidth={1} opacity={0.5} />
            {/* Drop shadow */}
            <rect x={labelX + 1} y={labelY + 1} width={boxW} height={boxH} rx={6} fill="#000" opacity={0.08} />
            {/* Background pill */}
            <rect x={labelX} y={labelY} width={boxW} height={boxH} rx={6} fill="white" stroke={fill} strokeWidth={1.25} />
            {/* Accent bar */}
            <rect x={labelX} y={labelY} width={3.5} height={boxH} rx={2} fill={fill} />
            {/* Account name */}
            <text x={labelX + padX + 2} y={labelY + padY + lineH - 2} fontSize={11} fontWeight={700} fill="#2d2d2d">
              {label1}
            </text>
            {/* Product name */}
            <text x={labelX + padX + 2} y={labelY + padY + lineH + gap + lineH - 2} fontSize={10} fontWeight={500} fill={fill}>
              {label2}
            </text>
          </g>
        )
      })()}
    </g>
  )
}

function makeTooltip(floorPrice: number, targetPrice: number) {
  return function TooltipContent(props: any) {
    const d = props?.payload?.[0]?.payload as SegmentationPoint | undefined
    if (!props?.active || !d?.accountId) return null
    const floorAtVol = priceCurve(floorPrice, [d.volume])[0].price
    const targetAtVol = priceCurve(targetPrice, [d.volume])[0].price
    const vsFloor = ((d.price - floorAtVol) / floorAtVol * 100).toFixed(1)
    const vsTarget = ((d.price - targetAtVol) / targetAtVol * 100).toFixed(1)
    return (
      <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2.5 text-xs">
        <p className="font-semibold text-text-primary mb-1">{d.accountName}</p>
        <p className="text-text-secondary">Product: <span className="font-medium text-text-primary">{productName(d.productId)}</span></p>
        <p className="text-text-secondary">Price: <span className="font-medium text-text-primary">€{d.price.toFixed(2)}/kg</span></p>
        <p className="text-text-secondary">Volume: <span className="font-medium text-text-primary">{d.volume.toLocaleString()} kg/mo</span></p>
        <p className="text-text-secondary">Segment: <span className="font-medium text-text-primary">{d.segment}</span></p>
        <div className="mt-1.5 pt-1.5 border-t border-gray-100 space-y-0.5">
          <p style={{ color: '#dc2626' }}>Floor @ vol: <span className="font-semibold">€{floorAtVol.toFixed(2)}/kg</span></p>
          <p style={{ color: '#059669' }}>Target @ vol: <span className="font-semibold">€{targetAtVol.toFixed(2)}/kg</span></p>
          <p className={`font-medium mt-0.5 ${parseFloat(vsFloor) < 0 ? 'text-zone-red' : parseFloat(vsFloor) < ((targetAtVol - floorAtVol) / floorAtVol * 100) ? 'text-zone-amber' : 'text-zone-green'}`}>
            {parseFloat(vsFloor) >= 0 ? '+' : ''}{vsFloor}% vs floor · {parseFloat(vsTarget) >= 0 ? '+' : ''}{vsTarget}% vs target
          </p>
        </div>
      </div>
    )
  }
}

const ALL_X_TICKS = [150, 250, 400, 700, 1200, 1500, 2000, 5000, 10000, 20000, 50000]
const CURVE_VOLUMES = [150, 250, 400, 700, 1200, 1500, 5000, 15000, 50000]
const FLATTEN_AT = 700

function priceCurve(base: number, volumes: number[]): { volume: number; price: number }[] {
  return volumes.map(v => ({ volume: v, price: parseFloat((base * Math.pow(Math.min(v, FLATTEN_AT) / 320, -0.04)).toFixed(3)) }))
}

interface ChartOverlayProps {
  floorCurve: { volume: number; price: number }[]
  targetCurve: { volume: number; price: number }[]
  floorPrice: number
  targetPrice: number
  hoveredPoint: SegmentationPoint | null
  xLabelVol: number
}

function ChartOverlay({ floorCurve, targetCurve, floorPrice, targetPrice, hoveredPoint, xLabelVol }: ChartOverlayProps) {
  const xScale = useXAxisScale()
  const yScale = useYAxisScale()
  if (!xScale || !yScale) return null

  const topPoints = targetCurve.map(p => `${xScale(p.volume)},${yScale(p.price)}`).join(' ')
  const bottomPoints = [...floorCurve].reverse().map(p => `${xScale(p.volume)},${yScale(p.price)}`).join(' ')

  // Labels anchored at the label volume (within visible domain)
  const labelX = xScale(xLabelVol) ?? 0
  const floorLabelY = yScale(priceCurve(floorPrice, [xLabelVol])[0].price) ?? 0
  const targetLabelY = yScale(priceCurve(targetPrice, [xLabelVol])[0].price) ?? 0

  let connector = null
  if (hoveredPoint) {
    const floorAtVol = priceCurve(floorPrice, [hoveredPoint.volume])[0].price
    const targetAtVol = priceCurve(targetPrice, [hoveredPoint.volume])[0].price
    const xPos = xScale(hoveredPoint.volume) ?? 0
    const yFloor = yScale(floorAtVol) ?? 0
    const yTarget = yScale(targetAtVol) ?? 0
    const yDot = yScale(hoveredPoint.price) ?? 0
    const yTop = Math.min(yFloor, yTarget, yDot)
    const yBottom = Math.max(yFloor, yTarget, yDot)
    connector = (
      <line x1={xPos} y1={yTop} x2={xPos} y2={yBottom} stroke="#94a3b8" strokeDasharray="3 2" strokeWidth={1} opacity={0.7} />
    )
  }

  return (
    <g pointerEvents="none">
      <polygon points={`${topPoints} ${bottomPoints}`} fill="#059669" fillOpacity={0.07} stroke="none" />
      <text x={labelX + 6} y={targetLabelY - 6} fontSize={10} fontWeight={600} fill="#059669">Segment target</text>
      <text x={labelX + 6} y={floorLabelY + 14} fontSize={10} fontWeight={600} fill="#dc2626">Segment floor</text>
      {connector}
    </g>
  )
}

export function SegmentationScatter({
  points,
  floorPrice,
  targetPrice,
  activeAccountId,
  prospectPoint,
  isAnimationActive = true,
}: SegmentationScatterProps) {
  const [hoveredPoint, setHoveredPoint] = useState<SegmentationPoint | null>(null)

  const yMin = parseFloat((Math.min(floorPrice * 0.87, ...points.map(p => p.price)) - 0.1).toFixed(2))
  const yMax = parseFloat((Math.max(targetPrice * 1.12, ...points.map(p => p.price)) + 0.1).toFixed(2))

  // Dynamic x-axis: one tick below min volume, one tick above max volume
  const volMin = points.length ? Math.min(...points.map(p => p.volume)) : 150
  const volMax = points.length ? Math.max(...points.map(p => p.volume)) : 50000
  const xMinIdx = Math.max(0, ALL_X_TICKS.findIndex(t => t > volMin * 0.8) - 1)
  const rawMaxIdx = ALL_X_TICKS.findIndex(t => t >= Math.max(volMax * 1.3, 1500))
  const xMaxIdx = rawMaxIdx === -1 ? ALL_X_TICKS.length - 1 : rawMaxIdx
  const xMin = ALL_X_TICKS[xMinIdx]
  const xMax = ALL_X_TICKS[xMaxIdx]
  const visibleTicks = ALL_X_TICKS.slice(xMinIdx, xMaxIdx + 1)
  const xLabelVol = visibleTicks[Math.max(0, visibleTicks.length - 2)]

  const visibleCurveVols = CURVE_VOLUMES.filter(v => v >= xMin && v <= xMax)
  const floorCurve = priceCurve(floorPrice, visibleCurveVols)
  const targetCurve = priceCurve(targetPrice, visibleCurveVols)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 80, bottom: 40, left: 20 }}>
        <XAxis
          type="number"
          dataKey="volume"
          name="Volume"
          scale="log"
          domain={[xMin, xMax]}
          ticks={visibleTicks}
          allowDataOverflow={false}
          tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : String(v)}
          tick={{ fontSize: 11, fill: '#939598' }}
        >
          <Label value="Volume (kg/month)" position="bottom" offset={20} style={{ fontSize: 11, fill: '#939598' }} />
        </XAxis>
        <YAxis
          type="number"
          dataKey="price"
          name="Price"
          domain={[yMin, yMax]}
          tickFormatter={(v) => `€${v.toFixed(2)}`}
          tick={{ fontSize: 11, fill: '#939598' }}
          width={60}
        >
          <Label value="€/kg" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 11, fill: '#939598' }} />
        </YAxis>
        <Tooltip content={makeTooltip(floorPrice, targetPrice)} />

        {/* Floor curve */}
        <Line
          data={floorCurve}
          dataKey="price"
          stroke="#dc2626"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          legendType="none"
        />

        {/* Target curve */}
        <Line
          data={targetCurve}
          dataKey="price"
          stroke="#059669"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          legendType="none"
        />

        {/* Shaded band + curve labels + hover connector — recharts 3 direct child */}
        <ChartOverlay
          floorCurve={floorCurve}
          targetCurve={targetCurve}
          floorPrice={floorPrice}
          targetPrice={targetPrice}
          hoveredPoint={hoveredPoint}
          xLabelVol={xLabelVol}
        />

        {/* Hover markers — dots on floor/target curves (adding this Scatter triggers recharts to re-render Customized) */}
        {hoveredPoint && (() => {
          const floorAtVol = priceCurve(floorPrice, [hoveredPoint.volume])[0].price
          const targetAtVol = priceCurve(targetPrice, [hoveredPoint.volume])[0].price
          return (
            <Scatter
              data={[
                { volume: hoveredPoint.volume, price: floorAtVol, _markerType: 'floor' },
                { volume: hoveredPoint.volume, price: targetAtVol, _markerType: 'target' },
              ]}
              isAnimationActive={false}
              shape={(props: unknown) => {
                const p = props as { cx?: number; cy?: number; payload?: { _markerType: string; price: number } }
                if (p.cx === undefined || p.cy === undefined || !p.payload) return null
                const isFloor = p.payload._markerType === 'floor'
                const color = isFloor ? '#dc2626' : '#059669'
                const priceVal = p.payload.price
                return (
                  <g pointerEvents="none">
                    <circle cx={p.cx} cy={p.cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
                    <rect x={p.cx + 8} y={p.cy - 9} width={52} height={14} fill="white" rx={2} stroke={color} strokeWidth={0.75} opacity={0.95} />
                    <text x={p.cx + 12} y={p.cy + 1} fontSize={10} fontWeight={700} fill={color}>€{priceVal.toFixed(2)}/kg</text>
                  </g>
                )
              }}
            />
          )
        })()}

        {/* Main scatter — all accounts */}
        <Scatter
          data={points}
          isAnimationActive={isAnimationActive}
          onMouseEnter={(data: unknown) => {
            const d = data as SegmentationPoint
            if (d?.accountId) setHoveredPoint(d)
          }}
          onMouseLeave={() => setHoveredPoint(null)}
          shape={(props: unknown) => (
            <CustomDot
              {...(props as CustomDotProps)}
              activeAccountId={activeAccountId}
              floorPrice={floorPrice}
              targetPrice={targetPrice}
            />
          )}
        />

        {/* Prospect ghost dot */}
        {prospectPoint && (
          <Scatter
            data={[{ ...prospectPoint, zone: 'amber', accountId: '__prospect__', accountName: 'New Prospect', segment: '' }]}
            fill="#eb8c00"
            opacity={0.6}
            isAnimationActive={true}
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
