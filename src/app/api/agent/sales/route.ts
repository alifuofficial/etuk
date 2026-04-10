import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Record a new sale (supports single or multiple units)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { 
      productUnitIds,
      productUnitId,
      customerId,
      customerName, 
      customerPhone, 
      soldAt, 
      notes 
    } = body;

    const unitIds = productUnitIds || (productUnitId ? [productUnitId] : []);
    
    if (unitIds.length === 0) {
      return NextResponse.json({ error: 'At least one product unit is required' }, { status: 400 });
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email || '' }
        ]
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const units = await prisma.productUnit.findMany({
      where: {
        id: { in: unitIds },
        currentAgentId: agent.id,
        isSold: false
      },
      include: { product: true }
    });

    if (units.length !== unitIds.length) {
      const foundIds = units.map(u => u.id);
      const missingOrInvalid = unitIds.filter((id: string) => !foundIds.includes(id));
      return NextResponse.json({ 
        error: `${missingOrInvalid.length} unit(s) not found, not assigned, or already sold`,
        invalidIds: missingOrInvalid
      }, { status: 400 });
    }

    const saleDate = soldAt ? new Date(soldAt) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const createdSales = [];

      for (const unit of units) {
        const sale = await tx.sale.create({
          data: {
            productUnitId: unit.id,
            agentId: agent.id,
            customerId: customerId || null,
            customerName,
            customerPhone,
            soldAt: saleDate,
            notes: notes || null
          }
        });

        await tx.productUnit.update({
          where: { id: unit.id },
          data: {
            isSold: true,
            soldAt: saleDate,
            status: 'SOLD'
          }
        });

        const agentInv = await tx.inventory.findFirst({
          where: { productId: unit.productId, agentId: agent.id }
        });

        if (agentInv && agentInv.quantity > 0) {
          await tx.inventory.update({
            where: { id: agentInv.id },
            data: { quantity: { decrement: 1 } }
          });
        }

        await tx.inventoryTransaction.create({
          data: {
            productId: unit.productId,
            fromAgentId: agent.id,
            toAgentId: null,
            quantity: 1,
            type: 'SALE',
            notes: `Sold to ${customerName} (${customerPhone})${notes ? ' - ' + notes : ''}`,
            performedBy: session.user.id,
            units: {
              connect: { id: unit.id }
            }
          }
        });

        createdSales.push({
          ...sale,
          productUnit: {
            id: unit.id,
            chassisNumber: unit.chassisNumber,
            product: {
              name: unit.product.name,
              category: unit.product.category,
              price: unit.product.price
            }
          }
        });
      }

      return createdSales;
    });

    const totalValue = result.reduce((sum, sale) => sum + (sale.productUnit.product.price || 0), 0);

    return NextResponse.json({ 
      message: `${result.length} sale(s) recorded successfully`,
      sales: result,
      totalValue,
      count: result.length
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
    const agent = await prisma.agent.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email || '' }
        ]
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const customerId = searchParams.get('customerId');

    const whereClause: any = { agentId: agent.id };
    if (customerId) {
      whereClause.customerId = customerId;
    }

    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        productUnit: {
          include: {
            product: {
              select: { name: true, category: true, price: true }
            }
          }
        },
        customer: {
          select: { id: true, fullName: true, phone: true }
        }
      },
      orderBy: { soldAt: 'desc' },
      take: limit
    });

    const totalSales = await prisma.sale.count({
      where: { agentId: agent.id }
    });

    return NextResponse.json({ 
      sales,
      analytics: {
        totalSales
      }
    });
  } catch (error: any) {
    console.error('Failed to fetch sales:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}