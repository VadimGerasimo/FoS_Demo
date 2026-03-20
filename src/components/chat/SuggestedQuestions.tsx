'use client'

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  onPrefill: (question: string) => void
  accountName?: string
  productName?: string
}

function buildQuestions(accountName: string, productName: string) {
  return [
    {
      text: `How does ${accountName} compare to similar accounts in the segment?`,
      prefill: false,
    },
    {
      text: `Where is the margin going on the ${accountName} account?`,
      prefill: false,
    },
    {
      text: `Is €/kg a safe price to quote ${accountName} on ${productName}?`,
      prefill: true,
    },
    {
      text: `What other products should I be discussing with ${accountName}?`,
      prefill: false,
    },
  ]
}

export function SuggestedQuestions({ onSelect, onPrefill, accountName, productName }: SuggestedQuestionsProps) {
  const name = accountName || 'Bakker Klaas'
  const product = productName || 'Milk Couverture'
  const questions = buildQuestions(name, product)

  return (
    <div className="px-4 pb-2 flex flex-wrap gap-2">
      <p className="w-full text-[10px] text-text-muted font-medium mb-1">Suggested questions</p>
      {questions.map((q) => (
        <button
          key={q.text}
          onClick={() => q.prefill ? onPrefill(q.text) : onSelect(q.text)}
          className="px-3 py-1.5 text-xs rounded-full border border-pwc-orange/30 text-pwc-orange-dark bg-pwc-orange/5 hover:bg-pwc-orange/10 transition-colors text-left"
        >
          {q.prefill ? (
            <>Is <span className="bg-pwc-orange/20 px-1 rounded">€___/kg</span> a safe price to quote {name} on {product}?</>
          ) : q.text}
        </button>
      ))}
    </div>
  )
}
