-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "TransactionCategory" (
    "categoryCode" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "categoryDescription" TEXT NOT NULL,

    CONSTRAINT "TransactionCategory_pkey" PRIMARY KEY ("categoryCode")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "cusip" TEXT,
    "predictedCategoryCode" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "classificationMethod" TEXT,
    "matchedKeyword" TEXT,
    "reasoning" TEXT,
    "finalCategoryCode" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_predictedCategoryCode_fkey" FOREIGN KEY ("predictedCategoryCode") REFERENCES "TransactionCategory"("categoryCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_finalCategoryCode_fkey" FOREIGN KEY ("finalCategoryCode") REFERENCES "TransactionCategory"("categoryCode") ON DELETE SET NULL ON UPDATE CASCADE;
