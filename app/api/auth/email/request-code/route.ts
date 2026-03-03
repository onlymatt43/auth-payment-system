import { NextResponse } from 'next/server';
import { createEmailLoginCode } from '@/lib/email-login';
import { sendLoginCodeEmail } from '@/lib/email';

function normalizeEmail(raw?: string) {
  return raw?.trim().toLowerCase() ?? '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body?.email);

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const { code } = await createEmailLoginCode(email);
    await sendLoginCodeEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send login code', error);
    return NextResponse.json({ error: 'Impossible de générer le code' }, { status: 500 });
  }
}
