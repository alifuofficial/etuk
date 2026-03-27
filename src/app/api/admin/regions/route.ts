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
    const regions = await db.region.findMany({
      include: {
        _count: {
          select: { cities: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(regions);
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
    const { name, nameAm, nameOr, code } = body;

    const region = await db.region.create({
      data: {
        name,
        nameAm,
        nameOr,
        code
      }
    });

    return NextResponse.json(region);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
