import { auth } from '@/lib/auth';
import client from '@/lib/turso';
import { normalizeEmail } from '@/lib/email-normalize';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get session
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const email = normalizeEmail(session.user.email);

    // Get user ID from email
    const userResult = await client.execute({
      sql: 'SELECT id FROM users WHERE lower(email) = ?',
      args: [email],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id as number;

    // Check free spin eligibility
    const spinResult = await client.execute({
      sql: 'SELECT last_free_spin FROM daily_free_spins WHERE user_id = ?',
      args: [userId],
    });

    let canSpin = true;
    let nextSpinTime = new Date().toISOString();

    if (spinResult.rows.length > 0) {
      const lastSpin = new Date(spinResult.rows[0].last_free_spin as string);
      const now = new Date();
      const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSpin < 24) {
        canSpin = false;
        // Calculate next available spin time
        nextSpinTime = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000).toISOString();
      }
    }

    return NextResponse.json({
      canSpin,
      nextSpinTime,
      message: canSpin ? 'Free spin available' : 'Free spin on cooldown',
    });
  } catch (error) {
    console.error('Error checking free spin status:', error);
    return NextResponse.json(
      { error: 'Failed to check free spin status' },
      { status: 500 }
    );
  }
}
