const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizePhone(phone) {
  if (!phone) return null;
  // Strip spaces, dashes, and leading +
  let cleaned = phone.toString().replace(/[\s\-]/g, '').replace(/^\+/, '');
  // If starts with 09 or 07 convert to 2519/2517
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    cleaned = '251' + cleaned.slice(1);
  }
  return cleaned;
}

async function main() {
  console.log('--- Starting Phone Normalization Migration ---');

  // 1. Normalize Agents
  const agents = await prisma.agent.findMany({
    select: { id: true, firstName: true, lastName: true, phone: true, alternativePhone: true, contactPhone: true }
  });

  console.log(`Found ${agents.length} agents to process.`);
  let agentUpdates = 0;

  for (const agent of agents) {
    const normalizedPhone = normalizePhone(agent.phone);
    const normalizedAltPhone = normalizePhone(agent.alternativePhone);
    const normalizedContactPhone = normalizePhone(agent.contactPhone);

    const hasChanges = 
      normalizedPhone !== agent.phone || 
      normalizedAltPhone !== agent.alternativePhone || 
      normalizedContactPhone !== agent.contactPhone;

    if (hasChanges) {
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          phone: normalizedPhone,
          alternativePhone: normalizedAltPhone,
          contactPhone: normalizedContactPhone
        }
      });
      console.log(`Updated agent ${agent.firstName} ${agent.lastName}: ${agent.phone} -> ${normalizedPhone}`);
      agentUpdates++;
    }
  }

  // 2. Normalize Users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, phone: true }
  });

  console.log(`Found ${users.length} users to process.`);
  let userUpdates = 0;

  for (const user of users) {
    const normalizedPhone = normalizePhone(user.phone);

    if (normalizedPhone && normalizedPhone !== user.phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: normalizedPhone
        }
      });
      console.log(`Updated user ${user.name}: ${user.phone} -> ${normalizedPhone}`);
      userUpdates++;
    }
  }

  console.log(`--- Migration Complete ---`);
  console.log(`Total Agent updates: ${agentUpdates}`);
  console.log(`Total User updates: ${userUpdates}`);
}

main()
  .catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
