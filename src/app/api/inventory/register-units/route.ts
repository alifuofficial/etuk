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
    const { productId, chassisNumbers } = await req.json();

    if (!productId || !chassisNumbers || !Array.isArray(chassisNumbers) || chassisNumbers.length === 0) {
      return NextResponse.json({ error: 'Product ID and at least one chassis number are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isSerialized) {
      return NextResponse.json({ error: 'Product not found or is not serialized' }, { status: 404 });
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

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current warehouse inventory
      const existingInv = await tx.inventory.findFirst({
        where: { productId, agentId: null }
      });

      if (!existingInv || existingInv.quantity <= 0) {
        throw new Error('No available warehouse stock to register chassis numbers against.');
      }

      // 2. See how many units are already registered to warehouse
      const currentWarehouseUnitsCount = await tx.productUnit.count({
        where: { productId, currentAgentId: null, isSold: false }
      });

      const unregisteredCount = existingInv.quantity - currentWarehouseUnitsCount;

      if (chassisNumbers.length > unregisteredCount) {
        throw new Error(`Cannot register ${chassisNumbers.length} units. You only have ${unregisteredCount} unregistered unit(s) in the warehouse.`);
      }

      // 3. Create ProductUnit records
      let createdUnits = [];
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

      // 4. Record transaction and link units
      await tx.inventoryTransaction.create({
        data: {
          productId,
          toAgentId: null,
          quantity: chassisNumbers.length,
          type: 'REGISTER_CHASSIS',
          notes: 'Retroactive chassis registration for existing stock',
          performedBy: session.user.id,
          units: {
            connect: createdUnits.map(u => ({ id: u.id }))
          }
        }
      });

      return { registeredCount: createdUnits.length };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('CRITICAL: Failed to register units:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}
