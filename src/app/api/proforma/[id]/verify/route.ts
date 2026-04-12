import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { triggerTemplateSms } from '@/lib/sms';

// Get bank details from settings
async function getBankDetails(): Promise<string> {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['companyBankName', 'companyBankAccount', 'companyBankBranch']
        }
      }
    });
    
    const bankName = settings.find(s => s.key === 'companyBankName')?.value || 'CBE';
    const account = settings.find(s => s.key === 'companyBankAccount')?.value || '1000123456789';
    const branch = settings.find(s => s.key === 'companyBankBranch')?.value || '';
    
    return `${bankName} ${account}${branch ? ` (${branch})` : ''}`;
  } catch {
    return 'CBE 1000123456789';
  }
}

// POST - Verify payment (approve or reject)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ACCOUNTANT') {
      return NextResponse.json({ error: 'Unauthorized - Accountant access required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, action, notes, paymentRef } = body;

    const proforma = await db.proforma.findUnique({
      where: { id },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            businessName: true,
          },
        },
        items: true,
        productUnits: true,
      },
    });

    if (!proforma) {
      return NextResponse.json({ error: 'Proforma not found' }, { status: 404 });
    }

    // Handle different actions
    if (action === 'approve' || status === 'PAID') {
      // Approve payment - mark as PAID and notify warehouse
      const updatedProforma = await db.proforma.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paymentRef: paymentRef || `VERIFIED-${Date.now()}`,
        },
        include: {
          agent: true,
          items: true,
          productUnits: true,
        },
      });

      // Send SMS to warehouse managers
      try {
        const warehouseManagers = await db.user.findMany({
          where: { role: 'WAREHOUSE_MANAGER', isActive: true },
        });

        const chassisList = proforma.productUnits.map(u => u.chassisNumber).join(', ');
        const agentName = `${proforma.agent.firstName} ${proforma.agent.lastName}`;
        const bankDetails = await getBankDetails();

        for (const manager of warehouseManagers) {
          if (manager.phone) {
            await triggerTemplateSms('PROFORMA_PAID', manager.phone, proforma.id, {
              PROFORMA: proforma.number,
              AGENT: agentName,
              CHASSIS: chassisList || 'No specific chassis reserved',
              AMOUNT: proforma.totalAmount.toLocaleString(),
              BANK: bankDetails,
            }).catch(console.error);
          }
        }

        // Also notify the agent
        await triggerTemplateSms('PAYMENT_APPROVED', proforma.agent.phone, proforma.id, {
          NAME: `${proforma.agent.firstName} ${proforma.agent.lastName}`,
          PROFORMA: proforma.number,
          CHASSIS: chassisList || 'Contact admin for details',
        }).catch(console.error);

      } catch (smsError) {
        console.error('Failed to send notifications:', smsError);
      }

      return NextResponse.json(updatedProforma);

    } else if (action === 'reject' || status === 'REJECTED') {
      // Reject payment - cancel proforma and release chassis
      const updatedProforma = await db.$transaction(async (tx) => {
        // Release chassis numbers
        await tx.productUnit.updateMany({
          where: { proformaId: id },
          data: {
            proformaId: null,
            status: 'AVAILABLE',
          },
        });

        return await tx.proforma.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            reviewNotes: notes || 'Payment rejected by accountant',
          },
          include: {
            agent: true,
            items: true,
            productUnits: true,
          },
        });
      });

      // Notify agent about rejection
      try {
        await triggerTemplateSms('PAYMENT_REJECTED', proforma.agent.phone, proforma.id, {
          NAME: `${proforma.agent.firstName} ${proforma.agent.lastName}`,
          PROFORMA: proforma.number,
          REASON: notes || 'Payment verification failed',
        }).catch(console.error);
      } catch (smsError) {
        console.error('Failed to send rejection notification:', smsError);
      }

      return NextResponse.json(updatedProforma);

    } else if (status === 'PAYMENT_PENDING') {
      // Mark as payment pending (agent says they paid)
      const updatedProforma = await db.proforma.update({
        where: { id },
        data: {
          status: 'PAYMENT_PENDING',
          reviewNotes: notes || null,
        },
        include: {
          agent: true,
          items: true,
          productUnits: true,
        },
      });

      return NextResponse.json(updatedProforma);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}