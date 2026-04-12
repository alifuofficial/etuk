import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
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
    const { phone, newPassword } = await req.json();

    if (!phone || !newPassword) {
      return NextResponse.json({ error: 'Phone number and new password are required' }, { status: 400 });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const normalizedPhone = normalizePhone(phone);

    // Check if OTP was verified (exists in store and not expired)
    const storedData = otpStore.get(normalizedPhone);
    if (!storedData) {
      return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 400 });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json({ error: 'Session expired. Please start over.' }, { status: 400 });
    }

    // Find user by normalized phone or original phone
    let user = await prisma.user.findFirst({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      user = await prisma.user.findFirst({
        where: { phone: phone }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    // Clear OTP from store
    otpStore.delete(normalizedPhone);

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}