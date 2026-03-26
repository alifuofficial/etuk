import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@etuk.et' },
    update: {},
    create: {
      email: 'admin@etuk.et',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+251911000001',
      isActive: true,
    },
  });

  // Create marketing manager
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@etuk.et' },
    update: {},
    create: {
      email: 'manager@etuk.et',
      name: 'Marketing Manager',
      password: managerPassword,
      role: 'MARKETING_MANAGER',
      phone: '+251911000002',
      isActive: true,
    },
  });

  // Create marketing officer
  const officerPassword = await bcrypt.hash('officer123', 10);
  const officer = await prisma.user.upsert({
    where: { email: 'officer@etuk.et' },
    update: {},
    create: {
      email: 'officer@etuk.et',
      name: 'Marketing Officer',
      password: officerPassword,
      role: 'MARKETING_OFFICER',
      phone: '+251911000003',
      isActive: true,
    },
  });

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
    await prisma.region.upsert({
      where: { code: region.code },
      update: region,
      create: region,
    });
  }

  // Create cities for regions
  const citiesData = [
    { regionCode: 'AA', cities: [
      { name: 'Addis Ababa Central', nameAm: 'አዲስ አበባ መካከለኛ', nameOr: 'Finfinnee Giddugaleessa' },
      { name: 'Bole', nameAm: 'ቦሌ', nameOr: 'Boolee' },
      { name: 'Kirkos', nameAm: 'ቂርቆስ', nameOr: 'Qirqos' },
      { name: 'Nifas Silk', nameAm: 'ንፋስ ስልክ', nameOr: 'Nifas Silik' },
    ]},
    { regionCode: 'OR', cities: [
      { name: 'Adama', nameAm: 'አዳማ', nameOr: 'Adaamaa' },
      { name: 'Jimma', nameAm: 'ጅማ', nameOr: 'Jimmaa' },
      { name: 'Bishoftu', nameAm: 'ቢሾፍቱ', nameOr: 'Bishoftuu' },
      { name: 'Modjo', nameAm: 'ሞጆ', nameOr: 'Moojoo' },
      { name: 'Ziway', nameAm: 'ዚዌ', nameOr: 'Batu' },
      { name: 'Shashamane', nameAm: 'ሻሸመኔ', nameOr: 'Shashamannee' },
      { name: 'Nekemte', nameAm: 'ነቀምት', nameOr: 'Naqamtee' },
      { name: 'Ambo', nameAm: 'አምቦ', nameOr: 'Amboo' },
    ]},
    { regionCode: 'AM', cities: [
      { name: 'Bahir Dar', nameAm: 'ባህር ዳር', nameOr: 'Bahir Dar' },
      { name: 'Gondar', nameAm: 'ጎንደር', nameOr: 'Gondar' },
      { name: 'Mekelle', nameAm: 'መቀሌ', nameOr: 'Mekelle' },
      { name: 'Dessie', nameAm: 'ደሴ', nameOr: 'Dessie' },
      { name: 'Debre Birhan', nameAm: 'ደብረ ብርሃን', nameOr: 'Debre Birhan' },
      { name: 'Debre Markos', nameAm: 'ደብረ ማርቆስ', nameOr: 'Debre Markos' },
    ]},
    { regionCode: 'SN', cities: [
      { name: 'Hawassa', nameAm: 'ሐዋሳ', nameOr: 'Hawassa' },
      { name: 'Arba Minch', nameAm: 'አርባ ምንጭ', nameOr: 'Arba Minch' },
      { name: 'Wolayta Sodo', nameAm: 'ዎላይታ ሶዶ', nameOr: 'Wolayta Sodo' },
    ]},
  ];

  for (const regionCities of citiesData) {
    const region = await prisma.region.findUnique({
      where: { code: regionCities.regionCode },
    });
    
    if (region) {
      for (const city of regionCities.cities) {
        await prisma.city.create({
          data: {
            name: city.name,
            nameAm: city.nameAm,
            nameOr: city.nameOr,
            regionId: region.id,
          },
        });
      }
    }
  }

  // Create product - Electric 3W
  const productSpecs = JSON.stringify({
    engine: {
      type: 'Electric',
      motorPower: '4000 W',
      torque: '≤ 960 N.M',
      acceleration: '0-50km/h ≤ 12S',
      driveType: 'BLDC',
    },
    performance: {
      topSpeed: '≥50 KM/H',
      maxRange: '180 KM',
    },
    charger: {
      power: '1600 W',
      chargingTime: '≤ 6 Hours',
      chargingType: '160VAC~240VAC',
    },
    battery: {
      type: 'Lithium Iron Phosphate',
      capacity: '7.6 KW/H',
    },
    dimensions: {
      size: '2660 X 1800 X 1360 MM',
      groundClearance: '210 MM',
      weight: '≤ 520KG',
    },
    tires: {
      front: 'Tubeless 135/70-R12',
      rear: 'Tubeless 135/70-R12',
    },
    lamps: {
      headLamps: 'LED Lens Headlights ≤ 30M',
      tailLamps: 'Integrated Crystal Taillights',
      signalLamps: 'Flashing Warning Turn Signals',
    },
    features: [
      'Digital Cluster System',
      'GPS Tracking & Remote Connectivity',
      'Heavy-Duty Robust Body',
      'Spacious Cabin',
      'Long Beam Lights',
      'Anti Shock Absorbers for African Roads',
    ],
  });

  await prisma.product.upsert({
    where: { id: 'etuk-3w-001' },
    update: {},
    create: {
      id: 'etuk-3w-001',
      name: 'ETUK Electric 3-Wheeler',
      nameAm: 'ኤቱክ ኤሌክትሪክ 3-ጎማ',
      nameOr: 'ETUK Saadaraa Sibiila 3-Wheeler',
      description: 'Heavy-duty electric 3-wheeler designed for African roads. Features powerful 4000W motor, 180km range, and robust construction. Perfect for passenger and cargo transport.',
      descriptionAm: 'ለአፍሪካ መንገዶች የተነደፈ ጠንካራ ኤሌክትሪክ 3-ጎማ። ኃይለኛ 4000W ሞተር፣ 180ኪሜ ርቀት እና ጠንካራ ግንባታ አለው።',
      descriptionOr: 'Daandii Afrikaaf qophaa\'e baay\'ee cimaa ta\'e saadaraa sibiila 3-wheeler. Motor cimaa 4000W, fagoo 180km, fi ijaarsa cimaa qaba.',
      category: '3W',
      specifications: productSpecs,
      featured: true,
    },
  });

  // Create settings
  await prisma.setting.upsert({
    where: { key: 'company_name' },
    update: {},
    create: {
      key: 'company_name',
      value: 'Soreti International Trading',
      description: 'Company name',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'brand_name' },
    update: {},
    create: {
      key: 'brand_name',
      value: 'ETUK',
      description: 'Brand name',
    },
  });

  await prisma.setting.upsert({
    where: { key: 'company_address' },
    update: {},
    create: {
      key: 'company_address',
      value: 'Modjo, Oromia, Ethiopia',
      description: 'Company assembly location',
    },
  });

  console.log('Seed data created successfully!');
  console.log('Users created:', { admin: admin.email, manager: manager.email, officer: officer.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
