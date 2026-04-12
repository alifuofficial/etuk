import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();
    const { fullName, phone, email, address, notes } = data;

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

    // Verify customer belongs to this agent
    const existingCustomer = await db.customer.findFirst({
      where: { id, agentId: agent.id }
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check if new phone conflicts with another customer
    if (phone && phone !== existingCustomer.phone) {
      const phoneConflict = await db.customer.findFirst({
        where: {
          agentId: agent.id,
          phone: phone,
          NOT: { id }
        }
      });

      if (phoneConflict) {
        return NextResponse.json({ error: 'Customer with this phone already exists' }, { status: 400 });
      }
    }

    const customer = await db.customer.update({
      where: { id },
      data: {
        fullName: fullName || existingCustomer.fullName,
        phone: phone || existingCustomer.phone,
        email: email !== undefined ? email : existingCustomer.email,
        address: address !== undefined ? address : existingCustomer.address,
        notes: notes !== undefined ? notes : existingCustomer.notes
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    // Verify customer belongs to this agent
    const customer = await db.customer.findFirst({
      where: { id, agentId: agent.id }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await db.customer.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}