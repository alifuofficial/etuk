import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch all templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await db.smsTemplate.findMany({
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST - Create or Update template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, content, isActive } = await request.json();

    if (!name || !content) {
      return NextResponse.json({ error: 'Name and content are required' }, { status: 400 });
    }

    const template = await db.smsTemplate.upsert({
      where: { name },
      update: {
        content,
        isActive: isActive !== undefined ? isActive : true,
      },
      create: {
        name,
        content,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error saving SMS template:', error);
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
  }
}
