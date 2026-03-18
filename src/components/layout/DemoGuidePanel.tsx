'use client'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const CHAT_QUESTIONS = [
  {
    q: 'How does Bakker Klaas compare to similar bakers?',
    a: 'Bottom 15% of Mid-Market Benelux at €4.20/kg vs floor €4.57 and target €4.85. Gap to floor is €0.37/kg. → Scatter chart',
  },
  {
    q: 'Bakker Klaas rebate / Where is the margin going?',
    a: 'Rebate €0.77/kg = ~€2,960 annual leakage. Net-net €4.20 on list €5.80. Total deduction €1.60/kg (27.6% from list). → Waterfall chart',
  },
  {
    q: 'Is Schoko growing? / Schoko PVM',
    a: 'Net revenue +€1k on €1.89M base. Volume +€42k but price −€22k and mix −€19k. Mix shifting to lower-margin Dark Compound. → PVM bridge',
  },
  {
    q: 'Why does Schoko pay less?',
    a: 'Schoko €3.55 vs Bakker Klaas €4.20. Three reasons: (1) volume 38k vs 320 kg/mo, (2) 3-year preferred supplier contract, (3) lower Enterprise floor €3.40. → Scatter',
  },
  {
    q: 'Will we win at 4.37? / Safe price to quote?',
    a: 'At €4.37 (+4%) win rate ~75%. Cliff zone starts €4.85. Optimal price €4.60. Current €4.20 = 82% win rate. AQS 6.2/10. → Win curve',
  },
  {
    q: 'What else can I sell Bakker Klaas? / Cross-sell Bakker Klaas',
    a: 'No White Couverture or Cocoa Powder yet — 80% co-purchase rate among peers. White Couverture target €5.18/kg. → Peer table',
  },
]

export function DemoGuidePanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-[480px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-pwc-orange mb-0.5">Demo Prep</p>
            <h2 className="text-base font-semibold text-text-primary">Scenario 1 — Bakker Klaas Asks for More Discount</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-sm">

          {/* Demo flow */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Demo Flow</h3>
            <div className="space-y-4">

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pwc-orange/10 text-pwc-orange text-xs font-bold flex items-center justify-center mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-text-primary mb-1">Segmentation</p>
                  <p className="text-text-secondary leading-relaxed">Bakker Klaas is at <strong>€4.20/kg</strong> — <strong>8.1% below the floor of €4.57</strong> and in the bottom 15% of Mid-Market Benelux. Target is €4.85. Granting more discount widens the gap. Recommendation: staged correction over 2–3 renewal cycles.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pwc-orange/10 text-pwc-orange text-xs font-bold flex items-center justify-center mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-text-primary mb-1">CPQ — Three scenarios</p>
                  <div className="text-text-secondary leading-relaxed space-y-1">
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div className="bg-zone-red-bg rounded p-2 text-center">
                        <p className="font-semibold text-zone-red">−5%</p>
                        <p className="text-text-muted">€3.99/kg</p>
                        <p className="text-text-muted">14.1% margin</p>
                        <p className="text-zone-red font-medium">Escalation</p>
                      </div>
                      <div className="bg-zone-amber-bg rounded p-2 text-center">
                        <p className="font-semibold text-zone-amber">Flat</p>
                        <p className="text-text-muted">€4.20/kg</p>
                        <p className="text-text-muted">18.3% margin</p>
                        <p className="text-zone-amber font-medium">Below floor</p>
                      </div>
                      <div className="bg-zone-green-bg rounded p-2 text-center">
                        <p className="font-semibold text-zone-green">+4%</p>
                        <p className="text-text-muted">€4.37/kg</p>
                        <p className="text-text-muted">19.8% margin</p>
                        <p className="text-zone-green font-medium">Sweet spot</p>
                      </div>
                    </div>
                    <p className="mt-2">Even at +4%, Bakker Klaas is still €0.20 below floor and €0.48 below target — the uplift is defensible.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pwc-orange/10 text-pwc-orange text-xs font-bold flex items-center justify-center mt-0.5">3</div>
                <div>
                  <p className="font-semibold text-text-primary mb-1">Ask Your Data</p>
                  <p className="text-text-secondary leading-relaxed">Ask <em>&ldquo;How does Bakker Klaas compare to similar bakers?&rdquo;</em> → bottom 15%, peers at €4.75–€5.10. Then ask <em>&ldquo;What else can I sell Bakker Klaas?&rdquo;</em> → White Couverture + Cocoa Powder, 80% co-purchase rate among peers.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pwc-orange/10 text-pwc-orange text-xs font-bold flex items-center justify-center mt-0.5">4</div>
                <div>
                  <p className="font-semibold text-text-primary mb-1">The pitch</p>
                  <blockquote className="border-l-2 border-pwc-orange/30 pl-3 text-text-secondary italic leading-relaxed">
                    &ldquo;You&apos;ve been on a very favourable rate — well below similar bakeries at €4.20 versus a floor of €4.57. I&apos;ve kept the adjustment to just +4%, bringing you to €4.37 — still well below where your peers are buying. I&apos;d also love to set you up with a trial on White Couverture and Cocoa Powder — 80% of bakers your size are already bundling these.&rdquo;
                  </blockquote>
                  <p className="text-text-muted text-xs mt-2">Result: 9-point swing (−5% → +4%), cross-sell conversation on 2 new SKUs.</p>
                </div>
              </div>

            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border-default" />

          {/* Chat questions */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Questions You Can Ask</h3>
            <div className="space-y-3">
              {CHAT_QUESTIONS.map((item, i) => (
                <div key={i} className="rounded-lg border border-border-default p-3">
                  <p className="font-medium text-text-primary mb-1 text-xs">&ldquo;{item.q}&rdquo;</p>
                  <p className="text-text-muted text-xs leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
