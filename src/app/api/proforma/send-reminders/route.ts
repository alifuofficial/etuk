import { NextResponse } from 'next/server';
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

// POST - Send reminders for proformas about to expire
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['ADMIN', 'MARKETING_MANAGER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Find proformas that are:
    // 1. PENDING status
    // 2. Expiring within 3 days
    // 3. Haven't been reminded recently (we'll track this with a simple approach)
    const pendingProformas = await db.proforma.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lte: threeDaysFromNow,
          gte: now,
        },
      },
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    let sentCount = 0;
    let failedCount = 0;
    const bankDetails = await getBankDetails();

    for (const proforma of pendingProformas) {
      try {
        const vatAmount = proforma.totalAmount * 0.15;
        const totalWithVat = proforma.totalAmount + vatAmount;
        const daysLeft = Math.ceil((proforma.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const expiresFormatted = proforma.expiresAt.toLocaleDateString();

        await triggerTemplateSms('PROFORMA_REMINDER', proforma.agent.phone, proforma.id, {
          NAME: `${proforma.agent.firstName} ${proforma.agent.lastName}`,
          PROFORMA: proforma.number,
          AMOUNT: totalWithVat.toLocaleString(),
          DEADLINE: expiresFormatted,
          BANK: bankDetails,
          DAYS_LEFT: daysLeft.toString(),
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder for proforma ${proforma.number}:`, error);
        failedCount++;
      }
    }

    // Also find expired proformas and mark them
    const expiredProformas = await db.proforma.updateMany({
      where: {
        status: 'PENDING',
        expiresAt: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    return NextResponse.json({
      success: true,
      remindersSent: sentCount,
      remindersFailed: failedCount,
      expiredCount: expiredProformas.count,
      totalChecked: pendingProformas.length,
    });
  } catch (error) {
    console.error('Error sending proforma reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}
