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
- Review and override workflow
- Transaction category master lookup

## API Endpoints

- `POST /api/v1/tcc/classify-transaction`
- `POST /api/v1/tcc/classify-batch`
- `GET /api/v1/transactions`
- `GET /api/v1/transactions/:id`
- `PUT /api/v1/transactions/:id/override`
- `GET /api/v1/transaction-category-codes`

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

## Portfolio Positioning

This repository is designed as a public-safe portfolio project focused on classification architecture, API design, privacy-aware AI integration, and human-in-the-loop review workflows.
