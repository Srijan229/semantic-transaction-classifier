 const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parsePositiveInt(value, fallback) {
  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function normalizeSortBy(sortBy) {
  const allowed = new Set(['createdAt', 'transactionDate', 'amount', 'confidenceScore']);
  return allowed.has(sortBy) ? sortBy : 'createdAt';
}

function normalizeSortOrder(sortOrder) {
  return sortOrder === 'asc' ? 'asc' : 'desc';
}

exports.getAll = async (req, res) => {
  try {
    const filters = {};
    const page = parsePositiveInt(req.query.page, 1);
    const pageSize = Math.min(parsePositiveInt(req.query.pageSize, 25), 100);
    const sortBy = normalizeSortBy(req.query.sortBy);
    const sortOrder = normalizeSortOrder(req.query.sortOrder);
    const search = (req.query.search || '').trim();

    if (req.query.reviewStatus) {
      filters.reviewStatus = req.query.reviewStatus;
    }
    if (req.query.accountNumber) {
      filters.accountNumber = req.query.accountNumber;
    }
    if (req.query.predictedCategoryCode) {
      filters.predictedCategoryCode = req.query.predictedCategoryCode;
    }

    const where = {
      ...filters,
      ...(search
        ? {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [totalCount, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: { predictedCategory: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      data: transactions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
      filters: {
        reviewStatus: req.query.reviewStatus || null,
        accountNumber: req.query.accountNumber || null,
        predictedCategoryCode: req.query.predictedCategoryCode || null,
        search: search || null,
      },
      sort: {
        sortBy,
        sortOrder,
      },
    });

  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({ error: "Internal server error fetching transactions" });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [
      totalTransactions,
      pendingReview,
      reviewed,
      overridden,
      ruleMatched,
      aiMatched,
      fallbackMatched,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { reviewStatus: 'PENDING' } }),
      prisma.transaction.count({ where: { reviewStatus: 'REVIEWED' } }),
      prisma.transaction.count({ where: { reviewStatus: 'OVERRIDDEN' } }),
      prisma.transaction.count({ where: { classificationMethod: 'RULE_ENGINE' } }),
      prisma.transaction.count({ where: { classificationMethod: 'GEMINI_AI' } }),
      prisma.transaction.count({ where: { classificationMethod: 'FALLBACK' } }),
    ]);

    res.json({
      totals: {
        transactions: totalTransactions,
        pendingReview,
        reviewed,
        overridden,
      },
      classificationBreakdown: {
        ruleMatched,
        aiMatched,
        fallbackMatched,
      },
    });

  } catch (error) {
    console.error("Get Transaction Summary Error:", error);
    res.status(500).json({ error: "Internal server error fetching transaction summary" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: { predictedCategory: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);

  } catch (error) {
    console.error("Get Transaction Error:", error);
    res.status(500).json({ error: "Internal server error fetching transaction" });
  }
};

exports.override = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalCategoryCode } = req.body;

    if (finalCategoryCode === undefined || finalCategoryCode === null) {
      return res.status(400).json({ error: "finalCategoryCode is required in the request body" });
    }

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const categoryExists = await prisma.transactionCategory.findUnique({
      where: { categoryCode: finalCategoryCode },
    });
    if (!categoryExists) {
      return res.status(400).json({ error: `Transaction category code ${finalCategoryCode} does not exist in the master table` });
    }

    const newStatus = (existing.predictedCategoryCode === finalCategoryCode) ? "REVIEWED" : "OVERRIDDEN";

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        finalCategoryCode: finalCategoryCode,
        reviewStatus: newStatus
      },
      include: { predictedCategory: true }
    });

    res.json({
      message: `Transaction ${newStatus.toLowerCase()} successfully`,
      transactionId: updated.id,
      predictedCategoryCode: updated.predictedCategoryCode,
      predictedCategoryName: updated.predictedCategory ? updated.predictedCategory.categoryName : "Unknown",
      finalCategoryCode: updated.finalCategoryCode,
      finalCategoryName: categoryExists.categoryName,
      reviewStatus: updated.reviewStatus
    });

  } catch (error) {
    console.error("Override Error:", error);
    res.status(500).json({ error: "Internal server error during override" });
  }
};
