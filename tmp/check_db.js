const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const agents = await prisma.agent.findMany({
    select: { id: true, firstName: true, firstName: true, tradeLicense: true },
    where: { tradeLicense: { not: null } },
    take: 20,
  });
  console.log(JSON.stringify(agents, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
