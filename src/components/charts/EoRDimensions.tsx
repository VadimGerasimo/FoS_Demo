'use client'

interface EoRDimensionsProps {
  dimensions: { name: string; score: number; driverNote: string }[]
}

export function EoRDimensions({ dimensions }: EoRDimensionsProps) {
  return (
    <div>
      {dimensions.map(d => (
        <div key={d.name} className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-primary">{d.name}</span>
            <span className={`text-xs font-bold ${d.score >= 7 ? 'text-zone-green' : d.score >= 5 ? 'text-zone-amber' : 'text-zone-red'}`}>
              {d.score.toFixed(1)}
            </span>
          </div>
          <div className="w-full h-2 bg-page-bg rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${d.score >= 7 ? 'bg-zone-green' : d.score >= 5 ? 'bg-zone-amber' : 'bg-zone-red'}`}
              style={{ width: `${d.score * 10}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1">{d.driverNote}</p>
        </div>
      ))}
    </div>
  )
}
