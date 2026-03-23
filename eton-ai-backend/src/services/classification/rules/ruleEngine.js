const KEYWORD_RULES = [
  { keywords: ['CAPITAL CALL', 'CAP CALL', 'FUNDING NOTICE'], etcCode: 53 },
  { keywords: ['PRIVATE EQUITY DIST', 'PARTNERSHIP DIST', 'K-1 INCOME'], etcCode: 7 },
  { keywords: ['ADVISORY FEE', 'WEALTH MANAGEMENT FEE', 'FAMILY OFFICE RETAINER'], etcCode: 8 },
  { keywords: ['INVESTMENT MANAGEMENT FEE', 'PERFORMANCE FEE', 'CARRIED INTEREST'], etcCode: 9 },
  { keywords: ['TRUST DISTRIBUTION', 'BENEFICIARY DISBURSEMENT', 'ESTATE TRANSFER'], etcCode: 35 },
  { keywords: ['FOREIGN TAX WITHHELD', 'FEDERAL TAX PAYMENT', 'IRS', 'ESTIMATED TAX'], etcCode: 12 },
  { keywords: ['PROMISSORY NOTE', 'PRIVATE LOAN DRAW', 'PIK INTEREST'], etcCode: 111 },
  { keywords: ['CHARITABLE CONTRIBUTION', 'FOUNDATION DONATION', 'ENDOWMENT'], etcCode: 92 },
  { keywords: ['NETJETS', 'VISTA JET', 'YACHT', 'ART PURCHASE', 'SOTHEBYS', 'CHRISTIES'], etcCode: 92 },
  { keywords: ['DIVIDEND', 'YIELD', 'DIV REINVEST'], etcCode: 5 },
  { keywords: ['WIRE OUT', 'WITHDRAWAL', 'CASH TRANSFER OUT'], etcCode: 3 },
  { keywords: ['WIRE IN', 'DEPOSIT', 'CASH TRANSFER IN'], etcCode: 1 },
  { keywords: ['CUSTODY FEE', 'MAINTENANCE FEE', 'TRUSTEE FEE'], etcCode: 10 },
  { keywords: ['AUTO REDEMPTION', 'LIQUIDATION', 'SECURITY SALE'], etcCode: 14 },
  { keywords: ['AUTO INVESTMENT', 'SECURITY PURCHASE', 'SUBSCRIPTION'], etcCode: 13 }
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
          predictedEtcCode: rule.etcCode,
          confidenceScore: 0.95,
          matchedKeyword: keyword
        };
      }
    }
  }

  return {
    predictedEtcCode: 45,
    confidenceScore: 0.10,
    matchedKeyword: null
  };
}

module.exports = {
  classifyTransaction,
  normalizeText,
  KEYWORD_RULES
};
