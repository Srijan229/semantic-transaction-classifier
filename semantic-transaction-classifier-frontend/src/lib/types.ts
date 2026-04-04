export type ClassificationMethod = 'RULE_ENGINE' | 'GEMINI_AI' | 'FALLBACK'

export type TransactionCategory = {
  categoryCode: string
  categoryName: string
  categoryDescription: string
}

export type Transaction = {
  id: string
  transactionDate: string
  description: string
  amount: string | number
  accountNumber: string
  cusip: string | null
  predictedCategoryCode: string | null
  confidenceScore: number | null
  classificationMethod: ClassificationMethod | null
  matchedKeyword?: string | null
  reasoning?: string | null
  finalCategoryCode: string | null
  finalCategory?: TransactionCategory | null
  reviewStatus: string
  createdAt: string
  predictedCategory?: TransactionCategory | null
}

export type TransactionListResponse = {
  data: Transaction[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
  filters: {
    reviewStatus: string | null
    accountNumber: string | null
    predictedCategoryCode: string | null
    search: string | null
  }
  sort: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
}

export type SummaryResponse = {
  totals: {
    transactions: number
    pendingReview: number
    reviewed: number
    overridden: number
  }
  classificationBreakdown: {
    ruleMatched: number
    aiMatched: number
    fallbackMatched: number
  }
}

export type CategoryListResponse = {
  count: number
  categoryCodes: TransactionCategory[]
}

export type UploadResponse = {
  importSummary: {
    totalRows: number
    acceptedRows: number
    rejectedRows: number
  }
  classificationSummary: {
    keywordMatched: number
    aiMatched: number
    fallback: number
  }
  rejectedRows: Array<{
    rowNumber: number | null
    error: string
    row?: Record<string, string>
  }>
  results: Array<{
    transactionId: string
    description: string
    predictedCategoryCode: string
    confidenceScore: number
    classificationMethod: ClassificationMethod
    matchedKeyword: string | null
    reasoning: string | null
  }>
}

export type BatchClassificationResponse = {
  totalProcessed: number
  keywordMatched: number
  aiMatched: number
  fallback: number
  results: UploadResponse['results']
}

export type OverrideResponse = {
  message: string
  transactionId: string
  predictedCategoryCode: string
  predictedCategoryName: string
  finalCategoryCode: string
  finalCategoryName: string
  reviewStatus: string
}
