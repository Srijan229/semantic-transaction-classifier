import type { Transaction } from '../lib/types'

type TransactionTableProps = {
  transactions: Transaction[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onReview: (transaction: Transaction) => void
}

function formatAmount(amount: string | number) {
  const numeric = typeof amount === 'number' ? amount : Number(amount)

  if (Number.isNaN(numeric)) {
    return String(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numeric)
}

export function TransactionTable({ transactions, page, totalPages, onPageChange, onReview }: TransactionTableProps) {
  return (
    <section className="panel">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Predicted Code</th>
              <th>Method</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">
                  No transactions match the current filters.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                  <td>
                    <div className="description-cell">
                      <strong>{transaction.description}</strong>
                      <span>{transaction.accountNumber}</span>
                    </div>
                  </td>
                  <td>{formatAmount(transaction.amount)}</td>
                  <td>
                    <span className="pill">{transaction.predictedCategoryCode ?? 'N/A'}</span>
                  </td>
                  <td>{transaction.classificationMethod ?? 'N/A'}</td>
                  <td>{transaction.reviewStatus}</td>
                  <td>
                    <button type="button" className="ghost-button" onClick={() => onReview(transaction)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span>
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </section>
  )
}
