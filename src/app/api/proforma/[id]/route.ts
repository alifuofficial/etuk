import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { triggerTemplateSms } from '@/lib/sms';

// GET - Get single proforma details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const proforma = await db.proforma.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            businessName: true,
            region: true,
            city: true,
          },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, category: true, price: true },
            },
          },
        },
        productUnits: {
          select: {
            id: true,
            chassisNumber: true,
            status: true,
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!proforma) {
      return NextResponse.json(
        { error: 'Proforma not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(proforma);
  } catch (error) {
    console.error('Error fetching proforma:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proforma' },
      { status: 500 }
    );
  }
}

// PUT - Update proforma (mark as paid, cancel, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, paymentRef } = body;

    const proforma = await db.proforma.findUnique({
      where: { id },
      include: { 
        agent: {
          select: { firstName: true, lastName: true, phone: true },
        }, 
        productUnits: true,
        items: true,
      },
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

      // Send SMS to warehouse manager to prepare products
      try {
        const warehouseManagers = await db.user.findMany({
          where: { role: 'WAREHOUSE_MANAGER', isActive: true },
        });

        const chassisList = proforma.productUnits.map(u => u.chassisNumber).join(', ');
        const message = `PROFORMA PAID: ${proforma.number} for ${proforma.agent.firstName} ${proforma.agent.lastName}. Please prepare units: ${chassisList}`;

        for (const manager of warehouseManagers) {
          if (manager.phone) {
            await triggerTemplateSms('PROFORMA_PAID', manager.phone, proforma.id, {
              PROFORMA: proforma.number,
              AGENT: `${proforma.agent.firstName} ${proforma.agent.lastName}`,
              CHASSIS: chassisList,
            }).catch(console.error);
          }
        }
      } catch (smsError) {
        console.error('Failed to send warehouse SMS:', smsError);
      }
    }

    if (status === 'CANCELLED' || status === 'EXPIRED') {
      // Release reserved chassis numbers
      await db.productUnit.updateMany({
        where: { proformaId: proforma.id },
        data: {
          proformaId: null,
          status: 'AVAILABLE',
        },
      });
    }

    const updatedProforma = await db.proforma.update({
      where: { id },
      data: updateData,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            businessName: true,
          },
        },
        items: true,
        productUnits: {
          select: {
            id: true,
            chassisNumber: true,
            status: true,
          },
        },
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

// DELETE - Cancel proforma
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const proforma = await db.proforma.findUnique({
      where: { id },
    });

    if (!proforma) {
      return NextResponse.json(
        { error: 'Proforma not found' },
        { status: 404 }
      );
    }

    // Release reserved chassis numbers and cancel proforma
    await db.$transaction(async (tx) => {
      await tx.productUnit.updateMany({
        where: { proformaId: id },
        data: {
          proformaId: null,
          status: 'AVAILABLE',
        },
      });

      await tx.proforma.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling proforma:', error);
    return NextResponse.json(
      { error: 'Failed to cancel proforma' },
      { status: 500 }
    );
  }
}
