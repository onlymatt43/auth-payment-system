import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/turso';
import { getUserBalance, debitPoints, getPointConfig } from '@/lib/points';

/**
 * POST /api/points/spend
 * Dépense des points pour accéder à un projet
 * API publique appelée par project-links (avec clé API)
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier la clé API (sécurité inter-projets)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, project_slug } = body;

    if (!email || !project_slug) {
      return NextResponse.json(
        { error: 'email and project_slug required' },
        { status: 400 }
      );
    }

    // Récupérer le coût du projet
    const projectResult = await client.execute({
      sql: 'SELECT * FROM project_costs WHERE project_slug = ? AND active = true',
      args: [project_slug],
    });

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or inactive' },
        { status: 404 }
      );
    }

    const project = projectResult.rows[0] as any;
    const { points_required, project_name } = project;

    // Vérifier le solde
    const balance = await getUserBalance(email);
    
    if (!balance || balance.points < points_required) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          required: points_required,
          available: balance?.points || 0,
        },
        { status: 402 } // Payment Required
      );
    }

    // Récupérer la config pour calculer la durée de session
    const config = await getPointConfig();
    const sessionMinutes = points_required * config.point_minutes_value;

    // Débiter les points
    const newBalance = await debitPoints(email, points_required, {
      project_slug,
      project_name,
      session_minutes: sessionMinutes,
    });

    return NextResponse.json({
      success: true,
      points_spent: points_required,
      balance_remaining: newBalance.points,
      session: {
        duration_minutes: sessionMinutes,
        duration_hours: sessionMinutes / 60,
        expires_at: new Date(Date.now() + sessionMinutes * 60000).toISOString(),
      },
      project: {
        slug: project_slug,
        name: project_name,
      },
    });

  } catch (error: any) {
    console.error('Spend points error:', error);
    
    if (error.message === 'Insufficient points') {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to spend points' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/points/check
 * Vérifie si l'utilisateur a assez de points pour un projet (sans les dépenser)
 */
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const project_slug = searchParams.get('project_slug');

    if (!email || !project_slug) {
      return NextResponse.json(
        { error: 'email and project_slug required' },
        { status: 400 }
      );
    }

    // Récupérer le coût du projet
    const projectResult = await client.execute({
      sql: 'SELECT * FROM project_costs WHERE project_slug = ? AND active = true',
      args: [project_slug],
    });

    if (projectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const project = projectResult.rows[0] as any;
    const balance = await getUserBalance(email);

    const hasEnough = balance ? balance.points >= project.points_required : false;

    return NextResponse.json({
      has_enough: hasEnough,
      required: project.points_required,
      available: balance?.points || 0,
      shortfall: hasEnough ? 0 : project.points_required - (balance?.points || 0),
      project: {
        slug: project.project_slug,
        name: project.project_name,
      },
    });

  } catch (error: any) {
    console.error('Check points error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check points' },
      { status: 500 }
    );
  }
}
