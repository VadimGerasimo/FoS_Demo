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
  .map(s => `ID: "${s.id}"\nTopics/phrases: ${s.matchPhrases.join(', ')}\nAnswer: ${s.response}`)
  .join('\n\n')

export async function POST(req: Request) {
  try {
    const { question, activeAccountId, activeProductId } = await req.json()

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

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
          content: `You are a routing classifier for a pricing analytics tool. Your job is to match a user's question to the best predefined scenario, even if the question has typos, varied phrasing, or slight misspellings (e.g. "Baker Klaar" means "Bakker Klaas").

User question: "${question}"
Active account context: "${activeAccountId ?? 'none'}"

Predefined scenarios (each has an ID, topic phrases that should match, and an answer):

${SCENARIO_LIST}

Pick the scenario whose topic/phrases best match the user's intent. Reply with ONLY the ID string of the best matching scenario. If nothing is a reasonable match, reply with "generic-fallback".`,
        },
        { role: 'user', content: 'Which scenario ID should I respond with?' },
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
