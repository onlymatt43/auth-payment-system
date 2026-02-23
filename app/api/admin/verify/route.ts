import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/verify
 * Vérifie le mot de passe admin
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(
      { valid: false },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
