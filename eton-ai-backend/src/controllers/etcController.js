const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = async (req, res) => {
  try {
    const etcCodes = await prisma.etcMaster.findMany({
      orderBy: { etcCode: 'asc' }
    });

    res.json({
      count: etcCodes.length,
      etcCodes: etcCodes
    });

  } catch (error) {
    console.error("Get ETC Codes Error:", error);
    res.status(500).json({ error: "Internal server error fetching ETC codes" });
  }
};
