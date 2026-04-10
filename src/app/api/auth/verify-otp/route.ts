import { NextResponse } from 'next/server';
import { otpStore } from '../forgot-password/route';

// Normalize phone number to 251X format
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-]/g, '').replace(/^\+/, '');
  
  if (cleaned.startsWith('09')) {
    cleaned = '2519' + cleaned.slice(2);
  } else if (cleaned.startsWith('07')) {
    cleaned = '2517' + cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '251' + cleaned.slice(1);
  } else if (cleaned.startsWith('9') || cleaned.startsWith('7')) {
    cleaned = '251' + cleaned;
  }
  
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);
    const storedData = otpStore.get(normalizedPhone);

    if (!storedData) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Check attempts
    if (storedData.attempts >= 5) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json({ error: 'Too many attempts. Please request a new OTP.' }, { status: 429 });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return NextResponse.json({ 
        error: 'Invalid OTP. Please try again.',
        attemptsRemaining: 5 - storedData.attempts 
      }, { status: 400 });
    }

    // OTP is valid - generate a reset token
    const resetToken = Buffer.from(`${normalizedPhone}:${Date.now()}`).toString('base64');
    
    // Update the store with reset token
    otpStore.set(normalizedPhone, {
      otp: storedData.otp,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes for password reset
      attempts: 0
    });

    return NextResponse.json({ 
      message: 'OTP verified successfully',
      resetToken,
      phone: normalizedPhone
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}