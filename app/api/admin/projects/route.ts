import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/turso';

function verifyAdmin(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password');
  return password === process.env.ADMIN_PASSWORD;
}

/**
 * GET /api/admin/projects
 */
export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
 */
export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, points_required } = body;

    await client.execute({
      sql: 'UPDATE project_costs SET points_required = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [points_required, id],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
