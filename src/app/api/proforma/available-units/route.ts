import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get available chassis numbers for proforma creation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const where: Record<string, unknown> = {
      status: 'AVAILABLE',
      isSold: false,
      currentAgentId: null,
      proformaId: null, // Not reserved by any proforma
    };

    if (productId) {
      where.productId = productId;
    }

    const units = await db.productUnit.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { chassisNumber: 'asc' },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error('Error fetching available units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available units' },
      { status: 500 }
    );
  }
}
