require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log("Reading ETC Codes.txt...");
  let rawData = fs.readFileSync('ETC Codes.txt', 'utf8');

  const regex = /"ETC_Code":\s*(\d+),\s*"Name":\s*"([^"]+)",\s*"Description":\s*"([^"]*)"/g;
  const etcMatches = [...rawData.matchAll(regex)];

  const etcList = etcMatches.map(m => ({
    ETC_Code: parseInt(m[1]),
    Name: m[2],
    Description: m[3]
  }));

  console.log(`Found ${etcList.length} ETC Codes. Inserting into PostgreSQL...`);

  let count = 0;
  for (const code of etcList) {
    await prisma.etcMaster.upsert({
      where: { etcCode: code.ETC_Code },
      update: {
        name: code.Name,
        description: code.Description
      },
      create: {
        etcCode: code.ETC_Code,
        name: code.Name,
        description: code.Description
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} ETC Codes into the database.`);
}

main()
  .catch(e => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
