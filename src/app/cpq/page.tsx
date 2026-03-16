import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function CPQPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        CPQ — coming in Phase 2
      </div>
    </div>
  )
}
