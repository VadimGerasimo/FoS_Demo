'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, MessageSquare, Send, Loader2 } from 'lucide-react'
import type { ScreenId } from '@/lib/contextualPrompts'

interface ContextualChatPanelProps {
  isOpen: boolean
  onClose: () => void
  screen: ScreenId
  accountId: string | null
  productId: string | null
  accountName: string | null
  productName: string | null
  keyMetrics: Record<string, unknown>
  initialMessage?: string | null
}

interface ExplainData {
  whatISee: string
  whyItMatters: string
  recommendedActions: string[]
}

type Message =
  | { role: 'user' | 'assistant'; type: 'text'; content: string }
  | { role: 'assistant'; type: 'explain'; data: ExplainData }

function ExplainMessage({ data }: { data: ExplainData }) {
  return (
    <div className="flex flex-col gap-3.5 text-sm">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-pwc-orange mb-1">What I see</p>
        <p className="text-text-primary leading-relaxed">{data.whatISee}</p>
      </div>
      <div className="border-t border-border-default pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-pwc-orange mb-1">Why it matters</p>
        <p className="text-text-primary leading-relaxed">{data.whyItMatters}</p>
      </div>
      {data.recommendedActions?.length > 0 && (
        <div className="border-t border-border-default pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-pwc-orange mb-2">Recommended actions</p>
          <ul className="flex flex-col gap-2">
            {data.recommendedActions.map((action, i) => (
              <li key={i} className="flex gap-2 text-text-primary leading-relaxed">
                <span className="text-pwc-orange font-bold shrink-0 leading-relaxed">{i + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function TextMessage({ content, isUser }: { content: string; isUser: boolean }) {
  if (isUser) return <span>{content}</span>
  const lines = content.split('\n').filter(l => l.trim())
  return (
    <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

export function ContextualChatPanel({
  isOpen,
  onClose,
  screen,
  accountId,
  productId,
  keyMetrics,
  initialMessage,
}: ContextualChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const hasFiredRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const initialMessageRef = useRef(initialMessage)
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const streamText = useCallback((text: string) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    let i = 0
    setStreamingContent('')
    streamTimerRef.current = setInterval(() => {
      i = Math.min(i + 4, text.length)
      setStreamingContent(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(streamTimerRef.current!)
        streamTimerRef.current = null
        setMessages(prev => [...prev, { role: 'assistant', type: 'text', content: text }])
        setStreamingContent(null)
      }
    }, 16)
  }, [])

  // Update ref when initialMessage changes so the effect picks it up fresh
  initialMessageRef.current = initialMessage

  useEffect(() => {
    if (!isOpen || hasFiredRef.current) return
    hasFiredRef.current = true

    // If there's a pre-seeded question from bucket panel, send it immediately
    const seedMessage = initialMessageRef.current
    if (seedMessage) {
      setMessages([{ role: 'user', type: 'text', content: seedMessage }])
      setLoading(true)
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: seedMessage }),
      })
        .then(r => r.json())
        .then(data => {
          setTimeout(() => { setLoading(false); streamText(data.response) }, 2500)
        })
        .catch(() => {
          setTimeout(() => { setLoading(false); streamText('Sorry, I encountered an error.') }, 2500)
        })
      return
    }

    setLoading(true)
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screen, accountId, productId, keyMetrics }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.whatISee) {
          setMessages([{ role: 'assistant', type: 'explain', data }])
        } else {
          setMessages([{ role: 'assistant', type: 'text', content: 'Unable to load summary.' }])
        }
      })
      .catch(() => {
        setMessages([{ role: 'assistant', type: 'text', content: 'Unable to load summary. Please try asking a question.' }])
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        if (streamTimerRef.current) { clearInterval(streamTimerRef.current); streamTimerRef.current = null }
        setMessages([])
        setInput('')
        setLoading(false)
        setStreamingContent(null)
        hasFiredRef.current = false
      }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, streamingContent])

  async function handleSubmit() {
    const q = input.trim()
    if (!q || loading || streamingContent !== null) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', type: 'text', content: q }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      setTimeout(() => { setLoading(false); streamText(data.response) }, 2500)
    } catch {
      setTimeout(() => { setLoading(false); streamText('Sorry, I encountered an error.') }, 2500)
    }
  }

  return (
    <>
    <div
      className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed top-0 right-0 h-full w-[380px] z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-default shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={15} className="text-pwc-orange" />
          <span className="text-sm font-semibold text-text-primary">Ask about this screen</span>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-page-bg">
        {loading && messages.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Loader2 size={12} className="animate-spin" />
            Analysing current view...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`animate-message-in ${m.role === 'user' ? 'self-end max-w-[85%]' : 'self-start w-full'}`}>
            <div className={`rounded-xl px-3.5 py-3 ${
              m.role === 'user'
                ? 'bg-pwc-orange text-white text-sm'
                : 'bg-white border border-border-default text-text-primary'
            }`}>
              {m.type === 'explain'
                ? <ExplainMessage data={m.data} />
                : <TextMessage content={m.content} isUser={m.role === 'user'} />
              }
            </div>
          </div>
        ))}
        {loading && messages.length > 0 && streamingContent === null && (
          <div className="self-start">
            <div className="bg-white border border-border-default rounded-xl px-3.5 py-2.5">
              <Loader2 size={12} className="animate-spin text-text-muted" />
            </div>
          </div>
        )}
        {streamingContent !== null && (
          <div className="self-start w-full animate-message-in">
            <div className="bg-white border border-border-default rounded-xl px-3.5 py-3 text-text-primary">
              <TextMessage content={streamingContent} isUser={false} />
              <span className="inline-block w-0.5 h-3.5 bg-text-secondary ml-0.5 animate-pulse align-middle" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border-default px-3 py-3 bg-white shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="Ask a follow-up question..."
            rows={2}
            disabled={loading || streamingContent !== null}
            className="flex-1 text-sm border border-border-default rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:border-pwc-orange transition-colors placeholder:text-text-muted disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || streamingContent !== null || !input.trim()}
            className="w-9 h-9 rounded-xl bg-pwc-orange text-white flex items-center justify-center hover:bg-pwc-orange-dark transition-colors disabled:opacity-40 shrink-0 mb-px"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
