'use client'

interface ChartSkeletonProps {
  rows?: number
  showTitle?: boolean
  height?: string
}

export function ChartSkeleton({ rows = 1, showTitle = true, height = 'h-48' }: ChartSkeletonProps) {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {showTitle && (
        <div className="flex gap-3">
          <div className="h-3 bg-border-default rounded w-32" />
          <div className="h-3 bg-border-default rounded w-20 opacity-60" />
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-border-default rounded-lg`}
          style={{ opacity: Math.max(0.15, 0.4 - i * 0.08) }}
        />
      ))}
    </div>
  )
}
