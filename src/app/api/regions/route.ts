import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all regions with cities
export async function GET() {
  try {
    const regions = await db.region.findMany({
      where: { isActive: true },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}
