import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch agent's assigned units
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the agent record for the logged-in user
    const agent = await prisma.agent.findFirst({
      where: { 
        email: session.user.email || ''
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get all units assigned to this agent
    const units = await prisma.productUnit.findMany({
      where: {
        currentAgentId: agent.id,
        isSold: false
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get sales history for this agent
    const sales = await prisma.sale.findMany({
      where: { agentId: agent.id },
      include: {
        productUnit: {
          include: {
            product: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { soldAt: 'desc' },
      take: 50
    });

    // Summary stats
    const totalUnits = units.length;
    const totalValue = units.reduce((sum, unit) => sum + (unit.product.price || 0), 0);
    const totalSold = sales.length;

    return NextResponse.json({ 
      agent,
      units, 
      sales,
      stats: {
        totalUnits,
        totalValue,
        totalSold
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch agent units:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}