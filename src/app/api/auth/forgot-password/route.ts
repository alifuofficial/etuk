import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { sendSms } from '@/lib/sms';

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

// Export for use in verify-otp
export { otpStore };

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Find user by phone
    const user = await prisma.user.findFirst({
      where: { phone }
    });

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiry
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    // Send SMS
    const message = `Your Soreti verification code is ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    const { success, error: smsError } = await sendSms({
      to: phone,
      message,
      userId: user.id
    });

    if (!success) {
      console.error('Failed to send SMS:', smsError);
      // For development, log the OTP
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
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