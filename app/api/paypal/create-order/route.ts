import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPayPalOrder } from '@/lib/paypal';
import client from '@/lib/turso';
import { findEffectivePackage, toNumber } from '@/lib/package-pricing';

function isPayPalConfigured() {
  return !!process.env.PAYPAL_CLIENT_ID && !!process.env.PAYPAL_CLIENT_SECRET;
}

function mapPayPalError(error: unknown): { message: string; status: number } {
  const maybeError = error as {
    message?: string;
    response?: { status?: number; data?: { error_description?: string } };
  };

  const status = maybeError?.response?.status;

  if (status === 401 || status === 403) {
    return {
      message:
        'PayPal non configuré ou credentials invalides (utilisez des clés sandbox valides en local).',
      status: 503,
    };
  }

  if (status && status >= 400 && status < 500) {
    return {
      message: 'Requête PayPal invalide. Vérifiez la configuration PayPal.',
      status: 502,
    };
  }

  if (status && status >= 500) {
    return {
      message: 'PayPal est temporairement indisponible. Réessayez plus tard.',
      status: 502,
    };
  }

  const providerMessage = maybeError?.response?.data?.error_description;
  const fallback = maybeError?.message || providerMessage || 'Failed to create PayPal order';

  return {
    message: fallback,
    status: 500,
  };
}

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

    if (!isPayPalConfigured()) {
      return NextResponse.json(
        {
          error:
            'PayPal non configuré en local. Ajoutez PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET (sandbox) dans .env.local.',
        },
        { status: 503 }
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

    const pricingResult = await client.execute({
      sql: 'SELECT id, name, points, price_usd, active FROM point_packages WHERE active = true AND price_usd > 0 ORDER BY points ASC, id ASC',
      args: [],
    });

    const effectivePackage = findEffectivePackage(
      pricingResult.rows as Array<Record<string, unknown>>,
      toNumber(package_id),
    );

    if (!effectivePackage) {
      return NextResponse.json(
        { error: 'Package not found or inactive' },
        { status: 404 }
      );
    }

    const name = String(effectivePackage.name || packageResult.rows[0]?.name || 'Package');
    const points = toNumber(effectivePackage.points);
    const effectivePriceUsd = toNumber(effectivePackage.price_usd);

    // Créer la commande PayPal
    const customData = JSON.stringify({
      package_id,
      email: session.user.email,
      points,
    });

    const order = await createPayPalOrder(
      effectivePriceUsd.toFixed(2),
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
        price: effectivePriceUsd,
      },
    });
  } catch (error: unknown) {
    const mapped = mapPayPalError(error);
    console.error('PayPal create order error:', error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
