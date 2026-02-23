import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserBalance, getTransactionHistory } from '@/lib/points';

/**
 * GET /api/account
 * Récupère toutes les infos du compte + historique complet des transactions
 */
export async function GET(req: NextRequest) {
  try {
    // Auth Google
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const email = session.user.email;
    
    // Récupérer solde
    const balance = await getUserBalance(email);
    
    if (!balance) {
      // Pas encore de solde = nouveau utilisateur
      return NextResponse.json({
        email,
        points: 0,
        total_spent: 0,
        total_purchased: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        transactions: [],
      });
    }

    // Récupérer TOUTES les transactions (limit 100)
    const transactions = await getTransactionHistory(email, 100);

    return NextResponse.json({
      email: balance.email,
      points: balance.points,
      total_spent: balance.total_spent,
      total_purchased: balance.total_purchased,
      created_at: balance.created_at,
      updated_at: balance.updated_at,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        points: t.points,
        balance_after: t.balance_after,
        created_at: t.created_at,
        metadata: t.metadata ? JSON.parse(t.metadata) : null,
      })),
    });

  } catch (error: any) {
    console.error('Account fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account data' },
      { status: 500 }
    );
  }
}
