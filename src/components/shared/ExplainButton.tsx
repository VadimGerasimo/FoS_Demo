'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export interface ExplainResult {
  whatISee: string
  whyItMatters: string
  recommendedActions: string[]
}

interface ExplainButtonProps {
  screen: string
  keyMetrics: Record<string, unknown>
  accountId?: string | null
  productId?: string | null
  onResult: (result: ExplainResult) => void
}

export function ExplainButton({ screen, keyMetrics, accountId, productId, onResult }: ExplainButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screen, accountId, productId, keyMetrics }),
      })
      const data = await res.json()
      onResult(data)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg text-white rounded-full shadow-lg hover:bg-pwc-orange transition-colors text-sm font-medium disabled:opacity-60"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
      Explain
    </button>
  )
}
