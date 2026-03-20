'use client'

import { Send, X } from 'lucide-react'
import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useAppContext } from '@/context/AppContext'
import { accounts, products } from '@/lib/data'

interface MessageInputProps {
  onSubmit: (question: string) => void
  disabled?: boolean
  prefill?: string | null
  onPrefillConsumed?: () => void
}

export function MessageInput({ onSubmit, disabled, prefill, onPrefillConsumed }: MessageInputProps) {
  const [value, setValue] = useState('')
  const { activeAccountId, setAccount, activeProductId, setProduct } = useAppContext()
  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const activeProduct = products.find(p => p.id === activeProductId)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (prefill) {
      setValue(prefill)
      onPrefillConsumed?.()
      // Focus and place cursor at the price placeholder position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const idx = prefill.indexOf('€')
          if (idx !== -1) {
            const end = prefill.indexOf('/kg', idx)
            if (end !== -1) {
              textareaRef.current.setSelectionRange(idx + 1, end)
            }
          }
        }
      }, 0)
    }
  }, [prefill, onPrefillConsumed])

  function handleSubmit() {
    const q = value.trim()
    if (!q || disabled) return
    onSubmit(q)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border-default px-4 py-2 bg-white">
      {/* Context chips */}
      {(activeAccount || activeProduct) && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-xs text-text-muted">Context:</span>
          {activeAccount && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-pwc-orange/10 border border-pwc-orange/20 rounded-full text-xs font-medium text-pwc-orange-dark">
              {activeAccount.name}
              <button onClick={() => setAccount(null)} className="hover:opacity-70 ml-0.5">
                <X size={10} />
              </button>
            </div>
          )}
          {activeProduct && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
              {activeProduct.name}
              <button onClick={() => setProduct(null)} className="hover:opacity-70 ml-0.5">
                <X size={10} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about an account, product, or pricing question..."
          rows={1}
          disabled={disabled}
          className="flex-1 text-sm border border-border-default rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-pwc-orange transition-colors placeholder:text-text-muted disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="w-9 h-9 rounded-xl bg-pwc-orange text-white flex items-center justify-center hover:bg-pwc-orange-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mb-px"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}
