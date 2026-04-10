import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { sendSms } from '@/lib/sms';

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Export for use in verify-otp
export { otpStore };

// Normalize phone number to 251X format
function normalizePhone(phone: string): string {
  // Strip spaces, dashes, and leading +
  let cleaned = phone.replace(/[\s\-]/g, '').replace(/^\+/, '');
  
  // If starts with +251, already normalized (we removed + above)
  // If starts with 251, already normalized
  // If starts with 09, convert to 2519
  // If starts with 07, convert to 2517
  // If starts with 0 followed by other digit, convert to 251 + remaining (without leading 0)
  
  if (cleaned.startsWith('09')) {
    cleaned = '2519' + cleaned.slice(2);
  } else if (cleaned.startsWith('07')) {
    cleaned = '2517' + cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.slice(1);
  } else if (cleaned.startsWith('9') || cleaned.startsWith('7')) {
    // If just starts with 9 or 7 (without 0), add 251 prefix
    cleaned = '251' + cleaned;
  }
  // 251... stays as is
  
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Normalize the phone number
    const normalizedPhone = normalizePhone(phone);

    // Find user by phone (try normalized form)
    let user = await prisma.user.findFirst({
      where: { phone: normalizedPhone }
    });

    // If not found, try the original phone (in case it's stored differently)
    if (!user) {
      user = await prisma.user.findFirst({
        where: { phone: phone }
      });
    }

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({ 
        message: 'If an account exists with this phone number, you will receive an OTP shortly.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is inactive. Please contact administrator.' }, { status: 403 });
    }

    // Use the phone from the user record for SMS
    const phoneForSms = user.phone || normalizedPhone;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiry
    otpStore.set(normalizedPhone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    // Send SMS
    const message = `Your Soreti verification code is ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    const { success, error: smsError } = await sendSms({
      to: phoneForSms,
      message,
      userId: user.id
    });

    if (!success) {
      console.error('Failed to send SMS:', smsError);
      // For development, log the OTP
      console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`);
    }

    return NextResponse.json({ 
      message: 'If an account exists with this phone number, you will receive an OTP shortly.',
      // In development, return the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp })
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}