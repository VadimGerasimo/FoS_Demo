'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

const SCREEN_TITLES: Record<string, string> = {
  '/chat': 'Chat with Your Data',
  '/segmentation': 'Segmentation',
  '/cpq': 'CPQ',
  '/win-loss': 'Win / Loss Price Intelligence',
  '/ease-of-realization': 'Ease of Realization',
  '/waterfall': 'Price Waterfall',
  '/pvm': 'PVM Bridge',
}

export function TopBar() {
  const pathname = usePathname()
  const title = SCREEN_TITLES[pathname] ?? 'Equazion'

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-border-default shrink-0">
      <h1 className="text-base font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-1.5 rounded-lg hover:bg-page-bg transition-colors text-text-muted hover:text-text-primary">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-semibold">
            S
          </div>
          <span className="text-sm text-text-secondary font-medium">Sarah</span>
        </div>
      </div>
    </header>
  )
}
