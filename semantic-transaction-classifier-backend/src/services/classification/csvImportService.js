const { parse } = require('csv-parse/sync');

const REQUIRED_COLUMNS = ['description'];
const OPTIONAL_COLUMNS = ['transactionDate', 'amount', 'accountNumber', 'cusip'];

function normalizeHeader(header) {
  return String(header || '').trim();
}

function parseCsvBuffer(buffer) {
  const csvText = buffer.toString('utf8');

  return parse(csvText, {
    columns: (headers) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
  });
}

function validateCsvColumns(records) {
  if (!records.length) {
    return ['The uploaded CSV does not contain any transaction rows.'];
  }

  const columns = Object.keys(records[0]);
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));

  return missingColumns.map((column) => `Missing required CSV column: ${column}`);
}

function mapRowToTransaction(row) {
  return {
    transactionDate: row.transactionDate || null,
    description: row.description || '',
    amount: row.amount ? Number(row.amount) : 0,
    accountNumber: row.accountNumber || 'UNKNOWN',
    cusip: row.cusip || null,
  };
}

function buildImportPayload(buffer) {
  const records = parseCsvBuffer(buffer);
  const columnErrors = validateCsvColumns(records);

  if (columnErrors.length > 0) {
    return {
      validTransactions: [],
      rejectedRows: columnErrors.map((message) => ({ rowNumber: null, error: message })),
    };
  }

  const validTransactions = [];
  const rejectedRows = [];

  records.forEach((row, index) => {
    if (!row.description || !String(row.description).trim()) {
      rejectedRows.push({
        rowNumber: index + 2,
        error: 'description is required',
        row,
      });
      return;
    }

    if (row.amount && Number.isNaN(Number(row.amount))) {
      rejectedRows.push({
        rowNumber: index + 2,
        error: 'amount must be numeric when provided',
        row,
      });
      return;
    }

    validTransactions.push(mapRowToTransaction(row));
  });

  return {
    validTransactions,
    rejectedRows,
    acceptedColumns: [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS],
  };
}

module.exports = {
  buildImportPayload,
};
