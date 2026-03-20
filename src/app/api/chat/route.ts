import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import chatScenariosData from '../../../../data/chat-scenarios.json'
import accountsData from '../../../../data/accounts.json'
import productsData from '../../../../data/products.json'

interface ChatScenario {
  id: string
  matchPhrases: string[]
  accountId: string | null
  productId: string | null
  response: string
  visualType: string | null
  dataKey: string | null
  suggestedAction: string | null
  tableData?: Record<string, string | number>[] | null
}

const scenarios = chatScenariosData as ChatScenario[]

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Intent-based scenario descriptions for the router (no response text — keeps the prompt focused)
const SCENARIO_DESCRIPTIONS: Record<string, string> = {
  'baker-klaas-segment-comparison': 'Compares an account to its segment peers. Covers: segment positioning, percentile ranking, peer pricing, benchmarking, similar accounts, where the account sits vs others.',
  'baker-klaas-waterfall': 'Analyses margin and price deductions for an account. Covers: margin leakage, rebates, discounts, price waterfall, deduction breakdown, where margin is going, net-net price erosion.',
  'schoko-pvm-analysis': 'Analyses revenue quality and growth decomposition. Covers: revenue growth, price-volume-mix (PVM), revenue breakdown, whether growth is healthy or masking erosion, mix shifts.',
  'why-does-schoko-pay-less': 'Explains price differences between two accounts on the same product. Covers: why one account pays less, volume tier differences, contract structure, segment floor differences.',
  'baker-klaas-win-probability': 'Evaluates whether a price is safe to quote and win probability. Covers: safe price, good price, right price, will we win, win rate, deal risk, cliff zone, what to quote, price sensitivity.',
  'baker-klaas-cross-sell': 'Identifies cross-sell and upsell product opportunities. Covers: other products, what else to sell, expand product range, product gaps vs peers, bundle opportunities.',
}

const SCENARIO_LIST = Object.entries(SCENARIO_DESCRIPTIONS)
  .map(([id, desc]) => `ID: "${id}"\nIntent: ${desc}`)
  .join('\n\n')

export async function POST(req: Request) {
  try {
    const { question, activeAccountId, activeProductId } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const activeAccountName = accountsData.find((a: { id: string }) => a.id === activeAccountId)?.name ?? null
    const activeProductName = productsData.find((p: { id: string }) => p.id === activeProductId)?.name ?? null

    // Use OpenAI for semantic routing — handles any phrasing, not just exact phrases
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_key_here') {
      // No API key — return graceful fallback
      const fallback = scenarios.find(s => s.id === 'generic-fallback')!
      return NextResponse.json({
        scenarioId: 'generic-fallback',
        response: fallback.response,
        visualType: null,
        dataKey: null,
        suggestedAction: null,
        tableData: null,
        accountId: null,
        productId: null,
      })
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `You are a routing classifier. Given a user question and optional account/product context, pick the single best scenario ID.

CONTEXT (treat as part of the question when the user does not name a specific account or product):
- Active account: "${activeAccountName ?? 'none'}"
- Active product: "${activeProductName ?? 'none'}"

For example, if the active account is "Bakker Klaas" and the user asks "what is a safe price", treat it as "what is a safe price for Bakker Klaas".

SCENARIOS:

${SCENARIO_LIST}

RULES:
1. Match on INTENT, not keywords. The user's wording will rarely match the scenario description exactly.
2. Tolerate typos, abbreviations, and partial names ("Klaas" = "Bakker Klaas", "schoko" = "Schoko Retail Group").
3. Apply synonyms broadly: "margin" = "profit" = "leakage" = "deductions"; "safe price" = "good price" = "right price" = "what to quote"; "compare" = "benchmark" = "peers" = "similar"; "other products" = "cross-sell" = "upsell".
4. When in doubt between generic-fallback and a real scenario, prefer the real scenario. Only use "generic-fallback" when the question is truly unrelated to any scenario intent.

Reply with ONLY the scenario ID string, nothing else.`,
        },
        { role: 'user', content: question },
      ],
    })

    const scenarioId = completion.choices[0]?.message?.content?.trim() ?? 'generic-fallback'
    const matched = scenarios.find(s => s.id === scenarioId) ?? scenarios.find(s => s.id === 'generic-fallback')!

    return NextResponse.json({
      scenarioId: matched.id,
      response: matched.response,
      visualType: matched.visualType,
      dataKey: matched.dataKey,
      suggestedAction: matched.suggestedAction,
      tableData: matched.tableData ?? null,
      accountId: matched.accountId,
      productId: matched.productId,
    })
  } catch (error) {
    console.error('/api/chat error:', error)
    const fallback = scenarios.find(s => s.id === 'generic-fallback')!
    return NextResponse.json({
      scenarioId: 'generic-fallback',
      response: fallback.response,
      visualType: null,
      dataKey: null,
      suggestedAction: null,
      tableData: null,
      accountId: null,
      productId: null,
    })
  }
}
