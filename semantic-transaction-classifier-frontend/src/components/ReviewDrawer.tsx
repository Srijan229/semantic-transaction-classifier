import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getTransaction, overrideTransactionCategory } from '../lib/api'
import type { Transaction, TransactionCategory } from '../lib/types'

type ReviewDrawerProps = {
  transaction: Transaction | null
  categories: TransactionCategory[]
  onClose: () => void
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

export function ReviewDrawer({ transaction, categories, onClose }: ReviewDrawerProps) {
  const [selectedCategoryCode, setSelectedCategoryCode] = useState('')
  const queryClient = useQueryClient()
  const detailQuery = useQuery({
    queryKey: ['transaction-detail', transaction?.id],
    queryFn: () => getTransaction(transaction!.id),
    enabled: Boolean(transaction?.id),
  })

  useEffect(() => {
    setSelectedCategoryCode(transaction?.finalCategoryCode ?? transaction?.predictedCategoryCode ?? '')
  }, [transaction])

  const overrideMutation = useMutation({
    mutationFn: ({ transactionId, finalCategoryCode }: { transactionId: string; finalCategoryCode: string }) =>
      overrideTransactionCategory(transactionId, finalCategoryCode),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['transaction-detail', transaction?.id] }),
      ])
      onClose()
    },
  })

  if (!transaction) {
    return null
  }

  const transactionDetail = detailQuery.data ?? transaction

  return (
    <div className="drawer-backdrop" role="presentation" onClick={onClose}>
      <aside className="review-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">Manual Review</p>
            <h2>Transaction decision</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        {detailQuery.isLoading ? <p>Loading full transaction detail...</p> : null}
        {detailQuery.isError ? <p className="error-text">{detailQuery.error.message}</p> : null}

        <div className="detail-grid">
          <div className="detail-card">
            <span>Description</span>
            <strong>{transactionDetail.description}</strong>
          </div>
          <div className="detail-card">
            <span>Amount</span>
            <strong>{formatAmount(transactionDetail.amount)}</strong>
          </div>
          <div className="detail-card">
            <span>Predicted code</span>
            <strong>{transactionDetail.predictedCategoryCode ?? 'N/A'}</strong>
          </div>
          <div className="detail-card">
            <span>Method</span>
            <strong>{transactionDetail.classificationMethod ?? 'N/A'}</strong>
          </div>
          <div className="detail-card">
            <span>Review status</span>
            <strong>{transactionDetail.reviewStatus}</strong>
          </div>
          <div className="detail-card">
            <span>Account</span>
            <strong>{transactionDetail.accountNumber}</strong>
          </div>
          <div className="detail-card">
            <span>Predicted category</span>
            <strong>
              {transactionDetail.predictedCategory
                ? `${transactionDetail.predictedCategory.categoryCode} - ${transactionDetail.predictedCategory.categoryName}`
                : 'N/A'}
            </strong>
          </div>
          <div className="detail-card">
            <span>Final category</span>
            <strong>
              {transactionDetail.finalCategory
                ? `${transactionDetail.finalCategory.categoryCode} - ${transactionDetail.finalCategory.categoryName}`
                : transactionDetail.finalCategoryCode ?? 'Not reviewed'}
            </strong>
          </div>
          <div className="detail-card">
            <span>Matched keyword</span>
            <strong>{transactionDetail.matchedKeyword ?? 'None'}</strong>
          </div>
          <div className="detail-card">
            <span>CUSIP</span>
            <strong>{transactionDetail.cusip ?? 'N/A'}</strong>
          </div>
        </div>

        <div className="detail-card narrative-card">
          <span>Classification reasoning</span>
          <strong>{transactionDetail.reasoning ?? 'No narrative explanation was stored for this transaction.'}</strong>
        </div>

        <label className="field">
          <span>Final transaction category</span>
          <select value={selectedCategoryCode} onChange={(event) => setSelectedCategoryCode(event.target.value)}>
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.categoryCode} value={category.categoryCode}>
                {category.categoryCode} - {category.categoryName}
              </option>
            ))}
          </select>
        </label>

        <div className="drawer-actions">
          <button
            type="button"
            onClick={() =>
              overrideMutation.mutate({
                transactionId: transactionDetail.id,
                finalCategoryCode: selectedCategoryCode,
              })
            }
            disabled={!selectedCategoryCode || overrideMutation.isPending}
          >
            {overrideMutation.isPending ? 'Saving...' : 'Save review decision'}
          </button>
        </div>

        {overrideMutation.isError ? <p className="error-text">{overrideMutation.error.message}</p> : null}
      </aside>
    </div>
  )
}
