import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const FALLBACK_RESPONSES: Record<string, { whatISee: string; whyItMatters: string; recommendedActions: string[] }> = {
  segmentation: {
    whatISee: 'The scatter plot shows account positions relative to the segment floor and target price bands.',
    whyItMatters: 'Accounts below the floor represent pricing risk and potential margin erosion.',
    recommendedActions: [
      'Review accounts below the floor line',
      'Plan staged corrections over 2–3 renewal cycles',
      'Use the comparison mode to benchmark against peers',
    ],
  },
  cpq: {
    whatISee: 'The CPQ screen shows the live price stack, margin bridge, and three scenario comparison for the selected account and product.',
    whyItMatters: 'Each scenario shows the margin impact and escalation status of different discount strategies.',
    recommendedActions: [
      'Compare all three scenarios before committing to a discount',
      'Check if escalation approval is needed',
      'Review win probability before submitting the quote',
    ],
  },
  waterfall: {
    whatISee: 'The price waterfall shows how the list price decomposes through invoice discounts, rebates, and payment terms to reach the net-net price.',
    whyItMatters: 'Understanding which layer drives the largest deduction helps identify where to focus contract renegotiation.',
    recommendedActions: [
      'Compare the rebate level to the segment norm',
      'Identify layers that exceed the segment average',
      'Discuss performance-linked rebate structures at next renewal',
    ],
  },
  pvm: {
    whatISee: 'The PVM bridge decomposes revenue change into volume, price, and mix effects, showing whether growth is commercially healthy or masking margin erosion.',
    whyItMatters: 'Revenue growth driven only by volume while price and mix are negative signals deteriorating commercial quality. The account is growing by selling more at lower prices into a declining-margin basket.',
    recommendedActions: [
      'Review accounts where both price AND mix are negative. This signals discounting-driven volume with deteriorating commercial quality',
      'Investigate product mix shift: if a lower-margin SKU is growing faster than the premium line, set a mix recovery target in the next commercial planning cycle',
      'For accounts with negative price effect, check whether discounts were tied to volume commitments. Undocumented concessions compound over renewal cycles',
    ],
  },
  'win-loss': {
    whatISee: 'The win probability curve shows how win rate changes with price for this product, with the cliff zone marking the region of rapid win rate decline.',
    whyItMatters: 'Pricing above the cliff zone significantly increases deal loss risk. Knowing the cliff boundary helps set the right floor.',
    recommendedActions: [
      'Avoid quoting above the cliff maximum without strong differentiation',
      'Use the optimal price point as a benchmark for new quotes',
      'Review historical lost quotes to understand competitor pricing patterns',
    ],
  },
  'ease-of-realization': {
    whatISee: 'The Account Quality Score aggregates 7 dimensions of account attractiveness beyond price, including purchasing power, cooperation, and relationship stability.',
    whyItMatters: 'A high list price is only valuable if the deal can be realised. The Account Quality Score flags operationally risky accounts that may not be worth aggressive discounting.',
    recommendedActions: [
      'Combine Account Quality Score with segment position to prioritise renewal effort',
      'Accounts with a low Account Quality Score and below-floor pricing are highest risk',
      'Use dimension notes to tailor the commercial conversation',
    ],
  },
  'ask-your-data': {
    whatISee: 'The chat interface allows free-text questions about account pricing data, with AI responses displayed alongside relevant visualisations.',
    whyItMatters: 'Conversational access to pricing data enables reps to get instant insight without navigating multiple screens.',
    recommendedActions: [
      'Ask about specific accounts to pull their segment position',
      'Use follow-up questions to drill into waterfall or cross-sell data',
      'Save useful conversations for future reference',
    ],
  },
  'deal-intelligence': {
    whatISee: 'The Deal Intelligence page combines win probability at the current quoted price with the Account Quality Score to produce a single Deal Score for this account and product.',
    whyItMatters: 'A high win rate alone does not make a good deal. The Account Quality Score flags whether the account can deliver the contracted value. The Deal Score synthesises both signals into one actionable verdict.',
    recommendedActions: [
      'Check the Deal Score before submitting any quote. Green (≥70) means proceed, amber (45–69) means attach conditions',
      'If Account Quality Score is below 6.0, review the weakest dimension before agreeing to a price concession',
      'Use the cliff zone on the win curve to set the hard floor for this negotiation',
    ],
  },
}

const DEFAULT_FALLBACK = {
  whatISee: 'The current screen shows pricing data for the selected account and product.',
  whyItMatters: 'Use this data to inform commercial decisions and pricing strategy.',
  recommendedActions: [
    'Review the data relative to segment benchmarks',
    'Consider the account\'s history and renewal timeline',
    'Discuss findings with the commercial team',
  ],
}

export async function POST(req: Request) {
  let screen = ''
  try {
    const body = await req.json()
    screen = body.screen ?? ''
    const { accountId, productId, accountName, productName, keyMetrics } = body

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_key_here') {
      const fallback = FALLBACK_RESPONSES[screen] ?? DEFAULT_FALLBACK
      return NextResponse.json(fallback)
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const systemPrompt = `You are a commercial pricing analyst assistant for Equazion, PwC's pricing intelligence platform. You are looking at the "${screen}" screen for account "${accountName ?? accountId ?? 'unknown'}" and product "${productName ?? productId ?? 'unknown'}".

Current screen metrics: ${JSON.stringify(keyMetrics, null, 2)}

Generate a concise, professional pricing insight in exactly this JSON format:
{
  "whatISee": "One sentence describing the key data visible on screen",
  "whyItMatters": "One sentence explaining the commercial significance",
  "recommendedActions": ["Action 1", "Action 2", "Action 3"]
}

Be specific; reference the actual metric values provided. Sound like a knowledgeable pricing consultant, not a generic chatbot. Use sentence case (not Title Case) for labels and headings. Never use em-dashes; use commas, periods, or parentheses instead. Return ONLY valid JSON.`

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Explain what I see on the ${screen} screen` },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('/api/explain error:', error)
    const fallback = FALLBACK_RESPONSES[screen] ?? DEFAULT_FALLBACK
    return NextResponse.json(fallback)
  }
}
