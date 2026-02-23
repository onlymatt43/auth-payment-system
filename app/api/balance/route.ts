import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserBalance, getTransactionHistory } from '@/lib/points';

/**
 * GET /api/balance
 * Récupère le solde de points de l'utilisateur connecté
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
        transactions: [],
      });
    }

    // Récupérer historique récent
    const transactions = await getTransactionHistory(email, 10);

    return NextResponse.json({
      email: balance.email,
      points: balance.points,
      total_spent: balance.total_spent,
      total_purchased: balance.total_purchased,
      created_at: balance.created_at,
      updated_at: balance.updated_at,
      recent_transactions: transactions.map(t => ({
        type: t.type,
        points: t.points,
        balance_after: t.balance_after,
        created_at: t.created_at,
        ...(t.metadata ? { metadata: JSON.parse(t.metadata) } : {}),
      })),
    });

  } catch (error: any) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
