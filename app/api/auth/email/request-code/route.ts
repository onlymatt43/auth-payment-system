import { NextResponse } from 'next/server';
import { createEmailLoginCode } from '@/lib/email-login';
import { sendLoginCodeEmail } from '@/lib/email';
import { emailCodeRatelimit, emailCodeIpRatelimit } from '@/lib/rate-limit';

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

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (emailCodeRatelimit) {
      const { success } = await emailCodeRatelimit.limit(email);
      if (!success) {
        return NextResponse.json(
          { error: 'Trop de demandes de code. Réessaie plus tard.' },
          { status: 429 },
        );
      }
    }

    if (emailCodeIpRatelimit) {
      const { success } = await emailCodeIpRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: 'Trop de tentatives depuis cette adresse IP. Réessaie plus tard.' },
          { status: 429 },
        );
      }
    }

    const { code } = await createEmailLoginCode(email);

    try {
      await sendLoginCodeEmail(email, code);
      return NextResponse.json({ success: true });
    } catch (mailError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('SMTP unavailable in dev, returning debug code:', mailError);
        return NextResponse.json({ success: true, devCode: code, mailFallback: true });
      }

      throw mailError;
    }
  } catch (error) {
    console.error('Failed to send login code', error);
    return NextResponse.json({ error: 'Impossible de générer le code' }, { status: 500 });
  }
}
