export type BucketKey = 'volume' | 'price' | 'mix'

export interface BucketInsight {
  title: string
  heroValue: string
  heroDirection: 'up' | 'down' | 'neutral'
  narrative: string
  topContributors: { name: string; value: number; formatted: string }[]
  formula: { expression: string; plain: string }
  actionPrompt: string
}

function fmt(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1000) return `€${(abs / 1000).toFixed(0)}k`
  return `€${abs.toFixed(0)}`
}

function fmtSigned(v: number): string {
  return v >= 0 ? `+${fmt(v)}` : `−${fmt(v)}`
}

const INSIGHTS: Record<string, Record<BucketKey, BucketInsight>> = {
  'schoko-retail': {
    volume: {
      title: 'Volume Effect',
      heroValue: '+€42k',
      heroDirection: 'up',
      narrative:
        'Volume growth of +€42k is driven by Dark Compound expanding in the discount channel. Milk Couverture volume is declining — growth is concentrated in one SKU. The overall volume number looks stronger than the underlying mix warrants.',
      topContributors: [
        { name: 'Dark Compound', value: 88200, formatted: fmtSigned(88200) },
        { name: 'Milk Couverture', value: -46200, formatted: fmtSigned(-46200) },
      ],
      formula: {
        expression: '(Curr Qty − Prior Qty) × Prior Unit Price',
        plain: 'Revenue change if only units sold changed, prices held constant.',
      },
      actionPrompt:
        'Explain the Volume Effect for Schoko Retail and whether the growth is sustainable given that Milk Couverture volume is declining.',
    },
    price: {
      title: 'Price Effect',
      heroValue: '−€22k',
      heroDirection: 'down',
      narrative:
        'Price realization declined €22k versus the prior period — consistent with reactive discounting. Three off-invoice adjustments were granted in Q3–Q4 without documented volume commitments. At current volumes this erosion pattern compounds to ~€85k annually if uncorrected.',
      topContributors: [
        { name: 'Dark Compound', value: -31500, formatted: fmtSigned(-31500) },
        { name: 'Milk Couverture', value: 9500, formatted: fmtSigned(9500) },
      ],
      formula: {
        expression: 'Curr Qty × (Curr Unit Price − Prior Unit Price)',
        plain: 'Revenue change from rate changes on the same products, volume held constant.',
      },
      actionPrompt:
        'Explain the Price Effect for Schoko Retail and what commercial actions could address the price erosion of −€22k.',
    },
    mix: {
      title: 'Mix Effect',
      heroValue: '−€19k',
      heroDirection: 'down',
      narrative:
        'Mix erosion of −€19k reflects a portfolio shift toward lower-margin SKUs. Milk Couverture — the higher-margin product — is declining as a revenue share while Dark Compound grows. Even as total revenue holds, commercial quality is deteriorating.',
      topContributors: [
        { name: 'Dark Compound', value: -12600, formatted: fmtSigned(-12600) },
        { name: 'Milk Couverture', value: -6400, formatted: fmtSigned(-6400) },
      ],
      formula: {
        expression: 'Total Revenue − Prior Revenue − Volume Effect − Price Effect',
        plain: 'Residual: revenue change from portfolio composition shift and the price-volume interaction term.',
      },
      actionPrompt:
        'Explain the Mix Effect for Schoko Retail and how to recover the product mix to restore commercial quality.',
    },
  },
  'baker-klaas': {
    volume: {
      title: 'Volume Effect',
      heroValue: '+€3.4k',
      heroDirection: 'up',
      narrative:
        'Baker Klaas is growing at +13.3% — above category average. Volume gains reflect successful penetration of the artisan and bakery segment. This account is in an early growth phase and pricing discipline remains intact.',
      topContributors: [{ name: 'Milk Couverture', value: 3360, formatted: fmtSigned(3360) }],
      formula: {
        expression: '(Curr Qty − Prior Qty) × Prior Unit Price',
        plain: 'Revenue change if only units sold changed, prices held constant.',
      },
      actionPrompt:
        'Explain the Volume Effect for Baker Klaas and how to sustain this growth trajectory without eroding price.',
    },
    price: {
      title: 'Price Effect',
      heroValue: '−€840',
      heroDirection: 'down',
      narrative:
        'A modest price concession of −€840 was extended in Q4, likely tied to a new contract negotiation. At this account size and growth rate this is within acceptable tolerance. However, this is the first price concession on record — flag as a leading indicator to monitor over the next two periods.',
      topContributors: [{ name: 'Milk Couverture', value: -840, formatted: fmtSigned(-840) }],
      formula: {
        expression: 'Curr Qty × (Curr Unit Price − Prior Unit Price)',
        plain: 'Revenue change from rate changes on the same products, volume held constant.',
      },
      actionPrompt:
        'Explain the Price Effect for Baker Klaas and whether the −€840 concession is a concern or within acceptable range.',
    },
    mix: {
      title: 'Mix Effect',
      heroValue: '−€504',
      heroDirection: 'down',
      narrative:
        'Minor mix headwind. Baker Klaas purchases are concentrated in a single SKU (Milk Couverture) so mix variance here reflects order size and frequency shifts rather than product substitution. Monitor as the account grows and additional SKUs are introduced.',
      topContributors: [{ name: 'Milk Couverture', value: -504, formatted: fmtSigned(-504) }],
      formula: {
        expression: 'Total Revenue − Prior Revenue − Volume Effect − Price Effect',
        plain: 'Residual: revenue change from portfolio composition shift and the price-volume interaction term.',
      },
      actionPrompt:
        'Explain the Mix Effect for Baker Klaas and what it means for a single-SKU account.',
    },
  },
}

const GENERIC_FALLBACK: Record<BucketKey, BucketInsight> = {
  volume: {
    title: 'Volume Effect',
    heroValue: '—',
    heroDirection: 'neutral',
    narrative:
      'The Volume Effect measures revenue change attributable solely to selling more or fewer units, holding prior-period prices and mix constant. A positive Volume Effect confirms demand growth independent of pricing decisions.',
    topContributors: [],
    formula: {
      expression: '(Curr Qty − Prior Qty) × Prior Unit Price',
      plain: 'Revenue change if only units sold changed, prices held constant.',
    },
    actionPrompt: 'Explain the Volume Effect shown on the PVM bridge.',
  },
  price: {
    title: 'Price Effect',
    heroValue: '—',
    heroDirection: 'neutral',
    narrative:
      'The Price Effect isolates revenue change from realized price movements on the same products. A negative Price Effect signals discount erosion or invoice compliance failures, independent of volume changes.',
    topContributors: [],
    formula: {
      expression: 'Curr Qty × (Curr Unit Price − Prior Unit Price)',
      plain: 'Revenue change from rate changes on the same products, volume held constant.',
    },
    actionPrompt: 'Explain the Price Effect shown on the PVM bridge.',
  },
  mix: {
    title: 'Mix Effect',
    heroValue: '—',
    heroDirection: 'neutral',
    narrative:
      'The Mix Effect captures revenue change from portfolio composition shifts — selling proportionally more of lower-value vs higher-value products. It is the residual after removing Volume and Price effects.',
    topContributors: [],
    formula: {
      expression: 'Total Revenue − Prior Revenue − Volume Effect − Price Effect',
      plain: 'Residual: revenue change from portfolio composition shift and the price-volume interaction term.',
    },
    actionPrompt: 'Explain the Mix Effect shown on the PVM bridge.',
  },
}

export function getPVMInsight(accountId: string, bucket: BucketKey): BucketInsight {
  return INSIGHTS[accountId]?.[bucket] ?? GENERIC_FALLBACK[bucket]
}
