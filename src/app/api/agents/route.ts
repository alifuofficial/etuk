import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

// GET - List all agents
export async function GET(request: NextRequest) {
  try {
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
      include: {
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

// POST - Create new agent application
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract text fields
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        data[key] = value;
      }
    });

    // Handle file upload
    let tradeLicensePath: string | null = null;
    const file = formData.get('tradeLicense') as File | null;
    
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const extension = file.name.split('.').pop();
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
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        alternativePhone: data.alternativePhone || null,
        businessName: data.businessName || null,
        businessType: data.businessType || null,
        experience: data.experience || null,
        region: data.region,
        city: data.city,
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
