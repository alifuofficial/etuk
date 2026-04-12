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

    console.log('Upload request received:', {
      proformaId: id,
      proformaNumber: proforma.number,
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      paymentRef,
    });

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
    console.log('Uploads directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'png';
    const fileName = `payment-${proforma.number}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);
    
    console.log('Saving file to:', filePath);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    console.log('File saved successfully. Size:', buffer.length, 'bytes');

    // Verify file was written
    const fileExists = existsSync(filePath);
    console.log('File exists after write:', fileExists);

    // Update proforma with payment receipt
    const receiptPath = `/uploads/payments/${fileName}`;
    console.log('Storing receipt path:', receiptPath);
    
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

    return NextResponse.json({
      success: true,
      message: 'Payment receipt uploaded successfully',
      receiptPath,
      proforma: updatedProforma,
    });
  } catch (error) {
    console.error('Error uploading payment receipt:', error);
    return NextResponse.json(
      { error: 'Failed to upload payment receipt', details: String(error) },
      { status: 500 }
    );
  }
}
