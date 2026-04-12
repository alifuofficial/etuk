import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// DELETE - Permanently delete a proforma (only cancelled or expired)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const proforma = await db.proforma.findUnique({
      where: { id },
    });

    if (!proforma) {
      return NextResponse.json({ error: 'Proforma not found' }, { status: 404 });
    }

    if (proforma.status !== 'CANCELLED' && proforma.status !== 'EXPIRED') {
      return NextResponse.json(
        { error: 'Only cancelled or expired proformas can be permanently deleted' },
        { status: 400 }
      );
    }

    await db.$transaction(async (tx) => {
      // Release any reserved units first
      await tx.productUnit.updateMany({
        where: { proformaId: id },
        data: {
          proformaId: null,
          status: 'AVAILABLE',
        },
      });

      // Delete proforma items
      await tx.proformaItem.deleteMany({
        where: { proformaId: id },
      });

      // Delete the proforma
      await tx.proforma.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting proforma:', error);
    return NextResponse.json(
      { error: 'Failed to delete proforma' },
      { status: 500 }
    );
  }
}
