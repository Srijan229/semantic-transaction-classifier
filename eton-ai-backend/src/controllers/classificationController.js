const { classifyTransaction } = require('../services/classification/rules/ruleEngine');
const { classifyBatchWithAI } = require('../services/classification/ai/aiMatcher');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.classify = async (req, res) => {
  try {
    const { transactionDate, description, amount, accountNumber, cusip } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Transaction description is required' });
    }

    const matchResult = classifyTransaction(description);

    let finalPrediction;
    let classificationMethod;

    if (matchResult.matchedKeyword !== null) {
      finalPrediction = matchResult;
      classificationMethod = "RULE_ENGINE";
    } else {
      console.log(`No keyword match for "${description}". Falling back to Gemini AI...`);

      const etcMasterList = await prisma.etcMaster.findMany();

      const aiResults = await classifyBatchWithAI(
        [{ id: "tx_1", description: description }],
        etcMasterList
      );

      if (aiResults && aiResults.length > 0) {
        finalPrediction = {
          predictedEtcCode: aiResults[0].predictedEtcCode,
          confidenceScore: aiResults[0].confidenceScore,
          matchedKeyword: null,
          reasoning: aiResults[0].reasoning
        };
        classificationMethod = "GEMINI_AI";
      } else {
        finalPrediction = matchResult;
        classificationMethod = "FALLBACK";
      }
    }

    const etcData = await prisma.etcMaster.findUnique({
      where: { etcCode: finalPrediction.predictedEtcCode }
    });

    const savedTx = await prisma.transaction.create({
      data: {
        transactionDate: new Date(transactionDate || Date.now()),
        description: description,
        amount: amount || 0,
        accountNumber: accountNumber || "UNKNOWN",
        cusip: cusip || null,
        predictedEtcCode: finalPrediction.predictedEtcCode,
        confidenceScore: finalPrediction.confidenceScore,
        reviewStatus: "PENDING"
      }
    });

    res.json({
      transactionId: savedTx.id,
      predictedEtcCode: finalPrediction.predictedEtcCode,
      predictedEtcDescription: etcData ? etcData.name : "Unknown",
      confidenceScore: finalPrediction.confidenceScore,
      classificationMethod: classificationMethod,
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

    const results = [];
    const needsAI = [];

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const ruleResult = classifyTransaction(tx.description || "");

      if (ruleResult.matchedKeyword !== null) {
        results.push({
          index: i,
          description: tx.description,
          predictedEtcCode: ruleResult.predictedEtcCode,
          confidenceScore: ruleResult.confidenceScore,
          classificationMethod: "RULE_ENGINE",
          matchedKeyword: ruleResult.matchedKeyword,
          reasoning: null,
          ...tx
        });
      } else {
        needsAI.push({ index: i, id: `tx_${i}`, ...tx });
      }
    }

    if (needsAI.length > 0) {
      console.log(`Batch: ${results.length} matched by keywords, ${needsAI.length} sent to Gemini AI`);
      const etcMasterList = await prisma.etcMaster.findMany();
      const aiResults = await classifyBatchWithAI(
        needsAI.map(t => ({ id: t.id, description: t.description })),
        etcMasterList
      );

      for (const aiTx of needsAI) {
        const aiMatch = aiResults.find(r => r.id === aiTx.id);
        results.push({
          index: aiTx.index,
          description: aiTx.description,
          predictedEtcCode: aiMatch ? aiMatch.predictedEtcCode : 45,
          confidenceScore: aiMatch ? aiMatch.confidenceScore : 0.10,
          classificationMethod: aiMatch ? "GEMINI_AI" : "FALLBACK",
          matchedKeyword: null,
          reasoning: aiMatch ? aiMatch.reasoning : null,
          amount: aiTx.amount,
          accountNumber: aiTx.accountNumber
        });
      }
    }

    results.sort((a, b) => a.index - b.index);

    const savedTransactions = [];
    for (const r of results) {
      const saved = await prisma.transaction.create({
        data: {
          transactionDate: new Date(r.transactionDate || Date.now()),
          description: r.description || "",
          amount: r.amount || 0,
          accountNumber: r.accountNumber || "UNKNOWN",
          cusip: r.cusip || null,
          predictedEtcCode: r.predictedEtcCode,
          confidenceScore: r.confidenceScore,
          reviewStatus: "PENDING"
        }
      });
      savedTransactions.push({
        transactionId: saved.id,
        description: r.description,
        predictedEtcCode: r.predictedEtcCode,
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
