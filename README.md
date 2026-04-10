# Semantic Transaction Classifier

A full-stack AI-powered financial transaction classification system that maps unstructured transaction descriptions to generalized transaction category codes using rule-based and semantic matching.

This project uses synthetic data and a generalized financial classification schema for demonstration purposes only. No proprietary or employer-specific data is included.

## Repository Structure

- `semantic-transaction-classifier-backend/`: Express and Prisma backend for classification, review, and category lookup workflows
- `project_plan.md`: product and implementation roadmap for the public demo version

## Current Backend Features

- Rule-first transaction classification
- AI fallback classification for ambiguous descriptions
- Privacy-minimized payloads for external AI calls
- Batch transaction processing
- CSV upload for batch import
- Review and override workflow
- Transaction category master lookup
- Pagination, sorting, search, and summary APIs for dashboard use

## API Endpoints

- `POST /api/v1/tcc/classify-transaction`
- `POST /api/v1/tcc/classify-batch`
- `POST /api/v1/uploads/transactions`
- `GET /api/v1/transactions`
- `GET /api/v1/transactions/summary`
- `GET /api/v1/transactions/:id`
- `PUT /api/v1/transactions/:id/override`
- `GET /api/v1/transaction-category-codes`

## Frontend-Ready Backend Contracts

`GET /api/v1/transactions` supports:

- `page`
- `pageSize`
- `sortBy`
- `sortOrder`
- `search`
- `reviewStatus`
- `accountNumber`
- `predictedCategoryCode`

Response shape:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 0,
    "totalPages": 0
  },
  "filters": {
    "reviewStatus": null,
    "accountNumber": null,
    "predictedCategoryCode": null,
    "search": null
  },
  "sort": {
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

`GET /api/v1/transactions/summary` returns:

```json
{
  "totals": {
    "transactions": 0,
    "pendingReview": 0,
    "reviewed": 0,
    "overridden": 0
  },
  "classificationBreakdown": {
    "ruleMatched": 0,
    "aiMatched": 0,
    "fallbackMatched": 0
  }
}
```

`POST /api/v1/uploads/transactions` expects a multipart form upload with a CSV file under the `file` field.

Supported CSV columns:

- required: `description`
- optional: `transactionDate`, `amount`, `accountNumber`, `cusip`

## Generalized Category Schema

The backend ships with a synthetic transaction category taxonomy:

```json
[
  { "code": "T01", "description": "Cash Inflow" },
  { "code": "T02", "description": "Cash Outflow" },
  { "code": "T03", "description": "Equity Purchase" },
  { "code": "T04", "description": "Equity Sale" },
  { "code": "T05", "description": "Dividend Income" },
  { "code": "T06", "description": "Interest Income" },
  { "code": "T07", "description": "Management Fee" },
  { "code": "T08", "description": "Tax Adjustment" },
  { "code": "T09", "description": "Internal Transfer" },
  { "code": "T10", "description": "Ignore / Non-actionable" }
]
```

## Synthetic Example Descriptions

- `DIVIDEND PAYMENT RECEIVED`
- `CLIENT CASH WITHDRAWAL`
- `MANAGEMENT FEE CHARGE`
- `INTEREST CREDIT POSTED`
- `TRANSFER BETWEEN ACCOUNTS`
- `EQUITY PURCHASE EXECUTED`
- `EQUITY SALE SETTLED`
- `NON-TRADE BOOKKEEPING ENTRY`

## Example Upload CSV

```csv
transactionDate,description,amount,accountNumber,cusip
2026-03-24,DIVIDEND PAYMENT RECEIVED,125.50,DEMO-001,
2026-03-24,CLIENT CASH WITHDRAWAL,-80.00,DEMO-002,
2026-03-24,MONTH END JOURNAL RECLASS ENTRY,0,DEMO-003,
```

## Tech Stack

- Node.js
- Express
- Prisma
- PostgreSQL
- Google GenAI SDK

## Local Setup

1. Install dependencies:

```bash
cd semantic-transaction-classifier-backend
npm install
```

2. Create an environment file:

```bash
copy .env.example .env
```

3. Configure:

- `DATABASE_URL`
- `AI_PROVIDER_API_KEY`

4. Sync and seed the database:

```bash
npx prisma db push
node prisma/seed.js
```

5. Start the backend:

```bash
npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a production deployment path using Render for the backend/PostgreSQL database and Vercel for the frontend.

## Portfolio Positioning

This repository is designed as a public-safe portfolio project focused on classification architecture, API design, privacy-aware AI integration, and human-in-the-loop review workflows.
