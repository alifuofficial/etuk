import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get agent's proformas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agent record for this user
    const agent = await db.agent.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email }
        ]
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      agentId: agent.id
    };
    if (status) where.status = status;

    const proformas = await db.proforma.findMany({
      where,
      include: {
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
    console.error('Error fetching agent proformas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proformas' },
      { status: 500 }
    );
  }
}
