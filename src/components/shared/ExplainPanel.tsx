'use client'

import { X, Sparkles } from 'lucide-react'
import type { ExplainResult } from './ExplainButton'

interface ExplainPanelProps {
  isOpen: boolean
  onClose: () => void
  result: ExplainResult | null
}

export function ExplainPanel({ isOpen, onClose, result }: ExplainPanelProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-pwc-orange" />
            <span className="text-sm font-semibold text-text-primary">AI Explain</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {result ? (
            <>
              <div className="p-4 bg-page-bg rounded-xl">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">What I&apos;m Seeing</p>
                <p className="text-sm text-text-primary">{result.whatISee}</p>
              </div>

              <div className="p-4 bg-zone-amber-bg border border-zone-amber/20 rounded-xl">
                <p className="text-[10px] font-semibold text-zone-amber uppercase tracking-wide mb-2">Why It Matters</p>
                <p className="text-sm text-text-primary">{result.whyItMatters}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-3">Recommended Actions</p>
                <ul className="flex flex-col gap-2">
                  {result.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-pwc-orange/10 text-pwc-orange text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-text-muted">No analysis available</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
