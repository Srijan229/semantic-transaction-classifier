const { GoogleGenAI } = require('@google/genai');

function getAiClient() {
  return new GoogleGenAI({ apiKey: process.env.AI_PROVIDER_API_KEY });
}

function normalizeCategory(category) {
  return {
    categoryCode: category.categoryCode || category.code,
    categoryName: category.categoryName || category.name,
    categoryDescription: category.categoryDescription || category.description,
  };
}

async function classifyTransactions(transactions, categoryList) {
  const categoryDefinitions = categoryList
    .map(
      (rawCategory) => {
        const category = normalizeCategory(rawCategory);
        return (
        `Transaction Category Code ${category.categoryCode}: ${category.categoryName} - ${category.categoryDescription}`
        );
      }
    )
    .join('\n');

  const prompt = `
You are an expert financial transaction classifier.
Your job is to read the list of privacy-minimized transaction records and find the absolute best matching transaction category code from the available options.
Use only the fields provided in each record. Do not assume access to any hidden customer data.

AVAILABLE TRANSACTION CATEGORY CODES:
${categoryDefinitions}

TRANSACTIONS TO CLASSIFY:
${JSON.stringify(transactions, null, 2)}

You must return ONLY a raw JSON array of objects (no markdown, no backticks).
Return format:
[
  { "id": "tx_1", "predictedCategoryCode": "T03", "confidenceScore": 0.88, "reasoning": "Brief explanation" }
]
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('AI Provider Classification Error:', error);
    return [];
  }
}

module.exports = {
  name: 'gemini',
  methodName: 'GEMINI_AI',
  classifyTransactions,
};
