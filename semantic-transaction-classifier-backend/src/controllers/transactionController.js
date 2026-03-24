const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const filters = {};

    if (req.query.reviewStatus) {
      filters.reviewStatus = req.query.reviewStatus;
    }
    if (req.query.accountNumber) {
      filters.accountNumber = req.query.accountNumber;
    }
    if (req.query.predictedCategoryCode) {
      filters.predictedCategoryCode = req.query.predictedCategoryCode;
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      include: { predictedCategory: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      count: transactions.length,
      transactions: transactions
    });

  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({ error: "Internal server error fetching transactions" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: { predictedCategory: true }
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
