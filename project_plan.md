# AI-Powered Financial Transaction Reconciliation System - Project Plan

## Project Architecture & MVP Design

1. **Frontend (Future)**: Angular Single Page Application.
2. **Backend (Current Focus)**: Node.js with Express.js.
3. **Database**: PostgreSQL (recommended for robust JSONB support and vector extensions if needed for future AI embeddings).
4. **AI Layer (Future)**: OpenAI API / Azure OpenAI.

### Backend Folder Structure

```text
eton-ai-backend/
├── src/
│   ├── config/             # Environment variables and DB connection settings
│   ├── controllers/        # Route handlers for specific endpoints (e.g. classificationController)
│   ├── models/             # Database schemas/models (e.g. PostgreSQL + Prisma/Sequelize)
│   ├── routes/             # API route definitions
│   ├── services/           # Core business logic
│   │   ├── classification/ # Classification Engines
│   │   │   ├── rules/      # Phase 1: Rule-based keyword matching algorithms
│   │   │   └── ai/         # Phase 2: AI semantic matching algorithms
│   │   └── transaction/    # Transaction persistence logic
│   ├── utils/              # Helper functions (e.g., text normalization)
│   └── app.js              # Application setup and middleware
├── server.js               # Application entry point
├── package.json
└── .env                    # Environment configurations
```

### First API: ETC Classification Endpoint

**Endpoint**: `POST /api/v1/classify-transaction`

**Request Body**:
```json
{
  "transactionDate": "2026-03-21T00:00:00Z",
  "description": "CHARITABLE CONTRIBUTION CB CHARGES",
  "amount": -50.00,
  "accountNumber": "123456789",
  "cusip": null
}
```

**Response**:
```json
{
  "predictedEtcCode": 14,
  "predictedEtcDescription": "Cash Disbursement",
  "confidenceScore": 0.89,
  "alternatives": [
    { "etcCode": 13, "description": "Cash Received", "confidenceScore": 0.05 },
    { "etcCode": 26, "description": "Ignore Transaction", "confidenceScore": 0.01 }
  ]
}
```

## Implementation Strategy

### 1. Phased Semantic Matching Engine
- **Phase 1: Rule-Based Matching (MVP)**:
  - Start with a dictionary of regular expressions and keyword mappings (e.g., `*CONTRIBUTION*` -> 14).
  - Normalization: Convert description to uppercase, strip special characters, expanding common abbreviations.
- **Phase 2: Embedding/AI Matching**:
  - Introduce an LLM integration (like OpenAI) or a simple sentence-transformer model that converts descriptions to vector embeddings.
  - Compute cosine similarity between the incoming transaction's embedding and pre-computed ETC description embeddings to generate a confidence score.
- **Phase 3: Hybrid Approach**:
  - Run rules engine first for highly deterministic matches.
  - Fallback to AI layer for ambiguous descriptions.

## Data Model

### ETC Master Table
| Column Name | Type | Details |
| :--- | :--- | :--- |
| `etcCode` | Integer | Primary Key |
| `description` | String | e.g., "Cash Disbursement" |

### Transactions Table
| Column Name | Type | Details |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `transactionDate` | Date | |
| `description` | String | Original un-normalized description |
| `amount` | Decimal | |
| `accountNumber` | String | |
| `predictedEtcCode`| Integer | Foreign Key to ETC Master |
| `confidenceScore` | Float | Probability of match (0.0 to 1.0) |
| `finalEtcCode` | Integer | Foreign Key to ETC Master, set by human after review |
| `reviewStatus` | Enum | PENDING, REVIEWED, OVERRIDDEN |

### Classification Log (Optional/Audit)
| Column Name | Type | Details |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `transactionId` | UUID | Foreign Key |
| `predictedEtcCode`| Integer | |
| `confidence` | Float | |
| `alternatives` | JSONB | e.g., `[13, 26]` |
| `timestamp` | Date | |

## Step-by-Step Task Breakdown

1. Project architecture and backend design
2. Initialize Node.js backend setup
3. Implement database models and connection (ETC Master, Transactions)
4. Implement rule-based classification service
5. Implement classification API endpoint
6. Extend classification to use AI semantic matching
7. Implement persistence layer for classification logs and overrides
8. (Future) Frontend Angular Dashboard
