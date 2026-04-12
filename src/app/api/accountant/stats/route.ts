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
      rejected,
      recentPending,
      recentVerified,
    ] = await Promise.all([
      db.proforma.count(),
      db.proforma.count({ where: { status: 'PENDING' } }),
      db.proforma.count({ where: { status: 'PAYMENT_PENDING' } }),
      db.proforma.count({ where: { status: 'PAID' } }),
      db.proforma.count({ where: { status: 'EXPIRED' } }),
      db.proforma.count({ where: { status: 'CANCELLED' } }),
      db.proforma.count({ where: { status: 'REJECTED' } }),
      // Recent proformas awaiting verification (last 7 days)
      db.proforma.findMany({
        where: { 
          status: 'PAYMENT_PENDING',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        include: {
          agent: {
            select: {
              firstName: true,
              lastName: true,
              businessName: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Recently verified payments (last 7 days)
      db.proforma.findMany({
        where: { 
          status: 'PAID',
          verifiedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        include: {
          agent: {
            select: {
              firstName: true,
              lastName: true,
              businessName: true,
            },
          },
          items: true,
        },
        orderBy: { verifiedAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate amounts
    const [pendingAmountResult, paidAmountResult] = await Promise.all([
      db.proforma.aggregate({
        where: { status: 'PAYMENT_PENDING' },
        _sum: { totalAmount: true },
      }),
      db.proforma.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true },
      }),
    ]);

    const pendingAmount = pendingAmountResult._sum.totalAmount || 0;
    const paidAmount = paidAmountResult._sum.totalAmount || 0;
    const vatRate = 0.15;

    return NextResponse.json({
      total,
      pending,
      paymentPending,
      paid,
      expired,
      cancelled,
      rejected,
      totalAmount: pendingAmount + paidAmount,
      pendingAmount: pendingAmount * (1 + vatRate),
      paidAmount: paidAmount * (1 + vatRate),
      recentPending: recentPending.map(p => ({
        ...p,
        totalWithVat: p.items.reduce((sum, item) => sum + item.totalPrice, 0) * (1 + vatRate),
      })),
      recentVerified: recentVerified.map(p => ({
        ...p,
        totalWithVat: p.items.reduce((sum, item) => sum + item.totalPrice, 0) * (1 + vatRate),
      })),
    });
  } catch (error) {
    console.error('Error fetching accountant stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
