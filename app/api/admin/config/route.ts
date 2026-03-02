import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPointConfig, updatePointConfig } from '@/lib/points';

async function verifyAdminRole(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/config
 * 🔒 Requires admin role via NextAuth
 */
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Admin role required' }, { status: 401 });
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
 * 🔒 Requires admin role via NextAuth
 */
export async function PUT(req: NextRequest) {
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Admin role required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { point_dollar_value, point_minutes_value } = body;

    // Validate inputs
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
