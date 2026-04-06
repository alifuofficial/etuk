import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

const SMS_API_BASE = 'https://smsethiopia.et/api/sms/send';

function normalizePhone(phone: string): string {
  // Strip spaces, dashes, and leading +
  let cleaned = phone.replace(/[\s\-]/g, '').replace(/^\+/, '');
  // If starts with 09 or 07 convert to 2519/2517
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    cleaned = '251' + cleaned.slice(1);
  }
  return cleaned;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Check DB for API Key
  const dbSetting = await prisma.setting.findUnique({ where: { key: 'sms_api_key' } });
  
  // 2. Fallback to Env
  const apiKey = dbSetting?.value || process.env.SMS_ETHIOPIA_API_KEY;

  if (!apiKey || apiKey === 'your_smsethiopia_api_key_here') {
    return NextResponse.json(
      { error: 'SMS API key not configured. Please set it in Settings -> SMS.' },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { message, agentIds, phones } = body as {
    message: string;
    agentIds?: string[];
    phones?: { phone: string; agentId?: string }[];
  };

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  if (message.length > 160) {
    return NextResponse.json({ error: 'Message must be 160 characters or less' }, { status: 400 });
  }

  // Resolve recipients
  let recipients: { phone: string; agentId?: string }[] = [];

  if (phones && phones.length > 0) {
    recipients = phones;
  } else if (agentIds && agentIds.length > 0) {
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, phone: true },
    });
    recipients = agents.map((a) => ({ phone: a.phone, agentId: a.id }));
  } else {
    return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
  }

  const results: { phone: string; agentId?: string; status: 'success' | 'failed'; error?: string }[] = [];

  for (const recipient of recipients) {
    const msisdn = normalizePhone(recipient.phone);
    let status: 'success' | 'failed' = 'failed';
    let errorMessage: string | undefined;

    try {
      const res = await fetch(SMS_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          KEY: apiKey,
        },
        body: JSON.stringify({ msisdn, text: message }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        status = 'success';
      } else {
        errorMessage = data.message || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      errorMessage = err.message || 'Network error';
    }

    // Log to DB
    await prisma.smsLog.create({
      data: {
        agentId: recipient.agentId || null,
        recipient: msisdn,
        message,
        status,
        errorMessage: errorMessage || null,
        sentBy: session.user?.id || null,
      },
    });

    results.push({ phone: msisdn, agentId: recipient.agentId, status, error: errorMessage });
  }

  const successCount = results.filter((r) => r.status === 'success').length;
  const failCount = results.filter((r) => r.status === 'failed').length;

  return NextResponse.json({ results, successCount, failCount });
}
