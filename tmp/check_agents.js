const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking for duplicates ---');
  
  const emailDupes = await prisma.agent.groupBy({
    by: ['email'],
    _count: { email: true },
    having: { email: { _count: { gt: 1 } } }
  });
  console.log('Email duplicates:', emailDupes);

  const phoneDupes = await prisma.agent.groupBy({
    by: ['phone'],
    _count: { phone: true },
    having: { phone: { _count: { gt: 1 } } }
  });
  console.log('Phone duplicates:', phoneDupes);

  const tinDupes = await prisma.agent.groupBy({
    by: ['tinNumber'],
    _count: { tinNumber: true },
    having: { tinNumber: { _count: { gt: 1 } } }
  });
  console.log('TIN duplicates:', tinDupes);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
