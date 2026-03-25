import type { SummaryResponse } from '../lib/types'

type SummaryCardsProps = {
  summary: SummaryResponse
}

const cardItems = (summary: SummaryResponse) => [
  { label: 'Transactions', value: summary.totals.transactions },
  { label: 'Pending Review', value: summary.totals.pendingReview },
  { label: 'Reviewed', value: summary.totals.reviewed },
  { label: 'Overridden', value: summary.totals.overridden },
  { label: 'Rule Matched', value: summary.classificationBreakdown.ruleMatched },
  { label: 'AI Matched', value: summary.classificationBreakdown.aiMatched },
  { label: 'Fallback', value: summary.classificationBreakdown.fallbackMatched },
]

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <section className="card-grid" aria-label="Summary metrics">
      {cardItems(summary).map((card) => (
        <article key={card.label} className="metric-card">
          <p>{card.label}</p>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  )
}
