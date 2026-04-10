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

// GET - List all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const users = await db.user.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.name || !data.password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, password' },
        { status: 400 }
      );
    }
    
    // Normalize email
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(data.phone);
    
    // Check for existing user with same email
    const existingEmail = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email address is already registered. Please use a different email.' },
        { status: 400 }
      );
    }
    
    // Check for existing user with same phone (if phone provided)
    if (normalizedPhone) {
      const existingPhone = await db.user.findFirst({
        where: { phone: normalizedPhone },
      });
      
      if (existingPhone) {
        return NextResponse.json(
          { error: 'This phone number is already registered. Please use a different phone number.' },
          { status: 400 }
        );
      }
    }
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: data.name,
        password: hashedPassword,
        role: data.role || 'MARKETING_OFFICER',
        phone: normalizedPhone,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}