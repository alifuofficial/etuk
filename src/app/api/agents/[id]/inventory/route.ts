import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const inventory = await prisma.inventory.findMany({
      where: { agentId: params.id },
      include: {
        product: true,
      }
    });

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        OR: [
          { fromAgentId: params.id },
          { toAgentId: params.id }
        ]
      },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ inventory, transactions });
  } catch (error: any) {
    console.error('CRITICAL: Failed to fetch agent inventory:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
