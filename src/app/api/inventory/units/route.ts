import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const agentId = searchParams.get('agentId'); // null/empty string for Warehouse

    if (!productId) {
      return NextResponse.json({ error: 'ProductId is required' }, { status: 400 });
    }

    const units = await prisma.productUnit.findMany({
      where: {
        productId,
        currentAgentId: agentId || null,
        isSold: false,
        status: 'AVAILABLE'
      },
      select: {
        id: true,
        chassisNumber: true,
        status: true
      }
    });

    return NextResponse.json(units);
  } catch (error: any) {
    console.error('Failed to fetch product units:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
