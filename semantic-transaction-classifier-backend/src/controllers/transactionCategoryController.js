const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const categoryCodes = await prisma.transactionCategory.findMany({
      orderBy: { categoryCode: 'asc' },
    });

    res.json({
      count: categoryCodes.length,
      categoryCodes,
    });
  } catch (error) {
    console.error('Get Transaction Category Codes Error:', error);
    res.status(500).json({ error: 'Internal server error fetching transaction category codes' });
  }
};
