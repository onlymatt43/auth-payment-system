import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { capturePayPalOrder } from '@/lib/paypal';
import { creditPoints } from '@/lib/points';

/**
 * GET /api/paypal/capture?token=xxx
 * Capture le paiement PayPal et crédite les points
 */
export async function GET(req: NextRequest) {
  try {
    // Vérifier authentification
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login?error=auth', process.env.NEXTAUTH_URL!));
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token'); // Order ID PayPal

    if (!token) {
      return NextResponse.redirect(new URL('/shop?error=no_token', process.env.NEXTAUTH_URL!));
    }

    // Capturer la commande PayPal
    const capture = await capturePayPalOrder(token);

    if (capture.status !== 'COMPLETED') {
      return NextResponse.redirect(new URL('/shop?error=payment_failed', process.env.NEXTAUTH_URL!));
    }

    // Extraire les infos du custom_id (dans payments.captures[0].custom_id)
    const purchaseUnit = capture.purchase_units?.[0];
    const captureData = purchaseUnit?.payments?.captures?.[0];
    const customId = captureData?.custom_id;
    
    if (!customId) {
      throw new Error('No custom data in PayPal order');
    }

    const customData = JSON.parse(customId);
    const { package_id, email, points } = customData;

    // Vérifier que l'email correspond
    if (email !== session.user.email) {
      throw new Error('Email mismatch');
    }

    // Créditer les points
    const balance = await creditPoints(email, points, 'purchase', {
      paypal_order_id: token,
      package_id,
      capture_id: capture.id,
      amount_usd: purchaseUnit?.amount?.value,
    });

    // Rediriger vers page de confirmation
    return NextResponse.redirect(
      new URL(`/shop/success?points=${points}&balance=${balance.points}`, process.env.NEXTAUTH_URL!)
    );

  } catch (error: any) {
    console.error('PayPal capture error:', error);
    return NextResponse.redirect(
      new URL(`/shop?error=${encodeURIComponent(error.message)}`, process.env.NEXTAUTH_URL!)
    );
  }
}
