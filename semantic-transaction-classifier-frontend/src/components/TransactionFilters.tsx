import type { ChangeEvent } from 'react'
import type { TransactionCategory } from '../lib/types'

export type DashboardFilters = {
  search: string
  reviewStatus: string
  predictedCategoryCode: string
}

type TransactionFiltersProps = {
  filters: DashboardFilters
  categories: TransactionCategory[]
  onChange: (next: DashboardFilters) => void
}

export function TransactionFilters({ filters, categories, onChange }: TransactionFiltersProps) {
  const update = (field: keyof DashboardFilters) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({
      ...filters,
      [field]: event.target.value,
    })

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Review Filters</p>
          <h2>Transaction queue</h2>
        </div>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>Search description</span>
          <input value={filters.search} onChange={update('search')} placeholder="Search transactions" />
        </label>

        <label className="field">
          <span>Review status</span>
          <select value={filters.reviewStatus} onChange={update('reviewStatus')}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="OVERRIDDEN">Overridden</option>
          </select>
        </label>

        <label className="field">
          <span>Category code</span>
          <select value={filters.predictedCategoryCode} onChange={update('predictedCategoryCode')}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.categoryCode} value={category.categoryCode}>
                {category.categoryCode} · {category.categoryName}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
