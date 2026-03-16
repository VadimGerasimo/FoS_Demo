'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextValue {
  activeAccountId: string | null
  activeProductId: string | null
  activeVolume: number | null
  setAccount: (id: string | null) => void
  setProduct: (id: string | null) => void
  setVolume: (kg: number | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeAccountId, setActiveAccountId] = useState<string | null>('baker-klaas')
  const [activeProductId, setActiveProductId] = useState<string | null>('milk-couverture')
  const [activeVolume, setActiveVolume] = useState<number | null>(320)

  return (
    <AppContext.Provider
      value={{
        activeAccountId,
        activeProductId,
        activeVolume,
        setAccount: setActiveAccountId,
        setProduct: setActiveProductId,
        setVolume: setActiveVolume,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
