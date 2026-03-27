import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import bcrypt from 'bcryptjs';
import path from 'path';

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const logs: string[] = [];
  
  try {
    // Check for secret key to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.SEED_SECRET && secret !== 'etuk-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logs.push('Starting seed process...');
    logs.push(`DATABASE_URL: ${process.env.DATABASE_URL}`);
    logs.push(`Working directory: ${process.cwd()}`);
    
    // Dynamic import of Prisma to catch errors
    let db: any;
    try {
      const dbModule = await import('@/lib/db');
      db = dbModule.db;
      logs.push('Prisma client loaded successfully');
    } catch (e) {
      logs.push(`Failed to load Prisma client: ${e instanceof Error ? e.message : String(e)}`);
      return NextResponse.json({ 
        error: 'Prisma client not available',
        logs,
        suggestion: 'Make sure Prisma is properly generated in the container'
      }, { status: 500 });
    }

    const results = {
      users: [] as string[],
      regions: 0,
      cities: 0,
      errors: [] as string[],
    };

    // Try to push database schema using local prisma
    try {
      logs.push('Attempting to push database schema...');
      const prismaBinPath = path.join(process.cwd(), 'node_modules', '.bin', 'prisma');
      logs.push(`Prisma binary path: ${prismaBinPath}`);
      
      const { stdout, stderr } = await execAsync(
        `node ${prismaBinPath} db push --skip-generate --accept-data-loss 2>&1`,
        { 
          cwd: process.cwd(),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
        }
      );
      logs.push(`Schema push output: ${stdout}`);
      if (stderr) logs.push(`Schema push stderr: ${stderr}`);
    } catch (e) {
      logs.push(`Schema push attempt: ${e instanceof Error ? e.message : String(e)}`);
      // Continue anyway - database might already exist
    }

    // Test database connection
    try {
      await db.$connect();
      logs.push('Database connected successfully');
    } catch (e) {
      logs.push(`Database connection failed: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Check if users table exists and has users
    try {
      const existingUsers = await db.user.findMany();
      logs.push(`Found ${existingUsers.length} existing users`);
    } catch (e) {
      logs.push(`Error checking users: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Create admin users with fresh hashes
    const users = [
      { email: 'admin@etuk.et', name: 'Admin User', password: 'admin123', role: 'ADMIN', phone: '+251911000001' },
      { email: 'manager@etuk.et', name: 'Marketing Manager', password: 'manager123', role: 'MARKETING_MANAGER', phone: '+251911000002' },
      { email: 'officer@etuk.et', name: 'Marketing Officer', password: 'officer123', role: 'MARKETING_OFFICER', phone: '+251911000003' },
    ];

    for (const user of users) {
      try {
        logs.push(`Processing user: ${user.email}`);
        
        // Check if exists
        const existing = await db.user.findUnique({ where: { email: user.email } });
        
        if (existing) {
          // Update the password to ensure it's correct
          const hashedPassword = await bcrypt.hash(user.password, 10);
          await db.user.update({
            where: { email: user.email },
            data: {
              password: hashedPassword,
              isActive: true,
              role: user.role,
            },
          });
          results.users.push(`${user.email} (updated)`);
          logs.push(`Updated existing user: ${user.email}`);
        } else {
          // Create new user
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
          results.users.push(`${user.email} (created)`);
          logs.push(`Created new user: ${user.email}`);
        }
      } catch (e) {
        const errorMsg = `Error with user ${user.email}: ${e instanceof Error ? e.message : String(e)}`;
        logs.push(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    // Verify users were created
    try {
      const finalUsers = await db.user.findMany();
      logs.push(`Final user count: ${finalUsers.length}`);
      logs.push(`Users in DB: ${finalUsers.map((u: any) => u.email).join(', ')}`);
    } catch (e) {
      logs.push(`Error verifying users: ${e instanceof Error ? e.message : String(e)}`);
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
        logs.push(`Region error: ${e instanceof Error ? e.message : String(e)}`);
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
        logs.push(`City creation error: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    logs.push('Seed process completed!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      results,
      logs,
      credentials: {
        admin: 'admin@etuk.et / admin123',
        manager: 'manager@etuk.et / manager123',
        officer: 'officer@etuk.et / officer123',
      },
    });
  } catch (error) {
    logs.push(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      logs,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
