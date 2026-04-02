import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, fromAgentId, toAgentId, quantity, type, notes } = await req.json();

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid productId or quantity' }, { status: 400 });
    }

    // Atomic transaction for transfer
    await prisma.$transaction(async (tx) => {
      // 1. Decrement from source (null = Warehouse)
      const fromAgentIdVal = fromAgentId || null;
      const existingFrom = await tx.inventory.findFirst({
        where: { productId, agentId: fromAgentIdVal }
      });

      if (existingFrom) {
        await tx.inventory.update({
          where: { id: existingFrom.id },
          data: { quantity: { decrement: quantity } }
        });
      } else {
        await tx.inventory.create({
          data: { productId, agentId: fromAgentIdVal, quantity: -quantity }
        });
      }

      // 2. Increment to destination (null = Warehouse)
      const toAgentIdVal = toAgentId || null;
      const existingTo = await tx.inventory.findFirst({
        where: { productId, agentId: toAgentIdVal }
      });

      if (existingTo) {
        await tx.inventory.update({
          where: { id: existingTo.id },
          data: { quantity: { increment: quantity } }
        });
      } else {
        await tx.inventory.create({
          data: { productId, agentId: toAgentIdVal, quantity: quantity }
        });
      }

      // 3. Log transaction
      await tx.inventoryTransaction.create({
        data: {
          productId,
          fromAgentId: fromAgentId || null,
          toAgentId: toAgentId || null,
          quantity,
          type: type || 'TRANSFER',
          notes: notes || 'Stock movement',
          performedBy: session.user.id,
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('CRITICAL: Stock transfer failed:', error);
    return NextResponse.json({ 
      error: 'Transfer failed',
      details: error.message 
    }, { status: 500 });
  }
}
