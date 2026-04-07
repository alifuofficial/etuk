import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: {
      OR: [
        { id: 'etuk-3w-001' },
        { category: '3W' },
        { category: 'Vehicles' }
      ]
    },
    data: {
      isSerialized: true
    }
  });
  
  console.log(`Updated ${result.count} products to be serialized.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
