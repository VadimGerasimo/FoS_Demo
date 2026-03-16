'use client'

import { useState, useEffect, useRef } from 'react'
import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'
import { ConversationThread, type Message } from '@/components/chat/ConversationThread'
import { MessageInput } from '@/components/chat/MessageInput'
import { DynamicRightPanel } from '@/components/chat/DynamicRightPanel'
import { useAppContext } from '@/context/AppContext'
import { Bookmark } from 'lucide-react'

interface RightPanelState {
  visualType: string | null
  dataKey: string | null
  tableData?: Record<string, string | number>[] | null
}

const STORAGE_KEY = 'equazion-conversations'

export default function ChatPage() {
  const { setAccount, setProduct } = useAppContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [rightPanel, setRightPanel] = useState<RightPanelState>({ visualType: null, dataKey: null })
  const threadRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, isLoading])

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

      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        suggestedAction: data.suggestedAction,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])

      // Update right panel
      if (data.visualType) {
        setRightPanel({
          visualType: data.visualType,
          dataKey: data.dataKey,
          tableData: data.tableData,
        })
      }

      // Sync AppContext if response identifies an account
      if (data.accountId) setAccount(data.accountId)
      if (data.productId) setProduct(data.productId)
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
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
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default bg-white">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Conversation</span>
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
            <ConversationThread messages={messages} isLoading={isLoading} />
          </div>

          {/* Input */}
          <MessageInput onSubmit={handleSubmit} disabled={isLoading} />
        </div>

        {/* Right panel — 60% */}
        <div className="flex-1 bg-white min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Analysis</span>
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
            />
          </div>
        </div>
      </div>
    </div>
  )
}
