const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      name: 'AGENT_APPLIED',
      content: 'Thank you for applying to become an Etuk agent! Your application has been received and is currently under review. We will contact you soon.',
    },
    {
      name: 'AGENT_APPROVED',
      content: 'Congratulations! Your Etuk agent application has been approved. You can now log in to the portal to manage your inventory and sales.',
    },
    {
      name: 'AGENT_REJECTED',
      content: 'Thank you for your interest in Etuk. After careful review, we are unable to approve your agent application at this time. We wish you the best.',
    },
  ];

  for (const t of templates) {
    await prisma.smsTemplate.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }

  console.log('Initial SMS templates seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
