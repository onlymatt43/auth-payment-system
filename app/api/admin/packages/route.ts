import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/turso';

function verifyAdmin(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password');
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * GET /api/admin/packages
 */
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
 */
export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, points, price_usd } = body;

    await client.execute({
      sql: 'INSERT INTO point_packages (name, points, price_usd, active) VALUES (?, ?, ?, true)',
      args: [name, points, price_usd],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
