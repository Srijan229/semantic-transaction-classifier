# Semantic Transaction Classifier Project Plan

## Product Overview

Semantic Transaction Classifier is a public-safe demonstration project for AI-assisted financial transaction categorization. It maps free-form transaction descriptions to a small set of generalized transaction category codes and supports review and override workflows.

## Public-Safe Design Principles

- Synthetic taxonomy only
- Synthetic transaction examples only
- No employer-specific terminology
- No internal workflow names
- No proprietary category schema
- Privacy-aware handling of external AI providers

## Current Architecture

1. Backend: Node.js with Express
2. Database: PostgreSQL with Prisma
3. Classification Flow:
   - rule-based matching first
   - AI fallback for ambiguous cases
   - review and override persistence
4. Future Frontend:
   - CSV upload workflow
   - review dashboard
   - summary metrics

## Generalized Taxonomy

| Code | Description |
| --- | --- |
| `T01` | Cash Inflow |
| `T02` | Cash Outflow |
| `T03` | Equity Purchase |
| `T04` | Equity Sale |
| `T05` | Dividend Income |
| `T06` | Interest Income |
| `T07` | Management Fee |
| `T08` | Tax Adjustment |
| `T09` | Internal Transfer |
| `T10` | Ignore / Non-actionable |

## Example Classification Request

`POST /api/v1/tcc/classify-transaction`

```json
{
  "transactionDate": "2026-03-24T00:00:00Z",
  "description": "DIVIDEND PAYMENT RECEIVED",
  "amount": 185.22,
  "accountNumber": "DEMO-001",
  "cusip": null
}
```

## Example Classification Response

```json
{
  "transactionId": "sample-id",
  "predictedCategoryCode": "T05",
  "predictedCategoryDescription": "Dividend Income",
  "confidenceScore": 0.95,
  "classificationMethod": "RULE_ENGINE",
  "matchedKeyword": "DIVIDEND PAYMENT",
  "reasoning": null,
  "alternatives": []
}
```

## Next Milestones

1. Add CSV upload for batch classification
2. Build a frontend review dashboard
3. Add pagination, filtering, and summary metrics
4. Add configurable AI provider modes
5. Add a local or privacy-preserving semantic matching option
