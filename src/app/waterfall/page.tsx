import { accounts, products } from '@/lib/data'
import { FilterBar } from '@/components/shared/FilterBar'

export default function WaterfallPage() {
  return (
    <div className="flex flex-col h-full">
      <FilterBar accounts={accounts} products={products} />
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        Price Waterfall — coming in Phase 3
      </div>
    </div>
  )
}
