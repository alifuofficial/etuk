import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpEncryption,
      smtpFromEmail,
      smtpFromName,
      testEmail,
    } = await request.json();

    if (!smtpHost || !testEmail) {
      return NextResponse.json(
        { error: 'SMTP host and test email are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort) || 587,
      secure: smtpEncryption === 'ssl',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${smtpFromName || 'ETUK'}" <${smtpFromEmail || smtpUser}>`,
      to: testEmail,
      subject: 'ETUK SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #16a34a;">ETUK</h1>
            <p style="color: #666;">SMTP Configuration Test</p>
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h2 style="color: #166534; margin: 0 0 10px 0;">Success!</h2>
            <p style="color: #166534; margin: 0;">Your SMTP configuration is working correctly.</p>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">Configuration Details:</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Host: ${smtpHost}</li>
              <li>Port: ${smtpPort}</li>
              <li>Encryption: ${smtpEncryption?.toUpperCase()}</li>
              <li>From: ${smtpFromEmail || smtpUser}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated test email from ETUK Admin Panel</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully' 
    });
  } catch (error: any) {
    console.error('SMTP test error:', error);
    
    let errorMessage = 'Failed to send test email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your username and password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Could not connect to SMTP server. Check host and port.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
