'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'

export default function PriceElasticityPage() {
  return (
    <TeaserPage
      subtitle="Model the revenue and volume impact of price changes before you commit, per SKU and customer segment."
      skeletons={[
        { label: 'Elasticity curve: price vs. predicted demand', variant: 'line', height: 'h-52', wide: true },
        { label: 'What-if scenario impact', variant: 'bar', height: 'h-44' },
      ]}
    />
  )
}
