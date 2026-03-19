'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'

export default function CrossSellPage() {
  return (
    <TeaserPage
      subtitle="Surface white space opportunities and propensity scores across your customer base."
      skeletons={[
        { label: 'White space map: products × accounts', variant: 'scatter', height: 'h-56', wide: true },
        { label: 'Propensity score ranking', variant: 'bar', height: 'h-44' },
      ]}
    />
  )
}
