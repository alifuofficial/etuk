import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const agentId = searchParams.get('agentId');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100');
  const page = parseInt(searchParams.get('page') || '1');
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status && status !== 'all') where.status = status;
  if (agentId) where.agentId = agentId;
  
  if (search) {
    where.OR = [
      { recipient: { contains: search } },
      { message: { contains: search } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.smsLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.smsLog.count({ where }),
  ]);

  // Fetch agent names for logs that have an agentId
  const agentIds = [...new Set(logs.filter((l) => l.agentId).map((l) => l.agentId!))] as string[];
  // Fetch user names for logs where agentId is null (likely OTPs or direct API calls)
  const userIds = [...new Set(logs.filter((l) => !l.agentId && l.sentBy).map((l) => l.sentBy!))] as string[];

  const [agents, users] = await Promise.all([
    agentIds.length
      ? prisma.agent.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [],
    userIds.length
      ? prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true },
        })
      : [],
  ]);

  const agentMap = Object.fromEntries(agents.map((a) => [a.id, `${a.firstName} ${a.lastName}`]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const enriched = logs.map((log) => ({
    ...log,
    agentName: log.agentId 
      ? (agentMap[log.agentId] || null) 
      : (log.sentBy ? (userMap[log.sentBy] || 'System User') : 'System'),
  }));

  return NextResponse.json({ logs: enriched, total, page, limit });
}
