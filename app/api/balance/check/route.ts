import { NextRequest, NextResponse } from 'next/server';
import { getUserBalance } from '@/lib/points';

/**
 * GET /api/balance/check?email=xxx
 * Vérifier le solde sans authentification NextAuth
 * Pour usage par project-links
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();
    
    // Récupérer solde
    const balance = await getUserBalance(emailLower);
    
    if (!balance) {
      // Pas encore de solde = nouveau utilisateur
      return NextResponse.json({
        email: emailLower,
        points: 0,
        total_spent: 0,
        total_purchased: 0,
        has_account: false,
      });
    }

    return NextResponse.json({
      email: balance.email,
      points: balance.points,
      total_spent: balance.total_spent,
      total_purchased: balance.total_purchased,
      has_account: true,
    });

  } catch (error: any) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check balance' },
      { status: 500 }
    );
  }
}
