import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { agentIds, isActive } = await request.json();

    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return NextResponse.json({ error: 'No agents selected' }, { status: 400 });
    }

    // Find all agents with these IDs that have a linked user
    const agentsWithUsers = await db.agent.findMany({
      where: {
        id: { in: agentIds },
        userId: { not: null }
      },
      select: {
        userId: true
      }
    });

    const userIds = agentsWithUsers
      .map(a => a.userId)
      .filter((id): id is string => id !== null);

    if (userIds.length === 0) {
      return NextResponse.json({ 
        message: 'No linked user accounts found for selected agents.' 
      });
    }

    // Update all linked users' active status
    await db.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${isActive ? 'enabled' : 'disabled'} portal access for ${userIds.length} agents.`
    });
  } catch (error: any) {
    console.error('Bulk portal access error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
