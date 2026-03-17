'use client'

interface FadeWrapperProps {
  fadeKey: string
  children: React.ReactNode
  className?: string
}

export function FadeWrapper({ fadeKey, children, className }: FadeWrapperProps) {
  return (
    <div key={fadeKey} className={`animate-fade-in ${className ?? ''}`}>
      {children}
    </div>
  )
}
