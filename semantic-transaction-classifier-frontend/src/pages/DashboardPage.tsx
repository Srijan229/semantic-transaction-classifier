import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTransactionCategories, getTransactionSummary, getTransactions } from '../lib/api'
import { ReviewDrawer } from '../components/ReviewDrawer'
import { SummaryCards } from '../components/SummaryCards'
import { TransactionFilters, type DashboardFilters } from '../components/TransactionFilters'
import { TransactionTable } from '../components/TransactionTable'
import type { Transaction } from '../lib/types'

export function DashboardPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<DashboardFilters>({
    search: '',
    reviewStatus: '',
    predictedCategoryCode: '',
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const summaryQuery = useQuery({
    queryKey: ['transaction-summary'],
    queryFn: getTransactionSummary,
  })

  const categoriesQuery = useQuery({
    queryKey: ['transaction-categories'],
    queryFn: getTransactionCategories,
  })

  const transactionsQuery = useQuery({
    queryKey: ['transactions', page, filters],
    queryFn: () =>
      getTransactions({
        page,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        search: filters.search,
        reviewStatus: filters.reviewStatus,
        predictedCategoryCode: filters.predictedCategoryCode,
      }),
  })

  const handleFilterChange = (nextFilters: DashboardFilters) => {
    setPage(1)
    setFilters(nextFilters)
  }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <p className="eyebrow">Operations dashboard</p>
        <h2>Review AI-assisted classification output</h2>
        <p>
          Monitor classification volumes, inspect transaction decisions, and filter the queue before manual review.
        </p>
      </section>

      {summaryQuery.data ? <SummaryCards summary={summaryQuery.data} /> : <section className="panel">Loading summary...</section>}

      <TransactionFilters
        filters={filters}
        categories={categoriesQuery.data?.categoryCodes ?? []}
        onChange={handleFilterChange}
      />

      <TransactionTable
        transactions={transactionsQuery.data?.data ?? []}
        page={transactionsQuery.data?.pagination.page ?? 1}
        totalPages={transactionsQuery.data?.pagination.totalPages ?? 1}
        onPageChange={setPage}
        onReview={setSelectedTransaction}
      />

      <ReviewDrawer
        transaction={selectedTransaction}
        categories={categoriesQuery.data?.categoryCodes ?? []}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  )
}
