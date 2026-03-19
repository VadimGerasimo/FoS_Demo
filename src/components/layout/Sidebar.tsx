'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { EquazionLogo } from '@/components/shared/EquazionLogo'
import {
  MessageSquare,
  ScatterChart,
  Calculator,
  Target,
  Layers,
  GitBranch,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/ask-your-data', label: 'Ask Your Data', icon: MessageSquare },
  { href: '/segmentation', label: 'Segmentation', icon: ScatterChart },
  { href: '/cpq', label: 'CPQ', icon: Calculator },
  { href: '/deal-intelligence', label: 'Deal Intelligence', icon: Target },
  { href: '/waterfall', label: 'Price Waterfall', icon: Layers },
  { href: '/pvm', label: 'Price-Volume-Mix', icon: GitBranch },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('equazion-sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapse() {
    setCollapsed(v => {
      localStorage.setItem('equazion-sidebar-collapsed', String(!v))
      return !v
    })
  }

  return (
    <aside
      className={clsx(
        'relative flex flex-col min-h-screen bg-sidebar-bg shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo area */}
      <div className="flex items-center px-5 py-5 border-b border-white/10 min-h-[68px]">
        <div className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
          <EquazionLogo bg="rgb(50,51,54)" fontSize={28} />
        </div>
      </div>

      {/* Toggle button — overlaps right edge */}
      <button
        onClick={toggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-[52px] -right-3 z-10 w-6 h-6 rounded-full bg-sidebar-bg border border-white/20 text-white/60 hover:text-white flex items-center justify-center shadow-md"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-2 py-4 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center rounded-lg text-sm transition-colors',
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                isActive
                  ? 'bg-sidebar-active text-pwc-orange font-medium'
                  : 'text-white/70 hover:text-white hover:bg-sidebar-hover'
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* PwC Footer */}
      <div className={clsx('flex items-center gap-2 px-5 py-4 border-t border-white/10', collapsed && 'justify-center px-2')}>
        <Image src="/pwc-logo-white.svg" alt="PwC" width={collapsed ? 24 : 36} height={18} className="opacity-60" />
        <span className={`overflow-hidden transition-[opacity,max-width] duration-150 ease-in-out whitespace-nowrap text-white/40 text-xs ${collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'}`}>
          Commercial Intelligence
        </span>
      </div>
    </aside>
  )
}
