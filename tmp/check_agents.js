import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const agents = await prisma.agent.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      tradeLicense: true
    }
  })
  console.log(JSON.stringify(agents, null, 2))
}
main().finally(() => prisma.$disconnect())
