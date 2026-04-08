import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { password, isActive } = await request.json();

    // If only toggling active status
    if (isActive !== undefined && !password) {
      const agent = await db.agent.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!agent || !agent.userId) {
        return NextResponse.json({ error: 'Agent user account not found' }, { status: 404 });
      }

      await db.user.update({
        where: { id: agent.userId },
        data: { isActive }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Portal access ${isActive ? 'activated' : 'deactivated'} successfully` 
      });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const agent = await db.agent.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Portal access can only be activated for approved agents' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (agent.userId) {
      // Update existing user
      user = await db.user.update({
        where: { id: agent.userId },
        data: {
          password: hashedPassword,
          isActive: true,
        },
      });
    } else {
      // Check if a user with this email already exists
      const existingUser = await db.user.findUnique({
        where: { email: agent.email },
      });

      if (existingUser) {
        // Link existing user if it's not already linked
        user = await db.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            role: 'AGENT',
            isActive: true,
          },
        });
      } else {
        // Create new user
        user = await db.user.create({
          data: {
            email: agent.email,
            name: `${agent.firstName} ${agent.lastName}`,
            password: hashedPassword,
            role: 'AGENT',
            isActive: true,
          },
        });
      }

      // Link user to agent
      await db.agent.update({
        where: { id: agent.id },
        data: { userId: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: agent.userId ? 'Password updated successfully' : 'Portal access activated successfully',
    });
  } catch (error: any) {
    console.error('Portal access error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
