import { NextResponse } from 'next/server';
import client from '@/lib/turso';

/**
 * GET /api/packages
 * Liste les packages de points disponibles
 */
export async function GET() {
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM point_packages WHERE active = true ORDER BY points ASC',
      args: [],
    });

    return NextResponse.json({
      packages: result.rows,
    });
  } catch (error: any) {
    console.error('Fetch packages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}
