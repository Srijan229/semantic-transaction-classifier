const { normalizeText } = require('./rules/ruleEngine');

function getAmountDirection(amount) {
  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount) || numericAmount === 0) {
    return 'zero_or_unknown';
  }

  return numericAmount > 0 ? 'credit' : 'debit';
}

function sanitizeDescription(description) {
  const normalized = normalizeText(description || '');

  return normalized
    .replace(/\b\d{4,}\b/g, '[REDACTED_NUMBER]')
    .trim();
}

function buildAIClassificationInput(transaction, index) {
  return {
    id: transaction.id || `tx_${index}`,
    description: sanitizeDescription(transaction.description),
    amountDirection: getAmountDirection(transaction.amount),
    hasCusip: Boolean(transaction.cusip),
  };
}

module.exports = {
  buildAIClassificationInput,
  sanitizeDescription,
  getAmountDirection,
};
