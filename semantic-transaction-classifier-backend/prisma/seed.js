require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('Reading tcc-master.json...');
  const rawData = fs.readFileSync('tcc-master.json', 'utf8');
  const categoryList = JSON.parse(rawData);

  console.log(`Found ${categoryList.length} transaction category codes. Inserting into PostgreSQL...`);

  let count = 0;
  for (const category of categoryList) {
    await prisma.transactionCategory.upsert({
      where: { categoryCode: category.code },
      update: {
        categoryName: category.name,
        categoryDescription: category.description,
      },
      create: {
        categoryCode: category.code,
        categoryName: category.name,
        categoryDescription: category.description,
      },
    });
    count++;
  }

  console.log(`Successfully seeded ${count} transaction category codes into the database.`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
