import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { capturePayPalOrder } from '@/lib/paypal';
import { creditPoints } from '@/lib/points';
import client from '@/lib/turso';
import { createSafeLog } from '@/lib/log-sanitizer';
import { toNumber } from '@/lib/package-pricing';

/**
 * GET /api/paypal/capture?token=xxx
 * Capture le paiement PayPal et crédite les points
 * Works even if user session expired during PayPal checkout return.
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin;

  try {
    const session = await auth();

    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/shop?error=no_token', baseUrl));
    }

    const capture = await capturePayPalOrder(token);

    if (capture.status !== 'COMPLETED') {
      return NextResponse.redirect(new URL('/shop?error=payment_failed', baseUrl));
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const captureData = purchaseUnit?.payments?.captures?.[0];
    const customId = captureData?.custom_id;

    if (!customId) {
      console.error('PayPal capture error: No custom data in PayPal order');
      throw new Error('Invalid PayPal order structure');
    }

    let customData: { package_id: number; email: string; points: number };
    try {
      customData = JSON.parse(customId);
    } catch {
      console.error('PayPal capture error: Invalid custom_id JSON', createSafeLog('Parse error', { customId }));
      throw new Error('Invalid PayPal custom data format');
    }

    const packageId = toNumber(customData.package_id);
    const expectedRecipientEmail = String(customData.email || '').toLowerCase().trim();
    const requestedPoints = toNumber(customData.points);

    if (!expectedRecipientEmail) {
      throw new Error('Missing recipient email in PayPal custom data');
    }

    if (session?.user?.email && session.user.email !== expectedRecipientEmail) {
      console.warn(
        `PayPal capture warning: Session email mismatch - session=${session.user.email}, order=${expectedRecipientEmail}`
      );
    }

    const packageResult = await client.execute({
      sql: 'SELECT id, name, points, price_usd, active FROM point_packages WHERE id = ? AND active = true AND price_usd > 0 LIMIT 1',
      args: [packageId],
    });

    if (packageResult.rows.length === 0) {
      console.error('PayPal capture error: Package not found', { package_id: packageId });
      throw new Error('Package not found or inactive');
    }

    const pkg = packageResult.rows[0] as Record<string, unknown>;
    const expectedPoints = toNumber(pkg.points);
    const expectedPrice = toNumber(pkg.price_usd);
    const actualPrice = parseFloat(purchaseUnit?.amount?.value || '0');

    if (requestedPoints !== expectedPoints) {
      console.error(
        'PayPal capture error: Points mismatch',
        createSafeLog('Checksum failed', {
          expected: expectedPoints,
          received: requestedPoints,
          package_id: packageId,
        })
      );
      throw new Error('Points amount tampering detected');
    }

    const priceDifference = Math.abs(actualPrice - expectedPrice);
    if (priceDifference > 0.01) {
      console.error(
        'PayPal capture error: Price mismatch',
        createSafeLog('Amount tampering', {
          expected: expectedPrice,
          received: actualPrice,
          difference: priceDifference,
          package_id: packageId,
        })
      );
      throw new Error('Payment amount mismatch detected');
    }

    const duplicateTx = await client.execute({
      sql: `
        SELECT up.balance
        FROM transactions t
        JOIN users_points up ON up.user_id = t.user_id
        WHERE t.type = 'purchase'
          AND (
            json_extract(t.metadata, '$.paypal_order_id') = ?
            OR json_extract(t.metadata, '$.capture_id') = ?
            OR t.metadata LIKE ?
            OR t.metadata LIKE ?
          )
        ORDER BY t.id DESC
        LIMIT 1
      `,
      args: [token, capture.id, `%"paypal_order_id":"${token}"%`, `%"capture_id":"${capture.id}"%`],
    });

    if (duplicateTx.rows.length > 0) {
      const duplicateBalance = toNumber(duplicateTx.rows[0].balance);
      return NextResponse.redirect(
        new URL(`/shop/success?points=${expectedPoints}&balance=${duplicateBalance}`, baseUrl)
      );
    }

    const balance = await creditPoints(expectedRecipientEmail, expectedPoints, 'purchase', {
      paypal_order_id: token,
      package_id: packageId,
      capture_id: capture.id,
      amount_usd: actualPrice,
    });

    return NextResponse.redirect(
      new URL(`/shop/success?points=${expectedPoints}&balance=${balance?.balance || 0}`, baseUrl)
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('PayPal capture error:', createSafeLog('Capture failed', { error: errorMessage }, ['EMAIL']));
    return NextResponse.redirect(
      new URL(`/shop?error=${encodeURIComponent(errorMessage)}`, baseUrl)
    );
  }
}
