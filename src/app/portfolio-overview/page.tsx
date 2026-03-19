'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'

export default function PortfolioOverviewPage() {
  return (
    <TeaserPage
      subtitle="Identify margin leakage across your full customer and SKU portfolio — ranked by revenue at risk."
      skeletons={[
        { label: 'Margin Leakage Heatmap — Customers × SKUs', variant: 'heatmap', height: 'h-56', wide: true },
        { label: 'Top Leakage Sources', variant: 'bar', height: 'h-44' },
        { label: 'Portfolio Health Distribution', variant: 'scatter', height: 'h-44' },
      ]}
    />
  )
}
