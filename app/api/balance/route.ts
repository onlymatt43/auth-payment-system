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
      // Initialize user points
      const initialized = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/init-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.get('cookie') || '',
        },
      });

      return NextResponse.json({
        email,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        recent_transactions: [],
      });
    }

    // Récupérer historique récent
    const transactions = await getTransactionHistory(email, 10);

    return NextResponse.json({
      email,
      balance: balance.balance,
      total_earned: balance.total_earned,
      total_spent: balance.total_spent,
      created_at: balance.created_at,
      updated_at: balance.updated_at,
      recent_transactions: transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        balance_after: t.balance_after,
        created_at: t.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching balance:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
