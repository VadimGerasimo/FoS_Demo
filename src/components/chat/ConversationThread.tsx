'use client'

import { Bot } from 'lucide-react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestedAction?: string | null
  timestamp: Date
}

interface ConversationThreadProps {
  messages: Message[]
  isLoading: boolean
}

export function ConversationThread({ messages, isLoading }: ConversationThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-12 h-12 rounded-full bg-pwc-orange/10 flex items-center justify-center mb-3">
            <Bot size={22} className="text-pwc-orange" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">Ask about any account or product</p>
          <p className="text-xs text-text-muted max-w-xs">
            Try: <span className="italic">&quot;How does Baker Klaas compare to similar bakers, and are there cross-sell opportunities?&quot;</span>
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
            msg.role === 'user'
              ? 'bg-pwc-orange text-white'
              : 'bg-sidebar-bg text-white'
          }`}>
            {msg.role === 'user' ? 'S' : <Bot size={14} />}
          </div>

          <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-pwc-orange text-white rounded-tr-sm'
                : 'bg-white border border-border-default text-text-primary rounded-tl-sm shadow-sm'
            }`}>
              {msg.content}
            </div>

            {msg.suggestedAction && (
              <div className="flex items-start gap-2 px-3 py-2 bg-pwc-orange/5 border border-pwc-orange/20 rounded-xl text-xs text-pwc-orange-dark max-w-full">
                <span className="shrink-0 font-semibold mt-0.5">→</span>
                <span>{msg.suggestedAction}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-sidebar-bg shrink-0 flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div className="px-3.5 py-3 bg-white border border-border-default rounded-2xl rounded-tl-sm shadow-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
