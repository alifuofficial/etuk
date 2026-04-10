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
      rejectedAgents,
      totalUsers,
      totalProducts,
      activeProducts,
      recentApplications,
    ] = await Promise.all([
      db.agent.count(),
      db.agent.count({ where: { status: 'PENDING' } }),
      db.agent.count({ where: { status: 'APPROVED' } }),
      db.agent.count({ where: { status: 'REJECTED' } }),
      db.user.count(),
      db.product.count(),
      db.product.count({ where: { isActive: true } }),
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
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get agents by city (Approved only for the map)
    const agentsByCity = await db.agent.groupBy({
      where: { status: 'APPROVED' },
      by: ['city'],
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

    // Get agents by business type
    const agentsByBusinessType = await db.agent.groupBy({
      by: ['businessType'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 8,
    });

    // Get warehouse inventory summary
    const warehouseInventory = await db.inventory.findMany({
      where: { agentId: null },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            isSerialized: true,
          },
        },
      },
    });

    const totalWarehouseUnits = warehouseInventory.reduce((sum, item) => sum + item.quantity, 0);

    // Get inventory distributed to agents
    const agentInventoryCount = await db.inventory.aggregate({
      where: { agentId: { not: null } },
      _sum: {
        quantity: true,
      },
    });

    // Get agents with warehouse
    const agentsWithWarehouse = await db.agent.count({
      where: { hasWarehouse: true, status: 'APPROVED' },
    });

    // Get products by category
    const productsByCategory = await db.product.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get serialized vs non-serialized products
    const serializedProducts = await db.product.count({
      where: { isSerialized: true, isActive: true },
    });
    const nonSerializedProducts = await db.product.count({
      where: { isSerialized: false, isActive: true },
    });

    // Get recent SMS count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSmsCount = await db.smsLog.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const successfulSms = await db.smsLog.count({
      where: {
        status: 'success',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Calculate conversion rate
    const conversionRate = totalAgents > 0 
      ? Math.round((approvedAgents / totalAgents) * 100) 
      : 0;

    // Get approval/rejection this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const approvedThisMonth = await db.agent.count({
      where: {
        status: 'APPROVED',
        reviewedAt: {
          gte: startOfMonth,
        },
      },
    });
    const rejectedThisMonth = await db.agent.count({
      where: {
        status: 'REJECTED',
        reviewedAt: {
          gte: startOfMonth,
        },
      },
    });

    // Get unique regions and cities covered
    const uniqueRegions = await db.agent.groupBy({
      by: ['region'],
      where: { status: 'APPROVED' },
    });
    const uniqueCities = await db.agent.groupBy({
      by: ['city'],
      where: { status: 'APPROVED' },
    });
    
    return NextResponse.json({
      stats: {
        totalAgents,
        pendingApplications,
        approvedAgents,
        rejectedAgents,
        totalUsers,
        totalProducts,
        activeProducts,
        conversionRate,
        warehouseUnits: totalWarehouseUnits,
        distributedUnits: agentInventoryCount._sum.quantity || 0,
        agentsWithWarehouse,
        approvedThisMonth,
        rejectedThisMonth,
        uniqueRegions: uniqueRegions.length,
        uniqueCities: uniqueCities.length,
        recentSmsCount,
        successfulSms,
        serializedProducts,
        nonSerializedProducts,
      },
      recentApplications,
      monthlyTrend,
      agentsByRegion,
      agentsByCity,
      agentsByStatus,
      agentsByBusinessType: agentsByBusinessType.filter(a => a.businessType),
      productsByCategory,
      warehouseInventory: warehouseInventory.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}