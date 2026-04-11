import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Pre-hashed passwords for 'admin123', 'manager123', 'officer123'
  // This avoids a dependency on bcryptjs in the production runner.
  const HASH_ADMIN = '$2b$10$qH4RSGVmspaAR7mmwC16MO6Y79Rqa7keATQJNfCf3wkaeKww946n6';
  const HASH_MANAGER = '$2b$10$7zdJ2n2GBNtaWonKsgQcEOVqUn0V9oJomrW8Kz7M5sCf3sI55DWxsjorG';
  const HASH_OFFICER = '$2b$10$43OrBfrU2oBuoJUC9vuADePH9Uoh3qRokbPCwjXyZttnWWtd9psK1.';

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@etuk.et' },
    update: {},
    create: {
      email: 'admin@etuk.et',
      name: 'Admin User',
      password: HASH_ADMIN,
      role: 'ADMIN',
      phone: '+251911000001',
      isActive: true,
    },
  });

  // Create marketing manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@etuk.et' },
    update: {},
    create: {
      email: 'manager@etuk.et',
      name: 'Marketing Manager',
      password: HASH_MANAGER,
      role: 'MARKETING_MANAGER',
      phone: '+251911000002',
      isActive: true,
    },
  });

  // Create marketing officer
  const officer = await prisma.user.upsert({
    where: { email: 'officer@etuk.et' },
    update: {},
    create: {
      email: 'officer@etuk.et',
      name: 'Marketing Officer',
      password: HASH_OFFICER,
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
      { name: 'Addis Ketema', nameAm: 'አዲስ ከተማ', nameOr: 'Addis Katamaa' },
      { name: 'Akaki Kaliti', nameAm: 'አቃቂ ቃሊቲ', nameOr: 'Aqaaqii Qaallittii' },
      { name: 'Arada', nameAm: 'አራዳ', nameOr: 'Araadaa' },
      { name: 'Bole', nameAm: 'ቦሌ', nameOr: 'Boolee' },
      { name: 'Gullele', nameAm: 'ጉለሌ', nameOr: 'Gullallee' },
      { name: 'Kirkos', nameAm: 'ቂርቆስ', nameOr: 'Qirqos' },
      { name: 'Kolfe Keranio', nameAm: 'ኮልፌ ቀራኒዮ', nameOr: 'Kolfee Qaraaniyoo' },
      { name: 'Lideta', nameAm: 'ልደታ', nameOr: 'Lidataa' },
      { name: 'Nifas Silk Lafto', nameAm: 'ንፋስ ስልክ ላፍቶ', nameOr: 'Nifas Silik Laaftoo' },
      { name: 'Yeka', nameAm: 'የካ', nameOr: 'Yeekaa' },
    ]},
    { regionCode: 'OR', cities: [
      { name: 'Adama', nameAm: 'አዳማ', nameOr: 'Adaamaa' },
      { name: 'Jimma', nameAm: 'ጅማ', nameOr: 'Jimmaa' },
      { name: 'Bishoftu', nameAm: 'ቢሾፍቱ', nameOr: 'Bishoftuu' },
      { name: 'Shashamane', nameAm: 'ሻሸመኔ', nameOr: 'Shashamannee' },
      { name: 'Nekemte', nameAm: 'ነቀምት', nameOr: 'Naqamtee' },
      { name: 'Ambo', nameAm: 'አምቦ', nameOr: 'Amboo' },
      { name: 'Asella', nameAm: 'አሰላ', nameOr: 'Asallaa' },
      { name: 'Robe', nameAm: 'ሮቤ', nameOr: 'Robee' },
      { name: 'Burayu', nameAm: 'ቡራዩ', nameOr: 'Burayyuu' },
      { name: 'Sebeta', nameAm: 'ሰበታ', nameOr: 'Sabbataa' },
      { name: 'Modjo', nameAm: 'ሞጆ', nameOr: 'Moojoo' },
      { name: 'Batu (Ziway)', nameAm: 'ባቱ (ዝዋይ)', nameOr: 'Baatuu' },
      { name: 'Chiro', nameAm: 'ጭሮ', nameOr: 'Ciroo' },
      { name: 'Gimbi', nameAm: 'ጊምቢ', nameOr: 'Gimbii' },
      { name: 'Metu', nameAm: 'መቱ', nameOr: 'Metuu' },
      { name: 'Waliso', nameAm: 'ወሊሶ', nameOr: 'Walisoo' },
      { name: 'Fiche', nameAm: 'ፊቼ', nameOr: 'Fiichee' },
      { name: 'Dembi Dollo', nameAm: 'ደምቢ ዶሎ', nameOr: 'Dambi Doolloo' },
      { name: 'Bedele', nameAm: 'በደሌ', nameOr: 'Baddallee' },
      { name: 'Negele Borana', nameAm: 'ነገሌ ቦራና', nameOr: 'Nageellee Boorana' },
      { name: 'Sululta', nameAm: 'ሱሉልታ', nameOr: 'Sulultaa' },
      { name: 'Dukem', nameAm: 'ዱከም', nameOr: 'Duukam' },
    ]},
    { regionCode: 'AM', cities: [
      { name: 'Bahir Dar', nameAm: 'ባህር ዳር', nameOr: 'Bahir Dar' },
      { name: 'Gondar', nameAm: 'ጎንደር', nameOr: 'Gondar' },
      { name: 'Dessie', nameAm: 'ደሴ', nameOr: 'Dessie' },
      { name: 'Debre Birhan', nameAm: 'ደብረ ብርሃን', nameOr: 'Debre Birhan' },
      { name: 'Debre Markos', nameAm: 'ደብረ ማርቆስ', nameOr: 'Debre Markos' },
      { name: 'Kombolcha', nameAm: 'ኮምቦልቻ', nameOr: 'Kombolcha' },
      { name: 'Woldiya', nameAm: 'ወልድያ', nameOr: 'Woldiya' },
      { name: 'Debre Tabor', nameAm: 'ደብረ ታቦር', nameOr: 'Debre Tabor' },
      { name: 'Lalibela', nameAm: 'ላሊበላ', nameOr: 'Lalibela' },
      { name: 'Injibara', nameAm: 'እንጅባራ', nameOr: 'Injibara' },
      { name: 'Finote Selam', nameAm: 'ፍኖተ ሰላም', nameOr: 'Finote Selam' },
    ]},
    { regionCode: 'TG', cities: [
      { name: 'Mekelle', nameAm: 'መቀሌ', nameOr: 'Mekelle' },
      { name: 'Adigrat', nameAm: 'አዲግራት', nameOr: 'Adigrat' },
      { name: 'Aksum', nameAm: 'አክሱም', nameOr: 'Aksum' },
      { name: 'Shire', nameAm: 'ሽሬ', nameOr: 'Shire' },
      { name: 'Humera', nameAm: 'ሁመራ', nameOr: 'Humera' },
      { name: 'Alamata', nameAm: 'አላማጣ', nameOr: 'Alamata' },
      { name: 'Adwa', nameAm: 'አድዋ', nameOr: 'Adwa' },
      { name: 'Maychew', nameAm: 'ማይጨው', nameOr: 'Maychew' },
    ]},
    { regionCode: 'SO', cities: [
      { name: 'Jijiga', nameAm: 'ጅጅጋ', nameOr: 'Jijiga' },
      { name: 'Gode', nameAm: 'ጎዴ', nameOr: 'Gode' },
      { name: 'Kebridahar', nameAm: 'ቀብሪዳሃር', nameOr: 'Kebridahar' },
      { name: 'Degehabur', nameAm: 'ደገhabitat', nameOr: 'Degehabur' },
      { name: 'Warder', nameAm: 'ዋርደር', nameOr: 'Warder' },
    ]},
    { regionCode: 'AF', cities: [
      { name: 'Semera', nameAm: 'ሰመራ', nameOr: 'Semera' },
      { name: 'Asaita', nameAm: 'አሳይታ', nameOr: 'Asaita' },
      { name: 'Dupti', nameAm: 'ዱፕቲ', nameOr: 'Dupti' },
      { name: 'Logia', nameAm: 'ሎጊያ', nameOr: 'Logia' },
      { name: 'Chifra', nameAm: 'ጭፍራ', nameOr: 'Chifra' },
    ]},
    { regionCode: 'SN', cities: [
      { name: 'Hawassa', nameAm: 'ሐዋሳ', nameOr: 'Hawassa' },
      { name: 'Arba Minch', nameAm: 'አርባ ምንጭ', nameOr: 'Arba Minch' },
      { name: 'Wolayta Sodo', nameAm: 'ዎላይታ ሶዶ', nameOr: 'Wolayta Sodo' },
      { name: 'Dilla', nameAm: 'ዲላ', nameOr: 'Dilla' },
      { name: 'Hosanna', nameAm: 'ሆሳዕና', nameOr: 'Hosanna' },
      { name: 'Butajira', nameAm: 'ቡታጅራ', nameOr: 'Butajira' },
      { name: 'Jinka', nameAm: 'ጂንካ', nameOr: 'Jinka' },
      { name: 'Sawla', nameAm: 'ሳውላ', nameOr: 'Sawla' },
      { name: 'Bonga', nameAm: 'ቦንጋ', nameOr: 'Bonga' },
      { name: 'Mizan Teferi', nameAm: 'ሚዛን ተፈሪ', nameOr: 'Mizan Teferi' },
    ]},
    { regionCode: 'GB', cities: [
      { name: 'Gambela', nameAm: 'ጋምቤላ', nameOr: 'Gambela' },
      { name: 'Itang', nameAm: 'ኢታንግ', nameOr: 'Itang' },
    ]},
    { regionCode: 'HR', cities: [
      { name: 'Harar', nameAm: 'ሐረር', nameOr: 'Harar' },
    ]},
    { regionCode: 'DD', cities: [
      { name: 'Dire Dawa', nameAm: 'ድሬዳዋ', nameOr: 'Dire Dawa' },
    ]},
    { regionCode: 'BG', cities: [
      { name: 'Assosa', nameAm: 'አሶሳ', nameOr: 'Asosa' },
      { name: 'Kamashi', nameAm: 'ካማሺ', nameOr: 'Kamashi' },
      { name: 'Gilgel Beles', nameAm: 'ግልገል በለስ', nameOr: 'Gilgel Beles' },
    ]},
  ];

  // Clear existing cities first to prevent doubling on deployment
  await prisma.city.deleteMany({});
  console.log('Cleared existing cities...');

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
      descriptionOr: "Daandii Afrikaaf qophaa'e baay'ee cimaa ta'e saadaraa sibiila 3-wheeler. Motor cimaa 4000W, fagoo 180km, fi ijaarsa cimaa qaba.",
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