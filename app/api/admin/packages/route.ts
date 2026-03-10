import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/turso';

/**
 * GET /api/admin/packages
 * Open admin endpoint (temporary)
 */
export async function GET(req: NextRequest) {
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
 * Open admin endpoint (temporary)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, points, price_usd, active } = body;

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
      sql: 'INSERT INTO point_packages (name, points, price_usd, active) VALUES (?, ?, ?, ?)',
      args: [String(name).trim(), points, price_usd, active === false ? false : true],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/packages
 * Open admin endpoint (temporary)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, points, price_usd, active } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (typeof points !== 'number' || points <= 0) {
      return NextResponse.json({ error: 'Points must be positive number' }, { status: 400 });
    }

    if (typeof price_usd !== 'number' || price_usd <= 0 || price_usd > 1000) {
      return NextResponse.json({ error: 'Price must be between 0 and 1000 USD' }, { status: 400 });
    }

    await client.execute({
      sql: `
        UPDATE point_packages
        SET name = ?, points = ?, price_usd = ?, active = ?
        WHERE id = ?
      `,
      args: [name.trim(), points, price_usd, Boolean(active), id],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
