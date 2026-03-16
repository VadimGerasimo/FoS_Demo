import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import chatScenariosData from '../../../../data/chat-scenarios.json'

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

const SCENARIO_LIST = scenarios
  .filter(s => s.id !== 'generic-fallback')
  .map(s => `- "${s.id}": matches questions about ${s.matchPhrases.slice(0, 2).join(', ')}`)
  .join('\n')

export async function POST(req: Request) {
  try {
    const { question, activeAccountId, activeProductId } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Try local phrase matching first (instant, no API call needed for scripted demo)
    const q = question.toLowerCase().trim()
    for (const scenario of scenarios) {
      if (scenario.id === 'generic-fallback') continue
      const matched = scenario.matchPhrases.some(phrase => q.includes(phrase.toLowerCase()))
      if (matched) {
        return NextResponse.json({
          scenarioId: scenario.id,
          response: scenario.response,
          visualType: scenario.visualType,
          dataKey: scenario.dataKey,
          suggestedAction: scenario.suggestedAction,
          tableData: scenario.tableData ?? null,
          accountId: scenario.accountId,
          productId: scenario.productId,
        })
      }
    }

    // Fall back to OpenAI semantic matching
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
          content: `You are a scenario router for a pricing intelligence demo. Given a user question, return ONLY the ID of the best matching scenario from this list, or "generic-fallback" if none match well:

${SCENARIO_LIST}

Context: activeAccountId="${activeAccountId ?? 'none'}", activeProductId="${activeProductId ?? 'none'}"

Respond with ONLY the scenario ID string, nothing else.`,
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
