import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'MARKETING_MANAGER' || session.user.role === 'WAREHOUSE_MANAGER';

    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

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
          reviewer: { select: { name: true } },
        },
      }),
    ]);

    const last6MonthsDates = Array.from({ length: 6 }, (_, i) => {
      return new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    });

    const monthlyTrend = await Promise.all(
      last6MonthsDates.map(async (monthDate) => {
        const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
        const count = await db.agent.count({
          where: { createdAt: { gte: monthDate, lt: nextMonth } },
        });
        return {
          month: monthDate.toLocaleString('default', { month: 'short' }),
          applications: count,
        };
      })
    );

    const agentsByRegion = await db.agent.groupBy({
      by: ['region'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const agentsByCity = await db.agent.groupBy({
      where: { status: 'APPROVED' },
      by: ['city'],
      _count: { id: true },
    });

    const agentsByStatus = await db.agent.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const agentsByBusinessType = await db.agent.groupBy({
      by: ['businessType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 8,
    });

    const productsByCategory = await db.product.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const warehouseInventory = await db.inventory.findMany({
      where: { agentId: null },
      include: {
        product: {
          select: { id: true, name: true, category: true, isSerialized: true },
        },
      },
    });

    const totalWarehouseUnits = warehouseInventory.reduce((sum, item) => sum + item.quantity, 0);

    const agentInventoryCount = await db.inventory.aggregate({
      where: { agentId: { not: null } },
      _sum: { quantity: true },
    });

    const agentsWithWarehouse = await db.agent.count({
      where: { hasWarehouse: true, status: 'APPROVED' },
    });

    const serializedProducts = await db.product.count({
      where: { isSerialized: true, isActive: true },
    });
    const nonSerializedProducts = await db.product.count({
      where: { isSerialized: false, isActive: true },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSmsCount = await db.smsLog.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const successfulSms = await db.smsLog.count({
      where: { status: 'success', createdAt: { gte: sevenDaysAgo } },
    });

    const conversionRate = totalAgents > 0 ? Math.round((approvedAgents / totalAgents) * 100) : 0;

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const approvedThisMonth = await db.agent.count({
      where: { status: 'APPROVED', reviewedAt: { gte: startOfMonth } },
    });
    const rejectedThisMonth = await db.agent.count({
      where: { status: 'REJECTED', reviewedAt: { gte: startOfMonth } },
    });

    const uniqueRegions = await db.agent.groupBy({
      by: ['region'],
      where: { status: 'APPROVED' },
    });
    const uniqueCities = await db.agent.groupBy({
      by: ['city'],
      where: { status: 'APPROVED' },
    });

    const totalCustomers = await db.customer.count();

    const customersByAgent = await db.customer.groupBy({
      by: ['agentId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topAgentIds = customersByAgent.map(c => c.agentId);
    const topAgentsData = await db.agent.findMany({
      where: { id: { in: topAgentIds } },
      select: { id: true, firstName: true, lastName: true, businessName: true },
    });

    const agentCustomerCounts = customersByAgent.map(c => {
      const agent = topAgentsData.find(a => a.id === c.agentId);
      return {
        agentId: c.agentId,
        agentName: agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown',
        businessName: agent?.businessName,
        customerCount: c._count.id,
      };
    });

    const recentSales = await db.sale.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: { select: { firstName: true, lastName: true, businessName: true } },
        customer: { select: { fullName: true, phone: true } },
        productUnit: { include: { product: { select: { name: true, category: true } } } },
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesWithProductTransfer = await db.$queryRaw<{ 
      saleId: string; 
      transferDate: Date; 
      saleDate: Date; 
    }[]>`
      SELECT s.id as saleId, it.createdAt as transferDate, s.createdAt as saleDate
      FROM Sale s
      JOIN ProductUnit pu ON s.productUnitId = pu.id
      JOIN InventoryTransaction it ON it.productId = pu.productId 
        AND it.toAgentId = s.agentId
        AND it.type = 'TRANSFER'
      WHERE s.createdAt >= datetime('now', '-30 days')
    `;

    let avgDaysToSell = 0;
    const totalSalesInPeriod = salesWithProductTransfer.length;
    if (totalSalesInPeriod > 0) {
      const totalDays = salesWithProductTransfer.reduce((sum, s) => {
        const diff = new Date(s.saleDate).getTime() - new Date(s.transferDate).getTime();
        return sum + (diff / (1000 * 60 * 60 * 24));
      }, 0);
      avgDaysToSell = Math.round(totalDays / totalSalesInPeriod);
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const salesVelocity = await Promise.all(
      last7Days.map(async (date) => {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        
        const count = await db.sale.count({
          where: { createdAt: { gte: start, lte: end } },
        });
        
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: count,
        };
      })
    );

    const totalSales = await db.sale.count();
    const salesThisMonth = await db.sale.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const topSellingProducts = await db.$queryRaw<{
      productId: string;
      productName: string;
      category: string;
      totalSales: bigint;
    }[]>`
      SELECT p.id as productId, p.name as productName, p.category, COUNT(s.id) as totalSales
      FROM Sale s
      JOIN ProductUnit pu ON s.productUnitId = pu.id
      JOIN Product p ON pu.productId = p.id
      GROUP BY p.id
      ORDER BY totalSales DESC
      LIMIT 5
    `;

    // Proforma stats
    const [
      totalProformas,
      pendingProformas,
      paymentPendingProformas,
      paidProformas,
      rejectedProformas,
    ] = await Promise.all([
      db.proforma.count(),
      db.proforma.count({ where: { status: 'PENDING' } }),
      db.proforma.count({ where: { status: 'PAYMENT_PENDING' } }),
      db.proforma.count({ where: { status: 'PAID' } }),
      db.proforma.count({ where: { status: 'REJECTED' } }),
    ]);

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
        totalCustomers,
        totalSales,
        salesThisMonth,
        avgDaysToSell,
        // Proforma stats
        totalProformas,
        pendingProformas,
        paymentPendingProformas,
        paidProformas,
        rejectedProformas,
      },
      recentApplications,
      monthlyTrend,
      agentsByRegion,
      agentsByCity,
      agentsByStatus,
      agentsByBusinessType: agentsByBusinessType.filter(a => a.businessType),
      productsByCategory,
      warehouseInventory: warehouseInventory.slice(0, 5),
      agentCustomerCounts,
      recentSales: recentSales.map(s => ({
        id: s.id,
        agent: s.agent ? `${s.agent.firstName} ${s.agent.lastName}` : 'Unknown',
        businessName: s.agent?.businessName,
        customer: s.customer?.fullName || s.customerName || 'Walk-in',
        customerPhone: s.customer?.phone || s.customerPhone,
        product: s.productUnit?.product?.name || 'Unknown Product',
        category: s.productUnit?.product?.category || 'N/A',
        chassisNumber: s.productUnit?.chassisNumber,
        date: s.createdAt,
        notes: s.notes,
      })),
      salesVelocity,
      topSellingProducts: topSellingProducts.map(p => ({
        productId: p.productId,
        productName: p.productName,
        category: p.category,
        totalSales: Number(p.totalSales),
      })),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}