'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

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
  className?: string
}

export function ExplainButton({ screen, keyMetrics, accountId, productId, onResult, className }: ExplainButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

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
      setError(true)
      setTimeout(() => setError(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <button
        disabled
        className={clsx(
          'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-full shadow-lg text-sm font-medium',
          className ?? 'right-6'
        )}
      >
        <AlertCircle size={15} />
        Try again
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={clsx(
        'fixed bottom-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-sidebar-bg text-white rounded-full shadow-lg hover:bg-pwc-orange transition-colors text-sm font-medium disabled:opacity-60',
        className ?? 'right-6'
      )}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
      Explain
    </button>
  )
}
