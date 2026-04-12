import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Reactivate a cancelled or expired proforma
export async function POST(
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
      include: { productUnits: true },
    });

    if (!proforma) {
      return NextResponse.json({ error: 'Proforma not found' }, { status: 404 });
    }

    if (proforma.status !== 'CANCELLED' && proforma.status !== 'EXPIRED') {
      return NextResponse.json(
        { error: 'Only cancelled or expired proformas can be reactivated' },
        { status: 400 }
      );
    }

    // Set new expiration date (7 days from now)
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedProforma = await db.$transaction(async (tx) => {
      // Update proforma status
      const updated = await tx.proforma.update({
        where: { id },
        data: {
          status: 'PENDING',
          expiresAt: newExpiresAt,
        },
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
          productUnits: true,
        },
      });

      // Re-reserve chassis numbers if any were associated
      if (proforma.productUnits.length > 0) {
        await tx.productUnit.updateMany({
          where: { proformaId: id },
          data: { status: 'RESERVED' },
        });
      }

      return updated;
    });

    return NextResponse.json(updatedProforma);
  } catch (error) {
    console.error('Error reactivating proforma:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate proforma' },
      { status: 500 }
    );
  }
}
