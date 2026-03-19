'use client'

import { usePathname } from 'next/navigation'

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="animate-page-in h-full">
      {children}
    </div>
  )
}
