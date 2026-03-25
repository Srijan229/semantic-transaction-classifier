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
   - paginated review table

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

## Frontend-Ready API Additions

- `GET /api/v1/transactions` now supports pagination, sorting, text search, and filter metadata
- `GET /api/v1/transactions/summary` provides dashboard-ready aggregate counts
- `POST /api/v1/uploads/transactions` accepts CSV uploads and returns import plus classification summaries

## Example Upload Workflow

The planned frontend flow is:

1. Upload a CSV file
2. Validate rows and reject malformed inputs
3. Classify accepted rows in batch
4. Save predictions with `classificationMethod`
5. Review results in a paginated dashboard table

## Next Milestones

1. Build a frontend review dashboard
2. Add upload UI with import feedback
3. Add configurable AI provider modes
4. Add a local or privacy-preserving semantic matching option
5. Add stronger validation and richer import error reporting
