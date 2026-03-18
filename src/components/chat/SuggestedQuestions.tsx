'use client'

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
}

const DEFAULT_QUESTIONS = [
  'How does Bakker Klaas compare to similar bakers in the segment?',
  'Where is the margin going on the Bakker Klaas account?',
  'Is €4.37/kg a safe price to quote Bakker Klaas on Milk Couverture?',
  'What other products should I be discussing with Bakker Klaas?',
]

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-4 pb-3 flex flex-wrap gap-2">
      <p className="w-full text-[10px] text-text-muted font-medium uppercase tracking-wide mb-1">Suggested questions</p>
      {DEFAULT_QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 text-xs rounded-full border border-pwc-orange/30 text-pwc-orange-dark bg-pwc-orange/5 hover:bg-pwc-orange/10 transition-colors text-left"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
