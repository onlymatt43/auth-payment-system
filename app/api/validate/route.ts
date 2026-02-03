import { NextRequest, NextResponse } from 'next/server';
const otplib = require('otplib');
import client from '../../../lib/turso';

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();
    if (!email || !token) {
      return NextResponse.json({ error: 'Email and token required' }, { status: 400 });
    }

    // Get IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Get secret from DB
    const result = await client.execute({
      sql: 'SELECT secret FROM access_codes WHERE email = ? AND ip = ? ORDER BY created_at DESC LIMIT 1',
      args: [email, ip],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No access found' }, { status: 404 });
    }

    const secret = result.rows[0].secret as string;

    // Verify token
    const isValid = otplib.authenticator.verify({ token, secret });

    if (isValid) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}