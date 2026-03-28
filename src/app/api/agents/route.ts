import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - List all agents (Protected - Admin only)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only ADMIN and MARKETING_MANAGER can list all agents
    if (!['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const region = searchParams.get('region');
    
    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (region) {
      where.region = region;
    }
    
    const agents = await db.agent.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        region: true,
        city: true,
        status: true,
        createdAt: true,
        businessName: true,
        businessType: true,
        // Don't expose sensitive documents in list
        tradeLicense: false,
        idDocument: false,
        bankName: false,
        accountNumber: false,
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// POST - Create new agent application (Public)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract text fields
    const data: Record<string, string | null> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value || null;
      }
    });

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'region', 'city'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email || '')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (basic)
    const phone = data.phone || '';
    if (phone.length < 10 || phone.length > 20) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Handle file upload
    let tradeLicensePath: string | null = null;
    const file = formData.get('tradeLicense') as File | null;
    
    if (file && file.size > 0) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 5MB' },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const extension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const filename = `${uuidv4()}.${extension}`;
      const uploadDir = join(process.cwd(), 'public/uploads/agents');
      
      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true });
      
      const path = join(uploadDir, filename);
      await writeFile(path, buffer);
      
      tradeLicensePath = `/uploads/agents/${filename}`;
    }
    
    const agent = await db.agent.create({
      data: {
        firstName: data.firstName!,
        lastName: data.lastName!,
        email: data.email!,
        phone: data.phone!,
        alternativePhone: data.alternativePhone || null,
        businessName: data.businessName || null,
        businessType: data.businessType || null,
        experience: data.experience || null,
        region: data.region!,
        city: data.city!,
        woreda: data.woreda || null,
        kebele: data.kebele || null,
        address: data.address || null,
        hasWarehouse: data.hasWarehouse === 'true',
        warehouseSize: data.warehouseSize || null,
        existingBrands: data.existingBrands || null,
        staffCount: data.staffCount ? parseInt(data.staffCount) : null,
        estimatedCapital: data.estimatedCapital || null,
        bankName: data.bankName || null,
        accountNumber: data.accountNumber || null,
        tradeLicense: tradeLicensePath,
        idDocument: data.idDocument || null,
        tinNumber: data.tinNumber || null,
        message: data.message || null,
        howDidYouHear: data.howDidYouHear || null,
        status: 'PENDING',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent application' },
      { status: 500 }
    );
  }
}
