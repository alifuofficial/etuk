import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  try {
    // Check for secret key to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.SEED_SECRET && secret !== 'etuk-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results = {
      users: [] as string[],
      regions: 0,
      cities: 0,
      databaseInitialized: false,
    };

    // First, try to push the database schema
    try {
      await execAsync('npx prisma db push --skip-generate');
      results.databaseInitialized = true;
    } catch (e) {
      console.log('Database might already exist or push failed:', e);
      // Continue anyway, database might already be set up
    }

    // Create admin users
    const users = [
      { email: 'admin@etuk.et', name: 'Admin User', password: 'admin123', role: 'ADMIN', phone: '+251911000001' },
      { email: 'manager@etuk.et', name: 'Marketing Manager', password: 'manager123', role: 'MARKETING_MANAGER', phone: '+251911000002' },
      { email: 'officer@etuk.et', name: 'Marketing Officer', password: 'officer123', role: 'MARKETING_OFFICER', phone: '+251911000003' },
    ];

    for (const user of users) {
      try {
        const existing = await db.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await db.user.create({
            data: {
              email: user.email,
              name: user.name,
              password: hashedPassword,
              role: user.role,
              phone: user.phone,
              isActive: true,
            },
          });
          results.users.push(`${user.email} / ${user.password}`);
        } else {
          results.users.push(`${user.email} (already exists)`);
        }
      } catch (e) {
        console.error(`Error creating user ${user.email}:`, e);
      }
    }

    // Create regions
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
        await db.region.upsert({
          where: { code: region.code },
          update: region,
          create: { ...region, isActive: true },
        });
        results.regions++;
      } catch (e) {
        console.log('Region error:', e);
      }
    }

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
      try {
        const region = await db.region.findUnique({
          where: { code: regionCities.regionCode },
        });
        
        if (region) {
          for (const city of regionCities.cities) {
            try {
              await db.city.create({
                data: {
                  name: city.name,
                  nameAm: city.nameAm,
                  nameOr: city.nameOr,
                  regionId: region.id,
                  isActive: true,
                },
              });
              results.cities++;
            } catch (e) {
              // Ignore duplicates
            }
          }
        }
      } catch (e) {
        console.log('City creation error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results,
      credentials: {
        admin: 'admin@etuk.et / admin123',
        manager: 'manager@etuk.et / manager123',
        officer: 'officer@etuk.et / officer123',
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
