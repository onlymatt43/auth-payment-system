import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPayPalOrder } from '@/lib/paypal';
import client from '@/lib/turso';
import { toNumber } from '@/lib/package-pricing';

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
    const packageId = toNumber(body?.package_id);

    if (!packageId) {
      return NextResponse.json(
        { error: 'package_id required' },
        { status: 400 }
      );
    }

    const packageResult = await client.execute({
      sql: 'SELECT id, name, points, price_usd, active FROM point_packages WHERE id = ? AND active = true AND price_usd > 0 LIMIT 1',
      args: [packageId],
    });

    if (packageResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Package not found or inactive' },
        { status: 404 }
      );
    }

    const pkg = packageResult.rows[0] as Record<string, unknown>;
    const name = String(pkg.name || 'Package');
    const points = toNumber(pkg.points);
    const priceUsd = toNumber(pkg.price_usd);

    const customData = JSON.stringify({
      package_id: packageId,
      email: session.user.email,
      points,
    });

    const order = await createPayPalOrder(
      priceUsd.toFixed(2),
      `${name} (${points} points)`,
      customData
    );

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
        price: priceUsd,
      },
    });
  } catch (error: unknown) {
    const mapped = mapPayPalError(error);
    console.error('PayPal create order error:', error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
