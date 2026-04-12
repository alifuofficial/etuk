import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch available units for assignment
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'WAREHOUSE_MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const whereClause: any = {
      currentAgentId: null, // In warehouse
      isSold: false,
      status: 'AVAILABLE'
    };

    if (productId) {
      whereClause.productId = productId;
    }

    const units = await prisma.productUnit.findMany({
      where: whereClause,
      include: {
        product: {
          select: { id: true, name: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const agents = await prisma.agent.findMany({
      where: { status: 'APPROVED' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        phone: true
      },
      orderBy: { firstName: 'asc' }
    });

    return NextResponse.json({ units, agents });
  } catch (error: any) {
    console.error('Failed to fetch units:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Assign units to an agent
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !['ADMIN', 'WAREHOUSE_MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { agentId, unitIds, notes } = await req.json();

    if (!agentId || !unitIds || !Array.isArray(unitIds) || unitIds.length === 0) {
      return NextResponse.json({ error: 'Agent ID and unit IDs are required' }, { status: 400 });
    }

    // Verify agent exists and is approved
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, status: 'APPROVED' }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found or not approved' }, { status: 404 });
    }

    // Verify all units exist and are available in warehouse
    const units = await prisma.productUnit.findMany({
      where: {
        id: { in: unitIds },
        currentAgentId: null,
        isSold: false,
        status: 'AVAILABLE'
      },
      include: { product: true }
    });

    if (units.length !== unitIds.length) {
      return NextResponse.json({ 
        error: 'Some units are not available for assignment' 
      }, { status: 400 });
    }

    // Group units by product
    const productGroups = units.reduce((acc: any, unit) => {
      if (!acc[unit.productId]) {
        acc[unit.productId] = [];
      }
      acc[unit.productId].push(unit);
      return acc;
    }, {});

    // Perform assignment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update all units to assign to agent
      for (const unitId of unitIds) {
        await tx.productUnit.update({
          where: { id: unitId },
          data: { 
            currentAgentId: agentId,
            status: 'ASSIGNED'
          }
        });
      }

      // Update inventory for each product
      for (const [productId, productUnits] of Object.entries(productGroups) as [string, any[]][]) {
        // Decrease warehouse inventory
        const warehouseInv = await tx.inventory.findFirst({
          where: { productId, agentId: null }
        });

        if (warehouseInv) {
          await tx.inventory.update({
            where: { id: warehouseInv.id },
            data: { quantity: { decrement: productUnits.length } }
          });
        }

        // Increase agent inventory
        const agentInv = await tx.inventory.findFirst({
          where: { productId, agentId }
        });

        if (agentInv) {
          await tx.inventory.update({
            where: { id: agentInv.id },
            data: { quantity: { increment: productUnits.length } }
          });
        } else {
          await tx.inventory.create({
            data: {
              productId,
              agentId,
              quantity: productUnits.length
            }
          });
        }

        // Create transaction record
        await tx.inventoryTransaction.create({
          data: {
            productId,
            fromAgentId: null, // Warehouse
            toAgentId: agentId,
            quantity: productUnits.length,
            type: 'TRANSFER',
            notes: notes || 'Unit assignment by warehouse manager',
            performedBy: session.user.id,
            units: {
              connect: productUnits.map(u => ({ id: u.id }))
            }
          }
        });
      }

      return { assignedCount: unitIds.length };
    });

    return NextResponse.json({ 
      message: `Successfully assigned ${result.assignedCount} units to ${agent.firstName} ${agent.lastName}`,
      assignedCount: result.assignedCount
    });
  } catch (error: any) {
    console.error('Failed to assign units:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}