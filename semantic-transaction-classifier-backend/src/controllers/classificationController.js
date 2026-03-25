const {
  classifySingleTransaction,
  classifyTransactions,
} = require('../services/classification/classificationService');
const { buildImportPayload } = require('../services/classification/csvImportService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function saveClassifiedTransactions(results) {
  const savedTransactions = [];

  for (const result of results) {
    const saved = await prisma.transaction.create({
      data: {
        transactionDate: new Date(result.transactionDate || Date.now()),
        description: result.description || "",
        amount: result.amount || 0,
        accountNumber: result.accountNumber || "UNKNOWN",
        cusip: result.cusip || null,
        predictedCategoryCode: result.predictedCategoryCode,
        confidenceScore: result.confidenceScore,
        classificationMethod: result.classificationMethod,
        reviewStatus: "PENDING"
      }
    });

    savedTransactions.push({
      transactionId: saved.id,
      description: result.description,
      predictedCategoryCode: result.predictedCategoryCode,
      confidenceScore: result.confidenceScore,
      classificationMethod: result.classificationMethod,
      matchedKeyword: result.matchedKeyword,
      reasoning: result.reasoning,
    });
  }

  return savedTransactions;
}

exports.classify = async (req, res) => {
  try {
    const { transactionDate, description, amount, accountNumber, cusip } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Transaction description is required' });
    }

    const categoryList = await prisma.transactionCategory.findMany();
    const finalPrediction = await classifySingleTransaction(
      { id: 'tx_1', description, amount, accountNumber, cusip, transactionDate },
      categoryList
    );

    const categoryData = await prisma.transactionCategory.findUnique({
      where: { categoryCode: finalPrediction.predictedCategoryCode }
    });

    const savedTx = await prisma.transaction.create({
      data: {
        transactionDate: new Date(transactionDate || Date.now()),
        description: description,
        amount: amount || 0,
        accountNumber: accountNumber || "UNKNOWN",
        cusip: cusip || null,
        predictedCategoryCode: finalPrediction.predictedCategoryCode,
        confidenceScore: finalPrediction.confidenceScore,
        classificationMethod: finalPrediction.classificationMethod,
        reviewStatus: "PENDING"
      }
    });

    res.json({
      transactionId: savedTx.id,
      predictedCategoryCode: finalPrediction.predictedCategoryCode,
      predictedCategoryDescription: categoryData ? categoryData.categoryDescription : "Unknown",
      confidenceScore: finalPrediction.confidenceScore,
      classificationMethod: finalPrediction.classificationMethod,
      matchedKeyword: finalPrediction.matchedKeyword,
      reasoning: finalPrediction.reasoning || null,
      alternatives: []
    });

  } catch (error) {
    console.error("Classification Error:", error);
    res.status(500).json({ error: "Internal server error during classification" });
  }
};

exports.classifyBatch = async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: "An array of transactions is required" });
    }

    const categoryList = await prisma.transactionCategory.findMany();
    const results = await classifyTransactions(transactions, categoryList);
    const savedTransactions = await saveClassifiedTransactions(results);

    res.json({
      totalProcessed: savedTransactions.length,
      keywordMatched: results.filter(r => r.classificationMethod === "RULE_ENGINE").length,
      aiMatched: results.filter(r => r.classificationMethod === "GEMINI_AI").length,
      fallback: results.filter(r => r.classificationMethod === "FALLBACK").length,
      results: savedTransactions
    });

  } catch (error) {
    console.error("Batch Classification Error:", error);
    res.status(500).json({ error: "Internal server error during batch classification" });
  }
};

exports.uploadCsv = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'A CSV file is required under the "file" field.' });
    }

    const { validTransactions, rejectedRows } = buildImportPayload(req.file.buffer);

    if (validTransactions.length === 0) {
      return res.status(400).json({
        error: 'No valid transaction rows were found in the uploaded CSV.',
        rejectedRows,
      });
    }

    const categoryList = await prisma.transactionCategory.findMany();
    const results = await classifyTransactions(validTransactions, categoryList);
    const savedTransactions = await saveClassifiedTransactions(results);

    res.json({
      importSummary: {
        totalRows: validTransactions.length + rejectedRows.length,
        acceptedRows: validTransactions.length,
        rejectedRows: rejectedRows.length,
      },
      classificationSummary: {
        keywordMatched: results.filter((result) => result.classificationMethod === 'RULE_ENGINE').length,
        aiMatched: results.filter((result) => result.classificationMethod === 'GEMINI_AI').length,
        fallback: results.filter((result) => result.classificationMethod === 'FALLBACK').length,
      },
      rejectedRows,
      results: savedTransactions,
    });
  } catch (error) {
    console.error('CSV Upload Error:', error);
    res.status(500).json({ error: 'Internal server error during CSV upload processing' });
  }
};
