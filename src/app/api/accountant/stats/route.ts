import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ACCOUNTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      total,
      pending,
      paymentPending,
      paid,
      expired,
      cancelled,
    ] = await Promise.all([
      db.proforma.count(),
      db.proforma.count({ where: { status: 'PENDING' } }),
      db.proforma.count({ where: { status: 'PAYMENT_PENDING' } }),
      db.proforma.count({ where: { status: 'PAID' } }),
      db.proforma.count({ where: { status: 'EXPIRED' } }),
      db.proforma.count({ where: { status: 'CANCELLED' } }),
    ]);

    const amountResult = await db.proforma.aggregate({
      where: { status: { in: ['PENDING', 'PAYMENT_PENDING', 'PAID'] } },
      _sum: { totalAmount: true },
    });

    return NextResponse.json({
      total,
      pending,
      paymentPending,
      paid,
      expired,
      cancelled,
      totalAmount: amountResult._sum.totalAmount || 0,
    });
  } catch (error) {
    console.error('Error fetching accountant stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}