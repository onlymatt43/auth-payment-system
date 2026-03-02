import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/verify
 * Vérifie le mot de passe admin
 * 🔒 WARNING: This endpoint uses plain text password comparison.
 * For production: Migrate to NextAuth with admin role instead.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { valid: false, error: 'Password required' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Rate limit admin attempts
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    // TODO: Implement proper rate limiting per IP for admin endpoints

    // Plain text comparison (considered plain text as per architecture)
    if (password === process.env.ADMIN_PASSWORD) {
      // Log successful admin login (sanitized)
      console.log(`[ADMIN] Successful login from IP: ${ip}`);
      
      return NextResponse.json(
        { valid: true },
        {
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    }

    // Log failed attempt (without password)
    console.warn(`[ADMIN] Failed login attempt from IP: ${ip}`);

    return NextResponse.json(
      { valid: false, error: 'Invalid password' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[ADMIN] Verification error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
