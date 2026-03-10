import { NextResponse } from 'next/server';
import client from '@/lib/turso';
import { ensureStorefrontTable, mapStorefrontRow } from '@/lib/storefront';

/**
 * GET /api/storefront
 * Public endpoint for active storefront carousel items.
 */
export async function GET() {
  try {
    await ensureStorefrontTable();

    const result = await client.execute({
      sql: 'SELECT * FROM storefront_items WHERE active = 1 ORDER BY sort_order ASC, id ASC',
      args: [],
    });

    return NextResponse.json({
      items: result.rows.map(mapStorefrontRow),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch storefront' }, { status: 500 });
  }
}
