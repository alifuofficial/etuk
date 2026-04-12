import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const agents = await prisma.agent.findMany({
    where: {
      tradeLicense: {
        startsWith: '/api/uploads/agents/'
      }
    }
  })
  
  console.log(`Found ${agents.length} agents with /api/ in their tradeLicense path.`)
  
  for (const agent of agents) {
    if (agent.tradeLicense) {
      const newPath = agent.tradeLicense.replace('/api/uploads/agents/', '/uploads/agents/')
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
