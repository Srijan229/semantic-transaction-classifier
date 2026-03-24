const KEYWORD_RULES = [
  { keywords: ['DEPOSIT', 'CASH RECEIPT', 'FUNDS RECEIVED'], categoryCode: 'T01' },
  { keywords: ['WITHDRAWAL', 'CASH WITHDRAWAL', 'ACH DEBIT', 'WIRE SENT', 'CASH OUTFLOW'], categoryCode: 'T02' },
  { keywords: ['EQUITY PURCHASE', 'BUY ORDER', 'PURCHASE EXECUTED'], categoryCode: 'T03' },
  { keywords: ['EQUITY SALE', 'SALE SETTLED', 'SELL ORDER'], categoryCode: 'T04' },
  { keywords: ['DIVIDEND', 'DIVIDEND PAYMENT'], categoryCode: 'T05' },
  { keywords: ['INTEREST CREDIT', 'INTEREST POSTED', 'INTEREST INCOME'], categoryCode: 'T06' },
  { keywords: ['MANAGEMENT FEE', 'ADVISORY FEE', 'FEE CHARGE'], categoryCode: 'T07' },
  { keywords: ['TAX WITHHELD', 'TAX ADJUSTMENT', 'TAX PAYMENT'], categoryCode: 'T08' },
  { keywords: ['TRANSFER BETWEEN ACCOUNTS', 'INTERNAL TRANSFER', 'ACCOUNT TRANSFER'], categoryCode: 'T09' },
  { keywords: ['BOOKKEEPING ENTRY', 'NON TRADE', 'NON ACTIONABLE'], categoryCode: 'T10' },
];

function normalizeText(text) {
  if (!text) return '';
  return text
    .toUpperCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyTransaction(rawDescription) {
  const description = normalizeText(rawDescription);

  for (const rule of KEYWORD_RULES) {
    for (const keyword of rule.keywords) {
      if (description.includes(keyword)) {
        return {
          predictedCategoryCode: rule.categoryCode,
          confidenceScore: 0.95,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return {
    predictedCategoryCode: 'T10',
    confidenceScore: 0.10,
    matchedKeyword: null,
  };
}

module.exports = {
  classifyTransaction,
  normalizeText,
  KEYWORD_RULES
};
