'use client'

import { useAppContext } from '@/context/AppContext'
import { X, ChevronDown } from 'lucide-react'
import type { Account, Product } from '@/lib/data'

interface FilterBarProps {
  accounts: Account[]
  products: Product[]
}

export function FilterBar({ accounts, products }: FilterBarProps) {
  const { activeAccountId, activeProductId, setAccount, setProduct } = useAppContext()

  const activeAccount = accounts.find(a => a.id === activeAccountId)
  const activeProduct = products.find(p => p.id === activeProductId)

  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-border-default">
      {/* Account selector */}
      <div className="relative">
        <label className="text-xs font-medium text-text-muted mr-1.5">Account</label>
        <select
          value={activeAccountId ?? ''}
          onChange={e => setAccount(e.target.value || null)}
          className="text-sm text-text-primary border border-border-default rounded-lg px-3 py-1.5 pr-8 bg-white appearance-none cursor-pointer hover:border-pwc-orange focus:outline-none focus:border-pwc-orange transition-colors"
        >
          <option value="">All accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none mt-0.5" />
      </div>

      {/* Product selector */}
      <div className="relative">
        <label className="text-xs font-medium text-text-muted mr-1.5">Product</label>
        <select
          value={activeProductId ?? ''}
          onChange={e => setProduct(e.target.value || null)}
          className="text-sm text-text-primary border border-border-default rounded-lg px-3 py-1.5 pr-8 bg-white appearance-none cursor-pointer hover:border-pwc-orange focus:outline-none focus:border-pwc-orange transition-colors"
        >
          <option value="">All products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none mt-0.5" />
      </div>

      {/* Active context pill */}
      {(activeAccount || activeProduct) && (
        <div className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-pwc-orange/10 border border-pwc-orange/20 rounded-full text-xs font-medium text-pwc-orange-dark">
          {activeAccount?.name}
          {activeAccount && activeProduct && <span className="opacity-60">·</span>}
          {activeProduct?.name}
          <button
            onClick={() => { setAccount(null); setProduct(null) }}
            className="ml-0.5 hover:opacity-70 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Segment badge */}
      {activeAccount && (
        <span className="ml-auto text-xs text-text-muted font-medium px-2.5 py-1 bg-page-bg border border-border-default rounded-full">
          {activeAccount.segment}
        </span>
      )}
    </div>
  )
}
