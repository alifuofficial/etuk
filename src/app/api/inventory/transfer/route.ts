import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, fromAgentId, toAgentId, quantity, type, notes } = await req.json();

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Product ID and valid quantity are required' }, { status: 400 });
    }

    // Check from storage availability
    const sourceInventory = await prisma.inventory.findUnique({
      where: {
        productId_agentId: {
          productId,
          agentId: fromAgentId || null,
        }
      }
    });

    if (!sourceInventory || sourceInventory.quantity < quantity) {
      return NextResponse.json({ 
        error: `Insufficient stock in ${fromAgentId ? 'agent' : 'warehouse'}. Current: ${sourceInventory?.quantity || 0}` 
      }, { status: 400 });
    }

    // Perform transaction using a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Decrement source
      await tx.inventory.update({
        where: {
          productId_agentId: {
            productId,
            agentId: fromAgentId || null,
          }
        },
        data: {
          quantity: { decrement: quantity }
        }
      });

      // 2. Increment destination
      await tx.inventory.upsert({
        where: {
          productId_agentId: {
            productId,
            agentId: toAgentId || null,
          }
        },
        update: {
          quantity: { increment: quantity }
        },
        create: {
          productId,
          agentId: toAgentId || null,
          quantity,
        }
      });

      // 3. Record transaction log
      await tx.inventoryTransaction.create({
        data: {
          productId,
          fromAgentId: fromAgentId || null,
          toAgentId: toAgentId || null,
          quantity,
          type: type || 'TRANSFER',
          notes: notes || `Transfer from ${fromAgentId ? 'agent' : 'warehouse'} to ${toAgentId ? 'agent' : 'warehouse'}`,
          performedBy: session.user.id,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to perform transfer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
