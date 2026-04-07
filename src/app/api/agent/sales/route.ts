import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Record a new sale
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productUnitId, customerName, customerPhone, soldAt, notes } = await req.json();

    if (!productUnitId || !customerName || !customerPhone) {
      return NextResponse.json({ 
        error: 'Product unit ID, customer name, and phone are required' 
      }, { status: 400 });
    }

    // Find the agent record for the logged-in user
    const agent = await prisma.agent.findFirst({
      where: { email: session.user.email || '' }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify the unit belongs to this agent and is not sold
    const unit = await prisma.productUnit.findFirst({
      where: {
        id: productUnitId,
        currentAgentId: agent.id,
        isSold: false
      },
      include: { product: true }
    });

    if (!unit) {
      return NextResponse.json({ 
        error: 'Unit not found or not assigned to you, or already sold' 
      }, { status: 404 });
    }

    // Record the sale
    const result = await prisma.$transaction(async (tx) => {
      // Create sale record
      const sale = await tx.sale.create({
        data: {
          productUnitId,
          agentId: agent.id,
          customerName,
          customerPhone,
          soldAt: soldAt ? new Date(soldAt) : new Date(),
          notes: notes || null
        }
      });

      // Mark unit as sold
      await tx.productUnit.update({
        where: { id: productUnitId },
        data: {
          isSold: true,
          soldAt: new Date(),
          status: 'SOLD'
        }
      });

      // Update agent inventory
      const agentInv = await tx.inventory.findFirst({
        where: { productId: unit.productId, agentId: agent.id }
      });

      if (agentInv && agentInv.quantity > 0) {
        await tx.inventory.update({
          where: { id: agentInv.id },
          data: { quantity: { decrement: 1 } }
        });
      }

      // Create transaction record
      await tx.inventoryTransaction.create({
        data: {
          productId: unit.productId,
          fromAgentId: agent.id,
          toAgentId: null, // Sold to customer
          quantity: 1,
          type: 'SALE',
          notes: `Sold to ${customerName} (${customerPhone})${notes ? ' - ' + notes : ''}`,
          performedBy: session.user.id,
          units: {
            connect: { id: unit.id }
          }
        }
      });

      return sale;
    });

    return NextResponse.json({ 
      message: 'Sale recorded successfully',
      sale: result
    });
  } catch (error: any) {
    console.error('Failed to record sale:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Fetch sales history for agent
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find the agent record for the logged-in user
    const agent = await prisma.agent.findFirst({
      where: { email: session.user.email || '' }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const sales = await prisma.sale.findMany({
      where: { agentId: agent.id },
      include: {
        productUnit: {
          include: {
            product: {
              select: { name: true, category: true }
            }
          }
        }
      },
      orderBy: { soldAt: 'desc' },
      take: limit
    });

    return NextResponse.json({ sales });
  } catch (error: any) {
    console.error('Failed to fetch sales:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}