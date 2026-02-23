import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPayPalOrder } from '@/lib/paypal';
import client from '@/lib/turso';

/**
 * POST /api/paypal/create-order
 * Crée une commande PayPal pour acheter un package de points
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier authentification Google
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { package_id } = body;

    if (!package_id) {
      return NextResponse.json(
        { error: 'package_id required' },
        { status: 400 }
      );
    }

    // Récupérer le package depuis la DB
    const packageResult = await client.execute({
      sql: 'SELECT * FROM point_packages WHERE id = ? AND active = true',
      args: [package_id],
    });

    if (packageResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Package not found or inactive' },
        { status: 404 }
      );
    }

    const pkg = packageResult.rows[0] as any;
    const { name, points, price_usd } = pkg;

    // Créer la commande PayPal
    const customData = JSON.stringify({
      package_id,
      email: session.user.email,
      points,
    });

    const order = await createPayPalOrder(
      price_usd.toFixed(2),
      `${name} (${points} points)`,
      customData
    );

    // Extraire l'URL d'approbation
    const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL returned from PayPal');
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      approval_url: approvalUrl,
      package: {
        name,
        points,
        price: price_usd,
      },
    });

  } catch (error: any) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
