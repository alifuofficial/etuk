import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;
  // Strip spaces, dashes, and leading +
  let cleaned = phone.toString().replace(/[\s\-]/g, '').replace(/^\+/, '');
  // If starts with 09 or 07 convert to 2519/2517
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    cleaned = '251' + cleaned.slice(1);
  }
  return cleaned;
}

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const data = await request.json();
    
    // Normalize email
    const normalizedEmail = data.email ? data.email.toLowerCase().trim() : undefined;
    const normalizedPhone = normalizePhone(data.phone);
    
    // Check for existing user with same email (excluding current user)
    if (normalizedEmail) {
      const existingEmail = await db.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id },
        },
      });
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'This email address is already registered. Please use a different email.' },
          { status: 400 }
        );
      }
    }
    
    // Check for existing user with same phone (if phone provided, excluding current user)
    if (normalizedPhone) {
      const existingPhone = await db.user.findFirst({
        where: {
          phone: normalizedPhone,
          NOT: { id },
        },
      });
      
      if (existingPhone) {
        return NextResponse.json(
          { error: 'This phone number is already registered. Please use a different phone number.' },
          { status: 400 }
        );
      }
    }
    
    const updateData: Record<string, unknown> = {
      name: data.name,
      email: normalizedEmail,
      role: data.role,
      phone: normalizedPhone,
      isActive: data.isActive,
    };
    
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Prevent deleting self
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    await db.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
