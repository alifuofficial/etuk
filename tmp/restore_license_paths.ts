import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const agents = await prisma.agent.findMany({
    where: {
      tradeLicense: {
        startsWith: '/uploads/agents/'
      }
    }
  })
  
  console.log(`Found ${agents.length} agents with missing /api/ prefix in their tradeLicense path.`)
  
  for (const agent of agents) {
    if (agent.tradeLicense && !agent.tradeLicense.startsWith('/api')) {
      const newPath = `/api${agent.tradeLicense}`
      await prisma.agent.update({
        where: { id: agent.id },
        data: { tradeLicense: newPath }
      })
      console.log(`Updated agent ${agent.id}: ${agent.tradeLicense} -> ${newPath}`)
    }
  }
  
  console.log('Cleanup completed.')
}
main().finally(() => prisma.$disconnect())
