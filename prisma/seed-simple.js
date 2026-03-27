const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Pre-computed bcrypt hashes for common passwords
// Generated with: bcrypt.hash('admin123', 10)
const PASSWORD_HASHES = {
  admin123: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3pPTCGNljPe.ZdWuWW.m',
  manager123: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3pPTCGNljPe.ZdWuWW.m',
  officer123: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3pPTCGNljPe.ZdWuWW.m',
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@etuk.et' },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@etuk.et',
        name: 'Admin User',
        password: PASSWORD_HASHES.admin123,
        role: 'ADMIN',
        phone: '+251911000001',
        isActive: true,
      },
    });
    console.log('✅ Created admin user: admin@etuk.et');
  } else {
    console.log('ℹ️  Admin user already exists: admin@etuk.et');
  }

  // Create marketing manager
  const existingManager = await prisma.user.findUnique({
    where: { email: 'manager@etuk.et' },
  });

  if (!existingManager) {
    await prisma.user.create({
      data: {
        email: 'manager@etuk.et',
        name: 'Marketing Manager',
        password: PASSWORD_HASHES.manager123,
        role: 'MARKETING_MANAGER',
        phone: '+251911000002',
        isActive: true,
      },
    });
    console.log('✅ Created manager user: manager@etuk.et');
  }

  // Create marketing officer
  const existingOfficer = await prisma.user.findUnique({
    where: { email: 'officer@etuk.et' },
  });

  if (!existingOfficer) {
    await prisma.user.create({
      data: {
        email: 'officer@etuk.et',
        name: 'Marketing Officer',
        password: PASSWORD_HASHES.officer123,
        role: 'MARKETING_OFFICER',
        phone: '+251911000003',
        isActive: true,
      },
    });
    console.log('✅ Created officer user: officer@etuk.et');
  }

  // Create Ethiopian regions
  const regions = [
    { name: 'Addis Ababa', nameAm: 'አዲስ አበባ', nameOr: 'Finfinnee', code: 'AA' },
    { name: 'Oromia', nameAm: 'ኦሮሚያ', nameOr: 'Oromiyaa', code: 'OR' },
    { name: 'Amhara', nameAm: 'አማራ', nameOr: 'Amhara', code: 'AM' },
    { name: 'Tigray', nameAm: 'ትግራይ', nameOr: 'Tigray', code: 'TG' },
    { name: 'Somali', nameAm: 'ሶማሊ', nameOr: 'Soomaali', code: 'SO' },
    { name: 'Afar', nameAm: 'አፋር', nameOr: 'Afar', code: 'AF' },
    { name: 'Benishangul-Gumuz', nameAm: 'ቤንሻንጉል-ጉሙዝ', nameOr: 'Benishangul-Gumuz', code: 'BG' },
    { name: 'Southern Nations', nameAm: 'የደቡብ ብሔር ብሔረሰቦች', nameOr: 'YeDebub', code: 'SN' },
    { name: 'Gambela', nameAm: 'ጋምቤላ', nameOr: 'Gambela', code: 'GB' },
    { name: 'Harari', nameAm: 'ሐረር', nameOr: 'Hararii', code: 'HR' },
    { name: 'Dire Dawa', nameAm: 'ድሬዳዋ', nameOr: 'Dirree Dawa', code: 'DD' },
  ];

  for (const region of regions) {
    try {
      await prisma.region.upsert({
        where: { code: region.code },
        update: region,
        create: region,
      });
    } catch (e) {
      // Ignore duplicates
    }
  }
  console.log('✅ Created 11 regions');

  // Create cities
  const citiesData = [
    { regionCode: 'AA', cities: [
      { name: 'Addis Ababa Central', nameAm: 'አዲስ አበባ መካከለኛ', nameOr: 'Finfinnee Giddugaleessa' },
      { name: 'Bole', nameAm: 'ቦሌ', nameOr: 'Boolee' },
      { name: 'Kirkos', nameAm: 'ቂርቆስ', nameOr: 'Qirqos' },
    ]},
    { regionCode: 'OR', cities: [
      { name: 'Adama', nameAm: 'አዳማ', nameOr: 'Adaamaa' },
      { name: 'Jimma', nameAm: 'ጅማ', nameOr: 'Jimmaa' },
      { name: 'Bishoftu', nameAm: 'ቢሾፍቱ', nameOr: 'Bishoftuu' },
      { name: 'Modjo', nameAm: 'ሞጆ', nameOr: 'Moojoo' },
      { name: 'Ziway', nameAm: 'ዚዌ', nameOr: 'Batu' },
    ]},
    { regionCode: 'AM', cities: [
      { name: 'Bahir Dar', nameAm: 'ባህር ዳር', nameOr: 'Bahir Dar' },
      { name: 'Gondar', nameAm: 'ጎንደር', nameOr: 'Gondar' },
      { name: 'Dessie', nameAm: 'ደሴ', nameOr: 'Dessie' },
    ]},
  ];

  for (const regionCities of citiesData) {
    const region = await prisma.region.findUnique({
      where: { code: regionCities.regionCode },
    });
    
    if (region) {
      for (const city of regionCities.cities) {
        try {
          await prisma.city.create({
            data: {
              name: city.name,
              nameAm: city.nameAm,
              nameOr: city.nameOr,
              regionId: region.id,
            },
          });
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
  }
  console.log('✅ Created cities');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('📋 LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════');
  console.log('Admin:   admin@etuk.et / admin123');
  console.log('Manager: manager@etuk.et / manager123');
  console.log('Officer: officer@etuk.et / officer123');
  console.log('═══════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
