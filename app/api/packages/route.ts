import { NextResponse } from 'next/server';
import client from '@/lib/turso';
import { toNumber } from '@/lib/package-pricing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/packages
 * Retourne les packages actifs tels qu'ils sont stockés dans Turso.
 */
export async function GET() {
  try {
    const result = await client.execute({
      sql: 'SELECT id, name, points, price_usd, active FROM point_packages WHERE active = true AND price_usd > 0 ORDER BY points ASC, id ASC',
      args: [],
    });

    const packages = (result.rows as Array<Record<string, unknown>>).map((row) => ({
      id: toNumber(row.id),
      name: String(row.name ?? ''),
      points: toNumber(row.points),
      price_usd: toNumber(row.price_usd),
      active: toNumber(row.active ?? 1) !== 0,
    }));

    return NextResponse.json({ packages });
  } catch (error: any) {
    console.error('Fetch packages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
