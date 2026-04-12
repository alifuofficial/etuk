import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await db.agent.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email || '' }
        ]
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const customers = await db.customer.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sales: true }
        }
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agent = await db.agent.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email || '' }
        ]
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const data = await request.json();
    const { fullName, phone, email, address, notes } = data;

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // Check if customer with this phone already exists for this agent
    const existingCustomer = await db.customer.findUnique({
      where: {
        agentId_phone: {
          agentId: agent.id,
          phone: phone
        }
      }
    });

    if (existingCustomer) {
      return NextResponse.json({ error: 'Customer with this phone number already exists' }, { status: 400 });
    }

    const customer = await db.customer.create({
      data: {
        agentId: agent.id,
        fullName,
        phone,
        email: email || null,
        address: address || null,
        notes: notes || null
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}