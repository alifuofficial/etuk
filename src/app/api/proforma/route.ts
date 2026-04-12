import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { triggerTemplateSms } from '@/lib/sms';

// Bank details for proforma
const BANK_DETAILS = `CBE 1000123456789 | Awash 123456789 | Dashen 987654321`;

// Generate unique proforma number
function generateProformaNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PRO-${year}${month}-${random}`;
}

// GET - List all proformas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const agentId = searchParams.get('agentId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (agentId) where.agentId = agentId;

    const proformas = await db.proforma.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            businessName: true,
          },
        },
        items: true,
        productUnits: {
          select: {
            id: true,
            chassisNumber: true,
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proformas);
  } catch (error) {
    console.error('Error fetching proformas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proformas' },
      { status: 500 }
    );
  }
}

// POST - Create new proforma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, items, unitIds, notes, validityDays = 7 } = body;

    if (!agentId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Agent ID and at least one item are required' },
        { status: 400 }
      );
    }

    // Verify agent exists and is approved
    const agent = await db.agent.findUnique({
      where: { id: agentId, status: 'APPROVED' },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found or not approved' },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const proformaItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      const itemTotal = item.quantity * (product.price || 0);
      totalAmount += itemTotal;

      proformaItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price || 0,
        totalPrice: itemTotal,
      });
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    // Create proforma in transaction
    const result = await db.$transaction(async (tx) => {
      // Create proforma
      const proforma = await tx.proforma.create({
        data: {
          number: generateProformaNumber(),
          agentId,
          totalAmount,
          notes,
          expiresAt,
          status: 'PENDING',
          items: {
            create: proformaItems,
          },
        },
        include: {
          items: true,
          agent: true,
        },
      });

      // Lock/reserve chassis numbers if provided
      if (unitIds && Array.isArray(unitIds) && unitIds.length > 0) {
        await tx.productUnit.updateMany({
          where: { id: { in: unitIds } },
          data: {
            proformaId: proforma.id,
            status: 'RESERVED',
          },
        });
      }

      return proforma;
    });

    // Send SMS to agent with proforma details
    try {
      const vatAmount = totalAmount * 0.15;
      const totalWithVat = totalAmount + vatAmount;
      const expiresFormatted = expiresAt.toLocaleDateString();
      
      await triggerTemplateSms('PROFORMA_CREATED', agent.phone, result.id, {
        NAME: `${agent.firstName} ${agent.lastName}`,
        PROFORMA: result.number,
        AMOUNT: totalWithVat.toLocaleString(),
        DEADLINE: expiresFormatted,
        BANK: BANK_DETAILS,
      });
    } catch (smsError) {
      console.error('Failed to send proforma SMS:', smsError);
      // Don't fail the request if SMS fails
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating proforma:', error);
    return NextResponse.json(
      { error: 'Failed to create proforma' },
      { status: 500 }
    );
  }
}

// PUT - Update proforma status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { proformaId, status, paymentRef } = body;

    if (!proformaId || !status) {
      return NextResponse.json(
        { error: 'Proforma ID and status are required' },
        { status: 400 }
      );
    }

    const proforma = await db.proforma.findUnique({
      where: { id: proformaId },
      include: { agent: true, productUnits: true },
    });

    if (!proforma) {
      return NextResponse.json(
        { error: 'Proforma not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === 'PAID') {
      updateData.paidAt = new Date();
      if (paymentRef) updateData.paymentRef = paymentRef;
    }

    // If cancelled or expired, release reserved chassis numbers
    if (status === 'CANCELLED' || status === 'EXPIRED') {
      await db.productUnit.updateMany({
        where: { proformaId: proforma.id },
        data: {
          proformaId: null,
          status: 'AVAILABLE',
        },
      });
    }

    const updatedProforma = await db.proforma.update({
      where: { id: proformaId },
      data: updateData,
      include: {
        agent: true,
        items: true,
        productUnits: true,
      },
    });

    return NextResponse.json(updatedProforma);
  } catch (error) {
    console.error('Error updating proforma:', error);
    return NextResponse.json(
      { error: 'Failed to update proforma' },
      { status: 500 }
    );
  }
}
