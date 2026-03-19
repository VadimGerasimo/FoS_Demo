'use client'
import { Construction } from 'lucide-react'

const HEATMAP_ROWS = [
  [0.08, 0.35, 0.12, 0.05, 0.18, 0.07, 0.28, 0.10],
  [0.22, 0.10, 0.45, 0.08, 0.12, 0.30, 0.06, 0.15],
  [0.06, 0.18, 0.09, 0.32, 0.07, 0.14, 0.40, 0.08],
  [0.30, 0.08, 0.16, 0.12, 0.38, 0.09, 0.11, 0.25],
  [0.10, 0.25, 0.07, 0.20, 0.08, 0.42, 0.13, 0.06],
  [0.15, 0.06, 0.22, 0.09, 0.17, 0.08, 0.35, 0.12],
]

const SCATTER_DOTS = [
  { x: '12%', y: '60%', size: 32, opacity: 0.20 },
  { x: '28%', y: '25%', size: 20, opacity: 0.35 },
  { x: '42%', y: '70%', size: 44, opacity: 0.15 },
  { x: '55%', y: '35%', size: 28, opacity: 0.40 },
  { x: '68%', y: '55%', size: 18, opacity: 0.28 },
  { x: '78%', y: '20%', size: 36, opacity: 0.22 },
  { x: '20%', y: '80%', size: 22, opacity: 0.30 },
  { x: '35%', y: '45%', size: 40, opacity: 0.18 },
  { x: '62%', y: '75%', size: 26, opacity: 0.35 },
  { x: '85%', y: '40%', size: 16, opacity: 0.42 },
  { x: '48%', y: '15%', size: 30, opacity: 0.25 },
  { x: '72%', y: '85%', size: 38, opacity: 0.16 },
  { x: '8%',  y: '35%', size: 24, opacity: 0.32 },
  { x: '92%', y: '65%', size: 20, opacity: 0.38 },
]

const BAR_HEIGHTS = ['55%', '80%', '38%', '65%', '42%', '72%']

interface SkeletonChartProps {
  variant: 'heatmap' | 'line' | 'scatter' | 'bar' | 'multiline'
  height: string
}

