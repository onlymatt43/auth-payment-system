import { NextRequest, NextResponse } from 'next/server';
import { getPointConfig, updatePointConfig } from '@/lib/points';

function verifyAdmin(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password');
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * GET /api/admin/config
 */
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getPointConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/config
 */
export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)){
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { point_dollar_value, point_minutes_value } = body;

    const config = await updatePointConfig(point_dollar_value, point_minutes_value);
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
