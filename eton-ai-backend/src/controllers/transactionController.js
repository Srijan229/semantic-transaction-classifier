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
    if (req.query.predictedEtcCode) {
      filters.predictedEtcCode = parseInt(req.query.predictedEtcCode);
    }

    const transactions = await prisma.transaction.findMany({
      where: filters,
      include: { predictedEtc: true },
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
      include: { predictedEtc: true }
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
    const { finalEtcCode } = req.body;

    if (finalEtcCode === undefined || finalEtcCode === null) {
      return res.status(400).json({ error: "finalEtcCode is required in the request body" });
    }

    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const etcExists = await prisma.etcMaster.findUnique({ where: { etcCode: finalEtcCode } });
    if (!etcExists) {
      return res.status(400).json({ error: `ETC Code ${finalEtcCode} does not exist in the master table` });
    }

    const newStatus = (existing.predictedEtcCode === finalEtcCode) ? "REVIEWED" : "OVERRIDDEN";

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        finalEtcCode: finalEtcCode,
        reviewStatus: newStatus
      },
      include: { predictedEtc: true }
    });

    res.json({
      message: `Transaction ${newStatus.toLowerCase()} successfully`,
      transactionId: updated.id,
      predictedEtcCode: updated.predictedEtcCode,
      predictedEtcName: updated.predictedEtc ? updated.predictedEtc.name : "Unknown",
      finalEtcCode: updated.finalEtcCode,
      finalEtcName: etcExists.name,
      reviewStatus: updated.reviewStatus
    });

  } catch (error) {
    console.error("Override Error:", error);
    res.status(500).json({ error: "Internal server error during override" });
  }
};
