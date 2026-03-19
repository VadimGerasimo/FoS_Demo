'use client'
import { TeaserPage } from '@/components/shared/TeaserPage'

export default function RawMaterialsPage() {
  return (
    <TeaserPage
      subtitle="Track cocoa, sugar, and dairy commodity price trends and their impact on ChocoMaker's input cost structure."
      skeletons={[
        { label: 'Commodity price index: cocoa · sugar · dairy (24 months)', variant: 'multiline', height: 'h-52', wide: true },
        { label: 'Input cost impact by SKU', variant: 'bar', height: 'h-44' },
      ]}
    />
  )
}
