import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/turso';

/**
 * GET /api/admin/projects
 * Open admin endpoint (temporary)
 */
export async function GET(req: NextRequest) {
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
 * Open admin endpoint (temporary)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, points_required, active, project_name, project_slug } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    if (typeof points_required !== 'number' || points_required < 0) {
      return NextResponse.json({ error: 'Invalid points_required' }, { status: 400 });
    }

    await client.execute({
      sql: `
        UPDATE project_costs
        SET
          points_required = ?,
          active = ?,
          project_name = COALESCE(?, project_name),
          project_slug = COALESCE(?, project_slug),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        points_required,
        active === undefined ? true : Boolean(active),
        typeof project_name === 'string' ? project_name.trim() : null,
        typeof project_slug === 'string' ? project_slug.trim() : null,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
