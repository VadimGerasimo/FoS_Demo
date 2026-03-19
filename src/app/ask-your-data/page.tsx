'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { ConversationThread, type Message } from '@/components/chat/ConversationThread'
import { MessageInput } from '@/components/chat/MessageInput'
import { DynamicRightPanel } from '@/components/chat/DynamicRightPanel'
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions'
import { useAppContext } from '@/context/AppContext'
import { ExplainButton, type ExplainResult } from '@/components/shared/ExplainButton'
import { ExplainPanel } from '@/components/shared/ExplainPanel'
import { Bookmark } from 'lucide-react'

interface RightPanelState {
  visualType: string | null
  dataKey: string | null
  tableData?: Record<string, string | number>[] | null
  accountId?: string | null
  productId?: string | null
}

const STORAGE_KEY = 'equazion-conversations'

export default function AskYourDataPage() {
  const { setAccount, setProduct, activeAccountId, activeProductId } = useAppContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState<string | null>(null)
  const [rightPanel, setRightPanel] = useState<RightPanelState>({ visualType: null, dataKey: null })
  const [explainResult, setExplainResult] = useState<ExplainResult | null>(null)
  const [explainOpen, setExplainOpen] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const streamText = useCallback((text: string, onComplete: () => void) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current)
    let i = 0
    setStreamingContent('')
    streamTimerRef.current = setInterval(() => {
      i = Math.min(i + 4, text.length)
      setStreamingContent(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(streamTimerRef.current!)
        streamTimerRef.current = null
        setStreamingContent(null)
        onComplete()
      }
    }, 16)
  }, [])

  // Scroll to bottom on new message or streaming update
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, isLoading, streamingContent])

  async function handleSubmit(question: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()

      // Update right panel and context immediately (metadata, not content)
      if (data.visualType) {
        setRightPanel({
          visualType: data.visualType,
          dataKey: data.dataKey,
          tableData: data.tableData,
          accountId: data.accountId,
          productId: data.productId,
        })
      }
      if (data.accountId) setAccount(data.accountId)
      if (data.productId) setProduct(data.productId)

      setTimeout(() => {
        setIsLoading(false)
        streamText(data.response, () => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: data.response,
            suggestedAction: data.suggestedAction,
            timestamp: new Date(),
          }])
        })
      }, 2500)
    } catch {
      setTimeout(() => {
        setIsLoading(false)
        streamText('Sorry, I encountered an error. Please try again.', () => {
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
          }])
        })
      }, 2500)
    }
  }

  function saveConversation() {
    if (!messages.length) return
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const title = messages.find(m => m.role === 'user')?.content.slice(0, 60) ?? 'Conversation'
    saved.unshift({ title, messages, savedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.slice(0, 10)))
    alert(`Saved: "${title}"`)
  }

  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />

      <div className="flex flex-1 min-h-0">
        {/* Left panel — 40% */}
        <div className="flex flex-col w-[40%] border-r border-border-default min-h-0">
          {/* Thread header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-default bg-white">
            <span className="text-xs font-semibold text-text-secondary">Conversation</span>
            <button
              onClick={saveConversation}
              disabled={!messages.length}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-pwc-orange transition-colors disabled:opacity-30"
            >
              <Bookmark size={13} />
              Save
            </button>
          </div>

          {/* Thread */}
          <div ref={threadRef} className="flex-1 overflow-y-auto bg-page-bg">
            <ConversationThread messages={messages} isLoading={isLoading} streamingContent={streamingContent} />
          </div>

          {/* Suggested questions — only when thread is empty */}
          {messages.length === 0 && (
            <SuggestedQuestions onSelect={handleSubmit} />
          )}

          {/* Input */}
          <MessageInput onSubmit={handleSubmit} disabled={isLoading || streamingContent !== null} />
        </div>

        {/* Right panel — 60% */}
        <div className="flex-1 bg-white min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border-default">
            <span className="text-xs font-semibold text-text-secondary">Analysis</span>
            {rightPanel.visualType && (
              <span className="text-[10px] text-text-muted px-2 py-0.5 bg-page-bg border border-border-default rounded-full capitalize">
                {rightPanel.visualType}
              </span>
            )}
          </div>
          <div className="p-4 h-[calc(100%-40px)]">
            <DynamicRightPanel
              visualType={rightPanel.visualType}
              dataKey={rightPanel.dataKey}
              tableData={rightPanel.tableData}
              accountId={rightPanel.accountId}
              productId={rightPanel.productId}
            />
          </div>
        </div>
      </div>

      <ExplainButton
        screen="ask-your-data"
        accountId={activeAccountId}
        productId={activeProductId}
        keyMetrics={{ messageCount: messages.length, lastVisualType: rightPanel.visualType }}
        onResult={(r) => { setExplainResult(r); setExplainOpen(true) }}
      />
      <ExplainPanel isOpen={explainOpen} onClose={() => setExplainOpen(false)} result={explainResult} />
    </div>
  )
}
