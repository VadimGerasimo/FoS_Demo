export type ScreenId = 'segmentation' | 'deal-pricing' | 'deal-intelligence' | 'waterfall' | 'pvm'

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
      return `Summarise what you see on the segmentation screen for ${acct} on ${prod}. Current price: €${keyMetrics.currentPrice ?? '?'}/kg. Floor: €${keyMetrics.floorPrice ?? '?'}/kg. Target: €${keyMetrics.targetPrice ?? '?'}/kg. Zone: ${keyMetrics.zone ?? 'unknown'}. Be specific, analytical, and concise. 3 sentences max. Use sentence case, never em-dashes.`

    case 'deal-pricing':
      return `Summarise the deal pricing situation for ${acct} on ${prod}. Give a brief analysis of the three scenarios shown and recommend the best option. Be direct and use specific numbers if available. Use sentence case, never em-dashes.`

    case 'deal-intelligence':
      return `Summarise the deal intelligence for ${acct} on ${prod}. Win rate: ${keyMetrics.winRateAtCurrentPrice ?? '?'}% at current price. Account Quality Score: ${keyMetrics.accountQualityScore ?? '?'}/10. Deal score: ${keyMetrics.dealScore ?? '?'}. Provide a clear verdict on whether to proceed with this deal. Use sentence case, never em-dashes.`

    case 'waterfall':
      return `Summarise the commercial margin waterfall for ${acct} on ${prod}. Key metrics: net-net €${keyMetrics.netNetPrice ?? '?'}/kg (${keyMetrics.priceRealization ?? '?'} price realisation), gross margin ${keyMetrics.grossMarginPct ?? '?'} (€${keyMetrics.grossMargin ?? '?'}/kg), net margin ${keyMetrics.netMarginPct ?? '?'} (€${keyMetrics.netMargin ?? '?'}/kg). Identify the largest deduction in each section (pricing, COGS, SG&A) and state whether the margin profile is healthy or concerning for this account/segment. Recommend the most impactful commercial lever. Use sentence case, never em-dashes.`

    case 'pvm': {
      const bucketNote = keyMetrics.selectedBucket
        ? ` The user is currently focused on the ${keyMetrics.selectedBucket} effect; focus your interpretation on that bucket specifically.`
        : ''
      return `Summarise the price-volume-mix bridge for ${acct}. Identify whether revenue growth is healthy (price and mix positive) or masking erosion (price or mix negative). Provide a commercial interpretation in 3 sentences. Use sentence case, never em-dashes.${bucketNote}`
    }

    default:
      return `Summarise what you see on the current screen for ${acct}.`
  }
}
