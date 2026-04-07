const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Resolving Duplicates ---');
  
  // Find all phone numbers that have duplicates
  const phoneDupes = await prisma.agent.groupBy({
    by: ['phone'],
    _count: { phone: true },
    having: { phone: { _count: { gt: 1 } } }
  });

  for (const dupe of phoneDupes) {
    console.log(`Resolving phone: ${dupe.phone}`);
    const agents = await prisma.agent.findMany({
      where: { phone: dupe.phone },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true }
    });

    // Keep the first (most recent), delete the rest
    const idsToDelete = agents.slice(1).map(a => a.id);
    console.log(`Deleting ${idsToDelete.length} duplicates for ${dupe.phone}`);
    
    await prisma.agent.deleteMany({
      where: { id: { in: idsToDelete } }
    });
  }

  console.log('--- Resolution Complete ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
