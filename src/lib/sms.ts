import { db as prisma } from '@/lib/db';

const SMS_API_BASE = 'https://smsethiopia.et/api/sms/send';

function normalizePhone(phone: string): string {
  // Strip spaces, dashes, and leading +
  let cleaned = phone.toString().replace(/[\s\-]/g, '').replace(/^\+/, '');
  // If starts with 09 or 07 convert to 2519/2517
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    cleaned = '251' + cleaned.slice(1);
  }
  return cleaned;
}

export async function sendSms({ 
  to, 
  message, 
  agentId, 
  userId 
}: { 
  to: string; 
  message: string; 
  agentId?: string; 
  userId?: string; 
}) {
  try {
    // 1. Check DB for API Key
    const dbSetting = await prisma.setting.findUnique({ where: { key: 'sms_api_key' } });
    
    // 2. Fallback to Env
    const apiKey = dbSetting?.value || process.env.SMS_ETHIOPIA_API_KEY;

    if (!apiKey || apiKey === 'your_smsethiopia_api_key_here') {
      console.error('SMS API key not configured');
      return { success: false, error: 'SMS API key not configured' };
    }

    if (!message || message.trim().length === 0) {
      return { success: false, error: 'Message is empty' };
    }

    const msisdn = normalizePhone(to);
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

      if (res.ok && (data.status === 'success' || data.success === true || (!data.error && !data.message?.toLowerCase().includes('fail')))) {
        status = 'success';
      } else {
        errorMessage = data.message || data.error || `HTTP ${res.status}`;
      }
    } catch (err: any) {
      errorMessage = err.message || 'Network error';
    }

    // Log to DB
    await prisma.smsLog.create({
      data: {
        agentId: agentId || null,
        recipient: msisdn,
        message,
        status,
        errorMessage: errorMessage || null,
        sentBy: userId || null,
      },
    });

    return { success: status === 'success', error: errorMessage };
  } catch (error: any) {
    console.error('Error in sendSms utility:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Triggers an automated SMS notification based on a template name.
 * @param templateName The name of the template (e.g., AGENT_APPROVED)
 * @param to Recipient phone number
 * @param agentId Optional agent ID for logging
 * @param templateVariables Variables to replace in template content (e.g., { [NAME]: "John" })
 */
export async function triggerTemplateSms(
  templateName: string, 
  to: string, 
  agentId?: string,
  templateVariables: Record<string, string> = {}
) {
  try {
    const template = await prisma.smsTemplate.findUnique({
      where: { name: templateName }
    });

    if (!template || !template.isActive) {
      console.log(`Template ${templateName} is not found or inactive. Skipping.`);
      return { success: false, error: 'TEMPLATE_INACTIVE' };
    }

    let message = template.content;
    // Basic variable replacement
    for (const [key, value] of Object.entries(templateVariables)) {
      message = message.replace(new RegExp(`\\[${key}\\]`, 'g'), value);
    }

    return await sendSms({ to, message, agentId });
  } catch (error: any) {
    console.error(`Error triggering template ${templateName}:`, error);
    return { success: false, error: error.message };
  }
}
