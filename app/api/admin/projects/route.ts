import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import client from '@/lib/turso';

async function verifyAdminRole(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'admin';
}

/**
 * GET /api/admin/projects
 * 🔒 Requires admin role via NextAuth
 */
export async function GET(req: NextRequest) {
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Admin role required' }, { status: 401 });
  }

  try {
    const result = await client.execute({
      sql: 'SELECT * FROM project_costs ORDER BY project_name ASC',
      args: [],
    });

    return NextResponse.json({ projects: result.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/projects
 * 🔒 Requires admin role via NextAuth
 */
export async function PUT(req: NextRequest) {
  const isAdmin = await verifyAdminRole();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized - Admin role required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, points_required } = body;

    if (!id || typeof points_required !== 'number' || points_required < 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await client.execute({
      sql: 'UPDATE project_costs SET points_required = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [points_required, id],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
