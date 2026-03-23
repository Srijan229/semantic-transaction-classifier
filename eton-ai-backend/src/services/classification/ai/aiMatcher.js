const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function classifyBatchWithAI(transactions, etcMasterList) {
  const etcDefinitions = etcMasterList.map(etc => `ETC Code ${etc.etcCode}: ${etc.name} - ${etc.description}`).join('\n');

  const prompt = `
You are an expert financial transaction classifier for Ultra High Net Worth Individuals.
Your job is to read the list of transactions and find the absolute best matching ETC Code from the available options.

AVAILABLE ETC CODES:
${etcDefinitions}

TRANSACTIONS TO CLASSIFY:
${JSON.stringify(transactions, null, 2)}

You must return ONLY a raw JSON array of objects (no markdown, no backticks).
Return format:
[
  { "id": "tx_1", "predictedEtcCode": 53, "confidenceScore": 0.88, "reasoning": "Brief explanation" }
]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiResult = JSON.parse(response.text);
    return aiResult;
  } catch (error) {
    console.error("AI Classification Error:", error);
    return [];
  }
}

module.exports = {
  classifyBatchWithAI
};
