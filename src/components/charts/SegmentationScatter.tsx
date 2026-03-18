'use client'

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Label,
  Customized,
} from 'recharts'
import type { SegmentationPoint } from '@/lib/data'

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
  const liveZone = payload.price < floorPrice ? 'red' : payload.price < targetPrice ? 'amber' : 'green'
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
      {isActive && (
        <g>
          <line x1={cx + r + 2} y1={cy} x2={cx + 20} y2={cy - 10} stroke={fill} strokeWidth={1} />
          <text x={cx + 22} y={cy - 12} fontSize={11} fontWeight={600} fill={fill}>
            {payload.accountName}
          </text>
        </g>
      )}
    </g>
  )
}

function makeTooltip(floorPrice: number) {
  return function TooltipContent({ active, payload }: { active?: boolean; payload?: Array<{ payload: SegmentationPoint }> }) {
    const d = payload?.[0]?.payload
    if (!active || !d?.accountId) return null
    const vsFloor = ((d.price - floorPrice) / floorPrice * 100).toFixed(1)
    return (
      <div className="bg-white border border-border-default rounded-lg shadow-md px-3 py-2.5 text-xs">
        <p className="font-semibold text-text-primary mb-1">{d.accountName}</p>
        <p className="text-text-secondary">Price: <span className="font-medium text-text-primary">€{d.price.toFixed(2)}/kg</span></p>
        <p className="text-text-secondary">Volume: <span className="font-medium text-text-primary">{d.volume.toLocaleString()} kg/mo</span></p>
        <p className="text-text-secondary">Segment: <span className="font-medium text-text-primary">{d.segment}</span></p>
        <p className={`font-medium mt-1 ${parseFloat(vsFloor) < 0 ? 'text-zone-red' : 'text-zone-green'}`}>
          {parseFloat(vsFloor) >= 0 ? '+' : ''}{vsFloor}% vs floor
        </p>
      </div>
    )
  }
}

const CURVE_VOLUMES = [150, 250, 400, 700, 1200, 5000, 15000, 50000]

function priceCurve(base: number, volumes: number[]): { volume: number; price: number }[] {
  return volumes.map(v => ({ volume: v, price: parseFloat((base * Math.pow(v / 320, -0.04)).toFixed(3)) }))
}

interface AxisScale {
  scale: (v: number) => number
}

export function SegmentationScatter({
  points,
  floorPrice,
  targetPrice,
  activeAccountId,
  prospectPoint,
  isAnimationActive = true,
}: SegmentationScatterProps) {
  const yMin = parseFloat((Math.min(floorPrice * 0.87, ...points.map(p => p.price)) - 0.1).toFixed(2))
  const yMax = parseFloat((Math.max(targetPrice * 1.12, ...points.map(p => p.price)) + 0.1).toFixed(2))

  const floorCurve = priceCurve(floorPrice, CURVE_VOLUMES)
  const targetCurve = priceCurve(targetPrice, CURVE_VOLUMES)

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 80, bottom: 40, left: 20 }}>
        <XAxis
          type="number"
          dataKey="volume"
          name="Volume"
          scale="log"
          domain={[150, 50000]}
          ticks={[150, 250, 400, 700, 2000, 10000, 50000]}
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
        <Tooltip content={makeTooltip(floorPrice)} />

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

        {/* Shaded band + right-edge labels */}
        <Customized
          component={(props: unknown) => {
            const { xAxisMap, yAxisMap } = props as { xAxisMap?: Record<string, AxisScale>; yAxisMap?: Record<string, AxisScale> }
            if (!xAxisMap || !yAxisMap) return null
            const xScale = Object.values(xAxisMap)[0]?.scale
            const yScale = Object.values(yAxisMap)[0]?.scale
            if (!xScale || !yScale) return null
            const topPoints = targetCurve.map(p => `${xScale(p.volume)},${yScale(p.price)}`).join(' ')
            const bottomPoints = [...floorCurve].reverse().map(p => `${xScale(p.volume)},${yScale(p.price)}`).join(' ')
            const lastFloor = floorCurve[floorCurve.length - 1]
            const lastTarget = targetCurve[targetCurve.length - 1]
            return (
              <g pointerEvents="none">
                <polygon points={`${topPoints} ${bottomPoints}`} fill="#059669" fillOpacity={0.07} stroke="none" />
                <text x={xScale(lastFloor.volume) + 6} y={yScale(lastFloor.price) + 4} fontSize={11} fontWeight={600} fill="#dc2626">
                  Floor €{floorPrice.toFixed(2)}
                </text>
                <text x={xScale(lastTarget.volume) + 6} y={yScale(lastTarget.price) + 4} fontSize={11} fontWeight={600} fill="#059669">
                  Target €{targetPrice.toFixed(2)}
                </text>
              </g>
            )
          }}
        />

        {/* Main scatter — all accounts */}
        <Scatter
          data={points}
          isAnimationActive={isAnimationActive}
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
