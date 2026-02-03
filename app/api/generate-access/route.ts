import { NextRequest, NextResponse } from 'next/server';
import { TOTP } from 'otplib';
import qrcode from 'qrcode';
import client from '../../../lib/turso';
import { sendQREmail } from '../../../lib/email';
const totp = new TOTP();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Get IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Generate secret
    const secret = totp.generate();

    // Store in DB
    await client.execute({
      sql: 'INSERT INTO access_codes (email, secret, ip) VALUES (?, ?, ?)',
      args: [email, secret, ip],
    });

    // Generate QR
    const otpauth = `otpauth://totp/Auth Payment System:${email}?secret=${secret}&issuer=Auth Payment System`;
    const qrCodeDataURL = await qrcode.toDataURL(otpauth);

    // Send email
    await sendQREmail(email, `<img src="${qrCodeDataURL}" alt="QR Code" />`);

    return NextResponse.json({ message: 'Access sent to email' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}