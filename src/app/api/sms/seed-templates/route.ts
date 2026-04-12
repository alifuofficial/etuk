import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Seed default SMS templates
export async function POST() {
  try {
    const defaultTemplates = [
      {
        name: 'PROFORMA_CREATED',
        content: 'Hello {NAME}, your proforma {PROFORMA} for ETB {AMOUNT} has been created. Please pay before {DEADLINE}. Bank: {BANK}',
        isActive: true,
      },
      {
        name: 'PROFORMA_REMINDER',
        content: 'Reminder: Your proforma {PROFORMA} expires on {DEADLINE}. Amount: ETB {AMOUNT}. Please complete payment to secure your units.',
        isActive: true,
      },
      {
        name: 'PROFORMA_PAID',
        content: 'Payment received for proforma {PROFORMA}. Agent: {AGENT}. Chassis: {CHASSIS}. Amount: ETB {AMOUNT}. Please prepare units for delivery.',
        isActive: true,
      },
      {
        name: 'PAYMENT_APPROVED',
        content: 'Hello {NAME}, your payment for proforma {PROFORMA} has been approved! Your reserved units (Chassis: {CHASSIS}) will be prepared for delivery.',
        isActive: true,
      },
      {
        name: 'PAYMENT_REJECTED',
        content: 'Hello {NAME}, your payment for proforma {PROFORMA} was rejected. Reason: {REASON}. Please contact support or upload a valid receipt.',
        isActive: true,
      },
    ];

    for (const template of defaultTemplates) {
      await db.smsTemplate.upsert({
        where: { name: template.name },
        update: {
          content: template.content,
          isActive: template.isActive,
        },
        create: template,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Default SMS templates seeded successfully',
      templates: defaultTemplates.map(t => t.name),
    });
  } catch (error) {
    console.error('Error seeding SMS templates:', error);
    return NextResponse.json(
      { error: 'Failed to seed SMS templates' },
      { status: 500 }
    );
  }
}
