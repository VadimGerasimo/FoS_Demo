'use client'

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Label,
  Cell,
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
}

function CustomDot({ cx = 0, cy = 0, payload, activeAccountId }: CustomDotProps) {
  if (!payload) return null
  const isActive = payload.accountId === activeAccountId
  const fill = ZONE_FILL[payload.zone] ?? '#6d6e71'
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
        <text
          x={cx + 12}
          y={cy + 4}
          fontSize={11}
          fontWeight={600}
          fill={fill}
        >
          {payload.accountName}
        </text>
      )}
    </g>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: SegmentationPoint }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const vsFloor = ((d.price - 4.57) / 4.57 * 100).toFixed(1)
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

export function SegmentationScatter({
  points,
  floorPrice,
  targetPrice,
  activeAccountId,
  prospectPoint,
  isAnimationActive = true,
}: SegmentationScatterProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
        <XAxis
          type="number"
          dataKey="volume"
          name="Volume"
          scale="log"
          domain={[100, 100000]}
          tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : String(v)}
          tick={{ fontSize: 11, fill: '#939598' }}
        >
          <Label value="Volume (kg/month)" position="bottom" offset={20} style={{ fontSize: 11, fill: '#939598' }} />
        </XAxis>
        <YAxis
          type="number"
          dataKey="price"
          name="Price"
          domain={[3.0, 6.5]}
          tickFormatter={(v) => `€${v.toFixed(2)}`}
          tick={{ fontSize: 11, fill: '#939598' }}
          width={60}
        >
          <Label value="€/kg" angle={-90} position="insideLeft" offset={10} style={{ fontSize: 11, fill: '#939598' }} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />

        {/* Floor reference line */}
        <ReferenceLine
          y={floorPrice}
          stroke="#dc2626"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{ value: `Floor €${floorPrice.toFixed(2)}`, position: 'insideTopRight', fontSize: 10, fill: '#dc2626' }}
        />

        {/* Target reference line */}
        <ReferenceLine
          y={targetPrice}
          stroke="#059669"
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{ value: `Target €${targetPrice.toFixed(2)}`, position: 'insideTopRight', fontSize: 10, fill: '#059669' }}
        />

        {/* Main scatter — all accounts */}
        <Scatter
          data={points}
          isAnimationActive={isAnimationActive}
          shape={(props: unknown) => <CustomDot {...(props as CustomDotProps)} activeAccountId={activeAccountId} />}
        />

        {/* Prospect ghost dot */}
        {prospectPoint && (
          <Scatter
            data={[{ ...prospectPoint, zone: 'amber', accountId: '__prospect__', accountName: 'New Prospect', segment: '' }]}
            fill="#eb8c00"
            opacity={0.6}
            isAnimationActive={true}
          >
            <Cell fill="#eb8c00" />
          </Scatter>
        )}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
