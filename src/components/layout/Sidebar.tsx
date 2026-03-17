'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { EquazionLogo } from '@/components/shared/EquazionLogo'
import {
  MessageSquare,
  ScatterChart,
  Calculator,
  TrendingUp,
  BarChart2,
  Layers,
  GitBranch,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/chat', label: 'Chat with Your Data', icon: MessageSquare },
  { href: '/segmentation', label: 'Segmentation', icon: ScatterChart },
  { href: '/cpq', label: 'CPQ', icon: Calculator },
  { href: '/win-loss', label: 'Win / Loss', icon: TrendingUp },
  { href: '/ease-of-realization', label: 'Ease of Realization', icon: BarChart2 },
  { href: '/waterfall', label: 'Price Waterfall', icon: Layers },
  { href: '/pvm', label: 'PVM Bridge', icon: GitBranch },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar-bg shrink-0">
      {/* Logo */}
      <div className="flex items-center px-5 py-5 border-b border-white/10">
        <EquazionLogo bg="rgb(50,51,54)" fontSize={28} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 py-4 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-active text-pwc-orange font-medium'
                  : 'text-white/70 hover:text-white hover:bg-sidebar-hover'
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* PwC Footer */}
      <div className="flex items-center gap-2 px-5 py-4 border-t border-white/10">
        <Image
          src="/pwc-logo-white.svg"
          alt="PwC"
          width={36}
          height={18}
          className="opacity-60"
        />
        <span className="text-white/40 text-xs">Commercial Intelligence</span>
      </div>
    </aside>
  )
}
