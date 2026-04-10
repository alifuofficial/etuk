import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [agentsByCity, regions, cities] = await Promise.all([
      db.agent.groupBy({
        where: { status: 'APPROVED' },
        by: ['city'],
        _count: {
          id: true,
        },
      }),
      db.region.findMany({
        include: {
          _count: {
            select: { cities: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      db.city.findMany({
        include: {
          region: {
            select: { name: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      agentsByCity,
      regions,
      cities,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}