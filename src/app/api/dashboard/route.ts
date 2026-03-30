import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Dashboard statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get counts
    const [
      totalAgents,
      pendingApplications,
      approvedAgents,
      rejectedApplications,
      totalUsers,
      recentApplications,
    ] = await Promise.all([
      db.agent.count(),
      db.agent.count({ where: { status: 'PENDING' } }),
      db.agent.count({ where: { status: 'APPROVED' } }),
      db.agent.count({ where: { status: 'REJECTED' } }),
      db.user.count(),
      db.agent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: { name: true },
          },
        },
      }),
    ]);
    
    // Get monthly registration trends (last 6 months)
    const now = new Date();
    const last6MonthsDates = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return d;
    });

    const monthlyTrend = await Promise.all(
      last6MonthsDates.map(async (monthDate) => {
        const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        const count = await db.agent.count({
          where: {
            createdAt: {
              gte: monthDate,
              lt: nextMonth,
            },
          },
        });
        return {
          month: monthDate.toLocaleString('default', { month: 'short' }),
          applications: count,
        };
      })
    );
    
    // Get agents by region
    const agentsByRegion = await db.agent.groupBy({
      by: ['region'],
      _count: {
        id: true,
      },
    });
    
    // Get agents by status
    const agentsByStatus = await db.agent.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });
    
    return NextResponse.json({
      stats: {
        totalAgents,
        pendingApplications,
        approvedAgents,
        rejectedApplications,
        totalUsers,
      },
      recentApplications,
      monthlyTrend,
      agentsByRegion,
      agentsByStatus,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
