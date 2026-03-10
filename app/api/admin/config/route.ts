import { NextRequest, NextResponse } from 'next/server';
import { getPointConfig, updatePointConfig } from '@/lib/points';

/**
 * GET /api/admin/config
 * Open admin endpoint (temporary)
 */
export async function GET(req: NextRequest) {
  try {
    const config = await getPointConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/config
 * Open admin endpoint (temporary)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { point_dollar_value, point_minutes_value } = body;

    if (point_dollar_value !== undefined && (typeof point_dollar_value !== 'number' || point_dollar_value < 0 || point_dollar_value > 100)) {
      return NextResponse.json({ error: 'Invalid dollar value (0-100)' }, { status: 400 });
    }
    if (point_minutes_value !== undefined && (typeof point_minutes_value !== 'number' || point_minutes_value < 0 || point_minutes_value > 1440)) {
      return NextResponse.json({ error: 'Invalid minutes value (0-1440)' }, { status: 400 });
    }

    const config = await updatePointConfig(point_dollar_value, point_minutes_value);
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
