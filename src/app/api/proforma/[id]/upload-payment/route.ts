import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST - Upload payment receipt for proforma
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get agent record for this user
    const agent = await db.agent.findFirst({
      where: {
        OR: [
          { userId: session.user.id },
          { email: session.user.email }
        ]
      }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get the proforma and verify it belongs to this agent
    const proforma = await db.proforma.findUnique({
      where: { id },
      include: { agent: true }
    });

    if (!proforma) {
      return NextResponse.json({ error: 'Proforma not found' }, { status: 404 });
    }

    if (proforma.agentId !== agent.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only allow uploading payment for PENDING proformas
    if (proforma.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only upload payment for pending proformas' },
        { status: 400 }
      );
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('receipt') as File;
    const paymentRef = formData.get('paymentRef') as string || '';
    const notes = formData.get('notes') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'Payment receipt file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'payments');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `payment-${proforma.number}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update proforma with payment receipt
    const receiptPath = `/uploads/payments/${fileName}`;
    
    const updatedProforma = await db.proforma.update({
      where: { id },
      data: {
        paymentReceipt: receiptPath,
        paymentRef: paymentRef || null,
        status: 'PAYMENT_PENDING',
      },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: true,
        productUnits: {
          select: {
            id: true,
            chassisNumber: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    // TODO: Send notification to accountant about new payment to verify
    // This could be an SMS or in-app notification

    return NextResponse.json({
      success: true,
      message: 'Payment receipt uploaded successfully',
      proforma: updatedProforma,
    });
  } catch (error) {
    console.error('Error uploading payment receipt:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment receipt' },
      { status: 500 }
    );
  }
}