function SkeletonChart({ variant, height }: SkeletonChartProps) {
  if (variant === 'heatmap') {
    return (
      <div className={`${height} relative overflow-hidden opacity-50`}>
        <div className="flex flex-col gap-1 h-full">
          <div className="grid grid-cols-8 gap-1 pl-10">
            {['Milk Couv.','Dark 72%','White Comp.','Cocoa Pwd','Filling','Praline','Dark 54%','Compound'].map(h => (
              <div key={h} className="h-2 bg-border-default rounded opacity-40" />
            ))}
          </div>
          {HEATMAP_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1 flex-1">
              <div className="w-8 h-full bg-border-default rounded opacity-30 shrink-0" />
              <div className="grid grid-cols-8 gap-1 flex-1">
                {row.map((opacity, ci) => (
                  <div key={ci} className="rounded-sm" style={{ backgroundColor: opacity > 0.2 ? '#dc2626' : '#eb8c00', opacity }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'line') {
    return (
      <div className={`${height} relative overflow-hidden opacity-50`}>
        <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="40" x2="400" y2="40" stroke="#e7e7e8" strokeWidth="1" />
          <line x1="0" y1="80" x2="400" y2="80" stroke="#e7e7e8" strokeWidth="1" />
          <line x1="0" y1="120" x2="400" y2="120" stroke="#e7e7e8" strokeWidth="1" />
          <line x1="0" y1="160" x2="400" y2="160" stroke="#e7e7e8" strokeWidth="1" />
          <path d="M 0 140 C 80 130, 160 90, 240 60 C 300 38, 350 30, 400 25" fill="none" stroke="#eb8c00" strokeWidth="2" opacity="0.35" />
          <line x1="160" y1="0" x2="160" y2="160" stroke="#939598" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <text x="40" y="155" fontSize="10" fill="#939598" opacity="0.5">−10%</text>
          <text x="140" y="155" fontSize="10" fill="#939598" opacity="0.5">Current</text>
          <text x="300" y="155" fontSize="10" fill="#939598" opacity="0.5">+10%</text>
        </svg>
      </div>
    )
  }

  if (variant === 'multiline') {
    return (
      <div className={`${height} relative overflow-hidden opacity-50`}>
        <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
          <line x1="0" y1="40" x2="400" y2="40" stroke="#e7e7e8" strokeWidth="1" />
          <line x1="0" y1="80" x2="400" y2="80" stroke="#e7e7e8" strokeWidth="1" />
          <line x1="0" y1="120" x2="400" y2="120" stroke="#e7e7e8" strokeWidth="1" />
          <line x1="0" y1="160" x2="400" y2="160" stroke="#e7e7e8" strokeWidth="1" />
          <path d="M 0 120 C 80 110, 160 70, 240 40 C 300 18, 350 10, 400 8" fill="none" stroke="#eb8c00" strokeWidth="2" opacity="0.3" />
          <path d="M 0 100 C 80 95, 160 85, 240 75 C 300 68, 350 65, 400 62" fill="none" stroke="#6d6e71" strokeWidth="2" opacity="0.3" />
          <path d="M 0 140 C 80 135, 160 125, 240 110 C 300 98, 350 92, 400 88" fill="none" stroke="#059669" strokeWidth="2" opacity="0.3" />
          <text x="10" y="155" fontSize="10" fill="#939598" opacity="0.5">Jan 24</text>
          <text x="160" y="155" fontSize="10" fill="#939598" opacity="0.5">Jan 25</text>
          <text x="330" y="155" fontSize="10" fill="#939598" opacity="0.5">Jan 26</text>
        </svg>
      </div>
    )
  }

  if (variant === 'scatter') {
    return (
      <div className={`${height} relative overflow-hidden opacity-50`}>
        {SCATTER_DOTS.map((dot, i) => (
          <div
            key={i}
            style={{
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              opacity: dot.opacity,
              backgroundColor: '#eb8c00',
              borderRadius: '50%',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    )
  }

  // bar
  return (
    <div className={`${height} relative overflow-hidden opacity-50`}>
      <div className="flex items-end gap-2 h-full px-2 pb-4">
        {BAR_HEIGHTS.map((h, i) => (
          <div key={i} style={{ height: h, flex: 1 }} className="bg-border-strong rounded-t opacity-50" />
        ))}
      </div>
    </div>
  )
}

interface TeaserPageProps {
  subtitle: string
  skeletons: {
    label: string
    variant: 'heatmap' | 'line' | 'scatter' | 'bar' | 'multiline'
    height?: string
    wide?: boolean
  }[]
}

export function TeaserPage({ subtitle, skeletons }: TeaserPageProps) {
  return (
    <div className="flex flex-col h-full p-6 gap-5 animate-fade-in">

      {/* In Development banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-zone-amber-bg border border-zone-amber/25 rounded-xl">
        <Construction size={15} className="text-pwc-orange shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-pwc-orange-dark">This module is in development</p>
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          <p className="text-xs text-text-muted mt-1">
            Contact your PwC team to discuss prioritisation and timeline.
          </p>
        </div>
      </div>

      {/* Skeleton grid */}
      <div className="flex flex-wrap gap-4 flex-1">
        {skeletons.map(skeleton => (
          <div
            key={skeleton.label}
            className={`card p-4 flex flex-col gap-3 ${skeleton.wide ? 'flex-1 min-w-[300px]' : 'flex-1 min-w-[240px]'}`}
          >
            <p className="text-xs font-semibold text-text-secondary opacity-40">
              {skeleton.label}
            </p>
            <SkeletonChart variant={skeleton.variant} height={skeleton.height ?? 'h-48'} />
          </div>
        ))}
      </div>

    </div>
  )
}
