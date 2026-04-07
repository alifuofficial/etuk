import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

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
    try {
      const message = `Your Soreti verification code is ${otp}. Valid for 10 minutes. Do not share this code.`;
      
      // Use the SMS sending logic
      const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phone,
          message
        })
      });

      if (!smsResponse.ok) {
        console.error('Failed to send SMS');
        // For development, log the OTP
        console.log(`[DEV] OTP for ${phone}: ${otp}`);
      }
    } catch (smsError) {
      console.error('SMS Error:', smsError);
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