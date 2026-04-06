import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

// GET - Get single agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await db.agent.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// PUT - Update agent
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
    const contentType = request.headers.get('content-type') || '';
    let data: Record<string, any> = {};
    let tradeLicensePath: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      // Extract text fields
      formData.forEach((value, key) => {
        if (typeof value === 'string') {
          data[key] = value || null;
        }
      });

      // Handle file upload
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
        const uploadDir = join(process.cwd(), 'data/uploads/agents');
        
        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });
        
        const path = join(uploadDir, filename);
        await writeFile(path, buffer);
        
        tradeLicensePath = `/api/uploads/agents/${filename}`;
      }
    } else {
      // Assume JSON
      data = await request.json();
    }
    
    // Define all possible fields that can be updated
    const updateData: any = {};
    const allowedFields = [
      'firstName', 'lastName', 'email', 'phone', 'alternativePhone',
      'businessName', 'businessType', 'experience', 'region', 'city',
      'woreda', 'kebele', 'address', 'hasWarehouse', 'warehouseSize',
      'existingBrands', 'staffCount', 'estimatedCapital', 'bankName',
      'accountNumber', 'tinNumber', 'message', 'howDidYouHear', 'status',
      'reviewNotes'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        // Handle special types
        if (field === 'hasWarehouse') {
          updateData[field] = data[field] === true || data[field] === 'true';
        } else if (field === 'staffCount' && data[field]) {
          updateData[field] = parseInt(data[field].toString());
        } else if (field === 'phone' || field === 'alternativePhone') {
          updateData[field] = normalizePhone(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    });

    if (tradeLicensePath) {
      updateData.tradeLicense = tradeLicensePath;
    }

    if (data.status) {
      updateData.reviewedAt = new Date();
      updateData.reviewedBy = session.user.id;
    }
    
    const agent = await db.agent.update({
      where: { id },
      data: updateData,
    });
    
    // Log activity if status changed
    if (data.status) {
      await db.activityLog.create({
        data: {
          userId: session.user.id,
          action: data.status === 'APPROVED' ? 'APPROVE' : 'REJECT',
          entityType: 'AGENT',
          entityId: id,
          description: `Agent application ${data.status.toLowerCase()}`,
        },
      });
    } else {
      // General update log
      await db.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE',
          entityType: 'AGENT',
          entityId: id,
          description: `Agent details updated by ${session.user.name}`,
        },
      });
    }
    
    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

// DELETE - Delete agent
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
    await db.agent.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}
