import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const cities = await db.city.findMany({
      include: {
        region: true
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(cities);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, nameAm, nameOr, regionId } = body;

    // Check for duplicate city in the same region
    const existingCity = await db.city.findFirst({
      where: {
        name: name,
        regionId
      }
    });

    if (existingCity) {
      return new NextResponse('City already exists in this region', { status: 409 });
    }

    const city = await db.city.create({
      data: {
        name,
        nameAm,
        nameOr,
        regionId
      },
      include: {
        region: true
      }
    });

    return NextResponse.json(city);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
