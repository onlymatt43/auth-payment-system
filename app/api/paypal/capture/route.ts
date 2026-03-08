import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { capturePayPalOrder } from '@/lib/paypal';
import { creditPoints } from '@/lib/points';
import client from '@/lib/turso';
import { createSafeLog } from '@/lib/log-sanitizer';

/**
 * GET /api/paypal/capture?token=xxx
 * Capture le paiement PayPal et crédite les points
 * 🔒 Includes checksum validation to prevent tampering
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
      console.error('PayPal capture error: No custom data in PayPal order');
      throw new Error('Invalid PayPal order structure');
    }

    let customData;
    try {
      customData = JSON.parse(customId);
    } catch (e) {
      console.error('PayPal capture error: Invalid custom_id JSON', createSafeLog('Parse error', { customId }));
      throw new Error('Invalid PayPal custom data format');
    }

    const { package_id, email, points } = customData;

    // 🔒 SECURITY: Verify email matches
    if (email !== session.user.email) {
      console.warn(`PayPal capture warning: Email mismatch - expected ${session.user.email}, got ${email}`);
      throw new Error('Email verification failed');
    }

    // 🔒 SECURITY: Verify points/package checksum
    // Fetch package details to verify the amount paid matches the points offered
    const packageResult = await client.execute({
      sql: 'SELECT * FROM point_packages WHERE id = ? AND active = true',
      args: [package_id],
    });

    if (packageResult.rows.length === 0) {
      console.error('PayPal capture error: Package not found', { package_id });
      throw new Error('Package not found or inactive');
    }

    const packageData = packageResult.rows[0] as any;
    const expectedPoints = packageData.points;
    const expectedPrice = parseFloat(packageData.price_usd);
    const actualPrice = parseFloat(purchaseUnit?.amount?.value || '0');

    // Verify points match
    if (points !== expectedPoints) {
      console.error(
        'PayPal capture error: Points mismatch',
        createSafeLog('Checksum failed', {
          expected: expectedPoints,
          received: points,
          package_id,
        })
      );
      throw new Error('Points amount tampering detected');
    }

    // Verify price matches (within 1 cent tolerance for rounding)
    const priceDifference = Math.abs(actualPrice - expectedPrice);
    if (priceDifference > 0.01) {
      console.error(
        'PayPal capture error: Price mismatch',
        createSafeLog('Amount tampering', {
          expected: expectedPrice,
          received: actualPrice,
          difference: priceDifference,
          package_id,
        })
      );
      throw new Error('Payment amount mismatch detected');
    }

    // 🔒 All validations passed, credit the points
    const balance = await creditPoints(email, points, 'purchase', {
      paypal_order_id: token,
      package_id,
      capture_id: capture.id,
      amount_usd: actualPrice,
    });

    // Rediriger vers page de confirmation
    return NextResponse.redirect(
      new URL(`/shop/success?points=${points}&balance=${balance?.balance || 0}`, process.env.NEXTAUTH_URL!)
    );

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PayPal capture error:', createSafeLog('Capture failed', { error: errorMessage }, ['EMAIL']));
    return NextResponse.redirect(
      new URL(`/shop?error=${encodeURIComponent(errorMessage)}`, process.env.NEXTAUTH_URL!)
    );
  }
}
