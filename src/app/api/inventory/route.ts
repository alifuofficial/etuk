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
        product: {
          include: {
            units: true
          }
        },
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
    const { productId, quantity, notes, chassisNumbers } = await req.json();

    if (!productId || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ error: 'Product ID and valid quantity are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Validation for serialized products
    if (product.isSerialized) {
      if (!chassisNumbers || !Array.isArray(chassisNumbers) || chassisNumbers.length !== quantity) {
        return NextResponse.json({ 
          error: `This product is serialized. Please provide exactly ${quantity} unique chassis numbers.` 
        }, { status: 400 });
      }

      // Check for duplicate chassis numbers in the input
      const uniqueInput = new Set(chassisNumbers);
      if (uniqueInput.size !== chassisNumbers.length) {
        return NextResponse.json({ error: 'Duplicate chassis numbers in input' }, { status: 400 });
      }

      // Check for existing chassis numbers in database
      const existingUnits = await prisma.productUnit.findMany({
        where: { chassisNumber: { in: chassisNumbers } }
      });

      if (existingUnits.length > 0) {
        return NextResponse.json({ 
          error: `Some chassis numbers are already registered: ${existingUnits.map(u => u.chassisNumber).join(', ')}` 
        }, { status: 400 });
      }
    }

    // Atomic transaction for inventory increase
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update or create warehouse inventory (agentId: null)
      const existingInv = await tx.inventory.findFirst({
        where: { productId, agentId: null }
      });

      let updatedInventory;
      if (existingInv) {
        updatedInventory = await tx.inventory.update({
          where: { id: existingInv.id },
          data: { quantity: { increment: quantity } }
        });
      } else {
        updatedInventory = await tx.inventory.create({
          data: { productId, agentId: null, quantity }
        });
      }

      // 2. Create ProductUnit records if serialized
      let createdUnits = [];
      if (product.isSerialized && chassisNumbers) {
        for (const chassis of chassisNumbers) {
          const unit = await tx.productUnit.create({
            data: {
              productId,
              chassisNumber: chassis,
              currentAgentId: null, // Warehouse
              status: 'AVAILABLE'
            }
          });
          createdUnits.push(unit);
        }
      }

      // 3. Record transaction and link units
      await tx.inventoryTransaction.create({
        data: {
          productId,
          toAgentId: null,
          quantity,
          type: 'INITIAL_STOCK',
          notes: notes || 'Initial stock adjustment',
          performedBy: session.user.id,
          units: product.isSerialized ? {
            connect: createdUnits.map(u => ({ id: u.id }))
          } : undefined
        }
      });

      return updatedInventory;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRITICAL: Failed to update inventory:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
