const {
  classifySingleTransaction,
  classifyTransactions,
} = require('../services/classification/classificationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    const savedTransactions = [];
    for (const r of results) {
      const saved = await prisma.transaction.create({
        data: {
          transactionDate: new Date(r.transactionDate || Date.now()),
          description: r.description || "",
          amount: r.amount || 0,
          accountNumber: r.accountNumber || "UNKNOWN",
          cusip: r.cusip || null,
          predictedCategoryCode: r.predictedCategoryCode,
          confidenceScore: r.confidenceScore,
          reviewStatus: "PENDING"
        }
      });
      savedTransactions.push({
        transactionId: saved.id,
        description: r.description,
        predictedCategoryCode: r.predictedCategoryCode,
        confidenceScore: r.confidenceScore,
        classificationMethod: r.classificationMethod,
        matchedKeyword: r.matchedKeyword,
        reasoning: r.reasoning
      });
    }

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
