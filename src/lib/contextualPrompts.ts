export type ScreenId = 'segmentation' | 'cpq' | 'deal-intelligence' | 'waterfall' | 'pvm'

export function buildContextualPrompt(
  screen: ScreenId,
  accountName: string | null,
  productName: string | null,
  keyMetrics: Record<string, unknown>
): string {
  const acct = accountName ?? 'the selected account'
  const prod = productName ?? 'the selected product'

  switch (screen) {
    case 'segmentation':
      return `Summarise what you see on the segmentation screen for ${acct} on ${prod}. Current price: €${keyMetrics.currentPrice ?? '?'}/kg. Floor: €${keyMetrics.floorPrice ?? '?'}/kg. Target: €${keyMetrics.targetPrice ?? '?'}/kg. Zone: ${keyMetrics.zone ?? 'unknown'}. Be specific, analytical, and concise — 3 sentences max.`

    case 'cpq':
      return `Summarise the CPQ pricing situation for ${acct} on ${prod}. Give a brief analysis of the three scenarios shown and recommend the best option. Be direct and use specific numbers if available.`

    case 'deal-intelligence':
      return `Summarise the deal intelligence for ${acct} on ${prod}. Win rate: ${keyMetrics.winRateAtCurrentPrice ?? '?'}% at current price. Account Quality Score: ${keyMetrics.eorCompositeScore ?? '?'}/10. Deal Score: ${keyMetrics.dealScore ?? '?'}. Provide a clear verdict on whether to proceed with this deal.`

    case 'waterfall':
      return `Summarise the commercial margin waterfall for ${acct} on ${prod}. Key metrics: Net-Net €${keyMetrics.netNetPrice ?? '?'}/kg (${keyMetrics.priceRealization ?? '?'} price realisation), Gross Margin ${keyMetrics.grossMarginPct ?? '?'} (€${keyMetrics.grossMargin ?? '?'}/kg), Net Margin ${keyMetrics.netMarginPct ?? '?'} (€${keyMetrics.netMargin ?? '?'}/kg). Identify the largest deduction in each section (pricing, COGS, SG&A) and state whether the margin profile is healthy or concerning for this account/segment. Recommend the most impactful commercial lever.`

    case 'pvm':
      return `Summarise the Price-Volume-Mix bridge for ${acct}. Identify whether revenue growth is healthy (price and mix positive) or masking erosion (price or mix negative). Provide a commercial interpretation in 3 sentences.`

    default:
      return `Summarise what you see on the current screen for ${acct}.`
  }
}
