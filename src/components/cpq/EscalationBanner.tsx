'use client'

import { AlertTriangle, Clock, ShieldAlert } from 'lucide-react'
import { useState, useEffect } from 'react'

export type EscalationLevel = 'none' | 'rep' | 'manager' | 'director'

interface EscalationBannerProps {
  level: EscalationLevel
  discountPct: number
}

const ESCALATION_CONFIG = {
  none: null,
  rep: {
    icon: AlertTriangle,
    bg: 'bg-zone-amber-bg border-zone-amber/30',
    text: 'text-zone-amber',
    title: 'Manager approval required',
    message: 'This discount level requires sign-off before submission.',
  },
  manager: {
    icon: Clock,
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-600',
    title: 'Request sent to manager',
    message: 'Awaiting manager approval — typical response time 15 minutes.',
  },
  director: {
    icon: ShieldAlert,
    bg: 'bg-zone-red-bg border-zone-red/30',
    text: 'text-zone-red',
    title: 'Director sign-off required',
    message: 'This discount level requires director approval. Deal is on hold.',
  },
}

export function EscalationBanner({ level, discountPct: _discountPct }: EscalationBannerProps) {
  const [managerSent, setManagerSent] = useState(false)
  const [sending, setSending] = useState(false)

  // Auto-simulate "sent" after 2s when manager escalation fires
  useEffect(() => {
    if (level === 'manager' && !managerSent) {
      setSending(true)
      const t = setTimeout(() => { setSending(false); setManagerSent(true) }, 2000)
      return () => clearTimeout(t)
    }
    if (level !== 'manager') {
      setManagerSent(false)
      setSending(false)
    }
  }, [level, managerSent])

  if (level === 'none') return null

  const cfg = ESCALATION_CONFIG[level]
  if (!cfg) return null
  const Icon = cfg.icon

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} transition-all`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${cfg.text}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.title}</p>
        <p className="text-xs text-text-secondary mt-0.5">
          {level === 'manager' && sending ? 'Sending request...' :
           level === 'manager' && managerSent ? '✓ Request sent — awaiting approval' :
           cfg.message}
        </p>
      </div>
      {level === 'rep' && (
        <textarea
          placeholder="Add deal justification..."
          rows={2}
          className="text-xs border border-border-default rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:border-pwc-orange w-48 shrink-0"
        />
      )}
    </div>
  )
}
