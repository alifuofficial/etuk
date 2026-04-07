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

    if (!productId || typeof quantity !== 'number' || quantity === 0) {
      return NextResponse.json({ error: 'Product ID and valid quantity (non-zero) are required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const absQuantity = Math.abs(quantity);
    const isRemoving = quantity < 0;

    // Validation for serialized products
    if (product.isSerialized) {
      if (!chassisNumbers || !Array.isArray(chassisNumbers) || chassisNumbers.length !== absQuantity) {
        return NextResponse.json({ 
          error: `This product is serialized. Please provide exactly ${absQuantity} unique chassis numbers.` 
        }, { status: 400 });
      }

      // Check for duplicate chassis numbers in the input
      const uniqueInput = new Set(chassisNumbers);
      if (uniqueInput.size !== chassisNumbers.length) {
        return NextResponse.json({ error: 'Duplicate chassis numbers in input' }, { status: 400 });
      }

      if (isRemoving) {
        // When removing, chassis numbers must exist in warehouse
        const existingUnits = await prisma.productUnit.findMany({
          where: { 
            chassisNumber: { in: chassisNumbers },
            productId,
            currentAgentId: null,
            isSold: false
          }
        });

        if (existingUnits.length !== chassisNumbers.length) {
          const foundNumbers = existingUnits.map(u => u.chassisNumber);
          const missingNumbers = chassisNumbers.filter((c: string) => !foundNumbers.includes(c));
          return NextResponse.json({ 
            error: `Some chassis numbers not found in warehouse stock: ${missingNumbers.join(', ')}` 
          }, { status: 400 });
        }
      } else {
        // When adding, chassis numbers must not exist
        const existingUnits = await prisma.productUnit.findMany({
          where: { chassisNumber: { in: chassisNumbers } }
        });

        if (existingUnits.length > 0) {
          return NextResponse.json({ 
            error: `Some chassis numbers are already registered: ${existingUnits.map(u => u.chassisNumber).join(', ')}` 
          }, { status: 400 });
        }
      }
    }

    // Check if there's enough stock when removing
    if (isRemoving) {
      const existingInv = await prisma.inventory.findFirst({
        where: { productId, agentId: null }
      });

      if (!existingInv || existingInv.quantity < absQuantity) {
        const currentStock = existingInv?.quantity || 0;
        return NextResponse.json({ 
          error: `Insufficient stock. Current warehouse stock: ${currentStock}, requested to remove: ${absQuantity}` 
        }, { status: 400 });
      }
    }

    // Atomic transaction for inventory update
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
      } else if (!isRemoving) {
        updatedInventory = await tx.inventory.create({
          data: { productId, agentId: null, quantity }
        });
      } else {
        throw new Error('No inventory record found to remove from');
      }

      // 2. Create or delete ProductUnit records if serialized
      let affectedUnits: any[] = [];
      if (product.isSerialized && chassisNumbers) {
        if (isRemoving) {
          // Delete the units
          for (const chassis of chassisNumbers) {
            await tx.productUnit.deleteMany({
              where: { 
                productId,
                chassisNumber: chassis,
                currentAgentId: null,
                isSold: false
              }
            });
          }
          affectedUnits = chassisNumbers;
        } else {
          // Create the units
          for (const chassis of chassisNumbers) {
            const unit = await tx.productUnit.create({
              data: {
                productId,
                chassisNumber: chassis,
                currentAgentId: null, // Warehouse
                status: 'AVAILABLE'
              }
            });
            affectedUnits.push(unit);
          }
        }
      }

      // 3. Record transaction
      await tx.inventoryTransaction.create({
        data: {
          productId,
          toAgentId: null,
          quantity: absQuantity,
          type: isRemoving ? 'STOCK_REMOVAL' : 'INITIAL_STOCK',
          notes: notes || (isRemoving ? 'Stock removal' : 'Initial stock adjustment'),
          performedBy: session.user.id,
          units: product.isSerialized && !isRemoving ? {
            connect: affectedUnits.map((u: any) => ({ id: u.id }))
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
