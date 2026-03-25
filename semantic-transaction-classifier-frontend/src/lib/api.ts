import type {
  BatchClassificationResponse,
  CategoryListResponse,
  SummaryResponse,
  TransactionListResponse,
  UploadResponse,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

type TransactionQuery = {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  reviewStatus?: string
  predictedCategoryCode?: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.error ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getTransactions(query: TransactionQuery): Promise<TransactionListResponse> {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  })

  const suffix = params.toString() ? `?${params.toString()}` : ''
  return request<TransactionListResponse>(`/api/v1/transactions${suffix}`)
}

export function getTransactionSummary(): Promise<SummaryResponse> {
  return request<SummaryResponse>('/api/v1/transactions/summary')
}

export function getTransactionCategories(): Promise<CategoryListResponse> {
  return request<CategoryListResponse>('/api/v1/transaction-category-codes')
}

export async function uploadTransactionsCsv(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return request<UploadResponse>('/api/v1/uploads/transactions', {
    method: 'POST',
    body: formData,
  })
}

export async function classifyPastedDescriptions(
  descriptions: string[],
): Promise<BatchClassificationResponse> {
  return request<BatchClassificationResponse>('/api/v1/tcc/classify-batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactions: descriptions.map((description, index) => ({
        description,
        transactionDate: new Date().toISOString(),
        amount: 0,
        accountNumber: `PASTED-${String(index + 1).padStart(3, '0')}`,
        cusip: null,
      })),
    }),
  })
}
