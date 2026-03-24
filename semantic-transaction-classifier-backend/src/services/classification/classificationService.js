const { classifyTransaction } = require('./rules/ruleEngine');
const { getFallbackProvider } = require('./providers');
const { buildAIClassificationInput } = require('./aiInputSanitizer');

const FALLBACK_RESULT = {
  predictedCategoryCode: 'T10',
  confidenceScore: 0.1,
  matchedKeyword: null,
  reasoning: null,
};

async function classifyTransactions(transactions, categoryList) {
  const results = [];
  const needsFallback = [];

  for (let i = 0; i < transactions.length; i += 1) {
    const tx = transactions[i];
    const description = tx.description || '';
    const ruleResult = classifyTransaction(description);

    if (ruleResult.matchedKeyword !== null) {
      results.push({
        ...tx,
        index: i,
        description,
        predictedCategoryCode: ruleResult.predictedCategoryCode,
        confidenceScore: ruleResult.confidenceScore,
        classificationMethod: 'RULE_ENGINE',
        matchedKeyword: ruleResult.matchedKeyword,
        reasoning: null,
      });
      continue;
    }

    needsFallback.push({
      ...tx,
      index: i,
      id: tx.id || `tx_${i}`,
      description,
    });
  }

  if (needsFallback.length === 0) {
    return results.sort((a, b) => a.index - b.index);
  }

  const provider = getFallbackProvider();
  const providerInputs = needsFallback.map((transaction) =>
    buildAIClassificationInput(transaction, transaction.index)
  );
  const providerResults = await provider.classifyTransactions(providerInputs, categoryList);

  for (const tx of needsFallback) {
    const providerMatch = providerResults.find((result) => result.id === tx.id);

    results.push({
      ...tx,
      predictedCategoryCode: providerMatch ? providerMatch.predictedCategoryCode : FALLBACK_RESULT.predictedCategoryCode,
      confidenceScore: providerMatch ? providerMatch.confidenceScore : FALLBACK_RESULT.confidenceScore,
      classificationMethod: providerMatch ? provider.methodName || provider.name.toUpperCase() : 'FALLBACK',
      matchedKeyword: null,
      reasoning: providerMatch ? providerMatch.reasoning || null : FALLBACK_RESULT.reasoning,
    });
  }

  return results.sort((a, b) => a.index - b.index);
}

async function classifySingleTransaction(transaction, categoryList) {
  const results = await classifyTransactions([transaction], categoryList);
  return results[0];
}

module.exports = {
  classifyTransactions,
  classifySingleTransaction,
};
