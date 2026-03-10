import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import client from '@/lib/turso';

async function verifyAdminRole(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin' && session?.user?.authProvider === 'google';
}

/**
 * GET /api/admin/packages
 * 🔒 Requires admin role via NextAuth
 */
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Google admin required' }, { status: 401 });
  }

  try {
    const result = await client.execute({
      sql: 'SELECT * FROM point_packages ORDER BY points ASC',
      args: [],
    });

    return NextResponse.json({ packages: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/packages
 * 🔒 Requires admin role via NextAuth
 */
export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Google admin required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, points, price_usd } = body;

    // Validate inputs
    if (!name || !points || !price_usd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json({ error: 'Points must be positive number' }, { status: 400 });
    }

    if (typeof price_usd !== 'number' || price_usd <= 0 || price_usd > 1000) {
      return NextResponse.json({ error: 'Price must be between 0 and 1000 USD' }, { status: 400 });
    }

    await client.execute({
      sql: 'INSERT INTO point_packages (name, points, price_usd, active) VALUES (?, ?, ?, true)',
      args: [name, points, price_usd],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
