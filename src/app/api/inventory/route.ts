import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
          }
        }
      }
    });

    return NextResponse.json(inventory);
  } catch (error: any) {
    console.error('CRITICAL: Failed to fetch inventory:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity, notes } = await req.json();

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
    }

    // Update or create warehouse inventory (agentId: null)
    // Note: Prisma 5/6 doesn't support null in compound unique constraints for upsert/findUnique
    const existing = await prisma.inventory.findFirst({
      where: {
        productId,
        agentId: null
      }
    });

    let inventory;
    if (existing) {
      inventory = await prisma.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: { increment: quantity }
        }
      });
    } else {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          agentId: null,
          quantity,
        }
      });
    }

    // Record transaction
    await prisma.inventoryTransaction.create({
      data: {
        productId,
        toAgentId: null, // To Warehouse
        quantity,
        type: 'INITIAL_STOCK',
        notes: notes || 'Initial stock adjustment',
        performedBy: session.user.id,
      }
    });

    return NextResponse.json(inventory);
  } catch (error: any) {
    console.error('CRITICAL: Failed to update inventory:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
