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
    const { productId, fromAgentId, toAgentId, quantity, type, notes, unitIds } = await req.json();

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Invalid productId or quantity' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validation for serialized products
    if (product.isSerialized) {
      if (!unitIds || !Array.isArray(unitIds) || unitIds.length !== quantity) {
        return NextResponse.json({ 
          error: `This product is serialized. Please select exactly ${quantity} units.` 
        }, { status: 400 });
      }

      // Verify units belong to the product and are at the source location
      const sourceAgentId = fromAgentId || null;
      const units = await prisma.productUnit.findMany({
        where: {
          id: { in: unitIds },
          productId,
          currentAgentId: sourceAgentId,
          isSold: false
        }
      });

      if (units.length !== unitIds.length) {
        return NextResponse.json({ 
          error: 'Some selected units are invalid, already sold, or not at the source location' 
        }, { status: 400 });
      }
    }

    // Atomic transaction for transfer
    await prisma.$transaction(async (tx) => {
      // 1. Decrement from source
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
        // Should ideally exist if we are transferring from there
        await tx.inventory.create({
          data: { productId, agentId: fromAgentIdVal, quantity: -quantity }
        });
      }

      // 2. Increment to destination
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

      // 3. Update ProductUnits if serialized
      if (product.isSerialized && unitIds) {
        await tx.productUnit.updateMany({
          where: { id: { in: unitIds } },
          data: { currentAgentId: toAgentId || null }
        });
      }

      // 4. Log transaction
      await tx.inventoryTransaction.create({
        data: {
          productId,
          fromAgentId: fromAgentId || null,
          toAgentId: toAgentId || null,
          quantity,
          type: type || 'TRANSFER',
          notes: notes || 'Stock movement',
          performedBy: session.user.id,
          units: product.isSerialized ? {
            connect: unitIds.map(id => ({ id }))
          } : undefined
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
